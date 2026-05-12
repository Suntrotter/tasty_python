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


def get_database_url() -> str:
    database_url = os.getenv("DATABASE_URL", "sqlite:///./tasty_python.db")

    # Render and some providers may expose URLs starting with postgres://.
    # SQLAlchemy expects postgresql://.
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    return database_url


def get_admin_api_token() -> str:
    return os.getenv("ADMIN_API_TOKEN", "tasty-python-admin")