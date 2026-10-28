const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },
  },
  { timestamps: true }
);

favouriteSchema.index(
  { customer: 1, provider: 1 },
  { unique: true }
);

module.exports = mongoose.model("Favourite", favouriteSchema);