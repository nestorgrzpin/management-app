-- Verify which projects have activities and which don't
SELECT 
  p.id,
  p.name,
  p.client,
  COUNT(pa.id) as activity_count,
  CASE 
    WHEN COUNT(pa.id) = 0 THEN 'NEEDS BACKFILL'
    ELSE 'HAS ACTIVITIES'
  END as status
FROM projects p
LEFT JOIN project_activities pa ON p.id = pa.project_id
GROUP BY p.id, p.name, p.client
ORDER BY activity_count ASC, p.created_at DESC;
