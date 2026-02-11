-- Create users table with roles
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('analyst', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  start_date DATE NOT NULL,
  estimated_amount DECIMAL(15, 2),
  adjudication_type TEXT,
  estimated_execution_date DATE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived'))
);

-- Create phases table
CREATE TABLE IF NOT EXISTS phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  phase_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activities table (includes both activities and subactivities)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL, -- e.g., "1.1", "1.2", "2.3.1"
  name TEXT NOT NULL,
  objective TEXT,
  expected_info TEXT,
  phase_id UUID NOT NULL REFERENCES phases(id),
  parent_activity_id UUID REFERENCES activities(id),
  is_subactivity BOOLEAN DEFAULT FALSE,
  base_duration_value INTEGER NOT NULL, -- duration in hours or days
  base_duration_unit TEXT NOT NULL CHECK (base_duration_unit IN ('hours', 'days')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create project activities table (linking projects to the activity template)
CREATE TABLE IF NOT EXISTS project_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id),
  actual_duration_value INTEGER, -- customized duration
  actual_duration_unit TEXT CHECK (actual_duration_unit IN ('hours', 'days')),
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create dependencies table
CREATE TABLE IF NOT EXISTS activity_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id),
  depends_on_activity_id UUID NOT NULL REFERENCES activities(id),
  dependency_type TEXT DEFAULT 'finish_to_start' CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_activities_phase_id ON activities(phase_id);
CREATE INDEX idx_activities_parent_id ON activities(parent_activity_id);
CREATE INDEX idx_project_activities_project_id ON project_activities(project_id);
CREATE INDEX idx_project_activities_activity_id ON project_activities(activity_id);
CREATE INDEX idx_activity_dependencies_activity_id ON activity_dependencies(activity_id);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own record
CREATE POLICY "Users can view own record" ON users
  FOR SELECT USING (auth.uid() = id);

-- Projects - Users can see projects they created or admins can see all
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (
    auth.uid() = created_by OR 
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can insert projects" ON projects
  FOR INSERT WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Project activities - same as projects
CREATE POLICY "Users can view project activities" ON project_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_activities.project_id 
      AND (projects.created_by = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin')
    )
  );
