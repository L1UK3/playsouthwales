import json
import os
from . import db
from .models import League, Event

def import_json_data():
    DATA_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
    leagues_file = os.path.join(DATA_DIR, 'leagues.json')
    events_file = os.path.join(DATA_DIR, 'events.json')

    if os.path.exists(leagues_file):
        with open(leagues_file, 'r', encoding='utf-8') as f:
            leagues_data = json.load(f)
            for item in leagues_data:
                if not League.query.get(item['leagueId']):
                    league = League(
                        id=item['leagueId'],
                        name=item['name'],
                        logo=item.get('logo'),
                        website=item.get('website'),
                        social_link=item.get('socialLink'),
                        pokemon_link=item.get('pokemonLink'),
                        brand_color=item.get('brandColor'),
                        web_link=item.get('webLink')
                    )
                    db.session.add(league)
            db.session.commit()

    if os.path.exists(events_file):
        with open(events_file, 'r', encoding='utf-8') as f:
            events_data = json.load(f)
            for item in events_data:
                if not Event.query.get(item['id']):
                    event = Event(
                        id=item['id'],
                        name=item['name'],
                        date=item['date'],
                        start_time=item.get('startTime'),
                        league_id=item['leagueId'],
                        ticket_link=item.get('ticketLink'),
                        event_type=item.get('type')
                    )
                    db.session.add(event)
            db.session.commit()
