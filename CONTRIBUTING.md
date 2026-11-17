# Reconstruire le kit

Le contenu public est autonome. Modifiez `workshop.json`, `sql/`, `data/`, `src/installer.py`, les guides dans `docs/` ou les modèles dans `content/`, puis :

```bash
python3 scripts/build_notebook.py
python3 scripts/build_site.py
python3 -m unittest discover -s tests -v
```

Pour tester le portail et produire le PDF, installez Playwright dans un environnement de développement, puis utilisez Chrome local ou le navigateur installé par Playwright :

```bash
npm install --no-save playwright
python3 -m http.server 18770 --directory site
# Dans un second terminal, depuis la racine du dépôt :
node scripts/browser-check.mjs
python3 scripts/package.py
python3 -m unittest discover -s tests -v
```

`WORKSHOP_TEST_URL` permet de changer le port. `PLAYWRIGHT_MODULE` permet de choisir le module Playwright installé ; `PLAYWRIGHT_CHANNEL` vaut `chrome` par défaut. Les preuves locales sont écrites dans `.validation/`, exclu de Git. Le packaging exige que le PDF ait été produit depuis le guide HTML et la feuille de style actuels.

L’archive est construite à partir d’une liste explicite de fichiers. N’ajoutez jamais de recherche client, identifiants, exports de workspace ou sorties de notebook au dépôt public. Les tests ne se connectent pas à Databricks. Toute validation dans un Trial doit être consignée séparément avec l’environnement, l’identité, les IDs de requêtes et les limites.
