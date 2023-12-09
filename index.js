import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import cors from "cors";
import UserRoutes from "./users/routes.js";
import "dotenv/config";
import commonRoutes from "./comments/commonRoutes.js";

mongoose.connect("mongodb://127.0.0.1:27017/project");

const app = express();

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
const sessionOptions = {
  secret: "any string",
  resave: false,
  saveUninitialized: false,
};
app.use(session(sessionOptions));
app.use(express.json());

UserRoutes(app);
app.use(commonRoutes);
// app.use("/api/users", UserRoutes);

app.listen(process.env.PORT || 4000);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
