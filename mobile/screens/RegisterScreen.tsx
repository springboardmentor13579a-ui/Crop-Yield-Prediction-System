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
  registerUser,
} from "../services/authService";


// ============================================================
// REGISTER SCREEN
// ============================================================

export default function RegisterScreen({
  navigation,
}: any) {

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  // ==========================================================
  // REGISTER
  // ==========================================================

  const handleRegister = async () => {

    if (!name.trim()) {

      Alert.alert(
        "Name required",
        "Please enter your full name."
      );

      return;
    }


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
        "Please enter a password."
      );

      return;
    }


    if (password.length < 6) {

      Alert.alert(
        "Invalid password",
        "Password must contain at least 6 characters."
      );

      return;
    }


    try {

      setLoading(true);


      const result =
        await registerUser(
          name.trim(),
          email.trim().toLowerCase(),
          password
        );


      if (
        !result ||
        !result.success
      ) {

        Alert.alert(
          "Registration failed",
          result?.message ||
            "Unable to create account."
        );

        return;
      }


      Alert.alert(
        "Account created",
        "Your YieldSenseAI account has been created successfully.",
        [
          {
            text: "Sign in",
            onPress: () =>
              navigation.navigate(
                "Login"
              ),
          },
        ]
      );

    } catch (error: any) {

      console.log(
        "REGISTER ERROR:",
        error?.response?.data ||
          error?.message ||
          error
      );


      Alert.alert(
        "Registration error",
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

          <Text style={styles.logo}>
            ⌁
          </Text>


          <Text style={styles.title}>
            Create account
          </Text>


          <Text style={styles.subtitle}>
            Start using YieldSenseAI
          </Text>


          {/* NAME */}

          <Text style={styles.label}>
            Full name
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#789084"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />


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
            placeholder="Create a password"
            placeholderTextColor="#789084"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
          />


          {/* REGISTER BUTTON */}

          <Pressable
            style={[
              styles.button,
              loading &&
                styles.buttonDisabled,
            ]}
            onPress={handleRegister}
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
                Create account
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
                "Google Registration",
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
              Sign up with Google
            </Text>

          </Pressable>


          {/* LOGIN */}

          <View
            style={styles.loginRow}
          >

            <Text
              style={styles.loginText}
            >
              Already have an account?
            </Text>

            <Pressable
              onPress={() =>
                navigation.navigate(
                  "Login"
                )
              }
              disabled={loading}
            >

              <Text
                style={styles.loginLink}
              >
                Sign in
              </Text>

            </Pressable>

          </View>

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

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
    gap: 5,
  },

  loginText: {
    color:
      "rgba(255,255,255,0.5)",
    fontSize: 13,
  },

  loginLink: {
    color: "#6EE7B7",
    fontSize: 13,
    fontWeight: "700",
  },

});