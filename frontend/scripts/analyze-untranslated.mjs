import fs from 'fs';
const ru = JSON.parse(fs.readFileSync('src/locales/ru.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));

function collect(ruObj, enObj, prefix) {
  const result = [];
  for (const key of Object.keys(ruObj)) {
    const rv = ruObj[key];
    const ev = enObj ? enObj[key] : undefined;
    if (typeof rv === 'string') {
      if (/[а-яА-ЯёЁ]/.test(ev || '')) {
        result.push({ key: prefix + key, ru: rv, en: ev });
      }
    } else if (typeof rv === 'object' && rv !== null) {
      collect(rv, ev, prefix + key + '.').forEach(i => result.push(i));
    }
  }
  return result;
}

const untranslated = collect(ru, en, '');
console.log('Total untranslated:', untranslated.length);

// Print ALL untranslated values (just the Russian text) for dictionary building
const uniqueValues = new Map();
for (const item of untranslated) {
  const v = item.ru;
  if (!uniqueValues.has(v)) {
    uniqueValues.set(v, []);
  }
  uniqueValues.get(v).push(item.key);
}

console.log('\nUnique untranslated values:', uniqueValues.size);
console.log('\n=== ALL UNIQUE UNTRANSLATED VALUES ===\n');

let i = 0;
for (const [val, keys] of uniqueValues) {
  i++;
  console.log(`${i}. [${keys[0]}] ${val}`);
}
