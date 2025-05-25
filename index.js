import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// need this for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// basic middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// main route
app.get("/", (req, res) => {
  res.render("index", {
    title: "Media Review Tracker",
    message: "Welcome to your personal media review tracker!",
  });
});

// simple health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running!",
  });
});

// catch 404s
app.use((req, res) => {
  res.status(404).render("404", { title: "Page Not Found" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
