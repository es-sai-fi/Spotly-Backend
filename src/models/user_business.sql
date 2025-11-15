-- Many-to-many table to record users' favorite businesses
CREATE TABLE user_business (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, business_id)
);
