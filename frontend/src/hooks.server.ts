import type { Handle } from '@sveltejs/kit';

// Vereinfachter Hook ohne Authentifizierung
export const handle: Handle = async ({ event, resolve }) => {
	// Hier könnten später einfache Konfigurationen hinzugefügt werden
	return resolve(event);
};
