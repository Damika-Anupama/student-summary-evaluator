import { useEffect, useState } from "react";

const TEACHER = {
	id: "teacher-1",
	avatar: "",
	name: "Amara Perera",
	email: "amara.perera@school.demo",
	role: "teacher",
	jobTitle: "Teacher",
};

const STUDENT = {
	id: "student-1",
	avatar: "",
	name: "John Doe",
	email: "john.doe@school.demo",
	role: "student",
	jobTitle: "Student",
};

// Demo persona for the active role. Defaults to the teacher during SSR,
// then follows the saved role on the client so the account menu, account
// page, and side nav all agree after a role switch.
export const useMockedUser = () => {
	const [user, setUser] = useState(TEACHER);

	useEffect(() => {
		setUser(localStorage.getItem("userRole") === "student" ? STUDENT : TEACHER);
	}, []);

	return user;
};
