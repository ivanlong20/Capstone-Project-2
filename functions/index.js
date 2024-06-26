import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import * as fs from "node:fs";
import methodOverride from "method-override";
const app = express();
const port = 3000;
var postID = parseInt(fs.readFileSync("./id.json", "utf8")) || 0;

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

function Post(id, title, author, content, password) {
  this.id = id;
  this.title = title;
  this.author = author;
  this.content = content;
  this.password = password;
  this.date = new Date();
  this.comments = [];
}

function getPosts() {
  var posts = [];
  fs.readdirSync(__dirname + "/posts").forEach((file) => {
    const postFilePath = __dirname + "/posts/" + file;
    posts.push(JSON.parse(fs.readFileSync(postFilePath, "utf8")));
  });

  return posts;
}

//Get Home Page
app.get("/", (req, res) => {
  res.render("home.ejs", { posts: getPosts() });
});

//Get Create Post Page
app.get("/create-post", (req, res) => {
  res.render("create-post.ejs");
});

//Create Post
app.post("/create-post", (req, res) => {
  const postFilePath = __dirname + "/posts/" + postID + ".json";
  const idPath = __dirname + "/id.json";
  var post = new Post(
    postID,
    req.body.title,
    req.body.author,
    req.body.content,
    req.body.password
  );
  fs.writeFileSync(postFilePath, JSON.stringify(post), "utf8");
  ++postID;
  fs.writeFileSync(idPath, postID.toString(), "utf8");
  res.render("create-post.ejs");
});

//Authentication page for editing post
app.get("/post/edit-access/:id", (req, res) => {
  res.render("access-code-edit.ejs", { id: req.params.id });
});

//Authentication page for deleting post
app.get("/delete-post-access/:id", (req, res) => {
  res.render("access-code-delete.ejs", { id: req.params.id });
});

//Edit Post
app.post("/edit-post/:id", (req, res) => {
  const postFilePath = __dirname + "/posts/" + req.params.id + ".json";
  let post = JSON.parse(fs.readFileSync(postFilePath, "utf8"));
  var updatedPost = {
    id: post.id,
    title: req.body.title || post.title,
    author: req.body.author || post.author,
    content: req.body.content || post.content,
    password: req.body.password || post.password,
    date: new Date(),
    comments: post.comments,
  };
  fs.writeFileSync(postFilePath, JSON.stringify(updatedPost), "utf8");

  res.redirect("/post/" + req.params.id);
});

//View Post by ID
app.get("/post/:id", (req, res) => {
  const postFilePath = __dirname + "/posts/" + req.params.id + ".json";
  let post = JSON.parse(fs.readFileSync(postFilePath, "utf8"));
  console.log(post);
  res.render("post-view.ejs", { post: post });
});

//Edit Post by ID
app.get("/post/edit/:id", (req, res) => {
  const postFilePath = __dirname + "/posts/" + req.params.id + ".json";
  let post = JSON.parse(fs.readFileSync(postFilePath, "utf8"));
  if (req.query.password === post.password) {
    res.render("edit-view.ejs", { post: post });
  } else {
    res.redirect("/post/edit-access/" + req.params.id);
  }
  console.log(post);
});

//About Page
app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.delete("/delete-post/:id", (req, res) => {
  const postFilePath = __dirname + "/posts/" + req.params.id + ".json";
  let post = JSON.parse(fs.readFileSync(postFilePath, "utf8"));
  if (req.body.password === post.password) {
    fs.unlinkSync(postFilePath, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    res.redirect("/");
  } else {
    res.redirect("/delete-post-access/" + req.params.id);
  }
});

//Search Post
app.get("/search", (req, res) => {
  var posts = [];
  fs.readdirSync(__dirname + "/posts").forEach((file) => {
    const postFilePath = __dirname + "/posts/" + file;
    var post = JSON.parse(fs.readFileSync(postFilePath, "utf8"));
    var search = req.query.search;
    console.log(post.title);
    if (
      post.title.includes(search) ||
      post.author.includes(search) ||
      post.content.includes(search)
    ) {
      posts.push(post);
    }
  });
  res.render("home.ejs", { posts: posts });
});

app.post("/post/:id/comment", (req, res) => {
  const postFilePath = __dirname + "/posts/" + req.params.id + ".json";
  let post = JSON.parse(fs.readFileSync(postFilePath, "utf8"));
  post.comments.push({
    comment: req.body.comment,
    timestamp: new Date(),
  });
  console.log(req.body.comment);
  fs.writeFileSync(postFilePath, JSON.stringify(post), "utf8");
  res.redirect("/post/" + req.params.id);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
