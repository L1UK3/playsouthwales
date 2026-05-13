import json
import os
from flask import Flask, jsonify, render_template

app = Flask(__name__)

API_EVENTS = os.path.join(os.path.dirname(__file__), 'data', 'events.json')
API_LEAGUES = os.path.join(os.path.dirname(__file__), 'data', 'leagues.json')
API_TYPES = os.path.join(os.path.dirname(__file__), 'data', 'types.json')


def load_events():
    with open(API_EVENTS, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_leagues():
    with open(API_LEAGUES, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_types():
    with open(API_TYPES, 'r', encoding='utf-8') as f:
        return json.load(f)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/events')
def api_events():
    return jsonify(load_events())

@app.route('/api/leagues')
def api_leagues():
    return jsonify(load_leagues())

@app.route('/api/types')
def api_types():
    types_data = load_types()
    if isinstance(types_data, dict) and 'types' in types_data:
        return jsonify(types_data['types'])
    return jsonify(types_data)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
