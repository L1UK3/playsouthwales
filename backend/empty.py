# empty database for testing


from app import create_app, db

def empty_database():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()
    print("Database has been emptied")

if __name__ == "__main__":
    empty_database()
