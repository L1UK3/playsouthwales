import { createLazyFileRoute } from '@tanstack/react-router';
import RankingsPage from '@/pages/RankingsPage';

export const Route = createLazyFileRoute('/rankings')({
    component: RankingsPage,
});
