"""Send Discord bot messages manually from the command line.

Run from the backend directory so the app package and .env resolve:

    uv run python -m scripts.discord_message message "Hello from the bot"
    uv run python -m scripts.discord_message daily
    uv run python -m scripts.discord_message daily --date 2026-11-07
    uv run python -m scripts.discord_message weekly

Pass --channel-id to override DISCORD_CHANNEL_ID for a single run, or
--dry-run to print the message instead of sending it.
"""

import argparse
import asyncio
import datetime
import sys

import discord

from app.integrations import discord_bot


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--channel-id",
        type=int,
        help="Target channel (defaults to DISCORD_CHANNEL_ID)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the message instead of sending it",
    )
    commands = parser.add_subparsers(dest="command", required=True)

    message = commands.add_parser("message", help="Send a custom message")
    message.add_argument(
        "content", nargs="?", help="Message text (reads stdin when omitted)"
    )
    daily = commands.add_parser("daily", help="Send a day's events digest")
    daily.add_argument(
        "--date",
        type=datetime.date.fromisoformat,
        help="Day to report on, as YYYY-MM-DD (defaults to today)",
    )
    commands.add_parser("weekly", help="Send this week's events digest")
    return parser.parse_args()


async def build_content(args: argparse.Namespace) -> str:
    if args.command == "daily":
        return await discord_bot.construct_message("daily", args.date)
    if args.command == "weekly":
        return await discord_bot.construct_message("weekly")
    content = args.content or sys.stdin.read().strip()
    if not content:
        sys.exit("Message content is empty.")
    return content


async def run(args: argparse.Namespace) -> None:
    content = await build_content(args)
    if args.dry_run:
        print(content)
        return

    if not await discord_bot.send_discord_message(content, args.channel_id):
        sys.exit("Set DISCORD_BOT_TOKEN and DISCORD_CHANNEL_ID in backend/.env")
    print(f"Sent '{args.command}' to Discord.")


def main() -> None:
    args = parse_args()
    try:
        asyncio.run(run(args))
    except discord.LoginFailure:
        sys.exit("Login failed")
    except discord.HTTPException as e:
        sys.exit(f"Discord rejected the request ({e.status}): {e.text}")


if __name__ == "__main__":
    main()
