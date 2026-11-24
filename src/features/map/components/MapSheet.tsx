/* Hallmark · component: bottom sheet · genre: modern-minimal · theme: custom (design.md) */

import { X } from "lucide-react";
import type React from "react";
import { useEffect, useId, useRef } from "react";
import { cn } from "#/lib/utils";

interface MapSheetProps {
	/** Heading text, also used as the sheet's accessible name. */
	title: string;
	/** Optional element shown before the heading, such as a logo. */
	leading?: React.ReactNode;
	onClose: () => void;
	children: React.ReactNode;
}

/**
 * MapSheet is a bottom sheet that slides up over the mobile map.
 * It takes focus when it opens, closes on Escape, and hands focus back when it closes.
 */
const MapSheet: React.FC<MapSheetProps> = ({
	title,
	leading,
	onClose,
	children,
}) => {
	const titleId = useId();
	const sheetRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const previousFocus =
			document.activeElement instanceof HTMLElement
				? document.activeElement
				: null;
		sheetRef.current?.focus({ preventScroll: true });

		return () => {
			if (previousFocus?.isConnected) {
				previousFocus.focus({ preventScroll: true });
			}
		};
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	return (
		<section
			ref={sheetRef}
			role="dialog"
			aria-modal="false"
			aria-labelledby={titleId}
			tabIndex={-1}
			className={cn(
				"absolute inset-x-0 bottom-0 z-20 flex max-h-[62%] flex-col",
				"rounded-t-2xl border-t border-border-color bg-bg-card",
				"shadow-[0_-8px_24px_rgba(0,0,0,0.18)] outline-none animate-sheet-up",
				"motion-reduce:animate-none",
			)}
		>
			<div
				aria-hidden="true"
				className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border-color"
			/>
			<header
				className={cn(
					"flex items-center gap-3 px-4 pt-2 pb-3 border-b",
					"border-border-color/60",
				)}
			>
				{leading}
				<h2
					id={titleId}
					className={cn(
						"m-0 grow min-w-0 truncate text-base font-extrabold tracking-tight",
						"text-text-darker",
					)}
				>
					{title}
				</h2>
				<button
					type="button"
					onClick={onClose}
					aria-label={`Close ${title}`}
					className={cn(
						"inline-flex size-9 shrink-0 items-center justify-center",
						"rounded-full border border-border-color bg-bg-main text-text-main",
						"cursor-pointer transition-colors duration-150",
						"hover:bg-bg-card-hover focus-visible:outline-2",
						"focus-visible:outline-offset-2 focus-visible:outline-secondary",
					)}
				>
					<X aria-hidden="true" className="size-4" />
				</button>
			</header>
			<div
				className={cn(
					"min-h-0 overflow-y-auto overscroll-contain px-4 pt-3 pb-4",
				)}
			>
				{children}
			</div>
		</section>
	);
};

export default MapSheet;
