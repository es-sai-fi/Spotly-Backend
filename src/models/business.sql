CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  busi_username TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  rating SMALLINT DEFAULT NULL,
  description TEXT DEFAULT NULL,
  address TEXT DEFAULT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
