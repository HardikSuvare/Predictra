
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import RetentionAction


router = APIRouter(
    prefix="/api/retention",
    tags=["Retention"]
)


# The three existing Retention Hub playbooks
DEFAULT_ACTIONS = [
    {
        "action_key": "month_to_month",
        "title": "Focus on month-to-month customers"
    },
    {
        "action_key": "high_risk_outreach",
        "title": "Prioritize high-risk customer outreach"
    },
    {
        "action_key": "highest_probability_review",
        "title": "Review customers with the highest churn probability"
    }
]


class RetentionActionUpdate(BaseModel):
    is_completed: bool


# GET: Return all retention actions
@router.get("/actions")
def get_retention_actions(db: Session = Depends(get_db)):

    try:
        # Create default action records if they do not exist
        for action in DEFAULT_ACTIONS:
            existing = (
                db.query(RetentionAction)
                .filter(
                    RetentionAction.action_key == action["action_key"]
                )
                .first()
            )

            if not existing:
                db.add(
                    RetentionAction(
                        action_key=action["action_key"],
                        is_completed=False
                    )
                )

        db.commit()

        records = db.query(RetentionAction).all()

        status_map = {
            record.action_key: record.is_completed
            for record in records
        }

        return {
            "actions": [
                {
                    **action,
                    "is_completed": status_map.get(
                        action["action_key"], False
                    )
                }
                for action in DEFAULT_ACTIONS
            ]
        }

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Unable to load retention actions: {str(error)}"
        )


# PUT: Update a retention action
@router.put("/actions/{action_key}")
def update_retention_action(
    action_key: str,
    payload: RetentionActionUpdate,
    db: Session = Depends(get_db)
):

    allowed_keys = {
        action["action_key"]
        for action in DEFAULT_ACTIONS
    }

    if action_key not in allowed_keys:
        raise HTTPException(
            status_code=404,
            detail="Retention action not found."
        )

    try:
        action = (
            db.query(RetentionAction)
            .filter(RetentionAction.action_key == action_key)
            .first()
        )

        if not action:
            action = RetentionAction(
                action_key=action_key,
                is_completed=payload.is_completed
            )
            db.add(action)
        else:
            action.is_completed = payload.is_completed
            action.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(action)

        return {
            "message": "Retention action updated successfully.",
            "action_key": action.action_key,
            "is_completed": action.is_completed,
            "updated_at": action.updated_at
        }

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Unable to update retention action: {str(error)}"
        )
