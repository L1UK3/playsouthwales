import os
import json

# Path to the types.json file in the instance folder
api_types = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'instance', 'types.json')

_cached_data: dict[str, None] = {
    'types': None
}

def load_types():
    if _cached_data['types'] is None:
        if os.path.exists(api_types):
            try:
                with open(api_types, 'r', encoding='utf-8') as f:
                    _cached_data['types'] = json.load(f)
            except (json.JSONDecodeError, IOError):
                _cached_data['types'] = {}
        else:
            _cached_data['types'] = {}
    return _cached_data['types']
