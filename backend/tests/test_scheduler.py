from unittest.mock import AsyncMock, MagicMock, patch

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
async def test_run_daily_sends_digest_after_sync():
    scheduler = BackgroundScheduler()
    mock_champ = AsyncMock(side_effect=RuntimeError("sync failed"))

    with (
        patch("app.web.championship_series.sync_championship_data", mock_champ),
        patch.object(scheduler, "_send_digest", AsyncMock()) as send_digest,
    ):
        await scheduler._run_daily()

    send_digest.assert_awaited_once_with("daily")


@pytest.mark.anyio
@pytest.mark.parametrize("kind", ["daily", "weekly"])
async def test_send_digest_claims_then_sends(kind):
    scheduler = BackgroundScheduler(discord_enabled=True)
    build = AsyncMock(return_value="digest")
    send = AsyncMock()

    with (
        patch("app.integrations.discord_bot.construct_message", build),
        patch("app.integrations.discord_bot.send_discord_message", send),
        patch.object(scheduler, "_claim_run", return_value=True) as claim,
    ):
        await scheduler._send_digest(kind)

    claim.assert_called_once_with(f"{kind}_digest")
    build.assert_awaited_once_with(kind)
    send.assert_awaited_once_with("digest")


@pytest.mark.anyio
@pytest.mark.parametrize(
    ("discord_enabled", "claimed"), [(True, False), (False, True)]
)
async def test_send_digest_skips(discord_enabled, claimed):
    scheduler = BackgroundScheduler(discord_enabled=discord_enabled)
    send = AsyncMock()

    with (
        patch("app.integrations.discord_bot.construct_message", AsyncMock()),
        patch("app.integrations.discord_bot.send_discord_message", send),
        patch.object(scheduler, "_claim_run", return_value=claimed),
    ):
        await scheduler._send_digest("daily")

    send.assert_not_awaited()


@pytest.mark.anyio
async def test_send_digest_isolates_discord_failure():
    scheduler = BackgroundScheduler(discord_enabled=True)
    send = AsyncMock(side_effect=RuntimeError("Discord unavailable"))

    with (
        patch("app.integrations.discord_bot.construct_message", AsyncMock()),
        patch("app.integrations.discord_bot.send_discord_message", send),
        patch.object(scheduler, "_claim_run", return_value=True),
    ):
        await scheduler._send_digest("weekly")

    send.assert_awaited_once()


def make_claim_db(data):
    db = MagicMock()
    query = db.table.return_value.update.return_value
    query.eq.return_value.lt.return_value.execute.return_value.data = data
    return db, query


@pytest.mark.parametrize(
    ("data", "claimed"), [([{"job": "daily_digest"}], True), ([], False)]
)
def test_claim_run_reports_whether_row_was_updated(data, claimed):
    db, query = make_claim_db(data)

    with patch("app.dependencies.supabase", db):
        assert BackgroundScheduler()._claim_run("daily_digest") is claimed

    db.table.assert_called_once_with("scheduler_runs")
    query.eq.assert_called_once_with("job", "daily_digest")
    today = db.table.return_value.update.call_args.args[0]["last_run_on"]
    query.eq.return_value.lt.assert_called_once_with("last_run_on", today)


def test_claim_run_returns_false_on_db_error():
    db = MagicMock()
    db.table.side_effect = RuntimeError("db down")

    with patch("app.dependencies.supabase", db):
        assert BackgroundScheduler()._claim_run("daily_digest") is False
