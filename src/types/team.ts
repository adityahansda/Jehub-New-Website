export interface TeamMember {
  name: string;
  role: string;
  education: string;
  specialization: string;
  bio: string;
  image: string;
  department: string;
  working: number; // 1 = active, 0 = inactive/former
  xp: number;
  promoted?: boolean; // true if member was promoted to core team
  founder?: boolean; // true if member is the founder
  achievements?: string[]; // list of key achievements
  vision?: string; // founder's vision statement
  social?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
}

export interface CoreTeamMember {
  name: string;
  role: string;
  education: string;
  specialization: string;
  bio: string;
  image: string;
  social: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
}
