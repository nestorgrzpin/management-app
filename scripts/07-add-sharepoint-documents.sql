-- Add SharePoint document URL field to project_activities
ALTER TABLE project_activities
ADD COLUMN sharepoint_document_url TEXT,
ADD COLUMN document_name TEXT;

-- Create index for faster lookups
CREATE INDEX idx_project_activities_sharepoint_url 
ON project_activities(sharepoint_document_url) 
WHERE sharepoint_document_url IS NOT NULL;

-- Add comment explaining the field
COMMENT ON COLUMN project_activities.sharepoint_document_url IS 'URL to SharePoint document linked to this activity';
COMMENT ON COLUMN project_activities.document_name IS 'Display name of the SharePoint document';
