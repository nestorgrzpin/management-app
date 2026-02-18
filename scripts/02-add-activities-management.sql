-- Migration: Add Activity Management Fields
-- This migration adds support for:
-- 1. Expanded activity status tracking
-- 2. Duration management (estimated and actual)
-- 3. Responsible party tracking
-- 4. Document linking for activities

-- 1. Drop old status constraint if it exists and add new one
ALTER TABLE project_activities 
  DROP CONSTRAINT IF EXISTS project_activities_status_check;

-- 2. Add new columns to project_activities table
ALTER TABLE project_activities 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'not_started';

ALTER TABLE project_activities 
  ADD CONSTRAINT project_activities_status_check 
  CHECK (status IN ('not_applicable', 'not_started', 'in_progress', 'review', 'completed'));

ALTER TABLE project_activities 
  ADD COLUMN IF NOT EXISTS responsible_user_id UUID REFERENCES users(id);

ALTER TABLE project_activities 
  ADD COLUMN IF NOT EXISTS responsible_department TEXT;

ALTER TABLE project_activities 
  ADD COLUMN IF NOT EXISTS sharepoint_link TEXT;

ALTER TABLE project_activities 
  ADD COLUMN IF NOT EXISTS actual_start_date DATE;

ALTER TABLE project_activities 
  ADD COLUMN IF NOT EXISTS actual_end_date DATE;

ALTER TABLE project_activities 
  ADD COLUMN IF NOT EXISTS duration_days INTEGER;

ALTER TABLE project_activities 
  ADD COLUMN IF NOT EXISTS estimated_duration_days INTEGER;

ALTER TABLE project_activities 
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE project_activities 
  ADD COLUMN IF NOT EXISTS slack_days INTEGER DEFAULT 0;

-- 3. Update activities table to support responsible actor
ALTER TABLE activities 
  ADD COLUMN IF NOT EXISTS responsible_actor TEXT;

-- 4. Create activity_documents table
CREATE TABLE IF NOT EXISTS activity_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_activity_id UUID NOT NULL REFERENCES project_activities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sharepoint_url TEXT NOT NULL,
  document_type TEXT DEFAULT 'general' CHECK (document_type IN ('technical', 'legal', 'financial', 'other', 'general')),
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_activities_status ON project_activities(status);
CREATE INDEX IF NOT EXISTS idx_project_activities_responsible_user ON project_activities(responsible_user_id);
CREATE INDEX IF NOT EXISTS idx_activity_documents_project_activity ON activity_documents(project_activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_documents_uploaded_by ON activity_documents(uploaded_by);

-- 6. Enable RLS on new table
ALTER TABLE activity_documents ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policy for activity_documents
CREATE POLICY IF NOT EXISTS "Users can view activity documents" ON activity_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_activities 
      JOIN projects ON projects.id = project_activities.project_id
      WHERE project_activities.id = activity_documents.project_activity_id
      AND (projects.created_by = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin')
    )
  );

-- 8. Update existing project_activities records with defaults
UPDATE project_activities 
SET estimated_duration_days = 
  CASE 
    WHEN actual_duration_unit = 'days' THEN actual_duration_value
    WHEN actual_duration_unit = 'hours' THEN CEIL(actual_duration_value::float / 8.0)
    ELSE 1
  END
WHERE estimated_duration_days IS NULL AND actual_duration_value IS NOT NULL;

UPDATE project_activities 
SET estimated_duration_days = 1 
WHERE estimated_duration_days IS NULL;

-- 9. Create insert trigger for RLS policy
CREATE POLICY IF NOT EXISTS "Users can insert activity documents" ON activity_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_activities 
      JOIN projects ON projects.id = project_activities.project_id
      WHERE project_activities.id = project_activity_id
      AND (projects.created_by = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin')
    )
  );
