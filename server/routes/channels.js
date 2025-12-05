const express = require("express");
const router = express.Router();
const Channel = require("../models/Channel");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const channels = await Channel.find().sort({ createdAt: -1 }).lean();
    const out = channels.map((c) => ({
      ...c,
      memberCount: c.members ? c.members.length : 0,
    }));
    res.json({ channels: out });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { name, isPrivate } = req.body;
    if (!name) return res.status(400).json({ message: "Name required" });

    const channel = new Channel({
      name,
      isPrivate: !!isPrivate,
      members: [req.user._id],
    });
    await channel.save();
    res.json({ channel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const ch = await Channel.findById(req.params.id)
      .populate("members", "name email")
      .lean();
    if (!ch) return res.status(404).json({ message: "Channel not found" });
    ch.memberCount = ch.members.length;
    res.json({ channel: ch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/join", auth, async (req, res) => {
  try {
    const ch = await Channel.findById(req.params.id);
    if (!ch) return res.status(404).json({ message: "Channel not found" });

    if (!ch.members.some((m) => m.equals(req.user._id))) {
      ch.members.push(req.user._id);
      await ch.save();
    }

    res.json({ ok: true, channel: ch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/leave", auth, async (req, res) => {
  try {
    const ch = await Channel.findById(req.params.id);
    if (!ch) return res.status(404).json({ message: "Channel not found" });

    ch.members = ch.members.filter((m) => !m.equals(req.user._id));
    await ch.save();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
