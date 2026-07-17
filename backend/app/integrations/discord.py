import logging

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)


class DiscordConnectionService:
    @staticmethod
    async def send_notification(
        message: str, channel_id: str | None = None
    ) -> bool:
        """Sends a notification message to the Discord bot HTTP API."""
        settings = get_settings()
        target_channel = channel_id or settings.discord_announcements_channel_id
        if not target_channel:
            logger.warning(
                "[Discord Service] No channel ID provided and no default configured."
            )
            return False

        base_url = settings.discord_bot_url
        if not base_url:
            logger.warning("[Discord Service] Bot URL not configured.")
            return False

        if base_url.endswith("/api/notify"):
            url = base_url
        else:
            url = f"{base_url.rstrip('/')}/api/notify"

        payload = {"channelId": target_channel, "message": message}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, timeout=5.0)
                if response.status_code == 200:
                    logger.info(
                        "[Discord Service] Notification sent successfully."
                    )
                    return True
                else:
                    logger.error(
                        f"[Discord Service] Bot returned status {response.status_code}: {response.text}"
                    )
                    return False
        except httpx.RequestError as exc:
            logger.error(f"[Discord Service] Connection to bot failed: {exc}")
            return False

    @staticmethod
    async def emit_event(event: str, args: list | None = None) -> bool:
        """Emits a custom event to the Discord bot HTTP API."""
        settings = get_settings()
        base_url = settings.discord_bot_url
        if not base_url:
            logger.warning("[Discord Service] Bot URL not configured.")
            return False

        if base_url.endswith("/api/notify") or base_url.endswith("/api/emit"):
            parts = base_url.rsplit("/", 2)
            url = f"{parts[0]}/api/emit"
        else:
            url = f"{base_url.rstrip('/')}/api/emit"

        payload = {"event": event, "args": args or []}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, timeout=5.0)
                if response.status_code == 200:
                    logger.info(
                        f"[Discord Service] Event '{event}' emitted successfully."
                    )
                    return True
                else:
                    logger.error(
                        f"[Discord Service] Bot returned status {response.status_code} for emit: {response.text}"
                    )
                    return False
        except httpx.RequestError as exc:
            logger.error(
                f"[Discord Service] Connection to bot for emit failed: {exc}"
            )
            return False

    @classmethod
    async def send_daily_update(
        cls, events: list[dict], leagues_map: dict[int, str]
    ) -> bool:
        """Formats and sends the daily event update to Discord."""
        import datetime

        today = datetime.datetime.now(datetime.UTC).date()

        if not events:
            message = f"**Daily Event Update - {today.strftime('%A, %b %d')}**\nNo events scheduled for today."
        else:
            message_lines = [
                f"**Daily Event Update - {today.strftime('%A, %b %d')}**\n"
            ]
            for event in events:
                league_name = leagues_map.get(
                    event["leagueId"], "Unknown Venue"
                )
                start_time = event.get("startTime")
                time_str = f"{start_time}" if start_time else "TBD"
                fee_str = (
                    f" (Entry: {event.get('entryFee')})"
                    if event.get("entryFee")
                    else ""
                )

                line = f"- **{event['name']}**"
                if event.get("game") and event.get("game") != "ALL":
                    line += f" [{event['game']}]"
                line += f"\n  {time_str} | {league_name}{fee_str}"
                if event.get("ticketLink"):
                    line += f"\n  [Tickets]({event['ticketLink']})"
                message_lines.append(line)

            message = "\n".join(message_lines)

        settings = get_settings()
        channel_id = settings.discord_announcements_channel_id
        if channel_id:
            return await cls.emit_event(
                event="dailyUpdate", args=[message, channel_id]
            )
        else:
            logger.warning(
                "[Discord Service] Announcements channel not configured; daily update skipped."
            )
            return False

    @classmethod
    async def send_weekly_update(
        cls, events: list[dict], leagues_map: dict[int, str]
    ) -> bool:
        """Formats and sends the weekly premier events update to Discord."""
        import datetime

        premier_types = {
            "CHALLENGE",
            "CUP",
            "REGIONAL",
            "INTERNATIONAL",
            "WORLDS",
        }
        weekly_premier_events = [
            e for e in events if e.get("eventType", "").upper() in premier_types
        ]

        if not weekly_premier_events:
            message = (
                "**Championship & Premier Events Next Week**\n"
                "No challenges, cups, regionals, internationals, or worlds scheduled for next week."
            )
        else:
            message_lines = ["**Championship & Premier Events Next Week**\n"]
            for event in weekly_premier_events:
                evt_date = datetime.date.fromisoformat(event["date"])
                date_formatted = evt_date.strftime("%A, %b %d")

                league_name = leagues_map.get(
                    event["leagueId"], "Unknown Venue"
                )
                start_time = event.get("startTime")
                time_str = f" at {start_time}" if start_time else ""
                fee_str = (
                    f" (Entry: {event.get('entryFee')})"
                    if event.get("entryFee")
                    else ""
                )

                line = f"- **{event['name']}** ({event['eventType']})\n"
                line += f"  {date_formatted}{time_str} | {league_name}{fee_str}"
                if event.get("ticketLink"):
                    line += f"\n  [Tickets]({event['ticketLink']})"
                message_lines.append(line)

            message = "\n".join(message_lines)

        settings = get_settings()
        channel_id = settings.discord_announcements_channel_id
        if channel_id:
            return await cls.emit_event(
                event="weeklyUpdate", args=[message, channel_id]
            )
        else:
            logger.warning(
                "[Discord Service] Announcements channel not configured; weekly update skipped."
            )
            return False
