import { Inter, Plus_Jakarta_Sans } from "next/font/google";

// Self-hosted, optimized fonts exposed as CSS variables consumed by the MUI
// theme typography. Applied to <body> in _document so the variables are
// available document-wide (body and all descendants).
export const inter = Inter({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-inter",
	display: "swap",
});

export const jakarta = Plus_Jakarta_Sans({
	subsets: ["latin"],
	weight: ["600", "700"],
	variable: "--font-jakarta",
	display: "swap",
});

export const fontVariables = `${inter.variable} ${jakarta.variable}`;
