from .utils import load_top_20
from flask import Blueprint, request, jsonify, current_app
from .auth import require_auth
import os

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

    query = current_app.supabase.table('event').select('*')

    if league_id:
        query = query.eq('league_id', league_id)

    if month and year:
        date_prefix = f"{year}-{month.zfill(2)}"
        query = query.like('date', f"{date_prefix}%")

    try:
        res = query.execute()
        events = res.data or []
    except Exception as e:
        current_app.logger.error(f"Failed to fetch events from Supabase: {e}")
        return jsonify({
            'error': {
                'code': 'internal_error',
                'message': 'Failed to fetch events'
            }
        }), 500

    event_list = []
    for event in events:
        event_list.append({
            'id': event.get('id'),
            'name': event.get('name'),
            'date': event.get('date'),
            'startTime': event.get('start_time'),
            'leagueId': event.get('league_id'),
            'ticketLink': event.get('ticket_link'),
            'type': event.get('event_type'),
            'game': event.get('game'),
            'description': event.get('description'),
            'prizes': event.get('prizes'),
            'entryFee': event.get('entry_fee'),
        })
    return jsonify(event_list)

@main.route('/api/leagues')
def get_leagues():
    """
    Fetch all leagues.
    Returns:
        Response: A JSON list of all leagues.
    """
    try:
        res = current_app.supabase.table('league').select('*').execute()
        leagues = res.data or []
    except Exception as e:
        current_app.logger.error(f"Failed to fetch leagues from Supabase: {e}")
        return jsonify({
            'error': {
                'code': 'internal_error',
                'message': 'Failed to fetch leagues'
            }
        }), 500

    league_list = []
    for league in leagues:
        league_list.append({
            'leagueId': league.get('id'),
            'name': league.get('name'),
            'logo': league.get('logo'),
            'website': league.get('website'),
            'socialLink': league.get('social_link'),
            'pokemonLink': league.get('pokemon_link'),
            'brandColor': league.get('brand_color'),
            'webLink': league.get('web_link'),
            'location': league.get('location'),
            'latitude': league.get('latitude'),
            'longitude': league.get('longitude'),
        })
    return jsonify(league_list)

@main.route('/api/events', methods=['POST'])
@require_auth
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
        event_data = {
            'name': name,
            'date': date,
            'league_id': leagueId,
            'event_type': eventType,
            'game': game,
            'description': data.get('description'),
            'prizes': data.get('prizes'),
            'entry_fee': data.get('entryFee')
        }
        current_app.supabase.table('event').insert(event_data).execute()

        return jsonify({
            'success': True,
            'message': 'Event created successfully'
        }), 201
    except Exception as e:
        current_app.logger.error(f"Failed to create event: {e}")
        return jsonify({
            'error': {
                'code': 'internal_error',
                'message': str(e)
            }
        }), 500

@main.route('/api/events/<int:eventId>', methods=['PUT', 'PATCH'])
@require_auth
def update_event(eventId):
    """
    Update an existing event.
    """
    try:
        res = current_app.supabase.table('event').select('id').eq('id', eventId).execute()
        if not res.data:
            return jsonify({
                'error': {
                    'code': 'not_found',
                    'message': 'Event not found'
                }
            }), 404
    except Exception as e:
        current_app.logger.error(f"Failed to query event {eventId}: {e}")
        return jsonify({
            'error': {
                'code': 'internal_error',
                'message': 'An unexpected database error occurred'
            }
        }), 500

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
        event_data = {
            'name': name,
            'date': date,
            'league_id': leagueId,
            'event_type': eventType,
            'game': game,
            'description': data.get('description'),
            'prizes': data.get('prizes'),
            'entry_fee': data.get('entryFee')
        }
        current_app.supabase.table('event').update(event_data).eq('id', eventId).execute()
        return jsonify({
            'success': True,
            'message': 'Event updated successfully'
        })
    except Exception as e:
        current_app.logger.error(f"Failed to update event {eventId}: {e}")
        return jsonify({
            'error': {
                'code': 'internal_error',
                'message': 'An unexpected database error occurred'
            }
        }), 500


@main.route('/api/events/<int:event_id>', methods=['DELETE'])
@require_auth
def delete_event(event_id):
    """
    Delete an event.
    """
    try:
        res = current_app.supabase.table('event').select('id').eq('id', event_id).execute()
        if not res.data:
            return jsonify({
                'error': {
                    'code': 'not_found',
                    'message': 'Event not found'
                }
            }), 404
    except Exception as e:
        current_app.logger.error(f"Failed to query event {event_id}: {e}")
        return jsonify({
            'error': {
                'code': 'internal_error',
                'message': 'An unexpected database error occurred'
            }
        }), 500

    try:
        current_app.supabase.table('event').delete().eq('id', event_id).execute()
        return jsonify({
            'success': True,
            'message': 'Event deleted successfully'
        })
    except Exception as e:
        current_app.logger.error(f"Failed to delete event {event_id}: {e}")
        return jsonify({
            'error': {
                'code': 'internal_error',
                'message': str(e)
            }
        }), 500


@main.route('/api/leagues', methods=['POST'])
@require_auth
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
        league_data = {
            'name': name,
            'logo': data.get('logo'),
            'website': data.get('website'),
            'social_link': data.get('socialLink'),
            'pokemon_link': data.get('pokemonLink'),
            'brand_color': data.get('brandColor'),
            'web_link': data.get('webLink'),
            'location': data.get('location'),
            'latitude': data.get('latitude'),
            'longitude': data.get('longitude')
        }
        res = current_app.supabase.table('league').insert(league_data).execute()
        if not res.data:
            raise Exception("Failed to insert league")
        new_league_id = res.data[0]['id']

        return jsonify({
            'success': True,
            'leagueId': new_league_id,
            'message': 'League created successfully'
        }), 201
    except Exception as e:
        current_app.logger.error(f"Failed to create league: {e}")
        return jsonify({
            'error': {
                'code': 'internal_error',
                'message': str(e)
            }
        }), 500


@main.route('/api/leagues/<int:league_id>', methods=['PUT', 'PATCH'])
@require_auth
def update_league(league_id):
    """
    Update an existing league.
    """
    try:
        res = current_app.supabase.table('league').select('id').eq('id', league_id).execute()
        if not res.data:
            return jsonify({
                'error': {
                    'code': 'not_found',
                    'message': 'League not found'
                }
            }), 404
    except Exception as e:
        current_app.logger.error(f"Failed to query league {league_id}: {e}")
        return jsonify({
            'error': {
                'code': 'internal_error',
                'message': 'An unexpected database error occurred'
            }
        }), 500

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
        league_data = {
            'name': name,
            'logo': data.get('logo'),
            'website': data.get('website'),
            'social_link': data.get('socialLink'),
            'pokemon_link': data.get('pokemonLink'),
            'brand_color': data.get('brandColor'),
            'web_link': data.get('webLink'),
            'location': data.get('location'),
            'latitude': data.get('latitude'),
            'longitude': data.get('longitude')
        }
        current_app.supabase.table('league').update(league_data).eq('id', league_id).execute()
        return jsonify({
            'success': True,
            'message': 'League updated successfully'
        })
    except Exception as e:
        current_app.logger.error(f"Failed to update league {league_id}: {e}")
        return jsonify({
            'error': {
                'code': 'internal_error',
                'message': 'An unexpected database error occurred'
            }
        }), 500


@main.route('/api/leagues/<int:league_id>', methods=['DELETE'])
@require_auth
def delete_league(league_id):
    """
    Delete a league.
    """
    try:
        res = current_app.supabase.table('league').select('id').eq('id', league_id).execute()
        if not res.data:
            return jsonify({
                'error': {
                    'code': 'not_found',
                    'message': 'League not found'
                }
            }), 404
    except Exception as e:
        current_app.logger.error(f"Failed to query league {league_id}: {e}")
        return jsonify({
            'error': {
                'code': 'internal_error',
                'message': 'An unexpected database error occurred'
            }
        }), 500

    try:
        # Cascade delete all events belonging to the league in Supabase
        current_app.supabase.table('event').delete().eq('league_id', league_id).execute()
        current_app.supabase.table('league').delete().eq('id', league_id).execute()
        return jsonify({
            'success': True,
            'message': 'League deleted successfully'
        })
    except Exception as e:
        current_app.logger.error(f"Failed to delete league {league_id}: {e}")
        return jsonify({
            'error': {
                'code': 'internal_error',
                'message': str(e)
            }
        }), 500

@main.route('/api/players/top20')
def load_top20_players():
    return jsonify(load_top_20())
