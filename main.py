from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
import numpy as np

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load dataset
df = pd.read_csv("india_housing_prices.csv", nrows=1000)

# --- Train price prediction model ---
model_df = df[["Property_Type", "BHK", "Size_in_SqFt", "Furnished_Status", "Price_in_Lakhs"]].dropna()

le_property = LabelEncoder()
le_furnished = LabelEncoder()

model_df = model_df.copy()
model_df["Property_Type_enc"] = le_property.fit_transform(model_df["Property_Type"])
model_df["Furnished_Status_enc"] = le_furnished.fit_transform(model_df["Furnished_Status"])

X = model_df[["Property_Type_enc", "BHK", "Size_in_SqFt", "Furnished_Status_enc"]]
y = model_df["Price_in_Lakhs"]

model = LinearRegression()
model.fit(X, y)

# --- API endpoints ---
@app.get("/")
def home():
    return {"message": "Real Estate AI API is running"}

@app.get("/recommend")
def recommend(city: str, property_type: str, bhk: int, max_budget: float):
    
    # Validate property type
    valid_types = ["Apartment", "Villa", "Independent House"]
    if property_type not in valid_types:
        return {"error": f"Invalid property_type. Choose from: {valid_types}"}

    # Validate BHK
    if bhk < 1 or bhk > 5:
        return {"error": "BHK must be between 1 and 5"}

    # Validate budget
    if max_budget <= 0:
        return {"error": "Budget must be greater than 0"}

    filtered = df[
        (df["City"].str.lower() == city.lower()) &
        (df["Property_Type"].str.lower() == property_type.lower()) &
        (df["BHK"] == bhk) &
        (df["Price_in_Lakhs"] <= max_budget)
    ]

    if filtered.empty:
        return {"message": "No properties found matching your criteria", 
                "tip": "Try increasing your budget or changing filters"}

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

@app.get("/predict-price")
def predict_price(property_type: str, bhk: int, size_sqft: float, furnished_status: str):
    try:
        property_enc = le_property.transform([property_type])[0]
        furnished_enc = le_furnished.transform([furnished_status])[0]
    except:
        return {"error": "Invalid property_type or furnished_status value"}

    input_data = np.array([[property_enc, bhk, size_sqft, furnished_enc]])
    predicted_price = model.predict(input_data)[0]

    return {
        "property_type": property_type,
        "bhk": bhk,
        "size_sqft": size_sqft,
        "furnished_status": furnished_status,
        "predicted_price_in_lakhs": round(predicted_price, 2)
    }