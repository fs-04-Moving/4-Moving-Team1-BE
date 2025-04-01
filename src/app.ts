import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import router from "./routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();
const port = 5050;

app.use(express.json());
app.use(cors());
app.use(router);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
