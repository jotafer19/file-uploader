const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const dbUser = require("../db/userQuery");

exports.signUpGet = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }

  res.render("sign-up");
};

const validateUser = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ max: 50 })
    .withMessage("Username must be less than 50 characters long"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("You should enter a valid email")
    .custom(async (value) => {
      const isUsed = await dbUser.getUserByEmail(value);

      if (isUsed) {
        throw new Error("Email is already in use");
      }

      return true;
    }),
  body("password")
    .trim()
    .isLength({ min: 4, max: 16 })
    .withMessage("Password must be between 4 and 16 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password should contain at least an uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password should contain at least a lowercase letter")
    .matches(/\d/)
    .withMessage("Password should contain at least a digit"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }

    return true;
  }),
];

exports.signUpPost = [
  validateUser,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("sign-up", {
        oldInput: req.body,
        errors: errors.array(),
      });
    }

    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        return next(err);
      }

      const { username, email } = req.body;

      try {
        const user = await dbUser.createUser(username, email, hashedPassword);

        res.redirect("/");
      } catch (dbErr) {
        next(dbErr);
      }
    });
  },
];
