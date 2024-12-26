const express = require("express");
const path = require("node:path");
const expressSession = require("express-session");
const passport = require("./config/passport");
const flash = require("connect-flash");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client/extension");
require("dotenv").config();

// App init
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(flash());

app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    secret: process.env.SECRET_SESSION,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);

app.use(passport.session());
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.flashMessages = req.flash();
  next();
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send(err);
});

const PORT = process.env.port || 3000;
app.listen(PORT, () => console.log(`App listening at port ${PORT}!`));
