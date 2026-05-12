import json
import os
from pathlib import Path
from typing import Any

import firebase_admin
from dotenv import load_dotenv
from firebase_admin import auth, credentials


load_dotenv()


def get_service_account_from_env() -> dict[str, Any] | None:
    raw_service_account = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")

    if not raw_service_account:
        return None

    try:
        service_account = json.loads(raw_service_account)
    except json.JSONDecodeError as error:
        raise RuntimeError(
            "FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON."
        ) from error

    private_key = service_account.get("private_key")

    if isinstance(private_key, str):
        service_account["private_key"] = private_key.replace("\\n", "\n")

    return service_account


def get_service_account_from_file() -> str:
    service_account_path = os.getenv(
        "FIREBASE_SERVICE_ACCOUNT_PATH",
        "firebase-service-account.json",
    )

    service_account_file = Path(service_account_path)

    if not service_account_file.is_absolute():
        backend_root = Path(__file__).resolve().parents[2]
        service_account_file = backend_root / service_account_file

    if not service_account_file.exists():
        raise RuntimeError(
            "Firebase service account was not found. "
            "Set FIREBASE_SERVICE_ACCOUNT_JSON in production or "
            f"provide a local file at: {service_account_file}"
        )

    return str(service_account_file)


def get_firebase_app():
    if firebase_admin._apps:
        return firebase_admin.get_app()

    service_account = get_service_account_from_env()

    if service_account:
        credential = credentials.Certificate(service_account)
    else:
        service_account_file = get_service_account_from_file()
        credential = credentials.Certificate(service_account_file)

    return firebase_admin.initialize_app(credential)


def verify_firebase_id_token(id_token: str) -> dict:
    get_firebase_app()
    return auth.verify_id_token(id_token)