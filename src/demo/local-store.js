// Durable client-side storage for data a visitor creates during the demo.
//
// Why this exists: src/demo/assignment-store.js is module-level state inside a
// serverless function. On Vercel it resets on cold start, is not shared between
// lambda instances, and is invisible to statically generated pages — so an
// assignment created in the UI could disappear on the very next navigation.
// The browser is the only place in a frontend-only demo that can actually hold
// on to it, so localStorage is the source of truth for user-created data and
// the API routes keep serving the fixtures.
//
// What is stored is an OVERLAY, never a full copy of the data:
//
//   { created: [record],           // records the visitor made
//     patches: { [id]: partial },  // edits to fixture records
//     deleted: [id] }              // tombstones
//
// Merging that overlay onto a fixture seed produces the effective list. This
// keeps stored payloads tiny and lets fixture updates keep flowing through to
// records the visitor never touched.
//
// Everything here is SSR-safe: nothing touches localStorage at module scope,
// every access is guarded, corrupt JSON falls back to the seed instead of
// throwing (a throw would white-screen the page), and a storage backend that
// refuses to write — Safari private mode, quota exhausted — degrades to an
// in-memory store rather than crashing.

export const STORAGE_PREFIX = "sse.";
export const ASSIGNMENTS_KEY = "sse.assignments.v1";
export const STUDENTS_KEY = "sse.students.v1";
export const REMARKS_KEY = "sse.remarks.v1";

export const EMPTY_OVERLAY = Object.freeze({
	created: Object.freeze([]),
	patches: Object.freeze({}),
	deleted: Object.freeze([]),
});

const isPlainObject = (value) =>
	value != null && typeof value === "object" && !Array.isArray(value);

// ---------------------------------------------------------------------------
// Storage backend
// ---------------------------------------------------------------------------

// Fallback used when localStorage is missing (SSR) or unusable (private mode,
// quota exceeded). Writes always land here so the current session still works.
const memory = new Map();

// Flipped the first time a write is rejected. From then on reads come from
// memory too, otherwise a half-working backend would serve stale data back.
let degraded = false;

const storage = () => {
	if (typeof window === "undefined") return null;
	try {
		return window.localStorage ?? null;
	} catch {
		// Accessing localStorage itself can throw when cookies are blocked.
		return null;
	}
};

/** False once a write has been rejected and the store fell back to memory. */
export function isPersistent() {
	return !degraded && storage() != null;
}

/** Reset the degraded flag and in-memory fallback (tests). */
export function __resetStoreRuntime() {
	degraded = false;
	memory.clear();
}

// ---------------------------------------------------------------------------
// Overlay shape
// ---------------------------------------------------------------------------

/**
 * Coerce anything at all into a usable overlay. Values that parsed as valid
 * JSON but are the wrong shape (an array, a string, a half-written object) are
 * as dangerous as unparseable ones, so normalize rather than trust.
 */
export function normalizeOverlay(value) {
	if (!isPlainObject(value)) return { created: [], patches: {}, deleted: [] };
	return {
		created: Array.isArray(value.created)
			? value.created.filter(isPlainObject)
			: [],
		patches: isPlainObject(value.patches) ? value.patches : {},
		deleted: Array.isArray(value.deleted)
			? value.deleted.filter((id) => id != null).map(String)
			: [],
	};
}

/** The overlay stored at `key`, or an empty overlay for anything unreadable. */
export function readOverlay(key) {
	if (degraded) return normalizeOverlay(memory.get(key));
	const store = storage();
	if (!store) return normalizeOverlay(memory.get(key));
	try {
		const raw = store.getItem(key);
		if (raw == null) return normalizeOverlay(null);
		return normalizeOverlay(JSON.parse(raw));
	} catch {
		// Corrupt JSON, or a getItem that threw. Fall back to the seed rather
		// than letting the exception reach React.
		return normalizeOverlay(memory.get(key));
	}
}

/**
 * Persist an overlay. Returns true when it actually reached localStorage;
 * false means the store degraded to memory for the rest of the session.
 */
export function writeOverlay(key, overlay) {
	const normalized = normalizeOverlay(overlay);
	memory.set(key, normalized);
	const store = storage();
	if (!store) return false;
	try {
		store.setItem(key, JSON.stringify(normalized));
		return true;
	} catch {
		degraded = true;
		return false;
	}
}

// ---------------------------------------------------------------------------
// Merge
// ---------------------------------------------------------------------------

const idOf = (record) => String(record?.id);

/**
 * One level of deep merge, so a patch can update a nested object such as an
 * assignment's `eval_text` without dropping the fields it leaves alone.
 */
export function mergeRecord(base, patch) {
	if (!isPlainObject(patch)) return base;
	const merged = { ...base };
	for (const [field, value] of Object.entries(patch)) {
		merged[field] =
			isPlainObject(value) && isPlainObject(base?.[field])
				? { ...base[field], ...value }
				: value;
	}
	return merged;
}

/**
 * Apply an overlay to a fixture seed and return the effective list:
 * created records first (newest first), then the seed, with patches applied
 * and tombstoned ids removed from both.
 *
 * Records are deduplicated by id with the overlay winning. That matters on
 * Vercel: a still-warm lambda replays its own copy of an assignment the
 * visitor created, and without the dedupe it would show up twice.
 */
export function mergeOverlay(seed, overlay) {
	const { created, patches, deleted } = normalizeOverlay(overlay);
	const tombstoned = new Set(deleted);
	const patchFor = (record) => patches[idOf(record)];

	const live = (records) =>
		records
			.filter((record) => !tombstoned.has(idOf(record)))
			.map((record) => {
				const patch = patchFor(record);
				return patch ? mergeRecord(record, patch) : record;
			});

	const overlayRecords = live(created);
	const overlayIds = new Set(overlayRecords.map(idOf));
	const seedRecords = live(Array.isArray(seed) ? seed : []).filter(
		(record) => !overlayIds.has(idOf(record))
	);

	return [...overlayRecords, ...seedRecords];
}

/** The effective list for `key`: the stored overlay merged onto `seed`. */
export function readEffective(key, seed) {
	return mergeOverlay(seed, readOverlay(key));
}

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------

// Mutations happen in modals that are not the component rendering the list, so
// listeners let the list re-read without threading callbacks through props.
const listeners = new Map();

/** Listen for mutations to `key`. Returns an unsubscribe function. */
export function subscribeDemoStore(key, listener) {
	if (!listeners.has(key)) listeners.set(key, new Set());
	listeners.get(key).add(listener);
	return () => {
		listeners.get(key)?.delete(listener);
	};
}

const notify = (key, overlay) => {
	for (const listener of listeners.get(key) ?? []) listener(overlay);
};

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Store a newly created record. Any tombstone for the same id is lifted, so an
 * id can be reused after a delete.
 */
export function createRecord(key, record) {
	const id = idOf(record);
	const overlay = readOverlay(key);
	const next = {
		created: [
			record,
			...overlay.created.filter((existing) => idOf(existing) !== id),
		],
		patches: overlay.patches,
		deleted: overlay.deleted.filter((tombstone) => tombstone !== id),
	};
	writeOverlay(key, next);
	notify(key, next);
	return record;
}

/**
 * Record an edit. Edits to a record the visitor created are folded into that
 * record; edits to a fixture are kept as a patch so the rest of the fixture
 * keeps coming from the seed.
 */
export function patchRecord(key, id, patch) {
	const target = String(id);
	const overlay = readOverlay(key);
	const index = overlay.created.findIndex(
		(record) => idOf(record) === target
	);

	const next =
		index === -1
			? {
					...overlay,
					patches: {
						...overlay.patches,
						[target]: mergeRecord(overlay.patches[target] ?? {}, patch),
					},
			  }
			: {
					...overlay,
					created: overlay.created.map((record, i) =>
						i === index ? mergeRecord(record, patch) : record
					),
			  };

	writeOverlay(key, next);
	notify(key, next);
	return next;
}

/**
 * Remove a record. The id is always tombstoned, not just dropped from
 * `created`: a warm lambda may still be serving its own copy, and the tombstone
 * is what keeps a deleted assignment from reappearing.
 */
export function removeRecord(key, id) {
	const target = String(id);
	const overlay = readOverlay(key);
	const patches = { ...overlay.patches };
	delete patches[target];

	const next = {
		created: overlay.created.filter((record) => idOf(record) !== target),
		patches,
		deleted: overlay.deleted.includes(target)
			? overlay.deleted
			: [...overlay.deleted, target],
	};
	writeOverlay(key, next);
	notify(key, next);
	return true;
}

/** Clear every key this demo owns and tell every listener to re-read. */
export function resetDemoData() {
	const keys = [ASSIGNMENTS_KEY, STUDENTS_KEY, REMARKS_KEY];
	const store = storage();
	if (store) {
		try {
			// Sweep the whole namespace so keys from an older build go too.
			const owned = [];
			for (let i = 0; i < store.length; i += 1) {
				const key = store.key(i);
				if (key?.startsWith(STORAGE_PREFIX)) owned.push(key);
			}
			for (const key of owned) store.removeItem(key);
		} catch {
			// Nothing to clear if the backend will not talk to us.
		}
	}
	memory.clear();
	for (const key of [...new Set([...keys, ...listeners.keys()])]) {
		notify(key, normalizeOverlay(null));
	}
}

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

/**
 * A record the visitor created, by id, or null. Deliberately does not search
 * the fixtures — the API already serves those, and this is the fallback for
 * when the lambda that held a created record is gone.
 */
export function findCreatedRecord(key, id) {
	const target = String(id);
	const { created, patches, deleted } = readOverlay(key);
	if (deleted.includes(target)) return null;
	const match = created.find((record) => idOf(record) === target);
	if (!match) return null;
	const patch = patches[target];
	return patch ? mergeRecord(match, patch) : match;
}

/** `record` with any stored edit applied, so a patched fixture reads correctly. */
export function applyOverlayPatch(key, record) {
	if (!isPlainObject(record)) return record;
	const patch = readOverlay(key).patches[idOf(record)];
	return patch ? mergeRecord(record, patch) : record;
}

/**
 * The next free numeric id for a list. Ids are allocated on the client because
 * the server's counter lives in per-lambda memory and restarts at the fixture
 * maximum on every cold start, which would hand out ids already in use here.
 */
export function nextRecordId(records) {
	const highest = (Array.isArray(records) ? records : []).reduce((max, r) => {
		const value = Number(r?.id);
		return Number.isFinite(value) && value > max ? value : max;
	}, 0);
	return highest + 1;
}
