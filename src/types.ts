export interface PersonalInfo {
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa: string;
  description: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string; // Dynamic / multiline text or bullet points
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string;
  link: string;
}

export interface SkillCategory {
  id: string;
  category: string; // e.g., "Languages", "Frontend"
  skills: string;   // e.g., "JavaScript, TypeScript, HTML/CSS"
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  education: Education[];
  workExperience: WorkExperience[];
  projects: Project[];
  skills: SkillCategory[];
  themeColor: string; // Hex color or Tailwind class name
  layoutTemplate: "modern" | "classic" | "minimalist";
}
