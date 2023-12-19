import express from "express";
import morgan from "morgan";
import cors from "cors";
import { marked } from "marked";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("common"));

// STATIC PAGES
app.use(express.static("assets"));
app.use(express.static("css"));
app.use("/modules", express.static("modules"));
app.use(express.static("pages", { extensions: ["html", "htm"] }));

app.get("/blog/:category/:uid", (req, res) => res.sendFile("custom/post.html", { root: "." }));
app.get("/blog/:category?", (req, res) => res.sendFile("custom/blog.html", { root: "." }));
app.get("/projects/:topic?", (req, res) => res.sendFile("custom/projects.html", { root: "." }));
app.get("/project", (req, res) => res.redirect("/projects/"))
app.get("/project/:name", (req, res) => res.sendFile("custom/project.html", { root: "." }));

app.get("/admin", (req, res) => {
  const agent = req.get("user-agent");
  if (agent == process.env.USER_AGENT) {
    res.sendFile("custom/admin.html", { root: "." });
    return;
  }

  res.sendFile("pages/404.html", { root: "." })
});

app.post("/util/markdown", (req, res) => {
  const array = [];

  if (!req.body || !Array.isArray(req.body)) {
    res.json({"error": "Expected array instead of " + req.body});
    return;
  }

  req.body.forEach(input => array.push(marked.parse(input)));
  res.json(array);
});

app.listen(PORT, () => {
  console.log(`App started on port ${PORT}`);
});