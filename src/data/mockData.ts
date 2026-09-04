export interface Student {
  studentId: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  course?: string;
  yearLevel?: string;
  photo?: string;
  email?: string;
  voted?: boolean;
  votedThemeId?: string | null;
}

export interface ThemeOption {
  id: string;
  name: string;
  tagline: string;
  description: string;
  iconName: "Sparkles" | "Ghost" | "Gamepad2" | "Drama" | "Palmtree" | "Disc3" | string;
  from: string;
  to: string;
  accent: string;
  images: string[];
  votes: number;
}
