"""Trial notebook installer. No tokens, network downloads, or account configuration."""
import hashlib
import json
import math
import re
import time
from decimal import Decimal

WORKSHOP = 'stationf-20261124'
DATASET = 'stationf-synthetic-v1'
TABLES = ('account_snapshot', 'campaign_weekly', 'opportunities')


def ident(value):
    if not isinstance(value, str) or not re.fullmatch(r'[A-Za-z_][A-Za-z0-9_]*', value):
        raise ValueError('Nom requis : lettres, chiffres et underscore, sans espaces.')
    return value


def namespace(catalog, schema):
    ident(catalog); ident(schema)
    if not re.fullmatch(r'stationf_20261124_[A-Za-z0-9_]+', schema):
        raise ValueError('Utilisez un schéma dédié : stationf_20261124_votre_equipe.')
    return f'`{catalog}`.`{schema}`'


def literal(value):
    # Escape SQL strings without relying on backslash behavior.
    return "'" + str(value).replace('\\', '\\\\').replace("'", "''") + "'"


def payload_hash(rows):
    # SQL DOUBLE returns 0.0/1.0 where JSON may use 0/1; compare numeric values.
    def numeric(value):
        return int(value) if isinstance(value, float) and value.is_integer() else value
    canonical = sorted(json.dumps({k:numeric(v) for k,v in row.items()}, ensure_ascii=False, sort_keys=True, separators=(',', ':')) for row in rows)
    raw = '\n'.join(canonical)
    return hashlib.sha256(raw.encode()).hexdigest()


def prepare_rows(rows):
    """Give mixed JSON numeric columns a consistent Spark-compatible Python type."""
    floating = {col for col in rows[0] if any(isinstance(row[col], float) for row in rows)}
    return [{col:float(value) if col in floating and value is not None else value
             for col,value in row.items()} for row in rows]


def qualify_sql(sql, catalog, schema):
    ns = namespace(catalog, schema)
    # Only replace identifiers at FROM/JOIN positions; never values or column names.
    pattern = r'\b(FROM|JOIN)\s+(' + '|'.join(TABLES) + r')\b'
    return re.sub(pattern, lambda m: f'{m[1]} {ns}.`{m[2]}`', sql, flags=re.I)


def check_rows(actual, expected):
    """Order independent row comparison, numeric tolerance, NULLs remain NULL."""
    if len(actual) != len(expected):
        raise AssertionError(f'Nombre de lignes : {len(actual)}, attendu {len(expected)}')
    # Stable sort on nonnumeric dimensions; queries with only numeric totals are single-row.
    def key(row):
        return tuple(str(row[k]) for k in sorted(row) if isinstance(row[k], str))
    for got, want in zip(sorted(actual, key=key), sorted(expected, key=key)):
        if set(got) != set(want):
            raise AssertionError(f'Colonnes inattendues : {set(got) ^ set(want)}')
        for col, value in want.items():
            other = got[col]
            if value is None:
                if other is not None: raise AssertionError(f'{col}: NULL attendu')
            elif isinstance(value, (int, float)):
                tolerance = 0 if isinstance(value, int) else (0.0001 if 'roas' in col else 0.01)
                if other is None or not math.isfinite(float(other)) or abs(Decimal(str(other))-Decimal(str(value))) > Decimal(str(tolerance)):
                    raise AssertionError(f'{col}: {other}, attendu {value}')
            elif other != value:
                raise AssertionError(f'{col}: {other}, attendu {value}')
    return True


def installation_plan(spark, bundle, catalog, schema, owner):
    """Inspect ALL existing tables before any mutation, including row content."""
    ns = namespace(catalog, schema)
    actions = []
    for name in TABLES:
        full = f'{ns}.`{name}`'
        exists = spark.catalog.tableExists(f'{catalog}.{schema}.{name}')
        if exists:
            props = {r.key: r.value for r in spark.sql(f'SHOW TBLPROPERTIES {full}').collect()}
            required = {'workshop.id': WORKSHOP, 'workshop.dataset': DATASET,
                        'workshop.owner': owner, 'workshop.payload': payload_hash(bundle['tables'][name])}
            if any(props.get(k) != v for k, v in required.items()):
                raise RuntimeError(f'Collision ou contenu/version/propriétaire différent : {full}. Aucun écrasement.')
            actual = [r.asDict() for r in spark.table(full).collect()]
            if payload_hash(actual) != payload_hash(bundle['tables'][name]):
                raise RuntimeError(f'Données modifiées dans {full}. Relancez dans un nouveau schéma ; aucun écrasement.')
            actions.append((name, 'UNCHANGED'))
        else:
            actions.append((name, 'CREATE'))
    return actions


def install_tables(spark, bundle, catalog, schema, owner, plan):
    from pyspark.sql.types import StructType, StructField, StringType, LongType, DoubleType
    ns = namespace(catalog, schema)
    # Catalog is deliberately never created or selected by this installer.
    spark.sql(f'CREATE SCHEMA IF NOT EXISTS {ns}')
    for name, action in plan:
        if action == 'UNCHANGED':
            print(f'UNCHANGED {catalog}.{schema}.{name}')
            continue
        rows = prepare_rows(bundle['tables'][name])
        fields = []
        for col in rows[0]:
            value = next((r[col] for r in rows if r[col] is not None), None)
            datatype = LongType() if isinstance(value, int) else DoubleType() if isinstance(value, float) else StringType()
            fields.append(StructField(col, datatype, True))
        frame = spark.createDataFrame(rows, StructType(fields))
        temp = '__stationf_' + name
        frame.createOrReplaceTempView(temp)
        props = {'workshop.id': WORKSHOP, 'workshop.dataset': DATASET,
                 'workshop.owner': owner, 'workshop.payload': payload_hash(rows)}
        pairs = ', '.join(f'{literal(k)}={literal(v)}' for k, v in props.items())
        try:
            # No IF NOT EXISTS: a concurrent creation must fail instead of being adopted.
            # Ownership properties are committed with the table, without a creation/marking gap.
            spark.sql(f'CREATE TABLE {ns}.`{name}` USING DELTA TBLPROPERTIES ({pairs}) AS SELECT * FROM `{temp}`')
        finally:
            spark.catalog.dropTempView(temp)
        print(f'CREATED {catalog}.{schema}.{name} ({len(rows)} lignes)')
    return plan


def verify_tables(spark, bundle, catalog, schema):
    checks = []
    for query_id, sql in sorted(bundle['sql'].items()):
        actual = [r.asDict() for r in spark.sql(qualify_sql(sql, catalog, schema)).collect()]
        check_rows(actual, bundle['expected'][query_id])
        checks.append({'query': query_id, 'status': 'PASS', 'rows': len(actual)})
    return checks


def stable_id(label):
    return hashlib.sha256((WORKSHOP + ':' + label).encode()).hexdigest()[:32]


def genie_payload(bundle, catalog, schema):
    namespace(catalog, schema)
    sources = []
    for table in sorted(TABLES):
        columns = []
        for name, desc in sorted(bundle['column_descriptions'][table].items()):
            column = {'column_name': name, 'description': [desc]}
            if name in ('country','segment','channel','stage'):
                column.update(enable_format_assistance=True, enable_entity_matching=True)
            columns.append(column)
        sources.append({'identifier':f'{catalog}.{schema}.{table}', 'column_configs':columns})
    examples = []
    questions = []
    for track in bundle['tracks']:
        questions.append({'id':stable_id('sample:'+track['id']), 'question':[track['question']]})
        examples.append({'id':stable_id('sql:'+track['id']), 'question':[track['reference_question']],
                         'sql':[qualify_sql(bundle['sql'][track['query']],catalog,schema)]})
    return {'version':2,'config':{'sample_questions':sorted(questions,key=lambda x:x['id'])},
            'data_sources':{'tables':sources},
            'instructions':{'example_question_sqls':sorted(examples,key=lambda x:x['id']),
              'text_instructions':[{'id':stable_id('general'),'content':[
                '## PURPOSE\n- Atelier français Sales & Marketing, entreprise fictive NovaFlow. Données synthétiques arrêtées au 17 novembre 2026.\n\n## DISAMBIGUATION\n- En cas de demande ambiguë, préciser la période et la définition avant de conclure.\n\n## CONSTRAINTS\n- Les règles pédagogiques ne sont pas des prédictions ML. Aucun envoi marketing ou modification CRM.\n\n## Instructions you must follow when providing summaries\n- Expliquer filtres, unités, exclusions et limites. Un résultat attribué ne prouve pas un effet causal.'
              ]}],
              'join_specs':[{'id':stable_id('account-opportunity'),
                 'left':{'identifier':f'{catalog}.{schema}.opportunities','alias':'opportunities'},
                 'right':{'identifier':f'{catalog}.{schema}.account_snapshot','alias':'account_snapshot'},
                 'sql':['`opportunities`.`account_id` = `account_snapshot`.`account_id`',
                        '--rt=FROM_RELATIONSHIP_TYPE_MANY_TO_ONE--']}]}}


def ensure_genie(client, bundle, catalog, schema, warehouse_id, owner):
    """Recover by ownership marker, and preserve learner edits on rerun."""
    namespace(catalog, schema)
    if not re.fullmatch(r'[a-fA-F0-9]{16}', warehouse_id):
        raise ValueError('Warehouse ID requis : copier ses 16 caractères depuis SQL Warehouses.')
    marker = f'[{WORKSHOP}:{catalog}.{schema}:{hashlib.sha256(owner.encode()).hexdigest()[:12]}]'
    matches = []
    token = None
    seen = set()
    while True:
        page = client.genie.list_spaces(page_size=100, page_token=token)
        for space in page.spaces or []:
            if marker in (space.description or ''): matches.append(space)
        token = page.next_page_token
        if not token: break
        if token in seen: raise RuntimeError('Pagination Genie répétée ; arrêt avant création.')
        seen.add(token)
    if len(matches)>1:
        raise RuntimeError('Plusieurs Agents pour cette édition. Choisissez avec le facilitateur ; aucun doublon supplémentaire créé.')
    if matches:
        existing=client.genie.get_space(space_id=matches[0].space_id, include_serialized_space=True)
        payload=json.loads(existing.serialized_space or '{}')
        expected={f'{catalog}.{schema}.{name}' for name in TABLES}
        actual={x['identifier'] for x in payload.get('data_sources',{}).get('tables',[])}
        if actual!=expected or existing.warehouse_id!=warehouse_id:
            raise RuntimeError('Agent retrouvé mais sources/warehouse différents. Aucun changement automatique.')
        return existing.space_id, 'UNCHANGED — instructions participant préservées'
    created=client.genie.create_space(warehouse_id=warehouse_id,
        serialized_space=json.dumps(genie_payload(bundle,catalog,schema),ensure_ascii=False),
        title=f'STATION F — Sales & Marketing — {schema}',
        description=f'{marker} Atelier pédagogique, données synthétiques. Campagnes, segmentation, rétention ; pipeline en bonus.')
    return created.space_id, 'CREATED'


def warehouse_smoke(client, warehouse_id, catalog, schema, timeout=180):
    """Verify the actual warehouse path, not only notebook Spark access."""
    ns=namespace(catalog,schema)
    result=client.statement_execution.execute_statement(
        warehouse_id=warehouse_id,statement=f'SELECT COUNT(*) AS accounts FROM {ns}.account_snapshot',
        wait_timeout='10s',row_limit=10)
    end=time.monotonic()+timeout
    while getattr(result.status.state,'value',str(result.status.state)) in ('PENDING','RUNNING'):
        if time.monotonic()>=end:
            raise TimeoutError(f'Warehouse en attente. Relancez la vérification ; statement {result.statement_id}')
        time.sleep(2)
        result=client.statement_execution.get_statement(statement_id=result.statement_id)
    state=getattr(result.status.state,'value',str(result.status.state))
    if state!='SUCCEEDED':
        error=result.status.error
        raise RuntimeError(f'Warehouse : {state} — {getattr(error,"message",str(error))}')
    rows=result.result.data_array if result.result else None
    if not rows or int(rows[0][0])!=240:
        raise AssertionError('Le warehouse ne retrouve pas les 240 comptes attendus.')
    return result.statement_id
