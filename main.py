from fastapi import FastAPI
import pandas as pd

app = FastAPI()

# Load dataset once when API starts
df = pd.read_csv("india_housing_prices.csv", nrows=1000)

@app.get("/")
def home():
    return {"message": "Real Estate AI API is running"}

@app.get("/recommend")
def recommend(city: str, property_type: str, bhk: int, max_budget: float):
    # Filter dataset based on user inputs
    filtered = df[
        (df["City"].str.lower() == city.lower()) &
        (df["Property_Type"].str.lower() == property_type.lower()) &
        (df["BHK"] == bhk) &
        (df["Price_in_Lakhs"] <= max_budget)
    ]

    # If no results found
    if filtered.empty:
        return {"message": "No properties found matching your criteria"}

    # Return top 5 results
    top5 = filtered.sort_values("Price_in_Lakhs").head(5)

    results = []
    for _, row in top5.iterrows():
        results.append({
            "city": row["City"],
            "state": row["State"],
            "locality": row["Locality"],
            "property_type": row["Property_Type"],
            "bhk": row["BHK"],
            "size_sqft": row["Size_in_SqFt"],
            "price_in_lakhs": row["Price_in_Lakhs"],
            "furnished_status": row["Furnished_Status"],
            "amenities": row["Amenities"],
            "availability": row["Availability_Status"]
        })

    return {"total_found": len(filtered), "showing": 5, "properties": results}