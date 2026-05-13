import json
import os
from flask import Flask, jsonify, render_template

app = Flask(__name__)
DATA_FILE = os.path.join(app.root_path, 'events.json')


def load_events():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)
    
def load_leagues():
    events = load_events()
    leagues = set(event['league'] for event in events)
    return sorted(leagues)

def load_types():
    events = load_events()
    types = set(event['type'] for event in events)
    return sorted(types)


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
    return jsonify(load_types())


if __name__ == '__main__':
    app.run(debug=True, port=5000)
