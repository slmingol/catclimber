const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function convertExcalidrawToPNG(inputPath, outputPath) {
  const excalidrawData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <script src="https://unpkg.com/@excalidraw/excalidraw/dist/excalidraw.production.min.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #app { width: 100vw; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="app"></div>
      <script>
        const data = ${JSON.stringify(excalidrawData)};
        const appElement = document.getElementById('app');
        
        const { exportToBlob } = window.ExcalidrawLib;
        
        // Calculate dimensions from elements
        if (data.elements && data.elements.length > 0) {
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          data.elements.forEach(el => {
            if (el.x !== undefined && el.y !== undefined) {
              minX = Math.min(minX, el.x);
              minY = Math.min(minY, el.y);
              maxX = Math.max(maxX, el.x + (el.width || 0));
              maxY = Math.max(maxY, el.y + (el.height || 0));
            }
          });
          
          window.diagramReady = true;
          window.diagramData = data;
          window.bounds = { minX, minY, maxX, maxY };
        }
      </script>
    </body>
    </html>
  `;
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setContent(html);
  
  // Wait for Excalidraw to load
  await page.waitForFunction('window.diagramReady === true', { timeout: 10000 });
  
  // Get bounds
  const bounds = await page.evaluate(() => window.bounds);
  const padding = 40;
  const width = Math.ceil(bounds.maxX - bounds.minX + padding * 2);
  const height = Math.ceil(bounds.maxY - bounds.minY + padding * 2);
  
  await page.setViewport({ width, height });
  
  // Export as PNG
  const screenshot = await page.screenshot({
    type: 'png',
    clip: {
      x: bounds.minX - padding,
      y: bounds.minY - padding,
      width,
      height
    }
  });
  
  fs.writeFileSync(outputPath, screenshot);
  
  await browser.close();
  console.log(`✓ Converted ${inputPath} → ${outputPath}`);
}

async function main() {
  const diagramsDir = path.join(__dirname, 'docs', 'diagrams');
  const files = fs.readdirSync(diagramsDir).filter(f => f.endsWith('.excalidraw'));
  
  for (const file of files) {
    const inputPath = path.join(diagramsDir, file);
    const outputPath = inputPath.replace(/\.excalidraw$/, '.png');
    
    try {
      await convertExcalidrawToPNG(inputPath, outputPath);
    } catch (error) {
      console.error(`✗ Failed to convert ${file}:`, error.message);
      process.exit(1);
    }
  }
  
  console.log(`✓ Successfully converted ${files.length} diagram(s)`);
}

main();
