// Audit script: find problematic patterns in deep content
const fs = require("fs");
const path = require("path");

const problematicPatterns = [
  { name: "line number refs", regex: /\b(?:الأسطر|سطر|سطر\s*\d+|سطر\s*\d+\s*-\s*\d+|السطور\s*\d+)/g },
  { name: "line range in english", regex: /\b(?:line\s+\d+|line\s+\d+-\d+|lines\s+\d+-\d+)/gi },
  { name: "المحاضر says", regex: /(المحاضر\s+(يَقول|يَسأل|يَطلب|يَشير|يَدعو|يَتَساءل|يَستشهد|يَستنبط|يَبدأ|يَفتح|يَختم|يَشرح|يَذكُر|يَرُد|يَقُد|يَرَوي|يَقِف|يَدعو|يَقول|يَذكر|يَشير|يَحكي|يَحكي))/g },
  { name: "المحاضر asked for our attention", regex: /(طلب\s+(منا|من\s+الحاضرين|من\s+الطلاب|انتباهنا|الانتباه|من\s+الجميع|انتباه|من\s+الإنصات))/g },
  { name: "this is important", regex: /(هذا\s+(مهم|مُهم|مُهم\s+جداً|جداً\s+مهم|جوهري|ذو\s+أهمية|أساسي|كبير)|(مهم\s+جداً|مهم\s+جدا|ذو\s+أهمية\s+كبرى|ذو\s+أهمية\s+كبيرة))/g },
  { name: "ذكر المحاضر", regex: /(ذكر\s+المحاضر|يقول\s+المحاضر|يستشهد\s+المحاضر|يشرح\s+المحاضر|يؤكد\s+المحاضر|يشير\s+المحاضر|يبدأ\s+المحاضر|يختم\s+المحاضر|يفتح\s+المحاضر|يسأل\s+المحاضر|يتساءل\s+المحاضر|يطلب\s+المحاضر)/g },
  { name: "المحاضر يشرح", regex: /(المحاضر\s+يَش|المحاضر\s+ش|المحاضر\s+يَضرب|المحاضر\s+يَستعرِض|المحاضر\s+يَبدأ\s+المحاضرة|المحاضر\s+يَفتح|المحاضر\s+يَختم|المحاضر\s+يَقول|المحاضر\s+يَتَساءل|المحاضر\s+يَستشهد|المحاضر\s+يَستنبط|المحاضر\s+يَرُد|المحاضر\s+يَقص|المحاضر\s+يَضرب\s+مَثَلاً|المحاضر\s+يَستدرك|المحاضر\s+يَنتقل)/g },
  { name: "وبَعد", regex: /(وبَعد\s+هَذا|وبَعدها|وَبَعد\s+ها|وبعد\s+كلمة)/g },
  { name: "speaker asks/tells", regex: /(الكوتش\s+(يَقول|يَطلب|يَسأل|يَذكر|يَشرح|يَضرب|يَستشهد)|الدكتور\s+(يَقول|يَطلب|يَسأل|يَذكر|يَشرح|يَضرب|يَستشهد))/g },
];

const allFiles = [];
const baseDir = "src/data";
for (const week of ["week1", "week2", "week3", "week4", "week5", "week6", "week7", "week8"]) {
  const weekDir = `${baseDir}/${week}`;
  if (!fs.existsSync(weekDir)) continue;
  for (const f of fs.readdirSync(weekDir, { recursive: true })) {
    if (f.endsWith(".json")) allFiles.push(`${weekDir}/${f}`);
  }
  for (const sub of ["courses", "assessments", "activities", "concepts", "synthesis"]) {
    const subDir = `${weekDir}/${sub}`;
    if (fs.existsSync(subDir)) {
      for (const f of fs.readdirSync(subDir, { recursive: true })) {
        if (f.endsWith(".json")) allFiles.push(`${subDir}/${f}`);
      }
    }
  }
  for (const sub of ["courses", "assessments", "activities", "concepts", "synthesis"]) {
    const subDir = `${weekDir}/${sub}`;
    if (fs.existsSync(subDir)) {
      for (const f of fs.readdirSync(subDir, { recursive: true })) {
        if (f.endsWith(".json")) allFiles.push(`${subDir}/${f}`);
      }
    }
  }
}

console.log(`Scanning ${allFiles.length} files...\n`);
const summary = {};
for (const f of allFiles) {
  try {
    const content = fs.readFileSync(f, "utf8");
    for (const { name, regex } of problematicPatterns) {
      const matches = content.match(regex);
      if (matches && matches.length > 0) {
        summary[name] = (summary[name] || { count: 0, files: new Set() });
        summary[name].count += matches.length;
        summary[name].files.add(f);
      }
    }
  } catch (e) {}
}

console.log("=== Pattern counts across all 3 weeks ===");
for (const [name, { count, files }] of Object.entries(summary)) {
  console.log(`  ${name}: ${count} occurrences in ${files.size} files`);
}
console.log(`\nTotal files with issues: ${new Set(Object.values(summary).flatMap(s => [...s.files])).size}`);