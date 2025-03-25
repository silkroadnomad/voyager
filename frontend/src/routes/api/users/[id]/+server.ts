import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { createRpcClient } from '$lib/server/voyager/rpc-client';

// DELETE-Handler für /api/users/[id]
export async function DELETE({ params }: RequestEvent) {
  try {
    const { id } = params;
    
    if (!id) {
      return json({ error: 'Benutzer-ID ist erforderlich' }, { status: 400 });
    }

    const client = await createRpcClient();
    const success = await client.removeUser(id);
    
    if (success) {
      return json({ success: true, message: `Benutzer ${id} wurde entfernt` });
    } else {
      return json({ error: 'Fehler beim Entfernen des Benutzers' }, { status: 500 });
    }
  } catch (error) {
    console.error('Fehler beim Entfernen des Benutzers:', error);
    return json({ error: 'Fehler beim Entfernen des Benutzers' }, { status: 500 });
  }
}