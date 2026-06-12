# empty database for testing


from app import create_app, db

def empty_database():
    app = create_app()
    with app.app_context():
        # Drop all tables
        db.drop_all()
        # Recreate all tables
        db.create_all()
    print("Database has been emptied and recreated.")

if __name__ == "__main__":
    empty_database()
