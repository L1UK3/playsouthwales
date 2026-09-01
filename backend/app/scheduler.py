import asyncio
import datetime
import logging

logger = logging.getLogger(__name__)


class BackgroundScheduler:
    def __init__(self):
        self._task: asyncio.Task | None = None
        self._running: bool = False
        self._first_run: bool = True

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

        while self._running:
            now = datetime.datetime.now(datetime.UTC)
            current_date = now.date()

<<<<<<< HEAD
            # Hourly Update: Runs every hour once per hour
            if last_hourly_run is None or current_date > last_hourly_run:
                await self._run_hourly()
                last_hourly_run = current_date

            # Daily Update: Runs in the early afternoon (>= 13:00 UTC) once per day
=======
            # Daily Update: Runs in the early afternoon once per day
            # Will run on startup if the run time has passed for the day and it hasn't run yet
>>>>>>> 179c978b79e44fa80ae004a7e10c4f291ba0f1bd
            if now.hour >= 13:
                if last_daily_run is None or current_date > last_daily_run:
                    await self._run_daily()
                    last_daily_run = current_date

<<<<<<< HEAD
=======
            # Weekly Update: Runs on Sunday evenings once per week
            if now.weekday() == 6 and now.hour >= 18:
                if last_weekly_run is None or current_date != last_weekly_run:
                    await self._run_weekly()
                    last_weekly_run = current_date

>>>>>>> 179c978b79e44fa80ae004a7e10c4f291ba0f1bd
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
        """Run the hourly background sync and send today's events update."""
        try:
            logger.info("[Scheduler] Running daily background sync...")
<<<<<<< HEAD
=======
            #from app.dependencies import supabase

            #from app.integrations.discord import (
            #    DiscordConnectionService,
            #)
>>>>>>> 179c978b79e44fa80ae004a7e10c4f291ba0f1bd
            from app.web.pokedata import sync_pokedata

            res = await sync_pokedata()
            logger.info(f"[Scheduler] Daily pokedata sync completed: {res}")
<<<<<<< HEAD
=======
            #now = datetime.datetime.now(datetime.UTC)
            #today = now.date()
            #events = await self._get_events_for_date_range(today, today)

            #leagues_map = self._get_leagues_map(supabase)

            #await DiscordConnectionService.send_daily_update(
            #    events, leagues_map
            #)
>>>>>>> 179c978b79e44fa80ae004a7e10c4f291ba0f1bd

        except Exception as e:
            logger.error(f"[Scheduler] Error in hourly background sync: {e}")

    async def _run_daily(self) -> None:
        """Run the weekly background sync and send the weekly premier events update."""
        try:
            logger.info("[Scheduler] Running weekly background sync...")
<<<<<<< HEAD
=======
            #from app.dependencies import supabase

            #from app.integrations.discord import (
            #    DiscordConnectionService,
            #)
>>>>>>> 179c978b79e44fa80ae004a7e10c4f291ba0f1bd
            from app.web.championship_series import (
                sync_championship_data,
            )
            from app.web.sets_releases import run_sets_sync

            res_sets = await run_sets_sync()
            logger.info(f"[Scheduler] Weekly sets sync completed: {res_sets}")

            res_champ = await sync_championship_data()
            logger.info(
                f"[Scheduler] Weekly championship sync completed: {res_champ}"
            )

<<<<<<< HEAD
=======
            #now = datetime.datetime.now(datetime.UTC)
            #start_date = now.date() + datetime.timedelta(days=1)  # next Monday
            #end_date = now.date() + datetime.timedelta(days=7)  # next Sunday
            #events = await self._get_events_for_date_range(start_date, end_date)

            #leagues_map = self._get_leagues_map(supabase)

            #await DiscordConnectionService.send_weekly_update(
            #    events, leagues_map
            #)

>>>>>>> 179c978b79e44fa80ae004a7e10c4f291ba0f1bd
        except Exception as e:
            logger.error(f"[Scheduler] Error in daily background sync: {e}")
