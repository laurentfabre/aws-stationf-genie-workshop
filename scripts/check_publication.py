"""Check public files, ZIP contents and optionally Git history without printing secrets."""
import argparse
import io
import json
from pathlib import Path
import re
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PATTERNS = {
    'Databricks PAT': rb'\bdapi[a-fA-F0-9]{32}\b',
    'GitHub token': rb'\b(?:gh[pousr]_[A-Za-z0-9]{24,}|github_pat_[A-Za-z0-9_]{40,})\b',
    'AWS access key': rb'\b(?:AKIA|ASIA)[A-Z0-9]{16}\b',
    'Google API key': rb'\bAIza[A-Za-z0-9_-]{35}\b',
    'Slack token': rb'\bxox[baprs]-[A-Za-z0-9-]{20,}\b',
    'private key': rb'-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----',
    'bearer credential': rb'(?i)\bBearer\s+[A-Za-z0-9_.~+/-]{24,}',
    'credential assignment': rb'''(?ix)
        ["']?\b(?:[A-Z][A-Z0-9]*_)*(?:TOKEN|SECRET|PASSWORD|API_KEY|ACCESS_KEY|SECRET_ACCESS_KEY)
        \b["']?\s*[:=]\s*["'][A-Za-z0-9_./+=-]{20,}["']
    ''',
    'private workspace URL': rb'https?://(?!(?:example|votre-workspace)\.cloud\.databricks\.com\b)[A-Za-z0-9.-]+\.(?:cloud\.databricks\.com|azuredatabricks\.net|gcp\.databricks\.com)\b',
    'local user path': rb'/(?:Users|home)/[A-Za-z0-9_.@-]+/',
}
RULES = {name: re.compile(pattern) for name, pattern in PATTERNS.items()}


def inspect(name, data):
    """Return locations and rule names only; never return matched values."""
    findings = []
    parts = Path(name.replace('!', '/')).parts
    if any(p in {'.env', '.databrickscfg', '.aws', '.ssh', 'organizer', 'receipts', 'evidence',
                 'credentials', 'credentials.json'}
           or p.startswith('.env.') for p in parts) or Path(name).suffix in {'.pem', '.key', '.p12', '.pfx'}:
        findings.append((name, 'private file'))
    for label, rule in RULES.items():
        if rule.search(data):
            findings.append((name, label))
    if name.endswith('.ipynb'):
        try:
            notebook = json.loads(data)
            if any(cell.get('outputs') or cell.get('execution_count') is not None
                   for cell in notebook['cells'] if cell.get('cell_type') == 'code'):
                findings.append((name, 'saved notebook execution'))
        except (ValueError, KeyError, TypeError):
            findings.append((name, 'invalid notebook'))
    if name.endswith('.zip'):
        try:
            with zipfile.ZipFile(io.BytesIO(data)) as archive:
                for member in archive.infolist():
                    if not member.is_dir():
                        findings.extend(inspect(name + '!' + member.filename, archive.read(member)))
        except zipfile.BadZipFile:
            findings.append((name, 'invalid archive'))
    return findings


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--history', action='store_true', help='also scan all reachable Git blobs')
    args = parser.parse_args()
    findings = []
    files = git('ls-files', '-z').decode().split('\0')
    for name in filter(None, files):
        path = ROOT / name
        if path.is_file():
            findings.extend(inspect(name, path.read_bytes()))
    # Include new, untracked public source files; ignore private development files.
    for name in filter(None, git('ls-files', '--others', '--exclude-standard', '-z').decode().split('\0')):
        findings.extend(inspect(name, (ROOT / name).read_bytes()))
    blobs = 0
    if args.history:
        for line in git('rev-list', '--objects', '--all').decode().splitlines():
            oid, _, name = line.partition(' ')
            if git('cat-file', '-t', oid).strip() == b'blob':
                blobs += 1
                findings.extend(inspect('history/' + oid[:12] + '/' + name, git('cat-file', 'blob', oid)))
    for name, label in sorted(set(findings)):
        print(f'FAIL {name}: {label}')
    print(f'Publication check: {len(list(filter(None, files)))} tracked files, '
          f'{blobs} historical blobs, {len(set(findings))} findings. ZIP members included.')
    return bool(findings)


if __name__ == '__main__':
    raise SystemExit(main())
