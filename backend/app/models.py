from . import db

class League(db.Model):
    """
    Represents a league in the database.
    Attributes:
        id (int): The unique identifier for the league.
        name (str): The name of the league.
        logo (str): The URL to the logo of the league.
        website (str): The URL to the league's official website.
        social_link (str): The URL to the league's social media profile.
        pokemon_link (str): The URL to the league's official Pokémon event page.
        brand_color (str): The hex code or name of the league's brand color.
        web_link (str): An additional web link for the league.
        events (list): A list of events associated with the league.
        location (str): The location of the league.
        latitude (float): The latitude coordinate of the location.
        longitude (float): The longitude coordinate of the location.
    """
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    logo = db.Column(db.String(255))
    website = db.Column(db.String(255))
    social_link = db.Column(db.String(255))
    pokemon_link = db.Column(db.String(255))
    brand_color = db.Column(db.String(50))
    web_link = db.Column(db.String(255))
    events = db.relationship('Event', backref='league', lazy=True)
    location = db.Column(db.String(255))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    
class Event(db.Model):
    """
    Represents an event in the database.
    Attributes:
        id (int): The unique identifier for the event.
        name (str): The name of the event.
        date (str): The date of the event.
        start_time (str): The start time of the event.
        league_id (int): The ID of the associated league.
        ticket_link (str): The URL to the event's ticket page.
        event_type (str): The type of the event.
        game (str): The game associated with the event.
        description (str): A description of the event.
        prizes (str): Prizes associated with the event.
        entry_fee (str): The entry fee for the event.
    """
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(50), nullable=False) 
    start_time = db.Column(db.String(50))
    league_id = db.Column(db.Integer, db.ForeignKey('league.id'), nullable=False)
    ticket_link = db.Column(db.String(255))
    event_type = db.Column(db.String(50)) 
    game = db.Column(db.String(20))
    description = db.Column(db.Text)
    prizes = db.Column(db.Text)
    entry_fee = db.Column(db.String(50))
