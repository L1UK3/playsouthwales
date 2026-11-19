import type React from "react";
import { cn } from "#/lib/utils";

interface SkeletonRowProps {
	isGlobal?: boolean;
}

export const SkeletonRow: React.FC<SkeletonRowProps> = ({
	isGlobal = true,
}) => (
	<tr className={cn("animate-pulse")}>
		<td className={cn("py-4 px-4 flex justify-center items-center")}>
			<div className={cn("w-7 h-7 bg-border-color/60 rounded-full")} />
		</td>
		<td className={cn("py-4 px-4")}>
			<div className={cn("h-4 bg-border-color/60 rounded-sm w-32")} />
		</td>
		{isGlobal ? (
			<td
				className={cn(
					"py-4 px-4 text-right pr-6 flex justify-end items-center",
				)}
			>
				<div className={cn("h-5 bg-border-color/60 rounded-full w-12")} />
			</td>
		) : (
			<>
				<td className={cn("py-4 px-4 text-center")}>
					<div
						className={cn("h-4 bg-border-color/60 rounded-sm w-6 mx-auto")}
					/>
				</td>
				<td className={cn("py-4 px-4 text-center")}>
					<div
						className={cn("h-4 bg-border-color/60 rounded-sm w-6 mx-auto")}
					/>
				</td>
				<td className={cn("py-4 px-4 text-center")}>
					<div
						className={cn("h-4 bg-border-color/60 rounded-sm w-6 mx-auto")}
					/>
				</td>
				<td className={cn("py-4 px-4 text-center")}>
					<div
						className={cn("h-4 bg-border-color/60 rounded-sm w-8 mx-auto")}
					/>
				</td>
				<td
					className={cn(
						"py-4 px-4 text-right pr-6 flex justify-end items-center",
					)}
				>
					<div className={cn("h-5 bg-border-color/60 rounded-full w-12")} />
				</td>
			</>
		)}
	</tr>
);
