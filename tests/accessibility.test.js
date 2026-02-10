const { chromium } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs');

(async () => {
  console.log('🔍 Starting accessibility test...\n');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the page
    await page.goto('file://' + __dirname + '/../index.html');
    console.log('✅ Page loaded successfully');

    // Run accessibility checks with axe-core
    console.log('✅ Running axe-core analysis...');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Save results to file
    fs.writeFileSync('accessibility-report.json', JSON.stringify(accessibilityScanResults, null, 2));
    console.log('✅ Report saved to accessibility-report.json\n');

    // Check for violations
    if (accessibilityScanResults.violations.length === 0) {
      console.log('🎉 No accessibility violations found!');
      console.log(`✅ Passed: ${accessibilityScanResults.passes.length} rules`);
      await browser.close();
      process.exit(0);
    } else {
      console.log(`❌ Found ${accessibilityScanResults.violations.length} accessibility violation(s):\n`);

      accessibilityScanResults.violations.forEach((violation, index) => {
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
