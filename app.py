import json
import os
from flask import Flask, jsonify, render_template, request

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

@app.route('/events')
def getEvents():
    #/events?month=${month}&year=${year}
    month = request.args.get('month')
    year = request.args.get('year')
    date = f"{year}-{month.zfill(2)}"
    events = load_events()

    filteredEvents = [event for event in events if event['date'].startswith(date)]
    return jsonify(filteredEvents)

@app.route('/leagues')
def getLeagues():
    return jsonify(load_leagues())

@app.route('/types')
def getTypes():
    return jsonify(load_types())

if __name__ == '__main__':
    app.run(debug=True, port=5000)
