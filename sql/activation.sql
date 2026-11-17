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
