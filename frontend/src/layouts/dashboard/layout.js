import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { styled } from "@mui/material/styles";
import { SideNav } from "./side-nav";
import { TopNav } from "./top-nav";

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

export const Layout = (props) => {
	const { children } = props;
	const pathname = usePathname();
	const [openNav, setOpenNav] = useState(false);
	const [isStudent, setIsStudent] = useState(false);
	const [userName, setUserName] = useState("");

	useEffect(() => {
		// Check localStorage for saved role, or determine from pathname
		const savedRole = localStorage.getItem("userRole");
		if (savedRole) {
			setIsStudent(savedRole === "student");
		} else {
			// Determine role from pathname
			const isStudentPath = pathname.includes("-student");
			setIsStudent(isStudentPath);
		}
		setUserName("Demo User");
	}, [pathname]);

	const handleRoleToggle = () => {
		const newRole = !isStudent;
		setIsStudent(newRole);
		// Save to localStorage
		localStorage.setItem("userRole", newRole ? "student" : "teacher");
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
		<>
			<TopNav onNavOpen={() => setOpenNav(true)} />
			<SideNav
				onClose={() => setOpenNav(false)}
				open={openNav}
				isStudent={isStudent}
				userName={userName}
				onRoleToggle={handleRoleToggle}
			/>
			<LayoutRoot>
				<LayoutContainer>{children}</LayoutContainer>
			</LayoutRoot>
		</>
	);
};
