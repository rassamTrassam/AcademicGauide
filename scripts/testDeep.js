const fs = require('fs');
const path = require('path');

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

const dataRoot = 'd:/AcademicGauide/Data';
const instDirs = fs.readdirSync(dataRoot, { withFileTypes: true }).filter(e => e.isDirectory());

let totalExcel = 0;
for (const inst of instDirs) {
  const p = path.join(dataRoot, inst.name);
  const files = walk(p);
  const excel = files.filter(f => f.endsWith('.xlsx'));
  console.log(`[${inst.name}] Excels found: ${excel.length}`);
  excel.forEach(e => console.log(`  - ${e.replace(dataRoot, '')}`));
  totalExcel += excel.length;
}
console.log('Total Excels:', totalExcel);
