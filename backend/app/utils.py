import os
import json

api_types = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'types.json')

def load_types():
    """
    Load event types from the types.json file.
    Returns:
        dict: A dictionary containing event types and their metadata.
    """
    with open(api_types, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data or {}
