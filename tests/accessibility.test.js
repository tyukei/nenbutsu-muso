const { chromium } = require('@playwright/test');
const { injectAxe, checkA11y } = require('@axe-core/playwright');
const fs = require('fs');

(async () => {
  console.log('🔍 Starting accessibility test...\n');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to the page
    await page.goto('http://localhost:8080/');
    console.log('✅ Page loaded successfully');
    
    // Inject axe-core
    await injectAxe(page);
    console.log('✅ axe-core injected');
    
    // Run accessibility checks
    const results = await page.evaluate(async () => {
      return await axe.run();
    });
    
    // Save results to file
    fs.writeFileSync('accessibility-report.json', JSON.stringify(results, null, 2));
    console.log('✅ Report saved to accessibility-report.json\n');
    
    // Check for violations
    if (results.violations.length === 0) {
      console.log('🎉 No accessibility violations found!');
      await browser.close();
      process.exit(0);
    } else {
      console.log(`❌ Found ${results.violations.length} accessibility violation(s):\n`);
      
      results.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.id} (${violation.impact})`);
        console.log(`   Description: ${violation.description}`);
        console.log(`   Help: ${violation.helpUrl}`);
        console.log(`   Affected elements: ${violation.nodes.length}`);
        
        violation.nodes.forEach((node, nodeIndex) => {
          console.log(`   - Element ${nodeIndex + 1}: ${node.html.substring(0, 100)}...`);
        });
        console.log('');
      });
      
      await browser.close();
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during accessibility test:', error);
    await browser.close();
    process.exit(1);
  }
})();
