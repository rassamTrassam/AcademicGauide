#!/usr/bin/env node
// ============================================================
// Yemen Educational Marketplace — Database Seeder v2
// scripts/seedDatabase.js
//
// Fixes vs v1:
//  • Storage paths now use ASCII-only English slugs
//  • Excel orientation detection is much smarter
//  • --clean flag to remove existing programs before seeding
// ============================================================

"use strict";

const fs   = require("fs");
const path = require("path");

// ── Resolve node_modules from academic-guide ────────────────
const NM = path.resolve(__dirname, "../academic-guide/node_modules");

const { createClient } = require(path.join(NM, "@supabase/supabase-js"));
const XLSX             = require(path.join(NM, "xlsx"));
const mammoth          = require(path.join(NM, "mammoth"));
require(path.join(NM, "dotenv")).config({
  path: path.resolve(__dirname, "../academic-guide/.env.local"),
});

// ── Config ──────────────────────────────────────────────────
const DATA_ROOT    = path.resolve("D:\\AcademicGauide\\Data");
const BUCKET       = "program-assets";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CLEAN_FIRST  = process.argv.includes("--clean");

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Missing SUPABASE env vars. Check .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── ANSI Colors ─────────────────────────────────────────────
const C = {
  reset:  "\x1b[0m",  green:  "\x1b[32m",  yellow: "\x1b[33m",
  red:    "\x1b[31m", cyan:   "\x1b[36m",  blue:   "\x1b[34m",
  bold:   "\x1b[1m",  dim:    "\x1b[2m",   magenta:"\x1b[35m",
};
const ok    = (m) => console.log(`${C.green}  ✅ ${m}${C.reset}`);
const warn  = (m) => console.log(`${C.yellow}  ⚠️  ${m}${C.reset}`);
const err   = (m) => console.log(`${C.red}  ❌ ${m}${C.reset}`);
const info  = (m) => console.log(`${C.cyan}  ℹ️  ${m}${C.reset}`);
const head  = (m) => console.log(`\n${C.bold}${C.blue}${"═".repeat(60)}\n  ${m}\n${"═".repeat(60)}${C.reset}`);
const sub   = (m) => console.log(`${C.bold}${C.magenta}    ▶ ${m}${C.reset}`);

// ── Stats ────────────────────────────────────────────────────
const STATS = { institutions: 0, programs: 0, uploads: 0, errors: [] };
let uploadCounter = 0;

// ── Institution English slug map (for ASCII storage paths) ───
const INST_EN_SLUGS = {
  "الأكاديمية اليمنية للدراسات العليا": "yemen-academy",
  "جامعة العلوم والتكنولوجيا-عدن":      "ust-aden",
  "الجامعة الوطنية-تعز":                "national-univ-taiz",
  "جامعة السعيد":                        "alsaeed-univ",
  "جامعة سبأ":                           "saba-univ",
  "معهد بوابة التكنولوجيا":             "tech-gateway",
  "جامعة تعز":                           "taiz-univ",
};

function instSlug(instName) {
  return INST_EN_SLUGS[instName] || "institution";
}

// ── Generate unique storage path (ASCII-only) ────────────────
function storagePath(instName, ext) {
  uploadCounter++;
  const slug = instSlug(instName);
  const id   = String(uploadCounter).padStart(4, "0");
  return `${slug}/${id}${ext}`;
}

// ── Degree level detection ───────────────────────────────────
const DEGREE_MAP = {
  بكالوريوس: "bachelor", ماجستير: "master",  دكتوراه: "phd",
  دبلوم:     "diploma",  شهادة:   "certificate", دورة: "course",
};
function detectDegree(text) {
  if (!text) return "bachelor";
  for (const [ar, en] of Object.entries(DEGREE_MAP)) {
    if (text.includes(ar)) return en;
  }
  return "bachelor";
}

// ── File helpers ─────────────────────────────────────────────
function getFileType(f) {
  const ext = path.extname(f).toLowerCase();
  if ([".xlsx", ".xls"].includes(ext)) return "excel";
  if ([".docx", ".doc"].includes(ext)) return "word";
  if (ext === ".pdf") return "pdf";
  if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return "image";
  return "other";
}

function listDir(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [], subdirs = [];
    for (const e of entries) {
      const fp = path.join(dir, e.name);
      if (e.isDirectory()) subdirs.push(fp);
      else files.push(fp);
    }
    return { files, subdirs };
  } catch { return { files: [], subdirs: [] }; }
}

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of list) {
      const file = path.join(dir, e.name);
      if (e.isDirectory()) results = results.concat(walk(file));
      else results.push(file);
    }
  } catch (e) {}
  return results;
}

function getMime(f) {
  const ext = path.extname(f).toLowerCase();
  return { ".jpg":"image/jpeg",".jpeg":"image/jpeg",".png":"image/png",
           ".webp":"image/webp",".pdf":"application/pdf" }[ext]
    || "application/octet-stream";
}

// ── Upload file ──────────────────────────────────────────────
async function uploadFile(localPath, sp, mime) {
  try {
    const buffer = fs.readFileSync(localPath);
    const { error } = await supabase.storage.from(BUCKET)
      .upload(sp, buffer, { contentType: mime, upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(sp);
    STATS.uploads++;
    ok(`    ☁  ${path.basename(localPath)} → ${sp}`);
    return data.publicUrl;
  } catch (e) {
    warn(`Upload failed [${path.basename(localPath)}]: ${e.message}`);
    STATS.errors.push({ file: localPath, error: e.message });
    return null;
  }
}

// ── Extract Word text ────────────────────────────────────────
async function extractWordText(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const { value } = await mammoth.extractRawText({ buffer });
    return value.trim().slice(0, 8000) || null;
  } catch (e) {
    warn(`Word read failed [${path.basename(filePath)}]: ${e.message}`);
    return null;
  }
}

// ── Excel reading with smart orientation detection ───────────
//
// Two layouts exist in the data:
//
// ROW-ORIENTED (جامعة سبأ, جامعة تعز, معهد بوابة التكنولوجيا):
//   Row 0: ["اسم التخصص", "مجالات العمل", "الرسوم", ...]  ← headers
//   Row 1: ["اقتصاد",     "تجارة، مالية", "500$",   ...]  ← program 1
//   Row 2: ["قانون",      "محاكم",         "450$",   ...]  ← program 2
//
// COLUMN-ORIENTED (الأكاديمية اليمنية):
//   Col 0: ["اسم التخصص","مجالات العمل","الرسوم",...]  ← field labels
//   Col 1: ["ماجستير إدارة أعمال","العمل الإداري","320$"] ← program 1
//   Col 2: ["ماجستير إدارة مستشفيات", ...]                ← program 2
//
// DETECTION: count field-label strings in row 0 vs column 0.
// Whichever has more field labels determines the orientation.

const FIELD_LABELS = new Set([
  "اسم التخصص","اسم الدورة / البرنامج","اسم البرنامج","اسم الدورة",
  "مجالات العمل المتاحة","الرسوم الدراسية","رسوم الدراسة","المدة الدراسية",
  "مدة الدراسة","شروط الالتحاق","شروط القبول","الوثائق المطلوبة",
  "المصدر","الكلية","القسم","وصفه","الوصف","وصف مختصر","الوصف الكامل",
  "نوع البرنامج (دورة – دبلوم)","التصنيف (برمجة – شبكات – طب – شريعة …)",
  "نمط الدراسة","المدينة أو مقر الدراسة","رقم الدورة (ID)",
  "الكلية أو المركز التابع له البرنامج","نوع الثانوية أو المسار المطلوب",
  "شروط أو متطلبات القبول الأساسية","النوع:(ماجستير، بكالوريوس)",
]);

function readExcelPrograms(filePath, degreeHint) {
  const allPrograms = [];
  try {
    const wb = XLSX.readFile(filePath);
    for (const sheetName of wb.SheetNames) {
      const ws   = wb.Sheets[sheetName];
      if (!ws["!ref"]) continue;
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      if (!rows || rows.length < 2) continue;

      // ── Count field labels in first row vs first column ──────
      const row0 = rows[0].map((v) => String(v || "").trim());
      const col0 = rows.map((r) => String(r[0] || "").trim());
      const row0FieldCount = row0.filter((v) => FIELD_LABELS.has(v)).length;
      const col0FieldCount = col0.filter((v) => FIELD_LABELS.has(v)).length;

      // Column-oriented: column 0 has more field-label strings
      const isColumnOriented = col0FieldCount > row0FieldCount && col0FieldCount >= 2;
      info(`    ${sheetName}: ${isColumnOriented ? "column" : "row"}-oriented `
        + `(col0=${col0FieldCount} labels, row0=${row0FieldCount} labels)`);

      if (isColumnOriented) {
        // Each column from col=1 onwards is one program
        const numCols = Math.max(...rows.map((r) => r.length));
        for (let col = 1; col < numCols; col++) {
          const prog = {};
          let hasContent = false;
          for (let row = 0; row < rows.length; row++) {
            const label = String(rows[row][0] || "").trim();
            const value = String(rows[row][col] || "").trim();
            if (label && value) { prog[label] = value; hasContent = true; }
          }
          if (hasContent) allPrograms.push(prog);
        }
      } else {
        // Row-oriented: row 0 = headers, rows 1+ = programs
        const headers = row0;
        for (let i = 1; i < rows.length; i++) {
          const row  = rows[i];
          const prog = {};
          let hasData = false;
          headers.forEach((h, idx) => {
            const val = String(row[idx] || "").trim();
            if (h && val) { prog[h] = val; hasData = true; }
          });
          if (hasData) allPrograms.push(prog);
        }
      }
    }
  } catch (e) {
    warn(`Excel read failed [${path.basename(filePath)}]: ${e.message}`);
  }
  return allPrograms;
}

// ── Map raw Excel row → DB fields ────────────────────────────
const TITLE_KEYS   = ["اسم التخصص","اسم الدورة / البرنامج","اسم البرنامج","اسم الدورة / البرنامج"];
const FACULTY_KEYS = ["الكلية أو المركز التابع له البرنامج","الكلية","القسم"];
const DESC_KEYS    = ["وصف مختصر","الوصف الكامل","وصفه","الوصف"];
const FEES_KEYS    = ["الرسوم الدراسية","رسوم الدراسة"];
const DUR_KEYS     = ["المدة الدراسية","مدة الدراسة"];
const ADMIT_KEYS   = ["شروط الالتحاق","شروط أو متطلبات القبول الأساسية","شروط القبول"];
const DOCS_KEYS    = ["الوثائق المطلوبة"];
const JOBS_KEYS    = ["مجالات العمل المتاحة"];
const STYLE_KEYS   = ["نمط الدراسة","نوع البرنامج (دورة – دبلوم)"];
const CITY_KEYS    = ["المدينة أو مقر الدراسة","المعهد"];

function findVal(obj, keys) {
  for (const k of keys) {
    if (obj[k] !== undefined) {
      const v = String(obj[k]).trim();
      if (v) return v;
    }
  }
  return null;
}

// Minimum title length to be considered a real program name
const MIN_TITLE_LEN = 4;

function mapExcelToProgram(raw, degreeHint) {
  const title = findVal(raw, TITLE_KEYS);
  if (!title || title.length < MIN_TITLE_LEN) return null;

  // Skip rows that are clearly meta-data headers
  if (FIELD_LABELS.has(title)) return null;

  const degree = detectDegree(title + " " + (degreeHint || ""));

  // Build JSONB metadata from remaining fields
  const standardKeys = new Set([
    ...TITLE_KEYS, ...FACULTY_KEYS, ...DESC_KEYS,
    ...FEES_KEYS, ...DUR_KEYS, ...ADMIT_KEYS,
    ...DOCS_KEYS, ...JOBS_KEYS, ...STYLE_KEYS, ...CITY_KEYS,
  ]);
  const metadata = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!standardKeys.has(k) && v && String(v).trim()) {
      metadata[k] = String(v).trim();
    }
  }

  return {
    title_ar:       title,
    degree_level:   degree,
    faculty_ar:     findVal(raw, FACULTY_KEYS),
    description_ar: findVal(raw, DESC_KEYS),
    metadata: {
      fees_raw:               findVal(raw, FEES_KEYS),
      duration_raw:           findVal(raw, DUR_KEYS),
      admission_requirements: findVal(raw, ADMIT_KEYS),
      required_documents:     findVal(raw, DOCS_KEYS),
      career_opportunities:   findVal(raw, JOBS_KEYS),
      study_style:            findVal(raw, STYLE_KEYS),
      city:                   findVal(raw, CITY_KEYS),
      ...metadata,
    },
  };
}

// ── Insert program ───────────────────────────────────────────
async function insertProgram(programData) {
  // Clean up nulls in metadata
  if (programData.metadata) {
    for (const k of Object.keys(programData.metadata)) {
      if (!programData.metadata[k]) delete programData.metadata[k];
    }
  }
  const { error } = await supabase.from("programs").insert(programData);
  if (error) {
    if (error.code === "23505") {
      warn(`Duplicate: ${programData.title_ar} — skipping`);
    } else {
      err(`Insert failed [${programData.title_ar}]: ${error.message}`);
      STATS.errors.push({ program: programData.title_ar, error: error.message });
    }
    return false;
  }
  STATS.programs++;
  return true;
}

// ── Get institution DB id ────────────────────────────────────
async function getInstitutionId(nameAr) {
  const { data, error } = await supabase
    .from("institutions").select("id").eq("name_ar", nameAr).single();
  if (!error && data) return data.id;

  const { data: ins, error: ie } = await supabase
    .from("institutions")
    .insert({ name_ar: nameAr, slug: instSlug(nameAr), type: "university", is_active: true })
    .select("id").single();
  if (ie) { err(`Insert institution failed: ${ie.message}`); return null; }
  return ins.id;
}

// ══════════════════════════════════════════════════════════════
// INSTITUTION PROCESSORS
// ══════════════════════════════════════════════════════════════

// TYPE A — Root-level Excel files (الأكاديمية, سبأ, بوابة التكنولوجيا)
async function processRootExcels(instDir, instName, instId) {
  const { files, subdirs } = listDir(instDir);
  const excelFiles = files.filter((f) => getFileType(f) === "excel");
  const wordFiles  = files.filter((f) => getFileType(f) === "word");
  const imgFiles   = files.filter((f) => getFileType(f) === "image");

  // Pre-extract Word descriptions (for معهد بوابة التكنولوجيا)
  const wordDescMap = {};
  for (const wf of wordFiles) {
    const text = await extractWordText(wf);
    if (text) wordDescMap[path.basename(wf, path.extname(wf))] = text;
  }

  // Upload institution-level image
  let rootCoverUrl = null;
  if (imgFiles.length > 0) {
    const sp = storagePath(instName, path.extname(imgFiles[0]));
    rootCoverUrl = await uploadFile(imgFiles[0], sp, getMime(imgFiles[0]));
  }

  for (const excelFile of excelFiles) {
    info(`  Reading Excel: ${path.basename(excelFile)}`);
    const degreeHint   = detectDegree(path.basename(excelFile));
    const rawPrograms  = readExcelPrograms(excelFile, degreeHint);
    info(`  → ${rawPrograms.length} rows extracted`);

    for (const raw of rawPrograms) {
      const mapped = mapExcelToProgram(raw, degreeHint);
      if (!mapped) continue;

      // Match word description by title
      const descMatch = Object.entries(wordDescMap).find(([k]) =>
        mapped.title_ar.includes(k.slice(0, 4)) || k.includes(mapped.title_ar.slice(0, 4))
      );

      const inserted = await insertProgram({
        institution_id: instId,
        title_ar:        mapped.title_ar,
        degree_level:    mapped.degree_level,
        faculty_ar:      mapped.faculty_ar,
        description_ar:  mapped.description_ar || (descMatch ? descMatch[1] : null),
        cover_image_url: rootCoverUrl,
        status:          "active",
        metadata:        mapped.metadata,
      });
      if (inserted) ok(`    ✔ ${mapped.title_ar} [${mapped.degree_level}]`);
    }
  }

  // Process course-specific subfolders (معهد: each course has its own folder)
  for (const subdir of subdirs) {
    const subName = path.basename(subdir);
    const { files: sf } = listDir(subdir);
    const docx = sf.find((f) => getFileType(f) === "word");
    const img  = sf.find((f) => getFileType(f) === "image");
    if (!docx && !img) continue;

    const text   = docx ? await extractWordText(docx) : null;
    let imgUrl   = null;
    if (img) {
      const sp = storagePath(instName, path.extname(img));
      imgUrl   = await uploadFile(img, sp, getMime(img));
    }

    const inserted = await insertProgram({
      institution_id: instId,
      title_ar:       subName,
      degree_level:   detectDegree(subName) === "bachelor" ? "course" : detectDegree(subName),
      description_ar: text,
      cover_image_url: imgUrl,
      status:         "active",
      metadata:       { source_folder: subName },
    });
    if (inserted) ok(`    ✔ ${subName} (folder)`);
  }
}

// TYPE B — Nested degree folders → faculty → program folders (جامعة العلوم والتكنولوجيا)
async function processNestedFolders(instDir, instName, instId) {
  const { subdirs: degreeDirs } = listDir(instDir);
  for (const degreeDir of degreeDirs) {
    const degreeName = path.basename(degreeDir);
    const degree     = detectDegree(degreeName);
    info(`  Level: ${degreeName} → ${degree}`);
    const { subdirs: lvl2 } = listDir(degreeDir);

    for (const dir2 of lvl2) {
      const { files: topFiles, subdirs: programDirs } = listDir(dir2);
      const dir2Name = path.basename(dir2);

      if (programDirs.length > 0) {
        // It's a faculty folder
        for (const pd of programDirs) {
          await processProgramFolder(pd, instName, instId, degree, dir2Name);
        }
      } else if (topFiles.length > 0) {
        await processProgramFolder(dir2, instName, instId, degree, null);
      }
    }
  }
}

// TYPE C — Degree folders with Docx per program (الجامعة الوطنية)
async function processNationalUniv(instDir, instName, instId) {
  // Pre-load word descriptions to merge with Excel records
  const allFiles = walk(instDir);
  const wordFiles = allFiles.filter(f => f.endsWith('.docx') || f.endsWith('.doc'));
  const wordDescMap = {};
  
  for (const wf of wordFiles) {
    const text = await extractWordText(wf);
    if (text) {
      let title = path.basename(wf, path.extname(wf)).replace(/_/g, " ").trim();
      title = title.replace(/^بكالوريوس\s+/,"").replace(/^ماجستير\s+/,"").trim() || title;
      wordDescMap[title] = text;
    }
  }

  // Process Excel files (study plans) and merge with descriptions
  const excelFiles = allFiles.filter(f => f.endsWith('.xlsx'));
  
  for (const excelFile of excelFiles) {
    const fileName = path.basename(excelFile, '.xlsx');
    let title = fileName.replace(/الخطة الدراسية لبرنامج\s*/g, '').replace(/الجامعة الوطنية.*/g, '').trim();
    if (title.length < MIN_TITLE_LEN) continue;

    const degreeHint = detectDegree(title);
    title = title.replace(/^بكالوريوس\s+/,"").replace(/^ماجستير\s+/,"").trim() || title;

    const sp = storagePath(instName, ".xlsx");
    const planUrl = await uploadFile(excelFile, sp, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    // Find best matching description
    let bestDesc = null;
    const match = Object.entries(wordDescMap).find(([k]) => title.includes(k.slice(0, 5)) || k.includes(title.slice(0, 5)));
    if (match) {
      bestDesc = match[1];
      delete wordDescMap[match[0]]; // Mark as used
    }

    const inserted = await insertProgram({
      institution_id: instId,
      title_ar: title,
      degree_level: degreeHint,
      study_plan_pdf_url: planUrl,
      description_ar: bestDesc,
      status: "active",
      metadata: { source_file: path.basename(excelFile) },
    });
    if (inserted) ok(`    ✔ ${title}`);
  }

  // Process any remaining Word files that didn't have a matching Excel plan
  for (const [title, text] of Object.entries(wordDescMap)) {
    if (title.length < MIN_TITLE_LEN) continue;
    
    const degreeHint = detectDegree(title);
    const inserted = await insertProgram({
      institution_id: instId,
      title_ar: title,
      degree_level: degreeHint,
      description_ar: text,
      status: "active",
      metadata: { source: "word_only" },
    });
    if (inserted) ok(`    ✔ ${title} (Word only)`);
  }
}

// TYPE D — PDF files only (جامعة السعيد)
async function processPdfOnly(instDir, instName, instId) {
  const { files } = listDir(instDir);
  const pdfs = files.filter((f) => getFileType(f) === "pdf");
  for (const pdf of pdfs) {
    const rawTitle = path.basename(pdf, ".pdf").replace(/_/g, " ").trim();
    if (rawTitle.length < MIN_TITLE_LEN) continue;

    const sp     = storagePath(instName, ".pdf");
    const pdfUrl = await uploadFile(pdf, sp, "application/pdf");

    const inserted = await insertProgram({
      institution_id:    instId,
      title_ar:          rawTitle,
      degree_level:      detectDegree(rawTitle),
      study_plan_pdf_url: pdfUrl,
      status:            "active",
      metadata:          { source_file: path.basename(pdf) },
    });
    if (inserted) ok(`    ✔ ${rawTitle}`);
  }
}

// TYPE E — Single large Excel (جامعة تعز)
async function processTaizUniversity(instDir, instName, instId) {
  const { files, subdirs } = listDir(instDir);
  const excelFile = files.find((f) => getFileType(f) === "excel");

  // Upload shared PDF from مرفقات subfolder
  let sharedPdfUrl = null;
  for (const sub of subdirs) {
    const { files: sf } = listDir(sub);
    const pdf = sf.find((f) => getFileType(f) === "pdf");
    if (pdf) {
      const sp     = storagePath(instName, ".pdf");
      sharedPdfUrl = await uploadFile(pdf, sp, "application/pdf");
      if (sharedPdfUrl) ok(`  Uploaded shared study plan PDF`);
    }
  }

  if (!excelFile) { warn("No Excel found for جامعة تعز"); return; }

  info(`  Reading Excel: ${path.basename(excelFile)}`);
  const rawPrograms = readExcelPrograms(excelFile, "bachelor");
  info(`  → ${rawPrograms.length} rows extracted`);

  for (const raw of rawPrograms) {
    const mapped = mapExcelToProgram(raw, "bachelor");
    if (!mapped) continue;

    const inserted = await insertProgram({
      institution_id:    instId,
      title_ar:          mapped.title_ar,
      degree_level:      mapped.degree_level,
      faculty_ar:        mapped.faculty_ar,
      description_ar:    mapped.description_ar,
      study_plan_pdf_url: sharedPdfUrl,
      status:            "active",
      metadata:          mapped.metadata,
    });
    if (inserted) ok(`    ✔ ${mapped.title_ar}`);
  }
}

// ── Process a single program folder ─────────────────────────
async function processProgramFolder(progDir, instName, instId, degree, facultyName) {
  const progName = path.basename(progDir);
  const { files } = listDir(progDir);
  sub(`${progName}`);

  let coverUrl    = null;
  let pdfUrl      = null;
  let description = null;

  for (const f of files) {
    const ft = getFileType(f);
    if (ft === "image" && !coverUrl) {
      const sp = storagePath(instName, path.extname(f));
      coverUrl = await uploadFile(f, sp, getMime(f));
    }
    if (ft === "pdf" && !pdfUrl) {
      const sp = storagePath(instName, ".pdf");
      pdfUrl   = await uploadFile(f, sp, "application/pdf");
    }
    if (ft === "word" && !description) {
      // Prefer files with "عن" or "وصف" in name for descriptions
      const fname = path.basename(f).toLowerCase();
      if (fname.includes("عن") || fname.includes("وصف") || fname.includes("نبذة") || !description) {
        description = await extractWordText(f);
      }
    }
  }

  const inserted = await insertProgram({
    institution_id:    instId,
    title_ar:          progName.replace(/^بكالوريوس\s+/,"").replace(/^ماجستير\s+/,"") || progName,
    degree_level:      degree,
    faculty_ar:        facultyName,
    description_ar:    description,
    cover_image_url:   coverUrl,
    study_plan_pdf_url: pdfUrl,
    status:            "active",
    metadata: {
      original_folder: progName,
      faculty:         facultyName,
    },
  });
  if (inserted) ok(`    ✔ ${progName} [${degree}]`);
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

const PROCESSORS = {
  "الأكاديمية اليمنية للدراسات العليا": processRootExcels,
  "جامعة سبأ":                          processRootExcels,
  "معهد بوابة التكنولوجيا":            processRootExcels,
  "جامعة العلوم والتكنولوجيا-عدن":     processNestedFolders,
  "الجامعة الوطنية-تعز":               processNationalUniv,
  "جامعة السعيد":                       processPdfOnly,
  "جامعة تعز":                          processTaizUniversity,
};

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets && buckets.some((b) => b.name === BUCKET)) {
    ok(`Bucket "${BUCKET}" already exists`);
    return;
  }
  const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (error) err(`Bucket create failed: ${error.message}`);
  else ok(`Bucket "${BUCKET}" created (public)`);
}

async function cleanPrograms() {
  head("🧹 Cleaning existing programs...");
  const { error, count } = await supabase
    .from("programs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) { err(`Clean failed: ${error.message}`); return; }
  ok(`Deleted all existing programs`);
}

async function main() {
  head("🚀 Yemen Educational Marketplace — Data Seeder v2");
  console.log(`${C.dim}  Supabase: ${SUPABASE_URL}${C.reset}`);
  console.log(`${C.dim}  Data:     ${DATA_ROOT}${C.reset}`);
  console.log(`${C.dim}  Mode:     ${CLEAN_FIRST ? "CLEAN + SEED" : "SEED (append)"}${C.reset}\n`);

  await ensureBucket();

  if (CLEAN_FIRST) await cleanPrograms();

  const { subdirs: instDirs } = listDir(DATA_ROOT);

  for (const instDir of instDirs) {
    const instName = path.basename(instDir);
    head(`🏛️  ${instName}`);

    const instId = await getInstitutionId(instName);
    if (!instId) { err(`Cannot resolve ID for: ${instName}`); continue; }
    ok(`ID: ${instId}`);
    STATS.institutions++;

    const processor = PROCESSORS[instName] || processRootExcels;
    await processor(instDir, instName, instId);
  }

  // ── Final report ─────────────────────────────────────────────
  head("📊 SEEDING COMPLETE");
  console.log(`${C.green}${C.bold}`);
  console.log(`  🏛️  Institutions : ${STATS.institutions}`);
  console.log(`  📖 Programs     : ${STATS.programs}`);
  console.log(`  ☁️  Uploads      : ${STATS.uploads}`);
  console.log(`  ❌ Errors       : ${STATS.errors.length}`);
  console.log(C.reset);

  if (STATS.errors.length > 0) {
    console.log(`${C.yellow}  First 10 errors:${C.reset}`);
    STATS.errors.slice(0, 10).forEach((e) =>
      console.log(`${C.red}    • ${e.program || e.file}: ${e.error}${C.reset}`)
    );
  }

  const report = {
    timestamp: new Date().toISOString(),
    version: "2.0",
    institutions: STATS.institutions,
    programs: STATS.programs,
    uploads: STATS.uploads,
    errors: STATS.errors.length,
    errorDetails: STATS.errors,
    bucket: BUCKET,
  };
  fs.writeFileSync(
    path.resolve(__dirname, "seed-report.json"),
    JSON.stringify(report, null, 2),
    "utf-8"
  );
  ok(`Seed report → scripts/seed-report.json`);
}

main().catch((e) => {
  err(`Fatal: ${e.message}`);
  console.error(e.stack);
  process.exit(1);
});
