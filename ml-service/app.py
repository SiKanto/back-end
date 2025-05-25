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

# Load model
model = tf.keras.models.load_model('model_kota.h5')

# Load dataset sekali (pastikan path sesuai)
df = pd.read_excel('Dataset_Wisata_Madura.xlsx')  # dataset berisi info wisata

if 'openingHours' in df.columns and 'closingHours' in df.columns:
    df['openingHours'] = df['openingHours'].astype(str)
    df['closingHours'] = df['closingHours'].astype(str)


# Mapping kota ke one-hot vector input model
kategori_mapping = {
    'Bangkalan': [1,0,0,0,0,0],
    'Sampang': [0,1,0,0,0,0],
    'Pamekasan': [0,0,1,0,0,0],
    'Sumenep': [0,0,0,1,0,0],
    # dst
}

def preprocess(city_name):
    vector = kategori_mapping.get(city_name, [0,0,0,0,0,0])
    return np.array([vector])  # shape (1,6)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    city = data.get('city', '')
    
    input_data = preprocess(city)
    preds = model.predict(input_data)  # output probabilitas
    
    # Misal output model adalah array probabilitas untuk masing-masing kategori wisata,
    # misal preds = [[0.8, 0.1, 0.05, 0.05]]
    scores = preds[0]
    
    # Ambil index rekomendasi dengan skor tertinggi
    idx = np.argmax(scores)
    
    # Cari data rekomendasi dari dataset sesuai index atau kota
    # Contoh: filter dataset berdasarkan kota
    recommended_data = df[df['city'] == city].to_dict(orient='records')
    
    # Bisa juga filter berdasarkan kriteria lain, misal top N tempat wisata,
    # atau sesuai idx dari model jika dataset berisi label kategori
    
    return jsonify({
        'city': city,
        'prediction_scores': scores.tolist(),
        'recommendations': recommended_data  # kirim data lengkap ke frontend
    })

# Endpoint baru: ambil semua destinasi wisata tanpa parameter
@app.route('/destinations', methods=['GET'])
def get_all_destinations():
    all_data = df.to_dict(orient='records')
    return jsonify({
        'success': True,
        'total': len(all_data),
        'destinations': all_data
    })

MONGO_URI = os.getenv("MONGO_URI")

# Koneksi ke MongoDB menggunakan URI dari .env
client = MongoClient(MONGO_URI)
db = client['test']
collection = db['destinations']

# Modified save_destinations function to store data into MongoDB using Mongoose model
@app.route('/save_destinations', methods=['POST'])
def save_destinations():
    data = request.json
    destinations = data.get('destinations', [])

    if not destinations:
        return jsonify({'error': 'No destinations data provided'}), 400

    try:
        # Loop through destinations and save each one using the Destination model
        for dest in destinations:
            # Create new destination document based on the model schema
            destination_data = {
                "name": dest.get('name'),
                "location": dest.get('location'),
                "facilities": dest.get('facilities', []),
                "price": dest.get('price'),
                "openingHours": dest.get('openingHours'),
                "closingHours": dest.get('closingHours'),
                "description": dest.get('description'),
                "category": dest.get('category'),
                "city": dest.get('city'),
                "officialRating": dest.get('officialRating', 0),
                "rating": dest.get('rating', 0),
                "lat": dest.get('lat'),
                "lon": dest.get('lon')
            }
            # Menyimpan ke MongoDB
            collection.insert_one(destination_data)
        
        return jsonify({'success': True, 'message': 'Destinations saved to MongoDB'}), 200
    except Exception as e:
        print(f"Error saving destinations: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))  # fallback ke 6000 jika PORT tidak ada
    app.run(host='0.0.0.0', port=port, debug=True)