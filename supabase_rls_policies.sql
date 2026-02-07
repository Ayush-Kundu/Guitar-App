-- ========== ROW LEVEL SECURITY POLICIES FOR FRIENDS SYSTEM ==========
-- Run this SQL in your Supabase SQL Editor to enable security

-- Enable RLS on all tables
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- ========== FRIEND_REQUESTS POLICIES ==========

-- Users can view friend requests where they are the sender or receiver
CREATE POLICY "Users can view their own friend requests"
ON friend_requests
FOR SELECT
USING (
  auth.uid() = from_user_id OR 
  auth.uid() = to_user_id
);

-- Users can create friend requests where they are the sender
CREATE POLICY "Users can create friend requests"
ON friend_requests
FOR INSERT
WITH CHECK (
  auth.uid() = from_user_id
);

-- Users can update friend requests where they are the receiver (to accept/decline)
-- OR where they are the sender (to cancel)
CREATE POLICY "Users can update their own friend requests"
ON friend_requests
FOR UPDATE
USING (
  auth.uid() = to_user_id OR 
  auth.uid() = from_user_id
)
WITH CHECK (
  auth.uid() = to_user_id OR 
  auth.uid() = from_user_id
);

-- Users can delete their own sent requests (cancellation)
CREATE POLICY "Users can delete their sent friend requests"
ON friend_requests
FOR DELETE
USING (
  auth.uid() = from_user_id
);

-- ========== FRIENDSHIPS POLICIES ==========

-- Users can view friendships where they are a participant
CREATE POLICY "Users can view their own friendships"
ON friendships
FOR SELECT
USING (
  auth.uid() = user_id_1 OR 
  auth.uid() = user_id_2
);

-- Users can create friendships (system creates when request is accepted)
-- This is typically done via service role, but we allow if user is participant
CREATE POLICY "Users can create friendships they are part of"
ON friendships
FOR INSERT
WITH CHECK (
  auth.uid() = user_id_1 OR 
  auth.uid() = user_id_2
);

-- Users can delete friendships where they are a participant (unfriend)
CREATE POLICY "Users can delete their own friendships"
ON friendships
FOR DELETE
USING (
  auth.uid() = user_id_1 OR 
  auth.uid() = user_id_2
);

-- ========== BLOCKED_USERS POLICIES ==========

-- Users can view blocks where they are the blocker
CREATE POLICY "Users can view their own blocked users"
ON blocked_users
FOR SELECT
USING (
  auth.uid() = blocker_id
);

-- Users can create blocks where they are the blocker
CREATE POLICY "Users can block other users"
ON blocked_users
FOR INSERT
WITH CHECK (
  auth.uid() = blocker_id
);

-- Users can delete blocks where they are the blocker (unblock)
CREATE POLICY "Users can unblock users"
ON blocked_users
FOR DELETE
USING (
  auth.uid() = blocker_id
);

-- ========== ADDITIONAL CONSTRAINTS ==========

-- Ensure unique pending friend requests (prevent duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_friend_request 
ON friend_requests (from_user_id, to_user_id) 
WHERE status = 'pending';

-- Ensure unique friendships (prevent duplicate friendships)
CREATE UNIQUE INDEX IF NOT EXISTS unique_friendship 
ON friendships (LEAST(user_id_1, user_id_2), GREATEST(user_id_1, user_id_2));

-- Ensure unique blocks (prevent duplicate blocks)
CREATE UNIQUE INDEX IF NOT EXISTS unique_block 
ON blocked_users (blocker_id, blocked_id);

-- Prevent self-friending at database level
ALTER TABLE friend_requests 
ADD CONSTRAINT no_self_friend_request 
CHECK (from_user_id != to_user_id);

-- Prevent self-blocking at database level
ALTER TABLE blocked_users 
ADD CONSTRAINT no_self_block 
CHECK (blocker_id != blocked_id);

-- Prevent self-friendship at database level
ALTER TABLE friendships 
ADD CONSTRAINT no_self_friendship 
CHECK (user_id_1 != user_id_2);

