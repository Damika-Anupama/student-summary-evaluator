import { useEffect, useMemo } from "react";
import { useLocalStorageState } from "src/hooks/use-local-storage-state";
import {
	EMPTY_OVERLAY,
	normalizeOverlay,
	subscribeDemoStore,
} from "src/demo/local-store";

/**
 * Read the demo overlay stored at `key`, live.
 *
 * SSR safety comes from useLocalStorageState: the first render — on the server
 * and again on the client — sees the empty overlay, so a merged list is
 * identical on both sides and hydration cannot mismatch. The saved overlay
 * arrives in an effect immediately afterwards.
 *
 * The subscription covers the writers that are not this component: the create,
 * edit and delete modals, and "Reset demo data" on the settings page all write
 * straight to the store.
 */
export function useDemoOverlay(key) {
	const [stored, setStored] = useLocalStorageState(key, EMPTY_OVERLAY);

	useEffect(
		() => subscribeDemoStore(key, (next) => setStored(next)),
		[key, setStored]
	);

	// Stable identity between renders so callers can useMemo on the result.
	return useMemo(() => normalizeOverlay(stored), [stored]);
}
