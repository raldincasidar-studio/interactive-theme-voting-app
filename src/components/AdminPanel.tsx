import { useEffect, useMemo, useState, useRef, type FormEvent } from "react";
import {
  apiAdminLogin,
  apiAdminThemes,
  apiAdminUsers,
  apiChangeAdminPassword,
  apiCreateTheme,
  apiDeleteTheme,
  apiDeleteUser,
  apiResetVotes,
  apiUpdateTheme,
  clearAdminToken,
  adminTokenExists,
} from "../lib/api";
import type { ThemeOption } from "../data/mockData";
import {
  Sparkles,
  Star,
  Heart,
  Zap,
  Music,
  Palette,
  Camera,
  Film,
  Gamepad2,
  Rocket,
  Trophy,
  Crown,
  Gift,
  Flame,
  Sun,
  Moon,
  Cloud,
  Feather,
  Leaf,
  TreePine,
  Flower2,
  Waves,
  Mountain,
  Wand2,
  Ghost,
  Diamond,
  Gem,
  Anchor,
  Compass,
  Globe,
  MapPin,
  Building2,
  Landmark,
  School,
  GraduationCap,
  BookOpen,
  PenTool,
  Brush,
  Mic,
  Headphones,
  Radio,
  Tv,
  Clapperboard,
  PartyPopper,
  Cake,
  Pizza,
  Coffee,
  Wine,
  Utensils,
  ChefHat,
  Shirt,
  Swords,
  Shield,
  Target,
  Dumbbell,
  Bike,
  Car,
  Plane,
  Ship,
  Train,
  Satellite,
  Telescope,
  Atom,
  Dna,
  Microscope,
  FlaskConical,
  Bot,
  Puzzle,
  Palmtree,
  Snowflake,
  Bird,
  Fish,
  Cat,
  Dog,
  PawPrint,
  Trees,
  Sunrise,
  Sunset,
  Hexagon,
  Circle,
  Square,
  Triangle,
  Droplet,
  Wind,
  Rainbow,
  Sparkle,
  Infinity as InfinityIcon,
  Users as UsersIcon,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  ImagePlus,
  Upload,
  Link,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  ShieldAlert,
  Loader2,
  User,
  Lock,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Constants & shared helpers                                          */
/* ------------------------------------------------------------------ */

const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Star,
  Heart,
  Zap,
  Music,
  Palette,
  Camera,
  Film,
  Gamepad2,
  Rocket,
  Trophy,
  Crown,
  Gift,
  Flame,
  Sun,
  Moon,
  Cloud,
  Feather,
  Leaf,
  TreePine,
  Flower2,
  Waves,
  Mountain,
  Wand2,
  Ghost,
  Diamond,
  Gem,
  Anchor,
  Compass,
  Globe,
  MapPin,
  Building2,
  Landmark,
  School,
  GraduationCap,
  BookOpen,
  PenTool,
  Brush,
  Mic,
  Headphones,
  Radio,
  Tv,
  Clapperboard,
  PartyPopper,
  Cake,
  Pizza,
  Coffee,
  Wine,
  Utensils,
  ChefHat,
  Shirt,
  Swords,
  Shield,
  Target,
  Dumbbell,
  Bike,
  Car,
  Plane,
  Ship,
  Train,
  Satellite,
  Telescope,
  Atom,
  Dna,
  Microscope,
  FlaskConical,
  Bot,
  Puzzle,
  Palmtree,
  Snowflake,
  Bird,
  Fish,
  Cat,
  Dog,
  PawPrint,
  Trees,
  Sunrise,
  Sunset,
  Hexagon,
  Circle,
  Square,
  Triangle,
  Droplet,
  Wind,
  Rainbow,
  Sparkle,
  Infinity: InfinityIcon,
};
const ICON_NAMES = Object.keys(ICON_MAP);

const COLOR_PRESETS = [
  "#a855f7",
  "#6366f1",
  "#c084fc",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#8b5cf6",
  "#d946ef",
  "#64748b",
  "#1e293b",
  "#0f172a",
];

const inputClass =
  "w-full rounded-xl bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none ring-1 ring-white/10 transition focus:ring-2 focus:ring-fuchsia-400/60";
const selectClass =
  "rounded-xl bg-white/10 px-3.5 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 transition focus:ring-2 focus:ring-fuchsia-400/60";

const blank: Omit<ThemeOption, "votes"> = {
  id: "",
  name: "",
  tagline: "",
  description: "",
  iconName: "Sparkles",
  from: "#a855f7",
  to: "#6366f1",
  accent: "#c084fc",
  images: [""],
};

type StudentRow = {
  _id: string;
  studentId: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  course?: string;
  program?: string;
  yearLevel?: string;
  votedThemeId?: string | null;
};

const TABS = [
  { id: "themes", label: "Themes", icon: Palette },
  { id: "users", label: "Voters", icon: UsersIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
] as const;
type TabId = (typeof TABS)[number]["id"];

/* ------------------------------------------------------------------ */
/* Small shared UI pieces                                              */
/* ------------------------------------------------------------------ */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-white/60">{label}</label>
      {children}
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-fuchsia-300/80">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
        <Icon className="h-6 w-6 text-white/40" />
      </div>
      <p className="font-semibold text-white/80">{title}</p>
      <p className="mt-1 text-sm text-white/40">{description}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Color picker                                                        */
/* ------------------------------------------------------------------ */

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 rounded-xl bg-white/10 px-3 py-2.5 text-sm ring-1 ring-white/10 transition hover:ring-white/20"
      >
        <span
          className="h-6 w-6 shrink-0 rounded-lg border border-white/20 shadow-inner"
          style={{ backgroundColor: value }}
        />
        <span className="font-mono text-xs uppercase text-white/80">{value}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-2 w-64 rounded-xl border border-white/10 bg-slate-900 p-3.5 shadow-2xl">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="mb-3 h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={inputClass + " mb-3 font-mono text-xs uppercase"}
              placeholder="#RRGGBB"
            />
            <div className="grid grid-cols-8 gap-1.5">
              {COLOR_PRESETS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => onChange(c)}
                  className={`h-6 w-6 rounded-md border transition hover:scale-110 ${
                    value.toLowerCase() === c ? "border-white" : "border-white/10"
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Icon picker                                                         */
/* ------------------------------------------------------------------ */

function IconPickerField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => ICON_NAMES.filter((n) => n.toLowerCase().includes(query.toLowerCase())),
    [query],
  );
  const SelectedIcon = ICON_MAP[value] || Sparkles;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-xl bg-white/10 px-3.5 py-2.5 text-sm ring-1 ring-white/10 transition hover:ring-white/20"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
          <SelectedIcon className="h-4 w-4" />
        </span>
        <span className="flex-1 truncate text-left">{value || "Choose icon"}</span>
        <ChevronDown
          className={`h-4 w-4 text-white/40 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-2 w-full rounded-xl border border-white/10 bg-slate-900 p-3 shadow-2xl">
            <div className="relative mb-2.5">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search icons..."
                className={inputClass + " py-2 pl-8 text-xs"}
              />
            </div>
            <div className="grid max-h-52 grid-cols-6 gap-1.5 overflow-y-auto sm:grid-cols-8">
              {filtered.map((name) => {
                const Icon = ICON_MAP[name];
                const selected = name === value;
                return (
                  <button
                    type="button"
                    key={name}
                    title={name}
                    onClick={() => {
                      onChange(name);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`flex items-center justify-center rounded-lg p-2.5 transition ${
                      selected
                        ? "bg-fuchsia-500/30 ring-1 ring-fuchsia-400"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="col-span-full py-4 text-center text-xs text-white/40">
                  No icons found
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Image gallery with upload, preview, compression, and base64         */
/* ------------------------------------------------------------------ */

function ImageGalleryField({
  images,
  onChange,
}: {
  images: string[];
  onChange: (v: string[]) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [addMode, setAddMode] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Convert to base64 – compression happens server-side on save
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        const newImages = [...images];
        newImages.push(base64String);
        onChange(newImages);
        setCurrentIndex(newImages.length - 1);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Image read failed:", error);
      alert("Failed to process image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleAddUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    const newImages = [...images, trimmed];
    onChange(newImages);
    setCurrentIndex(newImages.length - 1);
    setUrlInput("");
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages.length ? newImages : []);
    setCurrentIndex(Math.max(0, Math.min(currentIndex, newImages.length - 1)));
  };

  const goToPrevious = () => {
    if (images.length === 0) return;
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    if (images.length === 0) return;
    setCurrentIndex((i) => (i + 1) % images.length);
  };

  const currentImage = images[currentIndex];
  const isDirectUrl = currentImage && !currentImage.startsWith("data:");

  return (
    <div className="space-y-3">
      {/* Preview slider with 9:16 aspect ratio */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="relative mx-auto max-w-4/5 overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
            {/* 9:16 portrait aspect ratio container */}
            <div className="relative w-full" style={{ aspectRatio: "9 / 16" }}>
              {currentImage && (
                <img
                  src={currentImage}
                  alt={`Preview ${currentIndex + 1}`}
                  className="h-full w-full object-cover"
                />
              )}
              {/* Navigation overlay */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className="absolute left-1 top-1/2 -translate-y-1/2 rounded bg-black/50 p-1 text-white/70 transition hover:bg-black/70"
                    title="Previous"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded bg-black/50 p-1 text-white/70 transition hover:bg-black/70"
                    title="Next"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Image counter, badge, and thumbnails */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <p className="text-xs text-white/60">
                {currentIndex + 1} of {images.length}
              </p>
              {isDirectUrl ? (
                <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-sky-300">
                  Direct Link URL
                </span>
              ) : (
                <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-purple-300">
                  Uploaded File
                </span>
              )}
            </div>

            {/* Thumbnail carousel */}
            {images.length > 1 && (
              <div className="flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    className={`h-6 w-6 shrink-0 rounded transition ${
                      i === currentIndex
                        ? "bg-fuchsia-500 ring-1 ring-fuchsia-400"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeImage(currentIndex)}
              className="rounded-lg bg-red-500/20 px-2.5 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/30"
            >
              Remove current
            </button>
          </div>
        </div>
      )}

      {/* Choice mode selection tabs: Upload vs Direct URL */}
      <div className="flex rounded-xl bg-white/5 p-1 ring-1 ring-white/10">
        <button
          type="button"
          onClick={() => setAddMode("upload")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
            addMode === "upload"
              ? "bg-fuchsia-500 text-white shadow"
              : "text-white/60 hover:text-white"
          }`}
        >
          <Upload className="h-3.5 w-3.5" /> Upload File
        </button>
        <button
          type="button"
          onClick={() => setAddMode("url")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
            addMode === "url"
              ? "bg-fuchsia-500 text-white shadow"
              : "text-white/60 hover:text-white"
          }`}
        >
          <Link className="h-3.5 w-3.5" /> Direct Link URL
        </button>
      </div>

      {addMode === "upload" ? (
        <>
          {/* Upload input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-3 text-sm font-medium text-white/60 transition hover:border-white/40 hover:text-white disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <ImagePlus className="h-4 w-4" /> Select local image file
              </>
            )}
          </button>

          <p className="text-xs text-white/40">
            Uploaded file images will be automatically compressed to ≤ 100kb on the server and stored in base64 format.
          </p>
        </>
      ) : (
        <>
          {/* Direct URL input */}
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
              placeholder="https://example.com/image.jpg"
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
            />
            <button
              type="button"
              onClick={() => handleAddUrl()}
              disabled={!urlInput.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-fuchsia-400 disabled:opacity-50"
            >
              <ImagePlus className="h-4 w-4" /> Add
            </button>
          </div>

          <p className="text-xs text-white/40">
            Direct link URLs will not be compressed and will be saved directly to the database.
          </p>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Theme card + form modal                                             */
/* ------------------------------------------------------------------ */

function ThemeCard({
  theme,
  onEdit,
  onDelete,
}: {
  theme: ThemeOption;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const Icon = ICON_MAP[theme.iconName] || Sparkles;
  return (
    <div className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-white/20">
      <div
        className="relative h-24"
        style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
      >
        <div className="absolute inset-0 flex items-center justify-between p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
            {theme.votes} votes
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="truncate font-bold">{theme.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-sm text-white/50">{theme.tagline}</p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={onEdit}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/15 py-2 text-xs font-semibold transition hover:bg-white/10"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ThemeFormModal({
  theme,
  isNew,
  saving,
  onChange,
  onSave,
  onClose,
}: {
  theme: Omit<ThemeOption, "votes">;
  isNew: boolean;
  saving: boolean;
  onChange: (t: Omit<ThemeOption, "votes">) => void;
  onSave: (e: FormEvent) => void;
  onClose: () => void;
}) {
  const PreviewIcon = ICON_MAP[theme.iconName] || Sparkles;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex h-[92dvh] w-full flex-col rounded-t-3xl border border-white/10 bg-slate-900 shadow-2xl sm:h-auto sm:max-h-[90dvh] sm:max-w-2xl sm:rounded-3xl">
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-lg font-bold">
            {isNew ? "Add theme" : "Edit theme"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 transition hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSave} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            {/* Live preview */}
            <div
              className="rounded-2xl p-5 shadow-inner"
              style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                  <PreviewIcon className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold text-white">
                    {theme.name || "Theme name"}
                  </p>
                  <p className="truncate text-sm text-white/80">
                    {theme.tagline || "Tagline preview"}
                  </p>
                </div>
              </div>
            </div>

            <FormSection title="Basic information">
              <Field label="Name">
                <input
                  className={inputClass}
                  placeholder="e.g. Neon Nights"
                  value={theme.name}
                  onChange={(e) => onChange({ ...theme, name: e.target.value })}
                />
              </Field>
              <Field label="Tagline">
                <input
                  className={inputClass}
                  placeholder="Short catchy phrase"
                  value={theme.tagline}
                  onChange={(e) => onChange({ ...theme, tagline: e.target.value })}
                />
              </Field>
              <Field label="Description">
                <textarea
                  className={inputClass + " min-h-[90px] resize-y"}
                  placeholder="Describe the theme..."
                  value={theme.description}
                  onChange={(e) => onChange({ ...theme, description: e.target.value })}
                />
              </Field>
            </FormSection>

            <FormSection title="Appearance">
              <Field label="Icon">
                <IconPickerField
                  value={theme.iconName}
                  onChange={(v) => onChange({ ...theme, iconName: v })}
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Gradient start">
                  <ColorField
                    value={theme.from}
                    onChange={(v) => onChange({ ...theme, from: v })}
                  />
                </Field>
                <Field label="Gradient end">
                  <ColorField
                    value={theme.to}
                    onChange={(v) => onChange({ ...theme, to: v })}
                  />
                </Field>
                <Field label="Accent">
                  <ColorField
                    value={theme.accent}
                    onChange={(v) => onChange({ ...theme, accent: v })}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Gallery images">
              <ImageGalleryField
                images={theme.images}
                onChange={(v) => onChange({ ...theme, images: v })}
              />
            </FormSection>
          </div>

          <div className="flex shrink-0 gap-3 border-t border-white/10 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/15 py-3 text-sm font-semibold transition hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-fuchsia-500 py-3 text-sm font-bold transition hover:bg-fuchsia-400 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isNew ? "Create theme" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Themes tab                                                          */
/* ------------------------------------------------------------------ */

function ThemesTab({
  themes,
  onAdd,
  onEdit,
  onDelete,
}: {
  themes: ThemeOption[];
  onAdd: () => void;
  onEdit: (t: ThemeOption) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Voting themes</h2>
          <p className="text-sm text-white/50">
            {themes.length} theme{themes.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-xl bg-fuchsia-500 px-4 py-2.5 text-sm font-bold shadow-lg shadow-fuchsia-900/30 transition hover:bg-fuchsia-400"
        >
          <Plus className="h-4 w-4" /> Add theme
        </button>
      </div>
      {themes.length === 0 ? (
        <EmptyState
          icon={Palette}
          title="No themes yet"
          description="Create your first theme to get started."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {themes.map((t) => (
            <ThemeCard
              key={t.id}
              theme={t}
              onEdit={() => onEdit(t)}
              onDelete={() => onDelete(t.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Users tab                                                           */
/* ------------------------------------------------------------------ */

function UsersTab({
  users,
  themes,
  totalUsers,
  totalPages,
  page,
  setPage,
  limit,
  setLimit,
  search,
  setSearch,
  program,
  setProgram,
  yearLevel,
  setYearLevel,
  votedFilter,
  setVotedFilter,
  onDelete,
}: {
  users: StudentRow[];
  themes: ThemeOption[];
  totalUsers: number;
  totalPages: number;
  page: number;
  setPage: (n: number) => void;
  limit: number;
  setLimit: (n: number) => void;
  search: string;
  setSearch: (s: string) => void;
  program: string;
  setProgram: (s: string) => void;
  yearLevel: string;
  setYearLevel: (s: string) => void;
  votedFilter: string;
  setVotedFilter: (s: string) => void;
  onDelete: (id: string) => void;
}) {
  const programs = useMemo(
    () => Array.from(new Set(users.map((u) => u.program || u.course).filter(Boolean))).sort(),
    [users],
  );
  const yearLevels = useMemo(
    () => Array.from(new Set(users.map((u) => u.yearLevel).filter(Boolean))).sort(),
    [users],
  );
  const themeMap = useMemo(() => {
    const map: Record<string, string> = {};
    themes.forEach((t) => {
      map[t.id] = t.name;
    });
    return map;
  }, [themes]);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold">Registered voters</h2>
        <p className="text-sm text-white/50">{totalUsers} total registered</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, or email..."
              className={inputClass + " pl-9"}
            />
          </div>
          <select
            value={votedFilter}
            onChange={(e) => {
              setVotedFilter(e.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">All vote statuses</option>
            <option value="voted">Voted</option>
            <option value="not_voted">Not voted</option>
          </select>
          <select
            value={program}
            onChange={(e) => {
              setProgram(e.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">All programs</option>
            {programs.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={yearLevel}
            onChange={(e) => {
              setYearLevel(e.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">All year levels</option>
            {yearLevels.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className={selectClass}
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No voters found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="space-y-3 md:hidden">
            {users.map((u) => (
              <div key={u._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{u.fullName}</p>
                    {u.lastName && (
                      <p className="text-xs text-white/70">
                        Last name: <span className="font-semibold text-white/90">{u.lastName}</span>
                      </p>
                    )}
                    <p className="text-xs text-white/50">{u.studentId}</p>
                  </div>
                  <button
                    onClick={() => onDelete(u._id)}
                    className="shrink-0 rounded-lg p-1.5 text-red-300 transition hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/70">
                    {u.program || u.course || "—"}
                  </span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/70">
                    {u.yearLevel || "—"}
                  </span>
                  {u.votedThemeId ? (
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 font-medium text-emerald-300">
                      Voted · {themeMap[u.votedThemeId] || u.votedThemeId}
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-500/15 px-2.5 py-1 font-medium text-amber-300">
                      Not voted
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/50">
                <tr>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Program</th>
                  <th className="px-4 py-3 font-semibold">Year level</th>
                  <th className="px-4 py-3 font-semibold">Vote status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((u) => (
                  <tr key={u._id} className="transition hover:bg-white/5">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{u.fullName}</p>
                      {u.lastName && (
                        <p className="text-xs text-white/70">
                          Last name: <span className="font-semibold text-white/90">{u.lastName}</span>
                        </p>
                      )}
                      <p className="text-xs text-white/50">{u.studentId}</p>
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {u.program || u.course || "—"}
                    </td>
                    <td className="px-4 py-3 text-white/70">{u.yearLevel || "—"}</td>
                    <td className="px-4 py-3">
                      {u.votedThemeId ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" /> {themeMap[u.votedThemeId] || u.votedThemeId}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-300">
                          Not voted
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onDelete(u._id)}
                        className="rounded-lg p-1.5 text-red-300 transition hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-white/50">
            Page {page} of {totalPages} · {totalUsers} total
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold transition disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold transition disabled:opacity-40"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Settings tab                                                        */
/* ------------------------------------------------------------------ */

function SettingsTab({
  current,
  setCurrent,
  next,
  setNext,
  changingPassword,
  onChangePassword,
  onResetVotes,
}: {
  current: string;
  setCurrent: (s: string) => void;
  next: string;
  setNext: (s: string) => void;
  changingPassword: boolean;
  onChangePassword: (e: FormEvent) => void;
  onResetVotes: () => void;
}) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <form
        onSubmit={onChangePassword}
        className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20">
            <KeyRound className="h-4 w-4 text-indigo-300" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold">Change password</h2>
            <p className="text-xs text-white/50">Update your admin credentials</p>
          </div>
        </div>
        <div className="relative">
          <input
            className={inputClass + " pr-10"}
            placeholder="Current password"
            type={showCurrent ? "text" : "password"}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowCurrent((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
          >
            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="relative">
          <input
            className={inputClass + " pr-10"}
            placeholder="New password (8+ characters)"
            type={showNext ? "text" : "password"}
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowNext((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
          >
            {showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <button
          disabled={changingPassword}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-2.5 text-sm font-bold transition hover:bg-indigo-400 disabled:opacity-60"
        >
          {changingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
          Update password
        </button>
      </form>

      <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/20">
            <ShieldAlert className="h-4 w-4 text-red-300" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold">Reset all votes</h2>
            <p className="text-xs text-red-200/60">This action cannot be undone</p>
          </div>
        </div>
        <p className="my-4 text-sm text-red-100/70">
          Clears every user's vote and sets every theme count back to zero. Use this only
          when starting a new voting round.
        </p>
        <button
          onClick={onResetVotes}
          className="w-full rounded-xl bg-red-500 py-2.5 text-sm font-bold transition hover:bg-red-400 sm:w-auto sm:px-6"
        >
          Reset votes
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                       */
/* ------------------------------------------------------------------ */

export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(adminTokenExists());
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [activeTab, setActiveTab] = useState<TabId>("themes");

  const [themes, setThemes] = useState<ThemeOption[]>([]);
  const [users, setUsers] = useState<StudentRow[]>([]);

  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [editing, setEditing] = useState<Omit<ThemeOption, "votes">>(blank);
  const [saving, setSaving] = useState(false);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [program, setProgram] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [votedFilter, setVotedFilter] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Debounce search query by 350ms to prevent API spamming while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  async function load() {
    try {
      const [themesData, usersData] = await Promise.all([
        apiAdminThemes(),
        apiAdminUsers(page, limit, debouncedSearch, program, yearLevel, votedFilter),
      ]);
      setThemes(themesData);
      setUsers(usersData.users);
      setTotalUsers(usersData.total);
      setTotalPages(usersData.pages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load admin data.");
    }
  }

  useEffect(() => {
    if (loggedIn) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn, page, limit, debouncedSearch, program, yearLevel, votedFilter]);

  // Auto-dismiss toasts
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(t);
  }, [error]);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(t);
  }, [message]);

  async function login(e: FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await apiAdminLogin(username, password);
      setLoggedIn(true);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed.");
    } finally {
      setLoginLoading(false);
    }
  }

  function openAdd() {
    setEditing(blank);
    setThemeModalOpen(true);
  }
  function openEdit(t: ThemeOption) {
    setEditing({ ...t });
    setThemeModalOpen(true);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing.id) await apiUpdateTheme(editing.id, editing);
      else await apiCreateTheme(editing);
      setEditing(blank);
      setThemeModalOpen(false);
      setMessage("Theme saved.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save theme.");
    } finally {
      setSaving(false);
    }
  }

  async function removeTheme(id: string) {
    if (!confirm("Delete this theme?")) return;
    try {
      await apiDeleteTheme(id);
      await load();
      setMessage("Theme deleted.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to delete theme.");
    }
  }

  async function removeUser(id: string) {
    if (!confirm("Delete this registered user?")) return;
    try {
      await apiDeleteUser(id);
      await load();
      setMessage("User deleted.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to delete user.");
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setChangingPassword(true);
    try {
      await apiChangeAdminPassword(current, next);
      setMessage("Password changed.");
      setCurrent("");
      setNext("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to change password.");
    } finally {
      setChangingPassword(false);
    }
  }

  async function resetVotes() {
    if (!confirm("Reset all votes to zero?")) return;
    try {
      await apiResetVotes();
      setMessage("All votes reset.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to reset votes.");
    }
  }

  /* ---------------------------- Login screen ---------------------------- */
  if (!loggedIn)
    return (
      <div className="flex min-h-[100dvh] items-center bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-600 shadow-lg shadow-purple-900/50">
              <img src="/favicon.png" alt="CCS Logo" className="h-8 w-8" />
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-fuchsia-300">
              CCS voting console
            </p>
          </div>
          <form
            onSubmit={login}
            className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <div>
              <h1 className="font-display text-2xl font-bold">Admin sign in</h1>
              <p className="mt-1 text-sm text-purple-200/70">
                Manage themes, users, and vote settings.
              </p>
            </div>

            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                className={inputClass + " pl-10"}
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                className={inputClass + " px-10"}
                placeholder="Password"
                type={showLoginPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                {showLoginPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {error && (
              <p className="flex items-start gap-2 rounded-lg bg-red-500/15 p-2.5 text-sm text-red-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              </p>
            )}

            <button
              disabled={loginLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-fuchsia-500 p-3 font-bold transition hover:bg-fuchsia-400 disabled:opacity-60"
            >
              {loginLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </button>
          </form>
        </div>
      </div>
    );

  /* ---------------------------- Main dashboard ---------------------------- */
  return (
    <div className="min-h-[100dvh] bg-slate-950 text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-600">
              <img src="/favicon.png" alt="CCS Logo" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fuchsia-300">
                CCS voting
              </p>
              <h1 className="font-display text-lg font-bold leading-none">Admin panel</h1>
            </div>
          </div>
          <button
            onClick={() => {
              clearAdminToken();
              setLoggedIn(false);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-fuchsia-500/20 text-fuchsia-200"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.id === "users" && (
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
                  {totalUsers}
                </span>
              )}
              {tab.id === "themes" && (
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
                  {themes.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {activeTab === "themes" && (
          <ThemesTab
            themes={themes}
            onAdd={openAdd}
            onEdit={openEdit}
            onDelete={removeTheme}
          />
        )}
        {activeTab === "users" && (
          <UsersTab
            users={users}
            themes={themes}
            totalUsers={totalUsers}
            totalPages={totalPages}
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            search={search}
            setSearch={setSearch}
            program={program}
            setProgram={setProgram}
            yearLevel={yearLevel}
            setYearLevel={setYearLevel}
            votedFilter={votedFilter}
            setVotedFilter={setVotedFilter}
            onDelete={removeUser}
          />
        )}
        {activeTab === "settings" && (
          <SettingsTab
            current={current}
            setCurrent={setCurrent}
            next={next}
            setNext={setNext}
            changingPassword={changingPassword}
            onChangePassword={changePassword}
            onResetVotes={resetVotes}
          />
        )}
      </main>

      {themeModalOpen && (
        <ThemeFormModal
          theme={editing}
          isNew={!editing.id}
          saving={saving}
          onChange={setEditing}
          onSave={save}
          onClose={() => {
            setThemeModalOpen(false);
            setEditing(blank);
          }}
        />
      )}

      {/* Toasts */}
      {(error || message) && (
        <div className="fixed inset-x-4 bottom-4 z-[60] flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:w-96">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-500/15 p-3.5 text-sm text-red-200 shadow-lg backdrop-blur">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="flex-1">{error}</p>
              <button onClick={() => setError("")}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {message && (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/15 p-3.5 text-sm text-emerald-200 shadow-lg backdrop-blur">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="flex-1">{message}</p>
              <button onClick={() => setMessage("")}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}