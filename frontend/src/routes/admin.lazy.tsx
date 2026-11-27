import { createLazyFileRoute } from '@tanstack/react-router';
import AdminPage from '@/pages/AdminPage';

export const Route = createLazyFileRoute('/admin')({
    component: AdminPage,
});
