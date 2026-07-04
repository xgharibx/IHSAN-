// Comprehensive A-Z check script
const fs = require("fs");

console.log("=== أكاديمية الإحسان - A to Z Status ===\n");

// 1. Project structure
console.log("1. PROJECT STRUCTURE:");
const fileCount = {
  pages: fs.readdirSync("src/pages").length,
  components: fs.readdirSync("src/components").length,
  hooks: fs.readdirSync("src/hooks").length,
  services: fs.readdirSync("src/services").length,
  dataFiles: (() => {
    let count = 0;
    for (const w of ["week1", "week2", "week3", "week4", "week5", "week6", "week7", "week8"]) {
      function walk(dir) {
        for (const f of fs.readdirSync(dir, { recursive: true })) {
          if (f.endsWith(".json")) count++;
        }
      }
      walk("src/data/" + w);
    }
    return count;
  })(),
  testFiles: (() => {
    let count = 0;
    function walk(dir) {
      if (!fs.existsSync(dir)) return;
      for (const f of fs.readdirSync(dir, { recursive: true })) {
        if (f.endsWith(".test.ts") || f.endsWith(".test.tsx") || f.endsWith(".spec.ts")) count++;
      }
    }
    walk("src");
    return count;
  })(),
};
for (const [k, v] of Object.entries(fileCount)) {
  console.log("   " + k + ": " + v);
}

// 2. Data layer status
console.log("\n2. DATA LAYER (8 weeks):");
const dataIndex = fs.readFileSync("src/data/index.ts", "utf8");
const weekMatches = (dataIndex.match(/week(\d+)Bundle\s*=\s*buildWeekBundle/g) || []);
console.log("   Bundles defined: " + weekMatches.length + " (expected 8)");
for (let i = 1; i <= 8; i++) {
  const has = dataIndex.includes(`week${i}Bundle`);
  const exported = dataIndex.includes(`export const week${i} = week${i}Bundle`);
  console.log("   week" + i + ": " + (has ? "defined" : "MISSING") + " / " + (exported ? "exported" : "MISSING"));
}

// 3. Each week's content
console.log("\n3. WEEK CONTENT:");
for (let i = 1; i <= 8; i++) {
  const w = "week" + i;
  const courses = fs.readdirSync("src/data/" + w + "/courses").filter(f => f.endsWith(".json")).length;
  let deep = 0;
  function walk(dir) {
    for (const f of fs.readdirSync(dir, { recursive: true })) {
      if (f.match(/^[^.]+\.(deep-explanation\.p[0-9]+\.json|long-summary|concepts|flashcards|activities|study-guide)/)) deep++;
    }
  }
  walk("src/data/" + w);
  const syn = fs.existsSync("src/data/" + w + "/synthesis/week" + i + "-synthesis.json");
  const map = fs.existsSync("src/data/" + w + "/synthesis/cross-course-map.json");
  const idx = fs.existsSync("src/data/" + w + "/week" + i + ".index.json");
  console.log("   " + w + ": " + courses + " base courses, " + deep + " deep files, synthesis=" + (syn ? "Y" : "N") + ", map=" + (map ? "Y" : "N") + ", index=" + (idx ? "Y" : "N"));
}

// 4. Build state
console.log("\n4. BUILD:");
try {
  cp.execSync("npm run build 2>&1 | tail -5", { stdio: "ignore" });
  const distExists = fs.existsSync("dist/index.html");
  console.log("   Build: PASS, dist/index.html exists: " + distExists);
} catch (e) {
  console.log("   Build: FAIL");
}

// 5. TypeCheck
try {
  cp.execSync("npx tsc -b --noEmit 2>&1", { stdio: "ignore" });
  console.log("   TypeCheck: PASS");
} catch (e) {
  console.log("   TypeCheck: FAIL");
}

// 6. Content quality
try {
  const out = cp.execSync("node scripts/audit-content-quality.cjs 2>&1", { stdio: "ignore" }).toString();
  const issueLine = out.split("\n").find(l => l.includes("Total files with issues:"));
  console.log("   Content quality: " + (issueLine || "unknown"));
} catch (e) {
  console.log("   Content quality: FAIL");
}

// 7. Vercel config
console.log("\n5. DEPLOYMENT:");
console.log("   vercel.json exists: " + fs.existsSync("vercel.json"));
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
console.log("   package.json: name=" + pkg.name + " version=" + pkg.version);
console.log("   scripts.build: " + pkg.scripts.build);
console.log("   scripts.start: " + (pkg.scripts.start || "missing"));

// 8. Missing items
console.log("\n6. GAPS:");
const gaps = [];
if (!fs.existsSync("vercel.json")) gaps.push("vercel.json");
if (!fs.existsSync(".vercelignore")) gaps.push(".vercelignore");
if (!fs.existsSync("README.md")) gaps.push("README.md");
if (fileCount.testFiles === 0) gaps.push("Test files (vitest/jest)");
if (fileCount.components < 10) gaps.push("Components under 10");
if (fileCount.pages < 10) gaps.push("Pages under 10");
if (gaps.length === 0) console.log("   None detected.");
else for (const g of gaps) console.log("   - " + g);

console.log("\n7. KNOWN POTENTIAL IMPROVEMENTS:");
console.log("   - Mobile UX: Check overflow on small screens (already use min-h-0 etc.)");
console.log("   - AI tutor streaming: Verify smooth character streaming");
console.log("   - KnowledgeTree: Verify responsive layout");
console.log("   - Accessibility: aria-labels on icons");
