import express from "express";
import morgan from "morgan";
import cors from "cors";
import { marked } from "marked";

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

app.get("/blog/:category/:uid", (req, res) => res.sendFile("private/post.html", { root: "." }));
app.get("/blog/:category?", (req, res) => res.sendFile("private/blog.html", { root: "." }));
app.get("/projects/:topic?", (req, res) => res.sendFile("private/projects.html", { root: "." }));
app.get("/project", (req,res) => res.redirect("/projects/"))
app.get("/project/:name", (req, res) => res.sendFile("private/project.html", { root: "." }));

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