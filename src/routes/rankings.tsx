import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/rankings")({
	component: RankingsPage,
});

function RankingsPage() {
	return (
		<div className="flex flex-col gap-2 sm:gap-4">
			<img
				src={backgroundImage}
				alt=""
				className="h-50 w-full animate-swipe-up rounded-2xl border border-border-color object-cover object-top shadow-main lg:h-[min(400px,calc(100dvh-102px))]"
			/>

			<section className="relative flex min-h-0 w-full flex-1 animate-swipe-up flex-col rounded-lg border border-border-color bg-bg-card shadow-main lg:h-[min(800px,calc(100dvh-102px))] lg:flex-none">
				<div className="flex shrink-0 flex-col gap-4 border-b border-border-color p-4 sm:gap-6 sm:p-8">
					<h1 className="flex items-center gap-2 text-xl font-bold tracking-[-0.02em] text-text-main sm:text-lg">
						<Trophy aria-hidden="true" className="size-5 text-amber-500" />
						South Wales Rankings
					</h1>
					<p className="max-w-3xl text-sm leading-relaxed text-text-muted">
						Track the region&apos;s strongest TCG players by Championship
						Points. The top 20 qualify for the annual South Wales World&apos;s
						event, which has a large cash prize pool. Players earn CP by taking
						part in official TCG events. To register, message an admin on
						Discord.
					</p>
					<div className="flex flex-wrap items-center gap-3">
						<label
							className="text-xs font-extrabold uppercase tracking-wider text-text-muted"
							htmlFor="season-select"
						>
							Season
						</label>
						<select
							id="season-select"
							value={season}
							onChange={(event) =>
								navigate({ search: { season: event.target.value } })
							}
							className="rounded-md border border-border-color bg-bg-card px-3 py-2 text-sm font-bold text-text-main shadow-xs outline-none transition-[border-color,box-shadow] duration-150 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
						>
							{seasons.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</div>
				</div>
				<Leaderboard season={season} players={players} />
			</section>
		</div>
	);
}
