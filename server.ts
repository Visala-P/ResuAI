import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// AI resume content optimization API endpoint
app.post("/api/ai/enhance", async (req, res) => {
  try {
    const { type, text, jobTitle, context } = req.body;

    if (!text && !jobTitle) {
      return res.status(400).json({ error: "Missing required inputs (text or jobTitle)" });
    }

    const ai = getGeminiClient();
    
    let prompt = "";
    if (type === "summary") {
      prompt = `You are a professional resume writer and ATS optimizer. Rewrite the following raw text or job details into a highly polished, impact-driven, ATS-friendly professional summary.
Keep it between 3 to 4 professional, expressive sentences highlighting accomplishments, expertise, and target roles. Do not include introductory text like "Here is your summary:" or quotes, return ONLY the formatted paragraph itself.

Job Title Reference: ${jobTitle || "Not specified"}
Raw Input: ${text}
Context/Additional details: ${context || "None"}`;
    } else if (type === "experience") {
      prompt = `You are a professional resume writer and ATS optimizer. Rewrite the following job description or bullet list of professional work experience into highly polished, impact-driven, ATS-friendly bullet points.
Start each bullet point with a strong, diverse action verb (e.g., Led, Developed, Optimized, Architected) and structure using the STAR method (Situation, Task, Action, Result) where possible, focusing on quantifiable metrics and outcomes.
Return 3 to 5 bullet points starting with '• ' or formatted on separate lines. Return ONLY the bullet points, with no introductory text like "Here are your optimized bullet points:" or quotes.

Job Title/Role: ${jobTitle || "Not specified"}
Raw Experience Details: ${text}
Context/Company: ${context || "None"}`;
    } else {
      prompt = `Review, proofread and professionally optimize the following resume text to make it polished and impact-driven:
Return ONLY the polished result.
${text}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    const enhancedText = response.text || "";
    return res.json({ success: true, text: enhancedText.trim() });
  } catch (error: any) {
    console.error("AI Optimization failed:", error);
    return res.status(500).json({ 
      error: "Failed to optimize content with AI. Please make sure the GEMINI_API_KEY is configured in the secrets panel." 
    });
  }
});

// App health check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

// Setup Vite Dev Server / Production routing
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite dev server dynamically imported to avoid prod build issues
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Support SPA routing in production
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully operational at http://0.0.0.0:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error("Failed to start the Express and Vite application server:", err);
});
