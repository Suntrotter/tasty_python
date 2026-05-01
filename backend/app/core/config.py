import os

from dotenv import load_dotenv

load_dotenv()


def get_allowed_origins() -> list[str]:
    raw_origins = os.getenv(
        "FRONTEND_URLS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )

    return [
        origin.strip()
        for origin in raw_origins.split(",")
        if origin.strip()
    ]