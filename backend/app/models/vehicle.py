from sqlalchemy import Column, Integer, String, Float, CheckConstraint
from app.database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    make = Column(String, nullable=False, index=True)
    model = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False, default=0)

    # Database-level integrity constraint to guarantee stock never drops below 0
    __table_args__ = (
        CheckConstraint("quantity >= 0", name="check_positive_quantity"),
        CheckConstraint("price >= 0", name="check_positive_price"),
    )