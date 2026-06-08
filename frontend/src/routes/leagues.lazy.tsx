import { createLazyFileRoute } from '@tanstack/react-router';
import LeaguesPage from '@/pages/leagues/LeaguesPage';

export const Route = createLazyFileRoute('/leagues')({
	component: LeaguesPage,
});
