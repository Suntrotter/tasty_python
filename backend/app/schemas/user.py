from pydantic import BaseModel


class UserProfile(BaseModel):
    id: int
    firebase_uid: str
    email: str | None = None
    display_name: str | None = None
    photo_url: str | None = None
    is_admin: bool = False