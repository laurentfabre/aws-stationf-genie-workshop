# Validation de cette édition

Dataset : **stationf-synthetic-v1**, snapshot **17 novembre 2026**. Version distribuée : **v1.0.0**. Les résultats locaux sont reproductibles avec les scripts du dépôt. Les horodatages et détails des contrôles navigateur sont conservés par le mainteneur, sans identifiants de participant.

| Niveau | Statut | Portée |
|---|---|---|
| Supports | **PASS — vérifications locales** | 31 tests Python, 48 contrôles navigateur, 5 contrôles du ZIP extrait |
| Environnement de répétition Trial | **NOT RUN** | Aucun Trial de répétition ni identité de déploiement sélectionné pour cette édition |
| Environnement des participants | **NOT RUN** | Provisionnement, région, crédits, droits et capacités à vérifier pour chaque Trial |

Les tests Python vérifient les références SQL avec SQLite, les clés et jointures, les valeurs manquantes, les seuils métier, le contenu embarqué dans le notebook et l’absence de sorties enregistrées. Les tests de l’installateur utilisent des services Spark/SDK simulés pour vérifier création, relance, collisions, pagination Genie et erreurs. Ils **n’exécutent pas** Spark ou l’API Databricks.

Les vérifications navigateur portent sur les quatre parcours, les liens d’installation, les prompts, les notes locales, exports/imports, l’affichage mobile et le PDF. L’archive extraite est contrôlée séparément. Une case du cahier participant n’exécute aucun test.

Dernière vérification locale : **17 novembre 2026**, Python/SQLite et Chrome headless avec profil isolé, sans connexion Databricks. L’archive contient **43 fichiers** contrôlés par SHA-256. Le notebook distribué n’a aucune sortie enregistrée. Les contrôles de publication n’ont détecté aucun nom client recherché, identifiant CRM, hôte interne, chemin personnel ou credential dans les fichiers distribués. Les recherches sources internes restent hors du dépôt.

Les premières vérifications ont identifié des valeurs JSON entières dans une colonne Spark DOUBLE ; le notebook normalise désormais ce type et ses empreintes pour permettre une relance. Le guide précise aussi que le notebook déjà extrait du ZIP doit être sélectionné directement dans Import. Les références métier n’ont pas été modifiées.

## Contrôles à réaliser dans un vrai Trial

| Contrôle | Statut initial | Preuve à conserver |
|---|---|---|
| Installation dans un schéma neuf | NOT RUN | Reçu, workspace, identité, date et état des trois tables |
| Relance dans le même schéma | NOT RUN | Tables et Agent conservés, pas de doublon |
| Six références via Spark + lecture SQL warehouse | NOT RUN | Sorties et statement ID du notebook |
| Questions et suivi Genie, par parcours retenu | NOT RUN | Conversation, SQL, résultats, interprétation et comparaison |
| Génération et itération Builder | NOT RUN | Région/preview, App Space, version et observations |
| Application publiée, si promise | NOT RUN | URL et vérification indépendante du preview |
| Accès autorisé / refusé sous deux identités | NOT RUN | Identités effectives, permissions et résultat des requêtes |

Remplissez PASS / FAIL / BLOCKED / NOT RUN avec l’environnement, l’identité, la date et un lien de preuve. Conservez les erreurs antérieures. Une lecture réussie sous le propriétaire Trial ne prouve pas le refus d’écriture d’un participant limité. Si Builder manque, le parcours Genie reste utilisable mais Builder reste BLOCKED.

Les signatures SDK et prérequis sont fondés sur la documentation officielle consultée le 17 novembre 2026 ; aucune disponibilité future ni durée d’installation n’est garantie. La version SDK 0.167.0 est une option de dépannage, pas une dépendance téléchargée ou testée par les contrôles locaux.
