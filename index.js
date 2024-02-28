import express from "express";
const app = express();
const port = 3000;
// var posts = [];

function Post(title, author, content, password) {
  this.title = title;
  this.author = author;
  this.content = content;
  this.password = password;
  this.date = new Date();
}

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  console.log(posts);

  res.render("home.ejs", { posts: posts });
});

app.get("/create-post", (req, res) => {
  res.render("create-post.ejs");
});

app.post("/create-post", (req, res) => {
  //   res.render("posts.ejs");
  posts.push(
    new Post(
      req.body.title,
      req.body.author,
      req.body.content,
      req.body.password
    )
  );

  console.log(posts);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
