
import pandas as pd

from sqlalchemy import inspect, text
from database.connection import Base, engine, SessionLocal
from database.models import Customer


def import_customers():

    csv_path = "data/telco_churn.csv"

    print("Reading dataset...")

    df = pd.read_csv(csv_path)

    # Map CSV columns to SQLAlchemy model columns
    column_mapping = {
        "customerID": "customer_id",
        "gender": "gender",
        "SeniorCitizen": "senior_citizen",
        "Partner": "partner",
        "Dependents": "dependents",
        "tenure": "tenure",
        "PhoneService": "phone_service",
        "MultipleLines": "multiple_lines",
        "InternetService": "internet_service",
        "OnlineSecurity": "online_security",
        "OnlineBackup": "online_backup",
        "DeviceProtection": "device_protection",
        "TechSupport": "tech_support",
        "StreamingTV": "streaming_tv",
        "StreamingMovies": "streaming_movies",
        "Contract": "contract",
        "PaperlessBilling": "paperless_billing",
        "PaymentMethod": "payment_method",
        "MonthlyCharges": "monthly_charges",
        "TotalCharges": "total_charges",
        "Churn": "actual_churn"
    }

    df = df.rename(columns=column_mapping)

    # Clean TotalCharges
    df["total_charges"] = pd.to_numeric(
        df["total_charges"], errors="coerce"
    ).fillna(0)

    # Convert missing values to None
    df = df.astype(object).where(pd.notna(df), None)

    # Create tables if they do not exist
    Base.metadata.create_all(bind=engine)

    # Add actual_churn column if an older table exists
    inspector = inspect(engine)
    existing_columns = [
        column["name"]
        for column in inspector.get_columns("customers")
    ]

    if "actual_churn" not in existing_columns:
        with engine.begin() as connection:
            connection.execute(
                text(
                    "ALTER TABLE customers "
                    "ADD COLUMN actual_churn VARCHAR(3) NULL"
                )
            )

    db = SessionLocal()

    try:
        records = df.to_dict(orient="records")

        print(f"Importing {len(records)} customers...")

        for record in records:

            existing = db.query(Customer).filter(
                Customer.customer_id == record["customer_id"]
            ).first()

            if existing:
                for key, value in record.items():
                    setattr(existing, key, value)
            else:
                new_customer = Customer(**record)
                db.add(new_customer)

        db.commit()

        total = db.query(Customer).count()

        print("Customer import successful!")
        print("Total customers in database:", total)

    except Exception as error:
        db.rollback()
        print("Import failed:", error)
        raise

    finally:
        db.close()


if __name__ == "__main__":
    import_customers()
