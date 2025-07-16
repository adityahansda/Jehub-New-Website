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
