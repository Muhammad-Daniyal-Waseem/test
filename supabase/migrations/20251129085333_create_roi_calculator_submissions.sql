/*
  # Create ROI Calculator Submissions Table

  1. New Tables
    - `roi_calculator_submissions`
      - `id` (uuid, primary key)
      - `email` (text, required) - User's email address
      - `current_arr` (numeric) - Current ARR value
      - `growth_goal` (numeric) - Growth goal percentage
      - `avg_deal_size` (numeric) - Average deal size
      - `sales_cycle` (numeric) - Sales cycle in months
      - `team_size` (integer) - Team size
      - `projected_revenue` (numeric) - Calculated projected revenue
      - `monthly_deals` (numeric) - Calculated monthly deals needed
      - `pipeline_value` (numeric) - Calculated pipeline value required
      - `submitted_at` (timestamptz) - Timestamp of submission
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on `roi_calculator_submissions` table
    - Add policy for service role to insert data (edge function access)
    - Add policy for authenticated admin users to read data
*/

CREATE TABLE IF NOT EXISTS roi_calculator_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  current_arr numeric NOT NULL,
  growth_goal numeric NOT NULL,
  avg_deal_size numeric NOT NULL,
  sales_cycle numeric NOT NULL,
  team_size integer NOT NULL,
  projected_revenue numeric NOT NULL,
  monthly_deals numeric NOT NULL,
  pipeline_value numeric NOT NULL,
  submitted_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roi_calculator_submissions ENABLE ROW LEVEL SECURITY;

-- Policy for service role (edge functions) to insert data
CREATE POLICY "Service role can insert calculator submissions"
  ON roi_calculator_submissions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy for authenticated users to read their own submissions
CREATE POLICY "Users can read their own submissions"
  ON roi_calculator_submissions
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt()->>'email');

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_roi_submissions_email ON roi_calculator_submissions(email);
CREATE INDEX IF NOT EXISTS idx_roi_submissions_submitted_at ON roi_calculator_submissions(submitted_at DESC);
