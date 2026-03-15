const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function convertExcalidrawToPNG(inputPath, outputPath) {
  const excalidrawData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  
  // Calculate bounds from elements
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  if (excalidrawData.elements && excalidrawData.elements.length > 0) {
    excalidrawData.elements.forEach(el => {
      if (el.x !== undefined && el.y !== undefined && !el.isDeleted) {
        const elMinX = el.x;
        const elMinY = el.y;
        const elMaxX = el.x + (el.width || 0);
        const elMaxY = el.y + (el.height || 0);
        
        minX = Math.min(minX, elMinX);
        minY = Math.min(minY, elMinY);
        maxX = Math.max(maxX, elMaxX);
        maxY = Math.max(maxY, elMaxY);
      }
    });
  }
  
  const padding = 40;
  const width = Math.ceil(maxX - minX + padding * 2);
  const height = Math.ceil(maxY - minY + padding * 2);
  
  // Create HTML that renders the diagram
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          background: white;
        }
        svg {
          display: block;
        }
      </style>
    </head>
    <body>
      <div id="container"></div>
      <script type="module">
        import { exportToSvg } from 'https://esm.sh/@excalidraw/excalidraw@0.18.0';
        
        const data = ${JSON.stringify(excalidrawData)};
        
        try {
          const svg = await exportToSvg({
            elements: data.elements,
            appState: {
              ...data.appState,
              exportBackground: true,
              viewBackgroundColor: '#ffffff'
            },
            files: data.files || {}
          });
          
          document.getElementById('container').appendChild(svg);
          window.renderComplete = true;
        } catch (error) {
          console.error('Export error:', error);
          window.renderError = error.message;
        }
      </script>
    </body>
    </html>
  `;
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security'
    ]
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  // Wait for rendering to complete
  await page.waitForFunction(
    'window.renderComplete === true || window.renderError',
    { timeout: 30000 }
  );
  
  // Check for errors
  const renderError = await page.evaluate(() => window.renderError);
  if (renderError) {
    throw new Error(`Rendering failed: ${renderError}`);
  }
  
  // Take screenshot
  const screenshot = await page.screenshot({
    type: 'png',
    fullPage: false
  });
  
  fs.writeFileSync(outputPath, screenshot);
  await browser.close();
  
  console.log(`✓ Converted ${inputPath} → ${outputPath} (${width}x${height})`);
}

async function main() {
  const diagramsDir = path.join(process.cwd(), 'docs', 'diagrams');
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
