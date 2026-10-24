from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.vehicle import Vehicle, Order
from app.models.user import User
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse, RestockRequest, OrderResponse
from app.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])

@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    vehicle_in: VehicleCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    vehicle = Vehicle(**vehicle_in.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.get("", response_model=List[VehicleResponse])
def get_vehicles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Vehicle).all()

@router.get("/search", response_model=List[VehicleResponse])
def search_vehicles(
    make: Optional[str] = Query(None),
    model: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="min_price cannot exceed max_price"
        )

    query = db.query(Vehicle)

    if make:
        query = query.filter(Vehicle.make.ilike(f"%{make.strip()}%"))
    if model:
        query = query.filter(Vehicle.model.ilike(f"%{model.strip()}%"))
    if category:
        query = query.filter(Vehicle.category.ilike(f"%{category.strip()}%"))
    if min_price is not None:
        query = query.filter(Vehicle.price >= min_price)
    if max_price is not None:
        query = query.filter(Vehicle.price <= max_price)

    return query.all()

@router.get("/orders/history", response_model=List[OrderResponse])
def get_order_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.is_admin:
        return db.query(Order).order_by(Order.created_at.desc()).all()
    return db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()

@router.delete("/orders/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order_record(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Order).filter(Order.id == order_id)
    if not current_user.is_admin:
        query = query.filter(Order.user_id == current_user.id)

    order = query.first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order record not found")

    db.delete(order)
    db.commit()
    return None

@router.delete("/orders", status_code=status.HTTP_204_NO_CONTENT)
def clear_order_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.is_admin:
        db.query(Order).delete()
    else:
        db.query(Order).filter(Order.user_id == current_user.id).delete()
    db.commit()
    return None

@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: int,
    vehicle_update: VehicleUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")

    update_data = vehicle_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(vehicle, field, val)

    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")

    db.delete(vehicle)
    db.commit()
    return None

@router.post("/{vehicle_id}/purchase", response_model=VehicleResponse)
def purchase_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify vehicle exists
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")

    # Atomic compare-and-swap update: decreases quantity ONLY IF quantity > 0
    updated_rows = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id,
        Vehicle.quantity > 0
    ).update({Vehicle.quantity: Vehicle.quantity - 1}, synchronize_session="fetch")

    if updated_rows == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vehicle is currently out of stock"
        )

    order = Order(
        user_id = current_user.id,
        vehicle_id = vehicle.id,
        purchase_price = vehicle.price
    )
    db.add(order)

    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.post("/{vehicle_id}/restock", response_model=VehicleResponse)
def restock_vehicle(
    vehicle_id: int,
    restock_in: RestockRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")

    # Atomic increment
    db.query(Vehicle).filter(Vehicle.id == vehicle_id).update(
        {Vehicle.quantity: Vehicle.quantity + restock_in.amount},
        synchronize_session="fetch"
    )
    db.commit()
    db.refresh(vehicle)
    return vehicle