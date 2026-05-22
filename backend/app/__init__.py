from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config

db = SQLAlchemy()

def create_app(config_class: type[Config] = Config):
    app = Flask(
        __name__, 
        static_folder='../../frontend/dist', 
        static_url_path='/'
    )
    app.config.from_object(config_class)
    
    CORS(app)
    
    db.init_app(app)
    
    with app.app_context():
        from .routes import main
        
        app.register_blueprint(main)
        
        db.create_all()
        
    return app
