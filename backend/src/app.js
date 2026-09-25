import cors from "cors";
import express from "express";
import { connectDatabase, initializeDatabase } from "./db.js";
import noteRoutes from "./routes/noteRoutes.js";

const app = express();
const port = Number.parseInt(process.env.PORT ?? "5000", 10);

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

app.get("/", (_request, response) => {
  response.json({ message: "Note app API is running" });
});

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/notes", noteRoutes);

app.use((error, _request, response, _next) => {
  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    error: statusCode >= 500 ? "Internal server error" : error.message
  });
});

const startServer = async () => {
  await connectDatabase();
  await initializeDatabase();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start the application", error);
  process.exitCode = 1;
});

export { app };
