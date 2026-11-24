import type React from "react";
import { cn } from "#/lib/utils";
import type { League } from "#/types/domain";
import { FormDialog } from "./AdminDialog";
import { Field, TextArea, TextInput, useFormDraft } from "./FormField";

export interface LeagueFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (
		data: Omit<League, "leagueId"> & { leagueId?: number; id?: number },
	) => void | Promise<void>;
	initialData?: League | null;
}

/** The form's editable state: every control holds a string. */
function toDraft(league?: League | null) {
	return {
		leagueId: league?.leagueId ? String(league.leagueId) : "",
		name: league?.name ?? "",
		location: league?.location ?? "",
		latitude: league?.latitude ? String(league.latitude) : "",
		longitude: league?.longitude ? String(league.longitude) : "",
		brandColor: league?.brandColor ?? "#ff0000",
		logo: league?.logo ?? "",
		website: league?.website ?? "",
		eventLink: league?.eventLink ?? "",
		socialLink: league?.socialLink ?? "",
		directions: league?.directions ?? "",
		accessibility: league?.accessibility ?? "",
	};
}

export const LeagueFormModal: React.FC<LeagueFormModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	initialData,
}) => {
	const { draft, bind } = useFormDraft(() => toDraft(initialData));

	// Not editable via the form: preserved from initialData.
	const championship = initialData?.isChampionshipSeries ?? false;

	if (!isOpen) return null;

	const handleSubmit = () => {
		const leagueId = draft.leagueId ? parseInt(draft.leagueId, 10) : undefined;
		return onSubmit({
			...draft,
			leagueId,
			id: leagueId,
			latitude: draft.latitude ? parseFloat(draft.latitude) : undefined,
			longitude: draft.longitude ? parseFloat(draft.longitude) : undefined,
			directions: draft.directions || undefined,
			accessibility: draft.accessibility || undefined,
			isChampionshipSeries: championship,
		});
	};

	return (
		<FormDialog
			title={
				championship
					? initialData
						? "Edit Championship Series"
						: "Add Championship Series"
					: initialData
						? "Edit League / Store"
						: "Add New League / Store"
			}
			championship={championship}
			maxWidth="max-w-162.5"
			submitLabel={
				initialData
					? "Save Changes"
					: championship
						? "Create Series"
						: "Create League"
			}
			onClose={onClose}
			onSubmit={handleSubmit}
		>
			<Field
				id="leagueIdField"
				wide
				label={
					championship
						? "Series ID (Official ID - can be skipped)"
						: "League ID (Official League ID - can be skipped if not known/not applicable)"
				}
			>
				<TextInput
					type="number"
					id="leagueIdField"
					placeholder=""
					{...bind("leagueId")}
				/>
			</Field>

			<Field
				id="leagueName"
				wide
				required
				label={championship ? "Series Name" : "League Name"}
			>
				<TextInput
					type="text"
					id="leagueName"
					placeholder=""
					{...bind("name")}
					required
				/>
			</Field>

			<Field
				id="leagueLocation"
				wide
				label={championship ? "Venue / Region" : "Address"}
			>
				<TextInput
					type="text"
					id="leagueLocation"
					placeholder={championship ? "e.g. Cardiff, Wales" : ""}
					{...bind("location")}
				/>
			</Field>

			{/* TODO: Implement automatic location detection, when an address is entered in the above field */}
			<Field id="leagueLatitude" label="Latitude">
				<TextInput
					type="number"
					step="any"
					id="leagueLatitude"
					placeholder="e.g. 51.4816"
					{...bind("latitude")}
				/>
			</Field>

			<Field id="leagueLongitude" label="Longitude">
				<TextInput
					type="number"
					step="any"
					id="leagueLongitude"
					placeholder="e.g. -3.1791"
					{...bind("longitude")}
				/>
			</Field>

			<Field id="leagueBrandColor" label="Brand Color">
				<div className="flex items-center gap-3">
					<input
						type="color"
						id="leagueBrandColor"
						{...bind("brandColor")}
						className={cn(
							"p-0.5 w-11 h-11 rounded-md border border-border-color",
							"cursor-pointer bg-transparent focus:outline-none",
							"focus:border-secondary",
							"focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]",
						)}
					/>
					<TextInput
						type="text"
						placeholder="#FF0000"
						maxLength={7}
						{...bind("brandColor")}
						style={{ flex: 1 }}
					/>
				</div>
			</Field>

			<Field id="leagueLogo" label="Logo Image URL">
				<TextInput
					type="url"
					id="leagueLogo"
					placeholder="https://example.com/logo.png"
					{...bind("logo")}
				/>
			</Field>

			<Field id="leagueWebsite" label="Official Website URL">
				<TextInput
					type="url"
					id="leagueWebsite"
					placeholder="https://example.com"
					{...bind("website")}
				/>
			</Field>

			<Field id="leagueEventLink" label="TCG Event Page URL">
				<TextInput
					type="url"
					id="leagueEventLink"
					placeholder="https://events.example.com/…"
					{...bind("eventLink")}
				/>
			</Field>

			<Field
				id="leagueSocialLink"
				wide
				label="Social Media URL (e.g. Facebook)"
			>
				<TextInput
					type="url"
					id="leagueSocialLink"
					placeholder="https://facebook.com/…"
					{...bind("socialLink")}
				/>
			</Field>

			{/* Directions and accessibility are hidden for championship series */}
			{!championship && (
				<>
					<Field id="leagueDirections" wide label="Directions">
						<TextArea
							id="leagueDirections"
							placeholder="Describe how to get to the store, parking information, public transport details, etc."
							{...bind("directions")}
						/>
					</Field>
					<Field id="leagueAccessibility" wide label="Accessibility Info">
						<TextArea
							id="leagueAccessibility"
							placeholder="Describe wheelchair access, steps, lighting, sound, or other accessibility accommodations."
							{...bind("accessibility")}
						/>
					</Field>
				</>
			)}
		</FormDialog>
	);
};

export default LeagueFormModal;
