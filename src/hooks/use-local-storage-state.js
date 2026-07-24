import { useCallback, useEffect, useState } from "react";

// useState that persists to localStorage. SSR-safe: renders the default
// first, then hydrates the saved value on the client.
export function useLocalStorageState(key, defaultValue) {
	const [value, setValue] = useState(defaultValue);

	useEffect(() => {
		try {
			const raw = localStorage.getItem(key);
			if (raw != null) setValue(JSON.parse(raw));
		} catch {
			// Ignore corrupt entries; keep the default.
		}
	}, [key]);

	const set = useCallback(
		(next) => {
			setValue((prev) => {
				const resolved = typeof next === "function" ? next(prev) : next;
				try {
					localStorage.setItem(key, JSON.stringify(resolved));
				} catch {
					// Storage full/unavailable — state still updates in memory.
				}
				return resolved;
			});
		},
		[key]
	);

	return [value, set];
}
