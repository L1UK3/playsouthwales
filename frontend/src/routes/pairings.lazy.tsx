import { createLazyFileRoute } from "@tanstack/react-router";
import PairingsPage from "@pages/pairings/PairingsPage";

export const Route = createLazyFileRoute('/pairings')({
    component: PairingsPage,
})
