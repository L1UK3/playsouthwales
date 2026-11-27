import type React from "react";
import { cn } from "#/lib/utils";
import type { ScheduleEvent } from "#/types/domain";
import type { EventSubmitInput } from "../admin.functions";
import { FormDialog } from "./AdminDialog";
import { Field, Select, TextArea, TextInput, useFormDraft } from "./FormField";

interface EventFormModalProps {
	onClose: () => void;
	onSubmit: (data: Omit<EventSubmitInput, "id">) => void | Promise<void>;
	initialData?: ScheduleEvent | null;
	leagueId: number;
	/** When true, shows Championship Series event types (Worlds, Regionals, Special Events) */
	isChampionshipLeague?: boolean;
}

type Option = readonly [value: string, label: string];

const LEAGUE_FORMATS: Option[] = [
	["STANDARD", "Standard"],
	["CHALLENGE", "League Challenge"],
	["CUP", "League Cup"],
	["PRE-RELEASE", "Pre-release"],
	["CASUAL", "Casual"],
];

const CHAMPIONSHIP_FORMATS: Option[] = [
	["REGIONAL", "Regional Championship"],
	["WORLDS", "World Championship"],
	["SPECIAL", "Special Event"],
	["INTERNATIONAL", "International Championship"],
];

const LEAGUE_GAMES: Option[] = [
	["TCG", "TCG (Trading Card Game)"],
	["VGC", "VGC (Video Game Championships)"],
	["GO", "GO"],
];

const CHAMPIONSHIP_GAMES: Option[] = [
	["ALL", "All Games (TCG, VGC, GO)"],
	...LEAGUE_GAMES,
];

/** Copy and choices that differ between local leagues and the Championship Series. */
const VARIANTS = {
	league: {
		formats: LEAGUE_FORMATS,
		games: LEAGUE_GAMES,
		defaultFormat: "STANDARD",
		defaultGame: "TCG",
		createTitle: "Schedule New Event",
		editTitle: "Edit Event",
		createLabel: "Schedule Event",
		namePlaceholder: "e.g. Standard League Challenge",
		descriptionPlaceholder:
			"Describe tournament rounds, standard regulations, match rules, etc.",
		prizesPlaceholder:
			"e.g. Championship points, booster packs for participating",
	},
	championship: {
		formats: CHAMPIONSHIP_FORMATS,
		games: CHAMPIONSHIP_GAMES,
		defaultFormat: "REGIONAL",
		defaultGame: "ALL",
		createTitle: "Add Championship Event",
		editTitle: "Edit Championship Event",
		createLabel: "Add Event",
		namePlaceholder: "e.g. Welsh Regional Championship 2025",
		descriptionPlaceholder:
			"Describe the championship format, eligibility, rounds, etc.",
		prizesPlaceholder: "e.g. Championship points, travel awards, trophies",
	},
};

function OptionList({ options }: { options: Option[] }) {
	return options.map(([value, label]) => (
		<option key={value} value={value}>
			{label}
		</option>
	));
}

const EventFormModal: React.FC<EventFormModalProps> = ({
	onClose,
	onSubmit,
	initialData,
	leagueId,
	isChampionshipLeague = false,
}) => {
	const variant = VARIANTS[isChampionshipLeague ? "championship" : "league"];
	const { draft, set, bind } = useFormDraft(() => ({
		name: initialData?.name ?? "",
		date: initialData?.date ? initialData.date.slice(0, 10) : "",
		startTime: initialData?.startTime ?? "",
		eventType: initialData?.eventType ?? variant.defaultFormat,
		game: initialData?.game ?? variant.defaultGame,
		entryFee: initialData?.entryFee ?? "",
		ticketLink: initialData?.ticketLink ?? "",
		description: initialData?.description ?? "",
		prizes: initialData?.prizes ?? "",
		isRecurring: initialData?.isRecurring ?? false,
	}));

	const handleSubmit = () =>
		onSubmit({
			...draft,
			leagueId: initialData ? initialData.leagueId : leagueId,
		});

	return (
		<FormDialog
			title={initialData ? variant.editTitle : variant.createTitle}
			championship={isChampionshipLeague}
			maxWidth="max-w-150"
			submitLabel={initialData ? "Save Changes" : variant.createLabel}
			onClose={onClose}
			onSubmit={handleSubmit}
		>
			<Field id="eventName" wide required label="Event Title">
				<TextInput
					type="text"
					id="eventName"
					placeholder={variant.namePlaceholder}
					{...bind("name")}
					required
				/>
			</Field>

			<Field id="eventDate" required label="Date">
				<TextInput type="date" id="eventDate" {...bind("date")} required />
			</Field>

			<Field id="eventStartTime" label="Start Time">
				<TextInput type="time" id="eventStartTime" {...bind("startTime")} />
			</Field>

			<Field id="eventType" required label="Format">
				<Select id="eventType" {...bind("eventType")}>
					<OptionList options={variant.formats} />
				</Select>
			</Field>

			<Field id="eventGame" required label="Game">
				<Select id="eventGame" {...bind("game")}>
					<OptionList options={variant.games} />
				</Select>
			</Field>

			<Field id="eventEntryFee" label="Entry Fee">
				<TextInput
					type="text"
					id="eventEntryFee"
					placeholder="e.g. £10 or Free"
					{...bind("entryFee")}
				/>
			</Field>

			<Field id="eventTicketLink" label="Registration Link">
				<TextInput
					type="url"
					id="eventTicketLink"
					placeholder="https://example.com/tickets"
					{...bind("ticketLink")}
				/>
			</Field>

			{/* Recurring Event Options — hidden for championship series */}
			{!isChampionshipLeague && (
				<div
					className={cn(
						"sm:col-span-2 flex flex-col gap-3 p-4 rounded-md border",
						"border-border-color bg-bg-main/30 mb-2",
					)}
				>
					<label className="flex items-center gap-3 cursor-pointer min-h-11 select-none">
						<input
							type="checkbox"
							id="eventIsRecurring"
							checked={draft.isRecurring}
							onChange={(e) => set("isRecurring", e.target.checked)}
							className={cn(
								"w-5 h-5 rounded border border-border-color",
								"text-secondary focus:ring-secondary cursor-pointer",
								"transition-[background-color,border-color]",
								"duration-150 ease-out",
							)}
						/>
						<span className="text-sm font-bold text-text-main">
							Repeat Weekly
						</span>
					</label>
				</div>
			)}

			<Field id="eventDescription" wide label="Description">
				<TextArea
					id="eventDescription"
					placeholder={variant.descriptionPlaceholder}
					{...bind("description")}
				/>
			</Field>

			<Field id="eventPrizes" wide label="Prizes Info">
				<TextArea
					id="eventPrizes"
					placeholder={variant.prizesPlaceholder}
					{...bind("prizes")}
				/>
			</Field>
		</FormDialog>
	);
};

export default EventFormModal;
