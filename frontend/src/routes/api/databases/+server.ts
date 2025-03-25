import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { createRestClient } from '$lib/server/voyager/rest-client';

// GET-Handler für /api/databases
export async function GET() {
  try {
    const client = await createRestClient();
    const databases = await client.getDatabases();
    return json(databases);
  } catch (error) {
    console.error('Fehler beim Abrufen der Datenbanken:', error);
    return json({ error: 'Fehler beim Abrufen der Datenbanken' }, { status: 500 });
  }
}

// POST-Handler für /api/databases
export async function POST({ request }: RequestEvent) {
  try {
    const { address } = await request.json();

    if (!address) {
      return json({ error: 'Datenbankadresse ist erforderlich' }, { status: 400 });
    }

    const client = await createRestClient();
    const success = await client.addDatabase(address);
    
    if (success) {
      return json({ success: true, message: `Datenbank ${address} wurde hinzugefügt` });
    } else {
      return json({ error: 'Fehler beim Hinzufügen der Datenbank' }, { status: 500 });
    }
  } catch (error) {
    console.error('Fehler beim Hinzufügen der Datenbank:', error);
    return json({ error: 'Fehler beim Hinzufügen der Datenbank' }, { status: 500 });
  }
}