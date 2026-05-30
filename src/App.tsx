import React, { useState } from "react";
import ResumeForm from "./components/ResumeForm";
import ResumePreview from "./components/ResumePreview";
import { initialResumeData } from "./data";
import { ResumeData } from "./types";
import { Sparkles, Trash2, RefreshCw } from "lucide-react";

export default function App() {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);

  // Clear all form fields to start blank
  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all fields? This will empty your current resume progress.")) {
      setResumeData({
        personalInfo: {
          name: "",
          jobTitle: "",
          email: "",
          phone: "",
          location: "",
          linkedin: "",
          portfolio: "",
        },
        summary: "",
        education: [],
        workExperience: [],
        projects: [],
        skills: [],
        themeColor: "#2563eb",
        layoutTemplate: "modern",
      });
    }
  };

  // Reset to robust predefined demo resume
  const handleResetDemo = () => {
    if (confirm("Reset current draft to the prefilled template? All custom details will be overwritten.")) {
      setResumeData(initialResumeData);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 font-sans">
      {/* SaaS Dashboard Top Bar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            ResuAI <span className="text-slate-400 font-normal text-sm ml-2">v2.0</span>
          </h1>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-medium transition-colors border border-slate-200 active:scale-95 cursor-pointer shadow-sm"
            title="Reset"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Editor sidebar: 1/3 of space on desktop, scrollable */}
        <div className="w-full h-2/5 lg:h-full shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-white editor-sidebar">
          <ResumeForm resumeData={resumeData} onChange={setResumeData} />
        </div>

        {/* Live stage preview: rest of space, customizable zoom */}
        <div className="flex-1 h-3/5 lg:h-full overflow-visible bg-slate-100 flex flex-col">
          <ResumePreview resumeData={resumeData} />
        </div>
      </div>
      
    </div>
  );
}
