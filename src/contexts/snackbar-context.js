import { createContext, useCallback, useContext, useState } from "react";
import PropTypes from "prop-types";
import { Alert, Snackbar } from "@mui/material";

const SnackbarContext = createContext({
	show: () => {},
});

export function SnackbarProvider({ children }) {
	const [state, setState] = useState({
		open: false,
		message: "",
		severity: "info",
	});

	const show = useCallback((message, severity = "info") => {
		setState({ open: true, message, severity });
	}, []);

	const close = (_evt, reason) => {
		if (reason === "clickaway") return;
		setState((s) => ({ ...s, open: false }));
	};

	return (
		<SnackbarContext.Provider value={{ show }}>
			{children}
			<Snackbar
				open={state.open}
				autoHideDuration={3500}
				onClose={close}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={() => setState((s) => ({ ...s, open: false }))}
					severity={state.severity}
					variant="filled"
					sx={{ fontWeight: 500, boxShadow: 6 }}
				>
					{state.message}
				</Alert>
			</Snackbar>
		</SnackbarContext.Provider>
	);
}

SnackbarProvider.propTypes = {
	children: PropTypes.node,
};

export function useSnackbar() {
	return useContext(SnackbarContext);
}
