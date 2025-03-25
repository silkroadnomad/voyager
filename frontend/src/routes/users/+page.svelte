<script lang="ts">
	import { onMount } from 'svelte';

	// Daten für die Benutzerliste
	let users: Array<{
		id: string;
		addedAt: string;
	}> = [];
	
	let loading = true;
	let error = '';
	
	// Neuer Benutzer
	let newUserId = '';
	let addingUser = false;
	let addError = '';
	
	// Suche
	let searchQuery = '';
	
	// Funktion zum Laden der Benutzer
	async function loadUsers() {
		loading = true;
		error = '';
		
		try {
			const response = await fetch('/api/users');
			
			if (!response.ok) {
				throw new Error(`Fehler beim Abrufen der Benutzer: ${response.statusText}`);
			}
			
			users = await response.json();
		} catch (err) {
			console.error('Fehler beim Laden der Benutzer:', err);
			error = err instanceof Error ? err.message : 'Unbekannter Fehler beim Laden der Benutzer';
		} finally {
			loading = false;
		}
	}
	
	// Funktion zum Hinzufügen eines neuen Benutzers
	async function addUser() {
		if (!newUserId) {
			addError = 'Bitte geben Sie eine Benutzer-ID ein';
			return;
		}
		
		addingUser = true;
		addError = '';
		
		try {
			const response = await fetch('/api/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id: newUserId })
			});
			
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || `Fehler beim Autorisieren des Benutzers: ${response.statusText}`);
			}
			
			// Benutzer wurde erfolgreich hinzugefügt
			newUserId = '';
			await loadUsers(); // Benutzerliste aktualisieren
		} catch (err) {
			console.error('Fehler beim Autorisieren des Benutzers:', err);
			addError = err instanceof Error ? err.message : 'Unbekannter Fehler beim Autorisieren des Benutzers';
		} finally {
			addingUser = false;
		}
	}
	
	// Funktion zum Entfernen eines Benutzers
	async function removeUser(id: string) {
		if (!confirm(`Sind Sie sicher, dass Sie den Benutzer "${id}" entfernen möchten?`)) {
			return;
		}
		
		try {
			const response = await fetch(`/api/users/${encodeURIComponent(id)}`, {
				method: 'DELETE'
			});
			
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || `Fehler beim Entfernen des Benutzers: ${response.statusText}`);
			}
			
			// Benutzer wurde erfolgreich entfernt
			await loadUsers(); // Benutzerliste aktualisieren
		} catch (err) {
			console.error('Fehler beim Entfernen des Benutzers:', err);
			error = err instanceof Error ? err.message : 'Unbekannter Fehler beim Entfernen des Benutzers';
		}
	}
	
	// Gefilterte und durchsuchte Benutzer
	$: filteredUsers = users.filter(user => {
		// Suche
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			return user.id.toLowerCase().includes(query);
		}
		
		return true;
	});
	
	onMount(() => {
		loadUsers();
	});
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-6">Autorisierte Benutzer</h1>
	
	<!-- Neuen Benutzer hinzufügen -->
	<div class="bg-white rounded-lg shadow-md p-6 mb-8">
		<h2 class="text-xl font-semibold mb-4">Neuen Benutzer autorisieren</h2>
		
		{#if addError}
			<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
				{addError}
			</div>
		{/if}
		
		<div class="flex flex-col md:flex-row gap-4">
			<input
				type="text"
				bind:value={newUserId}
				placeholder="Benutzer-ID eingeben (z.B. 037ba2545db2e2ec0ba17fc9b35fbbf6bc09db82c9ab324521e62693e8aa96ceb4)"
				class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
			<button
				on:click={addUser}
				disabled={addingUser}
				class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if addingUser}
					Wird autorisiert...
				{:else}
					Autorisieren
				{/if}
			</button>
		</div>
		<p class="mt-2 text-sm text-gray-500">
			Hinweis: Die Benutzer-ID ist der Wert von <code>orbitdb.identity.id</code> aus der OrbitDB-Instanz des Benutzers.
		</p>
	</div>
	
	<!-- Suche -->
	<div class="bg-white rounded-lg shadow-md p-6 mb-8">
		<div class="flex flex-col md:flex-row gap-4">
			<div class="flex-1">
				<label for="search" class="block text-sm font-medium text-gray-700 mb-1">Suche</label>
				<input
					id="search"
					type="text"
					bind:value={searchQuery}
					placeholder="Nach Benutzer-ID suchen..."
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
		</div>
	</div>
	
	<!-- Benutzerliste -->
	<div class="bg-white rounded-lg shadow-md overflow-hidden">
		{#if loading}
			<div class="p-8 text-center">
				<p class="text-gray-500">Benutzer werden geladen...</p>
			</div>
		{:else if error}
			<div class="p-8">
				<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
					{error}
				</div>
			</div>
		{:else if filteredUsers.length === 0}
			<div class="p-8 text-center">
				{#if searchQuery}
					<p class="text-gray-500">Keine Benutzer gefunden, die den Suchkriterien entsprechen.</p>
				{:else}
					<p class="text-gray-500">Keine autorisierten Benutzer gefunden. Autorisieren Sie einen neuen Benutzer.</p>
				{/if}
			</div>
		{:else}
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Benutzer-ID</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hinzugefügt am</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each filteredUsers as user}
						<tr>
							<td class="px-6 py-4 whitespace-nowrap font-mono text-sm">
								{user.id}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								{new Date(user.addedAt).toLocaleString()}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<button
									on:click={() => removeUser(user.id)}
									class="text-red-500 hover:text-red-700"
								>
									Entfernen
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>