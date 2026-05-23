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
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///site.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
