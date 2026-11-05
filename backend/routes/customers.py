
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database.connection import get_db
from database.models import Customer
from schemas.customer import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse
)

router = APIRouter(
    prefix="/api/customers",
    tags=["Customers"]
)


# 1. CREATE CUSTOMER
@router.post(
    "/",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED
)
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db)
):
    existing_customer = db.query(Customer).filter(
        Customer.customer_id == customer.customer_id
    ).first()

    if existing_customer:
        raise HTTPException(
            status_code=409,
            detail="Customer already exists"
        )

    new_customer = Customer(**customer.model_dump())

    try:
        db.add(new_customer)
        db.commit()
        db.refresh(new_customer)
        return new_customer

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Customer already exists"
        )


# 2. GET ALL CUSTOMERS WITH SEARCH AND PAGINATION
@router.get("/")
def get_customers(
    search: str = Query(default="", max_length=100),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Customer)

    if search:
        query = query.filter(
            Customer.customer_id.ilike(f"%{search}%")
        )

    total = query.count()

    customers = (
        query.order_by(Customer.customer_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "customers": customers
    }


# 3. GET CUSTOMER BY ID
@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
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

    return customer


# 4. UPDATE CUSTOMER
@router.patch("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: str,
    customer_data: CustomerUpdate,
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

    update_data = customer_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(customer, key, value)

    db.commit()
    db.refresh(customer)

    return customer


# 5. DELETE CUSTOMER
@router.delete("/{customer_id}")
def delete_customer(
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

    db.delete(customer)
    db.commit()

    return {
        "message": "Customer deleted successfully",
        "customer_id": customer_id
    }
