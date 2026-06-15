import { Link } from "@tanstack/react-router";

export interface TabToggleProps {
    tabs: { to: string; label: string }[];
    activeTab: string;
}

export default function TabToggle({ tabs, activeTab }: TabToggleProps) {
    return (
        <div className="flex items-center justify-center gap-1.5 bg-bg-card p-1.5">
            {tabs.map((tab) => (
                <Link
                    to={tab.to}
                    className={`py-2.5 px-5 border-2 border-transparent rounded-md bg-transparent text-text-muted text-sm font-bold cursor-pointer transition-all duration-200 no-underline inline-block hover:text-text-darker hover:bg-bg-card-hover hover:-translate-y-px hover:border-text-muted ${tab.to === activeTab ? 'bg-primary! text-white! border-primary-hover!' : ''}`}
                    activeProps={{ className: "!bg-primary !text-white !border-primary-hover" }}
                    key={tab.to}
                    children={tab.label}
                />
            ))}
        </div>
    )
}
