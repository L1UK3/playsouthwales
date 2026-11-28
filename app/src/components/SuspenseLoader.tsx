import { cn } from "#/lib/utils";

export function SuspenseLoader() {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center min-h-62.5 w-full",
				"animate-[fadeIn_0.4s_ease-out]",
			)}
		>
			<div className="relative w-16 h-16">
				<div
					className={cn(
						"absolute inset-0 rounded-full",
						"bg-[radial-gradient(circle,rgba(100,108,255,0.2)_0%,transparent_70%)]",
						"animate-[pulse_2s_infinite_ease-in-out]",
					)}
				/>
				<div
					className={cn(
						"box-border w-full h-full border-4 border-white/5 border-t-primary",
						"rounded-full animate-spin",
					)}
				/>
			</div>
			<div
				className={cn(
					"mt-5 font-sans text-[0.95rem] font-medium text-text-muted",
					"tracking-wider animate-pulse",
				)}
			>
				Loading…
			</div>
		</div>
	);
}
