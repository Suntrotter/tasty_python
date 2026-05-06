from fastapi import Header, HTTPException, status

from app.core.config import get_admin_api_token


def require_admin_token(
    x_admin_token: str | None = Header(default=None),
) -> None:
    expected_token = get_admin_api_token()

    if not x_admin_token or x_admin_token != expected_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing admin token",
        )