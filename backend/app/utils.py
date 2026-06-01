import os
import json

api_types = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'types.json')
_cached_data: dict[str, None] = {'types': None}

def load_types():
    """
    Load event types from the types.json file.
    Returns:
        dict: A dictionary containing event types and their metadata.
    """
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
