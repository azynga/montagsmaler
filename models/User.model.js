const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  avatarUrl: String,
  drawings: [{
    type: Schema.Types.ObjectId,
    ref: 'Drawing'
  }],
},
{
  timestamps: true,
});

const User = model("User", userSchema);

module.exports = User;
