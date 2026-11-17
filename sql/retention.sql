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
