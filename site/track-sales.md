# Quel pipeline mérite notre attention ?

Exercice complémentaire de pipeline — proposition pédagogique, hors sélection principale Logfood

## Votre décision

Après le parcours principal, examiner le pipeline de décembre. Ce bonus est une proposition pédagogique ; la recherche disponible ne justifie pas de le classer parmi les principaux cas DNB.

Métier : Responsable commercial / Revenue Operations. Un binôme choisit un seul parcours.

## Sources et règles

Une ligne par opportunity_id, 360 opportunités. account_id est une FK vers un seul compte du snapshot, relation N:1. Montants en EUR ; exclure amount_verified=0 du KPI et montrer le compte exclu. Périmètre initial : expected_close_date du 1er décembre inclus au 1er janvier exclu, stages Discovery/Evaluation/Negotiation, snapshot 17 novembre. Pipeline ouvert = somme des montants vérifiés. Pipeline pondéré = somme montant × probabilité ; les probabilités 20/50/75 % sont pédagogiques, non calibrées, pas une prévision fiable. Won/Lost sont exclus. Opportunité sans activité depuis au moins 30 jours = à revoir ; ce signal ne prouve pas une perte. Ne jamais sommer le MRR compte après une jointure 1:N.

Sources : {{catalog}}.{{schema}}.opportunities, {{catalog}}.{{schema}}.account_snapshot. Utilisez le namespace du reçu du notebook d’installation.

## 1. Investiguer avec Genie

1. Quel est le pipeline ouvert de décembre 2026 par pays, en montant brut et pondéré ? Exclue Won et Lost et donne le SQL et les définitions.

2. Ne retiens que les montants vérifiés. Quel montant est sans activité depuis au moins 30 jours ? Vérifie que la jointure ne multiplie pas les opportunités.

3. Peut-on présenter le pipeline pondéré comme du revenu garanti ? Une opportunité importante mais inactive est-elle forcément perdue ? Propose la preuve à demander au commercial.

Conservez conversation, SQL, résultat, identité, date et incertitude.

## 2. Construire

```text
Nous participons au workshop AWS × Databricks à STATION F le 24 novembre 2026. NovaFlow est une entreprise SaaS B2B fictive. Toutes les données sont synthétiques, version stationf-synthetic-v1, arrêtées au 17 novembre 2026 ; elles ne décrivent aucun client réel.
Construis dans l’App Space préparé dans notre Trial une petite application en français, en lecture seule. Inspecte d’abord les schémas et les permissions. Si une source manque, si la requête échoue ou si l’identité n’a pas accès, affiche le problème ; n’invente ni colonne ni résultat et ne remplace pas la requête par un fichier local.
Utilise exclusivement les objets du namespace {{catalog}}.{{schema}}. Utilise le catalogue et le schéma confirmés dans le reçu du notebook d’installation. Ne lis aucune autre donnée. Le mode d’accès attendu est l’autorisation utilisateur, avec l’identité du participant et les scopes confirmés par l’administrateur. Vérifie le mode réellement actif et affiche-le ; si seules des Shared data sont disponibles, fais confirmer ce changement avant de poursuivre. Un sélecteur visuel de rôle n’accorde aucun droit.
Affiche les filtres, la date de référence, les unités EUR, la définition des KPI et les requêtes. Prévois les états chargement, absence de données, erreur et accès refusé. Lie les paramètres sans concaténation SQL. Aucun envoi de campagne, mise à jour CRM ou promesse d’enregistrement durable. Toute variation locale doit porter « Simulation — non enregistrée ».

Contrat métier : Une ligne par opportunity_id, 360 opportunités. account_id est une FK vers un seul compte du snapshot, relation N:1. Montants en EUR ; exclure amount_verified=0 du KPI et montrer le compte exclu. Périmètre initial : expected_close_date du 1er décembre inclus au 1er janvier exclu, stages Discovery/Evaluation/Negotiation, snapshot 17 novembre. Pipeline ouvert = somme des montants vérifiés. Pipeline pondéré = somme montant × probabilité ; les probabilités 20/50/75 % sont pédagogiques, non calibrées, pas une prévision fiable. Won/Lost sont exclus. Opportunité sans activité depuis au moins 30 jours = à revoir ; ce signal ne prouve pas une perte. Ne jamais sommer le MRR compte après une jointure 1:N.

Sources : {{catalog}}.{{schema}}.opportunities (opportunity_id, account_id, stage, amount_eur, probability, expected_close_date, days_since_activity, amount_verified, as_of_date) et {{catalog}}.{{schema}}.account_snapshot (account_id, company, country et le contrat associé).
Crée « Revue pipeline décembre » avec trois KPI : pipeline ouvert vérifié, pipeline pondéré pédagogique, montant inactif depuis ≥30 jours. Montre le détail des opportunités, le pays, la dernière activité et les montants exclus pour manque de vérification. Filtres pays/stage/date. Rejoins les comptes une seule fois sur account_id au même snapshot. Compare à S1 dans sql/sales.sql. L’utilisateur peut préparer une liste de revue, sans modifier le CRM. Ne présente aucun montant comme un engagement ou une prévision ML.
Le propriétaire du Trial peut écrire dans les tables. Ce compte ne démontre pas une restriction en lecture seule. Sans seconde identité limitée préparée, consigne les tests de refus NOT RUN.
```

## 3. Itérer

Consignez d’abord les observations réelles et ajoutez-les au prompt.

```text
Conserve le contrat S1 et les observations du cahier. Réconcilie le nombre d’opportunités, le pipeline ouvert et pondéré avec S1, même filtre et identité. Ajoute un contrôle de cardinalité avant/après jointure ; un compte peut avoir plusieurs opportunités et le MRR du compte ne doit pas être additionné plusieurs fois. Rends visibles les montants non vérifiés et les opportunités inactives. Teste une période 2028, un pays sans opportunité, et l’identité sans accès. Affiche « pondération pédagogique, non calibrée ». Toute modification locale des probabilités reste une simulation non enregistrée. Conserve la version précédente et fournis un relevé de vérification. Sans seconde identité de test disponible, indique NOT RUN pour le refus d’accès ; le compte administrateur Trial ne valide pas ce contrôle.
```

## 4. Vérifier

| Cas | Attendu | Statut |
|---|---|---|
| Normal | Même compte d’opportunités et montants que S1, tolérance ±0,01 EUR. | NOT RUN |
| Incomplet | Montants non vérifiés exclus des KPI, population exclue explicitée. | NOT RUN |
| Contre-exemple | Une opportunité inactive reste ouverte ; ne pas la classer automatiquement Lost. | NOT RUN |
| Vide | Dates en 2028 : zéro opportunité et message clair. | NOT RUN |
| Accès | Le compte Trial lit les sources. Le refus de lecture et d’écriture doit être testé avec une seconde identité limitée préparée ; sinon NOT RUN. Le propriétaire des tables ne valide pas une restriction en lecture seule. | NOT RUN |

```sql
-- S1. Pipeline ouvert vérifié de décembre ; pondération pédagogique non calibrée.
-- Une opportunité rejoint exactement un compte du snapshot.
SELECT a.country, COUNT(*) AS opportunities,
  SUM(o.amount_eur) AS open_pipeline_eur,
  ROUND(SUM(o.amount_eur * o.probability), 2) AS weighted_pipeline_eur,
  SUM(CASE WHEN o.days_since_activity >= 30 THEN o.amount_eur ELSE 0 END) AS stale_pipeline_eur
FROM opportunities o
JOIN account_snapshot a ON o.account_id = a.account_id
WHERE o.as_of_date = '2026-11-17' AND a.as_of_date = '2026-11-17'
  AND o.expected_close_date >= '2026-12-01' AND o.expected_close_date < '2027-01-01'
  AND o.stage IN ('Discovery','Evaluation','Negotiation')
  AND o.amount_verified = 1
GROUP BY a.country
ORDER BY weighted_pipeline_eur DESC, a.country;

```

Les résultats locaux sont dans reference-results.json ; ne prouvent pas un résultat live.

## 5. Présenter et décider

30 s problème, 60 s application ou analyse, 60 s preuve et limite, 30 s prochaine étape. Exportez URL/version, SQL/résultat, statut de chaque contrôle, responsable et date.

## Si bloqué

Avec Genie uniquement, livrer la revue S1 et les hypothèses de pondération, sans déclarer une application construite.
