const mongoose = require("mongoose");

let conversaSchema = new mongoose.Schema(
  {
    membres: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "clients",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

let Conversa = mongoose.model("conversas", conversaSchema);
module.exports = Conversa;
