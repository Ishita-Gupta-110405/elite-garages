from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.vehicle import Vehicle
from app.core_security import hash_password

def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if not db.query(User).filter(User.email == "admin@dealership.com").first():
            admin = User(
                email="admin@dealership.com",
                hashed_password=hash_password("AdminPass123!"),
                full_name="System Administrator",
                is_admin=True
            )
            buyer = User(
                email="buyer@dealership.com",
                hashed_password=hash_password("BuyerPass123!"),
                full_name="Alex Rivera",
                is_admin=False
            )
            db.add_all([admin, buyer])
            db.commit()
            print("Seeded default Admin and Buyer accounts.")

        if db.query(Vehicle).count() == 0:
            vehicles = [
                Vehicle(make="Porsche", model="911 GT3", category="Coupe", price=182900.0, quantity=2),
                Vehicle(make="Rivian", model="R1S", category="SUV", price=78000.0, quantity=5),
                Vehicle(make="BMW", model="M3 Competition", category="Sedan", price=84100.0, quantity=3),
                Vehicle(make="Ford", model="F-150 Lightning", category="Truck", price=69995.0, quantity=4),
                Vehicle(make="Toyota", model="GR86", category="Coupe", price=31500.0, quantity=0),  # Out of stock demo
                Vehicle(make="Lucid", model="Air Touring", category="Sedan", price=95000.0, quantity=2),
            ]
            db.add_all(vehicles)
            db.commit()
            print("Seeded 6 dealership vehicles.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()