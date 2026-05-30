import React, { useRef, useState } from "react";
import { 
  Download, Printer, Mail, Phone, MapPin, 
  Linkedin, Globe, Calendar, ZoomIn, ZoomOut, Check, Loader2 
} from "lucide-react";
import { ResumeData } from "../types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ResumePreviewProps {
  resumeData: ResumeData;
}

export default function ResumePreview({ resumeData }: ResumePreviewProps) {
  const [downloading, setDownloading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(0.9); // Adjust fit on typical desktop screens
  const resumeRef = useRef<HTMLDivElement>(null);

  // Parse multilines or custom bullets into an array for cleaner rendering
  const parseBullets = (text: string): string[] => {
    if (!text) return [];
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        // Strip out existing bullet characters if any
        if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
          return line.slice(1).trim();
        }
        return line;
      });
  };

  // Modern Export Handler with Cloned Offscreen Container to guarantee literal 100% scale
  const exportPDF = async () => {
    const docElement = resumeRef.current;
    if (!docElement) return;

    setDownloading(true);

    // Create a temporary offscreen rendering container
    const tempContainer = document.createElement("div");
    tempContainer.setAttribute("id", "temp-pdf-render-root");
    tempContainer.style.position = "fixed";
    tempContainer.style.left = "-15000px";
    tempContainer.style.top = "0";
    tempContainer.style.width = "816.01px"; // Force pixel-perfect width
    tempContainer.style.height = "auto";
    tempContainer.style.transform = "none";
    tempContainer.style.transition = "none";
    tempContainer.style.opacity = "1";
    tempContainer.style.zIndex = "-99990";
    tempContainer.style.pointerEvents = "none";

    // Clone the resume container
    const clonedElement = docElement.cloneNode(true) as HTMLDivElement;
    
    // Clear dynamic transforms, zoom overlays and box shadows on the cloned copy
    clonedElement.style.transform = "none";
    clonedElement.style.transition = "none";
    clonedElement.style.boxShadow = "none";
    clonedElement.style.margin = "0";
    clonedElement.style.width = "816px";
    clonedElement.style.minHeight = "1056px";

    tempContainer.appendChild(clonedElement);
    document.body.appendChild(tempContainer);

    try {
      // Pause slightly to ensure full DOM layout synthesis and clean font styling binding
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Find all elements with data-pdf-link-url in the cloned element to map links precisely
      const clonedRect = clonedElement.getBoundingClientRect();
      const clonedLinks = clonedElement.querySelectorAll("[data-pdf-link-url]");
      
      const pdfLinksData = Array.from(clonedLinks).map((linkEl) => {
        const rect = linkEl.getBoundingClientRect();
        return {
          url: linkEl.getAttribute("data-pdf-link-url") || "",
          left: rect.left - clonedRect.left,
          top: rect.top - clonedRect.top,
          width: rect.width,
          height: rect.height,
        };
      });

      // Capture the isolated offscreen cloned element
      const canvas = await html2canvas(clonedElement, {
        scale: 2, // High resolution scale factor for crispy fonts
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 816, // Fixed widths and heights to preserve the aspect ratios
        windowHeight: clonedElement.offsetHeight || 1056,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      
      // Initialize jsPDF in letter format (which perfectly maps to the 816x1056 aspect ratio!)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter", // 612pt wide by 792pt high
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const calculatedHeight = imgHeight * ratio;

      let heightLeft = calculatedHeight;
      let position = 0;
      let currentPage = 1;

      // Programmatic helper to inject active clickable links for specific page numbers
      const addLinksForPage = (pageNum: number) => {
        pdfLinksData.forEach((link) => {
          const lX = link.left * 0.75;
          const lY = link.top * 0.75;
          const lW = link.width * 0.75;
          const lH = link.height * 0.75;

          const pageStart = (pageNum - 1) * pdfHeight;
          const pageEnd = pageNum * pdfHeight;

          // If the link falls vertically on this page's section
          if (lY >= pageStart && lY < pageEnd) {
            const yOffset = lY - pageStart;
            pdf.link(lX, yOffset, lW, lH, { url: link.url });
          }
        });
      };

      // Add face page
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, calculatedHeight, undefined, "FAST");
      addLinksForPage(1);
      
      heightLeft -= pdfHeight;

      // Slice subsequent pages of the resume if needed
      while (heightLeft > 0) {
        position = heightLeft - calculatedHeight;
        pdf.addPage();
        currentPage++;
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, calculatedHeight, undefined, "FAST");
        addLinksForPage(currentPage);
        heightLeft -= pdfHeight;
      }

      const fileName = `${resumeData.personalInfo.name.trim().replace(/\s+/g, "_")}_Resume.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF generation error: ", err);
      alert("Failed to export high-fidelity PDF. Please try again.");
    } finally {
      // Clean up the temporary isolated DOM tree
      if (document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
      setDownloading(false);
    }
  };

  // Style helper based on active color theme
  const themeColorClass = resumeData.themeColor;

  return (
    <div className="flex flex-col h-full bg-slate-100 font-sans" id="resume-preview-panel">
      {/* Interactive Control Header */}
      <div className="px-6 py-4.5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-sm relative z-10">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Document Preview</h2>
          <span className="text-[11px] font-sans font-medium text-slate-400 mt-0.5 block">Updates instantly as you edit</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200 text-slate-500 shadow-inner">
            <button 
              onClick={() => setZoomLevel(Math.max(0.6, zoomLevel - 0.1))} 
              className="p-1 hover:text-indigo-650 hover:bg-slate-200/50 rounded transition-all cursor-pointer"
              title="Zoom out preview"
            >
              <ZoomOut className="h-3 w-3" />
            </button>
            <span className="text-[11px] font-semibold px-2.5 text-slate-600 font-sans min-w-[42px] text-center">{Math.round(zoomLevel * 100)}%</span>
            <button 
              onClick={() => setZoomLevel(Math.min(1.2, zoomLevel + 0.1))} 
              className="p-1 hover:text-indigo-650 hover:bg-slate-200/50 rounded transition-all cursor-pointer"
              title="Zoom in preview"
            >
              <ZoomIn className="h-3 w-3" />
            </button>
          </div>
 
          <button
            onClick={exportPDF}
            disabled={downloading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 text-white shadow-md shadow-indigo-100 cursor-pointer ${
              downloading 
                ? "bg-slate-400" 
                : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200"
            }`}
          >
            {downloading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-200" />
                <span>Exporting PDF...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
 
      {/* Document stage with scroll and dynamic zoom scaling */}
      <div className="flex-1 overflow-auto p-8 flex justify-center bg-slate-100/70">
        <div 
          className="transition-all duration-150 origin-top shadow-2xl shadow-slate-200/50"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Printable Resume Container matching standard US Letter details */}
          <div 
            id="resume-printable-document"
            ref={resumeRef}
            className="w-[816px] min-h-[1056px] bg-white text-slate-900 font-sans p-12 relative shadow-2xl rounded text-left flex flex-col justify-between pdf-container select-text"
          >
            <div className="space-y-6">
              {/* BRAND TEMPLATE RENDERER */}
              {/* 1. MODERN PROFESSIONAL TEMPLATE */}
              {resumeData.layoutTemplate === "modern" && (
                <div className="space-y-6">
                  {/* Modern Header: Two columns */}
                  <div className="flex justify-between items-start border-b-2 pb-5" style={{ borderColor: themeColorClass }}>
                    <div>
                      <h1 className="text-3xl font-display font-medium tracking-tight text-slate-900 leading-none">
                        {resumeData.personalInfo.name || "Alex Mercer"}
                      </h1>
                      <p className="text-sm font-sans font-medium uppercase mt-2 font-mono tracking-widest" style={{ color: themeColorClass }}>
                        {resumeData.personalInfo.jobTitle || "Lead Systems Architect"}
                      </p>
                    </div>
                    {/* Contacts block utilizing a robust table structure to prevent alignment shifting in html2canvas */}
                    <table className="text-[11px] text-slate-650 font-sans ml-auto border-separate border-spacing-y-1">
                      <tbody>
                        {resumeData.personalInfo.email && (
                          <tr>
                            <td className="text-right pr-2 select-text font-normal text-slate-600">
                              <a href={`mailto:${resumeData.personalInfo.email}`} className="hover:underline">
                                {resumeData.personalInfo.email}
                              </a>
                            </td>
                            <td className="align-middle w-4 text-slate-400 pl-1 text-right">
                              <Mail className="h-3.5 w-3.5 inline-block" />
                            </td>
                          </tr>
                        )}
                        {resumeData.personalInfo.phone && (
                          <tr>
                            <td className="text-right pr-2 select-text font-normal text-slate-600">
                              {resumeData.personalInfo.phone}
                            </td>
                            <td className="align-middle w-4 text-slate-400 pl-1 text-right">
                              <Phone className="h-3.5 w-3.5 inline-block" />
                            </td>
                          </tr>
                        )}
                        {resumeData.personalInfo.location && (
                          <tr>
                            <td className="text-right pr-2 select-text font-normal text-slate-600">
                              {resumeData.personalInfo.location}
                            </td>
                            <td className="align-middle w-4 text-slate-400 pl-1 text-right">
                              <MapPin className="h-3.5 w-3.5 inline-block" />
                            </td>
                          </tr>
                        )}
                        {resumeData.personalInfo.linkedin && (
                          <tr>
                            <td className="text-right pr-2 select-text font-normal">
                              <a 
                                href={resumeData.personalInfo.linkedin.startsWith("http") ? resumeData.personalInfo.linkedin : `https://${resumeData.personalInfo.linkedin}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline cursor-pointer font-medium"
                                data-pdf-link-url={resumeData.personalInfo.linkedin.startsWith("http") ? resumeData.personalInfo.linkedin : `https://${resumeData.personalInfo.linkedin}`}
                              >
                                {resumeData.personalInfo.linkedin}
                              </a>
                            </td>
                            <td className="align-middle w-4 text-indigo-500 pl-1 text-right">
                              <Linkedin className="h-3.5 w-3.5 inline-block" />
                            </td>
                          </tr>
                        )}
                        {resumeData.personalInfo.portfolio && (
                          <tr>
                            <td className="text-right pr-2 select-text font-normal">
                              <a 
                                href={resumeData.personalInfo.portfolio.startsWith("http") ? resumeData.personalInfo.portfolio : `https://${resumeData.personalInfo.portfolio}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline cursor-pointer font-medium"
                                data-pdf-link-url={resumeData.personalInfo.portfolio.startsWith("http") ? resumeData.personalInfo.portfolio : `https://${resumeData.personalInfo.portfolio}`}
                              >
                                {resumeData.personalInfo.portfolio}
                              </a>
                            </td>
                            <td className="align-middle w-4 text-indigo-500 pl-1 text-right">
                              <Globe className="h-3.5 w-3.5 inline-block" />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Segment */}
                  {resumeData.summary && (
                    <div className="space-y-1.5">
                      <p className="text-[12px] text-slate-700 leading-relaxed font-sans">{resumeData.summary}</p>
                    </div>
                  )}

                  {/* Experience Section */}
                  {resumeData.workExperience.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xs font-bold font-mono tracking-wider uppercase border-b border-slate-200 pb-1" style={{ color: themeColorClass }}>
                        Professional Work History
                      </h2>
                      <div className="space-y-4.5">
                        {resumeData.workExperience.map((item) => (
                          <div key={item.id} className="space-y-1 page-break-avoid">
                            <div className="flex justify-between items-baseline">
                              <h3 className="text-xs.5 font-bold text-slate-850">
                                {item.role} <span className="font-normal text-slate-400">@</span> <span className="text-slate-800 font-semibold">{item.company}</span>
                              </h3>
                              <span className="text-[10px] font-mono font-medium text-slate-500">
                                {item.startDate} — {item.current ? "Present" : item.endDate}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 italic font-medium">{item.location}</p>
                            
                            <ul className="list-none space-y-1 pt-1">
                              {parseBullets(item.description).map((bullet, bIdx) => (
                                <li key={bIdx} className="text-[11px] text-slate-700 font-sans leading-relaxed flex items-start gap-1.5 pl-1.5">
                                  <span className="text-[12px] select-none leading-none pt-0.5" style={{ color: themeColorClass }}>•</span>
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education Program */}
                  {resumeData.education.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-bold font-mono tracking-wider uppercase border-b border-slate-200 pb-1" style={{ color: themeColorClass }}>
                        Academic Background
                      </h2>
                      <div className="space-y-3">
                        {resumeData.education.map((edu) => (
                          <div key={edu.id} className="space-y-0.5">
                            <div className="flex justify-between items-baseline">
                              <h3 className="text-xs.5 font-bold text-slate-800">
                                {edu.degree} in {edu.fieldOfStudy}
                              </h3>
                              <span className="text-[10px] font-mono text-slate-500">
                                {edu.startDate} — {edu.endDate}
                              </span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                              <span>{edu.school}</span>
                              {edu.gpa && <span className="font-mono text-[10px] text-slate-550">{edu.gpa}</span>}
                            </div>
                            {edu.description && (
                              <p className="text-[10px] text-slate-500 font-sans pt-0.5 leading-relaxed">{edu.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Special Projects Block */}
                  {resumeData.projects.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-bold font-mono tracking-wider uppercase border-b border-slate-200 pb-1" style={{ color: themeColorClass }}>
                        Key Engineering Projects
                      </h2>
                      <div className="space-y-3">
                        {resumeData.projects.map((proj) => (
                          <div key={proj.id} className="space-y-0.5">
                            <div className="flex justify-between items-baseline">
                              <h3 className="text-xs.5 font-bold text-slate-850">
                                {proj.title}
                              </h3>
                              {proj.link && (
                                <a 
                                  href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-mono hover:underline cursor-pointer truncate max-w-[200px]"
                                  style={{ color: themeColorClass }}
                                  data-pdf-link-url={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`}
                                >
                                  {proj.link}
                                </a>
                              )}
                            </div>
                            {proj.technologies && (
                              <p className="text-[10px] text-slate-500 font-mono font-medium">Stack: {proj.technologies}</p>
                            )}
                            <p className="text-[11px] text-slate-650 pt-0.5 font-sans leading-relaxed">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills Grid */}
                  {resumeData.skills.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-bold font-mono tracking-wider uppercase border-b border-slate-200 pb-1" style={{ color: themeColorClass }}>
                        Expertise & Technical Stack
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        {resumeData.skills.map((skill) => (
                          <div key={skill.id} className="text-left space-y-0.5 text-xs">
                            <span className="font-bold text-[11px] text-slate-800 block uppercase font-mono tracking-wide">{skill.category || "General skills"}</span>
                            <span className="text-[11px] text-slate-650 leading-normal block">{skill.skills || "N/A"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. CLASSIC ACADEMIC TEMPLATE */}
              {resumeData.layoutTemplate === "classic" && (
                <div className="space-y-6 px-4">
                  {/* Centered Name and Contacts */}
                  <div className="text-center space-y-2 border-b border-slate-200 pb-5">
                    <h1 className="text-3xl font-serif tracking-normal text-slate-900 leading-none">
                      {resumeData.personalInfo.name || "Alex Mercer"}
                    </h1>
                    <p className="text-xs italic tracking-wide text-slate-500 uppercase font-sans">
                      {resumeData.personalInfo.jobTitle || "Lead Software Engineer"}
                    </p>
                    
                    {/* Contacts row */}
                    <div className="flex flex-wrap justify-center items-center gap-x-3.5 gap-y-1 text-[11px] text-slate-600 font-sans max-w-xl mx-auto">
                      <span>{resumeData.personalInfo.location || "San Francisco"}</span>
                      {resumeData.personalInfo.email && (
                        <>
                          <span className="text-slate-350">•</span>
                          <a 
                            href={`mailto:${resumeData.personalInfo.email}`} 
                            className="hover:underline select-text"
                            data-pdf-link-url={`mailto:${resumeData.personalInfo.email}`}
                          >
                            {resumeData.personalInfo.email}
                          </a>
                        </>
                      )}
                      {resumeData.personalInfo.phone && (
                        <>
                          <span className="text-slate-350">•</span>
                          <span className="select-text">{resumeData.personalInfo.phone}</span>
                        </>
                      )}
                      {resumeData.personalInfo.linkedin && (
                        <>
                          <span className="text-slate-350">•</span>
                          <a 
                            href={resumeData.personalInfo.linkedin.startsWith("http") ? resumeData.personalInfo.linkedin : `https://${resumeData.personalInfo.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline cursor-pointer font-medium"
                            data-pdf-link-url={resumeData.personalInfo.linkedin.startsWith("http") ? resumeData.personalInfo.linkedin : `https://${resumeData.personalInfo.linkedin}`}
                          >
                            {resumeData.personalInfo.linkedin}
                          </a>
                        </>
                      )}
                      {resumeData.personalInfo.portfolio && (
                        <>
                          <span className="text-slate-350">•</span>
                          <a 
                            href={resumeData.personalInfo.portfolio.startsWith("http") ? resumeData.personalInfo.portfolio : `https://${resumeData.personalInfo.portfolio}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline cursor-pointer font-medium"
                            data-pdf-link-url={resumeData.personalInfo.portfolio.startsWith("http") ? resumeData.personalInfo.portfolio : `https://${resumeData.personalInfo.portfolio}`}
                          >
                            {resumeData.personalInfo.portfolio}
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Professional Summary */}
                  {resumeData.summary && (
                    <div className="space-y-1 text-center">
                      <p className="text-[11.5px] text-slate-650 leading-relaxed font-serif italic text-justify px-4">
                        {resumeData.summary}
                      </p>
                    </div>
                  )}

                  {/* Corporate Experience */}
                  {resumeData.workExperience.length > 0 && (
                    <div className="space-y-3.5">
                      <h2 className="text-xs font-serif font-bold tracking-wide uppercase border-b border-double border-slate-300 pb-1 text-center" style={{ color: themeColorClass }}>
                        Professional Experience
                      </h2>
                      <div className="space-y-4">
                        {resumeData.workExperience.map((item) => (
                          <div key={item.id} className="space-y-1 text-justify">
                            <div className="flex justify-between items-baseline font-serif">
                              <h3 className="text-xs.5 font-bold text-slate-800">
                                {item.role} — {item.company}
                              </h3>
                              <span className="text-[10px] text-slate-500 italic">
                                {item.startDate} to {item.current ? "Present" : item.endDate}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-sans uppercase tracking-wider">{item.location}</p>
                            
                            <ul className="list-disc list-inside pl-1 space-y-1">
                              {parseBullets(item.description).map((bullet, idx) => (
                                <li key={idx} className="text-[11px] text-slate-650 font-serif leading-relaxed pl-1">
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Academics */}
                  {resumeData.education.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-serif font-bold tracking-wide uppercase border-b border-double border-slate-300 pb-1 text-center" style={{ color: themeColorClass }}>
                        Education
                      </h2>
                      <div className="space-y-2">
                        {resumeData.education.map((edu) => (
                          <div key={edu.id} className="font-serif">
                            <div className="flex justify-between items-baseline">
                              <h3 className="text-xs.5 font-bold text-slate-800">
                                {edu.school}
                              </h3>
                              <span className="text-[10px] italic text-slate-500">
                                {edu.startDate} — {edu.endDate}
                              </span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-600">
                              <span>{edu.degree} in {edu.fieldOfStudy}</span>
                              {edu.gpa && <span className="text-[10.5px]">{edu.gpa}</span>}
                            </div>
                            {edu.description && (
                              <p className="text-[10px] text-slate-500 pt-0.5 leading-relaxed">{edu.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {resumeData.projects.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-serif font-bold tracking-wide uppercase border-b border-double border-slate-300 pb-1 text-center" style={{ color: themeColorClass }}>
                        Signature Achievements & Projects
                      </h2>
                      <div className="space-y-3.5 font-serif">
                        {resumeData.projects.map((proj) => (
                          <div key={proj.id} className="space-y-0.5 text-justify">
                            <div className="flex justify-between items-baseline font-bold space-x-2">
                              <h3 className="text-xs.5 text-slate-800">
                                {proj.title}
                              </h3>
                              {proj.link && (
                                <a 
                                  href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-sans font-medium text-indigo-650 hover:underline truncate max-w-[200px]"
                                  data-pdf-link-url={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`}
                                >
                                  {proj.link}
                                </a>
                              )}
                            </div>
                            {proj.technologies && (
                              <p className="text-[9.5px] text-slate-500 font-sans tracking-wide">Technologies: {proj.technologies}</p>
                            )}
                            <p className="text-[11px] text-slate-650 leading-relaxed font-serif pt-0.5">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills Section */}
                  {resumeData.skills.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-serif font-bold tracking-wide uppercase border-b border-double border-slate-300 pb-1 text-center" style={{ color: themeColorClass }}>
                        Skills & Specialties
                      </h2>
                      <div className="space-y-1.5 font-serif text-[11px] leading-relaxed">
                        {resumeData.skills.map((skill) => (
                          <div key={skill.id} className="grid grid-cols-4 gap-2">
                            <span className="font-bold text-slate-800 col-span-1">{skill.category}</span>
                            <span className="text-slate-650 col-span-3">{skill.skills}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. MINIMALIST SWISS TEMPLATE */}
              {resumeData.layoutTemplate === "minimalist" && (
                <div className="space-y-5 font-mono text-slate-900 leading-snug">
                  {/* High Information Density Layout Header */}
                  <div className="space-y-1 border-b border-slate-900 pb-4">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      {resumeData.personalInfo.name || "Alex Mercer"}
                    </h1>
                    <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: themeColorClass }}>
                      {resumeData.personalInfo.jobTitle}
                    </p>
                    
                    {/* Contacts bar separated by pipeline */}
                    <div className="flex flex-wrap text-[10px] text-slate-500 gap-x-2.5 pt-1.5 font-semibold">
                      {resumeData.personalInfo.email && (
                        <>
                          <a 
                            href={`mailto:${resumeData.personalInfo.email}`} 
                            className="hover:underline"
                            data-pdf-link-url={`mailto:${resumeData.personalInfo.email}`}
                          >
                            E: {resumeData.personalInfo.email}
                          </a>
                          <span>|</span>
                        </>
                      )}
                      {resumeData.personalInfo.phone && (
                        <>
                          <span>T: {resumeData.personalInfo.phone}</span>
                          <span>|</span>
                        </>
                      )}
                      {resumeData.personalInfo.location && (
                        <>
                          <span>Loc: {resumeData.personalInfo.location}</span>
                        </>
                      )}
                      {resumeData.personalInfo.linkedin && (
                        <>
                          <span>|</span>
                          <a 
                            href={resumeData.personalInfo.linkedin.startsWith("http") ? resumeData.personalInfo.linkedin : `https://${resumeData.personalInfo.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-700 hover:underline font-bold"
                            data-pdf-link-url={resumeData.personalInfo.linkedin.startsWith("http") ? resumeData.personalInfo.linkedin : `https://${resumeData.personalInfo.linkedin}`}
                          >
                            In: {resumeData.personalInfo.linkedin}
                          </a>
                        </>
                      )}
                      {resumeData.personalInfo.portfolio && (
                        <>
                          <span>|</span>
                          <a 
                            href={resumeData.personalInfo.portfolio.startsWith("http") ? resumeData.personalInfo.portfolio : `https://${resumeData.personalInfo.portfolio}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-700 hover:underline font-bold"
                            data-pdf-link-url={resumeData.personalInfo.portfolio.startsWith("http") ? resumeData.personalInfo.portfolio : `https://${resumeData.personalInfo.portfolio}`}
                          >
                            W: {resumeData.personalInfo.portfolio}
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Abstract summary block */}
                  {resumeData.summary && (
                    <div className="space-y-1 text-xs">
                      <p className="text-[10px] text-slate-600 leading-relaxed font-sans text-justify">
                        {resumeData.summary}
                      </p>
                    </div>
                  )}

                  {/* Chronology experience list */}
                  {resumeData.workExperience.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-900 pb-0.5" style={{ color: themeColorClass }}>
                        // WORK CHRONOLOGY
                      </h2>
                      <div className="space-y-3">
                        {resumeData.workExperience.map((item) => (
                          <div key={item.id} className="space-y-1 text-[11px]">
                            <div className="flex justify-between items-baseline font-bold font-mono">
                              <span>{item.role.toUpperCase()} @ {item.company.toUpperCase()}</span>
                              <span className="text-[9.5px] font-medium text-slate-450 uppercase space-x-1">
                                {item.startDate} [{item.current ? "Present" : item.endDate}]
                              </span>
                            </div>
                            
                            <ul className="list-none space-y-0.5 font-sans pl-1">
                              {parseBullets(item.description).map((bullet, idx) => (
                                <li key={idx} className="text-[10px] text-slate-650 flex items-start gap-1 pb-0.5 leading-snug">
                                  <span className="font-bold shrink-0 text-slate-450">&gt;</span>
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education block */}
                  {resumeData.education.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-900 pb-0.5" style={{ color: themeColorClass }}>
                        // ACADEMICS
                      </h2>
                      <div className="space-y-2">
                        {resumeData.education.map((edu) => (
                          <div key={edu.id} className="text-[11px] font-mono">
                            <div className="flex justify-between items-baseline font-bold">
                              <span>{edu.school.toUpperCase()}</span>
                              <span className="text-[9.5px] font-normal">{edu.startDate} — {edu.endDate}</span>
                            </div>
                            <div className="font-sans text-[10px] text-slate-550 flex justify-between">
                              <span>{edu.degree} in {edu.fieldOfStudy}</span>
                              {edu.gpa && <span>GPA: {edu.gpa}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Engineering Projects */}
                  {resumeData.projects.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-900 pb-0.5" style={{ color: themeColorClass }}>
                        // ENGINEERING LOGS
                      </h2>
                      <div className="space-y-2">
                        {resumeData.projects.map((proj) => (
                          <div key={proj.id} className="text-[11px] font-mono">
                            <div className="flex justify-between items-baseline font-bold">
                              <span>{proj.title.toUpperCase()}</span>
                              {proj.link && (
                                <a 
                                  href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[9.5px] font-normal underline hover:underline cursor-pointer truncate max-w-[200px]"
                                  data-pdf-link-url={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`}
                                >
                                  {proj.link}
                                </a>
                              )}
                            </div>
                            {proj.technologies && (
                              <p className="text-[9px] text-slate-550 italic font-mono uppercase">Stack: {proj.technologies}</p>
                            )}
                            <p className="text-[10px] text-slate-650 pt-0.5 font-sans leading-snug">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills Segment */}
                  {resumeData.skills.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-900 pb-0.5" style={{ color: themeColorClass }}>
                        // SKILLS REGISTRY
                      </h2>
                      <div className="space-y-1 text-[11px] font-mono leading-relaxed">
                        {resumeData.skills.map((skill) => (
                          <div key={skill.id} className="flex gap-2">
                            <span className="font-bold text-slate-700 min-w-[120px] shrink-0">{skill.category.toUpperCase()}:</span>
                            <span className="text-slate-600 font-sans text-[10.5px]">{skill.skills}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Resume Footer: Clean, standardized indicator */}
            <div className="text-center text-[9px] text-slate-400 font-mono border-t pt-4 tracking-normal select-none relative z-10 page-break-avoid">
              DraftCraft AI-Generated Document • Certified ATS & Schema-Compliant Portfolio
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
