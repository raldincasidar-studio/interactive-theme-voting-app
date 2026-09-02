import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGO_URI;
const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
if (!uri) throw new Error('MONGO_URI is required');
const schema = new mongoose.Schema({ username: { type: String, unique: true }, passwordHash: String, role: { type: String, default: 'admin' } }, { timestamps: true });
const Admin = mongoose.model('Admin', schema);
await mongoose.connect(uri);
await Admin.findOneAndUpdate({ username }, { username, passwordHash: await bcrypt.hash(password, 12), role: 'admin' }, { upsert: true, new: true, setDefaultsOnInsert: true });
console.log(`Admin seeded: ${username}`);
await mongoose.disconnect();
