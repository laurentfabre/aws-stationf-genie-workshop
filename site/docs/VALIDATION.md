# Validation de cette édition

Dataset : **stationf-synthetic-v1**, snapshot **17 novembre 2026**. Version distribuée : **v1.2.0**. Interface vérifiée le **23 novembre 2026** ; répétition Databricks du **21 novembre 2026**.

| Niveau | Statut | Portée |
|---|---|---|
| Supports | **PASS — vérifications locales** | 33 tests Python, 48 contrôles navigateur de régression, 86 contrôles du studio, 5 contrôles du ZIP extrait |
| Répétition FEVM sur AWS | **PASS — périmètre ci-dessous** | Installation neuve, relance, Spark, warehouse et quatre questions Genie |
| Vrai Trial participant | **NOT RUN** | Provisionnement, région, crédits, droits et capacités à vérifier dans chaque Trial |
| Builder et seconde identité | **NOT RUN** | Génération d’application et contrôles d’accès distincts |

## Fil rouge personnel v1.2.0 — 23 novembre

33 contrôles navigateur dédiés et 5 scans axe supplémentaires vérifient :

- Profil nommé et rôle d’atelier ; séparation des notes, liens et statuts entre deux participants du même navigateur.
- Six jalons et prochaine action explicite ; visite d’une étape distincte de sa déclaration de fin. Les livrables nécessaires doivent être renseignés pour déclarer une étape terminée.
- Réouverture d’un jalon quand une note requise est effacée ; blocage prioritaire dans la prochaine action ; indisponibilité Builder distincte d’une application réussie.
- Conservation des statuts et blocages après rechargement ; rappel du fil rouge accessible pendant le défilement ; interface sans débordement horizontal aux quatre largeurs de contrôle.
- Export JSON v2 avec profils et statuts, réimport dans un autre navigateur, isolation des profils restaurés, import invalide rejeté sans modification partielle ; migration des anciens brouillons v1 sans jalon terminé automatiquement.
- Markdown avec profil actif, statuts et limites ; présentation utilisant la décision réelle.

Ces statuts sont déclarés par le participant et stockés localement. Une fin de parcours déclarée ne constitue pas une preuve d’exécution Databricks ; un blocage affiché n’envoie aucune notification au facilitateur. Les 5 scans supplémentaires couvrent le profil, le fil rouge bloqué et terminé, le rappel flottant et le blocage mobile, sans violation détectée.

## Studio participant v1.1.0 — 23 novembre

- Quatre missions sélectionnables au clavier, six étapes, détails SQL et prompts à la demande, conservation des notes par environnement et parcours.
- Import du reçu JSON : validation des liens et du namespace, conservation des seuls paramètres utiles, rejet du JSON invalide et suppression des anciens liens Genie lors d’un changement de namespace.
- Graphiques construits à partir des références canoniques du kit : valeurs primaires et secondaires comparées aux fichiers JSON, axes partant de zéro, NULL affiché « Non calculable », source et caractère hors ligne visibles.
- Mode présentation alimenté par les notes réelles du binôme ; fenêtre modale, fermeture Échap et restitution du focus vérifiées. Export JSON conserve les anciens et nouveaux environnements.
- Six largeurs de 320 à 1920 pixels, chacune sur les six étapes : absence de débordement horizontal de page. Tableaux et navigation possèdent leur propre défilement.
- 14 scans axe avec les tags WCAG A/AA et WCAG 2.1 AA, incluant les dialogues, les références, le studio mobile et l’installation Trial : aucune violation détectée. Les contrôles automatisés sont complétés par une inspection visuelle desktop/mobile, le clavier et le mode de mouvement réduit.
- Portail, références et navigation vérifiés depuis `file://`. Aucune dépendance JavaScript, police, requête métier ou ressource externe nécessaire pour afficher le kit hors ligne.

Le notebook distribué conserve exactement l’empreinte de la répétition FEVM ci-dessous. La refonte du studio ne modifie ni l’installation Databricks, ni les règles métier, ni les données. Le mode présentation et les graphiques locaux ne constituent pas des tests de réponses Genie live.

## Répétition FEVM du 21 novembre

Le notebook public a été importé au format Jupyter, avec une seule cellule de collecte ajoutée après les cellules distribuées. Les deux tâches serverless successives utilisent le **SDK 0.20.0 fourni**, sans installation de package supplémentaire et avec l’authentification native du notebook. Les données et SQL sont ceux du téléchargement public.

Empreinte SHA-256 du notebook participant testé : `67ebb57914e46c0f118ecdd299653a72e1aeb4572de81fc9db5d369f711e0cad`.

| Contrôle | Résultat observé |
|---|---|
| Installation dans un schéma neuf | **PASS** : trois tables créées, 240 comptes, 48 lignes campagne/semaine, 360 opportunités ; Genie Agent créé |
| Relance dans le même schéma | **PASS** : trois tables UNCHANGED, mêmes empreintes de données et même identifiant Genie |
| Six références via Spark | **PASS** aux deux exécutions : activation, cas vide, marketing, qualité, rétention et pipeline |
| Lecture via SQL warehouse | **PASS** aux deux exécutions : 240 comptes lus par le warehouse |
| Question Genie de référence Marketing | **PASS** : 6 canaux, valeurs comparées aux références |
| Question Genie de référence Activation | **PASS** : 4 groupes, effectifs, MRR et éligibilité comparés |
| Question Genie de référence Rétention | **PASS** : 8 comptes, valeurs comparées |
| Question Genie de référence Pipeline | **PASS** : 3 pays, montants et effectifs comparés |
| Question de suivi Rétention dans la même conversation | **PASS** : 8 comptes, 33 700 EUR/mois ; la réponse précise que la baisse d’usage ne prouve pas un revenu perdu |

Les réponses Genie ont été exécutées par leur warehouse. Les résultats ont été récupérés via les pièces jointes Genie et via l’API Statement Execution pour les mêmes requêtes, puis comparés aux références du kit. Le coût d’acquisition NULL du canal Expérimentation est sérialisé en chaîne vide dans la pièce jointe Genie ; le résultat SQL confirme explicitement NULL. Aucune conversion générale de chaînes vides en NULL n’a été appliquée. Les tolérances sont celles de `src/installer.py` : entiers exacts, ROAS ±0,0001, autres valeurs numériques ±0,01.

Les reçus complets, identités, IDs de runs, conversations et statements sont conservés par le mainteneur hors du dépôt public. Ce rapport décrit la répétition sous le propriétaire FEVM ; il ne constitue pas une exécution sous un compte Trial participant, une preuve d’isolation des accès ou une évaluation exhaustive de toutes les formulations et questions de suivi.

## Contrôles locaux

Les 33 tests Python vérifient les références SQL avec SQLite, les clés et jointures, les valeurs manquantes, les seuils métier, le contenu embarqué dans le notebook et l’absence de sorties enregistrées. Les services Spark/SDK simulés couvrent création, relance, collisions, pagination Genie, SDK sans facade Genie et erreurs. Ces tests locaux n’exécutent pas Spark ou l’API Databricks ; la répétition ci-dessus les complète.

Les 86 contrôles du nouveau studio complètent les régressions existantes. Les 48 contrôles Chrome headless portent sur les quatre parcours, les téléchargements, les prompts, les notes locales, exports/imports, l’affichage mobile et le PDF. Les 5 contrôles du ZIP réellement extrait couvrent son ouverture hors ligne, les liens, le guide Trial et le notebook importable. Une case du cahier participant n’exécute aucun test.

L’archive contient **43 fichiers** contrôlés par SHA-256. Le notebook distribué ne contient aucune sortie enregistrée. Les sources et reçus internes restent hors du dépôt ; les bindings distribués sont vides. Python 3.11+ suffit aux tests locaux.

## Historique des corrections

- La répétition du 21 novembre a reproduit l’échec de v1.0.0 : le SDK serverless fourni ne possède pas `WorkspaceClient.genie`. **v1.0.1** utilise alors le client API authentifié du SDK existant, avec les mêmes protections contre doublons et écrasement. Une nouvelle installation et une relance ont ensuite réussi sans mise à jour de package.
- Les premières vérifications locales avaient identifié des valeurs JSON entières dans une colonne Spark DOUBLE ; la normalisation numérique et les empreintes prennent en charge ce cas.

## Contrôles à réaliser dans chaque Trial

| Contrôle | Statut initial | Preuve à conserver |
|---|---|---|
| Installation dans un schéma neuf puis relance | NOT RUN | Reçus, identité effective, état des trois tables et Agent conservé |
| Six références Spark et accès warehouse | NOT RUN | Sorties et statement ID du notebook |
| Questions et suivi Genie du parcours choisi | NOT RUN | Conversation, SQL, résultats et comparaison |
| Génération et itération Builder | NOT RUN | Région/preview, App Space, version et observations |
| Application publiée, si promise | NOT RUN | URL et vérification indépendante du preview |
| Accès autorisé / refusé sous deux identités | NOT RUN | Identités effectives, permissions et résultat des requêtes |

Remplissez PASS / FAIL / BLOCKED / NOT RUN avec l’environnement, l’identité, la date et un lien de preuve. Conservez les erreurs antérieures. Une lecture réussie sous le propriétaire Trial ne prouve pas le refus d’écriture d’un participant limité. Si Builder manque, le parcours Genie reste utilisable mais Builder reste BLOCKED.

Les prérequis d’offre, de région et de Builder restent ceux de la documentation consultée le 17 novembre 2026 ; aucune disponibilité future ni durée d’installation n’est garantie. Les endpoints de compatibilité SDK ont été contrôlés dans le SDK officiel et exécutés sur FEVM le 21 novembre.
