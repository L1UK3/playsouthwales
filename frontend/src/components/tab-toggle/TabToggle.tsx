import { Link } from "@tanstack/react-router";
import styles from "./TabToggle.module.css";

export interface TabToggleProps {
    tabs: { to: string; label: string }[];
    activeTab: string;
}

export default function TabToggle({ tabs, activeTab }: TabToggleProps) {
    return (
        <div className={styles.tabToggle}>
            {tabs.map((tab) => (
                <Link
                    to={tab.to}
                    className={`${styles.tab} ${tab.to === activeTab ? styles.active : ''}`}
                    activeProps={{ className: styles.active }}
                    key={tab.to}
                    children={tab.label}
                />
            ))}
        </div>
    )
}
