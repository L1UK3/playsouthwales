from flask import Blueprint, request, jsonify, current_app

from .utils import load_types
from .models import Event, League
from . import db
import os

main = Blueprint('main', __name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'data')

@main.route('/api/events')
def getEvents():
    """
    Fetch events, optionally filtered by league, month, and year.
    Returns:
        Response: A JSON list of matching events.
    """
    month = request.args.get('month')
    year = request.args.get('year')
    league_id = request.args.get('leagueId')

    query = Event.query

    if league_id:
        query = query.filter(Event.league_id == league_id)

    if month and year:
        date_prefix = f"{year}-{month.zfill(2)}"
        query = query.filter(Event.date.like(f"{date_prefix}%"))

    events = query.all()

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
            'webLink': league.web_link,
            'location': league.location,
            'latitude': league.latitude,
            'longitude': league.longitude
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

@main.route('/api/events', methods=['POST'])
def createEvent():
    """
    Create a new event.
    """
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    name = data.get('name')
    date = data.get('date')
    league_id = data.get('leagueId')
    event_type = data.get('type')
    game = data.get('game')

    if not name or not date or not league_id or not event_type or not game:
        return jsonify({'error': 'Missing required fields: name, date, leagueId, type, game'}), 400

    try:
        new_event = Event(
            name=name,
            date=date,
            start_time=data.get('startTime'),
            league_id=league_id,
            ticket_link=data.get('ticketLink'),
            event_type=event_type,
            game=game,
            description=data.get('description'),
            prizes=data.get('prizes'),
            entry_fee=data.get('entryFee')
        )
        db.session.add(new_event)
        db.session.commit()

        return jsonify({
            'id': new_event.id,
            'name': new_event.name,
            'date': new_event.date,
            'startTime': new_event.start_time,
            'leagueId': new_event.league_id,
            'leagueName': new_event.league.name if new_event.league else 'Unknown',
            'ticketLink': new_event.ticket_link,
            'type': new_event.event_type,
            'game': new_event.game,
            'description': new_event.description,
            'prizes': new_event.prizes,
            'entryFee': new_event.entry_fee
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@main.route('/api/events/<int:event_id>', methods=['PUT'])
def updateEvent(event_id):
    """
    Update an existing event.
    """
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if 'name' in data:
        event.name = data['name']
    if 'date' in data:
        event.date = data['date']
    if 'startTime' in data:
        event.start_time = data['startTime']
    if 'leagueId' in data:
        event.league_id = data['leagueId']
    if 'ticketLink' in data:
        event.ticket_link = data['ticketLink']
    if 'type' in data:
        event.event_type = data['type']
    if 'game' in data:
        event.game = data['game']
    if 'description' in data:
        event.description = data['description']
    if 'prizes' in data:
        event.prizes = data['prizes']
    if 'entryFee' in data:
        event.entry_fee = data['entryFee']

    try:
        db.session.commit()
        return jsonify({
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
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@main.route('/api/events/<int:event_id>', methods=['DELETE'])
def deleteEvent(event_id):
    """
    Delete an event.
    """
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404

    try:
        db.session.delete(event)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Event deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


