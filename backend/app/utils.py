import os
import json

TOP20_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'top20.json')

def load_top_20():
    """
    Load the top 20 players from the top20.json file.
    Returns:
        dict: A dictionary containing player information.
    """
    with open(TOP20_DIR, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data or {}
