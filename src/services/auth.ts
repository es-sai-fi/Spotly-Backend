import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable must be set");
}
const SECRET_KEY = process.env.JWT_SECRET;

export function generateToken(payload: object): string {
  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: "1h",
  });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch {
    throw new Error("Invalid token or expired");
  }
}
