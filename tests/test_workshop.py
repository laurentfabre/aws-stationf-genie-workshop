"""Offline checks; mocks do not establish Databricks or Trial compatibility."""
import ast
import copy
import hashlib
import importlib.util
import json
import re
import sqlite3
import sys
import tempfile
import types
import unittest
import zipfile
from contextlib import closing
from html.parser import HTMLParser
from pathlib import Path
from unittest.mock import Mock, patch
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT/'src'))
import installer as install

BUNDLE = json.loads((ROOT/'data/bundle.json').read_text())
CAT = 'workshop'
SCHEMA = 'stationf_20261124_test'
OWNER = 'learner@example.org'
WH = '1234567890abcdef'


class Row(dict):
    def asDict(self): return dict(self)
    def __getattr__(self, name): return self[name]


class Rows:
    def __init__(self, values): self.values = values
    def collect(self): return [Row(x) for x in self.values]


class FakeSpark:
    """Stateful boundary fake: stores rows/properties; does not emulate Spark SQL."""
    def __init__(self):
        self.tables = {}
        self.temporary = {}
        self.mutations = []
        self.catalog = types.SimpleNamespace(
            tableExists=lambda name: name in self.tables,
            dropTempView=lambda name: self.temporary.pop(name, None))

    def table(self, full): return Rows(self.tables[full.replace('`','')]['rows'])

    def createDataFrame(self, rows, schema):
        return types.SimpleNamespace(createOrReplaceTempView=lambda name: self.temporary.update({name: copy.deepcopy(rows)}))

    def sql(self, query):
        if query.startswith('SHOW TBLPROPERTIES '):
            full = query.split(' ',2)[2].replace('`','')
            return Rows([{'key':k,'value':v} for k,v in self.tables[full]['props'].items()])
        self.mutations.append(query)
        if query.startswith('CREATE SCHEMA '): return Rows([])
        if query.startswith('CREATE TABLE '):
            full = query.split(' ')[2].replace('`','')
            if full in self.tables: raise RuntimeError('Concurrent table collision')
            temp = re.search(r'FROM `([^`]+)`$', query)[1]
            pairs = re.findall(r"'([^']+)'='([^']+)'", query)
            self.tables[full] = {'rows':copy.deepcopy(self.temporary[temp]),'props':dict(pairs)}
            return Rows([])
        raise AssertionError('Unexpected mutation: '+query)


def fake_types():
    module = types.ModuleType('pyspark.sql.types')
    for name in ('StructType','StructField','StringType','LongType','DoubleType'):
        setattr(module, name, lambda *args: args)
    return {'pyspark':types.ModuleType('pyspark'), 'pyspark.sql':types.ModuleType('pyspark.sql'), 'pyspark.sql.types':module}


def install_fake(spark, owner=OWNER):
    plan = install.installation_plan(spark, BUNDLE, CAT, SCHEMA, owner)
    with patch.dict(sys.modules, fake_types()):
        install.install_tables(spark, BUNDLE, CAT, SCHEMA, owner, plan)
    return plan


class DatasetTests(unittest.TestCase):
    def test_bundle_matches_canonical_sources(self):
        for name in install.TABLES:
            self.assertEqual(BUNDLE['tables'][name], json.loads((ROOT/'data'/f'{name}.json').read_text()))
            self.assertEqual(set(BUNDLE['column_descriptions'][name]), set(BUNDLE['tables'][name][0]))
        self.assertEqual(BUNDLE['sql'], {p.stem:p.read_text() for p in (ROOT/'sql').glob('*.sql')})
        self.assertEqual(BUNDLE['expected'], json.loads((ROOT/'data/reference-results.json').read_text())['results'])

    def test_keys_and_join_cardinality(self):
        accounts = BUNDLE['tables']['account_snapshot']
        opps = BUNDLE['tables']['opportunities']
        campaigns = BUNDLE['tables']['campaign_weekly']
        self.assertEqual([len(accounts),len(campaigns),len(opps)], [240,48,360])
        ids = {a['account_id'] for a in accounts}
        self.assertEqual(len(ids),240)
        self.assertEqual(len({o['opportunity_id'] for o in opps}),360)
        self.assertTrue(all(o['account_id'] in ids for o in opps))
        self.assertEqual(len({(c['campaign_id'],c['week_start']) for c in campaigns}),48)

    def test_all_reference_queries_on_sqlite(self):
        with closing(sqlite3.connect(ROOT/'site/data/workshop.sqlite')) as db:
            db.row_factory = sqlite3.Row
            for name, sql in BUNDLE['sql'].items():
                with self.subTest(query=name):
                    install.check_rows([dict(r) for r in db.execute(sql)], BUNDLE['expected'][name])

    def test_sqlite_matches_full_json_data(self):
        with closing(sqlite3.connect(ROOT/'site/data/workshop.sqlite')) as db:
            db.row_factory = sqlite3.Row
            for name in install.TABLES:
                self.assertEqual(install.payload_hash([dict(r) for r in db.execute(f'SELECT * FROM {name}')]), install.payload_hash(BUNDLE['tables'][name]))

    def test_business_boundaries_and_missingness(self):
        rows = BUNDLE['tables']['account_snapshot']
        self.assertEqual(sum(a['telemetry_complete']==0 for a in rows),12)
        self.assertEqual(sum(c['attribution_complete']==0 for c in BUNDLE['tables']['campaign_weekly']),2)
        self.assertEqual(sum(o['amount_verified']==0 for o in BUNDLE['tables']['opportunities']),11)
        retention = BUNDLE['expected']['retention']
        self.assertEqual(len(retention),8)
        self.assertEqual(sum(a['mrr_eur'] for a in retention),33700)
        self.assertEqual(BUNDLE['expected']['empty'],[{'opportunities_2028':0}])

    def test_thresholds_zero_base_and_incomplete_telemetry(self):
        with closing(sqlite3.connect(':memory:')) as db:
            with closing(sqlite3.connect(ROOT/'site/data/workshop.sqlite')) as source: source.backup(db)
            db.row_factory=sqlite3.Row
            db.execute('DELETE FROM account_snapshot')
            for identity,previous,current,complete,renewal in [
                ('BOUND40',100,60,1,'2026-12-17'), ('OVER40',100,59,1,'2026-12-17'),
                ('ZERO',0,0,1,'2026-12-17'), ('MISSING',100,0,0,'2026-12-17'),
                ('OUTSIDE',100,0,1,'2026-12-18'), ('BOUND105',100,105,1,'2026-12-17')]:
                db.execute("INSERT INTO account_snapshot VALUES (?, 'Edge test','PME','ZZ',100,?,?,?,?,1,'2026-11-17')",(identity,previous,current,complete,renewal))
            self.assertEqual({r['account_id'] for r in db.execute(BUNDLE['sql']['retention'])},{'OVER40'})
            tiers={r['engagement_tier']:r['accounts'] for r in db.execute(BUNDLE['sql']['activation'])}
            self.assertEqual(tiers,{'Stable':1,'À revoir':2,'Engagé':1,'Preuve insuffisante':2})

    def test_weighted_marketing_ratio_and_zero_denominator(self):
        with closing(sqlite3.connect(':memory:')) as db:
            with closing(sqlite3.connect(ROOT/'site/data/workshop.sqlite')) as source: source.backup(db)
            db.row_factory=sqlite3.Row
            db.execute("INSERT INTO campaign_weekly VALUES ('T01','Test Weight','2026-10-05',10,1,1,1,100,1,'2026-11-17')")
            db.execute("INSERT INTO campaign_weekly VALUES ('T01','Test Weight','2026-10-12',90,1,1,1,90,1,'2026-11-17')")
            results={r['channel']:r for r in db.execute(BUNDLE['sql']['marketing'])}
            self.assertEqual(results['Test Weight']['attributed_roas'],1.9)
            self.assertIsNone(results['Expérimentation']['acquisition_cost_eur'])
            self.assertEqual(results['Paid Social']['spend_excluded_eur'],8000)

    def test_result_comparison_preserves_null_and_tolerances(self):
        self.assertTrue(install.check_rows([{'channel':'X','roas':3.00001,'cost':None}], [{'channel':'X','roas':3.0,'cost':None}]))
        for actual, expected in [([{'x':0}],[{'x':None}]),([{'n':2.01}],[{'n':2}]),([{'roas':3.1}],[{'roas':3.0}]),([{'x':float('nan')}],[{'x':1.0}])]:
            with self.assertRaises(AssertionError): install.check_rows(actual,expected)


class InstallTests(unittest.TestCase):
    def test_mixed_numeric_json_becomes_valid_spark_input(self):
        original=BUNDLE['tables']['opportunities']
        prepared=install.prepare_rows(original)
        self.assertEqual({type(r['probability']) for r in prepared},{float})
        self.assertEqual(install.payload_hash(original),install.payload_hash(prepared))
        self.assertEqual({type(r['amount_eur']) for r in prepared},{int})

    def test_explicit_namespace(self):
        self.assertEqual(install.namespace(CAT,SCHEMA),'`workshop`.`stationf_20261124_test`')
        for catalog,schema in [('',SCHEMA),('bad;name',SCHEMA),(CAT,'main'),(CAT,'stationf_20261124_')]:
            with self.assertRaises(ValueError): install.namespace(catalog,schema)

    def test_first_install_then_rerun_no_overwrite(self):
        spark=FakeSpark()
        self.assertTrue(all(a=='CREATE' for _,a in install_fake(spark)))
        snapshot=copy.deepcopy(spark.tables)
        spark.mutations.clear()
        self.assertTrue(all(a=='UNCHANGED' for _,a in install_fake(spark)))
        self.assertEqual(spark.tables,snapshot)
        self.assertFalse(any(q.startswith('CREATE TABLE') for q in spark.mutations))
        self.assertFalse(spark.temporary)

    def test_partial_install_resumes_missing_table(self):
        spark=FakeSpark();install_fake(spark)
        del spark.tables[f'{CAT}.{SCHEMA}.opportunities']
        self.assertEqual(install_fake(spark), [('account_snapshot','UNCHANGED'),('campaign_weekly','UNCHANGED'),('opportunities','CREATE')])

    def test_foreign_collision_stops_before_any_mutation(self):
        spark=FakeSpark()
        # Last table collides; no earlier absent table may be created.
        spark.tables[f'{CAT}.{SCHEMA}.opportunities']={'rows':[],'props':{}}
        with self.assertRaises(RuntimeError): install_fake(spark)
        self.assertEqual(spark.mutations,[])
        self.assertEqual(len(spark.tables),1)

    def test_changed_rows_and_other_owner_refused(self):
        spark=FakeSpark();install_fake(spark)
        with self.assertRaises(RuntimeError): install.installation_plan(spark,BUNDLE,CAT,SCHEMA,'someone@example.org')
        spark.tables[f'{CAT}.{SCHEMA}.account_snapshot']['rows'][0]['mrr_eur']+=1
        spark.mutations.clear()
        with self.assertRaises(RuntimeError): install_fake(spark)
        self.assertEqual(spark.mutations,[])

    def test_changed_version_refused(self):
        spark=FakeSpark();install_fake(spark)
        spark.tables[f'{CAT}.{SCHEMA}.campaign_weekly']['props']['workshop.dataset']='other'
        with self.assertRaises(RuntimeError): install.installation_plan(spark,BUNDLE,CAT,SCHEMA,OWNER)

    def test_hash_ignores_row_and_key_order(self):
        rows=BUNDLE['tables']['account_snapshot']
        self.assertEqual(install.payload_hash(rows),install.payload_hash([{k:r[k] for k in reversed(r)} for r in reversed(rows)]))

    def test_sql_qualification_nested_queries_and_join(self):
        sql=install.qualify_sql(BUNDLE['sql']['quality'],CAT,SCHEMA)
        self.assertIn('JOIN `workshop`.`stationf_20261124_test`.`account_snapshot` a',sql)
        self.assertNotRegex(sql,r'\b(?:FROM|JOIN)\s+(?:account_snapshot|opportunities|campaign_weekly)\b')


class GenieTests(unittest.TestCase):
    def client(self):
        client=Mock()
        client.genie.list_spaces.return_value=types.SimpleNamespace(spaces=[],next_page_token=None)
        client.genie.create_space.return_value=types.SimpleNamespace(space_id='test-space')
        return client

    def test_payload_structure_and_sources(self):
        payload=install.genie_payload(BUNDLE,CAT,SCHEMA)
        self.assertEqual(payload['version'],2)
        self.assertEqual(len(payload['data_sources']['tables']),3)
        ids=[]
        for array in [payload['config']['sample_questions'],*payload['instructions'].values()]:
            current=[x['id'] for x in array]
            self.assertEqual(current,sorted(current));ids+=current
        self.assertEqual(len(ids),len(set(ids)))
        self.assertTrue(all(re.fullmatch(r'[a-f0-9]{32}',x) for x in ids))
        self.assertLess(len(json.dumps(payload)),3500000)
        self.assertEqual(payload['instructions']['join_specs'][0]['sql'][1],'--rt=FROM_RELATIONSHIP_TYPE_MANY_TO_ONE--')
        for example in payload['instructions']['example_question_sqls']:
            self.assertIsInstance(example['question'],list)
            self.assertIn(f'`{CAT}`.`{SCHEMA}`',example['sql'][0])

    def test_create_then_recover_without_overwriting_student_edits(self):
        client=self.client()
        self.assertEqual(install.ensure_genie(client,BUNDLE,CAT,SCHEMA,WH,OWNER),('test-space','CREATED'))
        args=client.genie.create_space.call_args.kwargs
        edited=json.loads(args['serialized_space'])
        edited['instructions']['text_instructions'][0]['content']=['Learner refinement']
        client.genie.list_spaces.side_effect=[
            types.SimpleNamespace(spaces=[],next_page_token='page2'),
            types.SimpleNamespace(spaces=[types.SimpleNamespace(space_id='test-space',description=args['description'])],next_page_token=None)]
        client.genie.get_space.return_value=types.SimpleNamespace(space_id='test-space',warehouse_id=WH,serialized_space=json.dumps(edited))
        self.assertIn('UNCHANGED',install.ensure_genie(client,BUNDLE,CAT,SCHEMA,WH,OWNER)[1])
        client.genie.create_space.assert_called_once()
        client.genie.update_space.assert_not_called()

    def test_repeated_pagination_and_list_failure_do_not_create(self):
        for response in [types.SimpleNamespace(spaces=[],next_page_token='repeat'),RuntimeError('API denied')]:
            client=self.client()
            if isinstance(response,Exception): client.genie.list_spaces.side_effect=response
            else: client.genie.list_spaces.return_value=response
            with self.assertRaises(RuntimeError): install.ensure_genie(client,BUNDLE,CAT,SCHEMA,WH,OWNER)
            client.genie.create_space.assert_not_called()

    def test_ambiguous_existing_agent_or_changed_sources_refused(self):
        client=self.client();install.ensure_genie(client,BUNDLE,CAT,SCHEMA,WH,OWNER)
        args=client.genie.create_space.call_args.kwargs
        existing=types.SimpleNamespace(space_id='existing',description=args['description'])
        client.genie.create_space.reset_mock()
        client.genie.list_spaces.return_value=types.SimpleNamespace(spaces=[existing,existing],next_page_token=None)
        with self.assertRaises(RuntimeError): install.ensure_genie(client,BUNDLE,CAT,SCHEMA,WH,OWNER)
        client.genie.list_spaces.return_value=types.SimpleNamespace(spaces=[existing],next_page_token=None)
        client.genie.get_space.return_value=types.SimpleNamespace(space_id='existing',warehouse_id=WH,serialized_space='{}')
        with self.assertRaises(RuntimeError): install.ensure_genie(client,BUNDLE,CAT,SCHEMA,WH,OWNER)
        client.genie.create_space.assert_not_called()

    def test_warehouse_success_failure_and_timeout(self):
        def result(state,rows=None):
            return types.SimpleNamespace(status=types.SimpleNamespace(state=state,error=types.SimpleNamespace(message='denied')),statement_id='statement-1',result=types.SimpleNamespace(data_array=rows))
        client=Mock()
        client.statement_execution.execute_statement.return_value=result('SUCCEEDED',[['240']])
        self.assertEqual(install.warehouse_smoke(client,WH,CAT,SCHEMA),'statement-1')
        for response in (result('FAILED'),result('SUCCEEDED',[['239']])):
            client.statement_execution.execute_statement.return_value=response
            with self.assertRaises((RuntimeError,AssertionError)): install.warehouse_smoke(client,WH,CAT,SCHEMA)
        client.statement_execution.execute_statement.return_value=result('RUNNING')
        with patch.object(install.time,'monotonic',side_effect=[0,181]):
            with self.assertRaises(TimeoutError): install.warehouse_smoke(client,WH,CAT,SCHEMA)


class NotebookTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls): cls.nb=json.loads((ROOT/'notebooks/00_START_HERE.ipynb').read_text())

    def test_code_syntax_and_clean_outputs(self):
        for cell in self.nb['cells']:
            if cell['cell_type']=='code':
                ast.parse(''.join(cell['source']))
                self.assertIsNone(cell['execution_count'])
                self.assertEqual(cell['outputs'],[])

    def test_embedded_installer_and_data(self):
        code=''.join(self.nb['cells'][1]['source'])
        self.assertTrue(code.startswith((ROOT/'src/installer.py').read_text()))
        scope={};exec(compile(code,'embedded','exec'),scope)
        self.assertEqual(scope['BUNDLE'],BUNDLE)
        self.assertEqual((ROOT/'site/notebooks/00_START_HERE.ipynb').read_bytes(),(ROOT/'notebooks/00_START_HERE.ipynb').read_bytes())

    def test_failed_rerun_clears_old_success(self):
        cell=''.join(self.nb['cells'][5]['source'])
        scope={'DATA_READY':True,'CHECKS':['stale'],'WAREHOUSE_CHECK':'old','GENIE_URL':'old',
               'dbutils':types.SimpleNamespace(widgets=types.SimpleNamespace(get=lambda name: '')),
               'namespace':install.namespace}
        with self.assertRaises(ValueError): exec(cell,scope)
        self.assertFalse(scope['DATA_READY'])
        self.assertEqual(scope['GENIE_URL'],'')
        with self.assertRaises(RuntimeError): exec(''.join(self.nb['cells'][9]['source']),scope)

    def test_no_remote_download_or_bare_token_requirement(self):
        code='\n'.join(''.join(c['source']) for c in self.nb['cells'] if c['cell_type']=='code')
        for marker in ('requests.get','urlopen','%pip','git clone','DATABRICKS_TOKEN','subprocess.'):
            self.assertNotIn(marker,code)
        self.assertIn('WorkspaceClient()',code)


class Links(HTMLParser):
    def __init__(self): super().__init__(); self.links=[]
    def handle_starttag(self,tag,attrs):
        for key,value in attrs:
            if key in ('href','src') and value: self.links.append(value)


class DistributionTests(unittest.TestCase):
    def test_html_relative_links(self):
        for path in (ROOT/'site').glob('*.html'):
            parser=Links();parser.feed(path.read_text())
            for link in parser.links:
                parts=urlsplit(link)
                if not parts.scheme and parts.path:
                    self.assertTrue((path.parent/unquote(parts.path)).exists(),f'{path.name}: {link}')

    def test_blank_session_bindings(self):
        bindings=json.loads((ROOT/'site/session-bindings.example.json').read_text())
        for key in ('workspace_url','catalog','schema','warehouse_id','genie_url','app_space_url'):
            self.assertEqual(bindings[key],'')

    def test_public_content_no_workspace_credentials_or_local_paths(self):
        forbidden=[r'dapi[a-fA-F0-9]{32}',r'gh[pousr]_[A-Za-z0-9]{24,}',r'adb-\d{8,}',r'/Users/[^/]+/',r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----']
        for path in ROOT.rglob('*'):
            if not path.is_file() or any(x in path.parts for x in ('.git','.validation','node_modules','__pycache__','dist','tests')): continue
            if path.suffix in ('.md','.json','.html','.js','.mjs','.py','.ipynb','.yml'):
                text=path.read_text()
                for pattern in forbidden: self.assertIsNone(re.search(pattern,text),f'{path}: {pattern}')

    def test_extracted_archive_hashes_and_links(self):
        with zipfile.ZipFile(ROOT/'site/participant-kit.zip') as archive:
            manifest=json.loads(archive.read('package-manifest.json'))
            self.assertEqual(set(archive.namelist()),set(manifest)|{'package-manifest.json'})
            for name,digest in manifest.items():
                self.assertNotIn('..',Path(name).parts)
                self.assertFalse(Path(name).is_absolute())
                self.assertEqual(hashlib.sha256(archive.read(name)).hexdigest(),digest)
                self.assertNotIn('organizer',Path(name).parts)
                self.assertNotIn('research',Path(name).parts)
                if name != 'data/workshop.sqlite':
                    expected=(ROOT/'site'/name).read_bytes()
                    if name=='index.html': expected=expected.replace(b'href="participant-kit.zip" class="button">',b'href="README.md" class="button">')
                    self.assertEqual(archive.read(name),expected,f'Stale archive member: {name}')
            self.assertIn('notebooks/00_START_HERE.ipynb',manifest)
            self.assertIn('docs/TRIAL_SETUP.md',manifest)
            self.assertEqual(archive.read('notebooks/00_START_HERE.ipynb'),(ROOT/'notebooks/00_START_HERE.ipynb').read_bytes())
            with tempfile.TemporaryDirectory() as folder:
                archive.extractall(folder)
                for path in Path(folder).glob('*.html'):
                    parser=Links();parser.feed(path.read_text())
                    for link in parser.links:
                        parts=urlsplit(link)
                        if not parts.scheme and parts.path: self.assertTrue((path.parent/unquote(parts.path)).exists(),link)

    def test_pdf_tracks_current_inputs(self):
        spec=importlib.util.spec_from_file_location('packaging_script',ROOT/'scripts/package.py')
        module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
        self.assertEqual((ROOT/'site/pdf-input.sha256').read_text().strip(),module.pdf_hash())
        self.assertTrue((ROOT/'site/guide.pdf').read_bytes().startswith(b'%PDF'))


if __name__=='__main__': unittest.main()
