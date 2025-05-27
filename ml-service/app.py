import pandas as pd
from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
import os

load_dotenv()

app = Flask(__name__)
CORS(app)
MONGO_URI = os.getenv("MONGO_URI")

# Koneksi ke MongoDB menggunakan URI dari .env
client = MongoClient(MONGO_URI)
db = client['test']
collection = db['destinations']

# Load model
model = tf.keras.models.load_model('model_kota.h5')

# Load dataset sekali (pastikan path sesuai)
df = pd.read_excel('Dataset_Wisata_Madura.xlsx')  # dataset berisi info wisata

# Tambahkan kolom default jika tidak ada, agar tidak error saat diakses
required_columns = [
    'officialRating', 'rating', 'facilities', 'openingHours',
    'closingHours', 'price', 'description', 'category', 'lat', 'lon', 'visitor'
]
for col in required_columns:
    if col not in df.columns:
        if col in ['officialRating', 'rating', 'price', 'lat', 'lon', 'visitor']:
            df[col] = 0
        elif col == 'facilities':
            df[col] = ""
        else:
            df[col] = "-"

# Pastikan jam buka dan tutup diubah jadi string (hindari NaT)
df['openingHours'] = df['openingHours'].astype(str)
df['closingHours'] = df['closingHours'].astype(str)

# Mapping kota ke one-hot vector input model
kategori_mapping = {
    'Bangkalan': [1,0,0,0,0,0],
    'Sampang': [0,1,0,0,0,0],
    'Pamekasan': [0,0,1,0,0,0],
    'Sumenep': [0,0,0,1,0,0],
    # dst sesuai kebutuhan
}

def preprocess(city_name):
    vector = kategori_mapping.get(city_name, [0,0,0,0,0,0])
    return np.array([vector])  # shape (1,6)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    city = data.get('city', '')

    input_data = preprocess(city)
    preds = model.predict(input_data)

    scores = preds[0]
    idx = np.argmax(scores)

    recommended_data = df[df['city'] == city]

    formatted_data = [{
        "name": row['name'],
        "location": row['location'],
        "facilities": row['facilities'].split(',') if pd.notnull(row['facilities']) else [],
        "price": row['price'],
        "openingHours": row['openingHours'],
        "closingHours": row['closingHours'],
        "description": row['description'],
        "category": row['category'],
        "city": row['city'],
        "visitor": row['visitor'],
        "officialRating": row['officialRating'],
        "rating": row['rating'],
        "lat": row['lat'],
        "lon": row['lon']
    } for index, row in recommended_data.iterrows()]

    return jsonify({
        'city': city,
        'prediction_scores': scores.tolist(),
        'recommendations': formatted_data
    })

@app.route('/destinations', methods=['GET'])
def get_all_destinations():
    formatted_data = [{
        "name": row['name'],
        "location": row['location'],
        "facilities": row['facilities'].split(',') if pd.notnull(row['facilities']) else [],
        "price": row['price'],
        "openingHours": row['openingHours'],
        "closingHours": row['closingHours'],
        "description": row['description'],
        "category": row['category'],
        "city": row['city'],
        "visitor": row['visitor'],
        "officialRating": row['officialRating'],
        "rating": row['rating'],
        "lat": row['lat'],
        "lon": row['lon']
    } for index, row in df.iterrows()]

    return jsonify({
        'success': True,
        'total': len(formatted_data),
        'destinations': formatted_data
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
