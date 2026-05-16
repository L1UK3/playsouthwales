import json
import os
from flask import Flask, jsonify, render_template

app = Flask(__name__)

api_events = os.path.join(os.path.dirname(__file__), 'data', 'events.json')
api_leagues = os.path.join(os.path.dirname(__file__), 'data', 'leagues.json')
api_types = os.path.join(os.path.dirname(__file__), 'data', 'types.json')


def load_events():
    with open(api_events, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_leagues():
    with open(api_leagues, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_types():
    with open(api_types, 'r', encoding='utf-8') as f:
        return json.load(f)



@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/events')
def getEvents():
    return jsonify(load_events())

@app.route('/api/leagues')
def getLeagues():
    return jsonify(load_leagues())

@app.route('/api/types')
def getTypes():
    types_data = load_types()
    if isinstance(types_data, dict) and 'types' in types_data:
        return jsonify(types_data['types'])
    return jsonify(types_data)






if __name__ == '__main__':
    app.run(debug=True, port=5000)
