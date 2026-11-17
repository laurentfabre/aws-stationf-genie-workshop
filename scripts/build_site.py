"""Build every participant format from workshop.json and canonical SQL/data."""
import json,html,shutil,sqlite3,csv
from pathlib import Path
R=Path(__file__).resolve().parents[1]; P=R/'site'; C=R/'content'
P.mkdir(exist_ok=True)
(P/'assets').mkdir(exist_ok=True)
(P/'data').mkdir(exist_ok=True)
for name in ['docs','notebooks']:
 shutil.copytree(R/name,P/name,dirs_exist_ok=True)
for name in ['account_snapshot','campaign_weekly','opportunities']:
 shutil.copyfile(R/'data'/f'{name}.json',P/'data'/f'{name}.json')
shutil.copyfile(R/'data/manifest.json',P/'data/manifest.json')
# Rebuild the offline SQLite/CSV copies from the same JSON as the notebook.
db=sqlite3.connect(':memory:')
for name in ['account_snapshot','campaign_weekly','opportunities']:
 rows=json.loads((R/'data'/f'{name}.json').read_text())
 columns=list(rows[0])
 definitions=[]
 for col in columns:
  value=next((row[col] for row in rows if row[col] is not None), None)
  kind='INTEGER' if isinstance(value,int) else 'REAL' if isinstance(value,float) else 'TEXT'
  definitions.append(f'"{col}" {kind}')
 db.execute(f'CREATE TABLE {name} ('+', '.join(definitions)+')')
 db.executemany(f'INSERT INTO {name} VALUES ('+','.join('?' for _ in columns)+')', [[row[c] for c in columns] for row in rows])
 with (P/'data'/f'{name}.csv').open('w',newline='') as f:
  writer=csv.DictWriter(f,fieldnames=columns,lineterminator='\n');writer.writeheader();writer.writerows(rows)
db.commit()
target=sqlite3.connect(P/'data/workshop.sqlite')
db.backup(target)
target.close()
db.close()
shutil.copytree(R/'sql',P/'sql',dirs_exist_ok=True)
W=json.loads((R/'workshop.json').read_text()); E=html.escape
W['sql']={p.stem:p.read_text() for p in sorted((P/'sql').glob('*.sql'))}
shutil.copyfile(R/'data/reference-results.json',P/'reference-results.json')
for n in ['portal.css','portal.js']:shutil.copyfile(C/n,P/'assets'/n)
raw=json.dumps(W,ensure_ascii=False).replace('<','\\u003c')
(P/'index.html').write_text((C/'portal.html').read_text().replace('__DATA__',raw))
def pre(s):return '<pre>'+E(s)+'</pre>'
def query(t):return pre(W['sql'][t['query']])
def md_track(t):
 s=f"# {t['title']}\n\n{t['subtitle']}\n\n## Votre décision\n\n{t['decision']}\n\nMétier : {t['owner']}. Un binôme choisit un seul parcours.\n\n## Sources et règles\n\n{t['contract']}\n\nSources : "+', '.join('{{catalog}}.{{schema}}.'+n for n in t['tables'])+". Utilisez le namespace du reçu du notebook d’installation.\n\n## 1. Investiguer avec Genie\n\n"
 s+='\n\n'.join(f'{i+1}. {q}' for i,q in enumerate(t['questions']))
 s+='\n\nConservez conversation, SQL, résultat, identité, date et incertitude.\n\n## 2. Construire\n\n```text\n'+t['builder_initial']+'\n```\n\n## 3. Itérer\n\nConsignez d’abord les observations réelles et ajoutez-les au prompt.\n\n```text\n'+t['builder_iteration']+'\n```\n\n## 4. Vérifier\n\n| Cas | Attendu | Statut |\n|---|---|---|\n'
 s+='\n'.join('| '+c[0]+' | '+c[1]+' | NOT RUN |' for c in t['checks'])
 s+='\n\n```sql\n'+W['sql'][t['query']]+'\n```\n\nLes résultats locaux sont dans reference-results.json ; ne prouvent pas un résultat live.\n\n## 5. Présenter et décider\n\n30 s problème, 60 s application ou analyse, 60 s preuve et limite, 30 s prochaine étape. Exportez URL/version, SQL/résultat, statut de chaque contrôle, responsable et date.\n\n## Si bloqué\n\n'+t['fallback']+'\n'
 return s
parts=['<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Guide participant · STATION F</title><link rel="stylesheet" href="assets/portal.css"></head><body><main class="guide"><div class="brands"><img src="assets/databricks-logo.svg" alt="Databricks"><img class="aws" src="assets/aws-logo.png" alt="AWS"></div><p class="eyebrow">AWS × DATABRICKS · 24 NOVEMBRE 2026</p><h1>De la question<br>à la décision.</h1><p>Guide participant — français, niveau 100/200. Atelier 09:45–11:45, AWS Office, STATION F, Paris.</p><p class="no-print"><a href="index.html">Retour au portail</a> · <button onclick="window.print()">Imprimer / enregistrer en PDF</button></p><div class="notice">Toutes les données de NovaFlow sont synthétiques. Les liens workspace et Genie viennent du reçu du notebook ; l’App Space nécessite la préparation Builder. Le portail et ce guide fonctionnent hors ligne ; Genie, SQL Databricks et Builder nécessitent une connexion.</div>'+(C/'start.html').read_text()+'<h2>Votre livrable</h2><p>Une question, une conversation avec SQL inspecté, un contrat de métrique, une comparaison, une limite et une prochaine étape. Si Builder est disponible : un aperçu puis une version améliorée, vérifiés séparément d’un déploiement.</p><h2>Deux heures de pratique</h2><table>']
parts += ['<tr>'+''.join('<td>'+E(v)+'</td>' for v in a)+'</tr>' for a in W['agenda']]
parts += ['</table><h2>Préflight</h2><ol><li>Connectez-vous à votre Trial et ouvrez le Genie Agent créé par le notebook.</li><li>Vérifiez les sources, leurs droits et la date de référence.</li><li>Confirmez l’accès à Apps → Build, l’App Space et l’autorisation utilisateur.</li><li>Choisissez un seul parcours et notez les rôles du binôme.</li></ol><p>Genie One sert à la découverte générale ; un Genie Agent est préparé sur un domaine ; Genie Code accompagne les développeurs ; Genie App Builder génère une application dans un App Space. Ce sont des surfaces distinctes.</p>']
for t in W['tracks']:
 (P/f"track-{t['id']}.md").write_text(md_track(t))
 parts+=['<section class="track"><div class="eyebrow">'+E(t['tag'])+'</div><h2>'+E(t['title'])+'</h2><p>'+E(t['decision'])+'</p><h3>Contrat de données</h3><p>'+E(t['contract'])+'</p><h3>1. Investiguer</h3><ol>'+''.join('<li>'+E(q)+'</li>' for q in t['questions'])+'</ol><h3>2. Construire</h3><p>Remplacez les bindings par les valeurs confirmées ; ne les devinez pas.</p>'+pre(t['builder_initial'])+'<h3>3. Améliorer</h3><p>Ajoutez vos observations réelles au prompt ci-dessous.</p>'+pre(t['builder_iteration'])+'<h3>4. Vérifier</h3><table><tr><th>Cas</th><th>Attendu</th></tr>'+''.join('<tr><td>'+E(a)+'</td><td>'+E(b)+'</td></tr>' for a,b in t['checks'])+'</table>'+query(t)+'<p>Références locales : reference-results.json. Statuts : PASS / FAIL / BLOCKED / NOT RUN / NOT APPLICABLE (motif). Comparer à identité, dataset, filtres et date identiques.</p><h3>5. Présenter et décider</h3><p>Trois minutes : 30 s problème, 60 s usage construit, 60 s preuve et limite, 30 s prochaine action. Si bloqué : '+E(t['fallback'])+'</p></section>']
parts+=['<section class="track"><h2>Cahier de décision</h2><p>Les notes du portail sont individuelles et locales. Exportez JSON pour restaurer et Markdown pour partager. Un changement de navigateur ou d’origine nécessite un export/import ; aucune synchronisation entre binômes. Sans stockage disponible, le portail affiche un rappel d’export.</p>'+''.join('<h3>'+E(label)+'</h3><p>........................................................................................................</p>' for _,label in W['workbook_fields'])+'<h2>Reprise</h2><p>Builder indisponible : approfondir l’analyse Genie et conserver la spécification. Genie indisponible : exécuter le SQL de référence si autorisé. Sans réseau : examiner données locales et résultats datés. Ces chemins ne valident pas les opérations non réalisées.</p><h2>Documentation</h2>'+''.join('<p><a href="'+E(d['url'])+'">'+E(d['label'])+'</a></p>' for d in W['docs'])+'</section></main></body></html>']
(P/'guide.html').write_text('\n'.join(parts))
(P/'decision-workbook.md').write_text('# Cahier de décision — AWS STATION F\n\n24 novembre 2026 · Dataset stationf-synthetic-v1\n\n'+'\n'.join('## '+label+'\n\nÀ renseigner.\n' for _,label in W['workbook_fields'])+'\nStatuts : PASS / FAIL / BLOCKED / NOT RUN / NOT APPLICABLE (motif).\n')
with (P/'decision-workbook.csv').open('w',newline='') as f:
 w=csv.writer(f,lineterminator='\n');w.writerow(['equipe','parcours','question','app_url_version','preuve_sql','controle','attendu','observe','statut','identite','horodatage','limite','action','responsable','echeance']);
 for t in W['tracks']:
  for case,expect in t['checks']:w.writerow(['',t['id'],'','','',case,expect,'','NOT RUN','','','','','',''])
(P/'session-bindings.example.json').write_text(json.dumps(W['bindings'],ensure_ascii=False,indent=2)+'\n')
(P/'DATA_CONTRACT.md').write_text('# Contrat de données — stationf-synthetic-v1\n\nArrêté au 17 novembre 2026 ; EUR ; aucune donnée personnelle ou client réelle. Les dates ISO sont stockées en chaînes YYYY-MM-DD dans les fichiers et tables d’atelier. Comparer lexicalement sur ce format ou convertir explicitement en DATE. Les comptes et opportunités sont un snapshot unique, pas un historique.\n\n'+ '\n\n'.join('## '+t['title']+'\n\n'+t['contract'] for t in W['tracks'])+'\n\n## Colonnes\n\n'+ '\n\n'.join('### '+n+'\n\n'+', '.join(json.loads((P/'data'/f'{n}.json').read_text())[0].keys()) for n in ['account_snapshot','campaign_weekly','opportunities'])+'\n\n## Limites\n\nAucune causalité, prédiction ML entraînée, rentabilité nette ou donnée temps réel. La population est réduite à 240 comptes, 48 lignes campagne/semaine et 360 opportunités pour rendre la vérification manuelle possible. Les canaux ne peuvent pas être réattribués à partir de ce dataset agrégé. Les trois jeux ne se rejoignent pas pour démontrer un funnel complet.\n')

(P/'trial.html').write_text('<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Installer mon Trial · STATION F</title><link rel="stylesheet" href="assets/portal.css"></head><body><main class="guide"><p><a href="index.html">Retour au portail</a></p><h1>Prêt pour le 24 novembre.</h1>'+ (C/'start.html').read_text()+'</main></body></html>')
(P/'README.md').write_text("# Kit participant — STATION F, 24 novembre 2026\n\nOuvrez index.html, puis « Installer mon atelier ». Le notebook autonome est dans notebooks/00_START_HERE.ipynb. Le guide détaillé est dans docs/TRIAL_SETUP.md.\n\nLes instructions et données se lisent hors ligne. Genie, SQL Databricks et Builder exigent votre connexion au Trial. Builder dépend de sa disponibilité. Les notes du portail restent locales : exportez JSON pour restaurer, Markdown pour partager. Changer de navigateur ou d’origine nécessite un export/import. Aucun serveur partagé de notes.\n\nDonnées entièrement synthétiques. Le propriétaire du Trial n’est pas une identité de test limitée ; sans seconde identité, le refus reste NOT RUN. Consultez docs/VALIDATION.md pour les contrôles réellement exécutés.\n")
# Offline docs are copied under site/: their repository-relative links need rebasing.
for p in (P/'docs').glob('*.md'):
 p.write_text(p.read_text().replace('../site/', '../').replace('../data/', '../data/'))
print('Built public portal, guide and four tracks from canonical public sources')
