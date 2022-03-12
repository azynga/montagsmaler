const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    avatarUrl: String,
    highlights: [{
      type: String,
      url: String,
      word: String, // this should be the word the drawing relates to
    }],
  },
  {
    timestamps: true,
  }
);

const highlightSchema = new Schema({

})

const User = model("User", userSchema);

module.exports = User;
