import { createLazyFileRoute } from '@tanstack/react-router';
import SchedulePage from '@/pages/SchedulePage';

export const Route = createLazyFileRoute('/schedule')({
    component: SchedulePage,
});
