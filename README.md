# Predictra – AI-Powered Customer Intelligence & Retention Platform

Predictra is an AI-powered customer intelligence and retention platform built using React, FastAPI, MySQL, and Machine Learning.

## Technology Stack

- Frontend: React, Vite, JavaScript
- Backend: Python, FastAPI
- Database: MySQL
- ORM: SQLAlchemy
- Machine Learning: Scikit-learn
- Data Processing: Pandas, NumPy

## Key Features

1. Customer Directory – View and explore customer records.
2. Churn Prediction – Predict customer churn probability using a trained ML model.
3. Dashboard – Monitor customer metrics and business performance.
4. Analytics – Visualize customer and churn trends.
5. Retention Hub – Track retention actions with MySQL persistence.
6. Settings – Manage workspace profile settings.

## Project Structure

```text
Predictra/
├── backend/
│   ├── database/
│   ├── model/
│   │   └── customer_churn_model.pkl
│   ├── routes/
│   ├── main.py
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   └── services/
    └── package.json
```

## Requirements

- Python
- Node.js and npm
- MySQL Server
- Git

## Backend Setup

Open a terminal inside the `backend` folder.

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the backend folder:

```env
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=predictra_db
```

Create the database in MySQL:

```sql
CREATE DATABASE predictra_db;
```

Start the backend:

```bash
uvicorn main:app --reload
```
Backend URL: https://predictra-p8pz.onrender.com
API documentation: https://predictra-p8pz.onrender.com/docs


## Frontend Setup

Open another terminal inside the `frontend` folder.

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed by Vite.

The frontend API configuration should point to the backend URL during local development.

## Machine Learning Model

The trained churn prediction model is stored at:

`backend/model/customer_churn_model.pkl`

Predictra uses a Logistic Regression pipeline with a churn decision threshold of 0.40.

The existing trained model and prediction calculations are retained.

Ensure the deployed environment uses a compatible Scikit-learn version.

## Deployment Preparation

Before deployment:

- Verify frontend and backend functionality.
- Verify MySQL connectivity.
- Verify all API endpoints.
- Verify customer churn predictions.
- Verify dashboard and analytics.
- Verify retention action persistence.
- Configure production environment variables.
- Configure the production frontend API URL.
- Include the trained model file in backend deployment.
- Configure production CORS.
- Never upload passwords or `.env` files to GitHub.

## Known MVP Limitations

- Add Customer is currently a placeholder.
- CSV export covers the filtered records loaded on the current page.
- Risk filtering applies to the currently loaded page.

These existing behaviors are intentionally retained for this MVP.

## Security

- Keep database credentials private.
- Never commit `.env` files.
- Use HTTPS in production.
- Restrict database and API access appropriately.

## License

Add the appropriate project license before making the repository public.
