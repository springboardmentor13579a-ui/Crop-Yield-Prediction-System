import React, {
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  loginUser,
  saveToken,
} from "../services/authService";


// ============================================================
// LOGIN SCREEN
// ============================================================

export default function LoginScreen({
  navigation,
  onLogin,
}: any) {

  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  // ==========================================================
  // NORMAL LOGIN
  // ==========================================================

  const handleLogin = async () => {

    if (!email.trim()) {

      Alert.alert(
        "Email required",
        "Please enter your email address."
      );

      return;
    }


    if (!password) {

      Alert.alert(
        "Password required",
        "Please enter your password."
      );

      return;
    }


    try {

      setLoading(true);


      const result = await loginUser(
        email.trim().toLowerCase(),
        password
      );


      if (
        !result ||
        !result.success
      ) {

        Alert.alert(
          "Login failed",
          result?.message ||
            "Unable to login."
        );

        return;
      }


      if (!result.access_token) {

        Alert.alert(
          "Login failed",
          "Server did not return an access token."
        );

        return;
      }


      await saveToken(
        result.access_token
      );


      // Tell App.tsx that authentication
      // was successful.
      if (onLogin) {
        onLogin();
      }

    } catch (error: any) {

      console.log(
        "LOGIN ERROR:",
        error?.response?.data ||
          error?.message ||
          error
      );


      Alert.alert(
        "Login error",
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          "Unable to connect to the server."
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <SafeAreaView
      style={styles.container}
    >

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >

        <View
          style={styles.content}
        >

          {/* LOGO */}

          <Text style={styles.logo}>
            ⌁
          </Text>


          {/* TITLE */}

          <Text style={styles.title}>
            Welcome back
          </Text>


          <Text style={styles.subtitle}>
            Sign in to your YieldSenseAI account
          </Text>


          {/* EMAIL */}

          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#789084"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!loading}
          />


          {/* PASSWORD */}

          <Text style={styles.label}>
            Password
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#789084"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
          />


          {/* LOGIN BUTTON */}

          <Pressable
            style={[
              styles.button,
              loading &&
                styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >

            {loading ? (

              <ActivityIndicator
                color="#022C1A"
              />

            ) : (

              <Text
                style={styles.buttonText}
              >
                Sign in
              </Text>

            )}

          </Pressable>


          {/* GOOGLE */}

          <View style={styles.dividerRow}>

            <View
              style={styles.divider}
            />

            <Text
              style={styles.dividerText}
            >
              OR
            </Text>

            <View
              style={styles.divider}
            />

          </View>


          <Pressable
            style={styles.googleButton}
            onPress={() => {

              Alert.alert(
                "Google Login",
                "Google authentication will be connected next using your Google OAuth configuration."
              );

            }}
            disabled={loading}
          >

            <Text
              style={styles.googleIcon}
            >
              G
            </Text>

            <Text
              style={styles.googleText}
            >
              Continue with Google
            </Text>

          </Pressable>


          {/* REGISTER */}

          <View
            style={styles.registerRow}
          >

            <Text
              style={styles.registerText}
            >
              Don't have an account?
            </Text>

            <Pressable
              onPress={() =>
                navigation.navigate(
                  "Register"
                )
              }
              disabled={loading}
            >

              <Text
                style={styles.registerLink}
              >
                Register
              </Text>

            </Pressable>

          </View>


          {/* BACK */}

          <Pressable
            onPress={() =>
              navigation.navigate(
                "Home"
              )
            }
            style={styles.backButton}
            disabled={loading}
          >

            <Text
              style={styles.backText}
            >
              ← Back to home
            </Text>

          </Pressable>

        </View>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#06130d",
  },

  flex: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  logo: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor:
      "rgba(52,211,153,0.12)",
    borderWidth: 1,
    borderColor:
      "rgba(52,211,153,0.25)",
    color: "#6EE7B7",
    fontSize: 38,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 62,
    marginBottom: 25,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    color:
      "rgba(255,255,255,0.5)",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 28,
  },

  label: {
    color: "#A7F3D0",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 7,
  },

  input: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.1)",
    backgroundColor:
      "rgba(255,255,255,0.05)",
    color: "#FFFFFF",
    paddingHorizontal: 16,
    marginBottom: 14,
    fontSize: 14,
  },

  button: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#34D399",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#022C1A",
    fontSize: 15,
    fontWeight: "800",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor:
      "rgba(255,255,255,0.08)",
  },

  dividerText: {
    color:
      "rgba(255,255,255,0.35)",
    fontSize: 11,
    marginHorizontal: 12,
  },

  googleButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  googleIcon: {
    color: "#4285F4",
    fontSize: 18,
    fontWeight: "800",
    marginRight: 10,
  },

  googleText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
    gap: 5,
  },

  registerText: {
    color:
      "rgba(255,255,255,0.5)",
    fontSize: 13,
  },

  registerLink: {
    color: "#6EE7B7",
    fontSize: 13,
    fontWeight: "700",
  },

  backButton: {
    alignItems: "center",
    marginTop: 25,
  },

  backText: {
    color:
      "rgba(255,255,255,0.45)",
    fontSize: 13,
  },

});