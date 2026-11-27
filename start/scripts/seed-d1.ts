#!/usr/bin/env -S npx tsx
// Development seed for local D1 database.
// Generates leagues, weekly recurring events, one-off events, and players with
// dates relative to today, so contributors can see the calendar populated without
// production data.
//
// Usage:
//   npx tsx scripts/seed-d1.ts                   # writes to .seed/seed.sql
//   npx tsx scripts/seed-d1.ts --local           # writes and applies to local D1
//   npx tsx scripts/seed-d1.ts --remote          # writes and applies to remote D1
//   npm run db:seed:local                      # shortcut for --local

import { execSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { parseArgs } from "node:util";
import { parseSeason, replaceAllSql } from "./lib/d1-sql.ts";

const { values: args } = parseArgs({
	options: {
		out: { type: "string", default: ".seed/seed.sql" },
		local: { type: "boolean", default: false },
		remote: { type: "boolean", default: false },
		season: { type: "string" },
	},
});

const season = parseSeason(args.season);

function formatDate(date: Date): string {
	const y = date.getUTCFullYear();
	const m = String(date.getUTCMonth() + 1).padStart(2, "0");
	const d = String(date.getUTCDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function addDays(base: Date, days: number): Date {
	const res = new Date(base);
	res.setUTCDate(res.getUTCDate() + days);
	return res;
}

async function main() {
	const today = new Date();

	// 1. Sample Leagues across South Wales
	const sampleLeagues = [
		{
			id: 1,
			name: "Firestorm Games Cardiff",
			logo: "https://playsouthwales.uk/logos/firestorm-cardiff.png",
			website: "https://www.firestormgames.co.uk",
			socialLink: "https://facebook.com/firestormgames",
			eventLink: "https://events.firestormgames.co.uk",
			brandColor: "#E53E3E",
			location: "Sloper Road, Cardiff, CF11 8AB",
			directions: "5 minutes walk from Grangetown station. Ample free parking on site.",
			accessibility: "Ground floor venue, fully wheelchair accessible with wide aisles.",
			latitude: 51.4682,
			longitude: -3.1954,
			isChampionshipSeries: 0,
		},
		{
			id: 2,
			name: "The Geek Retreat Newport",
			logo: "https://playsouthwales.uk/logos/geek-retreat-newport.png",
			website: "https://geek-retreat.uk/newport",
			socialLink: "https://facebook.com/geekretreatnewport",
			eventLink: "https://geek-retreat.uk/events",
			brandColor: "#3182CE",
			location: "Cardiff Road, Newport, NP20 2EE",
			directions: "Opposite Newport Bus Station, near Friars Walk.",
			accessibility: "Street level access with accessible restroom.",
			latitude: 51.5877,
			longitude: -2.9984,
			isChampionshipSeries: 0,
		},
		{
			id: 3,
			name: "Cardiff Pokémon Championship Series",
			logo: "https://playsouthwales.uk/logos/championship-series.png",
			website: "https://events.pokemon.com",
			socialLink: "https://twitter.com/playpokemon",
			eventLink: "https://pokemon.com/play-pokemon/events",
			brandColor: "#D69E2E",
			location: "Cardiff City Stadium, Leckwith Road, Cardiff, CF11 8AZ",
			directions: "Direct buses from Cardiff Central, on-site event parking.",
			accessibility: "Premier venue with lifts, level flooring and disabled parking.",
			latitude: 51.4728,
			longitude: -3.2031,
			isChampionshipSeries: 1,
		},
		{
			id: 4,
			name: "Swansea Gamers Club",
			logo: "https://playsouthwales.uk/logos/swansea-gamers.png",
			website: "https://swanseagamers.co.uk",
			socialLink: "https://facebook.com/swanseagamers",
			eventLink: "https://swanseagamers.co.uk/events",
			brandColor: "#38A169",
			location: "High Street, Swansea, SA1 1NW",
			directions: "2 minutes from Swansea Train Station.",
			accessibility: "Ramp access at front entrance.",
			latitude: 51.6214,
			longitude: -3.9436,
			isChampionshipSeries: 0,
		},
	];

	// 2. Sample Events (both weekly recurring and one-off)
	// Recurring events start 2-4 weeks ago so the current month calendar is populated
	const sampleEvents = [
		// Weekly recurring events
		{
			leagueId: 1,
			pokedataGuid: null,
			name: "Weekly Casual Pokémon TCG League",
			date: formatDate(addDays(today, -21)),
			startTime: "18:00",
			eventType: "STANDARD",
			game: "TCG",
			ticketLink: "https://firestormgames.co.uk/tickets/tcg-weekly",
			description: "Casual Swiss rounds for players of all experience levels.",
			prizes: "1 Play! Pokémon Prize Pack for all participants.",
			entryFee: "£5.00",
			isRecurring: 1,
			excludedDates: "[]",
		},
		{
			leagueId: 1,
			pokedataGuid: null,
			name: "Thursday Night VGC Local",
			date: formatDate(addDays(today, -18)),
			startTime: "18:30",
			eventType: "CHALLENGE",
			game: "VGC",
			ticketLink: "https://firestormgames.co.uk/tickets/vgc-local",
			description: "Standard Regulation format Pokémon VGC tournament on Nintendo Switch.",
			prizes: "Championship Points and Store Credit.",
			entryFee: "£4.00",
			isRecurring: 1,
			excludedDates: "[]",
		},
		{
			leagueId: 2,
			pokedataGuid: null,
			name: "Sunday Pokémon GO Community Meetup",
			date: formatDate(addDays(today, -25)),
			startTime: "14:00",
			eventType: "CASUAL",
			game: "GO",
			ticketLink: null,
			description: "Great League battles, raid hours, and trade sessions.",
			prizes: "Promo item codes and stickers.",
			entryFee: "Free",
			isRecurring: 1,
			excludedDates: "[]",
		},
		{
			leagueId: 4,
			pokedataGuid: null,
			name: "Swansea Weekly Pokémon League Session",
			date: formatDate(addDays(today, -14)),
			startTime: "17:30",
			eventType: "STANDARD",
			game: "TCG",
			ticketLink: null,
			description: "Open play, deck testing, and beginner coaching.",
			prizes: "Prize Packs for match wins.",
			entryFee: "£3.50",
			isRecurring: 1,
			excludedDates: "[]",
		},

		// One-off events (past, current, and upcoming this month and next)
		{
			leagueId: 1,
			pokedataGuid: "seed-guid-league-challenge-recent",
			name: "South Wales TCG League Challenge",
			date: formatDate(addDays(today, -4)),
			startTime: "11:00",
			eventType: "CHALLENGE",
			game: "TCG",
			ticketLink: "https://firestormgames.co.uk/events/tcg-challenge",
			description: "Official League Challenge offering Championship Points.",
			prizes: "CP to top 8 and booster pack payout.",
			entryFee: "£10.00",
			isRecurring: 0,
			excludedDates: "[]",
		},
		{
			leagueId: 3,
			pokedataGuid: "seed-guid-special-event-upcoming",
			name: "Cardiff Pokémon League Cup Special",
			date: formatDate(addDays(today, 3)),
			startTime: "10:00",
			eventType: "CUP",
			game: "TCG",
			ticketLink: "https://events.pokemon.com/cardiff-cup",
			description: "Competitive League Cup. Deck lists required upon check-in.",
			prizes: "Exclusive Champion Playmat and high-tier Championship Points.",
			entryFee: "£15.00",
			isRecurring: 0,
			excludedDates: "[]",
		},
		{
			leagueId: 2,
			pokedataGuid: "seed-guid-vgc-midseason",
			name: "Newport Midseason VGC Showdown",
			date: formatDate(addDays(today, 7)),
			startTime: "12:00",
			eventType: "CHALLENGE",
			game: "VGC",
			ticketLink: "https://geek-retreat.uk/tickets/vgc-midseason",
			description: "Swiss rounds + top cut VGC competition.",
			prizes: "Store credit and Pokémon plushies.",
			entryFee: "£8.00",
			isRecurring: 0,
			excludedDates: "[]",
		},
		{
			leagueId: 1,
			pokedataGuid: "seed-guid-prerelease-expansion",
			name: "Prerelease: Next Generation Expansion",
			date: formatDate(addDays(today, 14)),
			startTime: "13:00",
			eventType: "PRERELEASE",
			game: "TCG",
			ticketLink: "https://firestormgames.co.uk/events/prerelease",
			description: "Get early access cards with a Build & Battle box and 30-minute deck building.",
			prizes: "3 booster packs on completion.",
			entryFee: "£26.00",
			isRecurring: 0,
			excludedDates: "[]",
		},
		{
			leagueId: 4,
			pokedataGuid: "seed-guid-gym-leader-challenge",
			name: "Swansea Gym Leader Challenge (GLC)",
			date: formatDate(addDays(today, 21)),
			startTime: "11:30",
			eventType: "CASUAL",
			game: "TCG",
			ticketLink: null,
			description: "Singleton format: one type, no Rule Box cards allowed.",
			prizes: "Vintage booster packs and promo cards.",
			entryFee: "£5.00",
			isRecurring: 0,
			excludedDates: "[]",
		},
	];

	// 3. Sample Welsh Players for CP Rankings
	const samplePlayers = [
		{ name: "Dylan Thomas", playerId: 100234, cp: 285, season },
		{ name: "Megan Jones", playerId: 104562, cp: 240, season },
		{ name: "Gareth Evans", playerId: 108911, cp: 195, season },
		{ name: "Rhiannon Davies", playerId: 112345, cp: 160, season },
		{ name: "Ieuan Williams", playerId: 115678, cp: 135, season },
		{ name: "Cerys Lloyd", playerId: 119876, cp: 110, season },
		{ name: "Owain Hughes", playerId: 123456, cp: 85, season },
		{ name: "Bethan Price", playerId: 127890, cp: 60, season },
		{ name: "Tomos Morgan", playerId: 131234, cp: 45, season },
		{ name: "Ffion Jenkins", playerId: 135678, cp: 30, season },
	];

	const { sql: sqlContent } = replaceAllSql(
		[
			"Development seed for local D1 database",
			`Generated at ${today.toISOString()} relative to current date`,
		],
		{ leagues: sampleLeagues, events: sampleEvents, players: samplePlayers },
	);
	await mkdir(dirname(args.out), { recursive: true });
	await writeFile(args.out, sqlContent, "utf8");

	console.log(`Generated development seed at ${args.out}:`);
	console.log(`  - ${sampleLeagues.length} leagues`);
	console.log(`  - ${sampleEvents.length} events (${sampleEvents.filter((e) => e.isRecurring).length} recurring, ${sampleEvents.filter((e) => !e.isRecurring).length} one-off)`);
	console.log(`  - ${samplePlayers.length} players (season ${season})`);

	if (args.local) {
		console.log("\nApplying seed to local D1 via wrangler...");
		execSync(`npx wrangler d1 execute playsouthwales --local --file="${args.out}"`, {
			stdio: "inherit",
		});
		console.log("Successfully seeded local D1 database.");
	} else if (args.remote) {
		console.log("\nApplying seed to remote D1 via wrangler...");
		execSync(`npx wrangler d1 execute playsouthwales --remote --file="${args.out}"`, {
			stdio: "inherit",
		});
		console.log("Successfully seeded remote D1 database.");
	} else {
		console.log("\nTo apply this seed to your local D1:");
		console.log(`  npx wrangler d1 execute playsouthwales --local --file="${args.out}"`);
		console.log("Or run:");
		console.log("  npm run db:seed:local");
	}
}

main().catch((err) => {
	console.error("Seed generation failed:", err);
	process.exit(1);
});
