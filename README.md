# AWS × Databricks — STATION F · Atelier Genie

**24 novembre 2026 · Paris · Français · Niveau 100/200 · Pratique 09:45–11:45**

Installez votre atelier dans un **Databricks Trial sur AWS**, puis travaillez en binôme sur une décision Sales & Marketing. Les données de NovaFlow sont entièrement synthétiques. Le notebook contient les données, les contrôles et la création d’un Genie Agent : aucun logiciel local, clé AWS ou token à copier.

**[Ouvrir le studio des décisions](https://laurentfabre.github.io/aws-stationf-genie-workshop/)**

**[Télécharger le kit participant complet](https://github.com/laurentfabre/aws-stationf-genie-workshop/releases/latest/download/stationf-genie-participants-2026-11-24.zip)** · **[Notebook seul](https://github.com/laurentfabre/aws-stationf-genie-workshop/releases/latest/download/00_START_HERE.ipynb)** · **[Guide PDF](https://github.com/laurentfabre/aws-stationf-genie-workshop/releases/latest/download/guide.pdf)**

Les téléchargements sont publics, sans compte GitHub. Extrayez le ZIP, ouvrez `index.html` pour les consignes et importez `notebooks/00_START_HERE.ipynb` dans **votre propre Trial**. Les données, requêtes, parcours et fichiers nécessaires sont inclus ; aucun accès à l’environnement du facilitateur n’est requis.

## Votre studio des décisions

La version **v1.1.0** propose quatre missions visuelles, un parcours guidé en six étapes et un cahier personnel. Copiez vos questions vers Genie, examinez les références dans des graphiques interactifs, puis présentez votre recommandation en plein écran avec vos propres preuves et votre prochaine action. Les détails SQL et les prompts complets restent disponibles à la demande.

Dans **Mes liens Databricks**, collez le JSON du reçu de votre notebook : seuls les liens et paramètres utiles sont conservés. Le studio ne lance aucune requête et ne simule aucune réponse Genie. Les graphiques sont explicitement les références hors ligne du jeu d’essai. L’illustration d’accueil n’est pas un résultat live.

Le studio fonctionne aussi depuis le ZIP extrait, sans installation locale ni dépendance distante. Les notes restent propres au navigateur, à l’origine, à l’environnement et au parcours : exportez JSON avant de passer du site web au kit hors ligne, puis restaurez-le avec les mêmes liens de session. Markdown et le mode présentation mettent votre décision en forme, sans envoi automatique.

## Un fil rouge pour chaque participant

Avec **v1.2.0**, personnalisez votre profil avec votre prénom ou nom de binôme et votre rôle. Votre fil rouge affiche les six jalons, leur statut, votre prochaine action et un accès à votre checkpoint. Un rappel compact reste visible pendant que vous travaillez.

Les statuts **À faire**, **En cours**, **Terminé** et **Besoin d’aide** sont vos déclarations personnelles. Pour terminer un jalon, renseignez son livrable puis confirmez-le ; visiter la dernière étape ne termine pas le parcours. Si Builder manque, marquez-le **Indisponible** et poursuivez l’enquête Genie. Décrivez un blocage pour le montrer au facilitateur : aucun message ne lui est envoyé automatiquement.

Les profils d’un même navigateur possèdent leurs propres notes, liens, mission et progression. JSON sauvegarde tous ces profils et statuts ; Markdown partage le participant et le parcours actifs. Les anciens brouillons et exports v1 restent lisibles. Le suivi reste local à votre navigateur et ne vérifie pas automatiquement vos opérations dans Databricks.

## Démarrer le jour J

1. Ouvrez votre [Trial Databricks](https://www.databricks.com/try-databricks). Le parcours **Express signup** crée un workspace serverless sans fournir d’identifiants AWS. Préparez le compte avant l’atelier ; l’installation reste rejouable le jour J. [Guide détaillé](docs/TRIAL_SETUP.md).
2. [Téléchargez le notebook autonome](https://github.com/laurentfabre/aws-stationf-genie-workshop/releases/latest/download/00_START_HERE.ipynb). Si le navigateur affiche du JSON, enregistrez le fichier avec l’extension `.ipynb`. [Source du notebook](notebooks/00_START_HERE.ipynb).
3. Dans **Workspace → Import**, importez ce fichier. Choisissez **Serverless**, puis exécutez jusqu’à « Préparer mon installation ».
4. Renseignez les widgets : **catalogue existant**, **schéma** `stationf_20261124_votre_equipe`, **SQL warehouse ID** et **action** `installer`. Exécutez les cellules suivantes dans l’ordre.
5. Ouvrez le lien **Genie Agent** produit par le notebook. Téléchargez et extrayez le [kit participant](https://github.com/laurentfabre/aws-stationf-genie-workshop/releases/latest/download/stationf-genie-participants-2026-11-24.zip), puis ouvrez `index.html`. Reportez les valeurs du reçu dans « Liens de session et environnement ».

Le notebook crée trois tables Delta (240 comptes, 48 lignes campagne/semaine, 360 opportunités) et un Genie Agent dédié. Il réutilise le warehouse choisi. Une relance conserve les tables compatibles et les instructions Genie modifiées pendant l’exercice. Une collision arrête l’opération ; aucune table existante n’est écrasée.

## Choisir un parcours

| Parcours | Décision à préparer |
|---|---|
| [Marketing](site/track-marketing.md) | Quels canaux examiner pour réallouer le budget, en tenant compte de l’attribution incomplète ? |
| [Activation](site/track-activation.md) | Quels segments et comptes sont éligibles à une revue commerciale ? |
| [Rétention](site/track-retention.md) | Quels renouvellements méritent une revue après une baisse d’usage ? |
| [Pipeline — bonus](site/track-sales.md) | Quels montants et opportunités de décembre faut-il revoir ? |

Chaque parcours comprend questions Genie, SQL de référence, deux prompts App Builder, cas limites et cahier de décision. Choisissez **un** parcours pour les deux heures.

## App Builder et disponibilité

**Genie App Builder est une étape conditionnelle**, en Beta au 17 novembre 2026. Il exige une région compatible, la preview « Governed agentic app-building », un App Space et les droits associés. La région AWS Paris (`eu-west-3`) ne figure pas dans la liste publiée à cette date. [Préparation Builder](docs/APP_BUILDER.md).

Si Builder est indisponible, poursuivez les questions Genie, la comparaison SQL et la spécification de l’application ; consignez Builder **BLOCKED**. Free Edition est une offre distincte du Trial, avec d’autres quotas. Ce dépôt ne garantit pas les capacités d’une offre ou d’une région.

## Guides et état des vérifications

- [Installation Trial et checklist du jour J](docs/TRIAL_SETUP.md)
- [Dépannage et création manuelle de Genie](docs/TROUBLESHOOTING.md)
- [Guide imprimable PDF](site/guide.pdf), [contrat de données](site/DATA_CONTRACT.md), [résultats attendus](data/reference-results.json)
- [Animation des deux heures](docs/FACILITATION.md), [rejeu et nettoyage](docs/CLEANUP.md)
- [Validation et limites](docs/VALIDATION.md)

La version **v1.0.1** a été répétée sur **FEVM serverless avec le SDK fourni (0.20.0)** : installation neuve, relance sans changement, six références Spark, accès SQL warehouse et quatre questions Genie comparées aux résultats de référence. Les contrôles locaux couvrent aussi les formats distribués et les collisions simulées. **Un vrai Trial participant, Builder et les accès sous une seconde identité restent NOT RUN.** Le reçu du notebook permet de recueillir ces preuves dans votre environnement. [Détail des vérifications](docs/VALIDATION.md).

## Maintenir le kit

Python 3.11+ suffit aux contrôles locaux, sans compte Databricks :

```bash
python3 scripts/build_notebook.py
python3 scripts/build_site.py
python3 -m unittest discover -s tests -v
```

`workshop.json`, `sql/`, `data/` et `src/installer.py` sont les sources révisables. Le notebook généré est autonome. Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour régénérer PDF et archive. Aucun fichier de recherche interne n’est nécessaire pour utiliser ou reconstruire le kit.
