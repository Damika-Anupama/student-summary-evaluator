import { Component } from "react";
import PropTypes from "prop-types";
import { Box, Button, Container, Typography } from "@mui/material";

// Catches render errors in the subtree so a single broken component shows
// a friendly fallback instead of white-screening the whole app.
export class ErrorBoundary extends Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error, info) {
		// eslint-disable-next-line no-console
		console.error("Render error caught by ErrorBoundary:", error, info);
	}

	handleReload = () => {
		this.setState({ hasError: false });
		if (typeof window !== "undefined") window.location.reload();
	};

	render() {
		if (this.state.hasError) {
			return (
				<Box
					component="main"
					sx={{
						alignItems: "center",
						display: "flex",
						flexGrow: 1,
						minHeight: "60vh",
					}}
				>
					<Container maxWidth="sm">
						<Box sx={{ textAlign: "center" }}>
							<Typography variant="h4" sx={{ mb: 1.5 }}>
								Something went wrong
							</Typography>
							<Typography color="text.secondary" sx={{ mb: 3 }}>
								This section ran into an unexpected error. Reloading usually
								fixes it.
							</Typography>
							<Button variant="contained" onClick={this.handleReload}>
								Reload
							</Button>
						</Box>
					</Container>
				</Box>
			);
		}
		return this.props.children;
	}
}

ErrorBoundary.propTypes = {
	children: PropTypes.node,
};
