-- Backfill project_activities for projects that don't have any activities yet
-- This script copies all activities from the activities template table for each existing project

-- First, let's insert all missing project_activities
INSERT INTO project_activities (project_id, activity_id, status, created_at, updated_at)
SELECT 
  p.id as project_id,
  a.id as activity_id,
  'not_started' as status,
  NOW() as created_at,
  NOW() as updated_at
FROM projects p
CROSS JOIN activities a
WHERE NOT EXISTS (
  SELECT 1 FROM project_activities pa 
  WHERE pa.project_id = p.id AND pa.activity_id = a.id
)
AND p.created_at IS NOT NULL;

-- Log the results
SELECT COUNT(*) as activities_created FROM (
  SELECT 
    p.id as project_id,
    COUNT(a.id) as activities_count
  FROM projects p
  LEFT JOIN project_activities pa ON p.id = pa.project_id
  LEFT JOIN activities a ON pa.activity_id = a.id
  GROUP BY p.id
) as results;
