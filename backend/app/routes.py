from flask import Blueprint, request, jsonify, current_app

from .utils import load_types
from .models import Event, League
import os

main = Blueprint('main', __name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'data')

@main.route('/api/events')
def getEvents():
    """
    Fetch events filtered by month and year.
    Returns:
        Response: A JSON list of events matching the specified month and year.
    """
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

@main.route('/api/leagues')
def getLeagues():
    """
    Fetch all leagues.
    Returns:
        Response: A JSON list of all leagues.
    """
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

@main.route('/api/types')
def getTypes():
    """
    Fetch all types.
    Returns:
        Response: A JSON list of all types.
    """
    return jsonify(load_types())

@main.route('/api/admin/login', methods=['POST'])
def adminLogin():
    """
    Admin login endpoint.
    """
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    print(username + " " + password)
    if username == 'admin' and password == 'admin':
        return jsonify({'success': True})
    else:
        return jsonify({'success': False})
