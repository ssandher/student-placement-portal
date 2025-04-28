// routes/emailRoute.js
import { Router } from "express";
import EmailController from "../controller/emailController.js";

const emailRoute = new Router();

emailRoute.post("/send-email", EmailController.sendMail); // Correct route path: "/send-email"

export default emailRoute;