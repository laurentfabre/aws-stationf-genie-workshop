// Run after extracting participant-kit.zip into .validation/extracted.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || '../node_modules/playwright/index.mjs');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const extracted=path.join(root,'.validation/extracted');
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true});
const checks=[];
function check(id,ok){checks.push({id,status:ok?'PASS':'FAIL'});if(!ok)throw Error(id);}
try{
 const page=await browser.newPage();
 await page.goto('file://'+path.join(extracted,'index.html'));
 await page.waitForSelector('[data-step="0"]');
 check('extracted-portal-opens',await page.title().then(t=>t.includes('STATION F')));
 check('extracted-kit-link',await page.locator('.toolbar a[href="README.md"]').count()===1);
 await page.locator('a[href="trial.html"]').click();
 check('extracted-trial-guide',await page.locator('body').innerText().then(t=>t.includes('Serverless')));
 const notebookLink=await page.locator('a[download]').getAttribute('href');
 check('extracted-notebook-is-importable',fs.readFileSync(path.join(extracted,notebookLink)).equals(fs.readFileSync(path.join(root,'notebooks/00_START_HERE.ipynb'))));
 await page.goto('file://'+path.join(extracted,'guide.html'));
 check('extracted-print-guide',await page.locator('body').innerText().then(t=>t.includes('Installer mon atelier')&&t.includes('Mon reçu')));
}finally{
 await browser.close();
 const report={at:new Date().toISOString(),environment:'Extracted ZIP, local Chrome, no Databricks login',checks};
 fs.writeFileSync(path.join(root,'.validation/archive-checks.json'),JSON.stringify(report,null,2));
 fs.writeFileSync(path.join(root,`.validation/archive-checks-${Date.now()}.json`),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
}
