def build_recommendations(latest_forecast=None, latest_soil=None, latest_weather=None) -> list[dict]:
    items = []

    if latest_forecast:
        area = max(float(latest_forecast.area), 1e-9)
        fert_rate = float(latest_forecast.fertilizer) / area
        pest_rate = float(latest_forecast.pesticide) / area
        rain_ref = latest_forecast.historical_rainfall_median
        fert_ref = latest_forecast.historical_fertilizer_rate_median
        pest_ref = latest_forecast.historical_pesticide_rate_median
        yield_ref = latest_forecast.historical_yield_median

        if rain_ref and latest_forecast.annual_rainfall < 0.8 * rain_ref:
            items.append({"category": "Water", "priority": "high", "title": "Rainfall is below the comparable historical level", "detail": "Review irrigation scheduling, field moisture and water-conservation measures for this crop and season."})
        elif rain_ref and latest_forecast.annual_rainfall > 1.25 * rain_ref:
            items.append({"category": "Water", "priority": "medium", "title": "Rainfall is above the comparable historical level", "detail": "Check drainage, waterlogging risk and disease pressure before adding more irrigation."})

        if fert_ref and fert_rate > 1.25 * fert_ref:
            items.append({"category": "Inputs", "priority": "medium", "title": "Fertilizer application rate is high versus comparable records", "detail": "Verify the dosage against your soil-test recommendation before increasing fertilizer further."})
        elif fert_ref and fert_rate < 0.75 * fert_ref:
            items.append({"category": "Inputs", "priority": "medium", "title": "Fertilizer application rate is low versus comparable records", "detail": "Use a soil test and crop-stage recommendation to confirm whether additional nutrients are required."})

        if pest_ref and pest_rate > 1.25 * pest_ref:
            items.append({"category": "Crop protection", "priority": "medium", "title": "Pesticide use is high versus comparable records", "detail": "Review pest scouting and integrated pest-management practices before another application."})

        if yield_ref and latest_forecast.forecasted_yield < 0.8 * yield_ref:
            items.append({"category": "Productivity", "priority": "high", "title": "Yield forecast is below the historical median for comparable records", "detail": "Review water, soil condition, crop stage and input timing. The historical comparison is a decision-support signal, not a diagnosis."})
        elif yield_ref and latest_forecast.forecasted_yield > 1.2 * yield_ref:
            items.append({"category": "Productivity", "priority": "low", "title": "Yield forecast is above the historical median", "detail": "Maintain current field monitoring and record actual harvest data so future comparisons can be improved."})

        if latest_forecast.outside_historical_years:
            items.append({"category": "Planning", "priority": "medium", "title": "Forecast year is outside the historical dataset period", "detail": "Use the forecast with additional caution and combine it with current field and weather information."})

    if latest_soil:
        if latest_soil.ph < 5.5 or latest_soil.ph > 8.0:
            items.append({"category": "Soil", "priority": "high", "title": "Soil pH needs crop-specific attention", "detail": "Confirm the soil-test result and obtain a local amendment recommendation before changing lime, sulfur or fertilizer rates."})
        if latest_soil.organic_carbon is not None and latest_soil.organic_carbon < 0.5:
            items.append({"category": "Soil", "priority": "medium", "title": "Organic carbon is low in the latest record", "detail": "Discuss locally suitable residue, compost or organic-matter management practices."})

    if latest_weather:
        if latest_weather.temperature is not None and latest_weather.temperature >= 35:
            items.append({"category": "Weather", "priority": "high", "title": "High temperature conditions", "detail": "Check crop heat stress, irrigation timing and field moisture during the hottest hours."})
        if latest_weather.precipitation is not None and latest_weather.precipitation >= 20:
            items.append({"category": "Weather", "priority": "high", "title": "Heavy current precipitation signal", "detail": "Inspect field drainage, waterlogging and access conditions before field operations."})
        if latest_weather.wind_speed is not None and latest_weather.wind_speed >= 30:
            items.append({"category": "Weather", "priority": "medium", "title": "Strong wind conditions", "detail": "Avoid unnecessary spraying during strong winds and check exposed crops or supports."})

    if not latest_forecast:
        items.append({"category": "Getting started", "priority": "low", "title": "Create your first yield forecast", "detail": "A saved forecast enables historical comparisons and resource-use guidance."})
    if not latest_soil:
        items.append({"category": "Getting started", "priority": "low", "title": "Add a recent soil-test record", "detail": "Enter measured pH and any available lab values to keep soil information alongside your farm records."})
    if not latest_weather:
        items.append({"category": "Getting started", "priority": "low", "title": "Check current farm weather", "detail": "Search a real location or use saved farm coordinates to add current weather context."})

    return items[:10]
