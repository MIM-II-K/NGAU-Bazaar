from sqlalchemy import Column, Integer, String, Boolean
from database import Base
from sqlalchemy.orm import relationship
from constants.roles import Role

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    role = Column(String, default=Role.USER, nullable=False)

    phone = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    profile_image_url = Column(String, nullable=True)
    
    orders = relationship("Order", back_populates="user")

    vendor_profile = relationship(
        "Vendor",
        uselist=False,
        back_populates="user",
    )