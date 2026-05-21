import json
import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='frontend/dist', static_url_path='')
CORS(app)

api_events = os.path.join(os.path.dirname(__file__), 'data', 'events.json')
api_leagues = os.path.join(os.path.dirname(__file__), 'data', 'leagues.json')
api_types = os.path.join(os.path.dirname(__file__), 'data', 'types.json')

# TODO #3: Implement the data in a sql database rather than as JSON files
# Global cache for data
_cached_data = {
    'events': None,
    'leagues': None,
    'types': None
}

def load_events():
    if _cached_data['events'] is None:
        with open(api_events, 'r', encoding='utf-8') as f:
           _cached_data['events'] = json.load(f)
    return _cached_data['events']

def load_leagues():
    if _cached_data['leagues'] is None:
        with open(api_leagues, 'r', encoding='utf-8') as f:
            _cached_data['leagues'] = json.load(f)
    return _cached_data['leagues']

def load_types():
    if _cached_data['types'] is None:
        with open(api_types, 'r', encoding='utf-8') as f:
            _cached_data['types'] = json.load(f)
    return _cached_data['types']

@app.route('/')
def index():
    static_folder = app.static_folder or 'frontend/dist'
    return send_from_directory(static_folder, 'index.html')

@app.errorhandler(404)
def not_found(e: Exception):
    static_folder = app.static_folder or 'frontend/dist'
    return send_from_directory(static_folder, 'index.html')

@app.route('/events')
def getEvents():
    #/events?month=${month}&year=${year}
    month = request.args.get('month')
    year = request.args.get('year')
    if not month or not year:
        return jsonify([])
        
    date_prefix = f"{year}-{month.zfill(2)}"
    events = load_events()

    filteredEvents = [event for event in events if event['date'].startswith(date_prefix)]
    return jsonify(filteredEvents)

@app.route('/leagues')
def getLeagues():
    return jsonify(load_leagues())

@app.route('/types')
def getTypes():
    return jsonify(load_types())

if __name__ == '__main__':
    app.run(debug=True, port=5000)
