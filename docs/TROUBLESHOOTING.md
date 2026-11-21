# Dépannage

| Symptôme | Action |
|---|---|
| Le téléchargement affiche du JSON | Enregistrez le fichier sous `00_START_HERE.ipynb`, puis importez-le dans Workspace. Évitez de télécharger la page HTML GitHub. |
| Serverless ou SQL Warehouses absent | Vérifiez que vous êtes dans le workspace du Trial, puis son provisionnement, ses crédits et ses droits avec le facilitateur. |
| Catalogue introuvable / permission refusée | Reprenez la liste affichée par le notebook ; choisissez un catalogue inscriptible. N’utilisez pas `samples` ou `system`. |
| Warehouse ID invalide | Copiez l’ID de 16 caractères, pas le nom ni le HTTP Path complet. |
| Mode `revue` arrêté après le plan | C’est attendu : aucune ressource créée. Choisissez `installer` puis relancez la cellule. |
| Collision / table modifiée | Le notebook refuse l’écrasement. Vérifiez le namespace ; utilisez un nouveau suffixe de schéma pour une nouvelle édition. Conservez les travaux précédents. |
| Installation partielle | Corrigez le problème et relancez dans le même schéma. Les tables compatibles sont conservées ; les absentes sont créées. Ne lancez pas deux installations simultanément. |
| Warehouse en attente | Conservez le statement ID, vérifiez son état dans l’historique SQL, attendez le démarrage puis relancez en `verifier`. Le délai de 180 secondes n’est pas une garantie de démarrage. |
| Référence différente | Conservez l’erreur, la requête et le résultat. Ne corrigez pas les KPI à la main pour les faire correspondre. |
| Genie API échoue après les tables | Les données restent installées. Utilisez la création manuelle ci-dessous ; marquez la création automatique BLOCKED. |
| Agent retrouvé avec un autre warehouse ou d’autres tables | Le notebook préserve l’Agent modifié. Vérifiez ses réglages avec le facilitateur ; ne supprimez pas les travaux du binôme. |
| Plusieurs Agents avec le même marqueur | Identifiez l’Agent à conserver ; le notebook ne choisit ni ne supprime automatiquement. Ouvrez l’Agent retenu manuellement. |
| Notes du portail manquantes | Revenez au même navigateur et environnement, ou importez votre export JSON. Les notes ne sont pas synchronisées entre participants. |

## Créer l’Agent dans l’interface

1. Dans **Genie**, choisissez la création d’un Agent (parfois libellé *Space* selon l’interface).
2. Nommez-le `STATION F — votre équipe`, sélectionnez le SQL warehouse du notebook, puis les trois tables du schéma indiqué dans le reçu.
3. Ajoutez les définitions du [contrat de données](../site/DATA_CONTRACT.md) aux instructions. Précisez que les données sont synthétiques et arrêtées au **17 novembre 2026**.
4. Ajoutez les questions de votre parcours et les exemples SQL correspondants. La dernière cellule du notebook imprime les requêtes avec leurs noms de tables complets ; utilisez-les pour éviter une référence au mauvais schéma.
5. Enregistrez, ouvrez l’Agent et posez une question du parcours. Comparez SQL et résultats à la référence. Copiez son URL dans le portail.

Un Agent créé manuellement n’est pas automatiquement adopté par l’installateur. Après cette solution de recours, utilisez le mode `verifier` et ouvrez votre lien enregistré ; ne relancez pas la création automatique pour essayer de le retrouver.

## SDK du notebook ancien

Le parcours normal utilise `databricks.sdk.WorkspaceClient()` avec l’identité native du notebook. Si `WorkspaceClient.genie` ou les méthodes nécessaires manquent, l’installateur utilise automatiquement les mêmes endpoints Genie via le client API authentifié du SDK fourni. Aucun package supplémentaire, redémarrage Python ou token personnel n’est nécessaire.

Avec la version **v1.0.0**, l’erreur `AttributeError: 'WorkspaceClient' object has no attribute 'genie'` pouvait survenir après l’installation des tables. Téléchargez le notebook de la dernière release, importez-le sous un nouveau nom et relancez-le avec les mêmes catalogue, schéma et warehouse : les tables compatibles sont conservées. Si l’API Genie reste inaccessible pour des raisons de droits ou de disponibilité, utilisez la procédure manuelle ci-dessus ; une mise à jour du SDK ne donne pas de nouveaux droits.
