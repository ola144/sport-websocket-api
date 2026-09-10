import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import app from "./app.js";

const port = 8000;

app.listen(port, () => {
  console.log("Server is running at port: " + port);
});
