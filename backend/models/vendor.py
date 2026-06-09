from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), unique=True)

    store_name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)

    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)

    logo = Column(String, nullable=True)
    banner = Column(String, nullable=True)

    description = Column(String, nullable=True)

    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="vendor_profile")
    
    products = relationship(
        "Product",
        back_populates="vendor",
        cascade="all, delete-orphan"
    )