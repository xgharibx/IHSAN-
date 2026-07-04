const fs = require("fs");
const p = "src/services/aiTutor.ts";
let c = fs.readFileSync(p, "utf8");
c = c.replace(
  'const getModel = (): string =>\n  (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || "gemini-2.5-flash";',
  'const getModel = (): string =>\n  (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || "gemini-2.0-flash";'
);
fs.writeFileSync(p, c, "utf8");
console.log("Done");
