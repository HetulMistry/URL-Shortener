import express from "express";
import { PORT } from "./config/env.js";
import authRouter from "./routes/auth.route.js";

const app = express();

app.use("/api/v1/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
