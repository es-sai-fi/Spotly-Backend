import express, { Request, Response } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import userRoutes from "./routes/user";
import businessRoutes from "./routes/business";
import usernameRoutes from "./routes/username";
import reviewsRoutes from "./routes/reviews";
import postsRoutes from "./routes/post";
import commentsRoutes from "./routes/comments";
dotenv.config();

const app = express();
if (!process.env.PORT) {
  process.exit(1);
}

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/users", userRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/username", usernameRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/comments",commentsRoutes);
app.get("/", (_req: Request, res: Response) => {
  res.send("Backend API is running 🚀");
});

export default app;
