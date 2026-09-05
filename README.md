# 🌾 YieldSense AI — AI-Powered Crop Yield Prediction & Agricultural Intelligence Platform

> **Full-Stack AI Platform** · React + FastAPI + MongoDB · Machine Learning

**YieldSense AI** is a full-stack agricultural intelligence platform designed to help farmers make informed, data-driven decisions instead of relying only on traditional experience or assumptions.

The platform combines **crop yield prediction, soil health analysis, real-time weather intelligence, crop recommendation, agricultural risk assessment, analytics, reporting, and agricultural officer support** into a single web application.

The objective is simple:

> **Turn agricultural data into predictions, recommendations, insights, and better farming decisions.**

---

## What This Project Actually Does

Farmers can use YieldSense AI to:

- **Predict crop yield** using a trained Machine Learning regression model.
- **Analyze soil health** using Nitrogen, Phosphorus, Potassium and pH values.
- **Monitor current weather** for a selected city using real-time weather data.
- **Get AI-based crop recommendations** based on soil and environmental conditions.
- **Assess agricultural risk** using an Isolation Forest anomaly detection model.
- **View analytics dashboards** containing agricultural and prediction insights.
- **Generate productivity and seasonal reports**.
- **Track prediction information** for future reference.
- **Contact agricultural officers** and request expert advice.
- **Manage users and platform activity** through administrator functionality.

---

## 🎯 Problem Statement

Traditionally, farmers may depend on previous experience, neighbouring farmers, or general assumptions when deciding:

- Which crop should be planted?
- What yield can be expected?
- Is the soil suitable?
- How are current weather conditions affecting agriculture?
- Are the current conditions creating agricultural risks?
- What actions can improve productivity?

These decisions become difficult when soil conditions, weather, crop requirements and agricultural environments vary.

### Proposed Solution

YieldSense AI integrates agricultural data, Machine Learning, weather information, analytics and expert guidance into one platform.

```text
Farmer
   │
   ▼
Login / Registration
   │
   ▼
Select State
   │
   ├──────────────► Soil Analysis
   │
   ▼
Enter City
   │
   ├──────────────► Weather Intelligence
   │
   ▼
Select Crop
   │
   ▼
Crop Yield Prediction
   │
   ├──────────────► Crop Recommendation
   │
   ├──────────────► Risk Assessment
   │
   ├──────────────► Analytics
   │
   └──────────────► Reports
                  │
                  ▼
        Agricultural Officer AdviceKey Features
🌾 Crop Yield Prediction

The platform uses a trained Random Forest Regression model to estimate crop yield.

Prediction inputs include:

Area
Crop
Year
Rainfall
Pesticides
Temperature

The prediction result is returned by the FastAPI backend and can be stored for historical analysis.

Prediction Workflow
Farmer Inputs
      ↓
React Frontend
      ↓
FastAPI REST API
      ↓
Feature Preparation
      ↓
Random Forest Regression
      ↓
Predicted Yield
      ↓
MongoDB Storage
      ↓
Dashboard / Analytics / Reports
🌱 Soil Health Analysis

The farmer enters a state and the system retrieves/analyzes the available soil information.

The soil module evaluates:

Nitrogen (N)
Phosphorus (P)
Potassium (K)
Soil pH

The result provides:

Soil Health Score
Nutrient status
Fertilizer recommendation
Suitable crops
Soil improvement advice
Example
State       : Tamil Nadu
Nitrogen    : 80
Phosphorus  : 38
Potassium   : 30
pH          : 6.6
Soil Score  : 85/100
🌦 Weather Intelligence

Current weather conditions are retrieved for the selected city using the OpenWeather API.

The platform displays:

Temperature
Humidity
Rainfall
Wind speed
Cloud cover
Atmospheric pressure
Weather condition
Weather description

The application also provides basic farming guidance based on current conditions.

🤖 AI Crop Recommendation

The crop recommendation module uses a trained Machine Learning model.

Input Features
N
P
K
Temperature
Humidity
pH
Rainfall

The model provides:

Recommended crop
Top crop recommendations
Confidence values
Recommendation Workflow
Soil Data
    +
Weather Data
    ↓
Machine Learning Model
    ↓
Crop Prediction
    ↓
Top Recommendations
    ↓
Farmer Decision Support
⚠️ Agricultural Risk Assessment

YieldSense AI includes an anomaly-based agricultural risk assessment system using Isolation Forest.

The model evaluates the combined agricultural conditions and identifies whether the current combination resembles patterns learned during model training.

Risk Inputs
State
Crop
Nitrogen
Phosphorus
Potassium
pH
Temperature
Humidity
Rainfall
Wind
Predicted Yield
Risk Outputs
AI Risk Score
Overall Risk Level
Normal / Anomalous classification
Model information
Assessment profile
Detailed model inputs
Risk Workflow
Soil Conditions
       +
Weather Conditions
       +
Selected Crop
       +
Predicted Yield
       ↓
Feature Preparation
       ↓
Standardization
       ↓
Isolation Forest
       ↓
Anomaly Detection
       ↓
AI Risk Score
       ↓
LOW / MEDIUM / HIGH
📊 Agricultural Analytics

YieldSense AI provides interactive analytics dashboards to help users understand agricultural and prediction data.

Analytics include:

Total predictions
Soil analyses
Average predicted yield
Highest predicted yield
Prediction trends
Environmental input visualization
Yield visualization
Prediction history
Role-specific statistics

Interactive charts are implemented to make agricultural information easier to understand.

📈 Productivity & Seasonal Reports

The platform includes reporting functionality for agricultural analysis.

Productivity Reports

Reports can provide information such as:

Prediction counts
Average yield
Highest predicted yield
Crop performance
Historical productivity patterns
Seasonal Reports

Seasonal analysis can be used to study:

Yield trends
Seasonal comparisons
Crop-season patterns
Agricultural productivity
👨‍🌾 Agricultural Officer Advice

YieldSense AI combines AI-based decision support with human agricultural guidance.

Advice Workflow
Farmer
   ↓
View Agricultural Officers
   ↓
Select Officer
   ↓
Submit Question
   ↓
Advice Request
   ↓
MongoDB
   ↓
Officer Dashboard
   ↓
Officer Reply
   ↓
Farmer Receives Advice

This allows farmers to combine Machine Learning insights with expert agricultural guidance.

🔐 Authentication & Role-Based Access

The application supports role-specific workflows.

Role	Responsibilities
👨‍🌾 Farmer	Prediction, soil, weather, recommendation, risk, analytics, reports and advice
🧑‍💼 Agricultural Officer	Monitor farmer requests and provide agricultural guidance
🛡️ Administrator	Manage users and monitor platform activity

Authentication functionality includes:

Registration
Login
Google authentication
User management
Role-based access
🏗️ System Architecture
                         ┌──────────────────┐
                         │      Farmer      │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ React + Vite     │
                         │ Frontend         │
                         └────────┬─────────┘
                                  │
                             REST API
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ FastAPI Backend  │
                         └────────┬─────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
   ┌─────────────┐        ┌──────────────┐        ┌─────────────┐
   │   MongoDB   │        │ ML Services  │        │ OpenWeather │
   │   Database  │        │              │        │     API     │
   └─────────────┘        └───────┬──────┘        └─────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
              Yield Model   Recommendation   Risk Model
              Random Forest     Model       Isolation Forest
🧠 Machine Learning Workflow

The project contains separate Machine Learning workflows for different agricultural tasks.

Raw Agricultural Data
        ↓
Data Cleaning
        ↓
Data Preprocessing
        ↓
Feature Preparation
        ↓
Model Training
        ↓
Model Evaluation
        ↓
Model Persistence
        ↓
FastAPI Integration
        ↓
React Dashboard
ML Modules

The backend contains dedicated modules for:

Crop yield prediction
Model evaluation
Crop recommendation
Recommendation prediction
Soil analysis
Agricultural risk prediction
Risk model training
1. Yield Prediction Model

Algorithm: Random Forest Regressor

Area
Crop
Year
Rainfall
Pesticides
Temperature
        ↓
Random Forest
        ↓
Predicted Yield
2. Crop Recommendation Model

Algorithm: Machine Learning Classification Model

N + P + K
+ Temperature
+ Humidity
+ pH
+ Rainfall
        ↓
Classification Model
        ↓
Recommended Crop
        ↓
Top-N Recommendations
3. Risk Assessment Model

Algorithm: Isolation Forest

Soil + Weather + Crop + Yield
             ↓
       StandardScaler
             ↓
       Isolation Forest
             ↓
      Anomaly Detection
             ↓
        Risk Score
🛠️ Technology Stack
Layer	Technology	Purpose
Frontend	React.js	User interface
Build Tool	Vite	Frontend development and build
Routing	React Router	Page navigation
Styling	CSS	Responsive UI design
Icons	React Icons	UI icons
Visualization	Recharts	Analytics charts
Backend	Python + FastAPI	REST API services
API Server	Uvicorn	ASGI server
Validation	Pydantic	Request/response validation
Database	MongoDB	Persistent data storage
Database Drivers	PyMongo + Motor	MongoDB communication
Machine Learning	Scikit-learn	ML models
Data Processing	Pandas + NumPy	Data preparation
Model Persistence	Joblib	Save/load trained models
Weather	OpenWeather API	Real-time weather information
Authentication	JWT	User authentication
Version Control	Git + GitHub	Source control
Containerization	Docker + Docker Compose	Deployment
📂 Project Structure
Crop-Yield-Prediction-Mahija-Sai-/
│
├── backend/
│   ├── app/
│   │   ├── config/
│   │   ├── database/
│   │   ├── models/
│   │   ├── routers/
│   │   │   ├── admin.py
│   │   │   ├── advice.py
│   │   │   ├── analytics.py
│   │   │   ├── auth.py
│   │   │   ├── prediction.py
│   │   │   ├── recommendation.py
│   │   │   ├── report.py
│   │   │   ├── risk.py
│   │   │   ├── soil.py
│   │   │   └── users.py
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── ml/
│   │   ├── predictor.py
│   │   ├── soil_predictor.py
│   │   ├── recommendation_model.py
│   │   ├── recommendation_predictor.py
│   │   ├── risk_predictor.py
│   │   ├── evaluate_model.py
│   │   ├── train_model.py
│   │   └── train_risk_model.py
│   │
│   ├── models/
│   ├── requirements.txt
│   └── Dockerfile
│
├── database/
│
├── datasets/
│   ├── raw/
│   ├── processed/
│   └── notebooks/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── layout/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── styles/
│   │
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── docker-compose.yml
├── .gitignore
└── README.md
🔌 API Endpoints Reference
Method	Endpoint	Description
POST	/auth/register	Register a user
POST	/auth/login	User login
POST	/auth/google	Google authentication
GET	/users	Get users
POST	/users	Add a user
GET	/users/{id}	Get a user
PUT	/users/{id}	Update a user
DELETE	/users/{id}	Delete a user
POST	/prediction/predict	Generate crop yield prediction
GET	/prediction/latest	Get latest prediction
POST	/soil/analyze	Analyze soil conditions
GET	/soil/latest	Get latest soil analysis
GET	/soil/all	Get soil records
POST	/recommendation/generate	Generate crop recommendations
POST	/risk/assess	Assess agricultural risk
GET	/analytics/dashboard	Get dashboard analytics
GET	/report/latest	Get latest report
GET	/advice/officers	Get agricultural officers
POST	/advice/request	Submit advice request
GET	/advice/farmer/{email}	Get farmer advice requests
GET	/advice/officer/{email}	Get officer requests
PUT	/advice/reply/{request_id}	Reply to advice request
GET	/admin/stats	Get administrator statistics

Full interactive API documentation is available through FastAPI Swagger UI.

http://127.0.0.1:8000/docs
🗄️ Database Integration

MongoDB is used for persistent storage of application information.

The system can store:

User information
Farmer information
Prediction records
Soil analyses
Advice requests
Agricultural analytics data
Report-related information

MongoDB communication is handled through PyMongo and Motor.

🌦 Weather Integration

Weather information is retrieved through the OpenWeather API.

The system obtains current weather information including:

Temperature
Humidity
Rainfall
Wind Speed
Cloud Cover
Pressure
Weather Condition

The API key is kept outside the repository using environment variables.

📊 Dashboard Modules
👨‍🌾 Farmer Dashboard

Farmers can access:

Crop yield prediction
Soil analysis
Weather intelligence
Crop recommendation
Risk assessment
Prediction history
Analytics
Reports
Agricultural officer advice
🧑‍💼 Agricultural Officer Dashboard

Officers can:

View farmer-related requests
Monitor agricultural information
Review advice requests
Provide agricultural guidance
Access officer analytics
🛡️ Admin Dashboard

Administrators can:

Manage users
View platform statistics
Monitor registrations
Manage farmer accounts
Review system activity
Access analytics
🔄 End-to-End Application Workflow
                         Farmer
                            │
                            ▼
                    Registration / Login
                            │
                            ▼
                      Dashboard
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
      Soil Analysis      Weather          Crop Input
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
                    Yield Prediction
                            │
                  ┌─────────┴─────────┐
                  ▼                   ▼
           Recommendation        Risk Assessment
                  │                   │
                  └─────────┬─────────┘
                            ▼
                   Analytics & Reports
                            │
                            ▼
                    Officer Assistance
🧪 Testing & Validation

The project includes validation of the major Machine Learning and application components.

Yield Model
python -c "from ml.predictor import predict_yield; print('Yield model loaded successfully')"
Recommendation Model
python -c "from ml.recommendation_predictor import recommend_crops; print('Recommendation model loaded successfully')"
Risk Model
python -c "from ml.risk_predictor import predict_risk; print('Risk model loaded successfully')"
Frontend Production Build
npm run build
API Testing

FastAPI Swagger UI provides an interactive interface for testing the backend endpoints.

http://127.0.0.1:8000/docs
🐳 Docker & Deployment

The application includes Docker configuration for containerized deployment.

Architecture
                  Docker Compose
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
     Frontend       Backend       MongoDB
      React         FastAPI       Database
Start Services
docker compose up --build
Stop Services
docker compose down

Docker provides a reproducible environment for running the frontend, backend and database together.
Machine Learning Artifacts

The repository contains the trained artifacts required by the recommendation and risk workflows.

The large crop-yield prediction model is intentionally excluded from normal Git tracking because of its file size.

The repository retains the relevant training and inference code so that the model can be reproduced or supplied separately for deployment.

🎯 Project Outcomes

YieldSense AI demonstrates an end-to-end integration of:

Full-stack web development
REST API development
Machine Learning
MongoDB database integration
Real-time weather integration
Soil intelligence
Crop recommendation
Agricultural risk assessment
Data visualization
Productivity analytics
Seasonal reporting
Authentication
Role-based access
Agricultural officer communication
Docker-based deployment preparation

The platform demonstrates how agricultural data can be transformed into practical decision-support information through an integrated AI-enabled web application.

🔮 Future Enhancements

Future versions can include:

🛰️ Satellite and remote-sensing integration
📡 IoT-based soil sensors
🌿 Crop disease detection using images
🌦 Advanced weather forecasting
💧 Smart irrigation recommendations
🧪 Fertilizer quantity optimization
🌐 Multilingual farmer support
📱 Mobile application
🤖 Agricultural AI chatbot
🔔 Smart alerts and notifications
☁️ Cloud-based production deployment
🔍 Explainable AI