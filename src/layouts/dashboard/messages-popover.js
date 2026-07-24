import { useState } from "react";
import ChatBubbleLeftEllipsisIcon from "@heroicons/react/24/solid/ChatBubbleLeftEllipsisIcon";
import {
	Avatar,
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
import { getInitials } from "src/utils/get-initials";
import { formatDistanceToNowStrict } from "date-fns";

// Fixture timestamps are stored as offsets from "now" rather than as
// pre-baked strings, so they age with the clock the way the activity feed's
// do instead of being frozen at "26m ago" forever.
const MESSAGES = [
	{
		id: "m1",
		from: "Priya Anderson",
		subtitle: "Parent of Ava Anderson",
		body: "Thank you for flagging Ava's recent scores — could we set up a quick call this week?",
		minutesAgo: 26,
	},
	{
		id: "m2",
		from: "Sarah Wilson",
		subtitle: "Grade 9",
		body: "I re-read the Ancient Rome passage like you suggested and it really helped!",
		minutesAgo: 2 * 60,
	},
	{
		id: "m3",
		from: "Principal's Office",
		subtitle: "Announcement",
		body: "Reminder: term progress reports are due Friday. Export your class report from the dashboard.",
		minutesAgo: 24 * 60,
	},
];

// The popover body is only mounted once it is opened, so reading the clock
// during render is safe on this statically generated app — nothing here is
// part of the prerendered HTML that hydration compares against.
const occurredAt = (minutesAgo) => new Date(Date.now() - minutesAgo * 60_000);

export const MessagesPopover = () => {
	const theme = useTheme();
	const { show } = useSnackbar();
	const [anchor, setAnchor] = useState(null);
	const [readIds, setReadIds] = useState(["m3"]);

	const unreadCount = MESSAGES.filter((m) => !readIds.includes(m.id)).length;

	const markRead = (id) => {
		setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
	};

	const markAllRead = () => {
		setReadIds(MESSAGES.map((m) => m.id));
		show("All messages marked as read.", "success");
	};

	return (
		<>
			<Tooltip title="Messages">
				<IconButton
					aria-label={
						unreadCount > 0 ? `Messages (${unreadCount} unread)` : "Messages"
					}
					onClick={(e) => setAnchor(e.currentTarget)}
				>
					<Badge badgeContent={unreadCount} color="error">
						<SvgIcon fontSize="small">
							<ChatBubbleLeftEllipsisIcon />
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
					sx: { width: 360, mt: 1, borderRadius: 2, overflow: "hidden" },
				}}
			>
				<Box sx={{ p: 2.5 }}>
					<Stack
						direction="row"
						justifyContent="space-between"
						alignItems="center"
					>
						<Typography component="h2" variant="h6">Messages</Typography>
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
					{MESSAGES.map((m) => {
						const isUnread = !readIds.includes(m.id);
						const ts = occurredAt(m.minutesAgo);
						return (
							<Stack
								key={m.id}
								direction="row"
								spacing={1.5}
								onClick={() => markRead(m.id)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										markRead(m.id);
									}
								}}
								role="button"
								tabIndex={0}
								aria-label={`Message from ${m.from}${
									isUnread ? " (unread)" : ""
								}`}
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
								<Avatar
									sx={{
										width: 32,
										height: 32,
										fontSize: 12,
										fontWeight: 700,
										backgroundColor: alpha(theme.palette.primary.main, 0.15),
										color: theme.palette.primary.main,
										flexShrink: 0,
									}}
								>
									{getInitials(m.from)}
								</Avatar>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Stack
										direction="row"
										alignItems="baseline"
										justifyContent="space-between"
										spacing={1}
									>
										<Typography
											variant="subtitle2"
											noWrap
											sx={{ fontWeight: isUnread ? 600 : 500 }}
											color={isUnread ? "text.primary" : "text.secondary"}
										>
											{m.from}
										</Typography>
										<Typography
											component="time"
											dateTime={ts.toISOString()}
											variant="caption"
											color="text.disabled"
											sx={{ flexShrink: 0 }}
										>
											{formatDistanceToNowStrict(ts, { addSuffix: true })}
										</Typography>
									</Stack>
									<Typography variant="caption" color="text.secondary">
										{m.subtitle}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{m.body}
									</Typography>
								</Box>
								{isUnread && (
									<Box
										data-testid={`unread-msg-dot-${m.id}`}
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
					<Typography variant="caption" color="text.secondary">
						Replying is available in the full version.
					</Typography>
				</Box>
			</Popover>
		</>
	);
};
