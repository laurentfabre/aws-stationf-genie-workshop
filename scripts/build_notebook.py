"""Build self-contained notebooks from public, reviewable source files."""
import hashlib,json,re,shutil
from pathlib import Path
R=Path(__file__).resolve().parents[1]
w=json.loads((R/'workshop.json').read_text())
data={n:json.loads((R/'data'/f'{n}.json').read_text()) for n in ['account_snapshot','campaign_weekly','opportunities']}
sql={p.stem:p.read_text() for p in (R/'sql').glob('*.sql')}
expected=json.loads((R/'data/reference-results.json').read_text())['results']
common={
 'account_id':'Identifiant de compte fictif ; clé unique de account_snapshot, FK non unique dans opportunities.',
 'company':'Nom fictif sans donnée client réelle.', 'segment':'Segment PME, Scale-up ou Entreprise.',
 'country':'Code pays FR, DE ou GB.', 'mrr_eur':'MRR en EUR par mois ; ni revenu perdu ni prévision de perte.',
 'users_previous_28d':'Utilisateurs actifs du 23 septembre au 20 octobre 2026 inclus.',
 'users_current_28d':'Utilisateurs actifs du 21 octobre au 17 novembre 2026 inclus. Un zéro avec telemetry_complete=0 est une absence de preuve.',
 'telemetry_complete':'1 = télémétrie complète ; 0 = preuve insuffisante. Exclure des conclusions de churn et de l’éligibilité.',
 'renewal_date':'Date ISO du prochain renouvellement. R1 : 17/11/2026–17/12/2026 inclus, baisse strictement >40 %.',
 'email_opt_in':'1 = opt-in dans la simulation, 0 = exclu de eligible_for_review. Ne représente pas une autorisation réelle d’envoi.',
 'as_of_date':'Date fixe du snapshot : 2026-11-17. Aucune fraîcheur temps réel.',
 'campaign_id':'Identifiant de campagne. Clé avec week_start ; aucune FK vers account_snapshot.',
 'channel':'Canal marketing ; attribution exclusive au dernier contact dans ce jeu synthétique.',
 'week_start':'Début ISO de semaine/cohorte, du 2026-09-21 au 2026-11-09 inclus.',
 'spend_eur':'Dépenses EUR. Les ratios M1 prennent les seules semaines attribution_complete=1 et montrent les dépenses exclues.',
 'leads':'Nombre de leads ; ne mesure pas à lui seul la performance commerciale.',
 'qualified_leads':'Nombre de leads qualifiés de la cohorte.',
 'new_customers':'Nouveaux clients attribués ; NULL si semaine incomplète. Un zéro donne un coût d’acquisition non calculable.',
 'attributed_net_revenue_eur':'Revenu net attribué en EUR ; ROAS = SUM(revenu)/SUM(dépenses) sur mêmes semaines complètes. Pas de causalité.',
 'attribution_complete':'1 = période comparable ; 0 = attribution manquante, préserver dépenses et couverture visibles.',
 'opportunity_id':'Clé unique de l’opportunité fictive.',
 'stage':'Discovery, Evaluation, Negotiation = ouvert ; Won et Lost exclus du pipeline ouvert.',
 'amount_eur':'Montant EUR de l’opportunité, à retenir seulement si amount_verified=1.',
 'probability':'Pondération pédagogique du stage (20/50/75 % pour ouvert), non calibrée. Pas une prévision ML.',
 'expected_close_date':'Date ISO de clôture prévue. S1 : décembre 2026, borne haute 2027-01-01 exclue.',
 'days_since_activity':'Jours sans activité. Au moins 30 = à revoir, pas automatiquement Lost.',
 'amount_verified':'1 = montant vérifié ; 0 = exclure du KPI et signaler la population.'}
bundle={'version':'stationf-synthetic-v1','tables':data,'sql':sql,'expected':expected,
 'column_descriptions':{n:{k:common[k] for k in rows[0]} for n,rows in data.items()},
 'tracks':[{'id':t['id'],'query':t['query'],'question':t['questions'][0],
 'reference_question':{'marketing':'Compare les canaux sur les semaines complètes du 21 septembre au 9 novembre 2026 : dépenses exclues, ROAS attribué et coût d’acquisition.',
 'activation':'Applique A1 : ratio courant/précédent >=1,05 Engagé ; >=0,60 Stable ; sinon À revoir ; télémétrie incomplète ou base nulle = Preuve insuffisante. Donne effectifs, MRR et éligibilité opt-in par groupe.',
 'retention':'Applique R1 : renouvellement du 17 novembre au 17 décembre 2026 inclus, baisse d’usage strictement >40 %, télémétrie complète et base positive. Liste les comptes par MRR.',
 'sales':'Applique S1 au pipeline ouvert vérifié de décembre 2026 par pays : montant brut, pondéré pédagogique et inactif depuis au moins 30 jours.'}[t['id']]} for t in w['tracks']]}
(R/'data/bundle.json').write_text(json.dumps(bundle,ensure_ascii=False,indent=2)+'\n')
code=(R/'src/installer.py').read_text()
# The notebook contains all rows and SQL. No Git clone, HTTP fetch, token or %run is needed.
cells=[]
def md(s):cells.append({'cell_type':'markdown','metadata':{},'source':s.splitlines(keepends=True)})
def py(s):cells.append({'cell_type':'code','metadata':{},'execution_count':None,'outputs':[],'source':s.splitlines(keepends=True)})
md('''# AWS × Databricks — STATION F · Installer mon atelier

**24 novembre 2026 · Trial Edition · Français**

Ce notebook autonome installe 3 petites tables synthétiques (240 comptes, 48 semaines/campagnes, 360 opportunités), exécute les contrôles de référence et crée votre Genie Agent. Il réutilise votre SQL warehouse et vos droits actuels. Il ne crée pas de compte, ne modifie pas de preview ou d’autorisation, et ne déploie pas votre application à votre place.

1. Dans votre **Trial**, importez ce notebook et choisissez le calcul **Serverless**.
2. Exécutez les cellules jusqu’à **Préparer mon installation** pour voir vos catalogues et warehouses.
3. Renseignez les widgets : catalogue existant, schéma dédié `stationf_20261124_votre_equipe`, warehouse ID. Choisissez `installer`.
4. Exécutez **Installer et vérifier**, puis **Créer mon Genie Agent**. Une relance conserve données et instructions si elles sont compatibles.

Les données sont embarquées : aucun accès sortant vers GitHub depuis le calcul n’est nécessaire. Ne lancez qu’une installation à la fois pour un même schéma. **App Builder est une étape conditionnelle distincte** ; voir `docs/APP_BUILDER.md`.
''')
py(code+'\n\nBUNDLE = json.loads('+repr(json.dumps(bundle,ensure_ascii=False))+')\n')
md('''## Préparer mon installation

Cette cellule lit votre environnement sans créer de ressources. Choisissez vous-même un catalogue existant et le warehouse proposé dans **SQL Warehouses**. Si la liste est vide ou inaccessible, le facilitateur doit vérifier votre essai et vos droits.

Le mode `verifier` permet de relire un dataset déjà installé sans créer de ressource ; il ne prouve pas qu’un nouvel essai est prêt.
''')
py('''from databricks.sdk import WorkspaceClient
from html import escape
from datetime import datetime, timezone

# Authentication native au notebook courant ; aucun token à copier.
w = WorkspaceClient()
OWNER = spark.sql("SELECT current_user() AS identity").first()['identity']
HOST = w.config.host.rstrip('/')
print('Workspace :', HOST)
print('Identité :', OWNER)
print('Catalogues visibles :')
display(spark.sql('SHOW CATALOGS'))
print('Warehouses accessibles (aucun nouveau warehouse ne sera créé) :')
try:
    for wh in w.warehouses.list():
        print(wh.id, wh.name, getattr(wh.state, 'value', wh.state))
except Exception as exc:
    print('Liste indisponible. Copier votre Warehouse ID depuis SQL Warehouses. Détail :', str(exc)[:600])

dbutils.widgets.text('catalog', '', '1. Catalogue existant')
dbutils.widgets.text('schema', '', '2. Schéma stationf_20261124_equipe')
dbutils.widgets.text('warehouse_id', '', '3. SQL warehouse ID')
dbutils.widgets.dropdown('action', 'revue', ['revue','installer','verifier'], '4. Action')
''')
md('''## Installer et vérifier

`installer` crée seulement les trois tables dans votre schéma dédié. Une table existante doit porter le bon identifiant d’atelier, propriétaire et contenu. Toute collision arrête l’installation **avant création de nouvelles tables**. Les références comparent le jeu réel au dataset fourni ; elles ne sont pas des réponses mises en cache pour Genie.
''')
py('''# Invalidate previous success before any validation, including a failed rerun.
DATA_READY = False
CHECKS = []
WAREHOUSE_CHECK = ''
GENIE_URL = ''
GENIE_STATUS = 'NOT RUN — cellule Genie non exécutée'
SPACE_ID = ''
CATALOG = dbutils.widgets.get('catalog').strip()
SCHEMA = dbutils.widgets.get('schema').strip()
WAREHOUSE_ID = dbutils.widgets.get('warehouse_id').strip()
ACTION = dbutils.widgets.get('action')
namespace(CATALOG, SCHEMA)
if ACTION not in ('revue','installer','verifier'):
    raise ValueError('Action inconnue.')
if not re.fullmatch(r'[a-fA-F0-9]{16}', WAREHOUSE_ID):
    raise ValueError('Copiez le SQL warehouse ID de 16 caractères avant installation.')
# Verify this warehouse exists under the notebook user before any table creation.
w.warehouses.get(id=WAREHOUSE_ID)
PLAN = installation_plan(spark, BUNDLE, CATALOG, SCHEMA, OWNER)
print('Plan :', PLAN)
if ACTION == 'revue':
    raise ValueError('Revue terminée sans modification. Choisissez installer ou verifier, puis relancez cette cellule.')
if ACTION == 'installer':
    install_tables(spark, BUNDLE, CATALOG, SCHEMA, OWNER, PLAN)
elif any(action != 'UNCHANGED' for _, action in PLAN):
    raise ValueError('Tables absentes. Choisir installer pour créer le dataset.')
CHECKS = verify_tables(spark, BUNDLE, CATALOG, SCHEMA)
print(json.dumps(CHECKS, ensure_ascii=False, indent=2))
WAREHOUSE_CHECK = warehouse_smoke(w, WAREHOUSE_ID, CATALOG, SCHEMA)
print('PASS — accès au dataset depuis le warehouse ; statement :', WAREHOUSE_CHECK)
DATA_READY = True
''')
md('''## Créer mon Genie Agent

Cette cellule crée un Agent dédié avec les sources, descriptions de colonnes, questions et SQL contrôlés. Le mode `verifier` ignore la création. Une relance retrouve l’Agent par son marqueur et conserve les améliorations des participants. En cas d’erreur API, vos tables restent disponibles : suivre `docs/TROUBLESHOOTING.md` pour créer l’Agent dans l’interface.

La présence d’un Agent n’établit pas la justesse de ses réponses. Ouvrez-le, posez une question du parcours, inspectez le SQL et comparez aux références.
''')
py('''if not globals().get('DATA_READY'):
    raise RuntimeError('Exécutez et réussissez Installer et vérifier avant de créer Genie.')
GENIE_URL = ''
GENIE_STATUS = 'NOT RUN — mode verifier'
if ACTION == 'installer':
    required = ('create_space','list_spaces','get_space')
    if not all(hasattr(w.genie, name) for name in required):
        raise RuntimeError('SDK notebook trop ancien. Créez l’Agent dans l’interface, ou mettez à jour databricks-sdk selon docs/TROUBLESHOOTING.md.')
    try:
        SPACE_ID, GENIE_STATUS = ensure_genie(w, BUNDLE, CATALOG, SCHEMA, WAREHOUSE_ID, OWNER)
        GENIE_URL = f'{HOST}/genie/rooms/{SPACE_ID}'
        displayHTML(f'<h3>{escape(GENIE_STATUS)}</h3><p><a href="{escape(GENIE_URL, quote=True)}" target="_blank">Ouvrir mon Genie Agent</a></p>')
    except Exception as exc:
        GENIE_STATUS = 'BLOCKED — voir erreur de création Genie'
        print('Genie : BLOCKED. Les tables validées restent installées. Aucune réponse live simulée.')
        print('Utiliser la procédure manuelle : docs/TROUBLESHOOTING.md')
        raise
''')
md('''## Mon reçu et mes liens

Conservez le reçu dans les sorties du notebook. Dans le portail participant, ouvrez **Liens de session et environnement** et reportez workspace/catalogue/schéma/warehouse/Genie. L’App Space se prépare avec le facilitateur ; aucune URL de Builder n’est inventée.

Les contrôles d’accès avec un deuxième utilisateur et les fonctions Beta ne sont pas validés par votre compte administrateur Trial.
''')
py('''if not globals().get('DATA_READY'):
    raise RuntimeError('Installation ou vérification incomplète : aucun reçu de réussite disponible.')
receipt = {
    'workshop': WORKSHOP, 'dataset': DATASET, 'timestamp_utc': datetime.now(timezone.utc).isoformat(),
    'workspace_url': HOST, 'identity': OWNER, 'catalog': CATALOG, 'schema': SCHEMA,
    'warehouse_id': WAREHOUSE_ID, 'warehouse_statement_id': WAREHOUSE_CHECK,
    'tables': {name: len(rows) for name, rows in BUNDLE['tables'].items()},
    'reference_checks': CHECKS, 'genie_status': GENIE_STATUS, 'genie_url': GENIE_URL,
    'genie_answers': 'NOT RUN — à vérifier pendant l’exercice',
    'app_builder': 'NOT RUN — vérifier région, preview et App Space',
    'participant_access': 'NOT RUN — identité et permissions à tester séparément'
}
print(json.dumps(receipt, ensure_ascii=False, indent=2))
print('Bindings à reporter dans le portail :')
print(json.dumps({k:receipt[k] for k in ['workspace_url','catalog','schema','warehouse_id','genie_url']}, indent=2))
print('SQL de référence :')
for query_id, query in sorted(BUNDLE['sql'].items()):
    print('\\n--', query_id, '\\n', qualify_sql(query, CATALOG, SCHEMA))
''')
nb={'nbformat':4,'nbformat_minor':5,'metadata':{'kernelspec':{'display_name':'Python 3','language':'python','name':'python3'},'language_info':{'name':'python'}},'cells':cells}
for i,c in enumerate(cells):c['id']=hashlib.sha256(str(i).encode()).hexdigest()[:8]
(R/'notebooks/00_START_HERE.ipynb').write_text(json.dumps(nb,ensure_ascii=False,indent=2)+'\n')
source=['# Databricks notebook source']
for i,c in enumerate(cells):
 if i:source.append('# COMMAND ----------')
 s=''.join(c['source'])
 source.append('# MAGIC %md\n'+'\n'.join(('# MAGIC '+line).rstrip() for line in s.splitlines()) if c['cell_type']=='markdown' else s)
(R/'notebooks/00_START_HERE.py').write_text('\n\n'.join(source).rstrip()+'\n')
print('Built self-contained notebook:',len(cells),'cells; no remote downloads')
