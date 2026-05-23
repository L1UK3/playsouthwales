from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config

db = SQLAlchemy()

def create_app(config_class: type[Config] = Config):
    """
    Create a Flask application instance.
    Args:
        config_class (type[Config]): The configuration class to use for the app.

    Returns:
        Flask: The initialized Flask application instance.
    """
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
