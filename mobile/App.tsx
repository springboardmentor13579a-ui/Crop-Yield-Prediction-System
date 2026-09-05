import React, {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import {
  VideoView,
  useVideoPlayer,
} from "expo-video";

import * as SecureStore from "expo-secure-store";

import {
  NavigationContainer,
} from "@react-navigation/native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";


// ============================================================
// SCREEN SIZE
// ============================================================

const {
  width: SCREEN_WIDTH,
} = Dimensions.get("window");


// ============================================================
// API CONFIGURATION
// ============================================================
//
// Android Emulator:
// http://10.0.2.2:8000
//
// Real Android phone:
// http://YOUR-PC-IP:8000
//
// Example:
// http://192.168.1.5:8000
//
// iOS Simulator:
// http://127.0.0.1:8000
//
// ============================================================

const API_BASE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:8000"
    : "http://127.0.0.1:8000";


// ============================================================
// SECURE STORE
// ============================================================

const TOKEN_KEY = "yieldsense_access_token";


// ============================================================
// NAVIGATION TYPES
// ============================================================

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Prediction: undefined;
};


// ============================================================
// STACK
// ============================================================

const Stack =
  createNativeStackNavigator<RootStackParamList>();


// ============================================================
// LANGUAGE
// ============================================================

type Language =
  | "en"
  | "te"
  | "hi";


// ============================================================
// TRANSLATION TYPE
// ============================================================

type Translation = {
  productName: string;
  subtitle: string;

  features: string;
  howItWorks: string;
  about: string;

  signIn: string;
  dashboard: string;
  getStarted: string;

  badge: string;

  heroTitle: string;
  heroTitleAccent: string;
  heroDescription: string;

  startPredicting: string;
  explorePlatform: string;

  aiPredictions: string;
  dataInsights: string;
  smarterFarming: string;

  modelAccuracy: string;
  intelligentInsights: string;
  decisionSupport: string;

  featuresLabel: string;
  featuresTitle: string;
  featuresDescription: string;

  feature1Title: string;
  feature1Description: string;

  feature2Title: string;
  feature2Description: string;

  feature3Title: string;
  feature3Description: string;

  feature4Title: string;
  feature4Description: string;

  feature5Title: string;
  feature5Description: string;

  feature6Title: string;
  feature6Description: string;

  workflowLabel: string;
  workflowTitle: string;
  workflowDescription: string;

  step1Title: string;
  step1Description: string;

  step2Title: string;
  step2Description: string;

  step3Title: string;
  step3Description: string;

  futureLabel: string;
  futureTitle: string;
  futureDescription: string;

  getStartedYieldSense: string;

  footerTagline: string;
  rights: string;
};


// ============================================================
// TRANSLATIONS
// ============================================================

const translations: Record<
  Language,
  Translation
> = {
  en: {
    productName:
      "Crop_Yield_Prediction-AI",

    subtitle:
      "Intelligent Agriculture",

    features: "Features",

    howItWorks:
      "How it works",

    about: "About",

    signIn: "Sign in",

    dashboard:
      "Dashboard",

    getStarted:
      "Get started",

    badge:
      "AI-POWERED AGRICULTURAL INTELLIGENCE",

    heroTitle:
      "Predict better.",

    heroTitleAccent:
      "Grow smarter.",

    heroDescription:
      "Crop_Yield_Prediction-AI transforms agricultural data into intelligent crop yield predictions, helping agriculturalists make smarter decisions with confidence.",

    startPredicting:
      "Start Predicting",

    explorePlatform:
      "Explore platform",

    aiPredictions:
      "AI-powered predictions",

    dataInsights:
      "Data-driven insights",

    smarterFarming:
      "Smarter farming",

    modelAccuracy:
      "Model accuracy",

    intelligentInsights:
      "Intelligent insights",

    decisionSupport:
      "Decision support",

    featuresLabel:
      "Built for smarter agriculture",

    featuresTitle:
      "Everything you need to understand your yield.",

    featuresDescription:
      "From farm management to AI-powered predictions, YieldSenseAI brings the most important agricultural insights into one intelligent platform.",

    feature1Title:
      "AI Yield Prediction",

    feature1Description:
      "Use agricultural and environmental data to estimate crop yield before harvest.",

    feature2Title:
      "Farm Management",

    feature2Description:
      "Keep your farms, crop information and agricultural data organized in one place.",

    feature3Title:
      "Agricultural Analytics",

    feature3Description:
      "Turn prediction history and farm data into clear, useful performance insights.",

    feature4Title:
      "Weather Intelligence",

    feature4Description:
      "Understand environmental conditions that can influence agricultural performance.",

    feature5Title:
      "Soil Insights",

    feature5Description:
      "Bring soil-related information into your agricultural decision-making workflow.",

    feature6Title:
      "Prediction History",

    feature6Description:
      "Review previous predictions and track how your agricultural decisions evolve.",

    workflowLabel:
      "Simple workflow",

    workflowTitle:
      "From data to decision.",

    workflowDescription:
      "A straightforward workflow designed to turn agricultural information into useful predictions.",

    step1Title:
      "Add your farm",

    step1Description:
      "Create your farm profile and keep your agricultural information organized.",

    step2Title:
      "Enter crop data",

    step2Description:
      "Provide crop and environmental information used by the prediction model.",

    step3Title:
      "Get your prediction",

    step3Description:
      "Receive an AI-powered yield estimate and use it to support better decisions.",

    futureLabel:
      "The future of farming",

    futureTitle:
      "Make every agricultural decision with more confidence.",

    futureDescription:
      "Crop_Yield_Prediction-AI combines agricultural data, machine learning and intuitive analytics to help you understand your crops before harvest.",

    getStartedYieldSense:
      "Get started with YieldSenseAI",

    footerTagline:
      "Intelligent agriculture. Smarter decisions.",

    rights:
      "All rights reserved.",
  },

  te: {
    productName:
      "పంట_దిగుబడి_అంచనా-AI",

    subtitle:
      "తెలివైన వ్యవసాయం",

    features:
      "ఫీచర్లు",

    howItWorks:
      "ఎలా పనిచేస్తుంది",

    about:
      "మా గురించి",

    signIn:
      "సైన్ ఇన్",

    dashboard:
      "డ్యాష్‌బోర్డ్",

    getStarted:
      "ప్రారంభించండి",

    badge:
      "AI ఆధారిత వ్యవసాయ మేధస్సు",

    heroTitle:
      "మెరుగ్గా అంచనా వేయండి.",

    heroTitleAccent:
      "తెలివిగా సాగు చేయండి.",

    heroDescription:
      "Crop_Yield_Prediction-AI వ్యవసాయ డేటాను తెలివైన పంట దిగుబడి అంచనాలుగా మార్చి, వ్యవసాయదారులు మరింత నమ్మకంతో మెరుగైన నిర్ణయాలు తీసుకోవడానికి సహాయపడుతుంది.",

    startPredicting:
      "అంచనా ప్రారంభించండి",

    explorePlatform:
      "ప్లాట్‌ఫారమ్‌ను అన్వేషించండి",

    aiPredictions:
      "AI ఆధారిత అంచనాలు",

    dataInsights:
      "డేటా ఆధారిత సమాచారం",

    smarterFarming:
      "తెలివైన వ్యవసాయం",

    modelAccuracy:
      "మోడల్ ఖచ్చితత్వం",

    intelligentInsights:
      "తెలివైన సమాచారం",

    decisionSupport:
      "నిర్ణయ సహాయం",

    featuresLabel:
      "తెలివైన వ్యవసాయం కోసం రూపొందించబడింది",

    featuresTitle:
      "మీ పంట దిగుబడిని అర్థం చేసుకోవడానికి అవసరమైన ప్రతిదీ.",

    featuresDescription:
      "వ్యవసాయ నిర్వహణ నుండి AI ఆధారిత అంచనాల వరకు, YieldSenseAI ముఖ్యమైన వ్యవసాయ సమాచారాన్ని ఒకే తెలివైన ప్లాట్‌ఫారమ్‌లో అందిస్తుంది.",

    feature1Title:
      "AI దిగుబడి అంచనా",

    feature1Description:
      "పంట కోతకు ముందే దిగుబడిని అంచనా వేయడానికి వ్యవసాయ మరియు పర్యావరణ డేటాను ఉపయోగించండి.",

    feature2Title:
      "వ్యవసాయ నిర్వహణ",

    feature2Description:
      "మీ పొలాలు, పంట సమాచారం మరియు వ్యవసాయ డేటాను ఒకే చోట సక్రమంగా నిర్వహించండి.",

    feature3Title:
      "వ్యవసాయ విశ్లేషణలు",

    feature3Description:
      "అంచనా చరిత్ర మరియు పొలాల డేటాను స్పష్టమైన, ఉపయోగకరమైన పనితీరు సమాచారంగా మార్చండి.",

    feature4Title:
      "వాతావరణ మేధస్సు",

    feature4Description:
      "వ్యవసాయ పనితీరును ప్రభావితం చేసే పర్యావరణ పరిస్థితులను అర్థం చేసుకోండి.",

    feature5Title:
      "నేల సమాచారం",

    feature5Description:
      "మీ వ్యవసాయ నిర్ణయ ప్రక్రియలో నేలకు సంబంధించిన సమాచారాన్ని ఉపయోగించండి.",

    feature6Title:
      "అంచనా చరిత్ర",

    feature6Description:
      "మునుపటి అంచనాలను పరిశీలించి, మీ వ్యవసాయ నిర్ణయాలు ఎలా మారుతున్నాయో తెలుసుకోండి.",

    workflowLabel:
      "సులభమైన ప్రక్రియ",

    workflowTitle:
      "డేటా నుండి నిర్ణయం వరకు.",

    workflowDescription:
      "వ్యవసాయ సమాచారాన్ని ఉపయోగకరమైన అంచనాలుగా మార్చడానికి రూపొందించిన సరళమైన ప్రక్రియ.",

    step1Title:
      "మీ పొలాన్ని జోడించండి",

    step1Description:
      "మీ పొలం ప్రొఫైల్‌ను సృష్టించి, వ్యవసాయ సమాచారాన్ని సక్రమంగా నిర్వహించండి.",

    step2Title:
      "పంట డేటాను నమోదు చేయండి",

    step2Description:
      "అంచనా మోడల్ ఉపయోగించే పంట మరియు పర్యావరణ సమాచారాన్ని అందించండి.",

    step3Title:
      "మీ అంచనాను పొందండి",

    step3Description:
      "AI ఆధారిత దిగుబడి అంచనాను పొందండి మరియు మెరుగైన నిర్ణయాలకు ఉపయోగించండి.",

    futureLabel:
      "వ్యవసాయం యొక్క భవిష్యత్తు",

    futureTitle:
      "ప్రతి వ్యవసాయ నిర్ణయాన్ని మరింత నమ్మకంతో తీసుకోండి.",

    futureDescription:
      "Crop_Yield_Prediction-AI వ్యవసాయ డేటా, మెషిన్ లెర్నింగ్ మరియు సులభమైన విశ్లేషణలను కలిపి, పంట కోతకు ముందే మీ పంటలను అర్థం చేసుకోవడానికి సహాయపడుతుంది.",

    getStartedYieldSense:
      "YieldSenseAIతో ప్రారంభించండి",

    footerTagline:
      "తెలివైన వ్యవసాయం. మెరుగైన నిర్ణయాలు.",

    rights:
      "అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.",
  },

  hi: {
    productName:
      "फसल_उपज_पूर्वानुमान-AI",

    subtitle:
      "बुद्धिमान कृषि",

    features:
      "विशेषताएँ",

    howItWorks:
      "यह कैसे काम करता है",

    about:
      "हमारे बारे में",

    signIn:
      "साइन इन",

    dashboard:
      "डैशबोर्ड",

    getStarted:
      "शुरू करें",

    badge:
      "AI-संचालित कृषि बुद्धिमत्ता",

    heroTitle:
      "बेहतर पूर्वानुमान लगाएँ.",

    heroTitleAccent:
      "और स्मार्ट तरीके से खेती करें.",

    heroDescription:
      "Crop_Yield_Prediction-AI कृषि डेटा को बुद्धिमान फसल उपज पूर्वानुमानों में बदलता है, जिससे कृषि विशेषज्ञ अधिक आत्मविश्वास के साथ बेहतर निर्णय ले सकते हैं।",

    startPredicting:
      "पूर्वानुमान शुरू करें",

    explorePlatform:
      "प्लेटफ़ॉर्म देखें",

    aiPredictions:
      "AI-संचालित पूर्वानुमान",

    dataInsights:
      "डेटा-आधारित जानकारी",

    smarterFarming:
      "स्मार्ट खेती",

    modelAccuracy:
      "मॉडल सटीकता",

    intelligentInsights:
      "बुद्धिमान जानकारी",

    decisionSupport:
      "निर्णय सहायता",

    featuresLabel:
      "स्मार्ट कृषि के लिए बनाया गया",

    featuresTitle:
      "अपनी फसल की उपज को समझने के लिए आवश्यक सभी सुविधाएँ।",

    featuresDescription:
      "फार्म प्रबंधन से लेकर AI-संचालित पूर्वानुमानों तक, YieldSenseAI महत्वपूर्ण कृषि जानकारी को एक बुद्धिमान प्लेटफ़ॉर्म में लाता है।",

    feature1Title:
      "AI उपज पूर्वानुमान",

    feature1Description:
      "कटाई से पहले फसल की उपज का अनुमान लगाने के लिए कृषि और पर्यावरणीय डेटा का उपयोग करें।",

    feature2Title:
      "फार्म प्रबंधन",

    feature2Description:
      "अपने खेतों, फसल की जानकारी और कृषि डेटा को एक ही स्थान पर व्यवस्थित रखें।",

    feature3Title:
      "कृषि विश्लेषण",

    feature3Description:
      "पूर्वानुमान इतिहास और खेत के डेटा को स्पष्ट और उपयोगी प्रदर्शन जानकारी में बदलें।",

    feature4Title:
      "मौसम संबंधी जानकारी",

    feature4Description:
      "उन पर्यावरणीय परिस्थितियों को समझें जो कृषि प्रदर्शन को प्रभावित कर सकती हैं।",

    feature5Title:
      "मृदा जानकारी",

    feature5Description:
      "अपने कृषि निर्णय लेने की प्रक्रिया में मिट्टी से संबंधित जानकारी का उपयोग करें।",

    feature6Title:
      "पूर्वानुमान इतिहास",

    feature6Description:
      "पिछले पूर्वानुमानों की समीक्षा करें और देखें कि आपके कृषि निर्णय कैसे बदल रहे हैं।",

    workflowLabel:
      "सरल प्रक्रिया",

    workflowTitle:
      "डेटा से निर्णय तक।",

    workflowDescription:
      "कृषि जानकारी को उपयोगी पूर्वानुमानों में बदलने के लिए बनाई गई सरल प्रक्रिया।",

    step1Title:
      "अपना खेत जोड़ें",

    step1Description:
      "अपनी खेत प्रोफ़ाइल बनाएँ और अपनी कृषि जानकारी को व्यवस्थित रखें।",

    step2Title:
      "फसल डेटा दर्ज करें",

    step2Description:
      "पूर्वानुमान मॉडल द्वारा उपयोग की जाने वाली फसल और पर्यावरणीय जानकारी प्रदान करें।",

    step3Title:
      "अपना पूर्वानुमान प्राप्त करें",

    step3Description:
      "AI-संचालित उपज अनुमान प्राप्त करें और बेहतर निर्णय लेने में इसका उपयोग करें।",

    futureLabel:
      "खेती का भविष्य",

    futureTitle:
      "हर कृषि निर्णय अधिक आत्मविश्वास के साथ लें।",

    futureDescription:
      "Crop_Yield_Prediction-AI कृषि डेटा, मशीन लर्निंग और सहज विश्लेषण को जोड़कर कटाई से पहले आपकी फसलों को समझने में मदद करता है।",

    getStartedYieldSense:
      "YieldSenseAI के साथ शुरू करें",

    footerTagline:
      "बुद्धिमान कृषि। बेहतर निर्णय।",

    rights:
      "सर्वाधिकार सुरक्षित।",
  },
};


// ============================================================
// API HELPER
// ============================================================

async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const response =
    await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers: {
          "Content-Type":
            "application/json",
          ...(options.headers || {}),
        },
      }
    );

  const text =
    await response.text();

  let data: any = {};

  try {
    data =
      text ? JSON.parse(text) : {};
  } catch {
    data = {
      detail: text,
    };
  }

  if (!response.ok) {
    const message =
      typeof data?.detail === "string"
        ? data.detail
        : Array.isArray(data?.detail)
          ? data.detail
              .map(
                (item: any) =>
                  item?.msg || "Invalid input"
              )
              .join("\n")
          : data?.message ||
            "Something went wrong.";

    throw new Error(message);
  }

  return data;
}


// ============================================================
// TOKEN HELPERS
// ============================================================

async function saveToken(
  token: string
) {
  await SecureStore.setItemAsync(
    TOKEN_KEY,
    token
  );
}


async function getToken() {
  return SecureStore.getItemAsync(
    TOKEN_KEY
  );
}


async function removeToken() {
  await SecureStore.deleteItemAsync(
    TOKEN_KEY
  );
}


// ============================================================
// APP
// ============================================================

export default function App() {
  const [
    authenticated,
    setAuthenticated,
  ] = useState(false);

  const [
    checkingAuth,
    setCheckingAuth,
  ] = useState(true);


  useEffect(() => {
    checkAuthentication();
  }, []);


  async function checkAuthentication() {
    try {
      const token =
        await getToken();

      if (!token) {
        setAuthenticated(false);
        return;
      }

      await apiRequest(
        "/users/me",
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setAuthenticated(true);
    } catch {
      await removeToken();
      setAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  }


  async function handleLogout(
    navigation: any
  ) {
    await removeToken();

    setAuthenticated(false);

    navigation.reset({
      index: 0,
      routes: [
        {
          name: "Home",
        },
      ],
    });
  }


  if (checkingAuth) {
    return (
      <View
        style={
          styles.loadingScreen
        }
      >
        <ActivityIndicator
          size="large"
          color="#34D399"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading YieldSenseAI...
        </Text>
      </View>
    );
  }


  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation:
            "slide_from_right",
        }}
      >

        <Stack.Screen
          name="Home"
        >
          {(props) => (
            <HomeScreen
              {...props}
              authenticated={
                authenticated
              }
            />
          )}
        </Stack.Screen>


        <Stack.Screen
          name="Login"
        >
          {(props) => (
            <LoginScreen
              {...props}
              onLogin={() =>
                setAuthenticated(
                  true
                )
              }
            />
          )}
        </Stack.Screen>


        <Stack.Screen
          name="Register"
          component={
            RegisterScreen
          }
        />


        <Stack.Screen
          name="Dashboard"
        >
          {(props) =>
            authenticated ? (
              <DashboardScreen
                {...props}
                onLogout={() =>
                  handleLogout(
                    props.navigation
                  )
                }
              />
            ) : (
              <LoginScreen
                {...props}
                onLogin={() =>
                  setAuthenticated(
                    true
                  )
                }
              />
            )
          }
        </Stack.Screen>


        <Stack.Screen
          name="Prediction"
        >
          {(props) =>
            authenticated ? (
              <PredictionScreen
                {...props}
              />
            ) : (
              <LoginScreen
                {...props}
                onLogin={() =>
                  setAuthenticated(
                    true
                  )
                }
              />
            )
          }
        </Stack.Screen>

      </Stack.Navigator>
    </NavigationContainer>
  );
}


// ============================================================
// HOME SCREEN
// ============================================================

function HomeScreen({
  navigation,
  authenticated,
}: any) {

  const [
    language,
    setLanguage,
  ] = useState<Language>("en");

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const t =
    translations[language];


  const player =
    useVideoPlayer(
      require(
        "./assets/yieldsense-hero.mp4"
      ),
      (player) => {
        player.loop = true;
        player.muted = true;
        player.play();
      }
    );


  function goLogin() {
    setMenuOpen(false);

    navigation.navigate(
      "Login"
    );
  }


  function goRegister() {
    setMenuOpen(false);

    navigation.navigate(
      "Register"
    );
  }


  function goDashboard() {
    setMenuOpen(false);

    if (authenticated) {
      navigation.navigate(
        "Dashboard"
      );
    } else {
      navigation.navigate(
        "Login"
      );
    }
  }


  function scrollToSection(
    section: string
  ) {
    setMenuOpen(false);

    console.log(
      `Section selected: ${section}`
    );
  }


  return (
    <View
      style={styles.root}
    >

      <StatusBar
        barStyle="light-content"
        backgroundColor="#06130d"
      />


      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        bounces={false}
      >

        {/* ==================================================
            HERO
        ================================================== */}

        <View
          style={styles.hero}
        >

          <VideoView
            player={player}
            style={
              StyleSheet.absoluteFill
            }
            contentFit="cover"
          />


          <View
            style={
              styles.videoOverlay
            }
          />


          <LinearGradient
            colors={[
              "rgba(3,21,12,0.88)",
              "rgba(6,37,22,0.48)",
              "#06130d",
            ]}
            style={
              StyleSheet.absoluteFill
            }
          />


          {/* NAVBAR */}

          <SafeAreaView>

            <View
              style={
                styles.navbar
              }
            >

              <Pressable
                style={
                  styles.brandButton
                }
                onPress={() =>
                  scrollToSection(
                    "top"
                  )
                }
              >

                <View
                  style={
                    styles.logo
                  }
                >

                  <Text
                    style={
                      styles.logoText
                    }
                  >
                    ⌁
                  </Text>

                </View>


                <View>

                  <Text
                    style={
                      styles.brandName
                    }
                  >
                    {t.productName}
                  </Text>


                  <Text
                    style={
                      styles.brandSubtitle
                    }
                  >
                    {t.subtitle}
                  </Text>

                </View>

              </Pressable>


              <View
                style={
                  styles.navRight
                }
              >

                <Pressable
                  style={
                    styles.languageButton
                  }
                  onPress={() => {

                    setLanguage(
                      language === "en"
                        ? "te"
                        : language === "te"
                          ? "hi"
                          : "en"
                    );

                  }}
                >

                  <Text
                    style={
                      styles.languageText
                    }
                  >
                    {language === "en"
                      ? "EN"
                      : language === "te"
                        ? "తె"
                        : "हि"}
                  </Text>

                </Pressable>


                <Pressable
                  style={
                    styles.menuButton
                  }
                  onPress={() =>
                    setMenuOpen(
                      !menuOpen
                    )
                  }
                >

                  <Text
                    style={
                      styles.menuIcon
                    }
                  >
                    {menuOpen
                      ? "×"
                      : "☰"}
                  </Text>

                </Pressable>

              </View>

            </View>

          </SafeAreaView>


          {/* MOBILE MENU */}

          {menuOpen && (

            <View
              style={
                styles.mobileMenu
              }
            >

              <Pressable
                style={
                  styles.menuItem
                }
                onPress={() =>
                  scrollToSection(
                    "features"
                  )
                }
              >
                <Text
                  style={
                    styles.menuItemText
                  }
                >
                  {t.features}
                </Text>
              </Pressable>


              <Pressable
                style={
                  styles.menuItem
                }
                onPress={() =>
                  scrollToSection(
                    "workflow"
                  )
                }
              >
                <Text
                  style={
                    styles.menuItemText
                  }
                >
                  {t.howItWorks}
                </Text>
              </Pressable>


              <Pressable
                style={
                  styles.menuItem
                }
                onPress={() =>
                  scrollToSection(
                    "about"
                  )
                }
              >
                <Text
                  style={
                    styles.menuItemText
                  }
                >
                  {t.about}
                </Text>
              </Pressable>


              <View
                style={
                  styles.menuDivider
                }
              />


              {!authenticated && (
                <Pressable
                  style={
                    styles.menuItem
                  }
                  onPress={
                    goLogin
                  }
                >
                  <Text
                    style={
                      styles.menuItemText
                    }
                  >
                    {t.signIn}
                  </Text>
                </Pressable>
              )}


              {!authenticated && (
                <Pressable
                  style={
                    styles.menuGetStarted
                  }
                  onPress={
                    goRegister
                  }
                >
                  <Text
                    style={
                      styles.menuGetStartedText
                    }
                  >
                    {t.getStarted}
                  </Text>
                </Pressable>
              )}


              {authenticated && (
                <Pressable
                  style={
                    styles.dashboardMenuButton
                  }
                  onPress={
                    goDashboard
                  }
                >
                  <Text
                    style={
                      styles.dashboardMenuText
                    }
                  >
                    {t.dashboard}
                  </Text>
                </Pressable>
              )}

            </View>

          )}


          {/* HERO CONTENT */}

          <View
            style={
              styles.heroContent
            }
          >

            <View
              style={styles.badge}
            >

              <View
                style={
                  styles.badgeDot
                }
              />

              <Text
                style={
                  styles.badgeText
                }
              >
                {t.badge}
              </Text>

            </View>


            <Text
              style={
                styles.heroTitle
              }
            >
              {t.heroTitle}
            </Text>


            <Text
              style={
                styles.heroAccent
              }
            >
              {t.heroTitleAccent}
            </Text>


            <Text
              style={
                styles.heroDescription
              }
            >
              {t.heroDescription}
            </Text>


            <Pressable
              style={
                styles.primaryButton
              }
              onPress={
                authenticated
                  ? goDashboard
                  : goRegister
              }
            >

              <Text
                style={
                  styles.primaryButtonText
                }
              >
                {authenticated
                  ? t.dashboard
                  : t.startPredicting}
              </Text>


              <Text
                style={
                  styles.arrow
                }
              >
                →
              </Text>

            </Pressable>


            <Pressable
              style={
                styles.secondaryButton
              }
              onPress={() =>
                scrollToSection(
                  "features"
                )
              }
            >

              <Text
                style={
                  styles.secondaryButtonText
                }
              >
                {t.explorePlatform}
              </Text>


              <Text
                style={
                  styles.secondaryArrow
                }
              >
                ↓
              </Text>

            </Pressable>


            <View
              style={
                styles.trustContainer
              }
            >

              <TrustItem
                text={
                  t.aiPredictions
                }
              />

              <TrustItem
                text={
                  t.dataInsights
                }
              />

              <TrustItem
                text={
                  t.smarterFarming
                }
              />

            </View>

          </View>


          {/* STATS */}

          <View
            style={
              styles.statsContainer
            }
          >

            <Stat
              value="95%"
              label={
                t.modelAccuracy
              }
            />

            <Stat
              value="AI"
              label={
                t.intelligentInsights
              }
            />

            <Stat
              value="24/7"
              label={
                t.decisionSupport
              }
              last
            />

          </View>

        </View>


        {/* FEATURES */}

        <View
          style={styles.section}
        >

          <Text
            style={
              styles.sectionLabel
            }
          >
            {t.featuresLabel}
          </Text>


          <Text
            style={
              styles.sectionTitle
            }
          >
            {t.featuresTitle}
          </Text>


          <Text
            style={
              styles.sectionDescription
            }
          >
            {t.featuresDescription}
          </Text>


          <View
            style={
              styles.featureList
            }
          >

            <FeatureCard
              number="01"
              icon="↗"
              title={
                t.feature1Title
              }
              description={
                t.feature1Description
              }
            />

            <FeatureCard
              number="02"
              icon="⌂"
              title={
                t.feature2Title
              }
              description={
                t.feature2Description
              }
            />

            <FeatureCard
              number="03"
              icon="⌁"
              title={
                t.feature3Title
              }
              description={
                t.feature3Description
              }
            />

            <FeatureCard
              number="04"
              icon="☁"
              title={
                t.feature4Title
              }
              description={
                t.feature4Description
              }
            />

            <FeatureCard
              number="05"
              icon="⌁"
              title={
                t.feature5Title
              }
              description={
                t.feature5Description
              }
            />

            <FeatureCard
              number="06"
              icon="↻"
              title={
                t.feature6Title
              }
              description={
                t.feature6Description
              }
            />

          </View>

        </View>


        {/* WORKFLOW */}

        <View
          style={
            styles.workflowSection
          }
        >

          <Text
            style={
              styles.sectionLabel
            }
          >
            {t.workflowLabel}
          </Text>


          <Text
            style={
              styles.sectionTitle
            }
          >
            {t.workflowTitle}
          </Text>


          <Text
            style={
              styles.sectionDescription
            }
          >
            {t.workflowDescription}
          </Text>


          <View
            style={styles.steps}
          >

            <Step
              number="01"
              title={
                t.step1Title
              }
              description={
                t.step1Description
              }
            />

            <Step
              number="02"
              title={
                t.step2Title
              }
              description={
                t.step2Description
              }
            />

            <Step
              number="03"
              title={
                t.step3Title
              }
              description={
                t.step3Description
              }
            />

          </View>

        </View>


        {/* ABOUT */}

        <View
          style={
            styles.aboutSection
          }
        >

          <LinearGradient
            colors={[
              "#06351f",
              "#092218",
              "#0c2418",
            ]}
            style={
              styles.aboutCard
            }
          >

            <Text
              style={
                styles.sectionLabel
              }
            >
              {t.futureLabel}
            </Text>


            <Text
              style={
                styles.aboutTitle
              }
            >
              {t.futureTitle}
            </Text>


            <Text
              style={
                styles.aboutDescription
              }
            >
              {t.futureDescription}
            </Text>


            <Pressable
              style={
                styles.primaryButton
              }
              onPress={
                authenticated
                  ? goDashboard
                  : goRegister
              }
            >

              <Text
                style={
                  styles.primaryButtonText
                }
              >
                {authenticated
                  ? t.dashboard
                  : t.getStartedYieldSense}
              </Text>


              <Text
                style={
                  styles.arrow
                }
              >
                →
              </Text>

            </Pressable>

          </LinearGradient>

        </View>


        {/* FOOTER */}

        <View
          style={styles.footer}
        >

          <Text
            style={
              styles.footerBrand
            }
          >
            {t.productName}
          </Text>


          <Text
            style={
              styles.footerTagline
            }
          >
            {t.footerTagline}
          </Text>


          <Text
            style={styles.rights}
          >
            ©{" "}
            {new Date().getFullYear()}{" "}
            YieldSenseAI.{" "}
            {t.rights}
          </Text>

        </View>

      </ScrollView>

    </View>
  );
}


// ============================================================
// LOGIN SCREEN
// ============================================================

function LoginScreen({
  navigation,
  onLogin,
}: any) {

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);


  async function handleLogin() {

    if (!email.trim()) {
      Alert.alert(
        "Email required",
        "Please enter your email."
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


      const data =
        await apiRequest(
          "/users/login",
          {
            method: "POST",
            body: JSON.stringify({
              email:
                email
                  .trim()
                  .toLowerCase(),

              password,
            }),
          }
        );


      const token =
        data?.access_token ||
        data?.token ||
        data?.data?.access_token;


      if (!token) {
        throw new Error(
          "Login succeeded but no access token was returned by the server."
        );
      }


      await saveToken(token);


      onLogin();


      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Dashboard",
          },
        ],
      });

    } catch (error: any) {

      Alert.alert(
        "Login failed",
        error?.message ||
          "Unable to sign in."
      );

    } finally {

      setLoading(false);

    }
  }


  return (
    <View
      style={
        styles.authScreen
      }
    >

      <StatusBar
        barStyle="light-content"
        backgroundColor="#06130d"
      />


      <SafeAreaView
        style={{ flex: 1 }}
      >

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >

          <ScrollView
            contentContainerStyle={
              styles.authContent
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={
              false
            }
          >

            <Pressable
              onPress={() =>
                navigation.goBack()
              }
            >
              <Text
                style={
                  styles.authBack
                }
              >
                ← Back
              </Text>
            </Pressable>


            <View
              style={
                styles.authLogo
              }
            >
              <Text
                style={
                  styles.authLogoText
                }
              >
                ⌁
              </Text>
            </View>


            <Text
              style={
                styles.authTitle
              }
            >
              Welcome back
            </Text>


            <Text
              style={
                styles.authDescription
              }
            >
              Sign in to continue to
              your YieldSenseAI
              dashboard.
            </Text>


            <Text
              style={
                styles.authLabel
              }
            >
              Email
            </Text>


            <TextInput
              value={email}
              onChangeText={
                setEmail
              }
              placeholder="Enter your email"
              placeholderTextColor="rgba(255,255,255,0.30)"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={
                styles.authInput
              }
            />


            <Text
              style={
                styles.authLabel
              }
            >
              Password
            </Text>


            <TextInput
              value={password}
              onChangeText={
                setPassword
              }
              placeholder="Enter your password"
              placeholderTextColor="rgba(255,255,255,0.30)"
              secureTextEntry
              autoCapitalize="none"
              style={
                styles.authInput
              }
            />


            <Pressable
              style={[
                styles.authPrimaryButton,
                loading &&
                  styles.authButtonDisabled,
              ]}
              onPress={
                handleLogin
              }
              disabled={loading}
            >

              {loading ? (
                <ActivityIndicator
                  color="#022C1A"
                />
              ) : (
                <>
                  <Text
                    style={
                      styles.authPrimaryButtonText
                    }
                  >
                    Sign In
                  </Text>

                  <Text
                    style={
                      styles.authButtonArrow
                    }
                  >
                    →
                  </Text>
                </>
              )}

            </Pressable>


            <View
              style={
                styles.orContainer
              }
            >

              <View
                style={
                  styles.orLine
                }
              />

              <Text
                style={
                  styles.orText
                }
              >
                OR
              </Text>

              <View
                style={
                  styles.orLine
                }
              />

            </View>


            <Pressable
              style={
                styles.googleButton
              }
              onPress={() =>
                Alert.alert(
                  "Google Sign In",
                  "Google OAuth will be connected after the normal email/password authentication is verified."
                )
              }
            >

              <Text
                style={
                  styles.googleText
                }
              >
                G
              </Text>

              <Text
                style={
                  styles.googleButtonText
                }
              >
                Continue with Google
              </Text>

            </Pressable>


            <Pressable
              style={
                styles.authSecondaryButton
              }
              onPress={() =>
                navigation.navigate(
                  "Register"
                )
              }
              disabled={loading}
            >

              <Text
                style={
                  styles.authSecondaryText
                }
              >
                Don't have an account?{" "}
                <Text
                  style={
                    styles.authSecondaryHighlight
                  }
                >
                  Create one
                </Text>
              </Text>

            </Pressable>


            <Text
              style={
                styles.authFooter
              }
            >
              Intelligent agriculture.
              {"\n"}
              Smarter decisions.
            </Text>

          </ScrollView>

        </KeyboardAvoidingView>

      </SafeAreaView>

    </View>
  );
}


// ============================================================
// REGISTER SCREEN
// ============================================================

function RegisterScreen({
  navigation,
}: any) {

  const [
    fullName,
    setFullName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);


  async function handleRegister() {

    if (!fullName.trim()) {
      Alert.alert(
        "Name required",
        "Please enter your full name."
      );
      return;
    }


    if (!email.trim()) {
      Alert.alert(
        "Email required",
        "Please enter your email."
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
        "Weak password",
        "Password must contain at least 6 characters."
      );
      return;
    }


    if (
      password !==
      confirmPassword
    ) {
      Alert.alert(
        "Passwords do not match",
        "Please make sure both passwords are the same."
      );
      return;
    }


    try {

      setLoading(true);


      /*
       * IMPORTANT:
       *
       * This matches the UserRegister structure
       * discussed in the previous conversation:
       *
       * full_name
       * email
       * password
       */

      const data =
        await apiRequest(
          "/users/register",
          {
            method: "POST",
            body: JSON.stringify({
              full_name:
                fullName.trim(),

              email:
                email
                  .trim()
                  .toLowerCase(),

              password,
            }),
          }
        );


      /*
       * Some backends return a token immediately
       * after registration.
       *
       * If yours does, we support it.
       */

      const token =
        data?.access_token ||
        data?.token ||
        data?.data?.access_token;


      if (token) {

        await saveToken(token);

        Alert.alert(
          "Registration successful",
          "Your account has been created.",
          [
            {
              text: "Continue",
              onPress: () =>
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name:
                        "Dashboard",
                    },
                  ],
                }),
            },
          ]
        );

        return;
      }


      /*
       * If registration does not return a JWT,
       * send the user to Login.
       */

      Alert.alert(
        "Registration successful",
        "Your account has been created. Please sign in.",
        [
          {
            text: "Sign In",
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "Login",
                  },
                ],
              }),
          },
        ]
      );

    } catch (error: any) {

      Alert.alert(
        "Registration failed",
        error?.message ||
          "Unable to create your account."
      );

    } finally {

      setLoading(false);

    }
  }


  return (
    <View
      style={
        styles.authScreen
      }
    >

      <StatusBar
        barStyle="light-content"
        backgroundColor="#06130d"
      />


      <SafeAreaView
        style={{ flex: 1 }}
      >

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >

          <ScrollView
            contentContainerStyle={
              styles.authContent
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={
              false
            }
          >

            <Pressable
              onPress={() =>
                navigation.goBack()
              }
            >
              <Text
                style={
                  styles.authBack
                }
              >
                ← Back
              </Text>
            </Pressable>


            <View
              style={
                styles.authLogo
              }
            >
              <Text
                style={
                  styles.authLogoText
                }
              >
                🌱
              </Text>
            </View>


            <Text
              style={
                styles.authTitle
              }
            >
              Create Account
            </Text>


            <Text
              style={
                styles.authDescription
              }
            >
              Create your YieldSenseAI
              account and start making
              smarter agricultural
              decisions.
            </Text>


            <Text
              style={
                styles.authLabel
              }
            >
              Full Name
            </Text>


            <TextInput
              value={fullName}
              onChangeText={
                setFullName
              }
              placeholder="Enter your full name"
              placeholderTextColor="rgba(255,255,255,0.30)"
              autoCapitalize="words"
              style={
                styles.authInput
              }
            />


            <Text
              style={
                styles.authLabel
              }
            >
              Email
            </Text>


            <TextInput
              value={email}
              onChangeText={
                setEmail
              }
              placeholder="Enter your email"
              placeholderTextColor="rgba(255,255,255,0.30)"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={
                styles.authInput
              }
            />


            <Text
              style={
                styles.authLabel
              }
            >
              Password
            </Text>


            <TextInput
              value={password}
              onChangeText={
                setPassword
              }
              placeholder="Create a password"
              placeholderTextColor="rgba(255,255,255,0.30)"
              secureTextEntry
              autoCapitalize="none"
              style={
                styles.authInput
              }
            />


            <Text
              style={
                styles.authLabel
              }
            >
              Confirm Password
            </Text>


            <TextInput
              value={
                confirmPassword
              }
              onChangeText={
                setConfirmPassword
              }
              placeholder="Confirm your password"
              placeholderTextColor="rgba(255,255,255,0.30)"
              secureTextEntry
              autoCapitalize="none"
              style={
                styles.authInput
              }
            />


            <Pressable
              style={[
                styles.authPrimaryButton,
                loading &&
                  styles.authButtonDisabled,
              ]}
              onPress={
                handleRegister
              }
              disabled={loading}
            >

              {loading ? (
                <ActivityIndicator
                  color="#022C1A"
                />
              ) : (
                <>
                  <Text
                    style={
                      styles.authPrimaryButtonText
                    }
                  >
                    Create Account
                  </Text>

                  <Text
                    style={
                      styles.authButtonArrow
                    }
                  >
                    →
                  </Text>
                </>
              )}

            </Pressable>


            <View
              style={
                styles.orContainer
              }
            >

              <View
                style={
                  styles.orLine
                }
              />

              <Text
                style={
                  styles.orText
                }
              >
                OR
              </Text>

              <View
                style={
                  styles.orLine
                }
              />

            </View>


            <Pressable
              style={
                styles.googleButton
              }
              onPress={() =>
                Alert.alert(
                  "Google Sign Up",
                  "Google OAuth will be connected after the normal email/password authentication is verified."
                )
              }
            >

              <Text
                style={
                  styles.googleText
                }
              >
                G
              </Text>

              <Text
                style={
                  styles.googleButtonText
                }
              >
                Sign up with Google
              </Text>

            </Pressable>


            <Pressable
              style={
                styles.authSecondaryButton
              }
              onPress={() =>
                navigation.navigate(
                  "Login"
                )
              }
              disabled={loading}
            >

              <Text
                style={
                  styles.authSecondaryText
                }
              >
                Already have an account?{" "}
                <Text
                  style={
                    styles.authSecondaryHighlight
                  }
                >
                  Sign in
                </Text>
              </Text>

            </Pressable>


            <Text
              style={
                styles.authFooter
              }
            >
              By creating an account,
              you agree to use
              YieldSenseAI responsibly.
            </Text>

          </ScrollView>

        </KeyboardAvoidingView>

      </SafeAreaView>

    </View>
  );
}


// ============================================================
// DASHBOARD SCREEN
// ============================================================

function DashboardScreen({
  navigation,
  onLogout,
}: any) {

  const [
    user,
    setUser,
  ] = useState<any>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);


  useEffect(() => {
    loadUser();
  }, []);


  async function loadUser() {

    try {

      const token =
        await getToken();

      if (!token) {
        return;
      }


      const data =
        await apiRequest(
          "/users/me",
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      setUser(data);

    } catch {

      await removeToken();

      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Login",
          },
        ],
      });

    } finally {

      setLoading(false);

    }
  }


  if (loading) {
    return (
      <View
        style={
          styles.loadingScreen
        }
      >
        <ActivityIndicator
          size="large"
          color="#34D399"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading dashboard...
        </Text>
      </View>
    );
  }


  const userName =
    user?.full_name ||
    user?.name ||
    user?.email ||
    "Agriculturalist";


  return (
    <View
      style={
        styles.dashboardScreen
      }
    >

      <StatusBar
        barStyle="light-content"
        backgroundColor="#06130d"
      />


      <SafeAreaView
        style={{ flex: 1 }}
      >

        <ScrollView
          contentContainerStyle={
            styles.dashboardContent
          }
          showsVerticalScrollIndicator={
            false
          }
        >

          <View
            style={
              styles.dashboardHeader
            }
          >

            <View
              style={{ flex: 1 }}
            >

              <Text
                style={
                  styles.dashboardGreeting
                }
              >
                Welcome back,
              </Text>


              <Text
                style={
                  styles.dashboardTitle
                }
                numberOfLines={1}
              >
                {userName} 🌱
              </Text>

            </View>


            <Pressable
              style={
                styles.logoutButton
              }
              onPress={
                onLogout
              }
            >

              <Text
                style={
                  styles.logoutText
                }
              >
                Logout
              </Text>

            </Pressable>

          </View>


          <Text
            style={
              styles.dashboardDescription
            }
          >
            Your agricultural
            intelligence dashboard.
          </Text>


          <View
            style={
              styles.dashboardStats
            }
          >

            <DashboardStat
              value="1"
              label="Farms"
            />

            <DashboardStat
              value="1"
              label="Crops"
            />

            <DashboardStat
              value="4"
              label="Predictions"
            />

            <DashboardStat
              value="95%"
              label="Accuracy"
            />

          </View>


          <Pressable
            style={
              styles.dashboardAction
            }
            onPress={() =>
              navigation.navigate(
                "Prediction"
              )
            }
          >

            <Text
              style={
                styles.dashboardActionIcon
              }
            >
              🌾
            </Text>


            <View
              style={{
                flex: 1,
              }}
            >

              <Text
                style={
                  styles.dashboardActionTitle
                }
              >
                Predict Crop Yield
              </Text>


              <Text
                style={
                  styles.dashboardActionText
                }
              >
                Enter your farm and
                crop data to get an
                AI-powered prediction.
              </Text>

            </View>


            <Text
              style={
                styles.dashboardArrow
              }
            >
              →
            </Text>

          </Pressable>


          <View
            style={
              styles.dashboardInfoCard
            }
          >

            <Text
              style={
                styles.dashboardInfoTitle
              }
            >
              AI Agriculture
            </Text>


            <Text
              style={
                styles.dashboardInfoText
              }
            >
              Use environmental,
              crop and agricultural
              information to support
              smarter farming
              decisions.
            </Text>

          </View>


          <Pressable
            style={
              styles.dashboardSecondary
            }
            onPress={() =>
              navigation.navigate(
                "Home"
              )
            }
          >

            <Text
              style={
                styles.dashboardSecondaryText
              }
            >
              ← Back to Home
            </Text>

          </Pressable>

        </ScrollView>

      </SafeAreaView>

    </View>
  );
}


// ============================================================
// PREDICTION SCREEN
// ============================================================

function PredictionScreen({
  navigation,
}: any) {

  const [
    nitrogen,
    setNitrogen,
  ] = useState("");

  const [
    phosphorus,
    setPhosphorus,
  ] = useState("");

  const [
    potassium,
    setPotassium,
  ] = useState("");

  const [
    ph,
    setPh,
  ] = useState("");

  const [
    rainfall,
    setRainfall,
  ] = useState("");

  const [
    temperature,
    setTemperature,
  ] = useState("");

  const [
    pesticides,
    setPesticides,
  ] = useState("");

  const [
    area,
    setArea,
  ] = useState("");

  const [
    crop,
    setCrop,
  ] = useState("");

  const [
    year,
    setYear,
  ] = useState(
    String(new Date().getFullYear())
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    result,
    setResult,
  ] = useState<any>(null);


  async function handlePrediction() {

    if (
      !nitrogen ||
      !phosphorus ||
      !potassium ||
      !ph ||
      !rainfall ||
      !temperature ||
      !pesticides ||
      !area ||
      !crop ||
      !year
    ) {

      Alert.alert(
        "Missing information",
        "Please fill in all prediction fields."
      );

      return;
    }


    try {

      setLoading(true);

      setResult(null);


      const token =
        await getToken();


      if (!token) {

        Alert.alert(
          "Session expired",
          "Please sign in again."
        );

        navigation.reset({
          index: 0,
          routes: [
            {
              name: "Login",
            },
          ],
        });

        return;
      }


      /*
       * Prediction payload.
       *
       * These names should match the FastAPI
       * prediction schema used by your backend.
       */

      const payload = {
        nitrogen:
          Number(nitrogen),

        phosphorus:
          Number(phosphorus),

        potassium:
          Number(potassium),

        ph:
          Number(ph),

        rainfall:
          Number(rainfall),

        temperature:
          Number(temperature),

        pesticides:
          Number(pesticides),

        area:
          area.trim(),

        crop:
          crop.trim(),

        year:
          Number(year),
      };


      const data =
        await apiRequest(
          "/prediction/predict",
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );


      setResult(data);

    } catch (error: any) {

      Alert.alert(
        "Prediction failed",
        error?.message ||
          "Unable to generate prediction."
      );

    } finally {

      setLoading(false);

    }
  }


  return (
    <View
      style={
        styles.dashboardScreen
      }
    >

      <StatusBar
        barStyle="light-content"
        backgroundColor="#06130d"
      />


      <SafeAreaView
        style={{ flex: 1 }}
      >

        <ScrollView
          contentContainerStyle={
            styles.predictionContent
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >

          <Pressable
            onPress={() =>
              navigation.goBack()
            }
          >

            <Text
              style={
                styles.authBack
              }
            >
              ← Dashboard
            </Text>

          </Pressable>


          <Text
            style={
              styles.dashboardGreeting
            }
          >
            AI Prediction
          </Text>


          <Text
            style={
              styles.dashboardTitle
            }
          >
            Crop Yield Prediction
          </Text>


          <Text
            style={
              styles.dashboardDescription
            }
          >
            Enter your agricultural
            and environmental
            information to generate
            an AI-powered yield
            prediction.
          </Text>


          <PredictionField
            label="Nitrogen (N)"
            value={nitrogen}
            onChangeText={
              setNitrogen
            }
            keyboardType="numeric"
            placeholder="Example: 90"
          />


          <PredictionField
            label="Phosphorus (P)"
            value={phosphorus}
            onChangeText={
              setPhosphorus
            }
            keyboardType="numeric"
            placeholder="Example: 42"
          />


          <PredictionField
            label="Potassium (K)"
            value={potassium}
            onChangeText={
              setPotassium
            }
            keyboardType="numeric"
            placeholder="Example: 43"
          />


          <PredictionField
            label="pH"
            value={ph}
            onChangeText={setPh}
            keyboardType="decimal-pad"
            placeholder="Example: 6.5"
          />


          <PredictionField
            label="Rainfall"
            value={rainfall}
            onChangeText={
              setRainfall
            }
            keyboardType="decimal-pad"
            placeholder="Example: 1485"
          />


          <PredictionField
            label="Temperature"
            value={temperature}
            onChangeText={
              setTemperature
            }
            keyboardType="decimal-pad"
            placeholder="Example: 25.6"
          />


          <PredictionField
            label="Pesticides"
            value={pesticides}
            onChangeText={
              setPesticides
            }
            keyboardType="decimal-pad"
            placeholder="Example: 95.5"
          />


          <PredictionField
            label="Area / Country"
            value={area}
            onChangeText={
              setArea
            }
            placeholder="Example: Albania"
          />


          <PredictionField
            label="Crop"
            value={crop}
            onChangeText={
              setCrop
            }
            placeholder="Example: Cassava"
          />


          <PredictionField
            label="Year"
            value={year}
            onChangeText={
              setYear
            }
            keyboardType="numeric"
            placeholder="Example: 2026"
          />


          <Pressable
            style={[
              styles.primaryButton,
              styles.predictionButton,
              loading &&
                styles.authButtonDisabled,
            ]}
            onPress={
              handlePrediction
            }
            disabled={loading}
          >

            {loading ? (
              <ActivityIndicator
                color="#022C1A"
              />
            ) : (
              <>
                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  Predict Yield
                </Text>

                <Text
                  style={
                    styles.arrow
                  }
                >
                  →
                </Text>
              </>
            )}

          </Pressable>


          {result && (
            <PredictionResult
              result={result}
            />
          )}


          <Pressable
            style={
              styles.dashboardSecondary
            }
            onPress={() =>
              navigation.goBack()
            }
          >

            <Text
              style={
                styles.dashboardSecondaryText
              }
            >
              ← Back
            </Text>

          </Pressable>

        </ScrollView>

      </SafeAreaView>

    </View>
  );
}


// ============================================================
// PREDICTION RESULT
// ============================================================

function PredictionResult({
  result,
}: {
  result: any;
}) {

  const prediction =
    result?.predicted_yield ??
    result?.prediction ??
    result?.predictedYield ??
    result?.yield ??
    result?.result ??
    null;


  return (
    <View
      style={
        styles.predictionResult
      }
    >

      <Text
        style={
          styles.predictionResultLabel
        }
      >
        AI PREDICTION
      </Text>


      <Text
        style={
          styles.predictionResultTitle
        }
      >
        Predicted Crop Yield
      </Text>


      <Text
        style={
          styles.predictionResultValue
        }
      >
        {prediction !== null
          ? String(prediction)
          : "Prediction generated"}
      </Text>


      <Text
        style={
          styles.predictionResultDescription
        }
      >
        Your prediction was
        successfully generated by
        the YieldSenseAI backend.
      </Text>

    </View>
  );
}


// ============================================================
// TRUST ITEM
// ============================================================

function TrustItem({
  text,
}: {
  text: string;
}) {

  return (
    <View
      style={
        styles.trustItem
      }
    >

      <Text
        style={
          styles.check
        }
      >
        ✓
      </Text>


      <Text
        style={
          styles.trustText
        }
      >
        {text}
      </Text>

    </View>
  );
}


// ============================================================
// STAT
// ============================================================

function Stat({
  value,
  label,
  last = false,
}: {
  value: string;
  label: string;
  last?: boolean;
}) {

  return (
    <View
      style={[
        styles.stat,
        !last &&
          styles.statBorder,
      ]}
    >

      <Text
        style={
          styles.statValue
        }
      >
        {value}
      </Text>


      <Text
        style={
          styles.statLabel
        }
      >
        {label}
      </Text>

    </View>
  );
}


// ============================================================
// FEATURE CARD
// ============================================================

function FeatureCard({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: string;
  title: string;
  description: string;
}) {

  return (
    <View
      style={
        styles.featureCard
      }
    >

      <View
        style={
          styles.featureNumber
        }
      >

        <Text
          style={
            styles.featureNumberText
          }
        >
          {number}
        </Text>

      </View>


      <View
        style={
          styles.featureIcon
        }
      >

        <Text
          style={
            styles.featureIconText
          }
        >
          {icon}
        </Text>

      </View>


      <Text
        style={
          styles.featureTitle
        }
      >
        {title}
      </Text>


      <Text
        style={
          styles.featureDescription
        }
      >
        {description}
      </Text>

    </View>
  );
}


// ============================================================
// STEP
// ============================================================

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {

  return (
    <View
      style={styles.step}
    >

      <View
        style={
          styles.stepNumber
        }
      >

        <Text
          style={
            styles.stepNumberText
          }
        >
          {number}
        </Text>

      </View>


      <Text
        style={
          styles.stepTitle
        }
      >
        {title}
      </Text>


      <Text
        style={
          styles.stepDescription
        }
      >
        {description}
      </Text>

    </View>
  );
}


// ============================================================
// DASHBOARD STAT
// ============================================================

function DashboardStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {

  return (
    <View
      style={
        styles.dashboardStat
      }
    >

      <Text
        style={
          styles.dashboardStatValue
        }
      >
        {value}
      </Text>


      <Text
        style={
          styles.dashboardStatLabel
        }
      >
        {label}
      </Text>

    </View>
  );
}


// ============================================================
// PREDICTION FIELD
// ============================================================

function PredictionField({
  label,
  value,
  onChangeText,
  keyboardType,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (
    value: string
  ) => void;
  keyboardType?: any;
  placeholder: string;
}) {

  return (
    <View
      style={
        styles.predictionField
      }
    >

      <Text
        style={
          styles.predictionLabel
        }
      >
        {label}
      </Text>


      <TextInput
        value={value}
        onChangeText={
          onChangeText
        }
        keyboardType={
          keyboardType
        }
        placeholder={
          placeholder
        }
        placeholderTextColor="rgba(255,255,255,0.30)"
        style={
          styles.predictionInput
        }
        autoCapitalize="none"
      />

    </View>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({

    root: {
      flex: 1,
      backgroundColor: "#06130d",
    },


    loadingScreen: {
      flex: 1,
      backgroundColor: "#06130d",
      alignItems: "center",
      justifyContent: "center",
    },


    loadingText: {
      marginTop: 15,
      color: "rgba(255,255,255,0.6)",
      fontSize: 14,
    },


    hero: {
      minHeight: 820,
      backgroundColor: "#06130d",
      overflow: "hidden",
    },


    videoOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        "rgba(0,0,0,0.38)",
    },


    navbar: {
      minHeight: 76,
      paddingHorizontal: 18,
      paddingTop: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      borderBottomWidth: 1,
      borderBottomColor:
        "rgba(255,255,255,0.08)",
    },


    brandButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flexShrink: 1,
    },


    logo: {
      width: 42,
      height: 42,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.2)",
      backgroundColor:
        "rgba(255,255,255,0.1)",
      alignItems: "center",
      justifyContent: "center",
    },


    logoText: {
      color: "#FFFFFF",
      fontSize: 25,
      fontWeight: "700",
    },


    brandName: {
      color: "#FFFFFF",
      fontSize:
        SCREEN_WIDTH < 380
          ? 12
          : 14,
      fontWeight: "800",
      maxWidth:
        SCREEN_WIDTH - 165,
    },


    brandSubtitle: {
      marginTop: 2,
      color:
        "rgba(255,255,255,0.5)",
      fontSize: 8,
      fontWeight: "600",
      letterSpacing: 1.2,
      textTransform:
        "uppercase",
    },


    navRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },


    languageButton: {
      minWidth: 40,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        "rgba(255,255,255,0.1)",
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },


    languageText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "700",
    },


    menuButton: {
      width: 40,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        "rgba(255,255,255,0.1)",
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },


    menuIcon: {
      color: "#FFFFFF",
      fontSize: 21,
      lineHeight: 22,
    },


    mobileMenu: {
      position: "absolute",
      top: 84,
      left: 18,
      right: 18,
      zIndex: 50,
      padding: 12,
      borderRadius: 20,
      backgroundColor:
        "rgba(5,20,13,0.96)",
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.1)",
    },


    menuItem: {
      paddingVertical: 15,
      paddingHorizontal: 14,
    },


    menuItemText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "600",
    },


    menuDivider: {
      height: 1,
      backgroundColor:
        "rgba(255,255,255,0.08)",
      marginVertical: 4,
    },


    menuGetStarted: {
      marginTop: 8,
      borderRadius: 14,
      backgroundColor: "#FFFFFF",
      paddingVertical: 14,
      alignItems: "center",
    },


    menuGetStartedText: {
      color: "#06432A",
      fontSize: 14,
      fontWeight: "800",
    },


    dashboardMenuButton: {
      marginTop: 8,
      borderRadius: 14,
      backgroundColor:
        "rgba(52,211,153,0.15)",
      borderWidth: 1,
      borderColor:
        "rgba(52,211,153,0.2)",
      paddingVertical: 14,
      alignItems: "center",
    },


    dashboardMenuText: {
      color: "#6EE7B7",
      fontSize: 14,
      fontWeight: "800",
    },


    heroContent: {
      flex: 1,
      paddingHorizontal: 22,
      paddingTop: 100,
      paddingBottom: 45,
      justifyContent: "center",
    },


    badge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 30,
      borderWidth: 1,
      borderColor:
        "rgba(110,231,183,0.2)",
      backgroundColor:
        "rgba(3,45,27,0.5)",
      marginBottom: 24,
    },


    badgeDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: "#34D399",
      marginRight: 8,
    },


    badgeText: {
      color: "#A7F3D0",
      fontSize: 8,
      fontWeight: "800",
      letterSpacing: 0.8,
    },


    heroTitle: {
      color: "#FFFFFF",
      fontSize:
        SCREEN_WIDTH < 380
          ? 45
          : 51,
      lineHeight:
        SCREEN_WIDTH < 380
          ? 47
          : 53,
      fontWeight: "900",
      letterSpacing: -1.8,
    },


    heroAccent: {
      color: "#86EFAC",
      fontSize:
        SCREEN_WIDTH < 380
          ? 45
          : 51,
      lineHeight:
        SCREEN_WIDTH < 380
          ? 47
          : 53,
      fontWeight: "900",
      letterSpacing: -1.8,
    },


    heroDescription: {
      marginTop: 22,
      maxWidth: 370,
      color:
        "rgba(255,255,255,0.68)",
      fontSize: 15,
      lineHeight: 24,
    },


    primaryButton: {
      minHeight: 54,
      paddingHorizontal: 20,
      borderRadius: 16,
      backgroundColor: "#34D399",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      marginTop: 25,
    },


    primaryButtonText: {
      color: "#022C1A",
      fontSize: 14,
      fontWeight: "800",
    },


    arrow: {
      color: "#022C1A",
      fontSize: 20,
      fontWeight: "800",
    },


    secondaryButton: {
      marginTop: 12,
      minHeight: 54,
      paddingHorizontal: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.15)",
      backgroundColor:
        "rgba(255,255,255,0.08)",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },


    secondaryButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },


    secondaryArrow: {
      color: "#FFFFFF",
      fontSize: 18,
    },


    trustContainer: {
      marginTop: 25,
      gap: 10,
    },


    trustItem: {
      flexDirection: "row",
      alignItems: "center",
    },


    check: {
      color: "#34D399",
      fontSize: 14,
      fontWeight: "900",
      marginRight: 8,
    },


    trustText: {
      color:
        "rgba(255,255,255,0.55)",
      fontSize: 11,
    },


    statsContainer: {
      marginHorizontal: 18,
      marginBottom: 24,
      borderRadius: 18,
      overflow: "hidden",
      flexDirection: "row",
      backgroundColor:
        "rgba(0,0,0,0.25)",
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.1)",
    },


    stat: {
      flex: 1,
      paddingVertical: 16,
      paddingHorizontal: 8,
      alignItems: "center",
    },


    statBorder: {
      borderRightWidth: 1,
      borderRightColor:
        "rgba(255,255,255,0.1)",
    },


    statValue: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "800",
    },


    statLabel: {
      marginTop: 4,
      color:
        "rgba(255,255,255,0.5)",
      fontSize: 9,
      textAlign: "center",
    },


    section: {
      paddingHorizontal: 20,
      paddingVertical: 80,
      backgroundColor: "#06130d",
    },


    sectionLabel: {
      color: "#34D399",
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.8,
      textTransform:
        "uppercase",
    },


    sectionTitle: {
      marginTop: 14,
      color: "#FFFFFF",
      fontSize: 32,
      lineHeight: 38,
      fontWeight: "800",
      letterSpacing: -0.7,
    },


    sectionDescription: {
      marginTop: 16,
      color:
        "rgba(255,255,255,0.5)",
      fontSize: 14,
      lineHeight: 22,
    },


    featureList: {
      marginTop: 35,
      gap: 14,
    },


    featureCard: {
      position: "relative",
      padding: 22,
      borderRadius: 24,
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.08)",
      backgroundColor:
        "rgba(255,255,255,0.035)",
    },


    featureNumber: {
      position: "absolute",
      top: 17,
      right: 18,
    },


    featureNumberText: {
      color:
        "rgba(255,255,255,0.14)",
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 2,
    },


    featureIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "rgba(52,211,153,0.12)",
      backgroundColor:
        "rgba(52,211,153,0.1)",
      alignItems: "center",
      justifyContent: "center",
    },


    featureIconText: {
      color: "#6EE7B7",
      fontSize: 23,
      fontWeight: "600",
    },


    featureTitle: {
      marginTop: 20,
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "800",
    },


    featureDescription: {
      marginTop: 9,
      color:
        "rgba(255,255,255,0.45)",
      fontSize: 13,
      lineHeight: 21,
    },


    workflowSection: {
      paddingHorizontal: 20,
      paddingVertical: 80,
      backgroundColor: "#081A11",
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor:
        "rgba(255,255,255,0.05)",
    },


    steps: {
      marginTop: 40,
      gap: 38,
    },


    step: {
      paddingBottom: 8,
    },


    stepNumber: {
      width: 54,
      height: 54,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "rgba(52,211,153,0.15)",
      backgroundColor:
        "rgba(52,211,153,0.1)",
      alignItems: "center",
      justifyContent: "center",
    },


    stepNumberText: {
      color: "#6EE7B7",
      fontSize: 13,
      fontWeight: "800",
    },


    stepTitle: {
      marginTop: 18,
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "800",
    },


    stepDescription: {
      marginTop: 9,
      color:
        "rgba(255,255,255,0.45)",
      fontSize: 13,
      lineHeight: 21,
    },


    aboutSection: {
      paddingHorizontal: 18,
      paddingVertical: 70,
      backgroundColor: "#06130d",
    },


    aboutCard: {
      padding: 27,
      borderRadius: 30,
      borderWidth: 1,
      borderColor:
        "rgba(52,211,153,0.12)",
      overflow: "hidden",
    },


    aboutTitle: {
      marginTop: 17,
      color: "#FFFFFF",
      fontSize: 31,
      lineHeight: 38,
      fontWeight: "800",
      letterSpacing: -0.7,
    },


    aboutDescription: {
      marginTop: 17,
      color:
        "rgba(255,255,255,0.5)",
      fontSize: 14,
      lineHeight: 22,
    },


    footer: {
      paddingHorizontal: 20,
      paddingVertical: 38,
      backgroundColor: "#040D08",
      borderTopWidth: 1,
      borderTopColor:
        "rgba(255,255,255,0.05)",
    },


    footerBrand: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
    },


    footerTagline: {
      marginTop: 5,
      color:
        "rgba(255,255,255,0.4)",
      fontSize: 11,
    },


    rights: {
      marginTop: 24,
      color:
        "rgba(255,255,255,0.3)",
      fontSize: 10,
    },


    // ========================================================
    // AUTHENTICATION
    // ========================================================

    authScreen: {
      flex: 1,
      backgroundColor: "#06130d",
    },


    authContent: {
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 60,
    },


    authBack: {
      color:
        "rgba(255,255,255,0.65)",
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 35,
    },


    authLogo: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor:
        "rgba(52,211,153,0.1)",
      borderWidth: 1,
      borderColor:
        "rgba(52,211,153,0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },


    authLogoText: {
      fontSize: 30,
    },


    authTitle: {
      color: "#FFFFFF",
      fontSize: 36,
      lineHeight: 42,
      fontWeight: "900",
      letterSpacing: -1,
    },


    authDescription: {
      marginTop: 12,
      color:
        "rgba(255,255,255,0.52)",
      fontSize: 14,
      lineHeight: 22,
      maxWidth: 360,
      marginBottom: 30,
    },


    authLabel: {
      color:
        "rgba(255,255,255,0.82)",
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 8,
      marginTop: 15,
    },


    authInput: {
      height: 55,
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.10)",
      backgroundColor:
        "rgba(255,255,255,0.045)",
      color: "#FFFFFF",
      paddingHorizontal: 16,
      fontSize: 14,
    },


    authPrimaryButton: {
      minHeight: 56,
      marginTop: 25,
      borderRadius: 17,
      backgroundColor: "#34D399",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },


    authButtonDisabled: {
      opacity: 0.55,
    },


    authPrimaryButtonText: {
      color: "#022C1A",
      fontSize: 15,
      fontWeight: "900",
    },


    authButtonArrow: {
      color: "#022C1A",
      fontSize: 20,
      fontWeight: "900",
    },


    orContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 22,
    },


    orLine: {
      flex: 1,
      height: 1,
      backgroundColor:
        "rgba(255,255,255,0.08)",
    },


    orText: {
      marginHorizontal: 14,
      color:
        "rgba(255,255,255,0.30)",
      fontSize: 10,
      fontWeight: "700",
    },


    googleButton: {
      minHeight: 54,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.10)",
      backgroundColor:
        "rgba(255,255,255,0.045)",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },


    googleText: {
      width: 25,
      height: 25,
      borderRadius: 13,
      backgroundColor: "#FFFFFF",
      color: "#4285F4",
      fontSize: 17,
      fontWeight: "900",
      textAlign: "center",
      lineHeight: 25,
    },


    googleButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },


    authSecondaryButton: {
      minHeight: 54,
      marginTop: 14,
      alignItems: "center",
      justifyContent: "center",
    },


    authSecondaryText: {
      color:
        "rgba(255,255,255,0.65)",
      fontSize: 14,
      textAlign: "center",
    },


    authSecondaryHighlight: {
      color: "#6EE7B7",
      fontWeight: "800",
    },


    authFooter: {
      marginTop: 35,
      color:
        "rgba(255,255,255,0.25)",
      fontSize: 11,
      lineHeight: 18,
      textAlign: "center",
    },


    // ========================================================
    // DASHBOARD
    // ========================================================

    dashboardScreen: {
      flex: 1,
      backgroundColor: "#06130d",
    },


    dashboardContent: {
      paddingHorizontal: 20,
      paddingTop: 25,
      paddingBottom: 50,
    },


    dashboardHeader: {
      flexDirection: "row",
      alignItems: "center",
    },


    dashboardGreeting: {
      color: "#34D399",
      fontSize: 13,
      fontWeight: "700",
    },


    dashboardTitle: {
      marginTop: 5,
      color: "#FFFFFF",
      fontSize: 30,
      fontWeight: "900",
    },


    dashboardDescription: {
      marginTop: 10,
      color:
        "rgba(255,255,255,0.5)",
      fontSize: 14,
      lineHeight: 22,
    },


    logoutButton: {
      paddingHorizontal: 13,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.1)",
      backgroundColor:
        "rgba(255,255,255,0.04)",
    },


    logoutText: {
      color:
        "rgba(255,255,255,0.65)",
      fontSize: 12,
      fontWeight: "700",
    },


    dashboardStats: {
      marginTop: 30,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },


    dashboardStat: {
      width:
        (SCREEN_WIDTH - 52) / 2,
      padding: 20,
      borderRadius: 20,
      backgroundColor:
        "rgba(255,255,255,0.04)",
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.08)",
    },


    dashboardStatValue: {
      color: "#6EE7B7",
      fontSize: 28,
      fontWeight: "900",
    },


    dashboardStatLabel: {
      marginTop: 5,
      color:
        "rgba(255,255,255,0.5)",
      fontSize: 12,
    },


    dashboardAction: {
      marginTop: 30,
      padding: 20,
      borderRadius: 22,
      backgroundColor:
        "rgba(52,211,153,0.1)",
      borderWidth: 1,
      borderColor:
        "rgba(52,211,153,0.18)",
      flexDirection: "row",
      alignItems: "center",
      gap: 15,
    },


    dashboardActionIcon: {
      fontSize: 32,
    },


    dashboardActionTitle: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "800",
    },


    dashboardActionText: {
      marginTop: 5,
      color:
        "rgba(255,255,255,0.45)",
      fontSize: 12,
      lineHeight: 18,
    },


    dashboardArrow: {
      color: "#6EE7B7",
      fontSize: 24,
      fontWeight: "800",
    },


    dashboardInfoCard: {
      marginTop: 18,
      padding: 20,
      borderRadius: 22,
      backgroundColor:
        "rgba(255,255,255,0.035)",
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.08)",
    },


    dashboardInfoTitle: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "800",
    },


    dashboardInfoText: {
      marginTop: 8,
      color:
        "rgba(255,255,255,0.45)",
      fontSize: 13,
      lineHeight: 21,
    },


    dashboardSecondary: {
      marginTop: 18,
      minHeight: 52,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.1)",
      alignItems: "center",
      justifyContent: "center",
    },


    dashboardSecondaryText: {
      color:
        "rgba(255,255,255,0.7)",
      fontSize: 14,
      fontWeight: "700",
    },


    // ========================================================
    // PREDICTION
    // ========================================================

    predictionContent: {
      paddingHorizontal: 20,
      paddingTop: 25,
      paddingBottom: 60,
    },


    predictionField: {
      marginTop: 18,
    },


    predictionLabel: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 8,
    },


    predictionInput: {
      height: 54,
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.10)",
      backgroundColor:
        "rgba(255,255,255,0.04)",
      color: "#FFFFFF",
      paddingHorizontal: 16,
      fontSize: 14,
    },


    predictionButton: {
      marginTop: 30,
    },


    predictionResult: {
      marginTop: 25,
      padding: 24,
      borderRadius: 24,
      backgroundColor:
        "rgba(52,211,153,0.09)",
      borderWidth: 1,
      borderColor:
        "rgba(52,211,153,0.20)",
    },


    predictionResultLabel: {
      color: "#34D399",
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 1.5,
    },


    predictionResultTitle: {
      marginTop: 10,
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "800",
    },


    predictionResultValue: {
      marginTop: 15,
      color: "#86EFAC",
      fontSize: 32,
      fontWeight: "900",
    },


    predictionResultDescription: {
      marginTop: 8,
      color:
        "rgba(255,255,255,0.5)",
      fontSize: 12,
      lineHeight: 19,
    },

  });