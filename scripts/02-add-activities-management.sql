-- Migration: Add Activity Management Fields
-- This migration adds support for:
-- 1. Expanded activity status tracking
-- 2. Duration management (estimated and actual)
-- 3. Responsible party tracking
-- 4. Document linking for activities

-- 0. Ensure extension for gen_random_uuid exists (if not already)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Drop old status constraint if it exists (table may be public.project_activities)
ALTER TABLE IF EXISTS public.project_activities
  DROP CONSTRAINT IF EXISTS project_activities_status_check;

-- 2. Add new columns to project_activities table
ALTER TABLE IF EXISTS public.project_activities
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'not_started';

-- If there are existing rows with NULL status, set default before adding strict check
UPDATE public.project_activities
SET status = 'not_started'
WHERE status IS NULL;

ALTER TABLE IF EXISTS public.project_activities
  ADD CONSTRAINT project_activities_status_check
  CHECK (status IN ('not_applicable', 'not_started', 'in_progress', 'review', 'completed'));

ALTER TABLE IF EXISTS public.project_activities
  ADD COLUMN IF NOT EXISTS responsible_user_id UUID REFERENCES public.users(id);

ALTER TABLE IF EXISTS public.project_activities
  ADD COLUMN IF NOT EXISTS responsible_department TEXT;

ALTER TABLE IF EXISTS public.project_activities
  ADD COLUMN IF NOT EXISTS sharepoint_link TEXT;

ALTER TABLE IF EXISTS public.project_activities
  ADD COLUMN IF NOT EXISTS actual_start_date DATE;

ALTER TABLE IF EXISTS public.project_activities
  ADD COLUMN IF NOT EXISTS actual_end_date DATE;

ALTER TABLE IF EXISTS public.project_activities
  ADD COLUMN IF NOT EXISTS duration_days INTEGER;

ALTER TABLE IF EXISTS public.project_activities
  ADD COLUMN IF NOT EXISTS estimated_duration_days INTEGER;

ALTER TABLE IF EXISTS public.project_activities
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE IF EXISTS public.project_activities
  ADD COLUMN IF NOT EXISTS slack_days INTEGER DEFAULT 0;

-- 3. Update activities table to support responsible actor
ALTER TABLE IF EXISTS public.activities
  ADD COLUMN IF NOT EXISTS responsible_actor TEXT;

-- 4. Create activity_documents table
CREATE TABLE IF NOT EXISTS public.activity_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_activity_id UUID NOT NULL REFERENCES public.project_activities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sharepoint_url TEXT NOT NULL,
  document_type TEXT DEFAULT 'general' CHECK (document_type IN ('technical', 'legal', 'financial', 'other', 'general')),
  uploaded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_activities_status ON public.project_activities(status);
CREATE INDEX IF NOT EXISTS idx_project_activities_responsible_user ON public.project_activities(responsible_user_id);
CREATE INDEX IF NOT EXISTS idx_activity_documents_project_activity ON public.activity_documents(project_activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_documents_uploaded_by ON public.activity_documents(uploaded_by);

-- 6. Enable RLS on new table
ALTER TABLE IF EXISTS public.activity_documents ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policy for activity_documents (SELECT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'activity_documents'
      AND policyname = 'Users can view activity documents'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can view activity documents"
      ON public.activity_documents
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.project_activities pa
          JOIN public.projects p ON p.id = pa.project_id
          WHERE pa.id = public.activity_documents.project_activity_id
            AND (
              p.created_by = (SELECT auth.uid())::uuid
              OR (SELECT role FROM public.users WHERE id = (SELECT auth.uid())::uuid) = 'admin'
            )
        )
      );
    $sql$;
  END IF;
END
$$;

-- 8. Update existing project_activities records with defaults for estimated duration
UPDATE public.project_activities 
SET estimated_duration_days = 
  CASE 
    WHEN actual_duration_unit = 'days' THEN actual_duration_value::integer
    WHEN actual_duration_unit = 'hours' THEN CEIL(actual_duration_value::numeric / 8.0)::integer
    ELSE 1
  END
WHERE estimated_duration_days IS NULL AND actual_duration_value IS NOT NULL;

UPDATE public.project_activities 
SET estimated_duration_days = 1 
WHERE estimated_duration_days IS NULL;

-- 9. RLS Policy for activity_documents (INSERT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'activity_documents'
      AND policyname = 'Users can insert activity documents'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can insert activity documents"
      ON public.activity_documents
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.project_activities pa
          JOIN public.projects p ON p.id = pa.project_id
          WHERE pa.id = activity_documents.project_activity_id
            AND (
              p.created_by = (SELECT auth.uid())::uuid
              OR (SELECT role FROM public.users WHERE id = (SELECT auth.uid())::uuid) = 'admin'
            )
        )
      );
    $sql$;
  END IF;
END
$$;

-- 10. RLS Policy for activity_documents (DELETE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'activity_documents'
      AND policyname = 'Users can delete activity documents'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can delete activity documents"
      ON public.activity_documents
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.project_activities pa
          JOIN public.projects p ON p.id = pa.project_id
          WHERE pa.id = project_activity_id
            AND (
              p.created_by = (SELECT auth.uid())::uuid
              OR (SELECT role FROM public.users WHERE id = (SELECT auth.uid())::uuid) = 'admin'
            )
        )
      );
    $sql$;
  END IF;
END
$$;

-- 11. Maintain updated_at timestamp on update via trigger
CREATE OR REPLACE FUNCTION public.activity_documents_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_updated_at_activity_documents ON public.activity_documents;

CREATE TRIGGER trg_set_updated_at_activity_documents
BEFORE UPDATE ON public.activity_documents
FOR EACH ROW
EXECUTE FUNCTION public.activity_documents_set_updated_at();
