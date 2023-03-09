const mongoose = require("mongoose");

const saltSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  salt: { type: String, required: true },
  position: { type: Number, required: true },
});

const Salt = mongoose.model("Salt", saltSchema);

module.exports = Salt;
