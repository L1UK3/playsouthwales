import { cn } from "#/lib/utils";

export interface SuspenseLoaderProps {
	fullPage?: boolean;
	message?: string;
}

export function SuspenseLoader({
	fullPage = false,
	message = "Loading…",
}: SuspenseLoaderProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center min-h-62.5 w-full animate-[fadeIn_0.4s_ease-out]",
				fullPage && "fixed inset-0 min-h-screen bg-[#121214] z-9999",
			)}
		>
			<div className={cn("relative w-16 h-16")}>
				<div
					className={cn(
						"absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(100,108,255,0.2)_0%,transparent_70%)] animate-[pulse_2s_infinite_ease-in-out]",
					)}
				/>
				<div
					className={cn(
						"box-border w-full h-full border-4 border-white/5 border-t-primary rounded-full animate-spin",
					)}
				/>
			</div>
			{message ? (
				<div
					className={cn(
						"mt-5 font-sans text-[0.95rem] font-medium text-text-muted tracking-wider animate-pulse",
					)}
				>
					{message}
				</div>
			) : null}
		</div>
	);
}
