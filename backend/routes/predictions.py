
from pathlib import Path

import joblib
import pandas as pd

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import Customer


router = APIRouter(
    prefix="/api/predictions",
    tags=["Predictions"]
)


# --------------------------------------------------
# 1. LOAD TRAINED MACHINE LEARNING MODEL
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_PATH = BASE_DIR / "model" / "customer_churn_model.pkl"

model = joblib.load(MODEL_PATH)


# --------------------------------------------------
# 2. MODEL FEATURES
# --------------------------------------------------

FEATURES = [
    "gender",
    "SeniorCitizen",
    "Partner",
    "Dependents",
    "tenure",
    "PhoneService",
    "MultipleLines",
    "InternetService",
    "OnlineSecurity",
    "OnlineBackup",
    "DeviceProtection",
    "TechSupport",
    "StreamingTV",
    "StreamingMovies",
    "Contract",
    "PaperlessBilling",
    "PaymentMethod",
    "MonthlyCharges",
    "TotalCharges"
]


# Churn prediction threshold
CHURN_THRESHOLD = 0.40


# --------------------------------------------------
# 3. CONVERT CUSTOMER DATABASE RECORD TO MODEL INPUT
# --------------------------------------------------

def customer_to_dict(customer):

    return {
        "gender": customer.gender,
        "SeniorCitizen": customer.senior_citizen,
        "Partner": customer.partner,
        "Dependents": customer.dependents,
        "tenure": customer.tenure,
        "PhoneService": customer.phone_service,
        "MultipleLines": customer.multiple_lines,
        "InternetService": customer.internet_service,
        "OnlineSecurity": customer.online_security,
        "OnlineBackup": customer.online_backup,
        "DeviceProtection": customer.device_protection,
        "TechSupport": customer.tech_support,
        "StreamingTV": customer.streaming_tv,
        "StreamingMovies": customer.streaming_movies,
        "Contract": customer.contract,
        "PaperlessBilling": customer.paperless_billing,
        "PaymentMethod": customer.payment_method,
        "MonthlyCharges": customer.monthly_charges,
        "TotalCharges": customer.total_charges
    }


# --------------------------------------------------
# 4. PREDICT A SINGLE CUSTOMER
# --------------------------------------------------

def predict_customer(customer):

    customer_data = customer_to_dict(customer)

    input_df = pd.DataFrame(
        [customer_data],
        columns=FEATURES
    )

    probabilities = model.predict_proba(input_df)[0]

    churn_index = list(model.classes_).index("Yes")

    churn_probability = float(
        probabilities[churn_index]
    )

    predicted_churn = (
        "Yes"
        if churn_probability >= CHURN_THRESHOLD
        else "No"
    )

    probability_percentage = churn_probability * 100

    if probability_percentage >= 65:
        risk_level = "High"

    elif churn_probability >= CHURN_THRESHOLD:
        risk_level = "Medium"

    else:
        risk_level = "Low"

    return {
        "customer_id": customer.customer_id,
        "predicted_churn": predicted_churn,
        "churn_probability": round(
            probability_percentage, 2
        ),
        "risk_level": risk_level,
        "actual_churn": customer.actual_churn,
        "threshold": CHURN_THRESHOLD
    }


# --------------------------------------------------
# 5. PREDICT ALL CUSTOMERS IN ONE BATCH
# --------------------------------------------------

def predict_customers_batch(customers):

    if not customers:
        return []

    customer_data = [
        customer_to_dict(customer)
        for customer in customers
    ]

    input_df = pd.DataFrame(
        customer_data,
        columns=FEATURES
    )

    # Run the trained ML model once for all customers.
    probabilities = model.predict_proba(input_df)

    churn_index = list(model.classes_).index("Yes")

    churn_scores = probabilities[:, churn_index]

    results = []

    for customer, score in zip(customers, churn_scores):

        probability_percentage = float(score) * 100

        predicted_churn = (
            "Yes"
            if probability_percentage >= CHURN_THRESHOLD * 100
            else "No"
        )

        if probability_percentage >= 65:
            risk_level = "High"

        elif probability_percentage >= CHURN_THRESHOLD * 100:
            risk_level = "Medium"

        else:
            risk_level = "Low"

        results.append({
            "customer_id": customer.customer_id,
            "predicted_churn": predicted_churn,
            "churn_probability": round(
                probability_percentage, 2
            ),
            "risk_level": risk_level,
            "actual_churn": customer.actual_churn,
            "threshold": CHURN_THRESHOLD
        })

    return results


# --------------------------------------------------
# 6. PREDICT AN INDIVIDUAL CUSTOMER
# --------------------------------------------------

@router.get("/customer/{customer_id}")
def predict_existing_customer(
    customer_id: str,
    db: Session = Depends(get_db)
):

    customer = db.query(Customer).filter(
        Customer.customer_id == customer_id
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    try:
        return predict_customer(customer)

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(error)}"
        )


# --------------------------------------------------
# 7. PREDICT ALL CUSTOMERS WITH PAGINATION
# --------------------------------------------------

@router.get("/all")
def predict_all_customers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):

    if skip < 0 or limit < 1 or limit > 1000:
        raise HTTPException(
            status_code=422,
            detail="Invalid pagination parameters. Limit must be between 1 and 1000."
        )

    try:

        customers = db.query(Customer).order_by(
            Customer.customer_id
        ).offset(skip).limit(limit).all()

        results = predict_customers_batch(customers)

        return {
            "total_returned": len(results),
            "skip": skip,
            "limit": limit,
            "predictions": results
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(error)}"
        )


# --------------------------------------------------
# 8. OPTIMIZED DASHBOARD SUMMARY API
# --------------------------------------------------

@router.get("/dashboard-summary")
def get_dashboard_summary(
    db: Session = Depends(get_db)
):

    try:

        # Fetch all customer records from MySQL.
        customers = db.query(Customer).order_by(
            Customer.customer_id
        ).all()

        if not customers:

            return {
                "metrics": {
                    "total": 0,
                    "actualChurn": 0,
                    "predictedChurn": 0,
                    "highRisk": 0,
                    "mediumRisk": 0,
                    "lowRisk": 0,
                    "retentionRate": 0,
                    "revenueAtRisk": 0
                },
                "contractData": [],
                "riskData": [],
                "revenueData": [],
                "tenureData": [],
                "customersToWatch": []
            }

        # Generate predictions for all customers in one batch.
        predictions = predict_customers_batch(customers)

        prediction_by_id = {
            prediction["customer_id"]: prediction
            for prediction in predictions
        }

        total = len(customers)

        # ------------------------------------------
        # DASHBOARD KPI CALCULATIONS
        # ------------------------------------------

        actual_churn = sum(
            1 for customer in customers
            if customer.actual_churn == "Yes"
        )

        predicted_churn = sum(
            1 for prediction in predictions
            if prediction["predicted_churn"] == "Yes"
        )

        high_risk = sum(
            1 for prediction in predictions
            if prediction["risk_level"] == "High"
        )

        medium_risk = sum(
            1 for prediction in predictions
            if prediction["risk_level"] == "Medium"
        )

        low_risk = sum(
            1 for prediction in predictions
            if prediction["risk_level"] == "Low"
        )

        # Monthly revenue exposed to predicted churn.
        revenue_at_risk = sum(
            float(customer.monthly_charges or 0)
            for customer in customers
            if (
                prediction_by_id[customer.customer_id][
                    "churn_probability"
                ] >= CHURN_THRESHOLD * 100
            )
        )

        retention_rate = (
            ((total - actual_churn) / total) * 100
            if total else 0
        )

        # ------------------------------------------
        # CONTRACT-WISE ACTUAL CHURN
        # ------------------------------------------

        contract_groups = {}

        for customer in customers:

            contract = customer.contract or "Unknown"

            if contract not in contract_groups:

                contract_groups[contract] = {
                    "type": contract,
                    "total": 0,
                    "churned": 0
                }

            contract_groups[contract]["total"] += 1

            if customer.actual_churn == "Yes":
                contract_groups[contract]["churned"] += 1

        contract_data = []

        for group in contract_groups.values():

            churn_rate = (
                group["churned"] / group["total"] * 100
                if group["total"] else 0
            )

            contract_data.append({
                **group,
                "rate": round(churn_rate, 1)
            })

        # ------------------------------------------
        # RISK DISTRIBUTION
        # ------------------------------------------

        risk_data = [
            {
                "name": "High",
                "value": high_risk,
                "color": "#f0788d"
            },
            {
                "name": "Medium",
                "value": medium_risk,
                "color": "#f2b95f"
            },
            {
                "name": "Low",
                "value": low_risk,
                "color": "#35c99a"
            }
        ]

        # ------------------------------------------
        # REVENUE AT RISK BY CONTRACT
        # ------------------------------------------

        revenue_groups = {}

        for customer in customers:

            prediction = prediction_by_id[
                customer.customer_id
            ]

            if (
                prediction["churn_probability"]
                < CHURN_THRESHOLD * 100
            ):
                continue

            contract = customer.contract or "Unknown"

            if contract not in revenue_groups:

                revenue_groups[contract] = {
                    "contract": contract,
                    "revenue": 0,
                    "customers": 0
                }

            revenue_groups[contract]["revenue"] += float(
                customer.monthly_charges or 0
            )

            revenue_groups[contract]["customers"] += 1

        revenue_data = [
            {
                **group,
                "revenue": round(group["revenue"], 2)
            }
            for group in revenue_groups.values()
        ]

        # ------------------------------------------
        # CUSTOMER TENURE DISTRIBUTION
        # ------------------------------------------

        tenure_data = [
            {
                "label": "0–12 months",
                "min": 0,
                "max": 12,
                "value": 0
            },
            {
                "label": "13–24 months",
                "min": 13,
                "max": 24,
                "value": 0
            },
            {
                "label": "25–48 months",
                "min": 25,
                "max": 48,
                "value": 0
            },
            {
                "label": "49–72 months",
                "min": 49,
                "max": 72,
                "value": 0
            }
        ]

        for customer in customers:

            tenure = int(customer.tenure or 0)

            for group in tenure_data:

                if group["min"] <= tenure <= group["max"]:

                    group["value"] += 1
                    break

        # ------------------------------------------
        # TOP FIVE HIGH-RISK CUSTOMERS
        # ------------------------------------------

        high_risk_predictions = [
            prediction
            for prediction in predictions
            if prediction["predicted_churn"] == "Yes"
        ]

        top_predictions = sorted(
            high_risk_predictions,
            key=lambda prediction: prediction[
                "churn_probability"
            ],
            reverse=True
        )[:5]

        customer_by_id = {
            customer.customer_id: customer
            for customer in customers
        }

        customers_to_watch = []

        for prediction in top_predictions:

            customer = customer_by_id[
                prediction["customer_id"]
            ]

            customers_to_watch.append({
                **prediction,
                "customer": {
                    "customer_id": customer.customer_id,
                    "contract": customer.contract
                }
            })

        # ------------------------------------------
        # FINAL DASHBOARD RESPONSE
        # ------------------------------------------

        return {

            "metrics": {
                "total": total,
                "actualChurn": actual_churn,
                "predictedChurn": predicted_churn,
                "highRisk": high_risk,
                "mediumRisk": medium_risk,
                "lowRisk": low_risk,
                "retentionRate": round(retention_rate, 1),
                "revenueAtRisk": round(revenue_at_risk, 2)
            },

            "contractData": contract_data,

            "riskData": risk_data,

            "revenueData": revenue_data,

            "tenureData": tenure_data,

            "customersToWatch": customers_to_watch

        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Dashboard summary failed: {str(error)}"
        )
