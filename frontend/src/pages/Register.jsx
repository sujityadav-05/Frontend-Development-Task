import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const toast = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await api.post("/auth/register", form);

      toast("success", "Account created ✅ Now login");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      toast("error", err?.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Heading */}
        <div className="text-center mb-6">
         
          <h1 className="text-3xl font-extrabold mt-3">Create account</h1>
          <p className="text-slate-500 text-sm mt-1">
            Register to start using the dashboard
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 p-6">
          {msg.text && (
            <div
              className={`mb-4 rounded-2xl px-4 py-3 border font-semibold text-sm ${
                msg.type === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700">Full name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your Name"
                className="mt-1 w-full border p-3 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="mt-1 w-full border p-3 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="mt-1 w-full border p-3 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <button
              disabled={loading}
              className="w-full p-3 rounded-2xl font-extrabold text-white shadow-lg transition active:scale-[0.99]
              bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Register"}
            </button>
          </form>

          <p className="text-sm text-center mt-5 text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-extrabold text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </div>

        
      </div>
    </div>
  );
}
