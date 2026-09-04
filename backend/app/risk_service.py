"""Deterministic crop risk assessment built around a saved yield forecast.

This is a decision-support layer, not a second ML model. It compares the model
forecast and user inputs with comparable historical medians from the same
agricultural dataset. Scores are intended for prioritisation, not as a guarantee
of crop loss or agronomic diagnosis.
"""
from __future__ import annotations

from html import escape
from typing import Any


def _pct_deviation(value: float | None, baseline: float | None) -> float | None:
    if value is None or baseline is None or baseline <= 0:
        return None
    return abs(float(value) - float(baseline)) / float(baseline)


def _severity_points(deviation: float | None, mild: float, high: float, max_points: int) -> tuple[int, str]:
    if deviation is None:
        return 0, "unknown"
    if deviation >= high:
        return max_points, "high"
    if deviation >= mild:
        return round(max_points * 0.55), "medium"
    return 0, "low"


def _crop_action(crop: str) -> str:
    c = crop.lower()
    groups = [
        (("rice",), "Inspect standing water/drainage and leaf colour, then verify irrigation and nutrient timing for the current rice stage."),
        (("wheat", "barley"), "Check soil moisture around the root zone and inspect for yellowing or lodging before the next irrigation or nutrient application."),
        (("maize", "jowar", "bajra", "ragi", "millet"), "Check moisture stress and leaf symptoms now, especially around active vegetative or flowering stages."),
        (("cotton",), "Inspect squares/bolls and both leaf surfaces for pest pressure; avoid changing pesticide dose until the field check is complete."),
        (("sugarcane",), "Check soil moisture, drainage and cane vigour across representative rows, then correct water-management issues first."),
        (("potato", "sweet potato", "tapioca"), "Inspect root-zone moisture and foliage for disease symptoms; prevent prolonged waterlogging or severe moisture stress."),
        (("banana", "coconut", "arecanut", "cashewnut"), "Inspect plant vigour, irrigation availability and visible nutrient/pest symptoms across several representative plants."),
        (("groundnut", "soyabean", "sunflower", "mustard", "rapeseed", "sesamum", "safflower", "linseed", "castor", "niger"), "Inspect moisture and flowering/pod or seed development, then review nutrient and pest management against local recommendations."),
        (("gram", "arhar", "tur", "moong", "urad", "masoor", "pea", "cowpea", "horse-gram", "moth", "khesari", "pulse"), "Inspect flowering/pod development, soil moisture and pest symptoms before making the next input decision."),
        (("onion", "garlic", "ginger", "turmeric", "chill", "coriander", "pepper", "cardamom"), "Inspect root-zone moisture and visible disease/pest symptoms, and avoid excess irrigation while field conditions are being verified."),
        (("jute", "mesta", "sannhamp"), "Check crop stand, moisture availability and stem/leaf health across the field before the next management operation."),
    ]
    for names, action in groups:
        if any(name in c for name in names):
            return action
    return f"Inspect a representative part of the {crop} field now for moisture stress, pest/disease symptoms and uneven crop growth before changing inputs."


def assess_forecast(data: dict[str, Any]) -> dict[str, Any]:
    """Return a 0-100 risk score, factor breakdown and immediate actions."""
    score = 0
    factors: list[dict[str, Any]] = []
    actions: list[str] = []

    predicted = data.get("forecasted_yield")
    hist_yield = data.get("historical_yield_median")
    yield_ratio = (float(predicted) / float(hist_yield)) if predicted is not None and hist_yield and hist_yield > 0 else None
    if yield_ratio is None:
        factors.append({"name": "Yield outlook", "severity": "unknown", "points": 5, "detail": "No strong historical yield baseline was available for this combination."})
        score += 5
    elif yield_ratio < 0.65:
        score += 40
        factors.append({"name": "Yield outlook", "severity": "high", "points": 40, "detail": f"Forecasted yield is {round((1-yield_ratio)*100)}% below the comparable historical median."})
        actions.append("Prioritise a field inspection and verify the largest controllable stress (water, nutrient timing, pest or disease pressure) before additional spending.")
    elif yield_ratio < 0.80:
        score += 28
        factors.append({"name": "Yield outlook", "severity": "high", "points": 28, "detail": f"Forecasted yield is {round((1-yield_ratio)*100)}% below the comparable historical median."})
        actions.append("Review current crop condition against the historical shortfall and correct confirmed field stresses first.")
    elif yield_ratio < 0.95:
        score += 14
        factors.append({"name": "Yield outlook", "severity": "medium", "points": 14, "detail": f"Forecasted yield is {round((1-yield_ratio)*100)}% below the comparable historical median."})
    elif yield_ratio > 1.30:
        score += 5
        factors.append({"name": "Yield outlook", "severity": "medium", "points": 5, "detail": "Forecast is substantially above the historical median; protect the expected upside and watch for late-season stress."})
    else:
        factors.append({"name": "Yield outlook", "severity": "low", "points": 0, "detail": "Forecasted yield is reasonably close to the comparable historical level."})

    rainfall_dev = _pct_deviation(data.get("annual_rainfall"), data.get("historical_rainfall_median"))
    pts, sev = _severity_points(rainfall_dev, 0.20, 0.40, 24)
    score += pts
    if rainfall_dev is None:
        detail = "Historical rainfall comparison is unavailable."
    else:
        direction = "above" if float(data.get("annual_rainfall", 0)) > float(data.get("historical_rainfall_median", 0)) else "below"
        detail = f"Entered annual rainfall is {round(rainfall_dev*100)}% {direction} the comparable historical median."
    factors.append({"name": "Rainfall deviation", "severity": sev, "points": pts, "detail": detail})
    if sev == "high":
        actions.append("Verify current field moisture and drainage/irrigation conditions; annual rainfall alone can hide short dry or waterlogged periods.")

    area = max(float(data.get("area") or 0), 1e-9)
    fert_rate = float(data.get("fertilizer") or 0) / area
    pest_rate = float(data.get("pesticide") or 0) / area
    fert_dev = _pct_deviation(fert_rate, data.get("historical_fertilizer_rate_median"))
    pest_dev = _pct_deviation(pest_rate, data.get("historical_pesticide_rate_median"))

    pts, sev = _severity_points(fert_dev, 0.30, 0.65, 15)
    score += pts
    factors.append({"name": "Fertilizer-rate deviation", "severity": sev, "points": pts, "detail": "No historical rate comparison is available." if fert_dev is None else f"Fertilizer per area differs from the historical median by {round(fert_dev*100)}%."})
    if sev == "high":
        actions.append("Recheck fertilizer quantity, area and units. Use a soil test/local crop schedule before increasing or reducing application.")

    pts, sev = _severity_points(pest_dev, 0.40, 0.80, 11)
    score += pts
    factors.append({"name": "Pesticide-rate deviation", "severity": sev, "points": pts, "detail": "No historical rate comparison is available." if pest_dev is None else f"Pesticide per area differs from the historical median by {round(pest_dev*100)}%."})
    if sev == "high":
        actions.append("Recheck pesticide quantity, area and units. Confirm an actual pest/disease need and follow the product label/local advisory before application.")

    if data.get("outside_historical_years"):
        score += 10
        factors.append({"name": "Forecast horizon", "severity": "medium", "points": 10, "detail": "The requested crop year is outside the historical dataset period, so model uncertainty is higher."})
        actions.append("Treat this forecast as a planning estimate and combine it with current-season weather, soil and field observations.")
    else:
        factors.append({"name": "Forecast horizon", "severity": "low", "points": 0, "detail": "The crop year is within the model's historical source-data period."})

    score = min(100, int(round(score)))
    if score >= 70:
        level, label = "critical", "Very high risk"
    elif score >= 50:
        level, label = "high", "High risk"
    elif score >= 30:
        level, label = "moderate", "Moderate risk"
    else:
        level, label = "low", "Low risk"

    immediate = _crop_action(str(data.get("crop") or "crop"))
    ordered_actions = [immediate] + [a for a in actions if a != immediate]
    # keep the report concise and deduplicated
    deduped = list(dict.fromkeys(ordered_actions))[:5]

    return {
        "risk_score": score,
        "risk_level": level,
        "risk_label": label,
        "confidence_note": "Risk is a rule-based decision-support score derived from the Random Forest forecast and historical input comparisons; it is not a probability of crop failure.",
        "risk_factors": factors,
        "immediate_next_step": immediate,
        "next_actions": deduped,
        "summary": f"{data.get('crop')} is currently classified as {label.lower()} ({score}/100) for this forecast scenario.",
    }


def forecast_dict(row: Any) -> dict[str, Any]:
    fields = [
        "id", "farm_id", "crop", "crop_year", "season", "state", "area",
        "annual_rainfall", "fertilizer", "pesticide", "forecasted_yield",
        "forecasted_production", "historical_yield_median",
        "historical_rainfall_median", "historical_fertilizer_rate_median",
        "historical_pesticide_rate_median", "outside_historical_years", "created_at",
    ]
    data = {name: getattr(row, name) for name in fields}
    risk = assess_forecast(data)
    data.update(risk)
    median = data.get("historical_yield_median")
    if median is None or median <= 0:
        data["decision"] = "Forecast generated"
        data["recommendation"] = "Use the predicted yield as a planning estimate and monitor field conditions."
    else:
        ratio = data["forecasted_yield"] / median
        if ratio < 0.80:
            data["decision"] = "Below historical level"
            data["recommendation"] = "Expected yield is below the historical median. Review the risk factors and immediate next steps before changing farm inputs."
        elif ratio < 1.10:
            data["decision"] = "Near historical level"
            data["recommendation"] = "Expected yield is close to the historical median. Maintain suitable crop management and monitor weather and field conditions."
        else:
            data["decision"] = "Above historical level"
            data["recommendation"] = "Expected yield is above the historical median. Protect the expected performance with timely monitoring and resource management."
    return data


def report_payload(row: Any, farm_name: str | None = None) -> dict[str, Any]:
    data = forecast_dict(row)
    return {
        "report_title": "YieldSense AI Crop Risk Assessment Report",
        "report_version": "1.0",
        "forecast_id": data["id"],
        "created_at": data["created_at"],
        "farm_name": farm_name,
        "scenario": {k: data[k] for k in ["crop", "state", "season", "crop_year", "area", "annual_rainfall", "fertilizer", "pesticide"]},
        "prediction": {"forecasted_yield": data["forecasted_yield"], "forecasted_production": data["forecasted_production"], "historical_yield_median": data["historical_yield_median"]},
        "assessment": {k: data[k] for k in ["risk_score", "risk_level", "risk_label", "summary", "confidence_note", "risk_factors", "immediate_next_step", "next_actions"]},
        "disclaimer": "Decision-support only. Verify field conditions, units and local agronomic guidance before making crop-protection, irrigation or fertilizer decisions.",
    }


def report_html(report: dict[str, Any]) -> str:
    s, p, a = report["scenario"], report["prediction"], report["assessment"]
    factor_rows = "".join(
        f"<tr><td>{escape(str(x['name']))}</td><td>{escape(str(x['severity']).title())}</td><td>{x['points']}</td><td>{escape(str(x['detail']))}</td></tr>"
        for x in a["risk_factors"]
    )
    actions = "".join(f"<li>{escape(str(x))}</li>" for x in a["next_actions"])
    farm = f"<p><strong>Farm:</strong> {escape(str(report['farm_name']))}</p>" if report.get("farm_name") else ""
    production_text = f"{p['forecasted_production']:.3f}" if p['forecasted_production'] is not None else "—"
    return f"""<!doctype html><html><head><meta charset='utf-8'><title>YieldSense Risk Report #{report['forecast_id']}</title>
<style>body{{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;color:#17342b;line-height:1.5}}h1{{color:#214d3f}}.score{{font-size:32px;font-weight:800}}.box{{background:#f4f8f1;padding:18px;border-radius:12px;margin:18px 0}}table{{width:100%;border-collapse:collapse}}th,td{{padding:9px;border-bottom:1px solid #dfe7dc;text-align:left;vertical-align:top}}small{{color:#60756b}}@media print{{body{{margin:15mm}}}}</style></head><body>
<h1>{escape(report['report_title'])}</h1><p>Forecast #{report['forecast_id']} • {escape(str(report['created_at']))}</p>{farm}
<div class='box'><div class='score'>{a['risk_score']}/100 — {escape(a['risk_label'])}</div><p>{escape(a['summary'])}</p><small>{escape(a['confidence_note'])}</small></div>
<h2>Forecast scenario</h2><table><tr><th>Crop</th><td>{escape(str(s['crop']))}</td><th>State</th><td>{escape(str(s['state']))}</td></tr><tr><th>Season</th><td>{escape(str(s['season']))}</td><th>Year</th><td>{s['crop_year']}</td></tr><tr><th>Area</th><td>{s['area']}</td><th>Rainfall</th><td>{s['annual_rainfall']}</td></tr><tr><th>Fertilizer</th><td>{s['fertilizer']}</td><th>Pesticide</th><td>{s['pesticide']}</td></tr></table>
<h2>Prediction</h2><p><strong>Yield:</strong> {p['forecasted_yield']:.3f} &nbsp; <strong>Production:</strong> {production_text}</p>
<h2>Immediate next step</h2><div class='box'>{escape(a['immediate_next_step'])}</div>
<h2>Risk factors</h2><table><thead><tr><th>Factor</th><th>Severity</th><th>Points</th><th>Why it matters</th></tr></thead><tbody>{factor_rows}</tbody></table>
<h2>Next actions</h2><ol>{actions}</ol><p><small>{escape(report['disclaimer'])}</small></p></body></html>"""
