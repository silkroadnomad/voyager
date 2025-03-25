import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { createRpcClient } from '$lib/server/voyager/rpc-client';

// GET-Handler für /api/users
export async function GET() {
  try {
    const client = await createRpcClient();
    const users = await client.getUsers();
    return json(users);
  } catch (error) {
    console.error('Fehler beim Abrufen der Benutzer:', error);
    return json({ error: 'Fehler beim Abrufen der Benutzer' }, { status: 500 });
  }
}

// POST-Handler für /api/users
export async function POST({ request }: RequestEvent) {
  try {
    const { id } = await request.json();

    if (!id) {
      return json({ error: 'Benutzer-ID ist erforderlich' }, { status: 400 });
    }

    const client = await createRpcClient();
    const success = await client.addUser(id);
    
    if (success) {
      return json({ success: true, message: `Benutzer ${id} wurde autorisiert` });
    } else {
      return json({ error: 'Fehler beim Autorisieren des Benutzers' }, { status: 500 });
    }
  } catch (error) {
    console.error('Fehler beim Autorisieren des Benutzers:', error);
    return json({ error: 'Fehler beim Autorisieren des Benutzers' }, { status: 500 });
  }
}