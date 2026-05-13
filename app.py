import json
import os
from flask import Flask, jsonify, render_template

app = Flask(__name__)
DATA_FILE = os.path.join(app.root_path, 'events.json')


def load_events():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/events')
def api_events():
    return jsonify(load_events())


if __name__ == '__main__':
    app.run(debug=True, port=5000)
