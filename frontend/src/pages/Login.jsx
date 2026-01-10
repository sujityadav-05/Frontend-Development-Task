import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
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
      const res = await api.post("/auth/login", form);

      login(res.data.token, res.data.user);
      toast("success", "Login successful ✅");
      navigate("/dashboard");
    } catch (err) {
      toast("error", err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Top Heading */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-xl shadow-lg">
            A
          </div>
          <h1 className="text-3xl font-extrabold mt-3">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">
            Login to access your dashboard
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
              <label className="text-sm font-bold text-slate-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="mt-1 w-full border p-3 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="mt-1 w-full border p-3 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              disabled={loading}
              className="w-full p-3 rounded-2xl font-extrabold text-white shadow-lg transition active:scale-[0.99]
              bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-sm text-center mt-5 text-slate-600">
            New user?{" "}
            <Link to="/register" className="font-extrabold text-blue-600 hover:underline">
              Create account
            </Link>
          </p>
        </div>

        
      </div>
    </div>
  );
}
