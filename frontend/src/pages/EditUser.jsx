import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getUser,
    updateUser
} from "../services/userService";

export default function EditUser() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        role: "farmer",

        phone: "",

        country: "",
        state: "",
        district: "",
        mandal: "",
        village: "",

        land_area: "",
        land_unit: "acres",

        crop: "",
        soil: "",
        irrigation: ""
    });

    const [loading, setLoading] = useState(true);

    // =====================================================
    // LOAD USER
    // =====================================================

    useEffect(() => {
        loadUser();
    }, [id]);

    async function loadUser() {

        try {

            setLoading(true);

            const data = await getUser(id);

            setForm({
                full_name: data.full_name || "",
                email: data.email || "",
                role: data.role || "farmer",

                phone: data.phone || "",

                country: data.country || "",
                state: data.state || "",
                district: data.district || "",
                mandal: data.mandal || "",
                village: data.village || "",

                land_area: data.land_area ?? "",
                land_unit: data.land_unit || "acres",

                crop: data.crop || "",
                soil: data.soil || "",
                irrigation: data.irrigation || ""
            });

        } catch (err) {

            console.error(err);
            alert(err.message || "Failed to load user");

        } finally {

            setLoading(false);

        }
    }

    // =====================================================
    // HANDLE INPUT
    // =====================================================

    function handleChange(e) {

        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));

    }

    // =====================================================
    // UPDATE USER
    // =====================================================

    async function handleSubmit(e) {

        e.preventDefault();

        try {

            // Basic fields
            const updateData = {
                full_name: form.full_name,
                email: form.email,
                role: form.role,
                phone: form.phone
            };

            // Farmer-specific fields
            if (form.role === "farmer") {

                updateData.country = form.country;
                updateData.state = form.state;
                updateData.district = form.district;
                updateData.mandal = form.mandal;
                updateData.village = form.village;

                updateData.land_area =
                    form.land_area === ""
                        ? 0
                        : Number(form.land_area);

                updateData.land_unit = form.land_unit;

                updateData.crop = form.crop;
                updateData.soil = form.soil;
                updateData.irrigation = form.irrigation;
            }

            console.log("Updating user:", updateData);

            await updateUser(id, updateData);

            alert("User Updated Successfully");

            navigate("/users");

        } catch (err) {

            console.error(err);
            alert(err.message || "Failed to update user");

        }
    }

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#f5f5f5",
                    fontSize: "18px"
                }}
            >
                Loading user...
            </div>
        );

    }

    // =====================================================
    // UI
    // =====================================================

    return (

        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                background: "#f5f5f5",
                padding: "30px"
            }}
        >

            <form
                onSubmit={handleSubmit}
                style={{
                    width: "500px",
                    maxWidth: "100%",
                    background: "white",
                    padding: "35px",
                    borderRadius: "12px",
                    boxShadow: "0 0 15px rgba(0,0,0,.15)"
                }}
            >

                {/* ================================================= */}
                {/* TITLE */}
                {/* ================================================= */}

                <h2
                    style={{
                        textAlign: "center",
                        color: "#15803d",
                        marginBottom: "25px"
                    }}
                >
                    Edit User
                </h2>


                {/* ================================================= */}
                {/* BASIC INFORMATION */}
                {/* ================================================= */}

                <h3 style={sectionStyle}>
                    Basic Information
                </h3>

                <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    required
                    style={inputStyle}
                />

                <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    style={inputStyle}
                />

                <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    style={inputStyle}
                />

                <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    style={inputStyle}
                >

                    <option value="farmer">
                        Farmer
                    </option>

                    <option value="admin">
                        Admin
                    </option>

                </select>


                {/* ================================================= */}
                {/* FARMER INFORMATION */}
                {/* ================================================= */}

                {form.role === "farmer" && (

                    <>

                        {/* FARM LOCATION */}

                        <h3 style={sectionStyle}>
                            Farm Location
                        </h3>

                        <input
                            name="country"
                            value={form.country}
                            onChange={handleChange}
                            placeholder="Country"
                            style={inputStyle}
                        />

                        <input
                            name="state"
                            value={form.state}
                            onChange={handleChange}
                            placeholder="State"
                            style={inputStyle}
                        />

                        <input
                            name="district"
                            value={form.district}
                            onChange={handleChange}
                            placeholder="District"
                            style={inputStyle}
                        />

                        <input
                            name="mandal"
                            value={form.mandal}
                            onChange={handleChange}
                            placeholder="Mandal"
                            style={inputStyle}
                        />

                        <input
                            name="village"
                            value={form.village}
                            onChange={handleChange}
                            placeholder="Village"
                            style={inputStyle}
                        />


                        {/* FARM INFORMATION */}

                        <h3 style={sectionStyle}>
                            Farm Information
                        </h3>

                        <input
                            name="land_area"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.land_area}
                            onChange={handleChange}
                            placeholder="Land Area"
                            style={inputStyle}
                        />

                        <select
                            name="land_unit"
                            value={form.land_unit}
                            onChange={handleChange}
                            style={inputStyle}
                        >

                            <option value="acres">
                                Acres
                            </option>

                            <option value="hectares">
                                Hectares
                            </option>

                        </select>


                        <input
                            name="crop"
                            value={form.crop}
                            onChange={handleChange}
                            placeholder="Current Crop"
                            style={inputStyle}
                        />

                        <input
                            name="soil"
                            value={form.soil}
                            onChange={handleChange}
                            placeholder="Soil Type"
                            style={inputStyle}
                        />

                        <input
                            name="irrigation"
                            value={form.irrigation}
                            onChange={handleChange}
                            placeholder="Irrigation"
                            style={inputStyle}
                        />

                    </>

                )}


                {/* ================================================= */}
                {/* UPDATE BUTTON */}
                {/* ================================================= */}

                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "12px",
                        background: "#16a34a",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "16px",
                        marginTop: "10px",
                        fontWeight: "bold"
                    }}
                >
                    Update User
                </button>


                {/* CANCEL BUTTON */}

                <button
                    type="button"
                    onClick={() => navigate("/users")}
                    style={{
                        width: "100%",
                        padding: "12px",
                        background: "#e5e7eb",
                        color: "#374151",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "16px",
                        marginTop: "10px"
                    }}
                >
                    Cancel
                </button>

            </form>

        </div>

    );
}


// =====================================================
// STYLES
// =====================================================

const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "15px",
    boxSizing: "border-box"
};

const sectionStyle = {
    color: "#166534",
    marginTop: "20px",
    marginBottom: "15px",
    fontSize: "18px"
};