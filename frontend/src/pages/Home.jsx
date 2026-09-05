import React from "react";
import Navbar from "../components/navbar/Navbar";
import { Link } from "react-router-dom";
import farmBg from "../assets/farm-bg.png";

import {
  FaLeaf,
  FaRobot,
  FaCloudSunRain,
  FaSeedling,
  FaArrowRight,
  FaChartLine,
  FaUsers,
  FaCheckCircle,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt
} from "react-icons/fa";

import "../styles/Home.css";

export default function Home() {
  return (
    <>
      <Navbar />

      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section
        id="home"
        className="hero"
        style={{
          backgroundImage: `linear-gradient(rgba(8,35,18,.65),rgba(8,35,18,.65)),url(${farmBg})`
        }}
      >

        <div className="hero-left">

          {/* HERO BADGE */}

          <div className="hero-badge">

            <FaLeaf />

            AI Powered Smart Agriculture

          </div>


          {/* HERO TITLE */}

          <h1 className="hero-title">

            Grow Smarter with

            <span> YieldSense AI</span>

          </h1>


          {/* HERO DESCRIPTION */}

          <p className="hero-subtitle">

            Revolutionize farming using Artificial Intelligence,
            Weather Intelligence, Soil Health Analysis,
            Crop Recommendation and Precision Yield Prediction.

          </p>


          {/* HERO BUTTONS */}

          <div className="hero-buttons">

            {/* GET STARTED */}

            <Link
              to="/register"
              className="btn-hero-primary"
            >

              Get Started

              <FaArrowRight />

            </Link>


            {/* DASHBOARD */}

            <Link
              to="/dashboard"
              className="btn-hero-outline"
            >

              Explore Dashboard

            </Link>

          </div>

        </div>


        {/* =====================================================
            PORTAL SECTION
        ===================================================== */}

        <div className="hero-right">

          <div className="portal-card">

            <h3>
              🌾 Select Portal
            </h3>


            <p>
              Choose your workspace
            </p>


            {/* =================================================
                FARMER PORTAL
            ================================================= */}

            <Link
              to="/login?role=farmer"
              className="portal-link farmer"
            >

              🌾 Farmer Portal

            </Link>


            {/* =================================================
                ADMIN PORTAL
            ================================================= */}

            <Link
              to="/login?role=admin"
              className="portal-link admin"
            >

              🛡️ Admin Portal

            </Link>


            {/* =================================================
                AGRICULTURAL OFFICER PORTAL
            ================================================= */}

            <Link
              to="/login?role=agricultural_officer"
              className="portal-link officer"
            >

              👨‍🌾 Agricultural Officer Portal

            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          FEATURES SECTION
      ===================================================== */}

      <section
        id="features"
        className="features"
      >

        <h2>
          Why Choose YieldSense AI?
        </h2>


        <div className="feature-grid">


          {/* AI PREDICTION */}

          <div className="feature-card">

            <FaRobot className="feature-icon" />

            <h3>
              AI Prediction
            </h3>

            <p>
              Machine Learning powered crop yield prediction
              with high accuracy.
            </p>

          </div>


          {/* WEATHER */}

          <div className="feature-card">

            <FaCloudSunRain className="feature-icon" />

            <h3>
              Weather Intelligence
            </h3>

            <p>
              Real-time weather monitoring for better
              farming decisions.
            </p>

          </div>


          {/* SOIL */}

          <div className="feature-card">

            <FaSeedling className="feature-icon" />

            <h3>
              Soil Analysis
            </h3>

            <p>
              Improve productivity through nutrient and
              soil health analysis.
            </p>

          </div>


          {/* ANALYTICS */}

          <div className="feature-card">

            <FaChartLine className="feature-icon" />

            <h3>
              Analytics
            </h3>

            <p>
              Track predictions and monitor crop
              performance easily.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          ABOUT SECTION
      ===================================================== */}

      <section
        id="about"
        className="about"
      >

        <h2>
          About YieldSense AI
        </h2>


        <p className="about-text">

          YieldSense AI is an intelligent agriculture platform
          developed to help farmers maximize crop production
          using Artificial Intelligence, weather forecasting,
          soil health monitoring and precision farming.

        </p>


        <div className="about-grid">


          {/* FARMERS */}

          <div className="about-card">

            <FaUsers />

            <h3>
              1000+
            </h3>

            <p>
              Farmers Supported
            </p>

          </div>


          {/* ACCURACY */}

          <div className="about-card">

            <FaChartLine />

            <h3>
              95%
            </h3>

            <p>
              Prediction Accuracy
            </p>

          </div>


          {/* AI ASSISTANCE */}

          <div className="about-card">

            <FaCheckCircle />

            <h3>
              24/7
            </h3>

            <p>
              AI Assistance
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          CONTACT SECTION
      ===================================================== */}

      <section
        id="contact"
        className="contact"
      >

        <h2>
          Contact Us
        </h2>


        <div className="contact-grid">


          {/* PHONE */}

          <div className="contact-card">

            <FaPhoneAlt />

            <h3>
              Phone
            </h3>

            <p>
              +91 XXXXX XXXXX
            </p>

          </div>


          {/* EMAIL */}

          <div className="contact-card">

            <FaEnvelope />

            <h3>
              Email
            </h3>

            <p>
              support@yieldsense.ai
            </p>

          </div>


          {/* LOCATION */}

          <div className="contact-card">

            <FaMapMarkerAlt />

            <h3>
              Location
            </h3>

            <p>
              Visakhapatnam, Andhra Pradesh
            </p>

          </div>

        </div>

      </section>

    </>
  );
}