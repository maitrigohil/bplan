const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const FOLDERS = [
  'assets/images',
  'counsel',
  'coursephotos',
  'cphotos',
  'sequencee',
  'testimonials',
  'notescfa',
  '18 PHOTOS',
];

function getFilesRecursive(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) return getFilesRecursive(full);
    const ext = path.extname(name).toLowerCase();
    if (['.png', '.jpg', '.jpeg'].includes(ext)) return [full];
    return [];
  });
}

async function optimize(file) {
  const ext = path.extname(file).toLowerCase();
  const originalSize = fs.statSync(file).size;
  const tmpFile = file + '.tmp';

  try {
    if (ext === '.png') {
      await sharp(file)
        .png({ compressionLevel: 8, effort: 10 })
        .toFile(tmpFile);
    } else {
      await sharp(file)
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(tmpFile);
    }

    const newSize = fs.statSync(tmpFile).size;

    // Only replace if actually smaller
    if (newSize < originalSize) {
      fs.renameSync(tmpFile, file);
      return { file, originalSize, newSize, saved: originalSize - newSize };
    } else {
      fs.unlinkSync(tmpFile);
      return { file, originalSize, newSize: originalSize, saved: 0 };
    }
  } catch (err) {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    console.error(`  SKIP ${file}: ${err.message}`);
    return { file, originalSize, newSize: originalSize, saved: 0 };
  }
}

function fmt(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  return (bytes / 1024).toFixed(1) + ' KB';
}

(async () => {
  const files = FOLDERS.flatMap(getFilesRecursive);
  console.log(`Found ${files.length} images to process\n`);

  let totalBefore = 0;
  let totalAfter = 0;
  const results = [];

  for (const file of files) {
    const result = await optimize(file);
    results.push(result);
    totalBefore += result.originalSize;
    totalAfter += result.newSize;
    const savedStr = result.saved > 0 ? `-${fmt(result.saved)}` : 'no change';
    console.log(`${file.padEnd(55)} ${fmt(result.originalSize).padStart(9)} → ${fmt(result.newSize).padStart(9)}  (${savedStr})`);
  }

  const totalSaved = totalBefore - totalAfter;
  console.log('\n' + '─'.repeat(80));
  console.log(`Files processed : ${files.length}`);
  console.log(`Total before    : ${fmt(totalBefore)}`);
  console.log(`Total after     : ${fmt(totalAfter)}`);
  console.log(`Total saved     : ${fmt(totalSaved)} (${((totalSaved / totalBefore) * 100).toFixed(1)}%)`);

  const top5 = [...results].sort((a, b) => b.saved - a.saved).slice(0, 5);
  console.log('\nTop 5 biggest savings:');
  top5.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.file} — saved ${fmt(r.saved)}`);
  });
})();
