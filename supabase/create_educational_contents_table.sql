-- Create educational_contents table
CREATE TABLE educational_contents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  title text NOT NULL,
  description text,
  content_type text CHECK (content_type IN ('video', 'article')) NOT NULL,
  video_url text,
  article_text text,
  active boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE educational_contents ENABLE ROW LEVEL SECURITY;

-- Policies

-- Admin has full access to educational_contents
CREATE POLICY "Admins have full access to educational_contents" 
  ON educational_contents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Patients and Professionals can only view active content
CREATE POLICY "Users can view active educational_contents" 
  ON educational_contents
  FOR SELECT
  USING (
    active = true AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('patient', 'professional', 'admin')
    )
  );
