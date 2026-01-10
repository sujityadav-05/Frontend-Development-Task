import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // profile form
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");

  // task form
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "pending",
  });
  const [editId, setEditId] = useState(null);

  // search/filter
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // ✅ for debounce
  const [statusFilter, setStatusFilter] = useState("");

  const toast = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 2500);
  };

  // ✅ Debounce logic (Premium UX)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // ---------- API ----------
  const fetchProfile = async () => {
    const res = await api.get("/profile");
    setProfile(res.data);
    setBio(res.data.bio || "");
    setSkills((res.data.skills || []).join(", "));
  };

  const fetchTasks = async () => {
    const params = {};
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (statusFilter) params.status = statusFilter;

    const res = await api.get("/tasks", { params });
    setTasks(res.data);
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchTasks()]);
    } catch (err) {
      console.log(err);
      toast("error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ✅ Search + filter triggers API (with debounce)
  useEffect(() => {
    fetchTasks();
  }, [debouncedSearch, statusFilter]);

  // ---------- stats ----------
  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    return { total, pending, completed };
  }, [tasks]);

  // ---------- handlers ----------
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await api.put("/profile", { bio, skills: skillsArray });
      toast("success", "Profile updated successfully ✅");
      await fetchProfile();
    } catch (err) {
      toast("error", err?.response?.data?.message || "Profile update failed");
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!taskForm.title.trim()) return toast("error", "Task title is required");

      if (editId) {
        await api.put(`/tasks/${editId}`, taskForm);
        toast("success", "Task updated ✅");
      } else {
        await api.post("/tasks", taskForm);
        toast("success", "Task created ✅");
      }

      setTaskForm({ title: "", description: "", status: "pending" });
      setEditId(null);

      await fetchTasks();
    } catch (err) {
      toast("error", err?.response?.data?.message || "Task action failed");
    }
  };

  const handleEdit = (task) => {
    setEditId(task._id);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      status: task.status || "pending",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      toast("success", "Task deleted ✅");
      await fetchTasks();
    } catch (err) {
      toast("error", err?.response?.data?.message || "Delete failed");
    }
  };

  const toggleStatus = async (task) => {
    try {
      const newStatus = task.status === "completed" ? "pending" : "completed";
      await api.put(`/tasks/${task._id}`, { ...task, status: newStatus });
      await fetchTasks();
    } catch (err) {
      toast("error", "Failed to update status");
    }
  };

  // ---------- UI ----------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white border rounded-3xl px-6 py-4 shadow-lg font-bold">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar title="Dashboard" />

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Toast */}
        {msg.text && (
          <div
            className={`rounded-3xl px-4 py-3 border font-bold shadow-sm ${
              msg.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Stats */}
        <section className="grid md:grid-cols-3 gap-4">
          <StatCard
            title="Total Tasks"
            value={stats.total}
            color="from-indigo-600 to-blue-600"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            color="from-orange-500 to-amber-500"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            color="from-emerald-600 to-teal-500"
          />
        </section>

        {/* Profile */}
        <section className="bg-white/90 backdrop-blur border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="text-xl font-extrabold">Profile</h2>
              <p className="text-sm text-slate-500">
                Update your information 
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-5">
            <InfoBox label="Name" value={profile?.name || "-"} />
            <InfoBox label="Email" value={profile?.email || "-"} />
          </div>

          <form
            onSubmit={handleProfileUpdate}
            className="grid md:grid-cols-2 gap-4"
          >
            <div>
              <label className="text-sm font-extrabold text-slate-700">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 w-full border p-3 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Example: Full Stack Developer"
              />
            </div>

            <div>
              <label className="text-sm font-extrabold text-slate-700">
                Skills (comma separated)
              </label>
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="mt-1 w-full border p-3 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="React, Node.js, MongoDB"
              />
            </div>

            <button
              className="md:col-span-2 p-3 rounded-2xl font-extrabold text-white shadow-lg transition active:scale-[0.99]
              bg-gradient-to-r from-slate-900 to-slate-700 hover:opacity-95"
            >
              Save Profile
            </button>
          </form>
        </section>

        {/* Tasks */}
        <section className="bg-white/90 backdrop-blur border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-xl font-extrabold">Tasks</h2>
              
            </div>
          </div>

          {/* ✅ Premium Search + Filter */}
          <div className="grid md:grid-cols-3 gap-3 mb-4">
            {/* search with icon + clear */}
            <div className="md:col-span-2 border rounded-2xl bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 px-4 py-3 flex items-center gap-3">
              <span className="text-slate-500 text-lg">🔍</span>

              <input
                className="w-full bg-transparent outline-none font-semibold text-sm placeholder:text-slate-400"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-xs font-extrabold px-3 py-1 rounded-xl bg-slate-200 hover:bg-slate-300"
                >
                  Clear
                </button>
              )}
            </div>

            {/* filter dropdown */}
            <select
              className="border p-3 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* ✅ results counter */}
          <p className="text-xs text-slate-500 font-bold mb-5">
            Showing <span className="text-slate-900">{tasks.length}</span> tasks
            {debouncedSearch ? (
              <>
                {" "}
                for <span className="text-blue-600">"{debouncedSearch}"</span>
              </>
            ) : null}
          </p>

          {/* Task Form */}
          <form
            onSubmit={handleTaskSubmit}
            className="grid md:grid-cols-4 gap-3 mb-6"
          >
            <input
              className="border p-3 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-1"
              placeholder="Task title"
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm({ ...taskForm, title: e.target.value })
              }
            />

            <input
              className="border p-3 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
              placeholder="Description"
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm({ ...taskForm, description: e.target.value })
              }
            />

            <select
              className="border p-3 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={taskForm.status}
              onChange={(e) =>
                setTaskForm({ ...taskForm, status: e.target.value })
              }
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            <button
              className="md:col-span-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-3 rounded-2xl font-extrabold shadow-lg hover:opacity-95 active:scale-[0.99] transition"
            >
              {editId ? "Update Task" : "Create Task"}
            </button>

            {editId && (
              <button
                type="button"
                className="md:col-span-4 bg-slate-100 border p-3 rounded-2xl font-extrabold"
                onClick={() => {
                  setEditId(null);
                  setTaskForm({
                    title: "",
                    description: "",
                    status: "pending",
                  });
                }}
              >
                Cancel Editing
              </button>
            )}
          </form>

          {/* List */}
          <div className="grid gap-4">
            {tasks.length === 0 ? (
              <div className="text-center py-12 border rounded-3xl bg-slate-50">
                <p className="font-extrabold text-lg">No tasks found</p>
                <p className="text-sm text-slate-500 mt-1">
                  Create a new task above or change filters.
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={toggleStatus}
                />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

// ---------- small reusable components ----------
function StatCard({ title, value, color }) {
  return (
    <div className="bg-white/90 backdrop-blur border border-slate-200/60 rounded-3xl p-5 shadow-xl shadow-slate-200/40">
      <p className="text-xs text-slate-500 font-extrabold uppercase">{title}</p>
      <p className="text-3xl font-black mt-2">{value}</p>
      <div className={`h-2 w-20 rounded-full mt-4 bg-gradient-to-r ${color}`} />
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-3xl border bg-slate-50 p-4">
      <p className="text-slate-500 text-xs font-bold uppercase">{label}</p>
      <p className="font-extrabold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
