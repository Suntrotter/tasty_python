from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.firebase import verify_firebase_id_token
from app.db.database import get_db
from app.models.user import UserModel


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> UserModel:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token",
        )

    try:
        decoded_token = verify_firebase_id_token(credentials.credentials)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authorization token",
        )

    firebase_uid = decoded_token.get("uid")

    if not firebase_uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase token does not contain a user id",
        )

    email = decoded_token.get("email")
    display_name = decoded_token.get("name")
    photo_url = decoded_token.get("picture")

    user = db.scalar(
        select(UserModel).where(UserModel.firebase_uid == firebase_uid)
    )

    if not user:
        user = UserModel(
            firebase_uid=firebase_uid,
            email=email,
            display_name=display_name,
            photo_url=photo_url,
        )
        db.add(user)
    else:
        user.email = email
        user.display_name = display_name
        user.photo_url = photo_url

    db.commit()
    db.refresh(user)

    return user