const mongoose = require("mongoose");
const validator = require("validator");

const model = mongoose.model("User", {
  email: {
    type: String,
    required: true,
    validate: {
      validator(email) {
        return validator.isEmail(email);
      }
    }
  }
});

module.exports = model;
