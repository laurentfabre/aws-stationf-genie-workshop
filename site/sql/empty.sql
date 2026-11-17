-- E1. Cas vide connu : aucune opportunité clôturée en 2028 dans le dataset v1.
SELECT COUNT(*) AS opportunities_2028
FROM opportunities
WHERE expected_close_date >= '2028-01-01' AND expected_close_date < '2029-01-01';
