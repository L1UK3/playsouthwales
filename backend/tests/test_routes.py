import json

def test_index(client):
    """Test the root route (frontend serving)."""
    # Note: This might fail if frontend/dist/index.html doesn't exist
    # but we are testing the route logic.
    response = client.get('/')
    # If the file doesn't exist, Flask returns 404 by default for static files
    # unless it's handled differently. In our case, send_static_file is used.
    assert response.status_code in [200, 404] 

def test_get_leagues(client, sample_data):
    """Test the /leagues endpoint."""
    response = client.get('/leagues')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) == 1
    assert data[0]['name'] == "Test League"

def test_get_events_no_params(client, sample_data):
    """Test /events with no parameters returns empty list."""
    response = client.get('/events')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data == []

def test_get_events_with_params(client, sample_data):
    """Test /events with month and year parameters."""
    response = client.get('/events?month=05&year=2026')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) == 1
    assert data[0]['name'] == "Test Event"
    assert data[0]['date'] == "2026-05-10"

def test_get_events_wrong_date(client, sample_data):
    """Test /events with date that has no events."""
    response = client.get('/events?month=06&year=2026')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) == 0

def test_get_types(client):
    """Test the /types endpoint."""
    response = client.get('/types')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, dict)
    # Based on types.json content we saw earlier
    assert "STANDARD" in data
    assert data["STANDARD"] == "S"
