from fastapi import Depends, Header, HTTPException, status

from app.core.config import get_admin_api_token
from app.core.current_user import get_current_user
from app.models.user import UserModel


def require_admin_token(
    x_admin_token: str | None = Header(default=None),
) -> None:
    expected_token = get_admin_api_token()

    if not x_admin_token or x_admin_token != expected_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing admin token",
        )


def require_admin_user(
    current_user: UserModel = Depends(get_current_user),
) -> UserModel:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return current_user