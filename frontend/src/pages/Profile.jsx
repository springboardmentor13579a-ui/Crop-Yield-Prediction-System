import Layout from "../layout/Layout";
import "../styles/Profile.css";

import {
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaSeedling,
  FaEdit,
  FaChartLine,
  FaLeaf,
  FaUserShield,
  FaUsers,
  FaClipboardList,
  FaDatabase,
  FaTractor,
  FaTint
} from "react-icons/fa";

export default function Profile() {

  const user =
    JSON.parse(localStorage.getItem("user")) || {};

  const role = user.role || localStorage.getItem("role") || "farmer";

  return (
    <Layout>

      {role === "admin"
        ? <AdminProfile user={user}/>
        : <FarmerProfile user={user}/>
      }

    </Layout>
  );
}

/* ================= FARMER ================= */

function FarmerProfile({ user }) {

  return (

<div className="profile-page">

<div className="profile-cover">

<div className="profile-avatar">

<FaUserCircle/>

</div>

<div className="profile-details">

<h1>{user.full_name || "Farmer"}</h1>

<span className="role-badge">
🌾 Farmer
</span>

<p>
Smart Agriculture & Crop Yield Prediction User
</p>

</div>

<button className="edit-btn">

<FaEdit/>

Edit Profile

</button>

</div>


<div className="profile-grid">

<div className="profile-card">

<h2>Personal Information</h2>

<div className="info-row">
<FaEnvelope/>
<span>{user.email || "example@gmail.com"}</span>
</div>

<div className="info-row">
<FaPhone/>
<span>{user.phone || "Not Added"}</span>
</div>

<div className="info-row">
<FaMapMarkerAlt/>
<span>{user.location || "Andhra Pradesh"}</span>
</div>

<div className="info-row">
<FaTractor/>
<span>
  {user.land_area
    ? `${user.land_area} ${user.land_unit || "acres"}`
    : "Not Added"}
</span>
</div>

<div className="info-row">
<FaLeaf/>
<span>{user.crop || "Not Added"}</span>
</div>

<div className="info-row">
<FaSeedling/>
<span>{user.soil || "Not Added"}</span>
</div>

</div>

<div className="profile-card">

<h2>Statistics</h2>

<div className="stats-grid">

<div className="stat-item">

<FaChartLine/>

<h3>28</h3>

<p>Predictions</p>

</div>

<div className="stat-item">

<FaLeaf/>

<h3>8</h3>

<p>Crops</p>

</div>

<div className="stat-item">

<FaTint/>

<h3>91%</h3>

<p>AI Score</p>

</div>

<div className="stat-item">

<FaSeedling/>

<h3>12</h3>

<p>Reports</p>

</div>

</div>

</div>

</div>
<div className="profile-grid">

<div className="profile-card">

<h2>Farm Information</h2>

<div className="info-row">

🌱 <span>Current Crop : Rice</span>

</div>

<div className="info-row">

🚜 <span>Land Area : 2 Acres</span>

</div>

<div className="info-row">

💧 <span>Irrigation : Available</span>

</div>

<div className="info-row">

🧪 <span>Last Soil Test : 18 Days Ago</span>

</div>

<div className="info-row">

📍 <span>District : Visakhapatnam</span>

</div>

</div>

<div className="profile-card">

<h2>Recent Activity</h2>

<ul className="activity">

<li>🌾 Wheat Yield Prediction Completed</li>

<li>🌦 Weather Data Updated</li>

<li>🌱 Soil Analysis Generated</li>

<li>🤖 AI Recommendation Generated</li>

<li>📄 Report Downloaded</li>

</ul>

</div>

</div>

</div>

);

}

/* ================= ADMIN ================= */

function AdminProfile({ user }){

return(

<div className="profile-page">

<div className="profile-cover admin-cover">

<div className="profile-avatar">

<FaUserShield/>

</div>

<div className="profile-details">

<h1>{user.full_name || "Administrator"}</h1>

<span className="role-badge admin">

Administrator

</span>

<p>

System Administration Panel

</p>

</div>

<button className="edit-btn">

<FaEdit/>

Edit Profile

</button>

</div>

<div className="profile-grid">

<div className="profile-card">

<h2>Administrator Details</h2>

<div className="info-row">

<FaEnvelope/>

<span>{user.email || "admin@gmail.com"}</span>

</div>

<div className="info-row">

<FaPhone/>

<span>{user.phone || "9876543210"}</span>

</div>

<div className="info-row">

<FaUserShield/>

<span>Super Administrator</span>

</div>

<div className="info-row">

<FaDatabase/>

<span>MongoDB Connected</span>

</div>

</div>

<div className="profile-card">

<h2>Dashboard Statistics</h2>

<div className="stats-grid">

<div className="stat-item">

<FaUsers/>

<h3>184</h3>

<p>Farmers</p>

</div>

<div className="stat-item">

<FaChartLine/>

<h3>642</h3>

<p>Predictions</p>

</div>

<div className="stat-item">

<FaClipboardList/>

<h3>58</h3>

<p>Reports</p>

</div>

<div className="stat-item">

<FaDatabase/>

<h3>99%</h3>

<p>System</p>

</div>

</div>

</div>

</div>

</div>

);

}