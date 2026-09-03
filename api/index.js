import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import sharp from "sharp";

const app = express();
const port = Number(process.env.PORT || 4000);
const ownMongoUri = process.env.MONGO_URI;
const ssaamMongoUri = process.env.SSAAM_MONGO_URI;
const jwtSecret = process.env.JWT_SECRET || "change-this-secret";

if (!ownMongoUri)
  console.warn(
    "MONGO_URI is not configured. API will not connect until it is set.",
  );
app.use(
  cors({
    origin: process.env.FRONTEND_URL?.split(",") || true,
    credentials: false,
  }),
);
app.use(express.json({ limit: "50mb" }));

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, index: true },
    firstName: String,
    middleName: String,
    lastName: String,
    suffix: String,
    fullName: String,
    email: String,
    course: String,
    program: String,
    yearLevel: String,
    photo: String,
    role: { type: String, default: "student" },
    status: String,
    passwordHash: String,
    source: { type: String, default: "ssaam" },
    votedThemeId: { type: String, default: null },
    votedAt: Date,
  },
  { timestamps: true },
);
const themeSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    tagline: String,
    description: String,
    iconName: String,
    from: String,
    to: String,
    accent: String,
    images: { type: [String], default: [] },
    votes: { type: Number, default: 0 },
  },
  { timestamps: true },
);
const adminSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true },
    passwordHash: String,
    role: { type: String, default: "admin" },
  },
  { timestamps: true },
);
const loginLogSchema = new mongoose.Schema({
  userType: String,
  identifier: String,
  ip: String,
  userAgent: String,
  success: Boolean,
  createdAt: { type: Date, default: Date.now },
});
const Student = mongoose.model("Student", studentSchema);
const Theme = mongoose.model("Theme", themeSchema);
const Admin = mongoose.model("Admin", adminSchema);
const LoginLog = mongoose.model("LoginLog", loginLogSchema);
let ssaamDb;
let ready;

const defaultThemes = [
  [
    "neon-nights",
    "Neon Nights",
    "Glow up till midnight",
    "A cyberpunk-inspired night filled with blacklights, neon face paint, glow sticks, and pulsing synthwave beats.",
    "Sparkles",
    "#a855f7",
    "#6366f1",
    "#c084fc",
  ],
  [
    "enchanted-forest",
    "Enchanted Forest",
    "Wander into the mystical woods",
    "Fairy lights, moss green drapery, and mythical woodland creatures set the scene for a magical acquaintance night.",
    "Ghost",
    "#22c55e",
    "#0d9488",
    "#4ade80",
  ],
  [
    "retro-arcade",
    "Retro Arcade",
    "Insert coin to party",
    "8-bit pixel decor, arcade cabinets, and chiptune bangers bring the nostalgic gaming era back to life.",
    "Gamepad2",
    "#f97316",
    "#db2777",
    "#fb923c",
  ],
  [
    "masquerade-ball",
    "Masquerade Ball",
    "Mystery behind every mask",
    "An elegant black-and-gold affair with ornate masks, candlelight, and a touch of old world glamour.",
    "Drama",
    "#eab308",
    "#78350f",
    "#facc15",
  ],
  [
    "tropical-fiesta",
    "Tropical Fiesta",
    "Sun, sand, and good vibes",
    "Bright florals, tiki torches, and island beats for a laid-back beach-party themed acquaintance night.",
    "Palmtree",
    "#06b6d4",
    "#22c55e",
    "#67e8f9",
  ],
  [
    "retro-disco",
    "Retro Disco",
    "Boogie down 70s style",
    "Mirror balls, funky patterns, and platform shoes for an unforgettable groove-filled disco night.",
    "Disc3",
    "#ec4899",
    "#7c3aed",
    "#f472b6",
  ],
].map(([id, name, tagline, description, iconName, from, to, accent], i) => ({
  id,
  name,
  tagline,
  description,
  iconName,
  from,
  to,
  accent,
  images: [
    `https://picsum.photos/seed/${id}-1/600/900`,
    `https://picsum.photos/seed/${id}-2/600/900`,
    `https://picsum.photos/seed/${id}-3/600/900`,
  ],
  votes: [128, 96, 154, 87, 102, 119][i],
}));

function publicStudent(s) {
  return {
    studentId: s.studentId,
    fullName: s.fullName,
    course: s.course || s.program,
    yearLevel: s.yearLevel,
    photo: s.photo,
    email: s.email,
    voted: Boolean(s.votedThemeId),
    votedThemeId: s.votedThemeId || null,
  };
}
function tokenFor(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      type: user.role || "student",
      username: user.username,
      studentId: user.studentId,
    },
    jwtSecret,
    { expiresIn: "8h" },
  );
}
function auth(type) {
  return async (req, res, next) => {
    try {
      const raw = req.headers.authorization?.replace(/^Bearer\s+/i, "");
      if (!raw)
        return res.status(401).json({ message: "Authentication required." });
      const decoded = jwt.verify(raw, jwtSecret);
      req.auth = decoded;
      next();
    } catch {
      res.status(401).json({ message: "Invalid or expired token." });
    }
  };
}
function requestIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    ""
  );
}
async function compareStudentPassword(password, record) {
  if (
    record.custom_password &&
    (await bcrypt.compare(password, record.custom_password))
  )
    return true;
  return Boolean(
    record.last_name &&
    password.trim().toLowerCase() === record.last_name.trim().toLowerCase(),
  );
}
function mapSsaam(record) {
  return {
    studentId: record.student_id,
    firstName: record.first_name,
    middleName: record.middle_name,
    lastName: record.last_name,
    suffix: record.suffix,
    fullName:
      record.full_name ||
      [record.first_name, record.middle_name, record.last_name]
        .filter(Boolean)
        .join(" "),
    email: record.email,
    course: record.program,
    program: record.program,
    yearLevel: record.year_level,
    photo: record.photo,
    role: record.role,
    status: record.status,
    passwordHash: record.custom_password,
    source: "ssaam",
  };
}

/* ------------------------------------------------------------------ */
/* Server-side image compression (target ≤ 100 KB per image)           */
/* ------------------------------------------------------------------ */

const MAX_IMAGE_BYTES = 100 * 1024; // 100 KB

/**
 * Compress a single base64 data-URI image to ≤ MAX_IMAGE_BYTES using sharp.
 * Returns a JPEG base64 data-URI.  Non-data-URI strings (e.g. URLs) are
 * returned unchanged.
 */
async function compressImageBase64(base64Str) {
  // Skip non-base64 strings (external URLs, empty strings, etc.)
  if (!base64Str || !base64Str.startsWith("data:")) return base64Str;

  // Extract the raw buffer from the data URI
  const matches = base64Str.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) return base64Str;

  const inputBuffer = Buffer.from(matches[2], "base64");

  // If already small enough, keep as-is
  if (inputBuffer.length <= MAX_IMAGE_BYTES) return base64Str;

  // Resize to max 1920px on longest side first, then iteratively lower quality
  let quality = 80;
  let outputBuffer;

  while (quality >= 20) {
    outputBuffer = await sharp(inputBuffer)
      .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    if (outputBuffer.length <= MAX_IMAGE_BYTES) break;
    quality -= 5;
  }

  // If still over budget after q=20, do one final aggressive resize
  if (outputBuffer.length > MAX_IMAGE_BYTES) {
    outputBuffer = await sharp(inputBuffer)
      .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 20, mozjpeg: true })
      .toBuffer();
  }

  return `data:image/jpeg;base64,${outputBuffer.toString("base64")}`;
}

/** Compress every image in an array, skipping URLs. */
async function compressImages(images) {
  if (!Array.isArray(images)) return images;
  return Promise.all(images.map((img) => compressImageBase64(img)));
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.post("/api/auth/student/login", async (req, res) => {
  const { studentId, password } = req.body || {};
  const ip = requestIp(req),
    userAgent = req.get("user-agent") || "";
  if (!studentId || !password)
    return res
      .status(400)
      .json({ message: "Student ID and password are required." });
  let success = false;
  try {
    let student = await Student.findOne({
      studentId: studentId.trim().toUpperCase(),
    });
    if (!student && ssaamDb) {
      const record = await ssaamDb
        .collection("ccs_students")
        .findOne({ student_id: studentId.trim().toUpperCase() });
      if (record && (await compareStudentPassword(password, record))) {
        student = await Student.findOneAndUpdate(
          { studentId: record.student_id },
          mapSsaam(record),
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
        success = true;
      }
    }
    if (
      student &&
      (await compareStudentPassword(password, {
        custom_password: student.passwordHash,
        last_name: student.lastName,
      }))
    )
      success = true;
    await LoginLog.create({
      userType: "student",
      identifier: studentId,
      ip,
      userAgent,
      success,
    });
    if (!success)
      return res
        .status(401)
        .json({ message: "Invalid student ID or password." });
    return res.json({
      token: tokenFor(student),
      student: publicStudent(student),
    });
  } catch (e) {
    console.error(e);
    await LoginLog.create({
      userType: "student",
      identifier: studentId,
      ip,
      userAgent,
      success: false,
    });
    return res.status(500).json({ message: "Student login is unavailable." });
  }
});

app.get("/api/themes", auth("student"), async (_req, res) => {
  let themes = await Theme.find().sort({ createdAt: 1 }).lean();
  if (!themes.length) {
    await Theme.insertMany(defaultThemes);
    themes = await Theme.find().sort({ createdAt: 1 }).lean();
  }
  res.json({ themes });
});
app.post("/api/votes", auth("student"), async (req, res) => {
  return res.status(503).json({ message: "Voting is currently closed." });
  const { themeId } = req.body || {};
  if (!themeId) return res.status(400).json({ message: "Theme is required." });
  const student = await Student.findById(req.auth.sub);
  if (!student) return res.status(404).json({ message: "Student not found." });
  if (student.votedThemeId)
    return res.status(409).json({ message: "You have already voted." });
  const theme = await Theme.findOneAndUpdate(
    { id: themeId },
    { $inc: { votes: 1 } },
    { new: true },
  );
  if (!theme) return res.status(404).json({ message: "Theme not found." });
  student.votedThemeId = themeId;
  student.votedAt = new Date();
  await student.save();
  res.json({ success: true, themeId, message: "Vote recorded successfully." });
});

app.post("/api/auth/admin/login", async (req, res) => {
  const { username, password } = req.body || {};
  const ip = requestIp(req),
    userAgent = req.get("user-agent") || "";
  const admin = await Admin.findOne({ username });
  const success = Boolean(
    admin && (await bcrypt.compare(password || "", admin.passwordHash)),
  );
  await LoginLog.create({
    userType: "admin",
    identifier: username,
    ip,
    userAgent,
    success,
  });
  if (!success)
    return res.status(401).json({ message: "Invalid admin credentials." });
  res.json({ token: tokenFor(admin), admin: { username: admin.username } });
});
app.get("/api/admin/themes", auth("admin"), async (_req, res) =>
  res.json({ themes: await Theme.find().sort({ createdAt: 1 }) }),
);
app.post("/api/admin/themes", auth("admin"), async (req, res) => {
  const payload = {
    ...req.body,
    id: req.body.id || crypto.randomUUID(),
    images: Array.isArray(req.body.images)
      ? req.body.images.filter(Boolean)
      : [],
  };
  if (!payload.name || !payload.images.length)
    return res
      .status(400)
      .json({ message: "Name and at least one image are required." });
  // Compress all uploaded images server-side
  payload.images = await compressImages(payload.images);
  res.status(201).json({ theme: await Theme.create(payload) });
});
app.put("/api/admin/themes/:id", auth("admin"), async (req, res) => {
  const payload = { ...req.body };
  delete payload._id;
  delete payload.id;
  if (payload.images && !Array.isArray(payload.images))
    return res.status(400).json({ message: "Images must be an array." });
  // Compress all uploaded images server-side
  if (payload.images) {
    payload.images = await compressImages(payload.images);
  }
  const theme = await Theme.findOneAndUpdate({ id: req.params.id }, payload, {
    new: true,
    runValidators: true,
  });
  if (!theme) return res.status(404).json({ message: "Theme not found." });
  res.json({ theme });
});
app.delete("/api/admin/themes/:id", auth("admin"), async (req, res) => {
  const deleted = await Theme.findOneAndDelete({ id: req.params.id });
  if (!deleted) return res.status(404).json({ message: "Theme not found." });
  res.json({ success: true });
});
app.get("/api/admin/users", auth("admin"), async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
  const search = req.query.search || "";
  const program = req.query.program || "";
  const yearLevel = req.query.yearLevel || "";
  const query = {};
  if (search)
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { studentId: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  if (program) query.program = program;
  if (yearLevel) query.yearLevel = yearLevel;
  const [total, users] = await Promise.all([
    Student.countDocuments(query),
    Student.find(query)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);
  res.json({ users, total, page, limit, pages: Math.ceil(total / limit) });
});
app.delete("/api/admin/users/:id", auth("admin"), async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});
app.put("/api/admin/settings/password", auth("admin"), async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const admin = await Admin.findById(req.auth.sub);
  if (
    !admin ||
    !(await bcrypt.compare(currentPassword || "", admin.passwordHash))
  )
    return res.status(400).json({ message: "Current password is incorrect." });
  if (!newPassword || newPassword.length < 8)
    return res
      .status(400)
      .json({ message: "New password must be at least 8 characters." });
  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  await admin.save();
  res.json({ success: true });
});
app.post(
  "/api/admin/settings/reset-votes",
  auth("admin"),
  async (_req, res) => {
    await Student.updateMany(
      {},
      { $set: { votedThemeId: null, votedAt: null } },
    );
    await Theme.updateMany({}, { $set: { votes: 0 } });
    res.json({ success: true });
  },
);

ready = (async () => {
  if (!ownMongoUri) return;
  await mongoose.connect(ownMongoUri);
  if (ssaamMongoUri) {
    ssaamDb = mongoose.connection.useDb("ssaam", { useCache: true });
    const ssaamClient = mongoose.createConnection(ssaamMongoUri);
    await ssaamClient.asPromise();
    ssaamDb = ssaamClient.db;
  }
})().catch((e) => {
  console.error("MongoDB connection failed:", e.message);
});

// Only start server in local development, not in Vercel serverless
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  ready.then(() =>
    app.listen(port, () => console.log(`API listening on ${port}`)),
  );
}

// Export for Vercel serverless functions
export default app;
export { app, ready, Student, Theme, Admin, LoginLog };