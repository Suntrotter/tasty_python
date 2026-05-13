import argparse
import sys
from pathlib import Path

from sqlalchemy import select


BACKEND_ROOT = Path(__file__).resolve().parents[1]

if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.db.database import SessionLocal
from app.models.user import UserModel


def make_admin(email: str) -> None:
    normalized_email = email.strip().lower()

    with SessionLocal() as db:
        user = db.scalar(
            select(UserModel).where(UserModel.email == normalized_email)
        )

        if not user:
            print(f"No user found with email: {normalized_email}")
            return

        user.is_admin = True
        db.commit()

        print(f"Admin access granted to: {normalized_email}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Grant admin access to a Tasty Python user."
    )
    parser.add_argument("email", help="User email to promote to admin")

    args = parser.parse_args()

    make_admin(args.email)


if __name__ == "__main__":
    main()