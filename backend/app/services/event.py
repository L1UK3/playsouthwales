import calendar
import datetime
import logging

from supabase import Client

from app.exceptions import NotFoundError

logger = logging.getLogger(__name__)


async def get_events_from_db(
    db: Client,
    start_date: datetime.date | None = None,
    end_date: datetime.date | None = None,
    month: int | None = None,
    year: int | None = None,
    league_id: int | None = None,
    day: datetime.date | None = None,
    weekly: bool = False,
    expand_recurring: bool = False,
) -> list[dict]:
    """Retrieve events from the database with flexible filtering.

    If you set expand_recurring to True, this function expands weekly events
    and merges them with standard one-off events.
    """
    start_dt = start_date
    end_dt = end_date

    if day:
        start_dt = day
        end_dt = day
        expand_recurring = True
    elif weekly:
        today = datetime.datetime.now(datetime.UTC).date()
        days_to_monday = 7 - today.weekday()
        start_dt = today + datetime.timedelta(days=days_to_monday)
        end_dt = start_dt + datetime.timedelta(days=6)
        expand_recurring = True
    elif month and year:
        start_dt = datetime.date(year, month, 1)
        last_day = calendar.monthrange(year, month)[1]
        end_dt = datetime.date(year, month, last_day)

    events_query = db.table("events").select("*")
    if league_id is not None:
        events_query = events_query.eq("leagueId", league_id)

    if start_dt:
        events_query = events_query.gte("date", start_dt.strftime("%Y-%m-%d"))
    if end_dt:
        events_query = events_query.lte("date", end_dt.strftime("%Y-%m-%d"))

    try:
        events_res = events_query.execute()
        one_off_events = events_res.data or []
    except Exception as e:
        logger.error(f"Failed to fetch standard events: {e}")
        one_off_events = []

    if not expand_recurring:
        one_off_events.sort(key=lambda x: (x["date"], x.get("startTime") or ""))
        return one_off_events

    weekly_query = db.table("weekly_events").select("*")
    if league_id is not None:
        weekly_query = weekly_query.eq("leagueId", league_id)

    try:
        weekly_res = weekly_query.execute()
        weekly_events = weekly_res.data or []
    except Exception as e:
        logger.error(f"Failed to fetch weekly events: {e}")
        weekly_events = []

    if not start_dt or not end_dt:
        today = datetime.datetime.now(datetime.UTC).date()
        start_dt = start_dt or today
        end_dt = end_dt or (today + datetime.timedelta(days=30))

    expanded = []
    curr = start_dt
    while curr <= end_dt:
        curr_str = curr.strftime("%Y-%m-%d")
        curr_weekday = curr.weekday()

        for temp in weekly_events:
            try:
                temp_start = datetime.date.fromisoformat(temp["date"][:10])
            except (ValueError, KeyError, TypeError):
                continue

            if curr >= temp_start and temp_start.weekday() == curr_weekday:
                exclusions = temp.get("excludedDates") or []
                if curr_str not in exclusions:
                    expanded.append(
                        {
                            "id": temp["id"] * 10000000
                            + (curr.year - 2000) * 10000
                            + curr.month * 100
                            + curr.day,
                            "name": temp["name"],
                            "date": curr_str,
                            "startTime": temp.get("startTime"),
                            "leagueId": temp["leagueId"],
                            "ticketLink": temp.get("ticketLink"),
                            "eventType": temp["eventType"],
                            "game": temp["game"],
                            "description": temp.get("description"),
                            "entryFee": temp.get("entryFee"),
                            "prizes": temp.get("prizes"),
                        }
                    )
        curr += datetime.timedelta(days=1)

    all_events = one_off_events + expanded
    all_events.sort(key=lambda x: (x["date"], x.get("startTime") or ""))
    return all_events


async def get_weekly_events(db: Client) -> list[dict]:
    """Retrieve all weekly event templates."""
    res = db.table("weekly_events").select("*").execute()
    return res.data or []


async def get_weekly_event(db: Client, league_id: int) -> dict:
    """Retrieve a specific weekly event template by league ID."""
    res = (
        db.table("weekly_events")
        .select("*")
        .eq("leagueId", league_id)
        .execute()
    )
    if not res.data:
        raise NotFoundError("Weekly event not found")
    return res.data[0]


async def create_event(db: Client, event_data: dict) -> dict:
    """Create a standard or weekly recurring event."""
    is_recurring = event_data.pop("isRecurring", None)
    table_name = "weekly_events" if is_recurring else "events"

    res = db.table(table_name).insert(event_data).execute()
    if not res.data:
        raise Exception("No data returned from Supabase insert.")
    return {"success": True, "message": "Event created successfully"}


async def patch_event(db: Client, event_id: str, event_data: dict) -> dict:
    """Partially update an existing event, including virtual occurrences."""
    is_virtual = False
    try:
        val = int(event_id)
        if val >= 10000000:
            is_virtual = True
            template_id = val // 10000000
    except ValueError:
        pass

    if is_virtual:
        res = (
            db.table("weekly_events")
            .select("id")
            .eq("id", template_id)
            .execute()
        )
        if not res.data:
            raise NotFoundError("Weekly event template not found")
        table_name = "weekly_events"
        target_id = template_id
    else:
        res = db.table("events").select("id").eq("id", event_id).execute()
        if res.data:
            table_name = "events"
            target_id = event_id
        else:
            try:
                int_id = int(event_id)
                res = (
                    db.table("weekly_events")
                    .select("id")
                    .eq("id", int_id)
                    .execute()
                )
                if res.data:
                    table_name = "weekly_events"
                    target_id = int_id
                else:
                    raise ValueError()
            except ValueError:
                raise NotFoundError("Event not found")

    event_data.pop("isRecurring", None)

    if table_name == "events" or (
        "excludedDates" in event_data
        and event_data.get("excludedDates") is None
    ):
        event_data.pop("excludedDates", None)

    if event_data:
        db.table(table_name).update(event_data).eq("id", target_id).execute()

    return {"success": True, "message": "Event updated successfully"}


async def delete_event(
    db: Client, event_id: str, exclude_date: str | None = None
) -> dict:
    """Delete an event, weekly series, or single occurrence."""
    is_virtual = False
    try:
        val = int(event_id)
        if val >= 10000000:
            is_virtual = True
            template_id = val // 10000000
    except ValueError:
        pass

    if is_virtual:
        res = (
            db.table("weekly_events")
            .select("*")
            .eq("id", template_id)
            .execute()
        )
        if not res.data:
            raise NotFoundError("Event template not found")

        if exclude_date:
            weekly_event = res.data[0]
            excluded = weekly_event.get("excludedDates") or []
            if exclude_date not in excluded:
                excluded.append(exclude_date)
            db.table("weekly_events").update({"excludedDates": excluded}).eq(
                "id", template_id
            ).execute()
            return {
                "success": True,
                "message": f"Occurrence on {exclude_date} excluded successfully",
            }
        else:
            db.table("weekly_events").delete().eq("id", template_id).execute()
            return {
                "success": True,
                "message": "Weekly event series deleted successfully",
            }
    else:
        res = db.table("events").select("id").eq("id", event_id).execute()
        if res.data:
            table_name = "events"
            target_id = event_id
        else:
            try:
                int_id = int(event_id)
                res = (
                    db.table("weekly_events")
                    .select("id")
                    .eq("id", int_id)
                    .execute()
                )
                if res.data:
                    table_name = "weekly_events"
                    target_id = int_id
                else:
                    raise ValueError()
            except ValueError:
                raise NotFoundError("Event not found")

        db.table(table_name).delete().eq("id", target_id).execute()
        return {"success": True, "message": "Event deleted successfully"}
