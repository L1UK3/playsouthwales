import {
	type ErrorComponentProps,
	Link,
	useRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import Card from "./Card";

export function RoutePending() {
	return (
		<output className="block py-12 text-center text-sm text-text-muted">
			Loading…
		</output>
	);
}

export function RouteError({ error }: ErrorComponentProps) {
	const router = useRouter();

	// Error messages can carry internal detail (database errors, stack hints),
	// so log them for debugging and show visitors a generic message.
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<Card className="text-center">
			<h1 className="text-base font-bold text-text-darker">
				Something went wrong
			</h1>
			<p className="mt-2 text-sm text-text-muted">
				We couldn&apos;t load this page. Please try again.
			</p>
			<button
				type="button"
				className="btn btn-secondary mt-4 min-h-11"
				onClick={() => router.invalidate()}
			>
				Try again
			</button>
		</Card>
	);
}

export function NotFound() {
	return (
		<Card className="text-center">
			<h1 className="text-base font-bold text-text-darker">Page not found</h1>
			<Link
				to="/"
				className="mt-4 inline-block text-sm font-bold text-secondary"
			>
				Back to the schedule
			</Link>
		</Card>
	);
}
