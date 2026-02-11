-- Disable RLS for users table to allow server API operations
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS and create proper policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow service role (via API) to manage users
CREATE POLICY "Service role can manage users"
  ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow users to read their own profile
CREATE POLICY "Users can read their own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
