from database import SessionLocal
from models.user import User
from utils.auth import hash_password

db = SessionLocal()

admin = User(
    email="ennzaen@gmail.com",
    username="Admin",
    hashed_password=hash_password("Sabina@123"),
    role="admin"
)

db.add(admin)
db.commit()
print("Admin created successfully!")