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
