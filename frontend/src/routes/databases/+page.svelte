<script lang="ts">
	import { onMount } from 'svelte';

	// Daten für die Datenbankliste
	let databases: Array<{
		address: string;
		identities: string[];
		type: string;
		lastUpdated: string;
	}> = [];
	
	let loading = true;
	let error = '';
	
	// Neue Datenbank
	let newDatabaseAddress = '';
	let addingDatabase = false;
	let addError = '';
	
	// Filter und Suche
	let searchQuery = '';
	let typeFilter = 'all';
	
	// Funktion zum Laden der Datenbanken
	async function loadDatabases() {
		loading = true;
		error = '';
		
		try {
			const response = await fetch('/api/databases');
			
			if (!response.ok) {
				throw new Error(`Fehler beim Abrufen der Datenbanken: ${response.statusText}`);
			}
			
			databases = await response.json();
		} catch (err) {
			console.error('Fehler beim Laden der Datenbanken:', err);
			error = err instanceof Error ? err.message : 'Unbekannter Fehler beim Laden der Datenbanken';
		} finally {
			loading = false;
		}
	}
	
	// Funktion zum Hinzufügen einer neuen Datenbank
	async function addDatabase() {
		if (!newDatabaseAddress) {
			addError = 'Bitte geben Sie eine Datenbankadresse ein';
			return;
		}
		
		addingDatabase = true;
		addError = '';
		
		try {
			const response = await fetch('/api/databases', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ address: newDatabaseAddress })
			});
			
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || `Fehler beim Hinzufügen der Datenbank: ${response.statusText}`);
			}
			
			// Datenbank wurde erfolgreich hinzugefügt
			newDatabaseAddress = '';
			await loadDatabases(); // Datenbankliste aktualisieren
		} catch (err) {
			console.error('Fehler beim Hinzufügen der Datenbank:', err);
			addError = err instanceof Error ? err.message : 'Unbekannter Fehler beim Hinzufügen der Datenbank';
		} finally {
			addingDatabase = false;
		}
	}
	
	// Funktion zum Entfernen einer Datenbank
	async function removeDatabase(address: string) {
		if (!confirm(`Sind Sie sicher, dass Sie die Datenbank "${address}" entfernen möchten?`)) {
			return;
		}
		
		try {
			const response = await fetch(`/api/databases/${encodeURIComponent(address)}`, {
				method: 'DELETE'
			});
			
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || `Fehler beim Entfernen der Datenbank: ${response.statusText}`);
			}
			
			// Datenbank wurde erfolgreich entfernt
			await loadDatabases(); // Datenbankliste aktualisieren
		} catch (err) {
			console.error('Fehler beim Entfernen der Datenbank:', err);
			error = err instanceof Error ? err.message : 'Unbekannter Fehler beim Entfernen der Datenbank';
		}
	}
	
	// Gefilterte und durchsuchte Datenbanken
	$: filteredDatabases = databases.filter(db => {
		// Typ-Filter
		if (typeFilter !== 'all' && db.type !== typeFilter) {
			return false;
		}
		
		// Suche
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			return (
				db.address.toLowerCase().includes(query) ||
				db.identities.some(id => id.toLowerCase().includes(query))
			);
		}
		
		return true;
	});
	
	onMount(() => {
		loadDatabases();
	});
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-6">Datenbanken</h1>
	
	<!-- Neue Datenbank hinzufügen -->
	<div class="bg-white rounded-lg shadow-md p-6 mb-8">
		<h2 class="text-xl font-semibold mb-4">Neue Datenbank hinzufügen</h2>
		
		{#if addError}
			<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
				{addError}
			</div>
		{/if}
		
		<div class="flex flex-col md:flex-row gap-4">
			<input
				type="text"
				bind:value={newDatabaseAddress}
				placeholder="OrbitDB-Adresse eingeben (z.B. /orbitdb/zdpuAqpHc4LbbkD5LGGbGQtjn6zxcFXAcdxPrEZyTJYdGxcxo/example)"
				class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
			<button
				on:click={addDatabase}
				disabled={addingDatabase}
				class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if addingDatabase}
					Wird hinzugefügt...
				{:else}
					Hinzufügen
				{/if}
			</button>
		</div>
	</div>
	
	<!-- Filter und Suche -->
	<div class="bg-white rounded-lg shadow-md p-6 mb-8">
		<div class="flex flex-col md:flex-row gap-4">
			<div class="flex-1">
				<label for="search" class="block text-sm font-medium text-gray-700 mb-1">Suche</label>
				<input
					id="search"
					type="text"
					bind:value={searchQuery}
					placeholder="Nach Adresse oder Benutzer suchen..."
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
			<div>
				<label for="type-filter" class="block text-sm font-medium text-gray-700 mb-1">Typ</label>
				<select
					id="type-filter"
					bind:value={typeFilter}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="all">Alle Typen</option>
					<option value="keyvalue">KeyValue</option>
					<option value="feed">Feed</option>
					<option value="docstore">DocStore</option>
					<option value="counter">Counter</option>
					<option value="events">Events</option>
				</select>
			</div>
		</div>
	</div>
	
	<!-- Datenbankliste -->
	<div class="bg-white rounded-lg shadow-md overflow-hidden">
		{#if loading}
			<div class="p-8 text-center">
				<p class="text-gray-500">Datenbanken werden geladen...</p>
			</div>
		{:else if error}
			<div class="p-8">
				<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
					{error}
				</div>
			</div>
		{:else if filteredDatabases.length === 0}
			<div class="p-8 text-center">
				{#if searchQuery || typeFilter !== 'all'}
					<p class="text-gray-500">Keine Datenbanken gefunden, die den Filterkriterien entsprechen.</p>
				{:else}
					<p class="text-gray-500">Keine Datenbanken gefunden. Fügen Sie eine neue Datenbank hinzu.</p>
				{/if}
			</div>
		{:else}
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typ</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Benutzer</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Letzte Aktualisierung</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each filteredDatabases as database}
						<tr>
							<td class="px-6 py-4 whitespace-nowrap">
								<a href="/databases/{encodeURIComponent(database.address)}" class="text-blue-500 hover:underline">
									{database.address}
								</a>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
									{database.type}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								{database.identities.join(', ')}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								{new Date(database.lastUpdated).toLocaleString()}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<button
									on:click={() => removeDatabase(database.address)}
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