# Où investir le prochain euro ?

Performance des campagnes et qualité de l’attribution

## Votre décision

Choisir deux canaux à examiner pour une réallocation de budget, avec les limites d’attribution.

Métier : Responsable Growth / Marketing. Un binôme choisit un seul parcours.

## Sources et règles

Une ligne par (campaign_id, week_start), 6 campagnes × 8 semaines, du 21 septembre au 9 novembre 2026 inclus. Les semaines sont des cohortes d’acquisition ; le revenu net attribué et les nouveaux clients sont arrêtés au 17 novembre. Attribution exclusive au dernier contact, une seule campagne créditée ; ce choix est pédagogique. Le ROAS attribué est SUM(revenu net) / SUM(dépenses), sur les seules semaines complètes. Le coût d’acquisition est SUM(dépenses) / SUM(nouveaux clients) sur ce même périmètre ; NULL si zéro client. Ce coût ne comprend pas l’ensemble des coûts commerciaux et n’est donc pas un CAC complet. Ne pas moyenner les ratios. Exposer les dépenses et semaines exclues. Aucun effet causal ni ROI de marge n’est mesuré.

Sources : {{catalog}}.{{schema}}.campaign_weekly. Utilisez le namespace du reçu du notebook d’installation.

## 1. Investiguer avec Genie

1. Sur les huit semaines du 21 septembre au 9 novembre 2026, quels canaux affichent le meilleur ROAS attribué et coût d’acquisition ? Donne la formule, le périmètre et le SQL.

2. Recalcule les ratios sur les seules semaines dont attribution_complete=1. Affiche aussi dépenses totales, dépenses exclues et nombre de semaines complètes.

3. Un canal a beaucoup de leads, mais deux semaines sans attribution. Peut-on conclure qu’il est mauvais ? Que faudrait-il vérifier avant de modifier le budget ?

Conservez conversation, SQL, résultat, identité, date et incertitude.

## 2. Construire

```text
Nous participons au workshop AWS × Databricks à STATION F le 24 novembre 2026. NovaFlow est une entreprise SaaS B2B fictive. Toutes les données sont synthétiques, version stationf-synthetic-v1, arrêtées au 17 novembre 2026 ; elles ne décrivent aucun client réel.
Construis dans l’App Space préparé dans notre Trial une petite application en français, en lecture seule. Inspecte d’abord les schémas et les permissions. Si une source manque, si la requête échoue ou si l’identité n’a pas accès, affiche le problème ; n’invente ni colonne ni résultat et ne remplace pas la requête par un fichier local.
Utilise exclusivement les objets du namespace {{catalog}}.{{schema}}. Utilise le catalogue et le schéma confirmés dans le reçu du notebook d’installation. Ne lis aucune autre donnée. Le mode d’accès attendu est l’autorisation utilisateur, avec l’identité du participant et les scopes confirmés par l’administrateur. Vérifie le mode réellement actif et affiche-le ; si seules des Shared data sont disponibles, fais confirmer ce changement avant de poursuivre. Un sélecteur visuel de rôle n’accorde aucun droit.
Affiche les filtres, la date de référence, les unités EUR, la définition des KPI et les requêtes. Prévois les états chargement, absence de données, erreur et accès refusé. Lie les paramètres sans concaténation SQL. Aucun envoi de campagne, mise à jour CRM ou promesse d’enregistrement durable. Toute variation locale doit porter « Simulation — non enregistrée ».

Contrat métier : Une ligne par (campaign_id, week_start), 6 campagnes × 8 semaines, du 21 septembre au 9 novembre 2026 inclus. Les semaines sont des cohortes d’acquisition ; le revenu net attribué et les nouveaux clients sont arrêtés au 17 novembre. Attribution exclusive au dernier contact, une seule campagne créditée ; ce choix est pédagogique. Le ROAS attribué est SUM(revenu net) / SUM(dépenses), sur les seules semaines complètes. Le coût d’acquisition est SUM(dépenses) / SUM(nouveaux clients) sur ce même périmètre ; NULL si zéro client. Ce coût ne comprend pas l’ensemble des coûts commerciaux et n’est donc pas un CAC complet. Ne pas moyenner les ratios. Exposer les dépenses et semaines exclues. Aucun effet causal ni ROI de marge n’est mesuré.

Source : {{catalog}}.{{schema}}.campaign_weekly. Colonnes : campaign_id, channel, week_start, spend_eur, leads, qualified_leads, new_customers, attributed_net_revenue_eur, attribution_complete, as_of_date.
Crée une page « Revue acquisition » avec un tableau trié par ROAS attribué, un graphique de dépenses par canal, les semaines manquantes et une explication des dénominateurs. Filtre par canal et période, initialement 21/09–09/11/2026. Utilise le contrat ci-dessus et compare à M1, fourni dans sql/marketing.sql. Montre pourquoi un canal sans nouveau client a un coût d’acquisition non calculable. L’action finale consiste à exporter une recommandation pour revue humaine, sans publier une campagne. Donne un aperçu fonctionnel et la liste des vérifications encore nécessaires.
Le propriétaire du Trial peut écrire dans les tables. Ce compte ne démontre pas une restriction en lecture seule. Sans seconde identité limitée préparée, consigne les tests de refus NOT RUN.
```

## 3. Itérer

Consignez d’abord les observations réelles et ajoutez-les au prompt.

```text
Conserve l’application et le contrat M1. Utilise les observations de notre cahier ci-dessous, avec le même dataset, identité et filtre. Corrige les écarts observés sans remplacer les chiffres calculés par les résultats de référence. Vérifie Paid Social : les deux semaines incomplètes et leurs dépenses doivent rester visibles ; compare ROAS calculé sur semaines complètes et agrégation naïve. Pour Expérimentation, zéro nouveau client doit donner un coût d’acquisition « non calculable », jamais zéro. Un filtre en 2028 doit afficher « aucune donnée ». Affiche le revenu net attribué et précise que le ROAS n’établit pas l’incrémentalité. Vérifie le refus d’accès avec l’identité de test fournie. Garde une liste des changements et des résultats PASS/FAIL/BLOCKED. Sans seconde identité de test disponible, indique NOT RUN pour le refus d’accès ; le compte administrateur Trial ne valide pas ce contrôle.
```

## 4. Vérifier

| Cas | Attendu | Statut |
|---|---|---|
| Normal | Comparer tous les canaux à M1, montants ±0,01 EUR et ROAS ±0,0001. | NOT RUN |
| Incomplet | Paid Social : 6 semaines complètes sur 8 ; dépenses exclues visibles. | NOT RUN |
| Contre-exemple | Expérimentation : coût d’acquisition NULL, aucun client ; ne pas confondre volume de leads et efficacité. | NOT RUN |
| Vide | Période 2028 : message explicite, aucun résultat inventé. | NOT RUN |
| Accès | Le compte Trial lit les sources. Le refus de lecture et d’écriture doit être testé avec une seconde identité limitée préparée ; sinon NOT RUN. Le propriétaire des tables ne valide pas une restriction en lecture seule. | NOT RUN |

```sql
-- M1. Catalogue/schéma : ceux fournis par le facilitateur. Données v1, EUR.
-- Seules les semaines avec attribution complète participent aux ratios.
-- Les dépenses exclues restent visibles. Ce ROAS n'est pas un effet causal.
SELECT channel,
  COUNT(*) AS weeks_total,
  SUM(attribution_complete) AS weeks_complete,
  SUM(spend_eur) AS spend_all_eur,
  SUM(CASE WHEN attribution_complete = 1 THEN spend_eur ELSE 0 END) AS spend_comparable_eur,
  SUM(CASE WHEN attribution_complete = 0 THEN spend_eur ELSE 0 END) AS spend_excluded_eur,
  SUM(CASE WHEN attribution_complete = 1 THEN new_customers ELSE 0 END) AS new_customers,
  SUM(CASE WHEN attribution_complete = 1 THEN attributed_net_revenue_eur ELSE 0 END) AS revenue_comparable_eur,
  ROUND(1.0 * SUM(CASE WHEN attribution_complete = 1 THEN attributed_net_revenue_eur ELSE 0 END)
    / NULLIF(SUM(CASE WHEN attribution_complete = 1 THEN spend_eur ELSE 0 END), 0), 4) AS attributed_roas,
  ROUND(1.0 * SUM(CASE WHEN attribution_complete = 1 THEN spend_eur ELSE 0 END)
    / NULLIF(SUM(CASE WHEN attribution_complete = 1 THEN new_customers ELSE 0 END), 0), 2) AS acquisition_cost_eur
FROM campaign_weekly
WHERE week_start >= '2026-09-21' AND week_start <= '2026-11-09'
GROUP BY channel
ORDER BY attributed_roas DESC, channel;

```

Les résultats locaux sont dans reference-results.json ; ne prouvent pas un résultat live.

## 5. Présenter et décider

30 s problème, 60 s application ou analyse, 60 s preuve et limite, 30 s prochaine étape. Exportez URL/version, SQL/résultat, statut de chaque contrôle, responsable et date.

## Si bloqué

Avec Genie uniquement, produire une courte recommandation avec M1, le SQL de Genie et une hypothèse à tester par expérimentation. L’application reste non construite.
