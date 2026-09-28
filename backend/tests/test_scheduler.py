from unittest.mock import AsyncMock, patch

import pytest

from app.scheduler import BackgroundScheduler


@pytest.mark.anyio
async def test_run_hourly_awaits_sync_and_get_cp():
    "Verify _run_hourly calls sync_pokedata and get_cp successfully."
    scheduler = BackgroundScheduler()

    mock_sync = AsyncMock(return_value={"inserted": 2, "skipped": 1})
    mock_get_cp = AsyncMock(return_value=None)

    with (
        patch("app.web.pokedata.sync_pokedata", mock_sync),
        patch("app.web.pokedata.get_cp", mock_get_cp),
    ):
        await scheduler._run_hourly()

    mock_sync.assert_awaited_once()
    mock_get_cp.assert_awaited_once()


@pytest.mark.anyio
async def test_run_daily_awaits_sets_and_championship():
    """Verify _run_daily calls sync_championship_data."""
    scheduler = BackgroundScheduler()

    mock_champ = AsyncMock(return_value={"status": "ok"})

    with patch(
        "app.web.championship_series.sync_championship_data", mock_champ
    ):
        await scheduler._run_daily()

    mock_champ.assert_awaited_once()


@pytest.mark.anyio
async def test_run_daily_sends_discord_update_after_sync():
    broadcaster = AsyncMock()
    scheduler = BackgroundScheduler(broadcaster=broadcaster)
    mock_champ = AsyncMock(return_value={"status": "ok"})

    with patch(
        "app.web.championship_series.sync_championship_data", mock_champ
    ):
        await scheduler._run_daily()

    broadcaster.send_daily_update.assert_awaited_once()


@pytest.mark.anyio
async def test_run_daily_isolates_discord_failure():
    broadcaster = AsyncMock()
    broadcaster.send_daily_update.side_effect = RuntimeError(
        "Discord unavailable"
    )
    scheduler = BackgroundScheduler(broadcaster=broadcaster)
    mock_champ = AsyncMock(return_value={"status": "ok"})

    with patch(
        "app.web.championship_series.sync_championship_data", mock_champ
    ):
        await scheduler._run_daily()

    mock_champ.assert_awaited_once()


@pytest.mark.anyio
async def test_run_weekly_sends_discord_update():
    broadcaster = AsyncMock()
    scheduler = BackgroundScheduler(broadcaster=broadcaster)

    await scheduler._run_weekly()

    broadcaster.send_weekly_update.assert_awaited_once()
