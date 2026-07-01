import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";

// ============================================================
// Yemen Educational Marketplace — Data Structure Analyzer
// تحليل بنية بيانات المؤسسات التعليمية اليمنية
// ============================================================

const DATA_ROOT = path.resolve("D:\\AcademicGauide\\Data");
const OUTPUT_FILE = path.resolve(__dirname, "schema-report.json");

// ============================================================
// Types
// ============================================================

interface ProgramFile {
  name: string;
  type: "excel" | "word" | "pdf" | "image" | "other";
  sizeBytes: number;
  relativePath: string;
}

interface Program {
  name: string;
  folderPath: string;
  files: ProgramFile[];
  excelHeaders: Record<string, string[]>; // filename → headers
}

interface DegreeLevel {
  level: string; // بكالوريوس / ماجستير / دبلوم / other
  faculty?: string;
  programs: Program[];
}

interface Institution {
  name: string;
  folderPath: string;
  degreeLevels: DegreeLevel[];
  rootFiles: ProgramFile[]; // Files directly in institution folder
}

interface SchemaReport {
  generatedAt: string;
  dataRoot: string;
  totalInstitutions: number;
  totalPrograms: number;
  institutions: Institution[];
  allExcelHeaders: {
    consistent: string[]; // headers found across multiple institutions
    institution_specific: Record<string, string[]>; // institution → unique headers
    all_unique: string[]; // all headers ever seen
    frequency: Record<string, number>; // header → count of files it appears in
  };
  fileTypeSummary: Record<string, number>;
  degreeLevelSummary: Record<string, number>;
  recommendations: {
    core_columns: string[];
    jsonb_candidates: string[];
    notes: string[];
  };
}

// ============================================================
// Utility Functions
// ============================================================

function getFileType(filename: string): ProgramFile["type"] {
  const ext = path.extname(filename).toLowerCase();
  if ([".xlsx", ".xls"].includes(ext)) return "excel";
  if ([".docx", ".doc"].includes(ext)) return "word";
  if (ext === ".pdf") return "pdf";
  if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) return "image";
  return "other";
}

function readExcelHeaders(filePath: string): string[] {
  try {
    const workbook = XLSX.readFile(filePath, { sheetRows: 3 });
    const headers: string[] = [];

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const range = XLSX.utils.decode_range(sheet["!ref"] || "A1:Z1");

      // Read first two rows to find headers
      for (let row = range.s.r; row <= Math.min(range.e.r, 2); row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = sheet[cellAddr];
          if (cell && cell.v && typeof cell.v === "string" && cell.v.trim()) {
            const header = cell.v.trim();
            if (!headers.includes(header)) {
              headers.push(header);
            }
          }
        }
      }
    }
    return headers;
  } catch (err) {
    console.warn(`  ⚠️  Could not read Excel: ${filePath} — ${err}`);
    return [];
  }
}

function buildProgramFile(
  filePath: string,
  dataRoot: string
): ProgramFile {
  const stats = fs.statSync(filePath);
  return {
    name: path.basename(filePath),
    type: getFileType(filePath),
    sizeBytes: stats.size,
    relativePath: path.relative(dataRoot, filePath),
  };
}

function scanDirectory(dirPath: string): {
  files: string[];
  subdirs: string[];
} {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];
  const subdirs: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      subdirs.push(fullPath);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return { files, subdirs };
}

// ============================================================
// Degree Level Detection
// ============================================================

const DEGREE_KEYWORDS: Record<string, string> = {
  بكالوريوس: "bachelor",
  ماجستير: "master",
  دكتوراه: "phd",
  دبلوم: "diploma",
  شهادة: "certificate",
  دورة: "course",
};

function detectDegreeLevel(name: string): string {
  for (const [arabic, english] of Object.entries(DEGREE_KEYWORDS)) {
    if (name.includes(arabic)) return english;
  }
  return "other";
}

// ============================================================
// Program Scanner
// ============================================================

function scanProgramFolder(
  programPath: string,
  dataRoot: string
): Program {
  const programName = path.basename(programPath);
  const { files, subdirs } = scanDirectory(programPath);

  const programFiles: ProgramFile[] = files.map((f) =>
    buildProgramFile(f, dataRoot)
  );
  const excelHeaders: Record<string, string[]> = {};

  for (const file of files) {
    if (getFileType(file) === "excel") {
      const headers = readExcelHeaders(file);
      excelHeaders[path.basename(file)] = headers;
    }
  }

  // Recursively scan subdirs (e.g., attachments)
  for (const subdir of subdirs) {
    const subFiles = scanProgramFolder(subdir, dataRoot);
    programFiles.push(...subFiles.files);
    Object.assign(excelHeaders, subFiles.excelHeaders);
  }

  return {
    name: programName,
    folderPath: path.relative(dataRoot, programPath),
    files: programFiles,
    excelHeaders,
  };
}

// ============================================================
// Institution Scanner
// ============================================================

function scanInstitution(instPath: string, dataRoot: string): Institution {
  const instName = path.basename(instPath);
  console.log(`\n🏛️  Scanning institution: ${instName}`);

  const { files: rootFilesList, subdirs } = scanDirectory(instPath);

  // Root-level files (Excel, PDFs directly in institution folder)
  const rootFiles: ProgramFile[] = rootFilesList.map((f) =>
    buildProgramFile(f, dataRoot)
  );

  // Read Excel headers from root-level files
  for (const file of rootFilesList) {
    if (getFileType(file) === "excel") {
      console.log(`  📊 Reading Excel: ${path.basename(file)}`);
    }
  }

  const degreeLevels: DegreeLevel[] = [];

  // Check if subdirectories are degree levels or faculties
  for (const subdir of subdirs) {
    const subdirName = path.basename(subdir);
    const detectedLevel = detectDegreeLevel(subdirName);

    if (detectedLevel !== "other") {
      // This is a degree-level folder (e.g., بكالوريوس, ماجستير)
      console.log(`  📚 Degree level: ${subdirName} (${detectedLevel})`);
      const degreeLevel: DegreeLevel = {
        level: detectedLevel,
        programs: [],
      };

      const { files: levelFiles, subdirs: facultyOrProgramDirs } =
        scanDirectory(subdir);

      // Add level-root files
      rootFiles.push(...levelFiles.map((f) => buildProgramFile(f, dataRoot)));

      // Check if next level is faculty or programs
      for (const subSubdir of facultyOrProgramDirs) {
        const subSubName = path.basename(subSubdir);
        const { subdirs: programDirs } = scanDirectory(subSubdir);

        if (programDirs.length > 0) {
          // This is a faculty folder containing program folders
          console.log(`    🏫 Faculty: ${subSubName} (${programDirs.length} programs)`);
          degreeLevel.faculty = subSubName;
          for (const programDir of programDirs) {
            console.log(`      📖 Program: ${path.basename(programDir)}`);
            const program = scanProgramFolder(programDir, dataRoot);
            degreeLevel.programs.push(program);
          }
        } else {
          // This is a program folder directly
          console.log(`    📖 Program: ${subSubName}`);
          const program = scanProgramFolder(subSubdir, dataRoot);
          degreeLevel.programs.push(program);
        }
      }

      degreeLevels.push(degreeLevel);
    } else {
      // Institution-specific subfolder (e.g., مرفقات, الخطط الدراسية)
      console.log(`  📁 Subfolder: ${subdirName}`);
      const { files: subFiles } = scanDirectory(subdir);
      rootFiles.push(...subFiles.map((f) => buildProgramFile(f, dataRoot)));
    }
  }

  // If no degree levels found, treat root Excel files as the data source
  if (degreeLevels.length === 0 && rootFiles.some((f) => f.type === "excel")) {
    const excelFiles = rootFiles.filter((f) => f.type === "excel");
    const syntheticPrograms: Program[] = excelFiles.map((excelFile) => {
      const fullPath = path.join(dataRoot, excelFile.relativePath);
      const headers = readExcelHeaders(fullPath);
      return {
        name: excelFile.name.replace(/\.xlsx?$/, ""),
        folderPath: path.dirname(excelFile.relativePath),
        files: [excelFile],
        excelHeaders: { [excelFile.name]: headers },
      };
    });

    // Try to detect degree level from file names
    const levelMap: Record<string, Program[]> = {};
    for (const prog of syntheticPrograms) {
      const level = detectDegreeLevel(prog.name);
      if (!levelMap[level]) levelMap[level] = [];
      levelMap[level].push(prog);
    }

    for (const [level, programs] of Object.entries(levelMap)) {
      degreeLevels.push({ level, programs });
    }
  }

  return { name: instName, folderPath: path.relative(dataRoot, instPath), degreeLevels, rootFiles };
}

// ============================================================
// Header Aggregation
// ============================================================

function aggregateHeaders(institutions: Institution[]): SchemaReport["allExcelHeaders"] {
  const headerFrequency: Record<string, number> = {};
  const institutionHeaders: Record<string, Set<string>> = {};

  function countHeaders(programs: Program[], instName: string) {
    for (const prog of programs) {
      for (const [, headers] of Object.entries(prog.excelHeaders)) {
        for (const h of headers) {
          headerFrequency[h] = (headerFrequency[h] || 0) + 1;
          if (!institutionHeaders[instName]) {
            institutionHeaders[instName] = new Set();
          }
          institutionHeaders[instName].add(h);
        }
      }
    }
  }

  for (const inst of institutions) {
    // Root files
    for (const rootFile of inst.rootFiles) {
      if (rootFile.type === "excel") {
        const fullPath = path.join(DATA_ROOT, rootFile.relativePath);
        const headers = readExcelHeaders(fullPath);
        for (const h of headers) {
          headerFrequency[h] = (headerFrequency[h] || 0) + 1;
          if (!institutionHeaders[inst.name]) {
            institutionHeaders[inst.name] = new Set();
          }
          institutionHeaders[inst.name].add(h);
        }
      }
    }
    for (const dl of inst.degreeLevels) {
      countHeaders(dl.programs, inst.name);
    }
  }

  const allUnique = Object.keys(headerFrequency);
  const totalInstitutions = institutions.length;
  const consistent = allUnique.filter(
    (h) => headerFrequency[h] >= Math.max(2, totalInstitutions * 0.3)
  );

  const institutionSpecific: Record<string, string[]> = {};
  for (const [inst, headers] of Object.entries(institutionHeaders)) {
    institutionSpecific[inst] = [...headers].filter(
      (h) => !consistent.includes(h)
    );
  }

  return {
    consistent,
    institution_specific: institutionSpecific,
    all_unique: allUnique,
    frequency: headerFrequency,
  };
}

// ============================================================
// File Type & Degree Level Summary
// ============================================================

function buildSummaries(institutions: Institution[]): {
  fileTypeSummary: Record<string, number>;
  degreeLevelSummary: Record<string, number>;
  totalPrograms: number;
} {
  const fileTypeSummary: Record<string, number> = {};
  const degreeLevelSummary: Record<string, number> = {};
  let totalPrograms = 0;

  function countFiles(files: ProgramFile[]) {
    for (const f of files) {
      fileTypeSummary[f.type] = (fileTypeSummary[f.type] || 0) + 1;
    }
  }

  for (const inst of institutions) {
    countFiles(inst.rootFiles);
    for (const dl of inst.degreeLevels) {
      degreeLevelSummary[dl.level] =
        (degreeLevelSummary[dl.level] || 0) + dl.programs.length;
      totalPrograms += dl.programs.length;
      for (const prog of dl.programs) {
        countFiles(prog.files);
      }
    }
  }

  return { fileTypeSummary, degreeLevelSummary, totalPrograms };
}

// ============================================================
// Recommendations Generator
// ============================================================

function generateRecommendations(
  headers: SchemaReport["allExcelHeaders"]
): SchemaReport["recommendations"] {
  const core_columns = [
    "اسم البرنامج",
    "الكلية",
    "المؤسسة",
    "مستوى الدراسة",
    "وصف البرنامج",
    "مدة الدراسة",
    "رسوم الدراسة",
    "متطلبات القبول",
    "عدد الساعات",
  ];

  const jsonb_candidates = headers.all_unique.filter(
    (h) => !headers.consistent.includes(h) && headers.frequency[h] <= 2
  );

  const notes: string[] = [
    `تم اكتشاف ${headers.all_unique.length} عمود فريد عبر جميع ملفات Excel`,
    `${headers.consistent.length} عمود متسق يظهر في أكثر من 30% من المؤسسات → يصبح أعمدة ثابتة`,
    `${jsonb_candidates.length} عمود غير متسق → يُخزن في JSONB metadata`,
    "ملفات Word (docx) تحتوي وصف البرامج → تُستخرج وتُخزن في حقل description",
    "ملفات PDF → يُرفع رابطها في حقل study_plan_pdf_url أو يُدرج في metadata",
    "صور JPG → تُرفع إلى Supabase Storage وتُخزن روابطها في cover_image_url",
  ];

  return { core_columns, jsonb_candidates, notes };
}

// ============================================================
// Main Execution
// ============================================================

async function main() {
  console.log("🚀 Yemen Educational Marketplace — Data Structure Analyzer");
  console.log("=".repeat(60));
  console.log(`📂 Data Root: ${DATA_ROOT}`);
  console.log("");

  if (!fs.existsSync(DATA_ROOT)) {
    console.error(`❌ Data root not found: ${DATA_ROOT}`);
    process.exit(1);
  }

  const { subdirs: institutionDirs } = scanDirectory(DATA_ROOT);
  const institutions: Institution[] = [];

  for (const instDir of institutionDirs) {
    const institution = scanInstitution(instDir, DATA_ROOT);
    institutions.push(institution);
  }

  console.log("\n📊 Aggregating headers...");
  const allExcelHeaders = aggregateHeaders(institutions);
  const { fileTypeSummary, degreeLevelSummary, totalPrograms } =
    buildSummaries(institutions);
  const recommendations = generateRecommendations(allExcelHeaders);

  const report: SchemaReport = {
    generatedAt: new Date().toISOString(),
    dataRoot: DATA_ROOT,
    totalInstitutions: institutions.length,
    totalPrograms,
    institutions,
    allExcelHeaders,
    fileTypeSummary,
    degreeLevelSummary,
    recommendations,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2), "utf-8");

  // ============================================================
  // Console Summary
  // ============================================================
  console.log("\n" + "=".repeat(60));
  console.log("📈 ANALYSIS SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Institutions found:  ${institutions.length}`);
  console.log(`✅ Total programs:       ${totalPrograms}`);
  console.log(`\n📁 File Type Breakdown:`);
  for (const [type, count] of Object.entries(fileTypeSummary)) {
    console.log(`   ${type.padEnd(10)} → ${count} files`);
  }
  console.log(`\n🎓 Degree Level Breakdown:`);
  for (const [level, count] of Object.entries(degreeLevelSummary)) {
    console.log(`   ${level.padEnd(15)} → ${count} programs`);
  }
  console.log(`\n📋 Excel Headers Analysis:`);
  console.log(`   Unique headers found:    ${allExcelHeaders.all_unique.length}`);
  console.log(`   Consistent headers:      ${allExcelHeaders.consistent.length}`);
  console.log(`   JSONB candidates:        ${recommendations.jsonb_candidates.length}`);
  console.log(`\n💡 Recommendations:`);
  for (const note of recommendations.notes) {
    console.log(`   • ${note}`);
  }
  console.log("\n" + "=".repeat(60));
  console.log(`✅ Report saved to: ${OUTPUT_FILE}`);
  console.log("=".repeat(60));
}

main().catch(console.error);
