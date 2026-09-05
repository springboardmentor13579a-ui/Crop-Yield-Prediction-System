import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addUser } from "../services/userService";

export default function AddUser() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        password: "",
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


    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await addUser(form);

            alert("User Added Successfully");

            navigate("/users");

        } catch (err) {

            alert(err.message);

        }

    };


    return (

        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                background: "#f4f7fb",
                padding: "30px"
            }}
        >

            <form
                onSubmit={handleSubmit}
                style={{
                    width: "500px",
                    background: "white",
                    padding: "35px",
                    borderRadius: "12px",
                    boxShadow: "0px 4px 20px rgba(0,0,0,0.1)"
                }}
            >

                <h2
                    style={{
                        textAlign: "center",
                        marginBottom: "30px",
                        color: "#166534"
                    }}
                >
                    Add New User
                </h2>


                {/* BASIC INFORMATION */}

                <h3>Basic Information</h3>

                <input
                    type="text"
                    name="full_name"
                    placeholder="Full Name"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                />

                <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                    style={inputStyle}
                />


                <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    style={inputStyle}
                >
                    <option value="farmer">Farmer</option>
                    <option value="admin">Admin</option>
                </select>


                {/* LOCATION */}

                {form.role === "farmer" && (

                    <>
                        <h3>Farm Location</h3>

                        <input
                            type="text"
                            name="country"
                            placeholder="Country"
                            value={form.country}
                            onChange={handleChange}
                            style={inputStyle}
                        />

                        <input
                            type="text"
                            name="state"
                            placeholder="State"
                            value={form.state}
                            onChange={handleChange}
                            style={inputStyle}
                        />

                        <input
                            type="text"
                            name="district"
                            placeholder="District"
                            value={form.district}
                            onChange={handleChange}
                            style={inputStyle}
                        />

                        <input
                            type="text"
                            name="mandal"
                            placeholder="Mandal"
                            value={form.mandal}
                            onChange={handleChange}
                            style={inputStyle}
                        />

                        <input
                            type="text"
                            name="village"
                            placeholder="Village"
                            value={form.village}
                            onChange={handleChange}
                            style={inputStyle}
                        />


                        {/* FARM INFORMATION */}

                        <h3>Farm Information</h3>

                        <input
                            type="number"
                            name="land_area"
                            placeholder="Land Area"
                            value={form.land_area}
                            onChange={handleChange}
                            style={inputStyle}
                        />

                        <select
                            name="land_unit"
                            value={form.land_unit}
                            onChange={handleChange}
                            style={inputStyle}
                        >
                            <option value="acres">Acres</option>
                            <option value="hectares">Hectares</option>
                        </select>

                        <input
                            type="text"
                            name="crop"
                            placeholder="Current Crop"
                            value={form.crop}
                            onChange={handleChange}
                            style={inputStyle}
                        />

                        <input
                            type="text"
                            name="soil"
                            placeholder="Soil Type"
                            value={form.soil}
                            onChange={handleChange}
                            style={inputStyle}
                        />

                        <input
                            type="text"
                            name="irrigation"
                            placeholder="Irrigation"
                            value={form.irrigation}
                            onChange={handleChange}
                            style={inputStyle}
                        />

                    </>

                )}


                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "12px",
                        background: "#16a34a",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "16px",
                        cursor: "pointer",
                        marginTop: "10px"
                    }}
                >
                    Save User
                </button>

            </form>

        </div>

    );
}


const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "15px",
    boxSizing: "border-box"
};