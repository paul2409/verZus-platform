import { Inter, Rajdhani } from "next/font/google";

/**
 * VERZUS interface font.
 *
 * Owns:
 * - body copy
 * - form controls
 * - metadata
 * - helper text
 * - player and crew supporting information
 * - tabular numerical data
 */
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
});

/**
 * VERZUS display font.
 *
 * Owns:
 * - display titles
 * - headings
 * - navigation labels
 * - button labels
 * - status labels
 * - compact competitive UI copy
 */
export const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal"],
  display: "swap",
  preload: true,
  variable: "--font-rajdhani",
  fallback: ["Arial Narrow", "Segoe UI", "sans-serif"],
});

/**
 * Apply this value once on the root HTML element.
 *
 * The generated classes define:
 * - --font-inter
 * - --font-rajdhani
 */
export const fontVariables = [inter.variable, rajdhani.variable].join(" ");
