"""
House Price AI - ML Engine
Trains and compares multiple ML models, selects the best one automatically.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import (
    RandomForestRegressor, ExtraTreesRegressor,
    GradientBoostingRegressor, AdaBoostRegressor,
    VotingRegressor
)
from sklearn.neural_network import MLPRegressor
from sklearn.metrics import (
    r2_score, mean_absolute_error,
    mean_squared_error, mean_absolute_percentage_error
)
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import warnings
warnings.filterwarnings('ignore')

# Try advanced models
try:
    from xgboost import XGBRegressor
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

try:
    from lightgbm import LGBMRegressor
    HAS_LGB = True
except ImportError:
    HAS_LGB = False

try:
    from catboost import CatBoostRegressor
    HAS_CAT = True
except ImportError:
    HAS_CAT = False


class HousePriceMLEngine:
    def __init__(self, data_path: str):
        self.data_path = data_path
        self.best_model = None
        self.best_model_name = None
        self.scaler = StandardScaler()
        self.feature_names = None
        self.feature_importance = {}
        self.model_results = {}
        self.X_test = None
        self.y_test = None
        self.y_pred_best = None
        self.trained = False
        self.use_log_transform = False
        self.target_mean = None

    def load_and_preprocess(self):
        df = pd.read_csv(self.data_path)

        # Drop duplicates
        df.drop_duplicates(inplace=True)

        # Handle nulls
        df.dropna(subset=['price'], inplace=True)
        for col in df.columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                df[col].fillna(df[col].median(), inplace=True)
            else:
                mode_val = df[col].mode()
                df[col].fillna(mode_val[0] if len(mode_val) > 0 else 'unknown', inplace=True)

        # Outlier treatment using IQR on price
        Q1 = df['price'].quantile(0.05)
        Q3 = df['price'].quantile(0.95)
        IQR = Q3 - Q1
        df = df[(df['price'] >= Q1 - 1.5 * IQR) & (df['price'] <= Q3 + 1.5 * IQR)]

        # Binary encoding for yes/no columns
        binary_cols = ['mainroad', 'guestroom', 'basement', 'hotwaterheating',
                       'airconditioning', 'prefarea']
        for col in binary_cols:
            if col in df.columns:
                df[col] = (df[col].str.strip().str.lower() == 'yes').astype(int)

        # Ordinal encoding for furnishingstatus
        furnish_map = {'unfurnished': 0, 'semi-furnished': 1, 'furnished': 2}
        if 'furnishingstatus' in df.columns:
            df['furnishingstatus'] = df['furnishingstatus'].str.strip().str.lower().map(furnish_map).fillna(1)

        # Feature engineering
        df['area_per_bedroom'] = df['area'] / (df['bedrooms'] + 1)
        df['bath_bed_ratio'] = df['bathrooms'] / (df['bedrooms'] + 1)
        df['total_rooms'] = df['bedrooms'] + df['bathrooms']
        df['luxury_score'] = (df.get('airconditioning', 0) + df.get('prefarea', 0) +
                               df.get('guestroom', 0) + df.get('hotwaterheating', 0))
        df['amenity_score'] = (df.get('basement', 0) + df.get('mainroad', 0) +
                                df.get('parking', df.get('parking', 0)))

        # Log transform target if skewed
        skewness = df['price'].skew()
        if abs(skewness) > 0.75:
            self.use_log_transform = True
            self.target_mean = df['price'].mean()
            y = np.log1p(df['price'])
        else:
            y = df['price']

        feature_cols = [c for c in df.columns if c != 'price']
        X = df[feature_cols]
        self.feature_names = feature_cols

        return X, y, df

    def compute_metrics(self, y_true, y_pred, n_features):
        if self.use_log_transform:
            y_true_orig = np.expm1(y_true)
            y_pred_orig = np.expm1(y_pred)
        else:
            y_true_orig = y_true
            y_pred_orig = y_pred

        n = len(y_true)
        r2 = r2_score(y_true_orig, y_pred_orig)
        adj_r2 = 1 - (1 - r2) * (n - 1) / (n - n_features - 1)
        mae = mean_absolute_error(y_true_orig, y_pred_orig)
        rmse = np.sqrt(mean_squared_error(y_true_orig, y_pred_orig))
        mape = mean_absolute_percentage_error(y_true_orig, y_pred_orig) * 100
        return {
            'r2': round(float(r2), 4),
            'adj_r2': round(float(adj_r2), 4),
            'mae': round(float(mae), 2),
            'rmse': round(float(rmse), 2),
            'mape': round(float(mape), 4),
        }

    def get_models(self):
        models = {
            'Linear Regression': LinearRegression(),
            'Ridge': Ridge(alpha=10.0),
            'Lasso': Lasso(alpha=10000.0, max_iter=10000),
            'Random Forest': RandomForestRegressor(n_estimators=200, max_depth=12,
                                                    min_samples_split=5, random_state=42, n_jobs=-1),
            'Extra Trees': ExtraTreesRegressor(n_estimators=200, max_depth=12,
                                               random_state=42, n_jobs=-1),
            'Gradient Boosting': GradientBoostingRegressor(n_estimators=200, learning_rate=0.05,
                                                            max_depth=5, random_state=42),
            'AdaBoost': AdaBoostRegressor(n_estimators=100, learning_rate=0.1, random_state=42),
            'MLP Regressor': MLPRegressor(hidden_layer_sizes=(64, 32), max_iter=2000,
                                          random_state=42, early_stopping=True,
                                          learning_rate_init=0.001, alpha=0.01),
        }
        if HAS_XGB:
            models['XGBoost'] = XGBRegressor(n_estimators=200, learning_rate=0.05,
                                              max_depth=6, random_state=42, verbosity=0)
        if HAS_LGB:
            models['LightGBM'] = LGBMRegressor(n_estimators=200, learning_rate=0.05,
                                                max_depth=6, random_state=42, verbose=-1)
        if HAS_CAT:
            models['CatBoost'] = CatBoostRegressor(iterations=200, learning_rate=0.05,
                                                    depth=6, random_state=42, verbose=0)
        return models

    def train(self):
        print("[ML Engine] Loading and preprocessing data...")
        X, y, df = self.load_and_preprocess()

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        X_train_s = self.scaler.fit_transform(X_train)
        X_test_s = self.scaler.transform(X_test)

        self.X_test = X_test_s
        self.y_test = y_test
        self.X_test_raw = X_test

        models = self.get_models()
        results = {}
        best_r2 = -999
        kf = KFold(n_splits=5, shuffle=True, random_state=42)

        print(f"[ML Engine] Training {len(models)} models...")
        for name, model in models.items():
            try:
                model.fit(X_train_s, y_train)
                y_pred = model.predict(X_test_s)
                metrics = self.compute_metrics(y_test.values, y_pred, X.shape[1])
                cv_scores = cross_val_score(model, X_train_s, y_train, cv=kf,
                                            scoring='r2', n_jobs=-1)
                metrics['cv_r2_mean'] = round(float(cv_scores.mean()), 4)
                metrics['cv_r2_std'] = round(float(cv_scores.std()), 4)
                results[name] = metrics
                print(f"  ✓ {name}: R²={metrics['r2']:.4f}, RMSE={metrics['rmse']:,.0f}")
                if metrics['r2'] > best_r2:
                    best_r2 = metrics['r2']
                    self.best_model = model
                    self.best_model_name = name
                    self.y_pred_best = y_pred
            except Exception as e:
                print(f"  ✗ {name} failed: {e}")

        # Try ensemble of top 3 models
        try:
            sorted_models = sorted(results.items(), key=lambda x: x[1]['r2'], reverse=True)[:3]
            top_estimators = [(n, models[n]) for n, _ in sorted_models]
            ensemble = VotingRegressor(estimators=top_estimators)
            ensemble.fit(X_train_s, y_train)
            y_pred_ens = ensemble.predict(X_test_s)
            ens_metrics = self.compute_metrics(y_test.values, y_pred_ens, X.shape[1])
            cv_ens = cross_val_score(ensemble, X_train_s, y_train, cv=kf,
                                     scoring='r2', n_jobs=-1)
            ens_metrics['cv_r2_mean'] = round(float(cv_ens.mean()), 4)
            ens_metrics['cv_r2_std'] = round(float(cv_ens.std()), 4)
            results['Ensemble (Top 3)'] = ens_metrics
            print(f"  ✓ Ensemble: R²={ens_metrics['r2']:.4f}")
            if ens_metrics['r2'] > best_r2:
                best_r2 = ens_metrics['r2']
                self.best_model = ensemble
                self.best_model_name = 'Ensemble (Top 3)'
                self.y_pred_best = y_pred_ens
        except Exception as e:
            print(f"  Ensemble failed: {e}")

        self.model_results = results
        self.trained = True

        # Feature importance from best tree model
        for name in ['Random Forest', 'Extra Trees', 'Gradient Boosting', 'XGBoost', 'LightGBM']:
            if name in models:
                try:
                    imp = models[name].feature_importances_
                    self.feature_importance = dict(zip(self.feature_names, imp.tolist()))
                    break
                except:
                    pass

        print(f"[ML Engine] ✅ Best model: {self.best_model_name} (R²={best_r2:.4f})")
        return results

    def predict(self, features: dict) -> dict:
        if not self.trained:
            raise RuntimeError("Model not trained yet")

        # Build feature vector
        row = {}
        row['area'] = float(features.get('area', 5000))
        row['bedrooms'] = float(features.get('bedrooms', 3))
        row['bathrooms'] = float(features.get('bathrooms', 2))
        row['stories'] = float(features.get('stories', 2))
        row['mainroad'] = 1 if features.get('mainroad', 'yes') == 'yes' else 0
        row['guestroom'] = 1 if features.get('guestroom', 'no') == 'yes' else 0
        row['basement'] = 1 if features.get('basement', 'no') == 'yes' else 0
        row['hotwaterheating'] = 1 if features.get('hotwaterheating', 'no') == 'yes' else 0
        row['airconditioning'] = 1 if features.get('airconditioning', 'no') == 'yes' else 0
        row['parking'] = float(features.get('parking', 1))
        row['prefarea'] = 1 if features.get('prefarea', 'no') == 'yes' else 0
        furnish_map = {'unfurnished': 0, 'semi-furnished': 1, 'furnished': 2}
        row['furnishingstatus'] = furnish_map.get(features.get('furnishingstatus', 'semi-furnished'), 1)

        # Feature engineering
        row['area_per_bedroom'] = row['area'] / (row['bedrooms'] + 1)
        row['bath_bed_ratio'] = row['bathrooms'] / (row['bedrooms'] + 1)
        row['total_rooms'] = row['bedrooms'] + row['bathrooms']
        row['luxury_score'] = row['airconditioning'] + row['prefarea'] + row['guestroom'] + row['hotwaterheating']
        row['amenity_score'] = row['basement'] + row['mainroad'] + row['parking']

        X = np.array([[row[f] for f in self.feature_names]])
        X_scaled = self.scaler.transform(X)
        pred = self.best_model.predict(X_scaled)[0]

        if self.use_log_transform:
            pred_price = float(np.expm1(pred))
        else:
            pred_price = float(pred)

        pred_price = max(pred_price, 100000)
        return {
            'predicted_price': round(pred_price, 2),
            'model_used': self.best_model_name,
            'price_formatted': f"₨ {pred_price:,.0f}"
        }

    def get_dashboard_data(self):
        if not self.trained:
            return {}

        # Actual vs predicted
        if self.use_log_transform:
            actual = np.expm1(self.y_test.values).tolist()
            predicted = np.expm1(self.y_pred_best).tolist()
        else:
            actual = self.y_test.values.tolist()
            predicted = self.y_pred_best.tolist()

        residuals = (np.array(actual) - np.array(predicted)).tolist()

        # Feature importance sorted
        fi_sorted = sorted(self.feature_importance.items(), key=lambda x: x[1], reverse=True)

        return {
            'actual_vs_predicted': {
                'actual': [round(v, 0) for v in actual[:80]],
                'predicted': [round(v, 0) for v in predicted[:80]]
            },
            'residuals': [round(r, 0) for r in residuals[:80]],
            'feature_importance': {k: round(v * 100, 2) for k, v in fi_sorted[:12]},
            'model_comparison': self.model_results
        }
