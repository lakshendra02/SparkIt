const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Message = require("../models/Message");
const Channel = require("../models/Channel");

router.post("/", auth, async (req, res) => {
  try {
    const { channel, text } = req.body;
    if (!channel || !text)
      return res.status(400).json({ message: "Missing channel or text" });

    // optionally check membership
    const ch = await Channel.findById(channel);
    if (!ch) return res.status(404).json({ message: "Channel not found" });

    const msg = new Message({ sender: req.user._id, channel, text });
    await msg.save();
    await msg.populate("sender", "name email");

    res.json({ message: msg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const { channel, before, limit = 30 } = req.query;
    if (!channel) return res.status(400).json({ message: "channel required" });

    const q = { channel };

    if (before) {
      const date = new Date(before);
      if (!isNaN(date)) {
        q.createdAt = { $lt: date };
      }
    }

    const msgs = await Message.find(q)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate("sender", "name email")
      .lean();

    res.json({ messages: msgs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "text required" });

    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    if (String(msg.sender) !== String(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    msg.text = text;
    await msg.save();
    await msg.populate("sender", "name email");

    res.json({ message: msg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    if (String(msg.sender) !== String(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Message.deleteOne({ _id: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
