from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Real Estate AI API is running"}

@app.get("/recommend")
def recommend(city: str, budget: int, property_type: str):
    return {
        "city": city,
        "budget": budget,
        "property_type": property_type,
        "recommendations": [
            "Property 1 - sample result",
            "Property 2 - sample result",
            "Property 3 - sample result"
        ]
    }