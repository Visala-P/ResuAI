var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
import_dotenv.default.config();
var app = (0, import_express.default)();
app.use(import_express.default.json());
var PORT = 3e3;
var aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
    }
    aiClient = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
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
Return 3 to 5 bullet points starting with '\u2022 ' or formatted on separate lines. Return ONLY the bullet points, with no introductory text like "Here are your optimized bullet points:" or quotes.

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
        temperature: 0.7
      }
    });
    const enhancedText = response.text || "";
    return res.json({ success: true, text: enhancedText.trim() });
  } catch (error) {
    console.error("AI Optimization failed:", error);
    return res.status(500).json({
      error: "Failed to optimize content with AI. Please make sure the GEMINI_API_KEY is configured in the secrets panel."
    });
  }
});
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: (/* @__PURE__ */ new Date()).toISOString() });
});
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully operational at http://0.0.0.0:${PORT}`);
  });
}
initServer().catch((err) => {
  console.error("Failed to start the Express and Vite application server:", err);
});
//# sourceMappingURL=server.cjs.map
