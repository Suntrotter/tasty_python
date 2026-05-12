from fastapi import APIRouter, Depends

from app.core.current_user import get_current_user
from app.models.user import UserModel
from app.schemas.user import UserProfile


router = APIRouter(prefix="/api", tags=["me"])


def user_to_response(user: UserModel) -> dict:
    return {
        "id": user.id,
        "firebase_uid": user.firebase_uid,
        "email": user.email,
        "display_name": user.display_name,
        "photo_url": user.photo_url,
    }


@router.get("/me", response_model=UserProfile)
def read_current_user(
    current_user: UserModel = Depends(get_current_user),
):
    return user_to_response(current_user)