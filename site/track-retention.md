# Quels clients revoir cette semaine ?

Customer 360 et signaux de rétention

## Votre décision

Établir une liste de comptes à examiner avant renouvellement, puis décider quelle preuve manque avant toute prise de contact.

Métier : Responsable Customer Success / Account Manager. Un binôme choisit un seul parcours.

## Sources et règles

Une ligne par account_id au 17 novembre 2026, 240 comptes fictifs. MRR en EUR/mois, pas revenu perdu. Deux fenêtres successives de 28 jours, 23 septembre–20 octobre et 21 octobre–17 novembre inclus. Revue prioritaire : télémétrie complète, base précédente > 0, baisse strictement supérieure à 40 %, renouvellement du 17 novembre au 17 décembre inclus. Le seuil est une règle pédagogique, pas un modèle de churn. Télémétrie incomplète = preuve insuffisante, même si users_current_28d=0. L’opt-in doit rester visible ; il ne suffit pas à établir une base légale complète pour un contact réel. Aucun envoi automatique.

Sources : {{catalog}}.{{schema}}.account_snapshot. Utilisez le namespace du reçu du notebook d’installation.

## 1. Investiguer avec Genie

1. Quels comptes renouvellent entre le 17 novembre et le 17 décembre 2026 avec une baisse d’utilisateurs actifs de plus de 40 % ? Trie par MRR et montre les comptes et le SQL.

2. Exclus la télémétrie incomplète et les bases précédentes nulles ou égales à zéro. Combien de comptes et quel MRR total restent à examiner ?

3. Un compte a zéro utilisateur actif mais une télémétrie incomplète. Peut-on parler de churn ? Distingue fait observé, hypothèse et preuve manquante.

Conservez conversation, SQL, résultat, identité, date et incertitude.

## 2. Construire

```text
Nous participons au workshop AWS × Databricks à STATION F le 24 novembre 2026. NovaFlow est une entreprise SaaS B2B fictive. Toutes les données sont synthétiques, version stationf-synthetic-v1, arrêtées au 17 novembre 2026 ; elles ne décrivent aucun client réel.
Construis dans l’App Space préparé dans notre Trial une petite application en français, en lecture seule. Inspecte d’abord les schémas et les permissions. Si une source manque, si la requête échoue ou si l’identité n’a pas accès, affiche le problème ; n’invente ni colonne ni résultat et ne remplace pas la requête par un fichier local.
Utilise exclusivement les objets du namespace {{catalog}}.{{schema}}. Utilise le catalogue et le schéma confirmés dans le reçu du notebook d’installation. Ne lis aucune autre donnée. Le mode d’accès attendu est l’autorisation utilisateur, avec l’identité du participant et les scopes confirmés par l’administrateur. Vérifie le mode réellement actif et affiche-le ; si seules des Shared data sont disponibles, fais confirmer ce changement avant de poursuivre. Un sélecteur visuel de rôle n’accorde aucun droit.
Affiche les filtres, la date de référence, les unités EUR, la définition des KPI et les requêtes. Prévois les états chargement, absence de données, erreur et accès refusé. Lie les paramètres sans concaténation SQL. Aucun envoi de campagne, mise à jour CRM ou promesse d’enregistrement durable. Toute variation locale doit porter « Simulation — non enregistrée ».

Contrat métier : Une ligne par account_id au 17 novembre 2026, 240 comptes fictifs. MRR en EUR/mois, pas revenu perdu. Deux fenêtres successives de 28 jours, 23 septembre–20 octobre et 21 octobre–17 novembre inclus. Revue prioritaire : télémétrie complète, base précédente > 0, baisse strictement supérieure à 40 %, renouvellement du 17 novembre au 17 décembre inclus. Le seuil est une règle pédagogique, pas un modèle de churn. Télémétrie incomplète = preuve insuffisante, même si users_current_28d=0. L’opt-in doit rester visible ; il ne suffit pas à établir une base légale complète pour un contact réel. Aucun envoi automatique.

Source : {{catalog}}.{{schema}}.account_snapshot. Colonnes : account_id, company, segment, country, mrr_eur, users_previous_28d, users_current_28d, telemetry_complete, renewal_date, email_opt_in, as_of_date.
Crée « Revue renouvellements » : liste de comptes triée par MRR, filtres pays/segment, détail expliquant la règle, indicateur de qualité et opt-in. Laisse la fenêtre initiale 17/11–17/12/2026 et le seuil >40 %. Compare au SQL R1 dans sql/retention.sql. Affiche le nombre de comptes et leur MRR sans l’appeler prévision de perte. La sélection finale est une liste à discuter avec un responsable humain. Pas de score ML, contact automatisé ou bouton qui prétend sauvegarder une action.
Le propriétaire du Trial peut écrire dans les tables. Ce compte ne démontre pas une restriction en lecture seule. Sans seconde identité limitée préparée, consigne les tests de refus NOT RUN.
```

## 3. Itérer

Consignez d’abord les observations réelles et ajoutez-les au prompt.

```text
Conserve le contrat R1 et corrige les écarts consignés dans notre cahier. Ajoute une vue distincte « preuve insuffisante » pour telemetry_complete=0 ; un zéro de télémétrie n’est pas un churn confirmé. Pour le même périmètre, compare la liste exacte d’account_id et le MRR total à R1. Affiche le calcul individuel de baisse et la borne stricte >40 %. Vérifie une fenêtre de renouvellement 2028, le consentement visible et l’identité sans droit de lecture. Le seuil peut être simulé localement mais doit être clairement indiqué comme une simulation non enregistrée. Fournis version et preuves, y compris les échecs. Sans seconde identité de test disponible, indique NOT RUN pour le refus d’accès ; le compte administrateur Trial ne valide pas ce contrôle.
```

## 4. Vérifier

| Cas | Attendu | Statut |
|---|---|---|
| Normal | Comparer la liste des account_id et le total MRR à R1 ; exactitude des identifiants, montants ±0,01 EUR. | NOT RUN |
| Incomplet | A0019 a une télémétrie incomplète : ne pas conclure au churn. | NOT RUN |
| Contre-exemple | Une baisse d’activité hors fenêtre de renouvellement ne passe pas la règle R1 ; une règle n’est pas une probabilité. | NOT RUN |
| Vide | Renouvellements en 2028 : liste vide explicite. | NOT RUN |
| Accès | Le compte Trial lit les sources. Le refus de lecture et d’écriture doit être testé avec une seconde identité limitée préparée ; sinon NOT RUN. Le propriétaire des tables ne valide pas une restriction en lecture seule. | NOT RUN |

```sql
-- R1. Liste de revue humaine, pas une probabilité de churn.
-- Fenêtre de renouvellement fermée : 17 novembre au 17 décembre 2026.
SELECT account_id, company, country, segment, mrr_eur, renewal_date, email_opt_in,
  ROUND(100.0 * (users_previous_28d - users_current_28d)
    / NULLIF(users_previous_28d, 0), 2) AS activity_drop_pct
FROM account_snapshot
WHERE as_of_date = '2026-11-17'
  AND telemetry_complete = 1
  AND users_previous_28d > 0
  AND 1.0 * users_current_28d / users_previous_28d < 0.6
  AND renewal_date BETWEEN '2026-11-17' AND '2026-12-17'
ORDER BY mrr_eur DESC, account_id;

```

Les résultats locaux sont dans reference-results.json ; ne prouvent pas un résultat live.

## 5. Présenter et décider

30 s problème, 60 s application ou analyse, 60 s preuve et limite, 30 s prochaine étape. Exportez URL/version, SQL/résultat, statut de chaque contrôle, responsable et date.

## Si bloqué

Avec Genie uniquement, sauvegarder la liste R1 et une fiche de revue par compte. Qualifier la construction d’application BLOCKED si Builder n’est pas disponible.
