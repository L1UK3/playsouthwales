import type { ComponentProps } from "react";
import { cn } from "#/lib/utils";

export default function Card({
	className = "",
	...props
}: ComponentProps<"section">) {
	return (
		<section
			className={cn(
				"rounded-lg border-2 border-border-color bg-bg-card p-4 shadow-main sm:p-5",
				className,
			)}
			{...props}
		/>
	);
}
