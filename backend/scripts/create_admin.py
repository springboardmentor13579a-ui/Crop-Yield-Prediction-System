from pathlib import Path
import sys, getpass
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from sqlalchemy import func
from app.database import Base, engine, SessionLocal
from app.models import User
from app.security import hash_password

Base.metadata.create_all(bind=engine)

def main():
    print("Create YieldSense AI administrator")
    name = input("Full name: ").strip()
    email = input("Email: ").strip().lower()
    password = getpass.getpass("Password (min 8 chars): ")
    if len(name) < 2 or "@" not in email or len(password) < 8:
        raise SystemExit("Invalid name, email, or password.")
    db = SessionLocal()
    try:
        existing = db.query(User).filter(func.lower(User.email) == email).first()
        if existing:
            if existing.role != "admin":
                raise SystemExit("That email already belongs to a farmer account.")
            existing.full_name = name
            existing.password_hash = hash_password(password)
            existing.is_active = True
            print("Existing admin password updated.")
        else:
            db.add(User(full_name=name, email=email, role="admin", password_hash=hash_password(password), is_active=True))
            print("Admin created.")
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    main()
