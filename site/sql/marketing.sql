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
