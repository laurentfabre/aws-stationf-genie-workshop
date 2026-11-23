# Reconstruire le kit

Le contenu public est autonome. Modifiez `workshop.json`, `sql/`, `data/`, `src/installer.py`, les guides dans `docs/` ou les modèles dans `content/`, puis :

```bash
python3 scripts/build_notebook.py
python3 scripts/build_site.py
python3 -m unittest discover -s tests -v
```

Pour tester le portail et produire le PDF, installez Playwright dans un environnement de développement, puis utilisez Chrome local ou le navigateur installé par Playwright :

```bash
npm ci
# Sans Chrome local : npx playwright install chromium
python3 -m http.server 18770 --directory site
# Dans un second terminal, depuis la racine du dépôt :
npm run test:browser
npm run test:experience
python3 scripts/package.py
python3 -c "import zipfile; zipfile.ZipFile('site/participant-kit.zip').extractall('.validation/extracted')"
npm run test:archive
python3 -m unittest discover -s tests -v
```

`PLAYWRIGHT_CHANNEL=chromium` utilise le Chromium installé par Playwright ; `chrome` utilise Chrome local. Les dépendances Node sont réservées au développement et ne font pas partie du kit participant.

`WORKSHOP_TEST_URL` permet de changer le port. `PLAYWRIGHT_MODULE` permet de choisir le module Playwright installé ; `PLAYWRIGHT_CHANNEL` vaut `chrome` par défaut. Les preuves locales sont écrites dans `.validation/`, exclu de Git. `AXE_MODULE` permet de choisir le module axe installé. Les 86 contrôles de `experience-check.mjs` couvrent les missions clavier, le reçu JSON, les valeurs des graphiques, le mode présentation, les notes et exports, six largeurs d’écran et 14 scans axe WCAG A/AA. Le packaging exige que le PDF ait été produit depuis le guide HTML et la feuille de style actuels.

L’archive est construite à partir d’une liste explicite de fichiers. N’ajoutez jamais de recherche client, identifiants, exports de workspace ou sorties de notebook au dépôt public. Les tests ne se connectent pas à Databricks. Toute validation dans un Trial doit être consignée séparément avec l’environnement, l’identité, les IDs de requêtes et les limites.

Le workflow de validation exécute les tests Python et les tests navigateur dans des jobs séparés. Les preuves navigateur utilisent seulement des comptes et URLs d’exemple. Le workflow Pages publie le dossier `site/` sous le site public du dépôt ; les documents source, recherches et reçus internes n’en font pas partie.
