import asyncio
import datetime
import logging
from typing import Literal

logger = logging.getLogger(__name__)

STOP_CANCEL_ATTEMPTS = 5
STOP_RETRY_SECONDS = 1.0


class BackgroundScheduler:
    def __init__(self, discord_enabled: bool = False):
        self._task: asyncio.Task | None = None
        self._running: bool = False
        self._discord_enabled = discord_enabled

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
            await self._cancel_task(self._task)
            self._task = None
        logger.info("[Scheduler] Stopped background tasks.")

    async def _cancel_task(self, task: asyncio.Task) -> None:
        """Cancel a task without ever blocking shutdown indefinitely.

        A cancel that lands as an HTTP response arrives can get lost, which
        would leave the loop running, so keep retrying for a bounded time.
        """
        for _ in range(STOP_CANCEL_ATTEMPTS):
            task.cancel()
            done, _pending = await asyncio.wait(
                {task}, timeout=STOP_RETRY_SECONDS
            )
            if done:
                return
        logger.warning("[Scheduler] Background task ignored cancellation.")

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

            # Daily Update: Runs mid-evening (>= 19:00 UTC) once per day
            if now.hour >= 19:
                if last_daily_run is None or current_date > last_daily_run:
                    await self._run_daily()
                    last_daily_run = current_date

                if now.weekday() == 6 and (
                    last_weekly_run is None or current_date > last_weekly_run
                ):
                    await self._send_digest("weekly")
                    last_weekly_run = current_date

            await asyncio.sleep(3600)

    def _claim_run(self, job: str) -> bool:
        """Atomically mark a job as run today; False if it already ran.

        Claiming before the work means a failed run is skipped rather than
        repeated, so restarts and multiple workers never double-post.
        """
        from app.dependencies import supabase

        today = datetime.datetime.now(datetime.UTC).date().isoformat()
        try:
            res = (
                supabase.table("scheduler_runs")
                .update({"last_run_on": today})
                .eq("job", job)
                .lt("last_run_on", today)
                .execute()
            )
        except Exception as e:
            logger.error(f"[Scheduler] Failed to claim {job}: {e}")
            return False
        return bool(res.data)

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

        await self._send_digest("daily")

    async def _send_digest(self, kind: Literal["daily", "weekly"]) -> None:
        """Send an event digest to Discord at most once per day."""
        if not (self._discord_enabled and self._claim_run(f"{kind}_digest")):
            return

        from app.integrations import discord_bot

        try:
            await discord_bot.send_discord_message(
                await discord_bot.construct_message(kind)
            )
        except Exception as e:
            logger.error(
                f"[Scheduler] Error sending {kind} Discord update: {e}"
            )
