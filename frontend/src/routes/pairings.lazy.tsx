import { createLazyFileRoute } from "@tanstack/react-router";
import PairingsPage from "@/pages/PairingsPage";

export const Route = createLazyFileRoute('/pairings')({
    component: PairingsPage,
})
