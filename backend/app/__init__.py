from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config
import os

db = SQLAlchemy()

def create_app(config_class: type[Config] = Config):
    app = Flask(__name__, static_folder='../../frontend/dist', static_url_path='')
    app.config.from_object(config_class)
    
    CORS(app)
    
    db.init_app(app)
    
    with app.app_context():
        from .routes import main
        from .utils import import_json_data
        
        app.register_blueprint(main)
        

        db.create_all()
        import_json_data()
        
    return app
