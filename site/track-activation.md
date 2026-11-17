# Quelle audience pour quelle action ?

Segmentation, personnalisation et priorisation commerciale

## Votre décision

Séparer les audiences à développer, à accompagner et à examiner, puis choisir une action humaine adaptée à chaque groupe.

Métier : Responsable CRM / Sales / Growth. Un binôme choisit un seul parcours.

## Sources et règles

Une ligne par compte au 17 novembre 2026. Les utilisateurs actifs sont mesurés sur deux fenêtres de 28 jours. Calculer le ratio courant/précédent uniquement si la télémétrie est complète et la base précédente positive. Engagé : ratio ≥1,05 ; Stable : 0,60 ≤ ratio <1,05 ; À revoir : ratio <0,60 ; sinon Preuve insuffisante. Les groupes sont mutuellement exclusifs et couvrent 240 comptes. eligible_for_review compte les comptes à télémétrie complète, avec email_opt_in=1 et un groupe calculable ; il indique seulement l’éligibilité à une revue humaine. Montrer séparément les comptes non opt-in. La somme MRR est EUR/mois, pas un potentiel incrémental. Ces règles sont pédagogiques, sans modèle ML, causalité, envoi ni recommandation automatisée de traitement.

Sources : {{catalog}}.{{schema}}.account_snapshot. Utilisez le namespace du reçu du notebook d’installation.

## 1. Investiguer avec Genie

1. Répartis les 240 comptes en groupes Engagé, Stable, À revoir et Preuve insuffisante à partir de l’évolution des utilisateurs actifs. Propose d’abord des seuils explicites puis applique le contrat A1. Donne les effectifs, MRR et SQL.

2. Pour chaque groupe, combien de comptes ont un opt-in et une télémétrie complète ? Vérifie que les groupes couvrent exactement les 240 comptes, sans doublon ni compte oublié.

3. Peut-on traiter automatiquement un compte sans télémétrie comme désengagé ? Un fort engagement suffit-il à recommander une offre commerciale ? Distingue signal, hypothèse et action à valider.

Conservez conversation, SQL, résultat, identité, date et incertitude.

## 2. Construire

```text
Nous participons au workshop AWS × Databricks à STATION F le 24 novembre 2026. NovaFlow est une entreprise SaaS B2B fictive. Toutes les données sont synthétiques, version stationf-synthetic-v1, arrêtées au 17 novembre 2026 ; elles ne décrivent aucun client réel.
Construis dans l’App Space préparé dans notre Trial une petite application en français, en lecture seule. Inspecte d’abord les schémas et les permissions. Si une source manque, si la requête échoue ou si l’identité n’a pas accès, affiche le problème ; n’invente ni colonne ni résultat et ne remplace pas la requête par un fichier local.
Utilise exclusivement les objets du namespace {{catalog}}.{{schema}}. Utilise le catalogue et le schéma confirmés dans le reçu du notebook d’installation. Ne lis aucune autre donnée. Le mode d’accès attendu est l’autorisation utilisateur, avec l’identité du participant et les scopes confirmés par l’administrateur. Vérifie le mode réellement actif et affiche-le ; si seules des Shared data sont disponibles, fais confirmer ce changement avant de poursuivre. Un sélecteur visuel de rôle n’accorde aucun droit.
Affiche les filtres, la date de référence, les unités EUR, la définition des KPI et les requêtes. Prévois les états chargement, absence de données, erreur et accès refusé. Lie les paramètres sans concaténation SQL. Aucun envoi de campagne, mise à jour CRM ou promesse d’enregistrement durable. Toute variation locale doit porter « Simulation — non enregistrée ».

Contrat métier : Une ligne par compte au 17 novembre 2026. Les utilisateurs actifs sont mesurés sur deux fenêtres de 28 jours. Calculer le ratio courant/précédent uniquement si la télémétrie est complète et la base précédente positive. Engagé : ratio ≥1,05 ; Stable : 0,60 ≤ ratio <1,05 ; À revoir : ratio <0,60 ; sinon Preuve insuffisante. Les groupes sont mutuellement exclusifs et couvrent 240 comptes. eligible_for_review compte les comptes à télémétrie complète, avec email_opt_in=1 et un groupe calculable ; il indique seulement l’éligibilité à une revue humaine. Montrer séparément les comptes non opt-in. La somme MRR est EUR/mois, pas un potentiel incrémental. Ces règles sont pédagogiques, sans modèle ML, causalité, envoi ni recommandation automatisée de traitement.

Source : {{catalog}}.{{schema}}.account_snapshot ; colonnes account_id, company, country, segment, mrr_eur, users_previous_28d, users_current_28d, telemetry_complete, email_opt_in, as_of_date.
Crée une page « Revue des audiences » : quatre cartes de groupes avec effectif et MRR, un tableau détaillé filtrable par groupe/pays/segment, la définition du ratio et l’opt-in visible. Distingue les comptes éligibles à une revue et les comptes sans preuve ou opt-in. Le détail doit expliquer pourquoi un compte appartient au groupe. Applique A1 dans sql/activation.sql et conserve les groupes exclusifs. Propose un espace de recommandation à copier dans notre cahier ; aucune campagne, activation CRM ou promesse de sauvegarde serveur. Un aperçu fonctionnel et les contrôles encore nécessaires constituent la première livraison.
Le propriétaire du Trial peut écrire dans les tables. Ce compte ne démontre pas une restriction en lecture seule. Sans seconde identité limitée préparée, consigne les tests de refus NOT RUN.
```

## 3. Itérer

Consignez d’abord les observations réelles et ajoutez-les au prompt.

```text
Conserve l’application et le contrat A1. Corrige les écarts réels de notre cahier. Compare les effectifs de chaque groupe à A1 : leur total doit être 240, et la somme des MRR doit égaler celle des comptes du snapshot. Vérifie les bornes 0,60 et 1,05, les 12 comptes à télémétrie incomplète, et les comptes sans opt-in. Un compte sans preuve doit rester dans Preuve insuffisante, pas À revoir. Un filtre pays ZZ doit afficher un état vide. Teste le refus de lecture avec l’identité de test. Une simulation de seuils ne doit modifier ni les sources ni envoyer de campagne. Expose les seuils actifs, les changements et le relevé des vérifications, sans substituer des constantes aux requêtes. Sans seconde identité de test disponible, indique NOT RUN pour le refus d’accès ; le compte administrateur Trial ne valide pas ce contrôle.
```

## 4. Vérifier

| Cas | Attendu | Statut |
|---|---|---|
| Normal | Comparer les quatre groupes à A1 ; total exact de 240 comptes, somme MRR exacte. | NOT RUN |
| Incomplet | Les 12 comptes sans télémétrie complète sont dans Preuve insuffisante et non éligibles à la revue. | NOT RUN |
| Contre-exemple | Un compte engagé sans opt-in est visible dans les statistiques, mais exclu de eligible_for_review. | NOT RUN |
| Vide | Pays ZZ : aucun compte et message explicite. | NOT RUN |
| Accès | Le compte Trial lit les sources. Le refus de lecture et d’écriture doit être testé avec une seconde identité limitée préparée ; sinon NOT RUN. Le propriétaire des tables ne valide pas une restriction en lecture seule. | NOT RUN |

```sql
-- A1. Segmentation pédagogique de revue commerciale, pas de score ML.
-- Une règle lisible et explicite ; aucune campagne n'est envoyée.
WITH segments AS (
  SELECT account_id, segment, mrr_eur, email_opt_in, telemetry_complete,
    CASE WHEN telemetry_complete = 0 OR users_previous_28d <= 0 THEN 'Preuve insuffisante'
         WHEN 1.0 * users_current_28d / users_previous_28d >= 1.05 THEN 'Engagé'
         WHEN 1.0 * users_current_28d / users_previous_28d >= 0.60 THEN 'Stable'
         ELSE 'À revoir' END AS engagement_tier
  FROM account_snapshot WHERE as_of_date = '2026-11-17'
)
SELECT engagement_tier, COUNT(*) AS accounts, SUM(mrr_eur) AS mrr_eur,
  SUM(CASE WHEN email_opt_in = 1 AND telemetry_complete = 1
           AND engagement_tier <> 'Preuve insuffisante' THEN 1 ELSE 0 END) AS eligible_for_review
FROM segments
GROUP BY engagement_tier
ORDER BY engagement_tier;

```

Les résultats locaux sont dans reference-results.json ; ne prouvent pas un résultat live.

## 5. Présenter et décider

30 s problème, 60 s application ou analyse, 60 s preuve et limite, 30 s prochaine étape. Exportez URL/version, SQL/résultat, statut de chaque contrôle, responsable et date.

## Si bloqué

Avec Genie uniquement, sauvegarder le tableau de segmentation, une proposition d’action par groupe et la preuve manquante. La construction d’application reste BLOCKED si Builder est indisponible.
