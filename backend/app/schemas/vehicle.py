from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class VehicleBase(BaseModel):
    make: str = Field(..., min_length=1, max_length=50)
    model: str = Field(..., min_length=1, max_length=50)
    category: str = Field(..., min_length=1, max_length=50)
    price: float = Field(..., ge=0, description="Price must be non-negative")
    quantity: int = Field(..., ge=0, description="Quantity must be non-negative")

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    make: Optional[str] = Field(None, min_length=1, max_length=50)
    model: Optional[str] = Field(None, min_length=1, max_length=50)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    price: Optional[float] = Field(None, ge=0)
    quantity: Optional[int] = Field(None, ge=0)

class RestockRequest(BaseModel):
    amount: int = Field(..., gt=0, description="Restock amount must be greater than zero")

class VehicleResponse(VehicleBase):
    id: int

    model_config = ConfigDict(from_attributes=True)