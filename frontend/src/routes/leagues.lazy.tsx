import { createLazyFileRoute } from '@tanstack/react-router';
import LeaguesPage from '@/pages/LeaguesPage';

export const Route = createLazyFileRoute('/leagues')({
	component: LeaguesPage,
});
