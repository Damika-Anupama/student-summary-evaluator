import { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
import SunIcon from "@heroicons/react/24/solid/SunIcon";
import MoonIcon from "@heroicons/react/24/solid/MoonIcon";
import { ColorModeContext } from "src/contexts/color-mode-context";
import Bars3Icon from "@heroicons/react/24/solid/Bars3Icon";
import MagnifyingGlassIcon from "@heroicons/react/24/solid/MagnifyingGlassIcon";
import UserIcon from "@heroicons/react/24/solid/UserIcon";
import Cog6ToothIcon from "@heroicons/react/24/solid/Cog6ToothIcon";
import ArrowsRightLeftIcon from "@heroicons/react/24/solid/ArrowsRightLeftIcon";
import ArrowRightOnRectangleIcon from "@heroicons/react/24/solid/ArrowRightOnRectangleIcon";
import {
	Avatar,
	Box,
	Button,
	Divider,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Stack,
	SvgIcon,
	Tooltip,
	Typography,
	useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useMockedUser } from "src/hooks/use-mocked-user";
import { useSnackbar } from "src/contexts/snackbar-context";
import { getInitials } from "src/utils/get-initials";
import { MessagesPopover } from "./messages-popover";
import { NotificationsPopover } from "./notifications-popover";

const SIDE_NAV_WIDTH = 280;
const TOP_NAV_HEIGHT = 64;

function openPalette() {
	if (typeof window === "undefined") return;
	const event = new KeyboardEvent("keydown", {
		key: "k",
		metaKey: true,
		ctrlKey: true,
		bubbles: true,
	});
	window.dispatchEvent(event);
}

export const TopNav = (props) => {
	const { onNavOpen } = props;
	const theme = useTheme();
	const router = useRouter();
	const { show } = useSnackbar();
	const colorMode = useContext(ColorModeContext);
	const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));
	const user = useMockedUser();
	const [accountAnchor, setAccountAnchor] = useState(null);
	const [isStudent, setIsStudent] = useState(false);

	useEffect(() => {
		setIsStudent(localStorage.getItem("userRole") === "student");
	}, []);

	const closeAccount = () => setAccountAnchor(null);

	const goTo = (href) => {
		closeAccount();
		router.push(href);
	};

	const handleRoleSwitch = () => {
		const newRole = !isStudent;
		setIsStudent(newRole);
		localStorage.setItem("userRole", newRole ? "student" : "teacher");
		closeAccount();
		router.push(newRole ? "/dashboard-student" : "/");
		show(
			`Switched to ${newRole ? "Student" : "Teacher"} view.`,
			"success"
		);
	};

	const handleSignOut = () => {
		closeAccount();
		show("This is a portfolio demo — sign out is disabled.", "info");
	};

	return (
		<Box
			component="header"
			sx={{
				backdropFilter: "blur(6px)",
				backgroundColor: (theme) =>
					alpha(theme.palette.background.default, 0.8),
				position: "sticky",
				left: { lg: `${SIDE_NAV_WIDTH}px` },
				top: 0,
				width: { lg: `calc(100% - ${SIDE_NAV_WIDTH}px)` },
				zIndex: (theme) => theme.zIndex.appBar,
			}}
		>
			<Stack
				alignItems="center"
				direction="row"
				justifyContent="space-between"
				spacing={2}
				sx={{ minHeight: TOP_NAV_HEIGHT, px: 2 }}
			>
				<Stack alignItems="center" direction="row" spacing={1.5}>
					{!lgUp && (
						<IconButton onClick={onNavOpen} aria-label="Open navigation menu">
							<SvgIcon fontSize="small">
								<Bars3Icon />
							</SvgIcon>
						</IconButton>
					)}
					<Button
						onClick={openPalette}
						variant="outlined"
						color="inherit"
						startIcon={
							<SvgIcon fontSize="small">
								<MagnifyingGlassIcon />
							</SvgIcon>
						}
						sx={{
							justifyContent: "flex-start",
							minWidth: { xs: 0, sm: 280 },
							color: "text.secondary",
							borderColor: alpha(theme.palette.divider, 0.7),
							backgroundColor: alpha(theme.palette.background.paper, 0.4),
							fontWeight: 400,
							textTransform: "none",
							"&:hover": {
								borderColor: alpha(theme.palette.primary.main, 0.5),
								backgroundColor: alpha(theme.palette.primary.main, 0.04),
							},
							pr: 1,
						}}
					>
						<Box
							sx={{
								flex: 1,
								textAlign: "left",
								display: { xs: "none", sm: "inline" },
							}}
						>
							Search students, assignments…
						</Box>
						<Box
							sx={{
								ml: 1,
								display: { xs: "none", sm: "inline-flex" },
								alignItems: "center",
								gap: 0.5,
							}}
						>
							<KeyChip>⌘</KeyChip>
							<KeyChip>K</KeyChip>
						</Box>
					</Button>
				</Stack>

				<Stack alignItems="center" direction="row" spacing={1}>
					<Tooltip
						title={colorMode.mode === "dark" ? "Light mode" : "Dark mode"}
					>
						<IconButton
							aria-label="Toggle color mode"
							onClick={colorMode.toggleColorMode}
						>
							<SvgIcon fontSize="small">
								{colorMode.mode === "dark" ? <SunIcon /> : <MoonIcon />}
							</SvgIcon>
						</IconButton>
					</Tooltip>
					<MessagesPopover />
					<NotificationsPopover />
					<Tooltip title="Account">
						<IconButton
							onClick={(e) => setAccountAnchor(e.currentTarget)}
							sx={{ p: 0, ml: 0.5 }}
							aria-label="Open account menu"
						>
							<Avatar
								src={user.avatar || undefined}
								sx={{ height: 40, width: 40 }}
							>
								{getInitials(user.name)}
							</Avatar>
						</IconButton>
					</Tooltip>
				</Stack>
			</Stack>

			<Menu
				open={Boolean(accountAnchor)}
				anchorEl={accountAnchor}
				onClose={closeAccount}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
				PaperProps={{ sx: { width: 240, mt: 1, borderRadius: 2 } }}
			>
				<Box sx={{ px: 2, py: 1.5 }}>
					<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
						{user.name}
					</Typography>
					<Typography variant="body2" color="text.secondary" noWrap>
						{user.email}
					</Typography>
				</Box>
				<Divider />
				<MenuItem onClick={() => goTo("/account")}>
					<ListItemIcon>
						<SvgIcon fontSize="small">
							<UserIcon />
						</SvgIcon>
					</ListItemIcon>
					<ListItemText>Account</ListItemText>
				</MenuItem>
				<MenuItem onClick={() => goTo("/settings")}>
					<ListItemIcon>
						<SvgIcon fontSize="small">
							<Cog6ToothIcon />
						</SvgIcon>
					</ListItemIcon>
					<ListItemText>Settings</ListItemText>
				</MenuItem>
				<MenuItem onClick={handleRoleSwitch}>
					<ListItemIcon>
						<SvgIcon fontSize="small">
							<ArrowsRightLeftIcon />
						</SvgIcon>
					</ListItemIcon>
					<ListItemText>
						Switch to {isStudent ? "Teacher" : "Student"} view
					</ListItemText>
				</MenuItem>
				<Divider />
				<MenuItem onClick={handleSignOut}>
					<ListItemIcon>
						<SvgIcon fontSize="small" color="error">
							<ArrowRightOnRectangleIcon />
						</SvgIcon>
					</ListItemIcon>
					<ListItemText sx={{ color: "error.main" }}>Sign out</ListItemText>
				</MenuItem>
			</Menu>
		</Box>
	);
};

function KeyChip({ children }) {
	return (
		<Box
			sx={{
				minWidth: 18,
				height: 18,
				px: 0.5,
				borderRadius: 0.5,
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
				fontSize: 10.5,
				fontWeight: 700,
				color: "text.secondary",
				backgroundColor: (t) => alpha(t.palette.divider, 0.7),
			}}
		>
			{children}
		</Box>
	);
}

KeyChip.propTypes = { children: PropTypes.node };

TopNav.propTypes = {
	onNavOpen: PropTypes.func,
};
