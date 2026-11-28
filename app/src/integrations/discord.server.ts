const _EVENT_TYPE_LABELS: Record<string, string> = {
	"CHALLENGE": "🏅 Challenge",
	"CUP": "🏆 Cup",
	"PRE-RELEASE": "🎁 Pre-release",
	"SPECIAL": "📍 Special event",
	"REGIONAL": "📍 Regional",
	"INTERNATIONAL": "🌍 International",
	"WORLDS": "🌍 Worlds",
	"STANDARD": "⚔️ Standard league",
	"CASUAL": "🎲 Casual league",
	"LEGALITY": "✅ New TCG set legal",
	"RELEASE": "📦 TCG set release day",
	"REGULATION": "📜 New VGC regulation legal",
};

const _UNSANCTIONED_TYPE: Set<string> = new Set(["CASUAL", "STANDARD"]);
const _CHAMPIONSHIP_TYPE: Set<string> = new Set([
	"SPECIAL",
	"REGIONAL",
	"INTERNATIONAL",
	"WORLDS",
]);

const _FOOTER: string =
	"\n-# Sanctioned events from the official Play Pokemon! schedule and from Pokédata (unofficial); ";
("Weekly events listed by league partners. <https://www.playsouthwales.uk/events>");

async function _updateData(
	date: string,
	type: "daily" | "weekly" | "monthly",
) {
	return;
}

export async function postUpdate(
	date: string,
	type: "daily" | "weekly" | "monthly",
): Promise<void> {
	const _updateData = await _fetchUpdateData(date, type);
	let _message = `\n\n`;

	switch (type) {
		case "daily":
			break;
		case "weekly":
			break;
		case "monthly":
			break;
	}
}
