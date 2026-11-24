import type React from "react";
import { type ReactNode, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "#/lib/utils";

interface FormDialogProps {
	title: string;
	/** Shows the Championship Series badge under the title. */
	championship: boolean;
	/** Tailwind max-width class for the panel. */
	maxWidth: string;
	/** Label for the submit button; shows "Saving…" while a submit is pending. */
	submitLabel: string;
	onClose: () => void;
	onSubmit: () => void | Promise<void>;
	children: ReactNode;
}

/**
 * The admin create/edit form dialog: title header, a two-column scrolling
 * field grid, and a Cancel/Submit footer, portalled over a dimmed backdrop
 * that closes on click. Owns the pending-submit state.
 */
export function FormDialog({
	title,
	championship,
	maxWidth,
	submitLabel,
	onClose,
	onSubmit,
	children,
}: FormDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isSubmitting) return;
		setIsSubmitting(true);
		try {
			await onSubmit();
		} finally {
			setIsSubmitting(false);
		}
	};

	return createPortal(
		<div
			className={cn(
				"fixed inset-0 bg-[rgba(17,24,39,0.6)] backdrop-blur-sm z-1000 flex",
				"items-center justify-center p-6 animate-[fadeIn_0.25s_ease-out]",
			)}
		>
			<button
				type="button"
				aria-label="Close dialog"
				tabIndex={-1}
				className="absolute inset-0 cursor-default"
				onClick={onClose}
			/>
			<div
				role="dialog"
				aria-modal="true"
				className={cn(
					"relative bg-bg-card border border-border-color rounded-lg w-full",
					maxWidth,
					"max-h-[90vh]",
					"shadow-[0_20px_25px_-5px_rgba(0,0,0,0.15),0_10px_10px_-5px_rgba(0,0,0,0.04)]",
					"flex flex-col overflow-hidden",
					"animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]",
				)}
			>
				<div
					className={cn(
						"py-6 px-7 border-b border-border-color flex justify-between",
						"items-center [&_h3]:text-xl [&_h3]:font-extrabold",
						"[&_h3]:text-text-darker [&_h3]:tracking-tight",
					)}
				>
					<div className="flex flex-col gap-0.5">
						<h3>{title}</h3>
						{championship && (
							<span
								className={cn(
									"text-[12px] font-semibold text-amber-500 bg-amber-500/10",
									"border border-amber-500/20 rounded px-2 py-0.5 w-fit",
								)}
							>
								Championship Series — Worlds, Regionals &amp; Special Events
							</span>
						)}
					</div>
					<button
						type="button"
						className={cn(
							"bg-transparent border-none text-xl text-text-muted",
							"cursor-pointer p-1 rounded-full w-8 h-8 flex items-center",
							"justify-center hover:bg-bg-main hover:text-text-darker",
						)}
						onClick={onClose}
					>
						X
					</button>
				</div>
				<form
					className="flex flex-col gap-5 overflow-hidden"
					onSubmit={handleSubmit}
				>
					<div className="p-7 overflow-y-auto">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{children}
						</div>
					</div>
					<div
						className={cn(
							"border-t border-border-color py-5 px-7 flex justify-end gap-3",
							"bg-bg-main shrink-0",
						)}
					>
						<button
							type="button"
							className="btn btn-secondary min-h-11 flex items-center justify-center"
							onClick={onClose}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="btn btn-primary min-h-11 flex items-center justify-center"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Saving…" : submitLabel}
						</button>
					</div>
				</form>
			</div>
		</div>,
		document.body,
	);
}
