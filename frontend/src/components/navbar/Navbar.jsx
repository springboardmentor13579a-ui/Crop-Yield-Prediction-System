import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { FaLeaf } from "react-icons/fa";
import "../../styles/Navbar.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar-scroll" : ""}`}>

      {/* LOGO */}

      <Link
        to="/"
        className="nav-brand"
        onClick={() => setIsOpen(false)}
      >
        <div className="brand-logo">
          <FaLeaf className="brand-icon" />
        </div>

        <div>
          <h2 className="brand-title">YieldSense AI</h2>
          <span className="brand-subtitle">
            Smart Agriculture Platform
          </span>
        </div>
      </Link>

      {/* LINKS */}

      <div className={`nav-links ${isOpen ? "open" : ""}`}>

        <a href="#home" onClick={() => setIsOpen(false)}>
          Home
        </a>

        <a href="#features" onClick={() => setIsOpen(false)}>
          Features
        </a>

        <a href="#about" onClick={() => setIsOpen(false)}>
          About
        </a>

        <a href="#contact" onClick={() => setIsOpen(false)}>
          Contact
        </a>

        {token && (
          <>
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className={
                location.pathname === "/dashboard"
                  ? "active"
                  : ""
              }
            >
              Dashboard
            </Link>

            <Link
              to="/prediction"
              onClick={() => setIsOpen(false)}
              className={
                location.pathname === "/prediction"
                  ? "active"
                  : ""
              }
            >
              Prediction
            </Link>
          </>
        )}

        {token ? (
          <>
            <div className="welcome-user">

              <div className="welcome-avatar">
                {user.full_name
                  ? user.full_name.charAt(0).toUpperCase()
                  : "F"}
              </div>

              <div>

                <strong>
                  {user.full_name || "Farmer"}
                </strong>

                <small>
                  {(user.role || "Farmer").toUpperCase()}
                </small>

              </div>

            </div>

            <button
              className="btn-nav-register logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>

            <Link
              to="/register"
              className="btn-nav-register"
              onClick={() => setIsOpen(false)}
            >
              Register
            </Link>
          </>
        )}

      </div>

      {/* MOBILE */}

      <div
        className="hamburger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <HiX size={30} /> : <HiMenu size={30} />}
      </div>

    </nav>
  );
}