import json
import logging
import os
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)

DATA_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "data",
    "top20.json",
)


def _current_top20_season() -> str:
    now = datetime.now(timezone.utc)
    start_year = now.year if now.month >= 7 else now.year - 1
    return f"{start_year}-{start_year + 1}"


def _load_raw_top20_data() -> dict[str, Any]:
    try:
        if not os.path.exists(DATA_PATH):
            logger.warning("Top 20 data file not found. Returning default structure.")
            return {"defaultSeason": _current_top20_season(), "seasons": {}}
        with open(DATA_PATH, encoding="utf-8") as file_handle:
            return json.load(file_handle)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to decode JSON from {DATA_PATH}: {e}")
        return {"defaultSeason": _current_top20_season(), "seasons": {}}
    except Exception as e:
        logger.error(f"Failed to load raw Top 20 data: {e}")
        return {"defaultSeason": _current_top20_season(), "seasons": {}}


def load_top20_payload(season: str | None = None) -> dict[str, Any]:
    raw_data = _load_raw_top20_data()

    if (
        isinstance(raw_data, dict)
        and "seasons" in raw_data
        and isinstance(raw_data["seasons"], dict)
    ):
        seasons = raw_data["seasons"]
        available_seasons = list(seasons.keys())
        if not available_seasons:
            selected_season = (
                season
                or raw_data.get("defaultSeason")
                or _current_top20_season()
            )
            return {
                "season": selected_season,
                "availableSeasons": [],
                "players": {},
            }

        selected_season = (
            season or raw_data.get("defaultSeason") or available_seasons[0]
        )
        if selected_season not in seasons:
            selected_season = (
                raw_data.get("defaultSeason") or available_seasons[0]
            )
        players = seasons.get(selected_season, {})
        return {
            "season": selected_season,
            "availableSeasons": available_seasons,
            "players": players,
        }

    selected_season = (
        season
        or raw_data.get("season")
        or raw_data.get("defaultSeason")
        or _current_top20_season()
    )
    return {
        "season": selected_season,
        "availableSeasons": [selected_season],
        "players": raw_data,
    }
