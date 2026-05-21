from . import db

class League(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    logo = db.Column(db.String(255))
    website = db.Column(db.String(255))
    social_link = db.Column(db.String(255))
    pokemon_link = db.Column(db.String(255))
    brand_color = db.Column(db.String(50))
    web_link = db.Column(db.String(255))
    events = db.relationship('Event', backref='league', lazy=True)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(50), nullable=False)  # Storing as string for now to match JSON prefix filtering
    start_time = db.Column(db.String(50))
    league_id = db.Column(db.Integer, db.ForeignKey('league.id'), nullable=False)
    ticket_link = db.Column(db.String(255))
    event_type = db.Column(db.String(50))  # 'type' is a reserved word in python, using event_type
    game = db.Column(db.String(20))
    description = db.Column(db.Text)
    prizes = db.Column(db.Text)
    entry_fee = db.Column(db.String(50))
