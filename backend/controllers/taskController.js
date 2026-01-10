const Task = require("../models/Task");

// Create task
exports.createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!title) return res.status(400).json({ message: "Title is required" });

    const task = await Task.create({
      title,
      description,
      status,
      userId: req.user.id,
    });

    return res.status(201).json({ message: "Task created", task });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get tasks + search + filter
exports.getTasks = async (req, res) => {
  try {
    const { search = "", status } = req.query;

    const query = {
      userId: req.user.id,
      ...(status ? { status } : {}),
      ...(search
        ? { title: { $regex: search, $options: "i" } }
        : {}),
    };

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    return res.status(200).json(tasks);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, userId: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const updated = await Task.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(200).json({ message: "Task updated", task: updated });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, userId: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    await Task.deleteOne({ _id: id });
    return res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
