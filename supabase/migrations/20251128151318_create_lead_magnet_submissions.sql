/*
  # Create Lead Magnet Submissions Table

  1. New Tables
    - `lead_magnet_submissions`
      - `id` (uuid, primary key) - Unique identifier for each submission
      - `created_at` (timestamptz) - Timestamp of submission
      - `company_name` (text) - Name of the company
      - `contact_name` (text) - Name of the contact person
      - `email` (text) - Contact email address
      - `phone` (text, optional) - Contact phone number
      - `challenge_description` (text) - The specific revenue challenge described
      - `arr_range` (text, optional) - Annual Recurring Revenue range
      - `acv` (text, optional) - Average Contract Value
      - `sales_cycle_days` (integer, optional) - Length of sales cycle in days
      - `additional_context` (text, optional) - Any additional context provided
      - `status` (text) - Status of the submission (new, reviewed, responded, converted)
      - `updated_at` (timestamptz) - Last update timestamp

    - `email_captures`
      - `id` (uuid, primary key) - Unique identifier
      - `created_at` (timestamptz) - Timestamp of capture
      - `email` (text) - Captured email address
      - `source` (text) - Where the email was captured (exit_intent, newsletter, etc.)
      - `converted` (boolean) - Whether they converted to a lead

  2. Security
    - Enable RLS on both tables
    - Add policy for service role to manage all data
    - Public users can insert their own submissions
    
  3. Important Notes
    - Indexes added on email and created_at for efficient querying
    - Status defaults to 'new' for new submissions
    - Timestamps auto-update on modification
*/

-- Create lead_magnet_submissions table
CREATE TABLE IF NOT EXISTS lead_magnet_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  challenge_description text NOT NULL,
  arr_range text,
  acv text,
  sales_cycle_days integer,
  additional_context text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'responded', 'converted'))
);

-- Create email_captures table
CREATE TABLE IF NOT EXISTS email_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  email text NOT NULL,
  source text DEFAULT 'unknown',
  converted boolean DEFAULT false
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_lead_magnet_email ON lead_magnet_submissions(email);
CREATE INDEX IF NOT EXISTS idx_lead_magnet_created ON lead_magnet_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_magnet_status ON lead_magnet_submissions(status);
CREATE INDEX IF NOT EXISTS idx_email_captures_email ON email_captures(email);
CREATE INDEX IF NOT EXISTS idx_email_captures_created ON email_captures(created_at DESC);

-- Enable Row Level Security
ALTER TABLE lead_magnet_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_captures ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to insert their submissions
CREATE POLICY "Anyone can submit lead magnet form"
  ON lead_magnet_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow public to insert email captures
CREATE POLICY "Anyone can submit email capture"
  ON email_captures
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Service role can read/update all submissions
CREATE POLICY "Service role can manage lead submissions"
  ON lead_magnet_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Service role can manage email captures
CREATE POLICY "Service role can manage email captures"
  ON email_captures
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_lead_magnet_updated_at
  BEFORE UPDATE ON lead_magnet_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();