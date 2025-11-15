import express, { Request, Response } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import userRoutes from "./routes/user";
import businessRoutes from "./routes/business";
import usernameRoutes from "./routes/username";
import postsRoutes from "./routes/posts";
import commentsRoutes from "./routes/comments";
import likesRoutes from "./routes/likes";
import profileRoutes from "./routes/profile";

dotenv.config();

if (!process.env.PORT) {
  console.error("Error: PORT environment variable is not set. Please set PORT in your environment or .env file.");
  process.exit(1);
}

const app = express();
app.use(helmet());

// Enable CORS to allow frontend (default: localhost:5173) to call the API
const frontendOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({ 
  origin: frontendOrigin,
  credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/users", userRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/username", usernameRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/likes", likesRoutes);
app.use("/api/profile", profileRoutes);
app.get("/", (_req: Request, res: Response) => {
  res.send("Backend API is running 🚀");
});

export default app;
