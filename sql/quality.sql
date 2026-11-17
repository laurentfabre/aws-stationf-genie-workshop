-- Q1. Une ligne de résultat ; les défauts sont à traiter explicitement.
SELECT
  (SELECT COUNT(*) FROM account_snapshot) AS accounts,
  (SELECT COUNT(DISTINCT account_id) FROM account_snapshot) AS distinct_accounts,
  (SELECT COUNT(*) FROM campaign_weekly) AS campaign_weeks,
  (SELECT COUNT(*) FROM opportunities) AS opportunities,
  (SELECT COUNT(DISTINCT opportunity_id) FROM opportunities) AS distinct_opportunities,
  (SELECT COUNT(*) FROM account_snapshot WHERE telemetry_complete = 0) AS incomplete_telemetry,
  (SELECT COUNT(*) FROM campaign_weekly WHERE attribution_complete = 0) AS incomplete_attribution,
  (SELECT COUNT(*) FROM opportunities WHERE amount_verified = 0) AS unverified_amounts,
  (SELECT COUNT(*) FROM opportunities o LEFT JOIN account_snapshot a ON a.account_id=o.account_id WHERE a.account_id IS NULL) AS orphan_opportunities;
