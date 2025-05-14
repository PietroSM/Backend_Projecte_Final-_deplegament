const mongoose = require("mongoose");

let missatgeSchema = new mongoose.Schema(
  {
    conversa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversas",
      required: true,
    },
    emisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clients",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: Date,
      default: Date.now
    }
  },
);

let Missatge = mongoose.model("missatges", missatgeSchema);
module.exports = Missatge;