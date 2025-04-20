import bodyParser from "body-parser";
import { v2 as cloudinary } from "cloudinary";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import session from "express-session";
import http from "http";
import mongoose from "mongoose";
import passport from "passport";
import path from "path";
import { isAuthenticated } from "./middleware/auth";
import errorMiddleware from "./middleware/error";
import runSocket from "./utils/socket";

const app = express();
dotenv.config();

app.use(bodyParser.json({ limit: "5gb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
// const __dirname = path.dirname(__filename); // get the name of the directory
// app.use(express.static(path.join(__dirname, "public")));

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const allowedOrigins = [
  /frontend.*\.vercel\.app$/, // Matches URLs of the specified pattern
  /localhost:\d+$/, // Matches localhost with any port number
  /https:\/\/freelanceme-backend\.onrender\.com/,
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Check if the origin matches any of the allowed origins
      if (!origin || allowedOrigins.some((pattern) => pattern.test(origin))) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error("Not allowed by CORS")); // Deny the request
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(cookieParser());
app.use(passport.initialize());

app.use(
  session({
    secret: process.env.SECRET!,
    resave: false,
    saveUninitialized: true,
    cookie: {
      // secure: true
    },
  })
);

// Handling Uncaught Exception Error
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to Uncaught Exception Error");
  process.exit(1);
});

// Route Imports
import gigRoutes from "./routes/gig";
import orderRoutes from "./routes/order";
import userRoutes from "./routes/user";
import messageRoutes from "./routes/message";

app.use("/", userRoutes);
app.use("/", gigRoutes);
app.use("/", orderRoutes);
app.use("/", messageRoutes);

app.get("/ping", (req, res) => {
  return res.status(200).send("pong");
})

// Middleware for Errors
app.use(errorMiddleware);

export const frontendHomeUrl =
  process.env.MODE === "DEV"
    ? process.env.FRONTEND_URL_DEV
    : process.env.FRONTEND_URL_PROD;

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECERET,
});

// Database Connection
export let server = http.createServer(app);
const PORT = process.env.PORT || 4000;
const CONNECTION_URL = process.env.CONNECTION_URL;

if (!CONNECTION_URL) {
  throw new Error("The CONNECTION_URL environment variable is not defined.");
}

mongoose
  .connect(CONNECTION_URL)
  .then(() =>
    server.listen(PORT, () => {
      console.log("server is running on port " + PORT);
      return server;
    })
  )
  .catch((err) => {
    console.log(err);
  });

// Calling socket to run
runSocket(server);

// Handling Unhandled Rejection Error
process.on("unhandledRejection", (err: Error) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to Unhandled Promise Rejection");

  server.close(() => {
    process.exit(1);
  });
});

app.get(
  '/',
  isAuthenticated,
  (req: Request, res: Response) => {
    res.send('Hello World');
  }
);
