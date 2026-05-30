import React, { useState } from "react";
import { 
  User, Mail, Phone, MapPin, Linkedin, Globe, Briefcase, 
  GraduationCap, FolderGit2, Sparkles, Plus, Trash2, 
  Loader2, Check, LayoutGrid, Award, Sliders
} from "lucide-react";
import { ResumeData, Education, WorkExperience, Project, SkillCategory } from "../types";

interface ResumeFormProps {
  resumeData: ResumeData;
  onChange: (newData: ResumeData) => void;
}

export default function ResumeForm({ resumeData, onChange }: ResumeFormProps) {
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [loadingField, setLoadingField] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const [localApiKey, setLocalApiKey] = useState<string>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("aistudio_api_key") || "" : "";
  });

  // Attach global functions to window
  if (typeof window !== "undefined") {
    (window as any).getAIStudioApiKey = () => {
      return localStorage.getItem("aistudio_api_key") || "";
    };
    (window as any).setAIStudioApiKey = (key: string) => {
      localStorage.setItem("aistudio_api_key", key);
      setLocalApiKey(key);
    };
  }

  // Quick State Updates
  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [field]: value,
      },
    });
  };

  const updateSummary = (value: string) => {
    onChange({
      ...resumeData,
      summary: value,
    });
  };

  // Add & Edit Work Experience
  const addExperience = () => {
    const newExp: WorkExperience = {
      id: `work-${Date.now()}`,
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "• Lead key initiatives...\n• Improved processes by...",
    };
    onChange({
      ...resumeData,
      workExperience: [...resumeData.workExperience, newExp],
    });
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: any) => {
    const updated = resumeData.workExperience.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange({ ...resumeData, workExperience: updated });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...resumeData,
      workExperience: resumeData.workExperience.filter((item) => item.id !== id),
    });
  };

  // Add & Edit Education
  const addEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      school: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      gpa: "",
      description: "",
    };
    onChange({
      ...resumeData,
      education: [...resumeData.education, newEdu],
    });
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    const updated = resumeData.education.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange({ ...resumeData, education: updated });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...resumeData,
      education: resumeData.education.filter((item) => item.id !== id),
    });
  };

  // Add & Edit Projects
  const addProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: "",
      description: "",
      technologies: "",
      link: "",
    };
    onChange({
      ...resumeData,
      projects: [...resumeData.projects, newProj],
    });
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    const updated = resumeData.projects.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange({ ...resumeData, projects: updated });
  };

  const removeProject = (id: string) => {
    onChange({
      ...resumeData,
      projects: resumeData.projects.filter((item) => item.id !== id),
    });
  };

  // Add & Edit Skills
  const addSkillCategory = () => {
    const newSkill: SkillCategory = {
      id: `skill-${Date.now()}`,
      category: "",
      skills: "",
    };
    onChange({
      ...resumeData,
      skills: [...resumeData.skills, newSkill],
    });
  };

  const updateSkillCategory = (id: string, field: keyof SkillCategory, value: string) => {
    const updated = resumeData.skills.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange({ ...resumeData, skills: updated });
  };

  const removeSkillCategory = (id: string) => {
    onChange({
      ...resumeData,
      skills: resumeData.skills.filter((item) => item.id !== id),
    });
  };

  // Trigger Gemini AI Optimization on server or direct client (with custom API key)
  const handleAIOptimize = async (type: "summary" | "experience", text: string, id?: string) => {
    if (!text.trim()) {
      setAiError("Please type some rough content or bullet points first so AI can optimize it!");
      return;
    }

    setLoadingField(id || type);
    setAiError(null);

    try {
      const apiKey = localStorage.getItem("aistudio_api_key") || "";
      const systemDirective = "Act as an expert resume writer. Rewrite the input text into an impactful, metrics-driven, ATS-optimized professional description. Return ONLY the rewritten text. Do not include markdown formatting, introductions, or pleasantries.";
      
      let optimizedText = "";

      if (apiKey) {
        // Direct Client-Side Fetch requested by Google AI Studio Native Engine
        const endpointUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(endpointUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemDirective}\n\nInput Text:\n${text}`
                  }
                ]
              }
            ],
            systemInstruction: {
              parts: [
                {
                  text: systemDirective
                }
              ]
            }
          }),
        });

        if (!response.ok) {
          const detail = await response.text();
          throw new Error(`Direct Client API key failed (${response.status} ${response.statusText}): ${detail}`);
        }

        const data = await response.json();
        const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textResult) {
          throw new Error("Invalid response structural format back from Gemini API.");
        }
        optimizedText = textResult.trim();
      } else {
        // Safe backend proxy fallback using platform-injected GEMINI_API_KEY
        const response = await fetch("/api/ai/enhance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            text,
            jobTitle: resumeData.personalInfo.jobTitle,
          }),
        });

        const data = await response.json();
        if (!response.ok || data.error) {
          throw new Error(data.error || "Failed to communicate with proxy AI.");
        }
        optimizedText = data.text;
      }

      if (type === "summary") {
        updateSummary(optimizedText);
      } else if (type === "experience" && id) {
        updateExperience(id, "description", optimizedText);
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Something went wrong during AI optimization. Make sure your API Key is correct.");
    } finally {
      setLoadingField(null);
    }
  };

  const tabs = [
    { id: "personal", label: "Contact Info", icon: User },
    { id: "summary", label: "Summary", icon: Award },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "projects", label: "Projects", icon: FolderGit2 },
    { id: "skills", label: "Skills", icon: LayoutGrid },
    { id: "design", label: "Design Settings", icon: Sliders },
  ];

  const colorThemes = [
    { value: "#2563eb", name: "Royal Blue" },
    { value: "#0f766e", name: "Teal" },
    { value: "#1e293b", name: "Charcoal" },
    { value: "#be123c", name: "Crimson" },
    { value: "#6d28d9", name: "Amethyst" },
    { value: "#15803d", name: "Emerald" },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 text-slate-800" id="resume-form-sidebar">
      {/* Sidebar Header removed as requested */}

      {/* Tabs Navigation (Horizontal on small screens, grid/scrollable lists) */}
      <div className="p-2 bg-slate-50 border-b border-slate-200 flex gap-1 overflow-x-auto scrollbar-none shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-150"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents Scrollable container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {aiError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-700 space-y-1.5 shadow-sm shadow-rose-100">
            <div className="font-bold flex items-center gap-1.5">
              <span>⚠️</span>
              <span>AI Enhancement Service Message:</span>
            </div>
            <p className="font-sans leading-relaxed text-[11px] text-rose-650">{aiError}</p>
            <button 
              onClick={() => setAiError(null)}
              className="text-[10px] font-bold uppercase tracking-wider text-rose-600 hover:text-rose-800 pt-1 cursor-pointer"
            >
              Dismiss warning
            </button>
          </div>
        )}

        {/* Tab: CONTACT INFO */}
        {activeTab === "personal" && (
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={resumeData.personalInfo.name}
                    onChange={(e: any) => updatePersonalInfo("name", e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Job Title</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.jobTitle}
                  onChange={(e: any) => updatePersonalInfo("jobTitle", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans transition-all"
                  placeholder="Software Engineer"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email Connection</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e: any) => updatePersonalInfo("email", e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    value={resumeData.personalInfo.phone}
                    onChange={(e: any) => updatePersonalInfo("phone", e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans transition-all"
                    placeholder="+1 (555) 012-3456"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={resumeData.personalInfo.location}
                    onChange={(e: any) => updatePersonalInfo("location", e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans transition-all"
                    placeholder="New York, NY"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">LinkedIn URL</label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e: any) => updatePersonalInfo("linkedin", e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans transition-all"
                    placeholder="linkedin.com/in/user"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Portfolio & GitHub Links</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={resumeData.personalInfo.portfolio}
                    onChange={(e: any) => updatePersonalInfo("portfolio", e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans transition-all"
                    placeholder="johndoe.com"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: PROFESSIONAL SUMMARY */}
        {activeTab === "summary" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Professional Summary</h3>
              <button
                type="button"
                onClick={() => handleAIOptimize("summary", resumeData.summary)}
                disabled={loadingField === "summary"}
                className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded border border-indigo-100 uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
              >
                {loadingField === "summary" ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Enhancing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                    <span>✨ AI Enhance</span>
                  </>
                )}
              </button>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Write a draft highlighting your background, and click the <strong className="text-slate-600">AI Enhance</strong> button. Our Gemini AI will craft an impactful and ATS-optimized summary automatically!
            </p>

            <div>
              <textarea
                value={resumeData.summary}
                onChange={(e: any) => updateSummary(e.target.value)}
                rows={7}
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans leading-relaxed transition-all"
                placeholder="Write your professional summary here or let the AI optimizer formulate one..."
              />
              <div className="text-[10px] text-slate-400 font-mono text-right mt-1.5 font-bold">
                {resumeData.summary.length} characters
              </div>
            </div>
          </div>
        )}

        {/* Tab: WORK EXPERIENCE */}
        {activeTab === "experience" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Work History</h3>
              <button
                type="button"
                onClick={addExperience}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all cursor-pointer shadow-sm shadow-slate-100"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Position</span>
              </button>
            </div>

            {resumeData.workExperience.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Briefcase className="h-8 w-8 text-slate-300 mx-auto opacity-60 mb-2" />
                <p className="text-xs text-slate-400 font-sans">No work experience added yet.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {resumeData.workExperience.map((exp, index) => (
                  <div key={exp.id} className="p-5 rounded-xl bg-slate-50/40 border border-slate-200 relative space-y-4 hover:border-slate-300 transition-all font-sans">
                    <div className="absolute right-3 top-3 flex items-center gap-1.5">
                      {/* AI EXP BULLET REMAKER */}
                      <button
                        type="button"
                        onClick={() => handleAIOptimize("experience", exp.description, exp.id)}
                        disabled={loadingField === exp.id}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9.5px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 transition-all disabled:opacity-40 uppercase tracking-wider cursor-pointer font-sans"
                        title="Polish bullet points with AI"
                      >
                        {loadingField === exp.id ? (
                          <Loader2 className="h-2.5 w-2.5 animate-spin" strokeWidth={3} />
                        ) : (
                          <Sparkles className="h-2.5 w-2.5 text-emerald-555" />
                        )}
                        <span>✨ AI Polish</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => removeExperience(exp.id)}
                        className="p-1 px-1.5 bg-rose-50 rounded-lg hover:bg-rose-100 transition-all cursor-pointer"
                        title="Remove position"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                      </button>
                    </div>

                    <div className="pt-1">
                      <span className="inline-block text-[10px] font-bold text-indigo-650 bg-indigo-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                        Position #{index + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Company / Organization</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e: any) => updateExperience(exp.id, "company", e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
                          placeholder="Innovate Corp"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Corporate Role</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e: any) => updateExperience(exp.id, "role", e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
                          placeholder="Staff Developer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Office Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e: any) => updateExperience(exp.id, "location", e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
                          placeholder="San Francisco, CA / Remote"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">From Date</label>
                        <input
                          type="month"
                          value={exp.startDate}
                          onChange={(e: any) => updateExperience(exp.id, "startDate", e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">To Date</label>
                        <input
                          type="month"
                          value={exp.endDate}
                          onChange={(e: any) => updateExperience(exp.id, "endDate", e.target.value)}
                          disabled={exp.current}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans cursor-pointer disabled:opacity-40"
                        />
                      </div>
                      <div className="col-span-2 flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id={`current-${exp.id}`}
                          checked={exp.current}
                          onChange={(e: any) => updateExperience(exp.id, "current", e.target.checked)}
                          className="rounded border-slate-200 text-indigo-600 focus:ring-0 focus:ring-offset-0 h-4 w-4 cursor-pointer"
                        />
                        <label htmlFor={`current-${exp.id}`} className="text-xs font-semibold text-slate-600 font-sans cursor-pointer select-none">
                          I currently work here
                        </label>
                      </div>

                      <div className="col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-slate-500">Accomplishments & Bullets</label>
                          <span className="text-[10px] font-medium text-slate-400 italic">Prefix points with '• ' for clarity</span>
                        </div>
                        <textarea
                          value={exp.description}
                          onChange={(e: any) => updateExperience(exp.id, "description", e.target.value)}
                          rows={4}
                          className="w-full p-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans leading-relaxed"
                          placeholder="• Spearheaded integration of..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: EDUCATION */}
        {activeTab === "education" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Education Details</h3>
              <button
                type="button"
                onClick={addEducation}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all cursor-pointer shadow-sm shadow-slate-100"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Degree</span>
              </button>
            </div>

            {resumeData.education.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <GraduationCap className="h-8 w-8 text-slate-300 mx-auto opacity-60 mb-2" />
                <p className="text-xs text-slate-400 font-sans">No academic listings added yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resumeData.education.map((edu, idx) => (
                  <div key={edu.id} className="p-5 rounded-xl bg-slate-50/40 border border-slate-200 relative space-y-4 hover:border-slate-300 transition-all font-sans">
                    <button
                      type="button"
                      onClick={() => removeEducation(edu.id)}
                      className="absolute right-3 top-3 p-1 px-1.5 bg-rose-50 rounded-lg hover:bg-rose-100 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                    </button>

                    <div className="pt-1">
                      <span className="inline-block text-[10px] font-bold text-indigo-650 bg-indigo-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                        Academics #{idx + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Institution Name</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e: any) => updateEducation(edu.id, "school", e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          placeholder="UC Berkeley"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Degree Earned</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e: any) => updateEducation(edu.id, "degree", e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          placeholder="Bachelor of Science"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Field of Study</label>
                        <input
                          type="text"
                          value={edu.fieldOfStudy}
                          onChange={(e: any) => updateEducation(edu.id, "fieldOfStudy", e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          placeholder="Computer Science"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Start Date</label>
                        <input
                          type="month"
                          value={edu.startDate}
                          onChange={(e: any) => updateEducation(edu.id, "startDate", e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">End Date (or expected)</label>
                        <input
                          type="month"
                          value={edu.endDate}
                          onChange={(e: any) => updateEducation(edu.id, "endDate", e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans cursor-pointer"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">GPA / Honors / Activities</label>
                        <input
                          type="text"
                          value={edu.gpa}
                          onChange={(e: any) => updateEducation(edu.id, "gpa", e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          placeholder="GPA: 3.92, Magna cum laude"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Brief Description (Optional)</label>
                        <textarea
                          value={edu.description}
                          onChange={(e: any) => updateEducation(edu.id, "description", e.target.value)}
                          rows={2}
                          className="w-full p-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans transition-all leading-relaxed"
                          placeholder="Major courses, achievements..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: PROJECTS */}
        {activeTab === "projects" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Personal & Open Source Projects</h3>
              <button
                type="button"
                onClick={addProject}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all cursor-pointer shadow-sm shadow-slate-100"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            {resumeData.projects.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <FolderGit2 className="h-8 w-8 text-slate-300 mx-auto opacity-60 mb-2" />
                <p className="text-xs text-slate-400 font-sans">No projects added yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resumeData.projects.map((proj, idx) => (
                  <div key={proj.id} className="p-5 rounded-xl bg-slate-50/40 border border-slate-200 relative space-y-4 hover:border-slate-300 transition-all font-sans">
                    <button
                      type="button"
                      onClick={() => removeProject(proj.id)}
                      className="absolute right-3 top-3 p-1 px-1.5 bg-rose-50 rounded-lg hover:bg-rose-100 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                    </button>

                    <div className="pt-1">
                      <span className="inline-block text-[10px] font-bold text-indigo-650 bg-indigo-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                        Project #{idx + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e: any) => updateProject(proj.id, "title", e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          placeholder="Synthetix AI Platform"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Project Link / Anchor</label>
                        <input
                          type="text"
                          value={proj.link}
                          onChange={(e: any) => updateProject(proj.id, "link", e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans"
                          placeholder="github.com/username/project"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Technologies Utilized</label>
                        <input
                          type="text"
                          value={proj.technologies}
                          onChange={(e: any) => updateProject(proj.id, "technologies", e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
                          placeholder="React, Redux Toolkit, WebSockets"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Project Summary</label>
                        <textarea
                          value={proj.description}
                          onChange={(e: any) => updateProject(proj.id, "description", e.target.value)}
                          rows={3}
                          className="w-full p-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans leading-relaxed transition-all"
                          placeholder="Outline architecture, features, and key metrics..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: SKILLS */}
        {activeTab === "skills" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Skill Categories</h3>
              <button
                type="button"
                onClick={addSkillCategory}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all cursor-pointer shadow-sm shadow-slate-100"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Category</span>
              </button>
            </div>

            {resumeData.skills.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <LayoutGrid className="h-8 w-8 text-slate-350 mx-auto opacity-60 mb-2" />
                <p className="text-xs text-slate-400 font-sans">No skills listed yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resumeData.skills.map((skill, idx) => (
                  <div key={skill.id} className="p-5 rounded-xl bg-slate-50/40 border border-slate-200 relative space-y-4 hover:border-slate-300 transition-all font-sans">
                    <button
                      type="button"
                      onClick={() => removeSkillCategory(skill.id)}
                      className="absolute right-3 top-3 p-1 px-1.5 bg-rose-50 rounded-lg hover:bg-rose-100 transition-all cursor-pointer animate-fade-in"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                    </button>

                    <div className="pt-1">
                      <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                        Category #{idx + 1}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Category Title</label>
                        <input
                          type="text"
                          value={skill.category}
                          onChange={(e: any) => updateSkillCategory(skill.id, "category", e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          placeholder="e.g. Frontend Architecture"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Skills (Comma-separated values)</label>
                        <textarea
                          value={skill.skills}
                          onChange={(e: any) => updateSkillCategory(skill.id, "skills", e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans leading-relaxed transition-all"
                          placeholder="e.g. React, Vue, Svelte, Angular"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: DESIGN SETTINGS */}
        {activeTab === "design" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Layout Template</h3>
              <p className="text-[12px] text-slate-400 mt-1.5 mb-3.5 font-sans leading-relaxed">
                Decide the graphic presentation schema for your generated document.
              </p>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: "modern", title: "Modern Professional", desc: "Clean sidebar, Grotesk headers & bold timeline bullets." },
                  { id: "classic", title: "Classic Academic", desc: "Traditional centered layout utilizing elegant Serif typefaces." },
                  { id: "minimalist", title: "Minimal Swiss", desc: "Utilitarian layout, high information density with compact spacing." }
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => onChange({ ...resumeData, layoutTemplate: tpl.id as any })}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      resumeData.layoutTemplate === tpl.id
                        ? "bg-indigo-50/70 border-indigo-550 ring-2 ring-indigo-500/10 shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">{tpl.title}</span>
                      {resumeData.layoutTemplate === tpl.id && (
                        <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-100/60" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-550 font-sans leading-relaxed">{tpl.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Primary Accent Color</h3>
              <p className="text-[12px] text-slate-400 mt-1.5 mb-3.5 font-sans leading-relaxed">
                Influences headers, side lines, bullet markings, and bold items in the preview document.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {colorThemes.map((col) => (
                  <button
                    key={col.value}
                    onClick={() => onChange({ ...resumeData, themeColor: col.value })}
                    className={`flex items-center gap-1.5 p-2.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                      resumeData.themeColor === col.value
                        ? "bg-indigo-50/70 text-slate-850 border-indigo-400"
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-800"
                    }`}
                  >
                    <span 
                      className="h-3 w-3 rounded-full shrink-0 shadow-sm" 
                      style={{ backgroundColor: col.value }}
                    />
                    <span className="truncate">{col.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Studio Configuration Section */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Google AI Studio API Key</h3>
              <p className="text-[11.5px] text-slate-400 font-sans leading-relaxed">
                Add your custom API key below to enable direct client-side fetch calls to Gemini. If left blank, it will securely fallback of using the server-side proxy route.
              </p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={localApiKey}
                    onChange={(e: any) => {
                      setLocalApiKey(e.target.value);
                      localStorage.setItem("aistudio_api_key", e.target.value);
                    }}
                    placeholder="Enter your API Key (Google AI Studio API key"
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono transition-all"
                  />
                  {localApiKey && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocalApiKey("");
                        localStorage.removeItem("aistudio_api_key");
                      }}
                      className="px-2.5 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-xs font-bold hover:bg-rose-100 cursor-pointer transition-all"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10.5px]">
                  <span className={`h-1.5 w-1.5 rounded-full ${localApiKey ? "bg-emerald-500" : "bg-amber-400"}`} />
                  <span className="text-slate-500 font-sans">
                    {localApiKey ? "Using Custom Client API Key" : "Using Secure Server-Side Key"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-indigo-50/30 border border-indigo-100/60 space-y-2.5">
              <h4 className="text-xs font-bold text-indigo-700">💡 Custom Typography Pairings included:</h4>
              <ul className="text-[11px] text-slate-550 list-disc pl-4 space-y-1 font-sans">
                <li><strong className="text-slate-700 font-bold">Modern</strong> combines Space Grotesk labels with responsive Inter body.</li>
                <li><strong className="text-slate-700 font-bold">Classic</strong> utilizes Editorial Playfair serif titles.</li>
                <li><strong className="text-slate-700 font-bold">Minimalist</strong> couples precise monospaced accents.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
