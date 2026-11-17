"""Build an explicit participant archive. Never crawl the repository for files."""
import hashlib
import json
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'
TRACKS = ('marketing', 'activation', 'retention', 'sales')
TABLES = ('account_snapshot', 'campaign_weekly', 'opportunities')
DOCS = ('TRIAL_SETUP', 'APP_BUILDER', 'TROUBLESHOOTING', 'CLEANUP', 'FACILITATION', 'VALIDATION')
FILES = [
    'index.html', 'trial.html', 'guide.html', 'guide.pdf', 'pdf-input.sha256',
    'README.md', 'DATA_CONTRACT.md', 'BRAND_SOURCES.md',
    'decision-workbook.md', 'decision-workbook.csv', 'session-bindings.example.json',
    'reference-results.json', 'assets/portal.css', 'assets/portal.js',
    'assets/aws-logo.png', 'assets/databricks-logo.svg', 'data/manifest.json',
    'data/workshop.sqlite', 'notebooks/00_START_HERE.ipynb', 'notebooks/00_START_HERE.py',
] + [f'track-{t}.md' for t in TRACKS] + [f'docs/{d}.md' for d in DOCS] + [
    f'sql/{q}.sql' for q in (*TRACKS, 'quality', 'empty')
] + [f'data/{table}.{ext}' for table in TABLES for ext in ('json', 'csv')]


def pdf_hash():
    digest = hashlib.sha256()
    for name in ('guide.html', 'assets/portal.css', 'assets/aws-logo.png', 'assets/databricks-logo.svg'):
        digest.update((SITE / name).read_bytes())
    return digest.hexdigest()


def build():
    if (SITE/'pdf-input.sha256').read_text().strip() != pdf_hash():
        raise RuntimeError('Guide/PDF out of sync. Run scripts/browser-check.mjs before packaging.')
    files = {name: (SITE/name).read_bytes() for name in sorted(FILES)}
    # An extracted archive already is the kit; avoid a broken/self-recursive ZIP link.
    files['index.html'] = files['index.html'].replace(
        b'href="participant-kit.zip" class="button">', b'href="README.md" class="button">')
    manifest = {name: hashlib.sha256(data).hexdigest() for name, data in files.items()}
    files['package-manifest.json'] = (json.dumps(manifest, indent=2)+'\n').encode()
    dist = ROOT/'dist'
    dist.mkdir(exist_ok=True)
    output = dist/'stationf-genie-participants-2026-11-24.zip'
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
        for name, data in files.items():
            info = zipfile.ZipInfo(name, date_time=(2026,11,17,0,0,0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, data)
    shutil.copyfile(output, SITE/'participant-kit.zip')
    (SITE/'package-manifest.json').write_bytes(files['package-manifest.json'])
    print(f'Packaged {len(files)} participant files: {output.name}')


if __name__ == '__main__':
    build()
