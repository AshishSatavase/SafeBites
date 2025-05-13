from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
import pandas as pd
import hashlib
from rapidfuzz import process, fuzz
from openai import OpenAI
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# MongoDB Connection URL from environment variable
mongo_url = os.getenv('MONGO_URL')

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # Handle Cross-Origin Resource Sharing

# Connect to MongoDB
client = MongoClient(mongo_url)
db = client["Cluster0"]  # Replace with your database name if different
user_collection = db["UserInfo"]  # Replace with your collection name

# Load and preprocess product dataset
file_path = "images_content_fssai_allergens.csv"  # Path to your CSV file
df = pd.read_csv(file_path)

def generate_hash(name):
    return hashlib.md5(name.strip().lower().encode()).hexdigest()

def get_allergen_info(row):
    allergens = []
    if row['ContainsCrustacean'] == 1:
        allergens.append("Crustacean")
    if row['ContainsMilk'] == 1:
        allergens.append("Milk")
    if row['ContainsEgg'] == 1:
        allergens.append("Egg")
    if row['ContainsFish'] == 1:
        allergens.append("Fish")
    if row['ContainsNut'] == 1:
        allergens.append("Nut")
    if row['ContainsSoy'] == 1:
        allergens.append("Soy")
    if row['ContainsSulphite'] == 1:
        allergens.append("Sulphite")

    return ', '.join(allergens) if allergens else "No allergens detected"

# Precompute hash values and allergen information
df['ProductHash'] = df['ProductName'].apply(lambda x: generate_hash(x))
df['Allergens'] = df.apply(get_allergen_info, axis=1)

# Build hash lookup for querying
hash_lookup = {
    row['ProductHash']: {
        'ProductName': row['ProductName'],
        'Allergens': row['Allergens']
    }
    for _, row in df.iterrows()
}



try:
    client.admin.command('ping')
    print("Database Connection Successful")
except Exception as e:
    print("Database Connection Error:", e)

# Default Route
@app.route("/", methods=["GET"])
def home():
    return "Server Running"
# Register route
@app.route("/register", methods=["POST"])
def register(): 
    data = request.json
    required_fields = ["name", "userId", "age", "password", "allergy", "dietPreference"]

    # Validate input fields
    for field in required_fields:
        if field not in data:
            return jsonify({"status": "error", "message": f"Missing field: {field}"}), 400

    # Check for existing user
    if user_collection.find_one({"userId": data["userId"]}):
        return jsonify({"status": "error", "message": "User already exists"}), 400

    # Hash the password (ensure it's in bytes)
    hashed_password = bcrypt.hashpw(data["password"].encode('utf-8'), bcrypt.gensalt())

    # Create new user document
    user_data = {
        "name": data["name"],
        "userId": data["userId"],
        "age": data["age"],
        "password": hashed_password.decode('utf-8'),  # Store as string in DB
        "allergy": data["allergy"],
        "dietPreference": data["dietPreference"]
    }

    # Insert into DB
    user_collection.insert_one(user_data)

    # Return success response with user data
    response_data = {
        "status": "ok",
        "message": "User Created Successfully",
        "user": {
            "userId": user_data["userId"],
            "name": user_data["name"],
            "age": user_data["age"],
            "allergy": user_data["allergy"],
            "dietPreference": user_data["dietPreference"]
        }
    }

    return jsonify(response_data), 200


# Login route
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    required_fields = ["userId", "password"]
    
    # Validate input fields
    for field in required_fields:
        if field not in data:
            return jsonify({"status": "error", "message": f"Missing field: {field}"}), 400
    
    # Find user by userId
    user = user_collection.find_one({"userId": data["userId"]})
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    # Check if the password matches (convert stored password back to bytes)
    if not bcrypt.checkpw(data["password"].encode('utf-8'), user["password"].encode('utf-8')):
        return jsonify({"status": "error", "message": "Invalid credentials"}), 400

    # Generate token (if needed, or return user data)
    response_data = {
        "status": "ok",
        "message": "Login successful",
        "user": {
            "userId": user["userId"],
            "name": user["name"],
            "age": user["age"],
            "allergy": user["allergy"],
            "dietPreference": user["dietPreference"]
        }
    }
    
    return jsonify(response_data), 200



@app.route("/scanproduct", methods=["POST"])
def scan_product():
    data = request.json
    required_fields = ["productName", "userAllergies"]
    print(data["productName"])
    # Validate input fields
    for field in required_fields:
        if field not in data:
            return jsonify({"status": "error", "message": f"Missing field: {field}"}), 400

    product_name = data["productName"].strip().lower()
    user_allergies = set(map(str.lower, data["userAllergies"].split(', ')))  # Handle multiple allergies if comma-separated
    print(user_allergies)

    # Generate hash for the product name
    product_hash = generate_hash(product_name)

    # Check for exact match in hash lookup
    if product_hash in hash_lookup:
        product = hash_lookup[product_hash]
        product_allergens = set(map(str.lower, product['Allergens'].split(', ')))
        # Check if there is any intersection between user allergies and product allergens
        if user_allergies & product_allergens:
            return jsonify({
                "status": "not safe",
                "product": product["ProductName"],
                "allergens": product['Allergens']
            }), 200
        else:
                return jsonify({
                    "status": "safe",
                    "product": product["ProductName"],
                    "allergens": product['Allergens']
                }), 200

    # Fuzzy matching if exact match is not found
    match_result = process.extractOne(product_name, df['ProductName'].str.lower().tolist(), scorer=fuzz.ratio)
    print("below hash")
    if match_result and match_result[1] > 50:  # Adjust threshold as needed
        match = match_result[0]
        matched_row = df[df['ProductName'].str.lower() == match].iloc[0]
        product_allergens = set(map(str.lower, matched_row['Allergens'].split(', ')))
        if user_allergies & product_allergens:
            return jsonify({
                "status": "not safe",
                "product": matched_row['ProductName'],
                "allergens": matched_row['Allergens']
            }), 200
        else:
            return jsonify({
                "status": "safe",
                "product": matched_row['ProductName'],
                "allergens": matched_row['Allergens']
            }), 200

    return jsonify({"status": "error", "message": "Product not found"}), 404



# Remove the hardcoded API key
openai_api_key = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=openai_api_key)

# OpenAI API Key (Replace with your actual API key)

@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.json
    required_fields = ["productName", "allergies"]

    # Validate input fields
    for field in required_fields:
        if field not in data:
            return jsonify({"status": "error", "message": f"Missing field: {field}"}), 400

    product_name = data["productName"].strip()
    allergies = data["allergies"].strip()

    # Construct the prompt for GPT
    prompt = (
        f"Act as an Indian product recommendation system. Recommend 3-5 similar products to '{product_name}'. "
        f"Ensure these recommendations do not contain allergens: {allergies}. "
        "Provide the product names as a JSON array."
    )

    try:
        response = client.chat.completions.create(

            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": prompt}],
            temperature=0.7
        )

        # Extract response text and parse it as a list
        recommended_products = response["choices"][0]["message"]["content"].strip()
        return jsonify({"status": "ok", "recommendations": recommended_products}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/updateprofile", methods=["PUT"])
def update_profile():
    data = request.json
    required_fields = ["userId", "name", "age", "allergy", "dietPreference"]
    
    # Validate input fields
    for field in required_fields:
        if field not in data:
            return jsonify({"status": "error", "message": f"Missing field: {field}"}), 400
    
    # Find user by userId
    user = user_collection.find_one({"userId": data["userId"]})
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    # Update user document
    update_data = {
        "name": data["name"],
        "age": data["age"],
        "allergy": data["allergy"],
        "dietPreference": data["dietPreference"]
    }

    # Update in DB
    user_collection.update_one(
        {"userId": data["userId"]},
        {"$set": update_data}
    )

    # Return success response with updated user data
    response_data = {
        "status": "ok",
        "message": "Profile Updated Successfully",
        "user": {
            "userId": data["userId"],
            "name": data["name"],
            "age": data["age"],
            "allergy": data["allergy"],
            "dietPreference": data["dietPreference"]
        }
    }
    
    return jsonify(response_data), 200

# Start the Server
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=7000, debug=True)

