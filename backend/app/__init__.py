import os
from supabase import Client as SupabaseClient
from flask import Flask
from flask_cors import CORS
from supabase import create_client
from config import Config

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
        static_url_path='/',
        instance_path=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
    )

    supabase: SupabaseClient = create_client(
        os.environ.get("SUPABASE_URL"),
        os.environ.get("SUPABASE_KEY")
    )

    app.supabase = supabase

    app.config.from_object(config_class)
    
    CORS(app)
    
    with app.app_context():
        from .routes import main
        
        app.register_blueprint(main)
                
    return app

