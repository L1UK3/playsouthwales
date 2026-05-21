from app import create_app, db
from app.utils import import_json_data

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        import_json_data()
    
    app.run(debug=True, port=5000)
