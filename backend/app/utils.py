import os
import json

TYPES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'types.json')

def load_types():
    """
    Load event types from the types.json file.
    Returns:
        dict: A dictionary containing event types and their metadata.
    """
    with open(TYPES_DIR, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data or {}
