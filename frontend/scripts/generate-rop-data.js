// Script to generate ROP data JSON from Excel file
import * as XLSX from 'xlsx';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const buffer = readFileSync('../4_сalculation/Группы и подгруппы.xlsx');
const workbook = XLSX.read(buffer, { type: 'buffer' });

// ROP rates per group (from official regulations)
const ROP_RATES = {
  1: 4793, 2: 5595, 3: 8406, 4: 12345, 5: 17919, 6: 9418,
  7: 11008, 8: 4219, 9: 36356, 10: 36356, 11: 135390, 12: 7471,
  13: 147165, 14: 10859, 15: 36356, 16: 36356, 17: 36356, 18: 11030,
  19: 9418, 20: 12197, 21: 44573, 22: 4973, 23: 5595, 24: 4219
};

// Parse normatives from Sheet 3
function parseNormatives(sheet) {
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const normatives = {};

  // Row 2 has years: "", "2025 год", "2026 год", etc.
  // Rows 3+ have group name and values
  for (let i = 3; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;

    const match = row[0].match(/Группа\s*№\s*(\d+)/);
    if (match) {
      const groupNum = parseInt(match[1]);
      normatives[groupNum] = {
        2025: (row[1] || 0) / 100,
        2026: (row[2] || 0) / 100,
        2027: (row[3] || 0) / 100,
        2028: (row[4] || 0) / 100,
        2029: (row[5] || 0) / 100,
        2030: (row[6] || 0) / 100
      };
    }
  }
  return normatives;
}

// Parse goods (Groups 1-18) from Sheet 1
function parseGoods(sheet) {
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const groups = [];
  let currentGroup = null;

  for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;

    const name = String(row[0]).trim();

    // Check if this is a group header
    const groupMatch = name.match(/^Группа\s*№\s*(\d+)\s*[""«]?(.+?)[""»]?$/);
    if (groupMatch) {
      const groupNum = parseInt(groupMatch[1]);
      if (groupNum >= 1 && groupNum <= 18) {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          number: groupNum,
          name: name,
          shortName: groupMatch[2].replace(/[""«»]/g, '').trim(),
          ropRate: ROP_RATES[groupNum] || 0,
          subgroups: []
        };
      }
    } else if (currentGroup) {
      // This is a subgroup item
      const gskpCode = String(row[1] || '').trim();
      const tnVedCode = String(row[2] || '').trim();
      const tnVedName = String(row[3] || '').trim();
      const category = String(row[4] || '').trim();

      currentGroup.subgroups.push({
        name: name,
        gskpCode: gskpCode,
        tnVedCode: tnVedCode === '-' ? '' : tnVedCode,
        tnVedName: tnVedName === '-' ? '' : tnVedName,
        category: category === '-' ? '' : category
      });
    }
  }

  if (currentGroup) {
    groups.push(currentGroup);
  }

  return groups;
}

// Parse packaging (Groups 19-24) from Sheet 2
function parsePackaging(sheet) {
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const groups = [];
  let currentGroup = null;

  for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;

    const name = String(row[0]).trim();

    // Check if this is a group header
    const groupMatch = name.match(/^Группа\s*№\s*(\d+)\s+(.+)$/);
    if (groupMatch) {
      const groupNum = parseInt(groupMatch[1]);
      if (groupNum >= 19 && groupNum <= 24) {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          number: groupNum,
          name: name,
          shortName: groupMatch[2].trim(),
          ropRate: ROP_RATES[groupNum] || 0,
          subgroups: []
        };
      }
    } else if (currentGroup && !name.startsWith('Примечание')) {
      // This is a subgroup item
      const material = String(row[1] || '').trim();
      const letterCode = String(row[2] || '').trim();
      const digitalCode = row[3] !== '' ? String(row[3]) : '';
      const category = String(row[4] || '').trim();

      if (material || letterCode || digitalCode) {
        currentGroup.subgroups.push({
          name: name,
          material: material === '-' ? '' : material,
          letterCode: letterCode === '-' ? '' : letterCode,
          digitalCode: digitalCode === '-' ? '' : digitalCode,
          category: category === '-' ? '' : category
        });
      }
    }
  }

  if (currentGroup) {
    groups.push(currentGroup);
  }

  return groups;
}

// Main
const sheet1 = workbook.Sheets[workbook.SheetNames[0]]; // Перечень товаров
const sheet2 = workbook.Sheets[workbook.SheetNames[1]]; // Перечень упаковки товаров
const sheet3 = workbook.Sheets[workbook.SheetNames[2]]; // Нормативы

const ropData = {
  goods: parseGoods(sheet1),
  packaging: parsePackaging(sheet2),
  normatives: parseNormatives(sheet3),
  rates: ROP_RATES
};

// Output
const outputPath = './src/data/rop-data.json';
try {
  mkdirSync('./src/data', { recursive: true });
} catch (e) {}

writeFileSync(outputPath, JSON.stringify(ropData, null, 2), 'utf-8');
console.log(`Generated ${outputPath}`);
console.log(`Goods groups: ${ropData.goods.length}`);
console.log(`Packaging groups: ${ropData.packaging.length}`);
console.log(`Total subgroups in goods: ${ropData.goods.reduce((sum, g) => sum + g.subgroups.length, 0)}`);
console.log(`Total subgroups in packaging: ${ropData.packaging.reduce((sum, g) => sum + g.subgroups.length, 0)}`);
