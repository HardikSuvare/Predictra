
from pydantic import BaseModel, ConfigDict
from typing import Optional


class CustomerBase(BaseModel):
    gender: Optional[str] = None
    senior_citizen: Optional[int] = None
    partner: Optional[str] = None
    dependents: Optional[str] = None
    tenure: Optional[int] = None

    phone_service: Optional[str] = None
    multiple_lines: Optional[str] = None
    internet_service: Optional[str] = None
    online_security: Optional[str] = None
    online_backup: Optional[str] = None
    device_protection: Optional[str] = None
    tech_support: Optional[str] = None
    streaming_tv: Optional[str] = None
    streaming_movies: Optional[str] = None

    contract: Optional[str] = None
    paperless_billing: Optional[str] = None
    payment_method: Optional[str] = None

    monthly_charges: Optional[float] = None
    total_charges: Optional[float] = None


class CustomerCreate(CustomerBase):
    customer_id: str


class CustomerUpdate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    customer_id: str

    model_config = ConfigDict(from_attributes=True)
