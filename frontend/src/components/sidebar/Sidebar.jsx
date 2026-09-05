import { Link, useLocation } from "react-router-dom";
import {
  FaLeaf,
  FaHome,
  FaChartLine,
  FaCloudSun,
  FaSeedling,
  FaUserCircle,
  FaUsers,
  FaPlusCircle,
  FaSignOutAlt
} from "react-icons/fa";

import "./Sidebar.css";

export default function Sidebar() {

  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const role = localStorage.getItem("role") || "farmer";

  return (
    <aside className="sidebar">

      <div className="sidebar-logo">

        <FaLeaf className="logo-icon" />

        <div>
          <h2>YieldSense</h2>
          <span>AI Agriculture</span>
        </div>

      </div>

      <nav className="sidebar-menu">

        <Link
          to="/dashboard"
          className={location.pathname==="/dashboard"?"active":""}
        >
          <FaHome />
          Dashboard
        </Link>

        <Link
          to="/prediction"
          className={location.pathname==="/prediction"?"active":""}
        >
          <FaChartLine />
          Prediction
        </Link>

        <Link
          to="/weather"
          className={location.pathname==="/weather"?"active":""}
        >
          <FaCloudSun />
          Weather
        </Link>

        <Link
          to="/soil"
          className={location.pathname==="/soil"?"active":""}
        >
          <FaSeedling />
          Soil
        </Link>

        {role==="admin" && (
          <>
            <Link
              to="/users"
              className={location.pathname==="/users"?"active":""}
            >
              <FaUsers />
              Users
            </Link>

            <Link
              to="/add-user"
              className={location.pathname==="/add-user"?"active":""}
            >
              <FaPlusCircle />
              Add User
            </Link>
          </>
        )}

        <Link
          to="/profile"
          className={location.pathname==="/profile"?"active":""}
        >
          <FaUserCircle />
          Profile
        </Link>

      </nav>

      <div className="sidebar-footer">

        <img
          src={`https://ui-avatars.com/api/?name=${user.full_name || "Farmer"}&background=16a34a&color=fff`}
          alt=""
        />

        <div>
          <h4>{user.full_name || "Farmer"}</h4>
          <span>{role.toUpperCase()}</span>
        </div>

      </div>

      <button
        className="logout-btn"
        onClick={()=>{
          localStorage.clear();
          window.location.href="/";
        }}
      >
        <FaSignOutAlt />
        Logout
      </button>

    </aside>
  );
}