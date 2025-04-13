const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');
const imageminWebp = require('imagemin-webp');
const path = require('path');
const fs = require('fs');
const glob = require('glob');

(async () => {
  console.log('Optimizing images...');

  // Get all images
  const imageFiles = glob.sync('build/**/*.{jpg,jpeg,png,svg}');
  console.log(`Found ${imageFiles.length} images to optimize`);

  // Optimize images
  const optimizedFiles = await imagemin(imageFiles, {
    plugins: [
      imageminMozjpeg({ quality: 80 }),
      imageminPngquant({ quality: [0.65, 0.8] }),
      imageminSvgo({
        plugins: [
          { removeViewBox: false },
          { cleanupIDs: false }
        ]
      })
    ]
  });

  // Save optimized images
  optimizedFiles.forEach(file => {
    fs.writeFileSync(file.destinationPath, file.data);
    console.log(`Optimized: ${file.destinationPath}`);
  });

  // Convert to WebP
  const webpFiles = await imagemin(['build/**/*.{jpg,jpeg,png}'], {
    plugins: [
      imageminWebp({ quality: 80 })
    ]
  });

  // Save WebP images
  webpFiles.forEach(file => {
    const webpFilePath = file.destinationPath.replace(/\.(jpg|jpeg|png)$/, '.webp');
    fs.writeFileSync(webpFilePath, file.data);
    console.log(`Created: ${webpFilePath}`);
  });

  console.log('Image optimization complete!');
})();
