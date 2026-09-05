import { useState } from "react";

import {
  Link,
  useNavigate,
  useSearchParams
} from "react-router-dom";

import { GoogleLogin } from "@react-oauth/google";

import {
  loginUser,
  googleLogin
} from "../services/authService";


export default function Login() {

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();


  // =====================================================
  // ROLE
  // =====================================================

  const selectedRole =
    searchParams.get("role") || "farmer";


  // Backend accepts:
  // farmer
  // admin
  // agricultural_officer

  const validRoles = [
    "farmer",
    "admin",
    "agricultural_officer"
  ];


  const role =
    validRoles.includes(selectedRole)
      ? selectedRole
      : "farmer";


  // =====================================================
  // ROLE INFORMATION
  // =====================================================

  const roleInfo = {

    farmer: {
      icon: "🌾",
      title: "Farmer Login",
      subtitle: "Sign in to your Farmer Dashboard",
      register: "Register as Farmer"
    },


    admin: {
      icon: "🛡️",
      title: "Admin Login",
      subtitle: "Sign in to your Admin Dashboard",
      register: "Register as Admin"
    },


    agricultural_officer: {
      icon: "👨‍🌾",
      title: "Agricultural Officer Login",
      subtitle:
        "Sign in to your Agricultural Officer Dashboard",
      register:
        "Register as Agricultural Officer"
    }

  };


  const currentRole =
    roleInfo[role];


  // =====================================================
  // STATE
  // =====================================================

  const [loading, setLoading] =
    useState(false);


  const [form, setForm] = useState({
    email: "",
    password: ""
  });


  // =====================================================
  // ERROR MESSAGE
  // =====================================================

  const getErrorMessage = (error) => {

    if (error?.response?.data?.detail) {

      const detail =
        error.response.data.detail;


      if (typeof detail === "string") {
        return detail;
      }


      if (Array.isArray(detail)) {

        return detail
          .map((item) => {

            if (typeof item === "string") {
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


      if (typeof detail === "object") {

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
        JSON.stringify(error)
      );

    }


    return "Login failed.";

  };


  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {

    setForm({

      ...form,

      [e.target.name]:
        e.target.value

    });

  };


  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async () => {

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (
      !form.email ||
      !form.password
    ) {

      alert(
        "Please enter email and password."
      );

      return;

    }


    if (
      !form.email.includes("@")
    ) {

      alert(
        "Please enter a valid email."
      );

      return;

    }


    try {

      setLoading(true);


      // -------------------------------------------------
      // LOGIN REQUEST
      // -------------------------------------------------

      const data = await loginUser({

        email: form.email.trim(),

        password: form.password,

        role: role

      });


      console.log(
        "LOGIN RESPONSE:",
        data
      );


      // =================================================
      // SUCCESS
      // =================================================

      if (data?.access_token) {

        // =================================================
        // FARMER
        // =================================================

        if (data.user.role === "farmer") {

          localStorage.setItem(
            "role",
            "farmer"
          );

          localStorage.setItem(
            "user",
            JSON.stringify(data.user)
          );

          localStorage.setItem(
            "token",
            data.access_token
          );


          alert(
            "Farmer Login Successful"
          );


          navigate("/dashboard");

          return;

        }


        // =================================================
        // ADMIN
        // =================================================

        if (data.user.role === "admin") {

          localStorage.setItem(
            "role",
            "admin"
          );

          localStorage.setItem(
            "user",
            JSON.stringify(data.user)
          );

          localStorage.setItem(
            "token",
            data.access_token
          );


          alert(
            "Admin Login Successful"
          );


          navigate("/dashboard");

          return;

        }


        // =================================================
        // AGRICULTURAL OFFICER
        // =================================================

        if (
          data.user.role === "agricultural_officer"
        ) {

          localStorage.setItem(
            "role",
            "agricultural_officer"
          );


          localStorage.setItem(
            "user",
            JSON.stringify(data.user)
          );


          localStorage.setItem(
            "token",
            data.access_token
          );


          alert(
            "Agricultural Officer Login Successful"
          );


          navigate(
            "/agricultural-officer"
          );

          return;

        }


        // =================================================
        // UNKNOWN ROLE
        // =================================================

        alert(
          `Unknown user role: ${data.user.role}`
        );

      }

      else {

        const message =
          data?.detail ||
          data?.message ||
          "Invalid Credentials";


        alert(

          typeof message === "string"
            ? message
            : JSON.stringify(message)

        );

      }

    }

    catch (err) {

      console.error(
        "LOGIN ERROR:",
        err
      );


      alert(
        getErrorMessage(err)
      );

    }

    finally {

      setLoading(false);

    }

  };


  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  const handleGoogleSuccess =
    async (credentialResponse) => {

      // Google login remains Farmer only

      if (
        role !== "farmer"
      ) {

        alert(
          "Google Login is available only for Farmers."
        );

        return;

      }


      try {

        setLoading(true);


        const data =
          await googleLogin(
            credentialResponse.credential
          );


        if (
          data?.access_token
        ) {

          localStorage.setItem(
            "token",
            data.access_token
          );


          localStorage.setItem(
            "role",
            "farmer"
          );


          localStorage.setItem(
            "user",
            JSON.stringify(
              data.user
            )
          );


          alert(
            "Google Login Successful"
          );


          navigate(
            "/dashboard"
          );

        }

        else {

          alert(
            data?.detail ||
            "Google Login Failed"
          );

        }

      }

      catch (err) {

        console.error(
          "GOOGLE LOGIN ERROR:",
          err
        );


        alert(
          getErrorMessage(err)
        );

      }

      finally {

        setLoading(false);

      }

    };


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div
      style={{

        minHeight: "100vh",

        display: "flex",

        justifyContent:
          "center",

        alignItems:
          "center",

        background:
          "linear-gradient(135deg,#064e3b,#0f766e,#2563eb)"

      }}
    >

      <div
        style={{

          width: "460px",

          maxWidth: "90%",

          background:
            "rgba(255,255,255,.15)",

          backdropFilter:
            "blur(18px)",

          borderRadius: "22px",

          padding: "40px",

          boxShadow:
            "0 20px 45px rgba(0,0,0,.25)"

        }}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          style={{

            textAlign: "center",

            marginBottom: "25px"

          }}
        >

          <div
            style={{
              fontSize: "60px"
            }}
          >

            {currentRole.icon}

          </div>


          <h1
            style={{

              color: "white",

              marginBottom: "10px",

              fontSize: "30px"

            }}
          >

            {currentRole.title}

          </h1>


          <p
            style={{
              color: "#dbeafe"
            }}
          >

            {currentRole.subtitle}

          </p>

        </div>


        {/* =================================================
            EMAIL
        ================================================= */}

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          style={inputStyle}
        />


        {/* =================================================
            PASSWORD
        ================================================= */}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={inputStyle}
        />


        {/* =================================================
            LOGIN BUTTON
        ================================================= */}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{

            ...buttonStyle,

            opacity:
              loading ? 0.7 : 1

          }}
        >

          {loading
            ? "Signing In..."
            : "Login"}

        </button>


        {/* =================================================
            GOOGLE LOGIN
        ================================================= */}

        {role === "farmer" && (

          <>

            <div
              style={{

                margin: "25px 0",

                textAlign: "center",

                color: "white",

                fontWeight: "bold"

              }}
            >

              OR

            </div>


            <div
              style={{

                display: "flex",

                justifyContent:
                  "center"

              }}
            >

              <GoogleLogin

                onSuccess={
                  handleGoogleSuccess
                }

                onError={() =>
                  alert(
                    "Google Login Failed"
                  )
                }

                theme="filled_blue"

                shape="pill"

                size="large"

                width="360"

              />

            </div>

          </>

        )}


        {/* =================================================
            REGISTER
        ================================================= */}

        <p
          style={{

            marginTop: "25px",

            textAlign: "center",

            color: "white"

          }}
        >

          Don't have an account?


          <Link
            to={`/register?role=${role}`}
            style={{

              marginLeft: "6px",

              color: "white",

              fontWeight: "bold"

            }}
          >

            {currentRole.register}

          </Link>

        </p>


        {/* =================================================
            AGRICULTURAL OFFICER INFO
        ================================================= */}

        {role === "agricultural_officer" && (

          <div
            style={{

              marginTop: "20px",

              background: "#dcfce7",

              color: "#166534",

              padding: "14px",

              borderRadius: "10px",

              fontSize: "14px",

              textAlign: "center"

            }}
          >

            👨‍🌾 This login is for
            Agricultural Officers.

          </div>

        )}


        {/* =================================================
            ADMIN INFO
        ================================================= */}

        {role === "admin" && (

          <div
            style={{

              marginTop: "20px",

              background: "#fef3c7",

              color: "#92400e",

              padding: "14px",

              borderRadius: "10px",

              fontSize: "14px",

              textAlign: "center"

            }}
          >

            🛡️ This login is for
            system administrators.

          </div>

        )}

      </div>

    </div>

  );

}


// =========================================================
// STYLES
// =========================================================

const inputStyle = {

  width: "100%",

  padding: "15px",

  marginTop: "16px",

  borderRadius: "10px",

  border: "none",

  outline: "none",

  fontSize: "15px",

  boxSizing: "border-box"

};


const buttonStyle = {

  width: "100%",

  padding: "16px",

  marginTop: "22px",

  background: "#22c55e",

  color: "white",

  border: "none",

  borderRadius: "10px",

  cursor: "pointer",

  fontWeight: "700",

  fontSize: "16px"

};