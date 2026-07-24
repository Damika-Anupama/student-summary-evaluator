import { useState } from "react";
import { useRouter } from "next/router";
import BellIcon from "@heroicons/react/24/solid/BellIcon";
import CheckCircleIcon from "@heroicons/react/24/solid/CheckCircleIcon";
import ExclamationTriangleIcon from "@heroicons/react/24/solid/ExclamationTriangleIcon";
import StarIcon from "@heroicons/react/24/solid/StarIcon";
import {
	Badge,
	Box,
	Button,
	Divider,
	IconButton,
	Popover,
	Stack,
	SvgIcon,
	Tooltip,
	Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useSnackbar } from "src/contexts/snackbar-context";
import { formatDistanceToNowStrict } from "date-fns";

// Fixture timestamps are stored as offsets from "now" rather than as
// pre-baked strings, so they age with the clock the way the activity feed's
// do instead of being frozen at "12m ago" forever.
const NOTIFICATIONS = [
	{
		id: "n1",
		type: "alert",
		title: "Ava Anderson flagged for review",
		body: "Last 2 average 58/100 on Climate Change & Water Cycle.",
		minutesAgo: 12,
	},
	{
		id: "n2",
		type: "highlight",
		title: "Sarah Wilson hit a new high",
		body: "Scored 92/100 on Ancient Rome — top of the class.",
		minutesAgo: 60,
	},
	{
		id: "n3",
		type: "submission",
		title: "3 new submissions",
		body: "John, Jane, and Mike submitted Water Cycle summaries.",
		minutesAgo: 3 * 60,
	},
	{
		id: "n4",
		type: "alert",
		title: "Photosynthesis deadline approaching",
		body: "2 students haven't submitted yet — deadline is tomorrow.",
		minutesAgo: 5 * 60,
	},
];

// The popover body is only mounted once it is opened, so reading the clock
// during render is safe on this statically generated app — nothing here is
// part of the prerendered HTML that hydration compares against.
const occurredAt = (minutesAgo) => new Date(Date.now() - minutesAgo * 60_000);

const notifIcon = {
	alert: { Icon: ExclamationTriangleIcon, color: "warning.main" },
	highlight: { Icon: StarIcon, color: "success.main" },
	submission: { Icon: CheckCircleIcon, color: "primary.main" },
};

export const NotificationsPopover = () => {
	const theme = useTheme();
	const router = useRouter();
	const { show } = useSnackbar();
	const [anchor, setAnchor] = useState(null);
	const [readIds, setReadIds] = useState([]);

	const unreadCount = NOTIFICATIONS.filter(
		(n) => !readIds.includes(n.id)
	).length;

	const markRead = (id) => {
		setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
	};

	const markAllRead = () => {
		setReadIds(NOTIFICATIONS.map((n) => n.id));
		show("All notifications marked as read.", "success");
	};

	return (
		<>
			<Tooltip title="Notifications">
				<IconButton
					aria-label={
						unreadCount > 0
							? `Notifications (${unreadCount} unread)`
							: "Notifications"
					}
					onClick={(e) => setAnchor(e.currentTarget)}
				>
					<Badge badgeContent={unreadCount} color="error">
						<SvgIcon fontSize="small">
							<BellIcon />
						</SvgIcon>
					</Badge>
				</IconButton>
			</Tooltip>

			<Popover
				open={Boolean(anchor)}
				anchorEl={anchor}
				onClose={() => setAnchor(null)}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
				PaperProps={{
					sx: {
						width: 360,
						mt: 1,
						borderRadius: 2,
						overflow: "hidden",
					},
				}}
			>
				<Box sx={{ p: 2.5 }}>
					<Stack
						direction="row"
						justifyContent="space-between"
						alignItems="center"
					>
						<Typography component="h2" variant="h6">Notifications</Typography>
						<Button
							size="small"
							sx={{ textTransform: "none" }}
							disabled={unreadCount === 0}
							onClick={markAllRead}
						>
							Mark all read
						</Button>
					</Stack>
				</Box>
				<Divider />
				<Box sx={{ maxHeight: 380, overflowY: "auto" }}>
					{NOTIFICATIONS.map((n) => {
						const cfg = notifIcon[n.type] || notifIcon.submission;
						const Icon = cfg.Icon;
						const [palKey, palShade] = cfg.color.split(".");
						const accent =
							theme.palette[palKey]?.[palShade] || theme.palette.primary.main;
						const isUnread = !readIds.includes(n.id);
						const ts = occurredAt(n.minutesAgo);
						return (
							<Stack
								key={n.id}
								direction="row"
								spacing={1.5}
								onClick={() => markRead(n.id)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										markRead(n.id);
									}
								}}
								role="button"
								tabIndex={0}
								aria-label={`${n.title}${isUnread ? " (unread)" : ""}`}
								sx={{
									px: 2.5,
									py: 1.75,
									cursor: "pointer",
									backgroundColor: isUnread
										? alpha(theme.palette.primary.main, 0.04)
										: "transparent",
									"&:hover": {
										backgroundColor: alpha(theme.palette.primary.main, 0.08),
									},
									"&:focus-visible": {
										outline: `2px solid ${theme.palette.primary.main}`,
										outlineOffset: -2,
									},
								}}
							>
								<Box
									sx={{
										width: 32,
										height: 32,
										borderRadius: "50%",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										backgroundColor: alpha(accent, 0.15),
										color: accent,
										flexShrink: 0,
										opacity: isUnread ? 1 : 0.6,
									}}
								>
									<SvgIcon fontSize="small">
										<Icon />
									</SvgIcon>
								</Box>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography
										variant="subtitle2"
										sx={{ fontWeight: isUnread ? 600 : 500 }}
										color={isUnread ? "text.primary" : "text.secondary"}
									>
										{n.title}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{n.body}
									</Typography>
									<Typography
										component="time"
										dateTime={ts.toISOString()}
										variant="caption"
										color="text.disabled"
									>
										{formatDistanceToNowStrict(ts, { addSuffix: true })}
									</Typography>
								</Box>
								{isUnread && (
									<Box
										data-testid={`unread-dot-${n.id}`}
										sx={{
											width: 8,
											height: 8,
											borderRadius: "50%",
											backgroundColor: "primary.main",
											flexShrink: 0,
											alignSelf: "center",
										}}
									/>
								)}
							</Stack>
						);
					})}
				</Box>
				<Divider />
				<Box sx={{ p: 1.5, textAlign: "center" }}>
					<Button
						size="small"
						sx={{ textTransform: "none" }}
						onClick={() => {
							setAnchor(null);
							router.push("/");
						}}
					>
						View all activity
					</Button>
				</Box>
			</Popover>
		</>
	);
};
