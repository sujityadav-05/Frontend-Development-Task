import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar({ title = "Dashboard" }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="w-full bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">{title}</h1>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {user?.name ? (
              <>
                Hi, <span className="font-semibold">{user.name}</span>
              </>
            ) : (
              "Logged In"
            )}
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-black text-white text-sm font-semibold hover:opacity-90"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
