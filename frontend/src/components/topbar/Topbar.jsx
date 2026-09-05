import "./topbar.css";
import {
  FaBell,
  FaSearch,
  FaLeaf
} from "react-icons/fa";

export default function Topbar() {

  const user =
    JSON.parse(localStorage.getItem("user")) || {};

  return (

    <header className="topbar">

      <div className="topbar-left">

        <div className="logo-box">
          <FaLeaf className="logo-leaf"/>
        </div>

        <div>

          <h2>YieldSense AI</h2>

          <p>Smart Agriculture Dashboard</p>

        </div>

      </div>

      <div className="topbar-right">

        <div className="search-box">

          <FaSearch className="search-icon"/>

          <input
            type="text"
            placeholder="Search crops, weather..."
          />

        </div>

        <button className="notification">

          <FaBell/>

          <span className="notify-dot"></span>

        </button>

        <div className="user-box">

          <div className="avatar">

            <FaLeaf/>

          </div>

          <div>

            <h4>{user.full_name || "Farmer"}</h4>

            <span>
              {(user.role || "Farmer").toUpperCase()}
            </span>

          </div>

        </div>

      </div>

    </header>

  );

}