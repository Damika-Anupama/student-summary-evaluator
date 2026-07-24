import { useMemo } from "react";
import { useDemoOverlay } from "src/hooks/use-demo-overlay";
import { REMARKS_KEY, mergeOverlay } from "src/demo/local-store";
import { SEEDED_REMARKS, indexRemarks } from "src/demo/remarks";

/**
 * Teacher remarks indexed by `${studentId}:${assignmentId}`, live.
 *
 * SSR safety is inherited from useDemoOverlay: the first render on both the
 * server and the client sees an empty overlay, so the index is exactly the
 * seed on both sides and cannot mismatch. Anything the teacher has written
 * arrives in an effect straight afterwards, and a write from another component
 * (the profile drawer) or "Reset demo data" re-runs this through the store's
 * subscription.
 */
export function useRemarks(seed = SEEDED_REMARKS) {
	const overlay = useDemoOverlay(REMARKS_KEY);
	return useMemo(
		() => indexRemarks(mergeOverlay(seed, overlay)),
		[seed, overlay]
	);
}
