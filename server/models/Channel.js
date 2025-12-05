const mongoose = require("mongoose");

const ChannelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    isPrivate: { type: Boolean, default: false },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

ChannelSchema.virtual("memberCount").get(function () {
  return this.members ? this.members.length : 0;
});

ChannelSchema.set("toJSON", { virtuals: true });
ChannelSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Channel", ChannelSchema);
