const User = require("../models/User");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, skills } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(skills !== undefined && { skills }), // expects array
      },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updated,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
