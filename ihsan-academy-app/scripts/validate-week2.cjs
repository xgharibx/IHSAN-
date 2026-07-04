// Validate week2 data integrity
const fs = require("fs");
const path = require("path");

const week2 = path.join("src", "data", "week2");
const issues = [];
const summary = { courses: [], flashcards: 0, quizzes: 0, activities: 0, concepts: 0, achievements: 0 };

// 1. Check course JSON files
const courseFiles = fs.readdirSync(path.join(week2, "courses")).filter((f) => f.endsWith(".json"));
for (const f of courseFiles) {
  const c = JSON.parse(fs.readFileSync(path.join(week2, "courses", f), "utf8"));
  summary.courses.push({ id: c.id, slug: c.slug, title: c.title, sections: c.sections ? c.sections.length : 0, keyTerms: c.keyTerms ? c.keyTerms.length : 0 });
  const required = ["id","slug","title","subtitle","domain","iconKey","folderName","duration","files","tagline","heroQuote","learningObjectives","outcomes","summary","sections","keyTerms","mustUnderstand","commonMistakes","realLifeExamples","reflectionQuestions","quickRevision","relatedCourses","relatedConcepts","quizRefs","flashcardIds","activityIds","knowledgeBaseText","scrollColor","accentGradient"];
  for (const r of required) {
    if (c[r] === undefined) issues.push("Course " + c.id + ": missing " + r);
  }
}

// 2. Pooled flashcards
const flashcards = JSON.parse(fs.readFileSync(path.join(week2, "assessments", "flashcards.json"), "utf8"));
summary.flashcards = flashcards.length;
const flashIds = new Set();
for (const f of flashcards) {
  if (flashIds.has(f.id)) issues.push("Duplicate flashcard id: " + f.id);
  flashIds.add(f.id);
}

// 3. Quizzes
const quizzes = JSON.parse(fs.readFileSync(path.join(week2, "assessments", "quizzes.json"), "utf8"));
summary.quizzes = quizzes.length;
const quizIds = new Set();
for (const q of quizzes) {
  if (quizIds.has(q.id)) issues.push("Duplicate quiz id: " + q.id);
  quizIds.add(q.id);
  if (!q.options && q.type === "mcq") issues.push("MCQ " + q.id + ": missing options");
}

// 4. Activities
const activities = JSON.parse(fs.readFileSync(path.join(week2, "activities", "activities.json"), "utf8"));
summary.activities = activities.length;
const actIds = new Set();
for (const a of activities) {
  if (actIds.has(a.id)) issues.push("Duplicate activity id: " + a.id);
  actIds.add(a.id);
}

// 5. Concepts
const concepts = JSON.parse(fs.readFileSync(path.join(week2, "concepts", "concepts.json"), "utf8"));
summary.concepts = concepts.length;
const conceptIds = new Set();
for (const c of concepts) {
  if (conceptIds.has(c.id)) issues.push("Duplicate concept id: " + c.id);
  conceptIds.add(c.id);
}

// 6. Cross-check: course.flashcardIds / activityIds / quizRefs all reference real items
const courseIds = new Set(summary.courses.map((c) => c.id));
const realFlashIds = new Set(flashcards.map((f) => f.id));
const realActIds = new Set(activities.map((a) => a.id));
const realQuizIds = new Set(quizzes.map((q) => q.id));
const realConceptIds = new Set(concepts.map((c) => c.id));

for (const c of summary.courses) {
  const full = JSON.parse(fs.readFileSync(path.join(week2, "courses", c.id + ".json"), "utf8"));
  for (const fid of (full.flashcardIds || [])) {
    if (!realFlashIds.has(fid)) issues.push("Course " + c.id + ": flashcardId " + fid + " not found");
  }
  for (const aid of (full.activityIds || [])) {
    if (!realActIds.has(aid)) issues.push("Course " + c.id + ": activityId " + aid + " not found");
  }
  for (const ref of (full.quizRefs || [])) {
    for (const qid of (ref.itemIds || [])) {
      if (!realQuizIds.has(qid)) issues.push("Course " + c.id + ": quizId " + qid + " not found");
    }
  }
  for (const rc of (full.relatedCourses || [])) {
    if (!courseIds.has(rc)) issues.push("Course " + c.id + ": relatedCourse " + rc + " not in week2 pool");
  }
  for (const rc of (full.relatedConcepts || [])) {
    if (!realConceptIds.has(rc)) issues.push("Course " + c.id + ": relatedConcept " + rc + " not in week2 pool");
  }
}

// 7. Achievements
const achievements = JSON.parse(fs.readFileSync(path.join(week2, "achievements.json"), "utf8"));
summary.achievements = achievements.length;

// 8. Synthesis + cross-course-map
const synth = JSON.parse(fs.readFileSync(path.join(week2, "synthesis", "week2-synthesis.json"), "utf8"));
const map = JSON.parse(fs.readFileSync(path.join(week2, "synthesis", "cross-course-map.json"), "utf8"));
for (const n of map.nodes) {
  if (n.type === "course" && !courseIds.has(n.id)) issues.push("Map: course node " + n.id + " not in week2 pool");
  if (n.type === "concept" && !realConceptIds.has(n.id)) issues.push("Map: concept node " + n.id + " not in week2 pool");
}
for (const e of map.edges) {
  const ids = new Set(map.nodes.map((n) => n.id));
  if (!ids.has(e.from)) issues.push("Map: edge from " + e.from + " not found in nodes");
  if (!ids.has(e.to)) issues.push("Map: edge to " + e.to + " not found in nodes");
}

console.log("=== Week 2 Summary ===");
console.log("Courses: " + summary.courses.length);
console.log("Flashcards: " + summary.flashcards);
console.log("Quizzes: " + summary.quizzes);
console.log("Activities: " + summary.activities);
console.log("Concepts: " + summary.concepts);
console.log("Achievements: " + summary.achievements);
console.log("Synthesis messages: " + (synth.keyMessages ? synth.keyMessages.length : 0));
console.log("Synthesis before-next: " + (synth.beforeNextWeek ? synth.beforeNextWeek.length : 0));
console.log("Map nodes: " + (map.nodes ? map.nodes.length : 0));
console.log("Map edges: " + (map.edges ? map.edges.length : 0));
console.log();
console.log("=== Course Detail ===");
for (const c of summary.courses) {
  console.log("- " + c.id + ": " + c.title + " (sections=" + c.sections + ", keyTerms=" + c.keyTerms + ")");
}
console.log();
console.log("=== Issues (" + issues.length + ") ===");
for (const i of issues.slice(0, 50)) console.log(" - " + i);
if (issues.length > 50) console.log(" ... and " + (issues.length - 50) + " more");