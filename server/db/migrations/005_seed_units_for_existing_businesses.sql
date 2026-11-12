INSERT INTO units (organization_id, name, abbreviation)
SELECT o.id, u.name, u.abbreviation
FROM organizations o
CROSS JOIN (
  SELECT 'Pieces' AS name, 'pcs' AS abbreviation
  UNION ALL SELECT 'Kilograms', 'kg'
  UNION ALL SELECT 'Grams', 'g'
  UNION ALL SELECT 'Litres', 'l'
  UNION ALL SELECT 'Millilitres', 'ml'
  UNION ALL SELECT 'Boxes', 'box'
  UNION ALL SELECT 'Packs', 'pack'
  UNION ALL SELECT 'Dozens', 'doz'
  UNION ALL SELECT 'Metres', 'm'
) u;