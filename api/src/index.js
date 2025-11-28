import dotenv from 'dotenv';
dotenv.config();
import http from "http";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";

import sequelize, { connectDB } from "./db/database.js";
import { User, File, Post } from "./db/models/index.js";
import AppRouter from "./router";
import nodemailer from "nodemailer";
import { smtp, s3Config, s3Region, s3Bucket } from "./config";

import AWS from "aws-sdk";
import multerS3 from "multer-s3";

AWS.config.update(s3Config);
AWS.config.region = s3Region;

const s3 = new AWS.S3();

let email = nodemailer.createTransport(smtp);

const storageDir = path.join(__dirname, "..", "storage");

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storageConfig });

const PORT = 3001;
const app = express();
app.server = http.createServer(app);

app.use(morgan("dev"));

app.use(
  cors({
    exposedHeaders: "*",
  })
);

app.use(
  bodyParser.json({
    limit: "50mb",
  })
);

app.set("root", __dirname);
app.set("storageDir", storageDir);
app.upload = upload;
app.email = email;
app.s3 = s3;

// Connect to PostgreSQL and sync models
connectDB()
  .then(async (db) => {
    console.log("PostgreSQL database connected successfully");

    // Sync models (create tables if they don't exist)
    // In production, use migrations instead
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log("Database models synchronized");

    app.db = sequelize;
    app.set("db", sequelize);

    new AppRouter(app);

    app.server.listen(process.env.PORT || PORT, () => {
      console.log(`App is running on port ${app.server.address().port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });

export default app;
