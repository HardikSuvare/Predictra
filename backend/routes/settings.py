
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import WorkspaceProfile


router = APIRouter(
    prefix="/api/settings",
    tags=["Settings"]
)


class ProfileUpdate(BaseModel):
    name: str
    email: EmailStr


@router.get("/profile")
def get_profile(db: Session = Depends(get_db)):

    profile = db.query(WorkspaceProfile).filter(
        WorkspaceProfile.id == 1
    ).first()

    if not profile:
        profile = WorkspaceProfile(
            id=1,
            name="Hardik Suvare",
            email="admin@predictra.app"
        )

        db.add(profile)
        db.commit()
        db.refresh(profile)

    return {
        "id": profile.id,
        "name": profile.name,
        "email": profile.email
    }


@router.put("/profile")
def update_profile(
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db)
):

    profile = db.query(WorkspaceProfile).filter(
        WorkspaceProfile.id == 1
    ).first()

    if not profile:
        profile = WorkspaceProfile(id=1)

        db.add(profile)

    profile.name = profile_data.name
    profile.email = profile_data.email

    try:
        db.commit()
        db.refresh(profile)

        return {
            "message": "Profile updated successfully",
            "id": profile.id,
            "name": profile.name,
            "email": profile.email
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to update profile"
        )
