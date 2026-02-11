-- Fix RLS Policy: Allow users to create their own projects
DROP POLICY IF EXISTS "Admins can insert projects" ON projects;

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
  );

-- Also allow users to update their own projects
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    auth.uid() = created_by OR 
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Allow admins to insert and update any project
CREATE POLICY "Admins can manage all projects" ON projects
  FOR ALL USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Fix project_activities RLS: Allow users to insert activities for their projects
CREATE POLICY "Users can insert project activities" ON project_activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_activities.project_id 
      AND (projects.created_by = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin')
    )
  );

CREATE POLICY "Users can update project activities" ON project_activities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_activities.project_id 
      AND (projects.created_by = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_activities.project_id 
      AND (projects.created_by = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin')
    )
  );
