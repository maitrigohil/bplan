const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const FILES = [
  'assets/images/folder.png',
  'assets/images/notesasset.png',
  'assets/images/herobase.png',
  'coursephotos/cb-1-img.png',
  'coursephotos/phonecourse.png',
  'coursephotos/cb-3-img.png',
  'coursephotos/cb-4-img.png',
  'coursephotos/cb-5.png',
  'counsel/lostvineet-Photoroom.png',
  'testimonials/asbrother.png',
  'testimonials/aakriti.png',
  'testimonials/ashlesha.png',
  'testimonials/chahak.png',
];

function fmt(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  return (bytes / 1024).toFixed(1) + ' KB';
}

(async () => {
  let totalBefore = 0, totalAfter = 0;

  for (const file of FILES) {
    if (!fs.existsSync(file)) {
      console.log(`MISSING: ${file}`);
      continue;
    }
    const outFile = file.replace(/\.png$/i, '.webp');
    const before = fs.statSync(file).size;
    await sharp(file).webp({ quality: 82, effort: 6 }).toFile(outFile);
    const after = fs.statSync(outFile).size;
    totalBefore += before;
    totalAfter += after;
    console.log(`${file.padEnd(48)} ${fmt(before).padStart(8)} → ${fmt(after).padStart(8)}  (-${fmt(before - after)})`);
  }

  console.log('\n' + '─'.repeat(72));
  console.log(`Total before : ${fmt(totalBefore)}`);
  console.log(`Total after  : ${fmt(totalAfter)}`);
  console.log(`Saved        : ${fmt(totalBefore - totalAfter)} (${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1)}%)`);
})();
