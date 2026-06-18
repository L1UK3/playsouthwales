import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """
    Configuration class for the Flask application.
    Attributes:
        SECRET_KEY (str): The secret key used for session management.
        SQLALCHEMY_DATABASE_URI (str): The URI for the database.
        SQLALCHEMY_TRACK_MODIFICATIONS (bool): Whether to track database modifications.
    """
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    
    # Supabase connection URLs may start with postgres:// which SQLAlchemy 1.4+ does not support
    db_url = os.getenv('DATABASE_URL', 'sqlite:///site.db')
    if db_url and db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)
        
    SQLALCHEMY_DATABASE_URI = db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
