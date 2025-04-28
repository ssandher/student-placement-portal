import express from "express";
import db from "./databaseConnect.js";
import routes from "./routes/index.js";
import authmiddleware from "./middleware/auth.js";
import AdminController from "./controller/adminController.js";
import cors from "cors";
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", AdminController.signup);
app.post("/login", AdminController.login);
app.use("/api", authmiddleware, routes);
app.use("/", routes); // Added this line to include the forgot password routes without authentication
app.listen(port, () =>  {
  console.log("Server listening on port " + port);
});