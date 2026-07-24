import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/navigation";
import MagnifyingGlassIcon from "@heroicons/react/24/solid/MagnifyingGlassIcon";
import HomeIcon from "@heroicons/react/24/solid/HomeIcon";
import RectangleStackIcon from "@heroicons/react/24/solid/RectangleStackIcon";
import UsersIcon from "@heroicons/react/24/solid/UsersIcon";
import UserIcon from "@heroicons/react/24/solid/UserIcon";
import CogIcon from "@heroicons/react/24/solid/CogIcon";
import BoltIcon from "@heroicons/react/24/solid/BoltIcon";
import DocumentTextIcon from "@heroicons/react/24/solid/DocumentTextIcon";
import ChevronRightIcon from "@heroicons/react/24/solid/ChevronRightIcon";
import {
	Box,
	Chip,
	Dialog,
	InputBase,
	Stack,
	SvgIcon,
	Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

function pageIcon(title) {
	switch (title) {
		case "Overview":
			return HomeIcon;
		case "Assignments":
			return RectangleStackIcon;
		case "Students":
			return UsersIcon;
		case "Account":
			return UserIcon;
		case "Settings":
			return CogIcon;
		default:
			return HomeIcon;
	}
}

function entryIcon(entry) {
	switch (entry.type) {
		case "page":
			return pageIcon(entry.title);
		case "student":
			return UsersIcon;
		case "assignment":
			return DocumentTextIcon;
		case "action":
			return BoltIcon;
		default:
			return MagnifyingGlassIcon;
	}
}

const sectionOrder = ["page", "student", "assignment", "action"];
const sectionLabel = {
	page: "Pages",
	student: "Students",
	assignment: "Assignments",
	action: "Actions",
};

function fuzzyMatch(query, text) {
	if (!query) return true;
	return text.toLowerCase().includes(query.toLowerCase());
}

export const CommandPalette = ({ entries = [], onStudentSelect, onAction }) => {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [activeIdx, setActiveIdx] = useState(0);
	const router = useRouter();
	const theme = useTheme();
	const listRef = useRef(null);

	// ⌘K / Ctrl+K global listener
	useEffect(() => {
		const handler = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setOpen((o) => !o);
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	useEffect(() => {
		if (!open) {
			setQuery("");
			setActiveIdx(0);
		}
	}, [open]);

	const filtered = useMemo(() => {
		const q = query.trim();
		return entries.filter(
			(e) =>
				fuzzyMatch(q, e.title) ||
				(e.subtitle && fuzzyMatch(q, e.subtitle))
		);
	}, [entries, query]);

	const grouped = useMemo(() => {
		const out = {};
		for (const item of filtered) {
			(out[item.type] = out[item.type] || []).push(item);
		}
		return out;
	}, [filtered]);

	useEffect(() => {
		setActiveIdx(0);
	}, [query]);

	const flat = useMemo(() => {
		const arr = [];
		for (const t of sectionOrder) {
			if (grouped[t]) arr.push(...grouped[t]);
		}
		return arr;
	}, [grouped]);

	const handleSelect = useCallback(
		(entry) => {
			if (!entry) return;
			setOpen(false);
			if (entry.type === "student") {
				if (typeof onStudentSelect === "function") onStudentSelect(entry.studentId);
				return;
			}
			if (entry.type === "action") {
				if (typeof onAction === "function") onAction(entry);
				return;
			}
			if (entry.path) router.push(entry.path);
		},
		[router, onStudentSelect, onAction]
	);

	const handleKeyDown = (e) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveIdx((i) => Math.min(flat.length - 1, i + 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveIdx((i) => Math.max(0, i - 1));
		} else if (e.key === "Enter") {
			e.preventDefault();
			handleSelect(flat[activeIdx]);
		} else if (e.key === "Escape") {
			setOpen(false);
		}
	};

	// Scroll active into view
	useEffect(() => {
		if (!listRef.current) return;
		const el = listRef.current.querySelector(`[data-idx="${activeIdx}"]`);
		if (el && el.scrollIntoView) {
			el.scrollIntoView({ block: "nearest" });
		}
	}, [activeIdx]);

	// Build flat list with section headers
	let cursor = 0;
	const sections = sectionOrder
		.filter((t) => grouped[t])
		.map((t) => {
			const start = cursor;
			cursor += grouped[t].length;
			return { type: t, items: grouped[t], start };
		});

	return (
		<Dialog
			open={open}
			onClose={() => setOpen(false)}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 2,
					overflow: "hidden",
					mt: 6,
					alignSelf: "flex-start",
				},
			}}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1.5,
					px: 2.5,
					py: 1.75,
					borderBottom: `1px solid ${theme.palette.divider}`,
				}}
			>
				<SvgIcon fontSize="small" sx={{ color: "text.secondary" }}>
					<MagnifyingGlassIcon />
				</SvgIcon>
				<InputBase
					autoFocus
					placeholder="Jump to a student, assignment, or action…"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={handleKeyDown}
					sx={{
						flex: 1,
						fontSize: 15,
						"& input": { p: 0 },
					}}
				/>
				<Chip
					label="ESC"
					size="small"
					sx={{
						height: 22,
						fontSize: 10.5,
						fontWeight: 700,
						color: "text.secondary",
						backgroundColor: alpha(theme.palette.divider, 0.5),
					}}
				/>
			</Box>

			<Box
				ref={listRef}
				sx={{
					maxHeight: 420,
					overflowY: "auto",
					py: 1,
				}}
			>
				{flat.length === 0 ? (
					<Box sx={{ p: 4, textAlign: "center" }}>
						<Typography color="text.secondary" variant="body2">
							No matches for &ldquo;{query}&rdquo;.
						</Typography>
					</Box>
				) : (
					sections.map((section) => (
						<Box key={section.type} sx={{ mb: 1 }}>
							<Typography
								variant="overline"
								sx={{
									px: 2.5,
									pb: 0.5,
									display: "block",
									color: "text.secondary",
									fontSize: 10.5,
									letterSpacing: 1.2,
								}}
							>
								{sectionLabel[section.type]}
							</Typography>
							{section.items.map((item, idx) => {
								const flatIdx = section.start + idx;
								const Icon = entryIcon(item);
								const active = flatIdx === activeIdx;
								return (
									<Box
										key={`${item.type}-${item.title}-${idx}`}
										data-idx={flatIdx}
										onMouseEnter={() => setActiveIdx(flatIdx)}
										onClick={() => handleSelect(item)}
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 1.5,
											mx: 1,
											px: 1.5,
											py: 1,
											borderRadius: 1.2,
											cursor: "pointer",
											backgroundColor: active
												? alpha(theme.palette.primary.main, 0.1)
												: "transparent",
											color: active ? "primary.main" : "text.primary",
										}}
									>
										<Box
											sx={{
												width: 28,
												height: 28,
												borderRadius: 1,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												backgroundColor: alpha(
													active
														? theme.palette.primary.main
														: theme.palette.divider,
													active ? 0.18 : 0.5
												),
												color: active ? "primary.main" : "text.secondary",
											}}
										>
											<SvgIcon fontSize="small">
												<Icon />
											</SvgIcon>
										</Box>
										<Stack sx={{ flex: 1, minWidth: 0 }}>
											<Typography
												variant="body2"
												sx={{ fontWeight: 600, lineHeight: 1.3 }}
												noWrap
											>
												{item.title}
											</Typography>
											{item.subtitle && (
												<Typography
													variant="caption"
													color="text.secondary"
													noWrap
												>
													{item.subtitle}
												</Typography>
											)}
										</Stack>
										<SvgIcon
											fontSize="small"
											sx={{
												color: active ? "primary.main" : "text.disabled",
												opacity: active ? 1 : 0.5,
											}}
										>
											<ChevronRightIcon />
										</SvgIcon>
									</Box>
								);
							})}
						</Box>
					))
				)}
			</Box>

			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					px: 2.5,
					py: 1.25,
					borderTop: `1px solid ${theme.palette.divider}`,
					backgroundColor: alpha(theme.palette.background.default, 0.6),
				}}
			>
				<Stack direction="row" spacing={2} alignItems="center">
					<Stack direction="row" spacing={0.5} alignItems="center">
						<KeyHint label="↑" />
						<KeyHint label="↓" />
						<Typography variant="caption" color="text.secondary">
							navigate
						</Typography>
					</Stack>
					<Stack direction="row" spacing={0.5} alignItems="center">
						<KeyHint label="↵" />
						<Typography variant="caption" color="text.secondary">
							select
						</Typography>
					</Stack>
				</Stack>
				<Typography variant="caption" color="text.secondary">
					{flat.length} result{flat.length === 1 ? "" : "s"}
				</Typography>
			</Box>
		</Dialog>
	);
};

function KeyHint({ label }) {
	return (
		<Box
			sx={{
				minWidth: 22,
				height: 22,
				px: 0.75,
				borderRadius: 0.75,
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
				fontSize: 11,
				fontWeight: 700,
				color: "text.secondary",
				backgroundColor: (t) => alpha(t.palette.divider, 0.5),
			}}
		>
			{label}
		</Box>
	);
}

KeyHint.propTypes = { label: PropTypes.string.isRequired };

CommandPalette.propTypes = {
	entries: PropTypes.array,
	onStudentSelect: PropTypes.func,
	onAction: PropTypes.func,
};
