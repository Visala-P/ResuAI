import { ResumeData } from "./types";

export const initialResumeData: ResumeData = {
  personalInfo: {
    name: "Alex Mercer",
    jobTitle: "Senior Full Stack Engineer",
    email: "alex.mercer@email.com",
    phone: "+1 (555) 019-2834",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexmercer",
    portfolio: "alexmercer.dev",
  },
  summary: "Results-driven Senior Full Stack Engineer with over 6 years of experience designing, building, and optimizing scalable web applications. Expert in React, Node.js, and Cloud architectures with a passion for crafting responsive, user-centric interfaces. Strong advocate for clean code, automated testing, and agile methodologies, with a proven track record of reducing load times by 40% and mentoring junior developers.",
  education: [
    {
      id: "edu-1",
      school: "University of California, Berkeley",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science & Engineering",
      startDate: "2016-09",
      endDate: "2020-05",
      gpa: "3.85 / 4.0",
      description: "Graduated with Honors. Specialization in Distributed Systems and Human-Computer Interaction.",
    },
  ],
  workExperience: [
    {
      id: "work-1",
      company: "Innovate Tech Corp",
      role: "Lead React & Node Developer",
      location: "San Francisco, CA",
      startDate: "2022-08",
      endDate: "Present",
      current: true,
      description: "• Spearheaded migration of a legacy monolithic platform to a modern React micro-frontend architecture, increasing page speed by 45%.\n• Designed and engineered high-throughput Node.js microservices handling 15M+ requests daily, with 99.99% operational uptime.\n• Conducted daily code reviews, mentored 4 junior engineers, and championed accessibility standards across the engineering department.",
    },
    {
      id: "work-2",
      company: "Stellar Cloud Systems",
      role: "Full Stack Engineer",
      location: "Remote",
      startDate: "2020-06",
      endDate: "2022-07",
      current: false,
      description: "• Architected automated CI/CD pipeline reducing deployment cycle times by 60% and enabling safer, faster rollouts.\n• Built and managed interactive real-time dashboards utilizing WebSockets, React, and D2 charts to analyze server vitals.\n• Optimized database query structures in PostgreSQL, resulting in an immediate 30% reduction in database CPU utilization.",
    },
  ],
  projects: [
    {
      id: "proj-1",
      title: "Synthetix AI Analytics Platform",
      description: "A real-time analytics hub with AI predictions, complex visual graphs using D3, and detailed export features.",
      technologies: "React, TypeScript, Tailwind CSS, Express, Gemini Node API",
      link: "github.com/alex/synthetix-ai",
    },
    {
      id: "proj-2",
      title: "Chronos Task Intelligence",
      description: "Collaborative, offline-first task scheduler utilizing state synchronization, local databases, and micro-interactions.",
      technologies: "Vite, React, Tailwind CSS, IndexedDB, Service Workers",
      link: "chronostask.app",
    },
  ],
  skills: [
    {
      id: "skill-1",
      category: "Languages",
      skills: "TypeScript, JavaScript, Python, SQL, Go",
    },
    {
      id: "skill-2",
      category: "Frontend Stack",
      skills: "React, Next.js, Redux, Tailwind CSS, HTML5/CSS3, D3.js",
    },
    {
      id: "skill-3",
      category: "Backend & Systems",
      skills: "Node.js, Express, Fastify, PostgreSQL, MongoDB, Redis",
    },
    {
      id: "skill-4",
      category: "Cloud & Devops",
      skills: "AWS, Docker, CI/CD Pipelines, Kubernetes, Vercel",
    },
  ],
  themeColor: "#2563eb", // Primary Slate/Blue
  layoutTemplate: "modern",
};
