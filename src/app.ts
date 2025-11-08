import express, { Request, Response } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import userRoutes from "./routes/user";
import businessRoutes from "./routes/business";
import usernameRoutes from "./routes/username";

dotenv.config();

if (!process.env.PORT) {
  console.error("Error: PORT environment variable is not set. Please set PORT in your environment or .env file.");
  process.exit(1);
}

const app = express();
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/users", userRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/username", usernameRoutes);
app.get("/", (_req: Request, res: Response) => {
  res.send("Backend API is running 🚀");
});

export default app;
