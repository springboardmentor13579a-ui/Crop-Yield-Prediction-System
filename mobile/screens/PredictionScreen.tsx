import React from "react";

import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function PredictionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Predict Yield
        </Text>

        <Text style={styles.description}>
          Your YieldSenseAI prediction form will be connected here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#06130d",
  },

  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },

  description: {
    color:
      "rgba(255,255,255,0.5)",
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
  },
});