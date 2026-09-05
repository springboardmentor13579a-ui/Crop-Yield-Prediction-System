import React from "react";

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "../context/AuthContext";

export default function DashboardScreen({
  navigation,
}: any) {
  const {
    user,
    logout,
  } = useAuth();

  const displayName =
    user?.name ??
    user?.full_name ??
    user?.username ??
    "Farmer";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.small}>
              Welcome back
            </Text>

            <Text style={styles.title}>
              {displayName}
            </Text>
          </View>

          <Pressable
            style={styles.logout}
            onPress={async () => {
              await logout();
            }}
          >
            <Text style={styles.logoutText}>
              Logout
            </Text>
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>
            YIELDSENSEAI
          </Text>

          <Text style={styles.heroTitle}>
            Smart farming starts with better predictions.
          </Text>

          <Text style={styles.heroDescription}>
            Use agricultural data and AI-powered
            predictions to make better crop decisions.
          </Text>

          <Pressable
            style={styles.predictButton}
            onPress={() =>
              navigation.navigate(
                "Prediction"
              )
            }
          >
            <Text style={styles.predictText}>
              Predict Yield →
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <View style={styles.grid}>
          <ActionCard
            title="Predict Yield"
            description="Get an AI-powered crop yield estimate."
            onPress={() =>
              navigation.navigate(
                "Prediction"
              )
            }
          />

          <ActionCard
            title="Analytics"
            description="View your prediction insights."
            onPress={() =>
              navigation.navigate(
                "Analytics"
              )
            }
          />

          <ActionCard
            title="Weather"
            description="Check agricultural weather information."
            onPress={() =>
              navigation.navigate(
                "Weather"
              )
            }
          />

          <ActionCard
            title="Soil"
            description="View soil-related information."
            onPress={() =>
              navigation.navigate(
                "Soil"
              )
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionCard({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
    >
      <Text style={styles.cardTitle}>
        {title}
      </Text>

      <Text style={styles.cardDescription}>
        {description}
      </Text>

      <Text style={styles.cardArrow}>
        →
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#06130d",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  small: {
    color:
      "rgba(255,255,255,0.45)",
    fontSize: 12,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 4,
  },

  logout: {
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  logoutText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  heroCard: {
    padding: 24,
    borderRadius: 26,
    backgroundColor: "#08351F",
    borderWidth: 1,
    borderColor:
      "rgba(52,211,153,0.15)",
  },

  heroLabel: {
    color: "#6EE7B7",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    lineHeight: 32,
    fontWeight: "800",
    marginTop: 12,
  },

  heroDescription: {
    color:
      "rgba(255,255,255,0.55)",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 12,
  },

  predictButton: {
    alignSelf: "flex-start",
    marginTop: 22,
    backgroundColor: "#34D399",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
  },

  predictText: {
    color: "#022C1A",
    fontSize: 13,
    fontWeight: "800",
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 32,
    marginBottom: 15,
  },

  grid: {
    gap: 12,
  },

  card: {
    padding: 20,
    borderRadius: 20,
    backgroundColor:
      "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.08)",
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  cardDescription: {
    color:
      "rgba(255,255,255,0.45)",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
    paddingRight: 25,
  },

  cardArrow: {
    position: "absolute",
    right: 18,
    top: 20,
    color: "#6EE7B7",
    fontSize: 20,
  },
});