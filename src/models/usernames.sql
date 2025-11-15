-- Table to store usernames separately for flexibility
CREATE TABLE usernames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for faster username lookups
CREATE INDEX idx_usernames_username ON usernames(username);
