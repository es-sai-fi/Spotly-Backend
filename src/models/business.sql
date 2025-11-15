CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username_id UUID REFERENCES usernames(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  rating SMALLINT DEFAULT NULL,
  description TEXT DEFAULT NULL,
  address TEXT DEFAULT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX idx_businesses_username_id ON businesses(username_id);
CREATE INDEX idx_businesses_email ON businesses(email);
