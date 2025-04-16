const express = require("express");
const app = express();
const userModel = require("./models/user")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const path = require("path");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.render('home')
});

app.get("/signup", (req, res) => res.render("signup"));

app.post("/create", (req, res) => {
  let { username, email, password } = req.body;

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let createdUser = await userModel.create({
        username,
        email,
        password: hash,
      });
      let token = jwt.sign({email: createdUser.email}, "shivam");
      res.cookie("token", token);
      res.redirect("/login");
      // res.send(createdUser);
    });
  });
});

app.get("/login", (req, res) => res.render("login"));

app.get("/afterLogin", (req, res) => res.render("afterLogin"));

app.post("/login", async function (req, res) {
  let user = await userModel.findOne({ email: req.body.email });
  if (!user) return res.send("Error");

  bcrypt.compare(req.body.password, user.password, function (err, result) {
    if (result) res.render("moodtracker");
    else res.send("Login failed");
  });
});

app.get("/logout", function (req, res) {
  res.cookie("token", "");
  res.redirect("/");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/profile", (req, res) => {
  res.render("profile");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on address http://localhost:${PORT}`);
});
