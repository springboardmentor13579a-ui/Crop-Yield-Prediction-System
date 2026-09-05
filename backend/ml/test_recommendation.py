from ml.recommendation_predictor import recommend_crop


result = recommend_crop(
    N=90,
    P=42,
    K=43,
    temperature=20.87974,
    humidity=82.00274,
    ph=6.502985,
    rainfall=202.9355
)


print("=" * 60)
print("AI CROP RECOMMENDATION")
print("=" * 60)

print(
    "Recommended Crop:",
    result["recommended_crop"]
)

print(
    "Confidence:",
    result["confidence"],
    "%"
)

print("\nTop Recommendations:")

for item in result["top_recommendations"]:

    print(
        f"{item['crop']} "
        f"→ {item['confidence']}%"
    )