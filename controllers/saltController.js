const Salt = require("../Models/saltModel");
const asyncHandler = require("express-async-handler");

const updateOrCreateSalt = asyncHandler(async (req, res) => {
  const { _id, salt, position } = req.body;

  try {
    let s = await Salt.findById(_id);
    if (!s) {
      s = new Salt({
        _id,
        salt,
        position,
      });
    } else {
      // If user exists, update its name and email fields
      s.salt = salt;
      s.position = position;
    }
    // Save the user document in the database
    const result = await s.save();
    res.sendStatus(200);
  } catch (err) {
    console.error("Error updating or creating salt", err);
    res.send(err);
  }
});

const getSalt = asyncHandler(async (req, res) => {
  const saltId = req.params.id;

  try {
    const salt = await Salt.findById(saltId);
    if (salt) {
      res.json(salt);
    } else {
      res.status(404);
      throw new Error("Salt not found");
    }
  } catch (error) {
    console.error("Error getting salt", error);
    throw error;
  }
});

module.exports = {
  updateOrCreateSalt,
  getSalt,
};
