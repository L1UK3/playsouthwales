import pytest
from app import create_app, db
from app.models import League, Event

class TestConfig:
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'test-secret-key'

@pytest.fixture
def app():
    app = create_app(TestConfig)
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()

@pytest.fixture
def sample_data(app):
    with app.app_context():
        league = League(name="Test League")
        db.session.add(league)
        db.session.commit()
        
        event = Event(
            name="Test Event",
            date="2026-05-10",
            league_id=league.id,
            event_type="STANDARD"
        )
        db.session.add(event)
        db.session.commit()
        return league, event
