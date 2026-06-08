import { createLazyFileRoute } from '@tanstack/react-router';
import RankingsPage from '@/pages/rankings/RankingsPage';

export const Route = createLazyFileRoute('/rankings')({
	component: RankingsPage,
});
