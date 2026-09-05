import { Routes, Route } from "react-router-dom";


import EditUser from "../pages/EditUser";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Users from "../pages/Users";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Prediction from "../pages/Prediction";
import Weather from "../pages/Weather";
import Soil from "../pages/Soil";
import Profile from "../pages/Profile";
import AddUser from "../pages/AddUser";
import Report from "../pages/Report";
import Analytics from "../pages/Analytics";
import NotFound from "../pages/NotFound";
import PSReports from "../pages/PSReports";
import Recommendations from "../pages/Recommendation";
import Risk from "../pages/Risk";
import AgricultureOfficerDashboard from "../pages/AgricultureOfficerDashboard";

function AppRoutes() {
    return (
        <Routes>

            <Route
                path="/"
                element={<Home />}
            />

            <Route
                path="/users"
                element={<Users />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/edit-user/:id"
                element={<EditUser />}
            />

            <Route
                path="/add-user"
                element={<AddUser />}
            />

            <Route
                path="/dashboard"
                element={<Dashboard />}
            />

            {/* ================================
                COMMON ANALYTICS PAGE
            ================================= */}

            <Route
                path="/analytics"
                element={<Analytics />}
            />

            {/* ================================
                AGRICULTURAL OFFICER
            ================================= */}

            <Route
                path="/agricultural-officer"
                element={
                    <AgricultureOfficerDashboard />
                }
            />

            <Route
                path="/prediction"
                element={<Prediction />}
            />

            <Route
                path="/report"
                element={<Report />}
            />
            <Route
                path="/p-s-reports"
                element={<PSReports />}
            />
            <Route
                path="/weather"
                element={<Weather />}
            />

            <Route
                path="/soil"
                element={<Soil />}
            />

            <Route
                path="/profile"
                element={<Profile />}
            />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/risk" element={<Risk />} />
            <Route
                path="*"
                element={<NotFound />}
            />

        </Routes>
    );
}

export default AppRoutes;