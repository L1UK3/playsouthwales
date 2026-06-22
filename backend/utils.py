import os
import json

top20Path = os.path.join(os.path.dirname(__file__), 'data', 'top20.json')

def loadTop20() -> dict:
    """
    Load the top 20 players from the top20.json file.
    Returns:
        dict: A dictionary containing player information.
    """
    if not os.path.exists(top20Path):
        return {}
    with open(top20Path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data or {}
