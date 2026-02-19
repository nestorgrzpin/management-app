-- Script to inspect actual database schema
-- Lists all columns in key tables to understand actual structure

SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_name IN ('activities', 'project_activities', 'projects')
ORDER BY 
  table_name, 
  ordinal_position;
