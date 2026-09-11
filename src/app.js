import express from "express";
import { matchRouter } from "./routes/matches.js";

const app = express();

app.use(express.json());

// app.get("/health", (req, res) => {
//   res.send({ mesage: "Hello from Express server!" });
// });

app.use("/matches", matchRouter);

export default app;
