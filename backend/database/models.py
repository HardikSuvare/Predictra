
from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime
)

from database.connection import Base


class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(String(50), primary_key=True, index=True)

    gender = Column(String(20))
    senior_citizen = Column(Integer)
    partner = Column(String(10))
    dependents = Column(String(10))
    tenure = Column(Integer)

    phone_service = Column(String(10))
    multiple_lines = Column(String(30))
    internet_service = Column(String(30))
    online_security = Column(String(30))
    online_backup = Column(String(30))
    device_protection = Column(String(30))
    tech_support = Column(String(30))
    streaming_tv = Column(String(30))
    streaming_movies = Column(String(30))

    contract = Column(String(30))
    paperless_billing = Column(String(10))
    payment_method = Column(String(50))

    monthly_charges = Column(Float)
    total_charges = Column(Float)

    actual_churn = Column(String(3), nullable=True)


class WorkspaceProfile(Base):
    __tablename__ = "workspace_profile"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)


class RetentionAction(Base):
    __tablename__ = "retention_actions"

    id = Column(Integer, primary_key=True, index=True)

    action_key = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    is_completed = Column(Boolean, default=False, nullable=False)

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
