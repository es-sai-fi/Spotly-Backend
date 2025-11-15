-- One-to-many table for user reviews made on businesses
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_id UUID NOT NULL,
  content TEXT NOT NULL,
  rating SMALLINT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
