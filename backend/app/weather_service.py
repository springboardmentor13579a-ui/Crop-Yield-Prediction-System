import httpx
from fastapi import HTTPException
from .config import settings


def search_location(query: str) -> list[dict]:
    try:
        with httpx.Client(timeout=12.0) as client:
            r = client.get(settings.geocoding_base_url, params={"name": query, "count": 6, "language": "en", "format": "json"})
            r.raise_for_status()
            data = r.json()
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Location service unavailable: {exc}")
    results = []
    for item in data.get("results", []) or []:
        label_parts = [item.get("name"), item.get("admin1"), item.get("country")]
        results.append({
            "name": item.get("name"),
            "state": item.get("admin1"),
            "country": item.get("country"),
            "latitude": item.get("latitude"),
            "longitude": item.get("longitude"),
            "timezone": item.get("timezone"),
            "label": ", ".join([x for x in label_parts if x]),
        })
    return results


def current_weather(latitude: float, longitude: float) -> dict:
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "timezone": "auto",
        "current": ",".join([
            "temperature_2m", "relative_humidity_2m", "apparent_temperature",
            "precipitation", "weather_code", "wind_speed_10m",
            "soil_temperature_0cm", "soil_moisture_0_to_1cm",
        ]),
        "daily": ",".join([
            "temperature_2m_max", "temperature_2m_min", "precipitation_sum",
            "precipitation_probability_max", "et0_fao_evapotranspiration",
        ]),
        "forecast_days": 7,
    }
    try:
        with httpx.Client(timeout=15.0) as client:
            r = client.get(settings.weather_base_url, params=params)
            r.raise_for_status()
            data = r.json()
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Weather service unavailable: {exc}")
    current = data.get("current", {}) or {}
    daily = data.get("daily", {}) or {}
    days = []
    times = daily.get("time", []) or []
    for i, day in enumerate(times):
        days.append({
            "date": day,
            "temp_max": (daily.get("temperature_2m_max") or [None] * len(times))[i],
            "temp_min": (daily.get("temperature_2m_min") or [None] * len(times))[i],
            "precipitation": (daily.get("precipitation_sum") or [None] * len(times))[i],
            "rain_probability": (daily.get("precipitation_probability_max") or [None] * len(times))[i],
            "et0": (daily.get("et0_fao_evapotranspiration") or [None] * len(times))[i],
        })
    return {
        "timezone": data.get("timezone"),
        "current": current,
        "daily": days,
        "source": "Open-Meteo",
    }
