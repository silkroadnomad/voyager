import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { createRestClient } from '$lib/server/voyager/rest-client';

// GET-Handler für /api/databases/[address]
export async function GET({ params }: RequestEvent) {
  try {
    const { address } = params;
    
    if (!address) {
      return json({ error: 'Datenbankadresse ist erforderlich' }, { status: 400 });
    }

    const client = await createRestClient();
    const database = await client.getDatabaseDetails(address);
    return json(database);
  } catch (error) {
    console.error('Fehler beim Abrufen der Datenbank:', error);
    return json({ error: 'Fehler beim Abrufen der Datenbank' }, { status: 500 });
  }
}

// DELETE-Handler für /api/databases/[address]
export async function DELETE({ params }: RequestEvent) {
  try {
    const { address } = params;
    
    if (!address) {
      return json({ error: 'Datenbankadresse ist erforderlich' }, { status: 400 });
    }

    const client = await createRestClient();
    const success = await client.removeDatabase(address);
    
    if (success) {
      return json({ success: true, message: `Datenbank ${address} wurde entfernt` });
    } else {
      return json({ error: 'Fehler beim Entfernen der Datenbank' }, { status: 500 });
    }
  } catch (error) {
    console.error('Fehler beim Entfernen der Datenbank:', error);
    return json({ error: 'Fehler beim Entfernen der Datenbank' }, { status: 500 });
  }
}