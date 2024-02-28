import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import * as fs from "node:fs";
const app = express();
const port = 3000;
var postID = 0;

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

function Post(title, author, content, password) {
  this.title = title;
  this.author = author;
  this.content = content;
  this.password = password;
  this.date = new Date();
}

function createPost(title, author, content, password) {
  console.log(postID);
  const postFilePath = __dirname + "/posts/" + postID + ".json";
  var post = new Post(title, author, content, password);
  fs.writeFileSync(postFilePath, JSON.stringify(post), "utf8");

  console.log(postFilePath);
}

function getPosts() {
  var posts = [];
  for (let i = 0; i < postID; i++) {
    const postFilePath = __dirname + "/posts/" + i + ".json";
    posts.push(JSON.parse(fs.readFileSync(postFilePath, "utf8")));
  }
  return posts;
}

function editPost(id, title, author, content, password) {
  const postFilePath = __dirname + "/posts/" + id + ".json";
  var post = new Post(title, author, content, password);
  fs.writeFileSync(postFilePath, JSON.stringify(post), "utf8");
}

app.get("/", (req, res) => {
  res.render("home.ejs", { posts: getPosts() });
});

app.get("/create-post", (req, res) => {
  res.render("create-post.ejs");
});

app.post("/create-post", (req, res) => {
  createPost(
    req.body.title,
    req.body.author,
    req.body.content,
    req.body.password
  );
  postID++;
  res.render("create-post.ejs");
});

app.get("/edit-post/:id", (req, res) => {
  const postFilePath = __dirname + "/posts/" + req.params.id + ".json";
  const post = JSON.parse(fs.readFileSync(postFilePath, "utf8"));
  res.render("edit-post.ejs", { post: post });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
