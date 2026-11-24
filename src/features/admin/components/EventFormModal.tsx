import type React from "react";
import { useState } from "react";
import { cn } from "#/lib/utils";
import type { ScheduleEvent } from "#/types/domain";
import { FormDialog } from "./AdminDialog";

export interface EventFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: Omit<ScheduleEvent, "id">) => void | Promise<void>;
	initialData?: ScheduleEvent | null;
	leagueId: number;
	/** When true, shows Championship Series event types (Worlds, Regionals, Special Events) */
	isChampionshipLeague?: boolean;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	initialData,
	leagueId,
	isChampionshipLeague = false,
}) => {
	const [name, setName] = useState(initialData?.name ?? "");
	const [date, setDate] = useState(
		initialData?.date ? initialData.date.slice(0, 10) : "",
	);
	const [startTime, setStartTime] = useState(initialData?.startTime ?? "");
	const [eventType, setEventType] = useState(
		initialData?.eventType ?? (isChampionshipLeague ? "REGIONAL" : "STANDARD"),
	);
	const [game, setGame] = useState(
		initialData?.game ?? (isChampionshipLeague ? "ALL" : "TCG"),
	);
	const [entryFee, setEntryFee] = useState(initialData?.entryFee ?? "");
	const [ticketLink, setTicketLink] = useState(initialData?.ticketLink ?? "");
	const [description, setDescription] = useState(
		initialData?.description ?? "",
	);
	const [prizes, setPrizes] = useState(initialData?.prizes ?? "");
	const [isRecurring, setIsRecurring] = useState(
		initialData?.isRecurring ?? false,
	);

	if (!isOpen) return null;

	const handleSubmit = () =>
		onSubmit({
			name,
			date,
			startTime: startTime ?? undefined,
			eventType,
			game,
			entryFee: entryFee ?? undefined,
			ticketLink: ticketLink ?? undefined,
			description: description ?? undefined,
			prizes: prizes ?? undefined,
			leagueId: initialData ? initialData.leagueId : leagueId,
			isRecurring,
		});

	return (
		<FormDialog
			title={
				initialData
					? isChampionshipLeague
						? "Edit Championship Event"
						: "Edit Event"
					: isChampionshipLeague
						? "Add Championship Event"
						: "Schedule New Event"
			}
			championship={isChampionshipLeague}
			maxWidth="max-w-150"
			submitLabel={
				initialData
					? "Save Changes"
					: isChampionshipLeague
						? "Add Event"
						: "Schedule Event"
			}
			onClose={onClose}
			onSubmit={handleSubmit}
		>
			{/* Event Title */}
			<div className="flex flex-col gap-1.5 relative sm:col-span-2">
				<label
					htmlFor="eventName"
					className={cn(
						"text-[13px] font-bold text-text-main flex justify-between",
						"items-center",
					)}
				>
					Event Title{" "}
					<span className="text-primary text-[11px] font-semibold">*</span>
				</label>
				<input
					type="text"
					id="eventName"
					placeholder={
						isChampionshipLeague
							? "e.g. Welsh Regional Championship 2025"
							: "e.g. Standard League Challenge"
					}
					value={name}
					onChange={(e) => setName(e.target.value)}
					className={cn(
						"py-3 px-3.5 rounded-md border border-border-color text-sm",
						"bg-bg-card text-text-main w-full",
						"transition-[background-color,border-color] duration-150",
						"ease-out focus:outline-none focus:border-secondary",
						"focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]",
					)}
					required
				/>
			</div>

			{/* Date */}
			<div className="flex flex-col gap-1.5 relative">
				<label
					htmlFor="eventDate"
					className={cn(
						"text-[13px] font-bold text-text-main flex justify-between",
						"items-center",
					)}
				>
					Date <span className="text-primary text-[11px] font-semibold">*</span>
				</label>
				<input
					type="date"
					id="eventDate"
					value={date}
					onChange={(e) => setDate(e.target.value)}
					className={cn(
						"py-3 px-3.5 rounded-md border border-border-color text-sm",
						"bg-bg-card text-text-main w-full",
						"transition-[background-color,border-color] duration-150",
						"ease-out focus:outline-none focus:border-secondary",
						"focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]",
					)}
					required
				/>
			</div>

			{/* Start Time */}
			<div className="flex flex-col gap-1.5 relative">
				<label
					htmlFor="eventStartTime"
					className={cn(
						"text-[13px] font-bold text-text-main flex justify-between",
						"items-center",
					)}
				>
					Start Time
				</label>
				<input
					type="time"
					id="eventStartTime"
					value={startTime}
					onChange={(e) => setStartTime(e.target.value)}
					className={cn(
						"py-3 px-3.5 rounded-md border border-border-color text-sm",
						"bg-bg-card text-text-main w-full",
						"transition-[background-color,border-color] duration-150",
						"ease-out focus:outline-none focus:border-secondary",
						"focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]",
					)}
				/>
			</div>

			{/* Event Format */}
			<div className="flex flex-col gap-1.5 relative">
				<label
					htmlFor="eventType"
					className={cn(
						"text-[13px] font-bold text-text-main flex justify-between",
						"items-center",
					)}
				>
					Format{" "}
					<span className="text-primary text-[11px] font-semibold">*</span>
				</label>
				<select
					id="eventType"
					value={eventType}
					onChange={(e) => setEventType(e.target.value)}
					className={cn(
						"py-3 px-3.5 rounded-md border border-border-color text-sm",
						"bg-bg-card text-text-main w-full",
						"transition-[background-color,border-color] duration-150",
						"ease-out focus:outline-none focus:border-secondary",
						"focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]",
					)}
				>
					{isChampionshipLeague ? (
						<>
							<option value="REGIONAL">Regional Championship</option>
							<option value="WORLDS">World Championship</option>
							<option value="SPECIAL">Special Event</option>
							<option value="INTERNATIONAL">International Championship</option>
						</>
					) : (
						<>
							<option value="STANDARD">Standard</option>
							<option value="CHALLENGE">League Challenge</option>
							<option value="CUP">League Cup</option>
							<option value="PRE-RELEASE">Pre-release</option>
							<option value="CASUAL">Casual</option>
						</>
					)}
				</select>
			</div>

			{/* Game Title */}
			<div className="flex flex-col gap-1.5 relative">
				<label
					htmlFor="eventGame"
					className={cn(
						"text-[13px] font-bold text-text-main flex justify-between",
						"items-center",
					)}
				>
					Game <span className="text-primary text-[11px] font-semibold">*</span>
				</label>
				<select
					id="eventGame"
					value={game}
					onChange={(e) => setGame(e.target.value)}
					className={cn(
						"py-3 px-3.5 rounded-md border border-border-color text-sm",
						"bg-bg-card text-text-main w-full",
						"transition-[background-color,border-color] duration-150",
						"ease-out focus:outline-none focus:border-secondary",
						"focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]",
					)}
				>
					{isChampionshipLeague ? (
						<>
							<option value="ALL">All Games (TCG, VGC, GO)</option>
							<option value="TCG">TCG (Trading Card Game)</option>
							<option value="VGC">VGC (Video Game Championships)</option>
							<option value="GO">GO</option>
						</>
					) : (
						<>
							<option value="TCG">TCG (Trading Card Game)</option>
							<option value="VGC">VGC (Video Game Championships)</option>
							<option value="GO">GO</option>
						</>
					)}
				</select>
			</div>

			{/* Entry Fee */}
			<div className="flex flex-col gap-1.5 relative">
				<label
					htmlFor="eventEntryFee"
					className={cn(
						"text-[13px] font-bold text-text-main flex justify-between",
						"items-center",
					)}
				>
					Entry Fee
				</label>
				<input
					type="text"
					id="eventEntryFee"
					placeholder="e.g. £10 or Free"
					value={entryFee}
					onChange={(e) => setEntryFee(e.target.value)}
					className={cn(
						"py-3 px-3.5 rounded-md border border-border-color text-sm",
						"bg-bg-card text-text-main w-full",
						"transition-[background-color,border-color] duration-150",
						"ease-out focus:outline-none focus:border-secondary",
						"focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]",
					)}
				/>
			</div>

			{/* Ticket URL */}
			<div className="flex flex-col gap-1.5 relative">
				<label
					htmlFor="eventTicketLink"
					className={cn(
						"text-[13px] font-bold text-text-main flex justify-between",
						"items-center",
					)}
				>
					Registration Link
				</label>
				<input
					type="url"
					id="eventTicketLink"
					placeholder="https://example.com/tickets"
					value={ticketLink}
					onChange={(e) => setTicketLink(e.target.value)}
					className={cn(
						"py-3 px-3.5 rounded-md border border-border-color text-sm",
						"bg-bg-card text-text-main w-full",
						"transition-[background-color,border-color] duration-150",
						"ease-out focus:outline-none focus:border-secondary",
						"focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]",
					)}
				/>
			</div>

			{/* Recurring Event Options — hidden for championship series */}
			{!isChampionshipLeague && (
				<div
					className={cn(
						"sm:col-span-2 flex flex-col gap-3 p-4 rounded-md border",
						"border-border-color bg-bg-main/30 mb-2",
					)}
				>
					<label
						className={cn(
							"flex items-center gap-3 cursor-pointer min-h-11",
							"select-none",
						)}
					>
						<input
							type="checkbox"
							id="eventIsRecurring"
							checked={isRecurring}
							onChange={(e) => setIsRecurring(e.target.checked)}
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

			{/* Description */}
			<div className="flex flex-col gap-1.5 relative sm:col-span-2">
				<label
					htmlFor="eventDescription"
					className={cn(
						"text-[13px] font-bold text-text-main flex justify-between",
						"items-center",
					)}
				>
					Description
				</label>
				<textarea
					id="eventDescription"
					placeholder={
						isChampionshipLeague
							? "Describe the championship format, eligibility, rounds, etc."
							: "Describe tournament rounds, standard regulations, match rules, etc."
					}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className={cn(
						"py-3 px-3.5 rounded-md border border-border-color text-sm",
						"bg-bg-card text-text-main w-full",
						"transition-[background-color,border-color] duration-150",
						"ease-out focus:outline-none focus:border-secondary",
						"focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] resize-y",
						"min-h-20",
					)}
				/>
			</div>

			{/* Prizes */}
			<div className="flex flex-col gap-1.5 relative sm:col-span-2">
				<label
					htmlFor="eventPrizes"
					className={cn(
						"text-[13px] font-bold text-text-main flex justify-between",
						"items-center",
					)}
				>
					Prizes Info
				</label>
				<textarea
					id="eventPrizes"
					placeholder={
						isChampionshipLeague
							? "e.g. Championship points, travel awards, trophies"
							: "e.g. Championship points, booster packs for participating"
					}
					value={prizes}
					onChange={(e) => setPrizes(e.target.value)}
					className={cn(
						"py-3 px-3.5 rounded-md border border-border-color text-sm",
						"bg-bg-card text-text-main w-full",
						"transition-[background-color,border-color] duration-150",
						"ease-out focus:outline-none focus:border-secondary",
						"focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] resize-y",
						"min-h-20",
					)}
				/>
			</div>
		</FormDialog>
	);
};

export default EventFormModal;
