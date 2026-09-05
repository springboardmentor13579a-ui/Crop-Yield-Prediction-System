import { useState } from "react";

import {
  Link,
  useNavigate,
  useSearchParams
} from "react-router-dom";

import { registerUser } from "../services/authService";

import "../styles/Register.css";


export default function Register() {

  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();


  // =====================================================
  // ROLE
  // =====================================================

  const urlRole =
    searchParams.get("role");


  // IMPORTANT:
  // Backend accepts:
  // farmer
  // admin
  // officer

  const validRoles = [
    "farmer",
    "admin",
    "officer"
  ];


  const initialRole =
    validRoles.includes(urlRole)
      ? urlRole
      : "farmer";


  const [role, setRole] =
    useState(initialRole);


  const [loading, setLoading] =
    useState(false);


  // =====================================================
  // FORM
  // =====================================================

  const [form, setForm] = useState({

    full_name: "",

    email: "",

    password: "",

    confirmPassword: "",

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


  // =====================================================
  // ROLE INFORMATION
  // =====================================================

  const roleInfo = {

    farmer: {

      icon: "🌾",

      title:
        "Farmer Registration",

      button:
        "Register Farmer"

    },


    admin: {

      icon: "🛡️",

      title:
        "Admin Registration",

      button:
        "Register Admin"

    },


    officer: {

      icon: "👨‍🌾",

      title:
        "Agricultural Officer Registration",

      button:
        "Register Agricultural Officer"

    }

  };


  const currentRole =
    roleInfo[role];


  // =====================================================
  // ERROR MESSAGE
  // =====================================================

  const getErrorMessage = (error) => {

    if (
      error?.response?.data?.detail
    ) {

      const detail =
        error.response.data.detail;


      if (
        typeof detail === "string"
      ) {

        return detail;

      }


      if (
        Array.isArray(detail)
      ) {

        return detail
          .map((item) => {

            if (
              typeof item === "string"
            ) {

              return item;

            }

            return (
              item?.msg ||
              item?.message ||
              JSON.stringify(item)
            );

          })
          .join("\n");

      }


      if (
        typeof detail === "object"
      ) {

        return (
          detail?.message ||
          detail?.msg ||
          JSON.stringify(detail)
        );

      }

    }


    if (
      typeof error?.message === "string"
    ) {

      return error.message;

    }


    if (
      typeof error === "object"
    ) {

      return (
        error?.message ||
        error?.detail ||
        JSON.stringify(error)
      );

    }


    return "Registration failed.";

  };


  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setForm((prev) => ({

      ...prev,

      [name]: value

    }));

  };


  // =====================================================
  // ROLE CHANGE
  // =====================================================

  const handleRoleChange =
    (selectedRole) => {

      setRole(selectedRole);


      navigate(

        `/register?role=${selectedRole}`,

        {
          replace: true
        }

      );

    };


  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegister =
    async () => {

      // =================================================
      // BASIC VALIDATION
      // =================================================

      if (
        !form.full_name.trim()
      ) {

        alert(
          "Please enter your full name."
        );

        return;

      }


      if (
        !form.email.trim()
      ) {

        alert(
          "Please enter your email address."
        );

        return;

      }


      if (
        !form.password
      ) {

        alert(
          "Please enter a password."
        );

        return;

      }


      if (
        !form.confirmPassword
      ) {

        alert(
          "Please confirm your password."
        );

        return;

      }


      // =================================================
      // EMAIL
      // =================================================

      if (
        !form.email.includes("@")
      ) {

        alert(
          "Please enter a valid email address."
        );

        return;

      }


      // =================================================
      // PASSWORD
      // =================================================

      if (
        form.password.length < 6
      ) {

        alert(
          "Password must contain at least 6 characters."
        );

        return;

      }


      if (
        form.password !==
        form.confirmPassword
      ) {

        alert(
          "Passwords do not match."
        );

        return;

      }


      // =================================================
      // FARMER VALIDATION
      // =================================================

      if (
        role === "farmer"
      ) {

        if (
          !form.state.trim()
        ) {

          alert(
            "Please enter your state."
          );

          return;

        }


        if (
          !form.district.trim()
        ) {

          alert(
            "Please enter your district."
          );

          return;

        }

      }


      // =================================================
      // SEND TO BACKEND
      // =================================================

      try {

        setLoading(true);


        const registrationData = {

          full_name:
            form.full_name.trim(),

          email:
            form.email.trim(),

          password:
            form.password,

          // IMPORTANT:
          // officer is the backend value

          role:
            role,


          phone:
            form.phone.trim() || null,


          country:
            form.country.trim() || null,


          state:
            form.state.trim() || null,


          district:
            form.district.trim() || null,


          mandal:
            form.mandal.trim() || null,


          village:
            form.village.trim() || null,


          land_area:

            form.land_area !== ""

              ? Number(form.land_area)

              : null,


          land_unit:
            form.land_unit || "acres",


          crop:
            form.crop.trim() || null,


          soil:
            form.soil.trim() || null,


          irrigation:
            form.irrigation.trim() || null

        };


        console.log(
          "REGISTER DATA:",
          registrationData
        );


        // =================================================
        // API CALL
        // =================================================

        const data =
          await registerUser(
            registrationData
          );


        console.log(
          "REGISTER RESPONSE:",
          data
        );


        // =================================================
        // SUCCESS
        // =================================================

        if (
          data?.id
        ) {

          let message =
            "Registration successful.";


          if (
            role === "farmer"
          ) {

            message =
              "Farmer account created successfully.";

          }


          else if (
            role === "admin"
          ) {

            message =
              "Admin account created successfully.";

          }


          else if (
            role === "officer"
          ) {

            message =
              "Agricultural Officer account created successfully.";

          }


          alert(message);


          // Go to corresponding login

          navigate(
            `/login?role=${role}`
          );


          return;

        }


        // =================================================
        // BACKEND ERROR
        // =================================================

        const backendMessage =
          data?.detail ||
          data?.message ||
          "Registration failed.";


        if (
          typeof backendMessage === "string"
        ) {

          alert(
            backendMessage
          );

        }

        else {

          alert(
            JSON.stringify(
              backendMessage
            )
          );

        }

      }


      catch (error) {

        console.error(
          "REGISTRATION ERROR:",
          error
        );


        alert(
          getErrorMessage(error)
        );

      }


      finally {

        setLoading(false);

      }

    };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="register-page">

      <div className="register-card">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="register-header">

          <div className="register-icon">

            {currentRole.icon}

          </div>


          <h1>

            {currentRole.title}

          </h1>


          <p>

            Create your YieldSense AI account

          </p>

        </div>


        {/* =================================================
            ROLE SELECTOR
        ================================================= */}

        <div className="role-selector">

          {/* FARMER */}

          <button
            type="button"

            className={
              role === "farmer"
                ? "role-button active"
                : "role-button"
            }

            onClick={() =>
              handleRoleChange(
                "farmer"
              )
            }
          >

            🌾 Farmer

          </button>


          {/* ADMIN */}

          <button
            type="button"

            className={
              role === "admin"
                ? "role-button active"
                : "role-button"
            }

            onClick={() =>
              handleRoleChange(
                "admin"
              )
            }
          >

            🛡️ Admin

          </button>


          {/* AGRICULTURAL OFFICER */}

          <button
            type="button"

            className={
              role === "officer"
                ? "role-button active"
                : "role-button"
            }

            onClick={() =>
              handleRoleChange(
                "officer"
              )
            }
          >

            👨‍🌾 Agricultural Officer

          </button>

        </div>


        {/* =================================================
            ADMIN INFORMATION
        ================================================= */}

        {role === "admin" && (

          <div className="admin-info">

            🛡️ Admin accounts are intended
            for system administrators.

          </div>

        )}


        {/* =================================================
            OFFICER INFORMATION
        ================================================= */}

        {role === "officer" && (

          <div
            className="admin-info"

            style={{

              background:
                "#dcfce7",

              color:
                "#166534"

            }}
          >

            👨‍🌾 Agricultural Officer accounts
            are intended for government and
            agricultural officers who monitor
            farmers, soil health and agricultural
            information.

          </div>

        )}


        {/* =================================================
            ACCOUNT INFORMATION
        ================================================= */}

        <div className="form-section">

          <h3>

            Account Information

          </h3>


          <input
            type="text"

            name="full_name"

            placeholder={

              role === "farmer"

                ? "Full Name"

                : role === "admin"

                ? "Admin Full Name"

                : "Officer Full Name"

            }

            value={
              form.full_name
            }

            onChange={
              handleChange
            }

          />


          <input
            type="email"

            name="email"

            placeholder="Email Address"

            value={
              form.email
            }

            onChange={
              handleChange
            }

          />


          <input
            type="password"

            name="password"

            placeholder="Password"

            value={
              form.password
            }

            onChange={
              handleChange
            }

          />


          <input
            type="password"

            name="confirmPassword"

            placeholder="Confirm Password"

            value={
              form.confirmPassword
            }

            onChange={
              handleChange
            }

          />

        </div>


        {/* =================================================
            FARMER INFORMATION
        ================================================= */}

        {role === "farmer" && (

          <div className="form-section">

            <h3>

              Farmer Information

            </h3>


            <input
              type="text"

              name="phone"

              placeholder="Phone Number"

              value={
                form.phone
              }

              onChange={
                handleChange
              }

            />


            <input
              type="text"

              name="country"

              placeholder="Country"

              value={
                form.country
              }

              onChange={
                handleChange
              }

            />


            <input
              type="text"

              name="state"

              placeholder="State"

              value={
                form.state
              }

              onChange={
                handleChange
              }

            />


            <input
              type="text"

              name="district"

              placeholder="District"

              value={
                form.district
              }

              onChange={
                handleChange
              }

            />


            <input
              type="text"

              name="mandal"

              placeholder="Mandal"

              value={
                form.mandal
              }

              onChange={
                handleChange
              }

            />


            <input
              type="text"

              name="village"

              placeholder="Village"

              value={
                form.village
              }

              onChange={
                handleChange
              }

            />


            <div className="input-row">

              <input
                type="number"

                name="land_area"

                placeholder="Land Area"

                min="0"

                value={
                  form.land_area
                }

                onChange={
                  handleChange
                }

              />


              <select
                name="land_unit"

                value={
                  form.land_unit
                }

                onChange={
                  handleChange
                }
              >

                <option value="acres">

                  Acres

                </option>


                <option value="hectares">

                  Hectares

                </option>

              </select>

            </div>


            <input
              type="text"

              name="crop"

              placeholder="Crop"

              value={
                form.crop
              }

              onChange={
                handleChange
              }

            />


            <input
              type="text"

              name="soil"

              placeholder="Soil Type"

              value={
                form.soil
              }

              onChange={
                handleChange
              }

            />


            <input
              type="text"

              name="irrigation"

              placeholder="Irrigation Type"

              value={
                form.irrigation
              }

              onChange={
                handleChange
              }

            />

          </div>

        )}


        {/* =================================================
            REGISTER BUTTON
        ================================================= */}

        <button
          type="button"

          className="register-button"

          onClick={
            handleRegister
          }

          disabled={
            loading
          }
        >

          {loading

            ? "Creating Account..."

            : currentRole.button

          }

        </button>


        {/* =================================================
            LOGIN
        ================================================= */}

        <p className="login-link">

          Already have an account?


          <Link
            to={`/login?role=${role}`}
          >

            Login

          </Link>

        </p>

      </div>

    </div>

  );

}