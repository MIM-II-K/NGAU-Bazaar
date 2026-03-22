from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

try:
    db = SessionLocal()
    result = db.execute(text("SELECT 1"))
    print("✅ Database connected successfully via .env:", result.scalar())
except Exception as e:
    print("❌ Connection failed:", e)
finally:
    db.close()
