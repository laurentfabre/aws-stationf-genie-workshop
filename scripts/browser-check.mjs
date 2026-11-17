const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || '../node_modules/playwright/index.mjs');
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=process.env.WORKSHOP_TEST_URL||'http://127.0.0.1:18770';
fs.mkdirSync(path.join(root,'.validation'),{recursive:true});
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const checks=[];
function check(id,condition,detail=''){checks.push({id,status:condition?'PASS':'FAIL',detail});if(!condition)throw new Error(id+' '+detail);}
try{
 await page.goto(base);await page.waitForSelector('[data-step="0"]');
 check('portal-load',await page.title().then(t=>t.includes('STATION F')));
 await page.locator('a[href="trial.html"]').click();
 check('trial-instructions',await page.locator('body').innerText().then(s=>s.includes('Serverless')&&s.includes('App Builder est conditionnel')));
 const notebookDownload=page.waitForEvent('download');await page.locator('a[download]').click();const notebookFile=await notebookDownload;const notebookPath=path.join(root,'.validation/downloaded.ipynb');await notebookFile.saveAs(notebookPath);check('notebook-download',fs.readFileSync(notebookPath).equals(fs.readFileSync(path.join(root,'notebooks/00_START_HERE.ipynb'))));
 await page.goto(base);await page.waitForSelector('[data-step="0"]');
 check('logos',await page.locator('.brands img').evaluateAll(els=>els.every(e=>e.complete&&e.naturalWidth>0)));
 await page.locator('[data-note="team"]').fill('Équipe test — Métier / IT');
 await page.locator('[data-note="question"]').fill('Quel canal revoir ?');
 await page.locator('#track').selectOption('retention');
 await page.locator('[data-note="team"]').fill('Équipe rétention');
 await page.locator('#track').selectOption('marketing');
 check('track-notes-preserved',await page.locator('[data-note="team"]').inputValue()==='Équipe test — Métier / IT');
 await page.reload();check('reload-notes-preserved',await page.locator('[data-note="team"]').inputValue()==='Équipe test — Métier / IT');
 await page.locator('[data-step="1"]').click();await page.locator('[data-copy="q0"]').click();
 check('copy-question',await page.evaluate(()=>navigator.clipboard.readText()).then(s=>s.includes('ROAS')));
 await page.locator('[data-step="3"]').click();await page.locator('[data-copy="build1"]').click();
 check('unbound-prompt-blocked',await page.locator('#status').innerText().then(s=>s.includes('catalogue')));
 for(const [key,value] of Object.entries({workspace_url:'https://example.cloud.databricks.com',catalog:'workshop',schema:'stationf_20261124_test',genie_url:'https://example.cloud.databricks.com/genie/EXAMPLE',app_space_url:'https://example.cloud.databricks.com/apps'}))await page.locator('#binding-'+key).fill(value);
 await page.locator('#save-bindings').click();await page.locator('[data-copy="build1"]').click();
 check('bound-prompt-copy',await page.evaluate(()=>navigator.clipboard.readText()).then(s=>s.includes('workshop.stationf_20261124_test.campaign_weekly')&&!s.includes('{{')));
 await page.locator('[data-copy="build2"]').click();check('iteration-needs-observation',await page.locator('#status').innerText().then(s=>s.includes('Consignez')));
 await page.locator('[data-note="observations"]').fill('Les semaines incomplètes ne sont pas visibles.');await page.locator('[data-copy="build2"]').click();
 check('iteration-includes-observation',await page.evaluate(()=>navigator.clipboard.readText()).then(s=>s.includes('Les semaines incomplètes ne sont pas visibles.')));
 await page.locator('[data-step="5"]').click();await page.locator('[data-note="decision"]').fill('Examiner Partner ; attribution non causale.');
 await page.locator('[data-note="owner"]').fill('Camille — 1 décembre 2026');
 const dl1=page.waitForEvent('download');await page.locator('#export-json').click();const f=await dl1;const file=path.join(root,'.validation/browser-workbook.json');await f.saveAs(file);
 const exported=JSON.parse(fs.readFileSync(file,'utf8'));check('json-export-has-notes',JSON.stringify(exported).includes('attribution non causale'));
 await page.locator('[data-note="decision"]').fill('Note modifiée');await page.locator('#import-file').setInputFiles(file);await page.waitForTimeout(100);
 check('json-restore',await page.locator('[data-note="decision"]').inputValue()==='Examiner Partner ; attribution non causale.');
 const invalid=path.join(root,'.validation/invalid-workbook.json');fs.writeFileSync(invalid,'{"version":999}');await page.locator('#import-file').setInputFiles(invalid);await page.waitForTimeout(100);
 check('invalid-import-visible',await page.locator('#status').innerText().then(s=>s.includes('Import refusé')));
 const dl2=page.waitForEvent('download');await page.locator('#export-md').click();const f2=await dl2;const mdFile=path.join(root,'.validation/browser-workbook.md');await f2.saveAs(mdFile);check('markdown-export',fs.readFileSync(mdFile,'utf8').includes('Camille'));
 const popupPromise=page.waitForEvent('popup');await page.locator('#print-notes').click();const pop=await popupPromise;await pop.waitForLoadState();check('print-nonempty-notes',await pop.locator('body').innerText().then(s=>s.includes('Camille')&&s.includes('attribution non causale')));await pop.close();
 await page.locator('[data-step="0"]').click();await page.locator('#track').selectOption('marketing');
 await page.locator('#settings summary').click();
 await page.screenshot({path:path.join(root,'.validation/portal-desktop.png'),fullPage:true});
 check('desktop-no-overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(root,'.validation/portal-mobile.png'),fullPage:true});
 check('mobile-no-overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
 await page.keyboard.press('Tab');check('keyboard-focus',await page.evaluate(()=>document.activeElement!==document.body));
 await page.setViewportSize({width:1440,height:1000});
 for(const id of ['marketing','activation','retention','sales']){
  await page.locator('#track').selectOption(id);
  for(let s=0;s<6;s++){
   await page.locator(`[data-step="${s}"]`).click();
   check(`track-${id}-step-${s+1}`,await page.locator('#main h2').count()===1);
  }
 }
 await page.locator('#track').selectOption('marketing');await page.locator('[data-step="0"]').click();
 if(!await page.locator('#settings').evaluate(e=>e.open))await page.locator('#settings summary').click();
 for(const key of ['workspace_url','catalog','schema','genie_url','app_space_url'])await page.locator('#binding-'+key).fill('');
 await page.locator('#save-bindings').click();
 check('environment-notes-preserved',await page.locator('[data-note="team"]').inputValue()==='Équipe test — Métier / IT');
 const guide=await context.newPage();await guide.goto(base+'/guide.html');await guide.emulateMedia({media:'print'});
 await guide.pdf({path:path.join(root,'site/guide.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true});
 const hash=crypto.createHash('sha256'); for(const name of ['guide.html','assets/portal.css','assets/aws-logo.png','assets/databricks-logo.svg'])hash.update(fs.readFileSync(path.join(root,'site',name))); const digest=hash.digest('hex');fs.writeFileSync(path.join(root,'site/pdf-input.sha256'),digest+'\n');
 check('pdf-created',fs.statSync(path.join(root,'site/guide.pdf')).size>15000);
 check('no-js-errors',errors.length===0,errors.join('; '));
 const filePage=await context.newPage();await filePage.goto('file://'+path.join(root,'site/index.html'));await filePage.waitForSelector('[data-step="0"]');check('file-offline-instructions',await filePage.locator('#main').innerText().then(s=>s.includes('Avant de commencer')));
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}}));const bp=await blocked.newPage();await bp.goto(base);check('storage-failure-visible',await bp.locator('#status').innerText().then(s=>s.includes('Stockage indisponible')));await blocked.close();
} finally {
 const report={at:new Date().toISOString(),artifact:'workshop-'+crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'workshop.json'))).digest('hex').slice(0,12),environment:'Local Chrome headless',identity:'Isolated browser; no Databricks login',dataset:'stationf-synthetic-v1',checks,errors};
 const json=JSON.stringify(report,null,2);fs.writeFileSync(path.join(root,'.validation/browser-checks.json'),json);fs.writeFileSync(path.join(root,'.validation/browser-checks-'+Date.now()+'.json'),json);
 await browser.close();console.log(JSON.stringify(checks,null,2));
}
