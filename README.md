# YieldSense AI

YieldSense AI is a farmer-facing crop yield forecasting application with React + FastAPI.

## Current ML model

The previous CatBoost `.cbm` models have been removed.

The application now uses:

`backend/models/crop_yield_prediction_model.pkl`

This is the supplied **Random Forest regression pipeline**.

### Model target

`Yield`

### Model input features

- Year
- State
- Crop
- Season
- Area
- Annual_Rainfall
- Fertilizer
- Pesticide
- Rainfall_per_Area
- Fertilizer_per_Area
- Pesticide_per_Area
- Year_Index

`Production` is deliberately NOT sent to the model because it can leak information about the target yield.

## Dataset

The application loads the India Crop Yield Prediction dataset online from:

`dhyann2815/india-crop-yield-prediction`

The dataset provides Year, State, Crop, Season, Area, Production, Annual_Rainfall, Fertilizer, Pesticide and Yield.

The backend combines the Hugging Face train and test splits for dropdown options and historical context. If Hugging Face is temporarily unavailable, it falls back to `backend/data/crop_yield.csv`.

## Prediction flow

1. Farmer logs in.
2. Farmer opens **Yield forecast**.
3. Farmer enters year, crop, state, season, area, rainfall, fertilizer and pesticide.
4. Backend creates the engineered features required by the saved Random Forest pipeline.
5. Random Forest predicts Yield.
6. Production is calculated as `predicted_yield × area`.
7. The decision layer compares predicted yield with the historical median for the selected crop/state/season.
8. Forecast is saved to the farmer account.

## Backend

From the `backend` folder:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API:

`http://127.0.0.1:8000`

Swagger:

`http://127.0.0.1:8000/docs`

## Frontend

From the `frontend` folder:

```bash
npm install
npm run dev
```

Frontend:

`http://localhost:5173`

If the API runs on another URL, create `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

## Important model compatibility note

The supplied `.pkl` was created with scikit-learn 1.6.1. The backend requirements therefore pin:

`scikit-learn==1.6.1`

Install the backend requirements before starting FastAPI.

## Main API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/meta/options`
- `POST /api/forecasts`
- `GET /api/forecasts/me`
- `GET /api/analytics/me`
- `GET /api/farms`
- `GET /api/soil/records/me`
- `GET /api/weather/history/me`
- `GET /api/recommendations/me`

## Model file location

```text
backend/
└── models/
    ├── crop_yield_prediction_model.pkl
    └── model_metadata.json
```

No `.cbm` model is required.


## Random Forest deployment fix

The yield forecasting API uses `backend/models/crop_yield_prediction_model.pkl`.
This deployment bundle contains a scikit-learn 1.8.0-compatible Random Forest pipeline.

Run the backend with the dependencies in `backend/requirements.txt`.
The browser frontend defaults to `http://localhost:8000`, and FastAPI allows both
`http://localhost:5173` and `http://127.0.0.1:5173`.

Forecast endpoint:
`POST /api/forecasts`

The model inputs are:
Year, State, Crop, Season, Area, Annual_Rainfall, Fertilizer, Pesticide,
Rainfall_per_Area, Fertilizer_per_Area, Pesticide_per_Area, Year_Index.

Production is calculated after prediction as `predicted_yield * area`.
Production is not passed into the model.

## Risk Assessment & Downloadable Reports

The farmer dashboard now includes a **Risk reports** module. Every saved yield forecast is enriched on read with a transparent 0–100 decision-support risk score based on:

- forecasted yield vs comparable historical median yield
- rainfall deviation from comparable historical conditions
- fertilizer-per-area deviation
- pesticide-per-area deviation
- extra uncertainty when the requested forecast year is outside the historical dataset period

The assessment returns a risk level, factor breakdown, crop-aware immediate next step, prioritized next actions, and a disclaimer explaining that the score is not a probability of crop failure.

New/extended API routes:

- `POST /api/forecasts` — now returns yield prediction + risk assessment
- `GET /api/forecasts/me` — saved forecasts enriched with current risk assessment
- `GET /api/forecasts/{forecast_id}/report` — complete structured risk report
- `GET /api/forecasts/{forecast_id}/report/download` — authenticated downloadable HTML report
- `GET /api/analytics/me` — now also returns `average_risk` and `high_risk_count`

The downloadable HTML report can be opened in any browser and printed/saved as PDF using the browser print dialog.
