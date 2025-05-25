import pandas as pd
from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np

app = Flask(__name__)

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6000, debug=True)
