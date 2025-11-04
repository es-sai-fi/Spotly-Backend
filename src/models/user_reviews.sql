-- Many-to-many table to make sure that users only make one review per business
CREATE TABLE user_reviews(
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,

  PRIMARY KEY(user_id,review_id)
);
