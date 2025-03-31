import express from "express";
import cors from "cors";
import "dotenv/config";
import db from "./config/db.js";
import helmet from "helmet";
import compression from "compression";
import routes from "./routes/index.js";
import http from "http";
process.env.TZ = "Etc/UTC";
import userroutes from "./routes/user.js"

if (!process.env.PORT) {
  throw new Error("PORT environment variable is not defined");
}

const app = express();

app.use(cors({
  origin: "*",
  allowedHeaders: ["Authorization", "Content-Type"],
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
// app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const server = http.createServer(app);

app.use(
  compression({
    level: 6,
    threshold: 100 * 1000,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  })
);
// API Routes
app.use("/api/user",userroutes)
app.use('/api', routes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to backend",
    status: true
  });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await db.connection.asPromise();
    console.log("Connected to the database successfully");

    // Create super admin if it doesn't exist
    const User = db.model('User');
    const superAdmin = await User.findOne({ role: 'super_admin' });
    if (!superAdmin) {
      await User.create({
        email: process.env.SUPER_ADMIN_EMAIL ?? 'admin@example.com',
        password: process.env.SUPER_ADMIN_PASSWORD ??'changeme123',
        role: 'super_admin',
        name: 'Super Admin',
        emailVerified: true
      });
      console.log('Super admin account created');
    }

    server.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};

start();

const graceful = () => {
  db.connection.close();
  console.log("Database connection closed");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", graceful);
process.on("SIGINT", graceful);