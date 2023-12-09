import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import cors from "cors";
import UserRoutes from "./users/routes.js";
import "dotenv/config";
import commonRoutes from "./comments/commonRoutes.js";

// mongoose.connect("mongodb://127.0.0.1:27017/project");
const CONNECTION_STRING1 =
  process.env.DB_CONNECTION_STRING1 || "mongodb://127.0.0.1:27017/project";
// mongoose.connect(CONNECTION_STRING);
console.log(CONNECTION_STRING1);
mongoose
  .connect(CONNECTION_STRING1, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(CONNECTION_STRING1))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  })
);
const sessionOptions = {
  secret: "any string",
  resave: false,
  saveUninitialized: false,
};
if (process.env.NODE_ENV !== "development") {
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
  };
}

app.use(session(sessionOptions));
app.use(express.json());

UserRoutes(app);
app.use(commonRoutes);
// app.use("/api/users", UserRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to my application!");
});

app.listen(process.env.PORT || 4000);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
