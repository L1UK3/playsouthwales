from .utils import load_top_20
from flask import Blueprint, request, jsonify, current_app
import os

from .models import Event, League
from . import db

main = Blueprint('main', __name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'data')

@main.route('/api/events')
def get_events():
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
    event_list = []
    for event in events:
        event_list.append({
            'id': event.id,
            'name': event.name,
            'date': event.date,
            'startTime': event.start_time,
            'leagueId': event.league_id,
            'ticketLink': event.ticket_link,
            'type': event.event_type,
            'game': event.game,
            'description': event.description,
            'prizes': event.prizes,
            'entryFee': event.entry_fee,
        })
    return jsonify(event_list)

@main.route('/api/leagues')
def get_leagues():
    """
    Fetch all leagues.
    Returns:
        Response: A JSON list of all leagues.
    """
    leagues = League.query.all()
    league_list = []
    for league in leagues:
        league_list.append({
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
            'longitude': league.longitude,
        })
    return jsonify(league_list)

@main.route('/api/events', methods=['POST'])
def create_event():
    """
    Create a new event.
    """
    data = request.get_json()
    if not data:
        return jsonify({
            'error': {
                'code': 'bad_request',
                'message': 'No data provided'
            }
        }), 400

    name = data.get('name')
    date = data.get('date')
    leagueId = data.get('leagueId')
    eventType = data.get('type')
    game = data.get('game')

    if not name or not date or not leagueId or not eventType or not game:
        return jsonify({
            'error': {
                'code': 'bad_request',
                'message': 'Missing required fields: name, date, leagueId, type, game'
            }
        }), 400

    try:
        newEvent = Event(
            name=name,
            date=date,
            league_id=leagueId,
            event_type=eventType,
            game=game,
            description=data.get('description'),
            prizes=data.get('prizes'),
            entry_fee=data.get('entryFee')
        )
        db.session.add(newEvent)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Event created successfully'
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': {
                'code': 'internal_error',
                'message': str(e)
            }
        }), 500

@main.route('/api/events/<int:eventId>', methods=['PUT', 'PATCH'])
def update_event(eventId):
    """
    Update an existing event.
    """
    event = Event.query.get(eventId)
    if not event:
        return jsonify({
            'error': {
                'code': 'not_found',
                'message': 'Event not found'
            }
        }), 404

    try:
        data = request.get_json()
    except Exception:
        return jsonify({
            'error': {
                'code': 'bad_request',
                'message': 'Malformed JSON payload'
            }
        }), 400

    if data is None:
        return jsonify({
            'error': {
                'code': 'bad_request',
                'message': 'No data provided'
            }
        }), 400

    name = data.get('name')
    date = data.get('date')
    leagueId = data.get('leagueId')
    eventType = data.get('type')
    game = data.get('game')

    if not name or not date or not leagueId or not eventType or not game:
        return jsonify({
            'error': {
                'code': 'bad_request',
                'message': 'Missing required fields: name, date, leagueId, type, game'
            }
        }), 400

    try:
        event.name = name
        event.date = date
        event.league_id = leagueId
        event.event_type = eventType
        event.game = game
        event.description = data.get('description')
        event.prizes = data.get('prizes')
        event.entry_fee = data.get('entryFee')
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Event updated successfully'
        })
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Failed to update event {eventId}: {e}")
        return jsonify({
            'error': {
                'code': 'internal_error',
                'message': 'An unexpected database error occurred'
            }
        }), 500


@main.route('/api/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    """
    Delete an event.
    """
    event = Event.query.get(event_id)
    if not event:
        return jsonify({
            'error': {
                'code': 'not_found',
                'message': 'Event not found'
            }
        }), 404

    try:
        db.session.delete(event)
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Event deleted successfully'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@main.route('/api/leagues', methods=['POST'])
def create_league():
    """
    Create a new league.
    """
    data = request.get_json()
    if not data:
        return jsonify({
            'error': {
                'code': 'bad_request',
                'message': 'No data provided'
            }
        }), 400

    name = data.get('name')
    if not name:
        return jsonify({
            'error': {
                'code': 'bad_request',
                'message': 'Missing required fields: name'
            }
        }), 400

    try:
        new_league = League(
            name=name,
            logo=data.get('logo'),
            website=data.get('website'),
            social_link=data.get('socialLink'),
            pokemon_link=data.get('pokemonLink'),
            brand_color=data.get('brandColor'),
            web_link=data.get('webLink'),
            location=data.get('location'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude')
        )
        db.session.add(new_league)
        db.session.commit()

        return jsonify({
            'success': True,
            'leagueId': new_league.id,
            'message': 'League created successfully'
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': {
                'code': 'internal_error',
                'message': str(e)
            }
        }), 500


@main.route('/api/leagues/<int:league_id>', methods=['PUT', 'PATCH'])
def update_league(league_id):
    """
    Update an existing league.
    """
    league = League.query.get(league_id)
    if not league:
        return jsonify({
            'error': {
                'code': 'not_found',
                'message': 'League not found'
            }
        }), 404

    try:
        data = request.get_json()
    except Exception:
        return jsonify({
            'error': {
                'code': 'bad_request',
                'message': 'Malformed JSON payload'
            }
        }), 400

    if data is None:
        return jsonify({
            'error': {
                'code': 'bad_request',
                'message': 'No data provided'
            }
        }), 400

    name = data.get('name')
    if not name:
        return jsonify({
            'error': {
                'code': 'bad_request',
                'message': 'Missing required fields: name'
            }
        }), 400

    try:
        league.name = name
        league.logo = data.get('logo')
        league.website = data.get('website')
        league.social_link = data.get('socialLink')
        league.pokemon_link = data.get('pokemonLink')
        league.brand_color = data.get('brandColor')
        league.web_link = data.get('webLink')
        league.location = data.get('location')
        league.latitude = data.get('latitude')
        league.longitude = data.get('longitude')
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'League updated successfully'
        })
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Failed to update league {league_id}: {e}")
        return jsonify({
            'error': {
                'code': 'internal_error',
                'message': 'An unexpected database error occurred'
            }
        }), 500


@main.route('/api/leagues/<int:league_id>', methods=['DELETE'])
def delete_league(league_id):
    """
    Delete a league.
    """
    league = League.query.get(league_id)
    if not league:
        return jsonify({
            'error': {
                'code': 'not_found',
                'message': 'League not found'
            }
        }), 404

    try:
        # Cascade delete all events belonging to the league
        Event.query.filter(Event.league_id == league_id).delete()
        db.session.delete(league)
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'League deleted successfully'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@main.route('/api/players/top20')
def load_top20_players():
    return jsonify(load_top_20())
        
    
