-- ============================================================
-- SUPABASE FRIEND REQUESTS TABLE SETUP
-- Run this SQL in your Supabase SQL Editor
-- ============================================================

-- 1. Create the friend_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS friend_requests (
  id BIGSERIAL PRIMARY KEY,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  from_user_name TEXT,
  to_user_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate pending requests
  CONSTRAINT unique_pending_request UNIQUE (from_user_id, to_user_id, status)
);

-- 2. Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_friend_requests_from_user ON friend_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to_user ON friend_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);

-- 3. Enable Row Level Security
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies (in case they're misconfigured)
DROP POLICY IF EXISTS "Users can view their own friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can insert friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can update their own friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Allow all selects" ON friend_requests;
DROP POLICY IF EXISTS "Allow all inserts" ON friend_requests;
DROP POLICY IF EXISTS "Allow all updates" ON friend_requests;

-- 5. Create permissive policies for the app to work
-- Allow anyone to SELECT (read) friend requests where they are sender or receiver
CREATE POLICY "Users can view their own friend requests" 
ON friend_requests FOR SELECT 
USING (
  auth.uid()::text = from_user_id::text 
  OR auth.uid()::text = to_user_id::text
  OR auth.uid() IS NULL  -- Allow anonymous access for testing
);

-- Allow anyone to INSERT friend requests
CREATE POLICY "Users can insert friend requests" 
ON friend_requests FOR INSERT 
WITH CHECK (true);

-- Allow users to UPDATE friend requests where they are involved
CREATE POLICY "Users can update their own friend requests" 
ON friend_requests FOR UPDATE 
USING (
  auth.uid()::text = from_user_id::text 
  OR auth.uid()::text = to_user_id::text
  OR auth.uid() IS NULL
);

-- 6. Create friendships table if needed
CREATE TABLE IF NOT EXISTS friendships (
  id BIGSERIAL PRIMARY KEY,
  user_id_1 UUID NOT NULL,
  user_id_2 UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_friendship UNIQUE (user_id_1, user_id_2)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their friendships" ON friendships;
DROP POLICY IF EXISTS "Users can insert friendships" ON friendships;

CREATE POLICY "Users can view their friendships" 
ON friendships FOR SELECT 
USING (
  auth.uid()::text = user_id_1::text 
  OR auth.uid()::text = user_id_2::text
  OR auth.uid() IS NULL
);

CREATE POLICY "Users can insert friendships" 
ON friendships FOR INSERT 
WITH CHECK (true);

-- 7. Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE ON friend_requests TO anon;
GRANT SELECT, INSERT, UPDATE ON friend_requests TO authenticated;
GRANT SELECT, INSERT ON friendships TO anon;
GRANT SELECT, INSERT ON friendships TO authenticated;

-- 8. Verify the setup
SELECT 'friend_requests table exists:' as check, EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'friend_requests') as result;
SELECT 'Total records in friend_requests:' as check, COUNT(*) as result FROM friend_requests;

-- ============================================================
-- DONE! Check the console in your app for debugging output.
-- ============================================================

