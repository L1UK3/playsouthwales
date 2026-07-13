---
meta.contentType: Reference
---

# Where can I find the endpoint routes and payload schemas?

This document provides a complete reference of the Play! South Wales backend API endpoints, their expected input models, and response formats.

## Plan

- **Overview**: Complete specifications of REST API resources.
- **Goal**: List URL routes, HTTP verbs, parameters, and models.
- **Audience**: Frontend developers integrating with the backend.
- **Content Plan**: Document public routes, protected administrative endpoints, and standard error schemas.
- **Open Questions**: None.

## Authentication

Protected routes require a Clerk session token in the authorization header:

```http
Authorization: Bearer your_clerk_session_token_here
```

Missing or invalid session tokens trigger a `410 Unauthorized` response.

## Public API endpoints

These endpoints do not require authentication headers.

### GET `/api/health`

Confirms server availability.

- **Response Body**:
  ```json
  {
      "status": "healthy"
  }
  ```

### GET `/api/events`

Fetches standard events.

- **Query Parameters**:
  - **month**: Month number (e.g. `7` or `07`)
  - **year**: Four digit year (e.g. `2026`)
  - **leagueId**: Database integer identifier of a league
- **Response Body**:
  ```json
  [
      {
          "id": "event_guid_here",
          "name": "Cardiff Cup",
          "date": "2026-07-15",
          "startTime": "18:00",
          "leagueId": 1,
          "ticketLink": null,
          "eventType": "CUP",
          "game": "TCG",
          "description": null,
          "entryFee": "Free",
          "excludedDates": null
      }
  ]
  ```

### GET `/api/weekly-events`

Fetches all recurring weekly event templates.

- **Response Body**:
  Same structure as standard events, returned inside a list array.

### GET `/api/leagues`

Fetches all active gaming leagues.

- **Response Body**:
  ```json
  [
      {
          "leagueId": 1,
          "hasStandings": true,
          "id": 1,
          "name": "Cardiff League",
          "logo": "https://url_to_logo.png",
          "location": "Cardiff Centre",
          "brandColor": "#FF0000"
      }
  ]
  ```

### GET `/api/players/top20`

Fetches top ranked Welsh players for a Championship Point (CP) season.

- **Query Parameters**:
  - **season**: Season identifier (e.g., `2026-2027`)
- **Response Body**:
  ```json
  {
      "season": "2026-2027",
      "availableSeasons": ["2026-2027"],
      "players": {
          "1": {
              "name": "Luke Enness",
              "cp": 520
          }
      }
  }
  ```

---

## Protected API endpoints

These endpoints require valid Clerk authentication headers.

### POST `/api/events`

Creates a new event.

- **Request Body**:
  ```json
  {
      "name": "Swansea League Challenge",
      "date": "2026-08-10",
      "startTime": "19:00",
      "leagueId": 2,
      "eventType": "CHALLENGE",
      "game": "TCG",
      "isRecurring": false
  }
  ```
- **Response Body**:
  ```json
  {
      "success": true,
      "message": "Event created successfully"
  }
  ```

### PATCH `/api/events/{event_id}`

Partially updates an existing event or recurring template.

- **Path Parameters**:
  - **event_id**: Unique identifier string. If `event_id` is an integer `>= 10000000`, the server extracts the recurring series ID (`template_id = event_id // 10000000`).
- **Request Body**:
  Fields to update (e.g., `{"name": "New Name"}`).
- **Response Body**:
  ```json
  {
      "success": true,
      "message": "Event updated successfully"
  }
  ```

### DELETE `/api/events/{event_id}`

Deletes an event, occurrence, or recurring series.

- **Query Parameters**:
  - **excludeDate**: Date string (e.g., `2026-07-25`) to exclude a single occurrence from a series instead of deleting the entire series.
- **Response Body**:
  ```json
  {
      "success": true,
      "message": "Event deleted successfully"
  }
  ```

---

## Standard error schema

The backend uses a uniform structure for API errors:

```json
{
    "detail": {
        "code": "not_found",
        "message": "The requested resource could not be found."
    }
}
```

Common error code strings:
- **unauthorized**: Invalid or expired authentication credentials.
- **not_found**: Resource does not exist in the database.
- **internal_error**: Unexpected server failure (details are logged to the console).
