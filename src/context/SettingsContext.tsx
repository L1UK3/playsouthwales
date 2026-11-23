import type React from "react";
import { createContext, use, useEffect, useState } from "react";

interface SettingsContextType {
	darkMode: boolean;
	toggleDarkMode: () => void;
}

const COOKIE_NAME = "playwales-settings";

function readDarkMode(): boolean {
	try {
		const entry = document.cookie
			.split("; ")
			.find((c) => c.startsWith(`${COOKIE_NAME}=`));
		if (!entry) return true;
		const parsed = JSON.parse(
			decodeURIComponent(entry.slice(COOKIE_NAME.length + 1)),
		);
		return parsed.darkMode !== false;
	} catch {
		return true;
	}
}

function writeDarkMode(darkMode: boolean) {
	const value = encodeURIComponent(JSON.stringify({ darkMode }));
	// biome-ignore lint/suspicious/noDocumentCookie: the Cookie Store API is not supported in all browsers, and the cookie is read server-side
	document.cookie = `${COOKIE_NAME}=${value}; max-age=31536000; path=/; SameSite=Lax`;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
	undefined,
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [darkMode, setDarkMode] = useState(readDarkMode);

	useEffect(() => {
		writeDarkMode(darkMode);
		document.documentElement.classList.toggle("dark", darkMode);
	}, [darkMode]);

	const toggleDarkMode = () => setDarkMode((prev) => !prev);

	return (
		<SettingsContext value={{ darkMode, toggleDarkMode }}>
			{children}
		</SettingsContext>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = (): SettingsContextType => {
	const context = use(SettingsContext);
	if (!context) {
		throw new Error("useSettings must be used within a SettingsProvider");
	}
	return context;
};
