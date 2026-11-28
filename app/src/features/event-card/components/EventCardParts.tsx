/**
 * Presentational pieces shared by the ScheduleCard and ListCard variants.
 */
import type React from "react";
import { cn } from "#/lib/utils";
import {
	TAG_BASE_CLASSES,
	TAG_STYLE_PROPERTIES,
} from "../constants/EventCard.constants";

interface PartProps {
	className?: string;
	children: React.ReactNode;
}

/** Format tag coloured by the event type's `type-*` theme. */
export function EventTypeTag({
	eventType,
	className,
	children,
}: PartProps & { eventType: string }) {
	return (
		<span
			className={cn(TAG_BASE_CLASSES, className, `type-${eventType}`)}
			style={TAG_STYLE_PROPERTIES as React.CSSProperties}
		>
			{children}
		</span>
	);
}

/** Neutral pill for secondary metadata (game, "Official"). */
export function MetaPill({ children }: Omit<PartProps, "className">) {
	return (
		<span
			className={cn(
				"text-[9px] font-semibold text-text-muted bg-bg-main px-2 py-0.5",
				"rounded-full border border-border-color/60 uppercase",
				"tracking-wider",
			)}
		>
			{children}
		</span>
	);
}

/** Left-bordered note for the event description. */
export function DescriptionNote({ className, children }: PartProps) {
	return (
		<div
			className={cn(
				"text-xs leading-relaxed text-text-muted border-l-2",
				"border-border-color/80 pl-3",
				className,
			)}
		>
			{children}
		</div>
	);
}

/** Amber left-bordered note listing an event's prizes. */
export function PrizesNote({
	prizes,
	className,
}: {
	prizes: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"text-xs leading-relaxed text-text-muted pl-3 border-l-2",
				"border-amber-500/40 flex gap-1.5 items-start",
				className,
			)}
		>
			<span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">
				Prizes:
			</span>
			<span>{prizes}</span>
		</div>
	);
}

/** Titled left-bordered note for league venue information. */
export function VenueNote({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div
			className={cn(
				"text-xs text-text-muted pl-3 border-l-2",
				"border-border-color/80 flex flex-col gap-0.5",
			)}
		>
			<span className="font-semibold text-text-main">{title}</span>
			<span className="leading-relaxed">{children}</span>
		</div>
	);
}
