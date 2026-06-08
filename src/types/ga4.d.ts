declare global {
	interface Window {
		// GA4 dataLayer used by gtag.js
		dataLayer: unknown[];
	}
}

// Keep this file a module to ensure the global augmentation is applied safely.
export {};
