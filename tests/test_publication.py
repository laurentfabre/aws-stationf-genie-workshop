"""Exercise leak detection with generated fake credentials, never real secrets."""
import importlib.util
import io
import json
from pathlib import Path
import unittest
import zipfile

spec = importlib.util.spec_from_file_location(
    'publication', Path(__file__).resolve().parents[1] / 'scripts/check_publication.py')
publication = importlib.util.module_from_spec(spec)
spec.loader.exec_module(publication)


class PublicationTests(unittest.TestCase):
    def test_credential_formats_are_detected_without_returning_values(self):
        samples = {
            'Databricks PAT': 'dapi' + 'a' * 32,
            'GitHub token': 'ghp_' + 'a' * 36,
            'AWS access key': 'AKIA' + 'A' * 16,
            'Google API key': 'AIza' + 'a' * 35,
            'Slack token': 'xoxb-' + 'a' * 30,
            'private key': '-----BEGIN ' + 'PRIVATE KEY-----',
            'bearer credential': 'Bearer ' + 'a' * 30,
            'credential assignment': 'API_TOKEN = "' + 'a' * 30 + '"',
        }
        for label, value in samples.items():
            with self.subTest(label=label):
                findings = publication.inspect('sample.txt', value.encode())
                self.assertIn(('sample.txt', label), findings)
                self.assertNotIn(value, repr(findings))

    def test_scans_inside_zip_and_detects_saved_notebook_outputs(self):
        buffer = io.BytesIO()
        notebook = {'cells': [{'cell_type': 'code', 'execution_count': 1,
                               'outputs': [{'text': 'private result'}]}]}
        with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as archive:
            archive.writestr('notebooks/run.ipynb', json.dumps(notebook))
            archive.writestr('.env', 'API_TOKEN="' + 'a' * 30 + '"')
        findings = publication.inspect('kit.zip', buffer.getvalue())
        self.assertIn(('kit.zip!notebooks/run.ipynb', 'saved notebook execution'), findings)
        self.assertIn(('kit.zip!.env', 'private file'), findings)
        self.assertIn(('kit.zip!.env', 'credential assignment'), findings)

    def test_only_documented_workspace_placeholders_are_allowed(self):
        suffix = '.cloud.' + 'databricks.com'
        for host in ('example', 'votre-workspace'):
            self.assertEqual(publication.inspect('example.md', ('https://' + host + suffix).encode()), [])
        self.assertIn(('example.md', 'private workspace URL'), publication.inspect(
            'example.md', ('https://private-rehearsal' + suffix).encode()))


if __name__ == '__main__':
    unittest.main()
