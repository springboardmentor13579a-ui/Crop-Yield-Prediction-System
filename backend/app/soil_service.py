def analyze_soil(record) -> dict:
    findings = []
    score_parts = []

    ph = float(record.ph)
    if 6.0 <= ph <= 7.5:
        findings.append({"type": "good", "title": "Soil pH is in a broadly favorable range", "detail": f"Recorded pH: {ph:.2f}."})
        score_parts.append(100)
    elif 5.5 <= ph < 6.0 or 7.5 < ph <= 8.0:
        findings.append({"type": "watch", "title": "Soil pH needs attention", "detail": f"Recorded pH: {ph:.2f}. Confirm crop-specific correction with a local soil test recommendation."})
        score_parts.append(70)
    else:
        findings.append({"type": "risk", "title": "Soil pH is outside the common target range", "detail": f"Recorded pH: {ph:.2f}. Seek crop-specific soil amendment guidance before changing inputs."})
        score_parts.append(40)

    if record.organic_carbon is not None:
        oc = float(record.organic_carbon)
        if oc >= 0.75:
            findings.append({"type": "good", "title": "Organic carbon level is relatively strong", "detail": f"Recorded organic carbon: {oc:.2f}."})
            score_parts.append(100)
        elif oc >= 0.5:
            findings.append({"type": "watch", "title": "Organic carbon is moderate", "detail": f"Recorded organic carbon: {oc:.2f}. Consider locally appropriate organic-matter practices."})
            score_parts.append(70)
        else:
            findings.append({"type": "risk", "title": "Organic carbon is low", "detail": f"Recorded organic carbon: {oc:.2f}. Confirm the lab unit and discuss soil-building options locally."})
            score_parts.append(45)

    if record.moisture is not None:
        moisture = float(record.moisture)
        if 15 <= moisture <= 35:
            findings.append({"type": "good", "title": "Recorded soil moisture is in a moderate field range", "detail": f"Moisture: {moisture:.1f}%."})
            score_parts.append(90)
        elif moisture < 15:
            findings.append({"type": "watch", "title": "Recorded soil moisture is low", "detail": f"Moisture: {moisture:.1f}%. Review irrigation needs against crop stage and local weather."})
            score_parts.append(60)
        else:
            findings.append({"type": "watch", "title": "Recorded soil moisture is high", "detail": f"Moisture: {moisture:.1f}%. Check drainage and field saturation."})
            score_parts.append(60)

    nutrient_values = [record.nitrogen, record.phosphorus, record.potassium]
    if any(v is not None for v in nutrient_values):
        findings.append({"type": "info", "title": "N, P and K values are saved for your soil record", "detail": "Nutrient sufficiency is not auto-classified because laboratory methods and units vary. Use the values with the recommendation printed on your soil-test report."})

    score = round(sum(score_parts) / len(score_parts)) if score_parts else None
    return {"screening_score": score, "findings": findings}
