#!/usr/bin/env node
// ============================================================
// Yemen Educational Marketplace — Data Structure Analyzer
// Run: node scripts/analyzeDataStructure.js
// ============================================================

const fs = require("fs");
const path = require("path");

const DATA_ROOT = path.resolve("D:\\AcademicGauide\\Data");
const OUTPUT_FILE = path.resolve("D:\\AcademicGauide\\scripts\\schema-report.json");

// ============================================================
// Lazy-load xlsx (installed in academic-guide/node_modules)
// ============================================================
// Resolve xlsx from academic-guide node_modules regardless of cwd
const XLSX_PATH = path.resolve(__dirname, "../academic-guide/node_modules/xlsx");
let XLSX;
try {
  XLSX = require(XLSX_PATH);
  console.log("✅ xlsx loaded, version:", XLSX.version);
} catch (e) {
  // Fallback: try standard require
  try {
    XLSX = require("xlsx");
    console.log("✅ xlsx loaded (fallback)");
  } catch (e2) {
    console.error("❌ xlsx not found at:", XLSX_PATH);
    console.error("   Run: npm install xlsx (from academic-guide folder)");
    process.exit(1);
  }
}

// ============================================================
// Helpers
// ============================================================

function getFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if ([".xlsx", ".xls"].includes(ext)) return "excel";
  if ([".docx", ".doc"].includes(ext)) return "word";
  if (ext === ".pdf") return "pdf";
  if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) return "image";
  return "other";
}

function readExcelHeaders(filePath) {
  try {
    const workbook = XLSX.readFile(filePath, { sheetRows: 5 });
    const headers = [];
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet["!ref"]) continue;
      const range = XLSX.utils.decode_range(sheet["!ref"]);
      for (let row = range.s.r; row <= Math.min(range.e.r, 4); row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = sheet[cellAddr];
          if (cell && cell.v && typeof cell.v === "string" && cell.v.trim()) {
            const h = cell.v.trim();
            if (!headers.includes(h)) headers.push(h);
          }
        }
      }
    }
    return headers;
  } catch (e) {
    return ["ERROR: " + e.message];
  }
}

function readExcelAllRows(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const result = {};
    for (const sheetName of workbook.SheetNames) {
      result[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
        defval: "",
      });
    }
    return result;
  } catch (e) {
    return { error: e.message };
  }
}

function scanDir(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const files = [], subdirs = [];
    for (const e of entries) {
      const fp = path.join(dirPath, e.name);
      if (e.isDirectory()) subdirs.push(fp);
      else files.push(fp);
    }
    return { files, subdirs };
  } catch (e) {
    return { files: [], subdirs: [] };
  }
}

const DEGREE_KEYS = {
  بكالوريوس: "bachelor",
  ماجستير: "master",
  دكتوراه: "phd",
  دبلوم: "diploma",
  شهادة: "certificate",
  دورة: "course",
};

function detectLevel(name) {
  for (const [k, v] of Object.entries(DEGREE_KEYS)) {
    if (name.includes(k)) return v;
  }
  return "other";
}

// ============================================================
// Main Scan
// ============================================================

const report = {
  generatedAt: new Date().toISOString(),
  dataRoot: DATA_ROOT,
  institutions: [],
  totalPrograms: 0,
  allExcelHeaders: {},
  fileTypeSummary: {},
  degreeLevelSummary: {},
  recommendations: {},
};

const headerFreq = {};
const allHeaders = [];

function recordHeader(h) {
  headerFreq[h] = (headerFreq[h] || 0) + 1;
  if (!allHeaders.includes(h)) allHeaders.push(h);
}

function recordFileType(ft) {
  report.fileTypeSummary[ft] = (report.fileTypeSummary[ft] || 0) + 1;
}

function scanProgramDir(dirPath) {
  const { files, subdirs } = scanDir(dirPath);
  const programFiles = [];
  const excelData = {};

  for (const f of files) {
    const ft = getFileType(f);
    recordFileType(ft);
    const finfo = { name: path.basename(f), type: ft, size: fs.statSync(f).size };
    programFiles.push(finfo);
    if (ft === "excel") {
      const headers = readExcelHeaders(f);
      excelData[path.basename(f)] = { headers, rowCount: 0 };
      headers.forEach(recordHeader);
    }
  }

  // Recurse into subdirs (e.g., مرفقات)
  for (const sd of subdirs) {
    const sub = scanProgramDir(sd);
    programFiles.push(...sub.files);
    Object.assign(excelData, sub.excelData);
  }

  return { files: programFiles, excelData };
}

// ============================================================
// Institution Loop
// ============================================================

const { subdirs: instDirs } = scanDir(DATA_ROOT);

for (const instDir of instDirs) {
  const instName = path.basename(instDir);
  console.log("\n🏛️  Institution: " + instName);

  const inst = {
    name: instName,
    folderPath: path.relative(DATA_ROOT, instDir),
    degreeLevels: [],
    rootFiles: [],
    rootExcelHeaders: {},
  };

  const { files: rootFiles, subdirs: rootSubdirs } = scanDir(instDir);

  // Root-level files (Excel, PDFs directly in institution folder)
  for (const f of rootFiles) {
    const ft = getFileType(f);
    recordFileType(ft);
    inst.rootFiles.push({ name: path.basename(f), type: ft, size: fs.statSync(f).size });
    if (ft === "excel") {
      const headers = readExcelHeaders(f);
      inst.rootExcelHeaders[path.basename(f)] = headers;
      headers.forEach(recordHeader);
      console.log("  📊 Excel: " + path.basename(f));
      console.log("     Headers (" + headers.length + "): " + headers.slice(0, 8).join(" | "));
    }
  }

  // Subdirectories
  for (const subdir of rootSubdirs) {
    const subName = path.basename(subdir);
    const level = detectLevel(subName);

    if (level !== "other") {
      // Degree level folder (بكالوريوس / ماجستير / دبلوم)
      console.log("  📚 Level: " + subName + " → " + level);
      const dlEntry = { level, nameAr: subName, programs: [] };

      const { files: lvlFiles, subdirs: lvlSubs } = scanDir(subdir);

      // Level-root files
      for (const f of lvlFiles) {
        const ft = getFileType(f);
        recordFileType(ft);
        if (ft === "excel") {
          const headers = readExcelHeaders(f);
          headers.forEach(recordHeader);
          console.log("    📊 " + path.basename(f) + " headers: " + headers.slice(0, 5).join(", "));
        }
      }

      // Sub-subdirectories (could be faculties or programs)
      for (const sub2 of lvlSubs) {
        const sub2Name = path.basename(sub2);
        const { files: sub2Files, subdirs: sub2Subs } = scanDir(sub2);

        if (sub2Subs.length > 0) {
          // Faculty folder containing program folders
          console.log("    🏫 Faculty: " + sub2Name + " (" + sub2Subs.length + " programs)");
          for (const pd of sub2Subs) {
            const pname = path.basename(pd);
            const { files: pFiles, excelData } = scanProgramDir(pd);
            const prog = {
              name: pname,
              faculty: sub2Name,
              files: pFiles,
              excelHeaders: excelData,
            };
            const fileTypes = [...new Set(pFiles.map((f) => f.type))];
            console.log("      📖 " + pname + " [" + fileTypes.join(", ") + "]");
            dlEntry.programs.push(prog);
            report.totalPrograms++;
          }
        } else {
          // Program folder directly
          const { files: pFiles, excelData } = scanProgramDir(sub2);
          const allFiles = [...pFiles, ...sub2Files.map((f) => ({
            name: path.basename(f), type: getFileType(f), size: fs.statSync(f).size
          }))];
          if (allFiles.length > 0 || sub2Files.length > 0) {
            const prog = { name: sub2Name, files: allFiles, excelHeaders: excelData };
            const fileTypes = [...new Set(allFiles.map((f) => f.type))];
            console.log("    📖 Program: " + sub2Name + " [" + fileTypes.join(", ") + "]");
            dlEntry.programs.push(prog);
            report.totalPrograms++;
          }
        }
      }

      inst.degreeLevels.push(dlEntry);
      report.degreeLevelSummary[level] =
        (report.degreeLevelSummary[level] || 0) + dlEntry.programs.length;
    } else {
      // Other subfolder (مرفقات, الخطط الدراسية, etc.)
      console.log("  📁 Subfolder: " + subName);
      const { files: subFiles } = scanDir(subdir);
      for (const f of subFiles) {
        const ft = getFileType(f);
        recordFileType(ft);
        inst.rootFiles.push({ name: path.basename(f), type: ft, size: fs.statSync(f).size });
        if (ft === "excel") {
          const headers = readExcelHeaders(f);
          inst.rootExcelHeaders[path.basename(f)] = headers;
          headers.forEach(recordHeader);
        }
      }
    }
  }

  report.institutions.push(inst);
}

// ============================================================
// Aggregate Headers
// ============================================================

const consistent = allHeaders.filter((h) => headerFreq[h] >= 2);
const jsonbCandidates = allHeaders.filter((h) => headerFreq[h] === 1);

report.allExcelHeaders = {
  all_unique: allHeaders,
  frequency: headerFreq,
  consistent,
  jsonb_candidates: jsonbCandidates,
};

report.recommendations = {
  core_columns: [
    "اسم البرنامج",
    "الكلية / القسم",
    "المؤسسة",
    "مستوى الدراسة",
    "وصف البرنامج",
    "مدة الدراسة",
    "رسوم الدراسة",
    "متطلبات القبول",
  ],
  jsonb_candidates: jsonbCandidates,
  notes: [
    "إجمالي الأعمدة الفريدة: " + allHeaders.length,
    "أعمدة متسقة (في ملفين أو أكثر): " + consistent.length,
    "مرشحون لـ JSONB (ملف واحد فقط): " + jsonbCandidates.length,
    "ملفات Excel الثابتة → أعمدة في جدول programs",
    "ملفات Word (docx) → حقل description_ar",
    "ملفات PDF → حقل study_plan_pdf_url",
    "ملفات JPG → حقل cover_image_url",
  ],
};

// ============================================================
// Save Report
// ============================================================

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2), "utf-8");

// ============================================================
// Console Summary
// ============================================================

console.log("\n" + "=".repeat(60));
console.log("📈 ANALYSIS COMPLETE");
console.log("=".repeat(60));
console.log("🏛️  Institutions:     " + report.institutions.length);
console.log("📖 Total Programs:    " + report.totalPrograms);
console.log("\n📁 File Types:");
for (const [t, c] of Object.entries(report.fileTypeSummary)) {
  console.log("   " + t.padEnd(12) + "→  " + c);
}
console.log("\n🎓 Degree Levels:");
for (const [l, c] of Object.entries(report.degreeLevelSummary)) {
  console.log("   " + l.padEnd(15) + "→  " + c);
}
console.log("\n📋 Excel Headers Analysis:");
console.log("   Unique headers:      " + allHeaders.length);
console.log("   Consistent (≥2 files): " + consistent.length);
console.log("   JSONB candidates:    " + jsonbCandidates.length);
console.log("\n✅ Consistent headers (will be fixed columns):");
consistent.forEach((h) => console.log("   • " + h + " (in " + headerFreq[h] + " files)"));
console.log("\n💡 JSONB candidates (institution-specific):");
jsonbCandidates.slice(0, 15).forEach((h) => console.log("   - " + h));
if (jsonbCandidates.length > 15) console.log("   ... and " + (jsonbCandidates.length - 15) + " more");
console.log("\n" + "=".repeat(60));
console.log("📄 Report saved → " + OUTPUT_FILE);
console.log("=".repeat(60));
