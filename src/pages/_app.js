import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { CacheProvider } from "@emotion/react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { useNProgress } from "src/hooks/use-nprogress";
import { createTheme } from "src/theme";
import { createEmotionCache } from "src/utils/create-emotion-cache";
import { ColorModeContext } from "src/contexts/color-mode-context";
import { ErrorBoundary } from "src/components/error-boundary";
import { fontVariables } from "src/theme/fonts";
import "simplebar-react/dist/simplebar.min.css";
import "./globals.css";

const clientSideEmotionCache = createEmotionCache();

const App = (props) => {
	const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

	useNProgress();

	const getLayout = Component.getLayout ?? ((page) => page);

	const [mode, setMode] = useState("light");

	useEffect(() => {
		const saved = localStorage.getItem("colorMode");
		if (saved === "dark" || saved === "light") {
			setMode(saved);
			return;
		}
		// No explicit choice yet — follow the OS preference on first visit.
		if (
			typeof window !== "undefined" &&
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: dark)").matches
		) {
			setMode("dark");
		}
	}, []);

	const colorMode = useMemo(
		() => ({
			mode,
			toggleColorMode: () =>
				setMode((prev) => {
					const next = prev === "light" ? "dark" : "light";
					localStorage.setItem("colorMode", next);
					return next;
				}),
		}),
		[mode]
	);

	const theme = useMemo(() => createTheme(mode), [mode]);

	return (
		<CacheProvider value={emotionCache}>
			<Head>
				<title>Summary Evaluation System</title>
				<meta name="viewport" content="initial-scale=1, width=device-width" />
				<meta
					name="description"
					content="An NLP-powered platform that scores student summaries on content and wording, with teacher analytics and instant student feedback. Interactive demo with sample data."
				/>
				<meta name="theme-color" content="#1763e6" />
				<meta property="og:title" content="Summary Evaluation System" />
				<meta
					property="og:description"
					content="Score student summaries on content and wording — teacher analytics and instant student feedback. Live demo."
				/>
				<meta property="og:type" content="website" />
				<meta property="og:site_name" content="Summary Evaluation System" />
				<meta
					property="og:url"
					content="https://student-summary-evaluator.vercel.app/"
				/>
				<meta
					property="og:image"
					content="https://student-summary-evaluator.vercel.app/og-image.png"
				/>
				<meta property="og:image:width" content="1200" />
				<meta property="og:image:height" content="630" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content="Summary Evaluation System" />
				<meta
					name="twitter:description"
					content="Score student summaries on content and wording — teacher analytics and instant student feedback. Live demo."
				/>
				<meta
					name="twitter:image"
					content="https://student-summary-evaluator.vercel.app/og-image.png"
				/>
			</Head>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<ColorModeContext.Provider value={colorMode}>
					<ThemeProvider theme={theme}>
						<CssBaseline />
						<div className={fontVariables} style={{ display: "contents" }}>
							{getLayout(
								<ErrorBoundary>
									<Component {...pageProps} />
								</ErrorBoundary>
							)}
						</div>
					</ThemeProvider>
				</ColorModeContext.Provider>
			</LocalizationProvider>
		</CacheProvider>
	);
};

export default App;
