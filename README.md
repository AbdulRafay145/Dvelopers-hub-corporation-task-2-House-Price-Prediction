# 🏠 HousePrice AI — ML-Powered Price Prediction Engine

A production-grade, full-stack web application that trains **10+ machine learning models** on a real housing dataset, automatically selects the best performer, and serves instant price predictions through a beautiful React frontend.

---

## ✨ Features

- **Auto-training on startup** — no manual steps, no uploads
- **10+ ML models** trained, compared, and cross-validated
- **Ensemble** of top 3 models attempted automatically
- **Feature engineering** adds 5 derived features for better accuracy
- **Beautiful dark UI** with glassmorphism, animations, and live charts
- **4 pages**: Home · Predict · Dashboard · About
- **REST API** with Flask — clean, fast, CORS-enabled

---

## 📁 Project Structure

```
house-price-ai/
├── backend/
│   ├── app.py              # Flask API server
│   ├── ml_engine.py        # Full ML pipeline
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TrainingOverlay.jsx
│   │   │   └── MetricCard.jsx
│   │   └── pages/
│   │       ├── HomePage.jsx
│   │       ├── PredictPage.jsx
│   │       ├── DashboardPage.jsx
│   │       └── AboutPage.jsx
│   ├── package.json
│   └── tailwind.config.js
├── data/
│   └── house_data.csv      ← dataset lives here
├── docs/
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

---

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The backend will:
1. Start Flask on `http://localhost:5000`
2. **Automatically begin training all ML models in a background thread**
3. Expose REST endpoints once training completes

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app opens at `http://localhost:3000`.

A training overlay will display until all models finish training (~30–60s).

---

## 🤖 ML Models Trained

| Category | Models |
|----------|--------|
| Linear | Linear Regression, Ridge, Lasso |
| Tree-based | Random Forest, Extra Trees |
| Boosting | Gradient Boosting, AdaBoost |
| Advanced | XGBoost*, LightGBM*, CatBoost* |
| Neural Net | MLP Regressor |
| Ensemble | VotingRegressor (Top 3 models) |

> *Advanced models used if installed. Falls back gracefully if not available.

---

## 🔬 Data Pipeline

1. **Load** CSV from `data/house_data.csv`
2. **Clean** — drop duplicates, fill nulls, encode binary columns
3. **Outlier removal** using 5th–95th percentile IQR
4. **Encode** — yes/no → 0/1, furnishing → ordinal 0/1/2
5. **Feature engineering** — 5 new derived features
6. **Log transform** — applied to `price` if skewness > 0.75
7. **Scale** — StandardScaler on all features
8. **Split** — 80% train / 20% test
9. **Train** — all models + 5-fold cross-validation each
10. **Compare** — select best by test R²
11. **Ensemble** — try VotingRegressor of top 3

---

## 📡 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/health` | Server health check |
| GET | `/training-status` | Poll training progress |
| POST/GET | `/train-models` | Trigger training manually |
| POST | `/predict` | Predict price from JSON input |
| GET | `/metrics` | Get model performance metrics |
| GET | `/dashboard` | Get chart data |

### Predict Request Example

```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "area": 7000,
    "bedrooms": 4,
    "bathrooms": 2,
    "stories": 2,
    "mainroad": "yes",
    "guestroom": "no",
    "basement": "yes",
    "hotwaterheating": "no",
    "airconditioning": "yes",
    "parking": 2,
    "prefarea": "yes",
    "furnishingstatus": "furnished"
  }'
```

### Response

```json
{
  "predicted_price": 8745000.0,
  "model_used": "Ensemble (Top 3)",
  "price_formatted": "₨ 8,745,000"
}
```

---

## 📊 Metrics Explained

| Metric | Description |
|--------|-------------|
| **R²** | Variance explained (1.0 = perfect) |
| **Adj. R²** | R² penalized for extra features |
| **MAE** | Mean absolute error in ₨ |
| **RMSE** | Root mean squared error in ₨ |
| **MAPE** | Mean absolute percentage error |
| **CV R²** | Mean R² across 5 validation folds |

---

## 🔧 Configuration

To use a different dataset, replace `data/house_data.csv` with your file having these columns:
`price, area, bedrooms, bathrooms, stories, mainroad, guestroom, basement, hotwaterheating, airconditioning, parking, prefarea, furnishingstatus`

---

## 📦 Dependencies

### Backend
```
flask, pandas, numpy, scikit-learn, xgboost, lightgbm, catboost, joblib, scipy
```

### Frontend
```
react, react-dom, react-router-dom, framer-motion, recharts, axios
```

---

## 🏗 Built With

- **React 18** + Vite/CRA
- **Tailwind CSS** — utility-first styling
- **Framer Motion** — smooth animations
- **Recharts** — interactive data charts
- **Flask** — lightweight Python backend
- **Scikit-learn** — core ML framework
- **XGBoost / LightGBM / CatBoost** — advanced boosting

---

*Built like a top ML engineer would build it — clean, fast, accurate.*
