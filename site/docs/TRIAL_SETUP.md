# Installer l’atelier dans un Trial AWS

L’installation est à réaliser une première fois avant le 24 novembre, puis à vérifier le jour J. Réservez un créneau de préparation : la création du compte et les démarrages de calcul ne sont pas chronométrés ni garantis par ce kit. Un seul binôme exécute l’installation à la fois pour un schéma donné.

## 1. Créer ou vérifier son essai

Ouvrez [Try Databricks](https://www.databricks.com/try-databricks) et choisissez le parcours d’essai AWS. Selon la [documentation Trial](https://docs.databricks.com/aws/en/getting-started/free-trial), **Express signup** crée un workspace serverless sans accès à votre compte AWS. Le parcours AWS Marketplace est une autre option ; il peut être relié à une facturation AWS. N’engagez pas ce parcours par erreur si vous souhaitez Express signup.

Les crédits d’essai sont valables **14 jours** selon la documentation consultée le 17 novembre 2026. Vérifiez la date d’expiration et les crédits restants : un essai déjà ancien pourrait expirer avant le 24. Le Trial et la [Free Edition](https://docs.databricks.com/aws/en/getting-started/free-edition) sont distincts. Les offres et limites peuvent évoluer.

Vérifiez dans le workspace :

- un notebook peut utiliser **Serverless** ;
- un **SQL warehouse** est visible dans SQL Warehouses, avec le droit de l’utiliser ;
- un catalogue Unity Catalog modifiable existe : droits USE CATALOG et CREATE SCHEMA, puis droits de création/lecture sur le schéma de l’atelier ;
- l’interface **Genie** est accessible et permet de créer un Agent.

L’installateur ne crée aucun catalogue ou warehouse. Réutilisez le warehouse fourni par le Trial. Certains essais avec adresse personnelle sont limités à un warehouse : n’en ajoutez pas pour ce kit. Si aucun catalogue inscriptible n’existe, demandez au facilitateur de vérifier le provisionnement ; `samples` et `system` ne sont pas des destinations d’installation.

## 2. Importer le notebook

1. Depuis le dépôt, ouvrez `notebooks/00_START_HERE.ipynb` et choisissez **Download raw file**, ou utilisez le lien direct du README.
2. Dans le workspace, ouvrez votre dossier personnel, puis **Import** et chargez le fichier `.ipynb`. Selon la version de l’interface, Import se trouve dans le menu du dossier.
3. Sélectionnez **Serverless** en haut du notebook. Exécutez la première cellule de code, puis la cellule « Préparer mon installation ».

Le fichier `.py` est également un notebook au format source Databricks et constitue un recours à l’import `.ipynb`. Les 648 lignes de données et les fonctions sont embarquées : aucun `git clone`, téléchargement depuis le calcul, package externe ou token personnel n’est nécessaire au parcours normal. Le SDK fourni par le notebook doit exposer les méthodes Genie requises ; voir [dépannage](TROUBLESHOOTING.md) si ce n’est pas le cas.

## 3. Choisir les paramètres

| Widget | Valeur à fournir |
|---|---|
| `catalog` | Un catalogue existant de la liste affichée, dans lequel vous pouvez créer un schéma |
| `schema` | `stationf_20261124_equipe01`, ou un suffixe propre à votre binôme |
| `warehouse_id` | Les 16 caractères de l’ID dans SQL Warehouses → votre warehouse → Connection details ; l’ID est aussi la dernière partie du HTTP Path |
| `action` | `revue` affiche le plan sans modification ; `installer` crée les ressources ; `verifier` relit les tables et exécute les contrôles |

Le kit accepte des identifiants composés de lettres, chiffres et underscores, commençant par une lettre ou un underscore. Si votre catalogue porte un autre nom, utilisez avec le facilitateur un catalogue compatible ; ne renommez pas un catalogue existant. Le schéma doit commencer par `stationf_20261124_` et contenir un suffixe.

Exécutez « Installer et vérifier ». En mode `revue`, la cellule s’arrête volontairement après le plan ; passez à `installer` pour continuer. Six requêtes comparent les données aux références, puis une requête vérifie l’accès depuis le warehouse. Le notebook affiche l’ID de cette dernière requête. Les contrôles locaux de référence ne constituent pas un test des réponses en langage naturel.

## 4. Créer et ouvrir Genie

Exécutez « Créer mon Genie Agent », puis « Mon reçu et mes liens ». Ouvrez le lien retourné. Choisissez votre parcours et posez sa première question. Ouvrez le SQL généré et comparez-le à la requête de référence. Conservez la conversation et un résultat : la création de l’Agent ne valide pas ses réponses.

Téléchargez le ZIP participant depuis **Releases**, extrayez-le, puis ouvrez `index.html`. Reportez workspace, catalogue, schéma, warehouse et URL Genie du reçu dans « Liens de session et environnement ». Les liens restent dans votre navigateur. L’App Space se renseigne seulement si [Builder est préparé](APP_BUILDER.md).

## Checklist du 24 novembre

- [ ] Essai encore actif, crédits disponibles, compte connecté.
- [ ] Notebook importé ; paramètres conservés ; action `verifier` réussie.
- [ ] URL Genie ouverte ; première question exécutée ; sources du bon schéma.
- [ ] ZIP extrait et portail ouvert ; parcours choisi ; liens renseignés.
- [ ] Builder disponible et testé, ou parcours d’approfondissement Genie annoncé.
- [ ] Métier et IT se répartissent la décision, le SQL et la collecte des preuves.

Le propriétaire du Trial est souvent administrateur et propriétaire des tables. **Son succès ne démontre pas un accès en lecture seule.** Les tests d’accès refusé et d’interdiction d’écriture exigent un autre utilisateur préparé avec des droits limités. Sinon, notez ces tests **NOT RUN** ; aucun droit n’est retiré par le notebook.
