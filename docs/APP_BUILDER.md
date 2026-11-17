# Préparer Genie App Builder — étape conditionnelle

État documentaire : **17 novembre 2026**. [Genie App Builder](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/genie-app-builder) et les [App Spaces](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/app-spaces) sont en **Beta**. Leur présence n’est pas garantie dans tous les Trials.

## Avant l’atelier

1. Vérifiez la région réelle du workspace et la liste actuelle des régions supportées. La documentation consultée inclut **eu-west-1 (Ireland)** et **eu-central-1 (Frankfurt)**, mais pas **eu-west-3 (Paris)**. Le lieu de l’atelier ne détermine pas la région du workspace. Si le parcours Express ne permet pas le choix de région, contrôlez le workspace créé avant de retenir Builder pour la séance.
2. Un administrateur du workspace doit vérifier la preview **Governed agentic app-building** dans **Settings → Previews**, ainsi que les réglages AI requis par la documentation. Activez uniquement les capacités nécessaires, dans le workspace d’essai dont vous êtes responsable.
3. Dans **Databricks Apps → App Spaces → New space**, l’administrateur crée un espace dédié, par exemple `stationf-20261124-equipe01`. Ce n’est pas le Genie Agent créé par le notebook.
4. Configurez l’autorisation utilisateur et les scopes nécessaires à la lecture SQL, à Genie et à la découverte du catalogue. Le preset **Data + AI** comporte plus de scopes ; examinez-les avant de valider. L’autorisation utilisateur et les scopes ne donnent pas de nouveaux droits sur les tables ou le warehouse.
5. Accordez au binôme **CAN CREATE APP** sur cet App Space, ainsi que les droits de lecture des trois tables et d’utilisation du warehouse. Confirmez l’identité qui exécute les requêtes. L’accès en Shared data utilise une autre identité et doit être documenté comme tel.
6. Testez le réseau vers `*.databricksapps.com`, ouvrez **Apps → Build**, sélectionnez l’App Space et effectuez un essai de génération avant la séance. Conservez le lien réel dans le portail.

Le notebook ne modifie pas ces réglages et ne crée pas d’App Space. Aucune mise en place RBAC supplémentaire n’est requise pour le parcours individuel ; une identité ou un rôle de test limité doit toutefois être préparé si l’on veut démontrer l’isolation des accès.

## Pendant l’exercice

Dans l’étape « Construire » du portail, copiez le premier prompt **après** avoir renseigné catalogue et schéma. Le binôme construit sa propre application, inspecte les résultats puis renseigne un écart réel avant de copier le deuxième prompt. Comparez SQL, Genie et application sur le même périmètre. Une prévisualisation Builder et une application publiée demandent des vérifications distinctes.

Le propriétaire du Trial peut écrire dans ses tables : ne présentez pas ce compte comme preuve d’un rôle en lecture seule. Sans deuxième identité, marquez les tests de refus **NOT RUN**. Les simulations restent locales et sans envoi marketing ou écriture CRM.

## Si Builder est absent

Marquez Builder **BLOCKED**, notez le prérequis manquant, puis consacrez les 30 minutes à une question Genie supplémentaire, un cas vide, une donnée manquante et la rédaction de la spécification d’application. Présentez l’analyse et ses preuves. Ce parcours permet d’apprendre et de décider, mais ne valide pas la construction d’une application.
