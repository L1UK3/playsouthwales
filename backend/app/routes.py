from flask import Blueprint, request, jsonify, render_template
from .models import Event, League
import os
import json

main = Blueprint('main', __name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
api_types = os.path.join(DATA_DIR, 'types.json')

_cached_data = {
    'types': None
}

def load_types():
    if _cached_data['types'] is None:
        if os.path.exists(api_types):
            with open(api_types, 'r', encoding='utf-8') as f:
                _cached_data['types'] = json.load(f)
    return _cached_data['types']

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/events')
def getEvents():
    #/events?month=${month}&year=${year}
    month = request.args.get('month')
    year = request.args.get('year')
    if not month or not year:
        return jsonify([])
        
    date_prefix = f"{year}-{month.zfill(2)}"
    
    events = Event.query.filter(Event.date.like(f"{date_prefix}%")).all()
    
    output = []
    for event in events:
        output.append({
            'id': event.id,
            'name': event.name,
            'date': event.date,
            'startTime': event.start_time,
            'leagueId': event.league_id,
            'leagueName': event.league.name if event.league else 'Unknown',
            'ticketLink': event.ticket_link,
            'type': event.event_type,
            'game': event.game,
            'description': event.description,
            'prizes': event.prizes,
            'entryFee': event.entry_fee
        })
        
    return jsonify(output)

@main.route('/leagues')
def getLeagues():
    leagues = League.query.all()
    output = []
    for league in leagues:
        output.append({
            'leagueId': league.id,
            'name': league.name,
            'logo': league.logo,
            'website': league.website,
            'socialLink': league.social_link,
            'pokemonLink': league.pokemon_link,
            'brandColor': league.brand_color,
            'webLink': league.web_link
        })
    return jsonify(output)

@main.route('/types')
def getTypes():
    return jsonify(load_types())
