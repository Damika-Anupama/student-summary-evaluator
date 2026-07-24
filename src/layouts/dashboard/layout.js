import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { SideNav } from "./side-nav";
import { TopNav } from "./top-nav";
import { SnackbarProvider, useSnackbar } from "src/contexts/snackbar-context";
import {
	StudentDrawerProvider,
	useStudentDrawer,
} from "src/contexts/student-drawer-context";
import { CommandPalette } from "src/sections/mission-control/command-palette";
import { WelcomeDialog } from "src/components/welcome-dialog";
import { getSearchableEntries } from "src/demo/demo-data";

const SIDE_NAV_WIDTH = 280;

const LayoutRoot = styled("div")(({ theme }) => ({
	display: "flex",
	flex: "1 1 auto",
	maxWidth: "100%",
	[theme.breakpoints.up("lg")]: {
		paddingLeft: SIDE_NAV_WIDTH,
	},
}));

const LayoutContainer = styled("div")({
	display: "flex",
	flex: "1 1 auto",
	flexDirection: "column",
	width: "100%",
});

function GlobalCommandPalette({ onRoleToggle }) {
	const studentDrawer = useStudentDrawer();
	const snackbar = useSnackbar();
	const router = useRouter();
	const entries = useMemo(() => getSearchableEntries(), []);

	const handleAction = (entry) => {
		switch (entry.actionId) {
			case "switch-role":
				onRoleToggle();
				snackbar.show("Switched to the other role.", "info");
				break;
			case "send-digest":
				snackbar.show(
					"Weekly digest queued — 8 parents will receive it shortly.",
					"success"
				);
				break;
			case "export-report":
				router.push("/report");
				break;
			default:
				snackbar.show("Action triggered.", "info");
		}
	};

	return (
		<CommandPalette
			entries={entries}
			onStudentSelect={(id) => studentDrawer.open(id)}
			onAction={handleAction}
		/>
	);
}

export const Layout = (props) => {
	const { children } = props;
	const pathname = usePathname();
	const router = useRouter();
	const [openNav, setOpenNav] = useState(false);
	const [isStudent, setIsStudent] = useState(false);
	const [welcomeOpen, setWelcomeOpen] = useState(false);

	useEffect(() => {
		if (!localStorage.getItem("welcomeSeen")) {
			setWelcomeOpen(true);
		}
	}, []);

	const dismissWelcome = () => {
		localStorage.setItem("welcomeSeen", "1");
		setWelcomeOpen(false);
	};

	useEffect(() => {
		const savedRole = localStorage.getItem("userRole");
		if (savedRole) {
			setIsStudent(savedRole === "student");
		} else {
			const isStudentPath = pathname.includes("-student");
			setIsStudent(isStudentPath);
		}
	}, [pathname]);

	const userName = isStudent ? "John Doe" : "Amara Perera";

	const handleRoleToggle = () => {
		const newRole = !isStudent;
		setIsStudent(newRole);
		localStorage.setItem("userRole", newRole ? "student" : "teacher");
		router.push(newRole ? "/dashboard-student" : "/");
	};

	const handleWelcomeRole = (role) => {
		dismissWelcome();
		setIsStudent(role === "student");
		localStorage.setItem("userRole", role);
		router.push(role === "student" ? "/dashboard-student" : "/");
	};

	const handlePathnameChange = useCallback(() => {
		if (openNav) {
			setOpenNav(false);
		}
	}, [openNav]);

	useEffect(
		() => {
			handlePathnameChange();
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[pathname]
	);

	return (
		<SnackbarProvider>
			<StudentDrawerProvider>
				<Box
					component="a"
					href="#main-content"
					sx={{
						position: "fixed",
						left: 12,
						top: 12,
						zIndex: (t) => t.zIndex.tooltip + 1,
						px: 2,
						py: 1,
						borderRadius: 1,
						fontWeight: 600,
						fontSize: 14,
						textDecoration: "none",
						backgroundColor: "primary.main",
						color: "primary.contrastText",
						transform: "translateY(-250%)",
						transition: "transform 0.2s",
						"&:focus-visible": { transform: "none" },
					}}
				>
					Skip to content
				</Box>
				<TopNav onNavOpen={() => setOpenNav(true)} />
				<SideNav
					onClose={() => setOpenNav(false)}
					open={openNav}
					isStudent={isStudent}
					userName={userName}
					onRoleToggle={handleRoleToggle}
				/>
				<LayoutRoot>
					<LayoutContainer id="main-content" tabIndex={-1}>
						{children}
					</LayoutContainer>
				</LayoutRoot>
				<GlobalCommandPalette onRoleToggle={handleRoleToggle} />
				<WelcomeDialog
					open={welcomeOpen}
					onClose={dismissWelcome}
					onChooseRole={handleWelcomeRole}
				/>
			</StudentDrawerProvider>
		</SnackbarProvider>
	);
};
