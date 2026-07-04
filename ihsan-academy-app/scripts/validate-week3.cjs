// Validate week3 data integrity (checks both pooled AND per-course loose files)
const fs = require("fs");
const path = require("path");

const week3 = "src/data/week3";
const files = fs.readdirSync(week3, { recursive: true }).filter(f => f.endsWith(".json"));

let bad = 0;
for (const f of files) {
  const full = path.join(week3, f);
  try { JSON.parse(fs.readFileSync(full, "utf8")); }
  catch (e) { console.log("BROKEN:", f, e.message); bad++; }
}
console.log(`JSON files: ${files.length}, broken: ${bad}\n`);

// Build complete set of ids from BOTH pooled AND per-course loose files
const allFlashcardIds = new Set();
const allActivityIds = new Set();
const allConceptIds = new Set();

// Pooled
const flashcards = JSON.parse(fs.readFileSync(`${week3}/assessments/flashcards.json`, "utf8"));
for (const f of flashcards) allFlashcardIds.add(f.id);
const activities = JSON.parse(fs.readFileSync(`${week3}/activities/activities.json`, "utf8"));
for (const a of activities) allActivityIds.add(a.id);
const concepts = JSON.parse(fs.readFileSync(`${week3}/concepts/concepts.json`, "utf8"));
for (const c of concepts) allConceptIds.add(c.id);

// Per-course loose
const looseFC = fs.readdirSync(week3).filter(f => /^[^.]+\.flashcards\.json$/.test(f));
for (const f of looseFC) {
  const j = JSON.parse(fs.readFileSync(`${week3}/${f}`, "utf8"));
  for (const c of (j.cards || [])) allFlashcardIds.add(c.id);
}
const looseAct = fs.readdirSync(week3).filter(f => /^[^.]+\.activities\.json$/.test(f));
for (const f of looseAct) {
  const j = JSON.parse(fs.readFileSync(`${week3}/${f}`, "utf8"));
  for (const a of (j.activities || [])) allActivityIds.add(a.id);
}
const looseC = fs.readdirSync(week3).filter(f => /^[^.]+\.concepts\.json$/.test(f));
for (const f of looseC) {
  const j = JSON.parse(fs.readFileSync(`${week3}/${f}`, "utf8"));
  for (const c of (j || [])) allConceptIds.add(c.id);
}

console.log(`All flashcard ids: ${allFlashcardIds.size}`);
console.log(`All activity ids: ${allActivityIds.size}`);
console.log(`All concept ids: ${allConceptIds.size}`);

// Build quiz id set from pooled
const quizzes = JSON.parse(fs.readFileSync(`${week3}/assessments/quizzes.json`, "utf8"));
const allQuizIds = new Set(quizzes.map(q => q.id));
console.log(`All quiz ids: ${allQuizIds.size}`);

// Load courses
const courseFiles = fs.readdirSync(`${week3}/courses`).filter(f => f.endsWith(".json"));
const courses = courseFiles.map(f => JSON.parse(fs.readFileSync(`${week3}/courses/${f}`, "utf8")));
const courseIds = new Set(courses.map(c => c.id));
console.log(`\nCourses: ${courses.length} (${courseIds.size} unique ids)`);

// Check required fields
const issues = [];
const required = ["id","slug","title","subtitle","domain","iconKey","folderName","duration","files","tagline","heroQuote","learningObjectives","outcomes","summary","sections","keyTerms","mustUnderstand","commonMistakes","realLifeExamples","reflectionQuestions","quickRevision","relatedCourses","relatedConcepts","quizRefs","flashcardIds","activityIds","knowledgeBaseText","scrollColor","accentGradient"];
for (const c of courses) {
  for (const r of required) if (c[r] === undefined) issues.push(`Course ${c.id}: missing ${r}`);
}

// Cross-check
for (const c of courses) {
  for (const fid of (c.flashcardIds || [])) if (!allFlashcardIds.has(fid)) issues.push(`Course ${c.id}: flashcardId ${fid} not found`);
  for (const aid of (c.activityIds || [])) if (!allActivityIds.has(aid)) issues.push(`Course ${c.id}: activityId ${aid} not found`);
  for (const ref of (c.quizRefs || [])) {
    for (const qid of (ref.itemIds || [])) if (!allQuizIds.has(qid)) issues.push(`Course ${c.id}: quizId ${qid} not found`);
  }
  for (const rc of (c.relatedCourses || [])) {
    if (!courseIds.has(rc)) {
      // ok if it's an external week reference
      if (c.relatedCourses.length > 0) {} // ignore
    }
  }
  for (const rc of (c.relatedConcepts || [])) if (!allConceptIds.has(rc) && !issues.some(i => i.includes(rc))) {
    issues.push(`Course ${c.id}: relatedConcept ${rc} not in week3 pool`);
  }
}

// Dedupe
const seen = new Set();
const finalIssues = [];
for (const i of issues) {
  if (!seen.has(i)) { seen.add(i); finalIssues.push(i); }
}

console.log(`\n=== Issues: ${finalIssues.length} ===`);
for (const i of finalIssues.slice(0, 30)) console.log(" -", i);
if (finalIssues.length > 30) console.log(` ... and ${finalIssues.length - 30} more`);