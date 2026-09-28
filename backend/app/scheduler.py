from __future__ import annotations

import asyncio
import datetime
import logging
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.integrations.discord_bot import DiscordBroadcaster

logger = logging.getLogger(__name__)


class BackgroundScheduler:
    def __init__(self, broadcaster: DiscordBroadcaster | None = None):
        self._task: asyncio.Task | None = None
        self._running: bool = False
        self._first_run: bool = True
        self._broadcaster = broadcaster

    async def start(self) -> None:
        """Start the background task scheduler."""
        if self._running:
            logger.warning("[Scheduler] Already running.")
            return

        self._running = True
        self._task = asyncio.create_task(self._run_loop())
        logger.info("[Scheduler] Started background tasks.")

    async def stop(self) -> None:
        """Stop the background task scheduler."""
        if not self._running:
            return

        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None
        logger.info("[Scheduler] Stopped background tasks.")

    async def _run_loop(self) -> None:
        """Run the main loop for the background scheduler."""
        await asyncio.sleep(1)

        last_hourly_run = None
        last_daily_run = None
        last_weekly_run = None

        while self._running:
            now = datetime.datetime.now(datetime.UTC)
            current_date = now.date()

            current_hour = (current_date, now.hour)

            # Hourly Update: Runs every hour once per hour
            if last_hourly_run is None or current_hour != last_hourly_run:
                await self._run_hourly()
                last_hourly_run = current_hour

            # Daily Update: Runs mid-morning (>= 10:00 UTC) once per day
            if now.hour >= 10:
                if last_daily_run is None or current_date > last_daily_run:
                    await self._run_daily()
                    last_daily_run = current_date

                if now.weekday() == 6 and (
                    last_weekly_run is None or current_date > last_weekly_run
                ):
                    await self._run_weekly()
                    last_weekly_run = current_date

            await asyncio.sleep(3600)

    async def _get_events_for_date_range(
        self, start_date: datetime.date, end_date: datetime.date
    ) -> list[dict]:
        """Retrieve standard and expanded weekly events within a date range."""
        from app.dependencies import supabase
        from app.services.event import get_events_from_db

        return await get_events_from_db(
            db=supabase,
            start_date=start_date,
            end_date=end_date,
            expand_recurring=True,
        )

    def _get_leagues_map(self, db) -> dict[int, str]:
        """Retrieve the leagues map from the database."""
        try:
            res = db.table("leagues").select("id, name").execute()
            return (
                {league["id"]: league["name"] for league in res.data}
                if res.data
                else {}
            )
        except Exception as e:
            logger.error(f"[Scheduler] Failed to fetch leagues map: {e}")
            return {}

    async def _run_hourly(self) -> None:
        """Run the hourly background sync."""
        try:
            logger.info("[Scheduler] Running hourly background sync...")
            from app.web.pokedata import get_cp, sync_pokedata

            res_pokedata = await sync_pokedata()
            logger.info(
                f"[Scheduler] Hourly pokedata sync completed: {res_pokedata}"
            )

            await get_cp()
            logger.info("[Scheduler] Hourly CP sync completed")

        except Exception as e:
            logger.error(f"[Scheduler] Error in hourly background sync: {e}")

    async def _run_daily(self) -> None:
        """Run the daily background sync."""
        try:
            logger.info("[Scheduler] Running daily background sync...")
            from app.web.championship_series import (
                sync_championship_data,
            )

            res_champ = await sync_championship_data()
            logger.info(
                f"[Scheduler] Daily championship sync completed: {res_champ}"
            )

        except Exception as e:
            logger.error(f"[Scheduler] Error in daily background sync: {e}")

        if self._broadcaster:
            try:
                await self._broadcaster.send_daily_update()
            except Exception as e:
                logger.error(
                    f"[Scheduler] Error sending daily Discord update: {e}"
                )

    async def _run_weekly(self) -> None:
        """Send the weekly event digest."""
        if not self._broadcaster:
            return

        try:
            await self._broadcaster.send_weekly_update()
        except Exception as e:
            logger.error(
                f"[Scheduler] Error sending weekly Discord update: {e}"
            )
