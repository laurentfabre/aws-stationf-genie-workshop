# Contrat de données — stationf-synthetic-v1

Arrêté au 17 novembre 2026 ; EUR ; aucune donnée personnelle ou client réelle. Les dates ISO sont stockées en chaînes YYYY-MM-DD dans les fichiers et tables d’atelier. Comparer lexicalement sur ce format ou convertir explicitement en DATE. Les comptes et opportunités sont un snapshot unique, pas un historique.

## Où investir le prochain euro ?

Une ligne par (campaign_id, week_start), 6 campagnes × 8 semaines, du 21 septembre au 9 novembre 2026 inclus. Les semaines sont des cohortes d’acquisition ; le revenu net attribué et les nouveaux clients sont arrêtés au 17 novembre. Attribution exclusive au dernier contact, une seule campagne créditée ; ce choix est pédagogique. Le ROAS attribué est SUM(revenu net) / SUM(dépenses), sur les seules semaines complètes. Le coût d’acquisition est SUM(dépenses) / SUM(nouveaux clients) sur ce même périmètre ; NULL si zéro client. Ce coût ne comprend pas l’ensemble des coûts commerciaux et n’est donc pas un CAC complet. Ne pas moyenner les ratios. Exposer les dépenses et semaines exclues. Aucun effet causal ni ROI de marge n’est mesuré.

## Quelle audience pour quelle action ?

Une ligne par compte au 17 novembre 2026. Les utilisateurs actifs sont mesurés sur deux fenêtres de 28 jours. Calculer le ratio courant/précédent uniquement si la télémétrie est complète et la base précédente positive. Engagé : ratio ≥1,05 ; Stable : 0,60 ≤ ratio <1,05 ; À revoir : ratio <0,60 ; sinon Preuve insuffisante. Les groupes sont mutuellement exclusifs et couvrent 240 comptes. eligible_for_review compte les comptes à télémétrie complète, avec email_opt_in=1 et un groupe calculable ; il indique seulement l’éligibilité à une revue humaine. Montrer séparément les comptes non opt-in. La somme MRR est EUR/mois, pas un potentiel incrémental. Ces règles sont pédagogiques, sans modèle ML, causalité, envoi ni recommandation automatisée de traitement.

## Quels clients revoir cette semaine ?

Une ligne par account_id au 17 novembre 2026, 240 comptes fictifs. MRR en EUR/mois, pas revenu perdu. Deux fenêtres successives de 28 jours, 23 septembre–20 octobre et 21 octobre–17 novembre inclus. Revue prioritaire : télémétrie complète, base précédente > 0, baisse strictement supérieure à 40 %, renouvellement du 17 novembre au 17 décembre inclus. Le seuil est une règle pédagogique, pas un modèle de churn. Télémétrie incomplète = preuve insuffisante, même si users_current_28d=0. L’opt-in doit rester visible ; il ne suffit pas à établir une base légale complète pour un contact réel. Aucun envoi automatique.

## Quel pipeline mérite notre attention ?

Une ligne par opportunity_id, 360 opportunités. account_id est une FK vers un seul compte du snapshot, relation N:1. Montants en EUR ; exclure amount_verified=0 du KPI et montrer le compte exclu. Périmètre initial : expected_close_date du 1er décembre inclus au 1er janvier exclu, stages Discovery/Evaluation/Negotiation, snapshot 17 novembre. Pipeline ouvert = somme des montants vérifiés. Pipeline pondéré = somme montant × probabilité ; les probabilités 20/50/75 % sont pédagogiques, non calibrées, pas une prévision fiable. Won/Lost sont exclus. Opportunité sans activité depuis au moins 30 jours = à revoir ; ce signal ne prouve pas une perte. Ne jamais sommer le MRR compte après une jointure 1:N.

## Colonnes

### account_snapshot

account_id, company, segment, country, mrr_eur, users_previous_28d, users_current_28d, telemetry_complete, renewal_date, email_opt_in, as_of_date

### campaign_weekly

campaign_id, channel, week_start, spend_eur, leads, qualified_leads, new_customers, attributed_net_revenue_eur, attribution_complete, as_of_date

### opportunities

opportunity_id, account_id, stage, amount_eur, probability, expected_close_date, days_since_activity, amount_verified, as_of_date

## Limites

Aucune causalité, prédiction ML entraînée, rentabilité nette ou donnée temps réel. La population est réduite à 240 comptes, 48 lignes campagne/semaine et 360 opportunités pour rendre la vérification manuelle possible. Les canaux ne peuvent pas être réattribués à partir de ce dataset agrégé. Les trois jeux ne se rejoignent pas pour démontrer un funnel complet.
