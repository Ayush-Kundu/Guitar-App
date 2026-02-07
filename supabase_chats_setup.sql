-- =====================================================
-- SUPABASE CHATS & MESSAGES TABLES SETUP
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'private' CHECK (type IN ('private', 'group')),
  name TEXT,
  participant_1 UUID NOT NULL,
  participant_2 UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_username TEXT,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chats_participant_1 ON chats(participant_1);
CREATE INDEX IF NOT EXISTS idx_chats_participant_2 ON chats(participant_2);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chats table
-- Allow users to see chats they're part of
CREATE POLICY "Users can view their own chats" ON chats
  FOR SELECT USING (
    auth.uid()::text = participant_1::text 
    OR auth.uid()::text = participant_2::text
  );

-- Allow users to insert chats they're part of
CREATE POLICY "Users can create chats" ON chats
  FOR INSERT WITH CHECK (
    auth.uid()::text = participant_1::text 
    OR auth.uid()::text = participant_2::text
  );

-- Allow users to update their own chats
CREATE POLICY "Users can update their own chats" ON chats
  FOR UPDATE USING (
    auth.uid()::text = participant_1::text 
    OR auth.uid()::text = participant_2::text
  );

-- RLS Policies for messages table
-- Allow users to see messages in chats they're part of
CREATE POLICY "Users can view messages in their chats" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = messages.chat_id 
      AND (auth.uid()::text = chats.participant_1::text OR auth.uid()::text = chats.participant_2::text)
    )
  );

-- Allow users to insert messages in chats they're part of
CREATE POLICY "Users can send messages in their chats" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = messages.chat_id 
      AND (auth.uid()::text = chats.participant_1::text OR auth.uid()::text = chats.participant_2::text)
    )
  );

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE chats;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- =====================================================
-- ALTERNATIVE: If you prefer simpler RLS (for development)
-- Uncomment these and comment out the policies above
-- =====================================================
-- DROP POLICY IF EXISTS "Users can view their own chats" ON chats;
-- DROP POLICY IF EXISTS "Users can create chats" ON chats;
-- DROP POLICY IF EXISTS "Users can update their own chats" ON chats;
-- DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
-- DROP POLICY IF EXISTS "Users can send messages in their chats" ON messages;
-- 
-- CREATE POLICY "Allow all for chats" ON chats FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all for messages" ON messages FOR ALL USING (true) WITH CHECK (true);

