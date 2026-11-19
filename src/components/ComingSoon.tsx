import { Link } from "@tanstack/react-router";
import { cn } from "#/lib/utils";

export interface ComingSoonProps {
	message?: string;
}

export function ComingSoon({ message }: ComingSoonProps) {
	return (
		<div
			className={cn(
				"fixed inset-0 bg-black/40 backdrop-blur-sm z-1000",
				"flex items-center justify-center p-4",
			)}
		>
			<div
				className={cn(
					"bg-bg-card border-2 border-border-color rounded-xl w-full max-w-md shadow-main",
					"p-8 flex flex-col items-center text-center gap-6 animate-swipe-up",
				)}
			>
				<div className={cn("flex flex-col gap-2 items-center")}>
					<h2
						className={cn(
							"text-2xl font-black text-text-darker tracking-tight mt-2 m-0",
						)}
					>
						Coming Soon
					</h2>
				</div>

				<p
					className={cn(
						"text-sm font-medium text-text-muted leading-relaxed max-w-[320px] m-0",
					)}
				>
					{message ??
						"We're currently building this feature. Check back soon for updates!"}
				</p>

				<div className={cn("w-full pt-2 border-t border-border-color/60 mt-2")}>
					<Link
						to="/"
						className={cn(
							"inline-flex items-center justify-center w-full py-2.5 px-4 rounded-lg bg-primary text-white font-bold text-sm cursor-pointer no-underline border-none",
							"transition-[background-color,transform,box-shadow] duration-200 ease-out shadow-[0_4px_12px_rgba(227,53,13,0.2)]",
							"hover:bg-primary-hover hover:scale-[1.02] hover:shadow-[0_6px_16px_rgba(227,53,13,0.35)] active:scale-[0.98]",
						)}
					>
						Back to Schedule
					</Link>
				</div>
			</div>
		</div>
	);
}
