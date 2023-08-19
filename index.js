import express from "express";
import morgan from "morgan";
import cors from "cors";

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

app.listen(PORT, () => {
    console.log(`App started on port ${PORT}`);
});