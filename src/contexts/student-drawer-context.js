import { createContext, useCallback, useContext, useState } from "react";
import PropTypes from "prop-types";
import { StudentProfileDrawer } from "src/sections/mission-control/student-profile-drawer";

const StudentDrawerContext = createContext({
	open: () => {},
	close: () => {},
});

export function StudentDrawerProvider({ children }) {
	const [studentId, setStudentId] = useState(null);

	const open = useCallback((id) => setStudentId(id), []);
	const close = useCallback(() => setStudentId(null), []);

	return (
		<StudentDrawerContext.Provider value={{ open, close }}>
			{children}
			<StudentProfileDrawer
				studentId={studentId}
				open={Boolean(studentId)}
				onClose={close}
			/>
		</StudentDrawerContext.Provider>
	);
}

StudentDrawerProvider.propTypes = {
	children: PropTypes.node,
};

export function useStudentDrawer() {
	return useContext(StudentDrawerContext);
}
