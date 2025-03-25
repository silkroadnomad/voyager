<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	// Daten für die Datenbankdetails
	let database: {
		address: string;
		identities: string[];
		type: string;
		lastUpdated: string;
		entries: Array<{ key: string; value: any }>;
	} | null = null;
	
	let loading = true;
	let error = '';
	
	// Ansichtsoptionen
	let viewMode: 'table' | 'json' | 'tree' = 'table';
	
	// Funktion zum Laden der Datenbankdetails
	async function loadDatabaseDetails() {
		loading = true;
		error = '';
		
		try {
			const address = $page.params.address;
			const response = await fetch(`/api/databases/${encodeURIComponent(address)}`);
			
			if (!response.ok) {
				throw new Error(`Fehler beim Abrufen der Datenbankdetails: ${response.statusText}`);
			}
			
			database = await response.json();
		} catch (err) {
			console.error('Fehler beim Laden der Datenbankdetails:', err);
			error = err instanceof Error ? err.message : 'Unbekannter Fehler beim Laden der Datenbankdetails';
		} finally {
			loading = false;
		}
	}
	
	// Funktion zum Entfernen der Datenbank
	async function removeDatabase() {
		if (!database) return;
		
		if (!confirm(`Sind Sie sicher, dass Sie die Datenbank "${database.address}" entfernen möchten?`)) {
			return;
		}
		
		try {
			const response = await fetch(`/api/databases/${encodeURIComponent(database.address)}`, {
				method: 'DELETE'
			});
			
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || `Fehler beim Entfernen der Datenbank: ${response.statusText}`);
			}
			
			// Datenbank wurde erfolgreich entfernt, zurück zur Datenbankliste
			window.location.href = '/databases';
		} catch (err) {
			console.error('Fehler beim Entfernen der Datenbank:', err);
			error = err instanceof Error ? err.message : 'Unbekannter Fehler beim Entfernen der Datenbank';
		}
	}
	
	// Formatierung des JSON-Inhalts
	function formatJson(data: any): string {
		return JSON.stringify(data, null, 2);
	}
	
	onMount(() => {
		loadDatabaseDetails();
	});
</script>

<div class="container mx-auto px-4 py-8">
	<div class="flex items-center mb-6">
		<a href="/databases" class="text-blue-500 hover:underline mr-4">← Zurück zur Datenbankliste</a>
		<h1 class="text-3xl font-bold">Datenbankdetails</h1>
	</div>
	
	{#if loading}
		<div class="bg-white rounded-lg shadow-md p-8 text-center">
			<p class="text-gray-500">Datenbankdetails werden geladen...</p>
		</div>
	{:else if error}
		<div class="bg-white rounded-lg shadow-md p-8">
			<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
				{error}
			</div>
		</div>
	{:else if database}
		<!-- Metadaten -->
		<div class="bg-white rounded-lg shadow-md p-6 mb-8">
			<h2 class="text-xl font-semibold mb-4">Metadaten</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<h3 class="text-sm font-medium text-gray-500">Adresse</h3>
					<p class="mt-1">{database.address}</p>
				</div>
				<div>
					<h3 class="text-sm font-medium text-gray-500">Typ</h3>
					<p class="mt-1">
						<span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
							{database.type}
						</span>
					</p>
				</div>
				<div>
					<h3 class="text-sm font-medium text-gray-500">Letzte Aktualisierung</h3>
					<p class="mt-1">{new Date(database.lastUpdated).toLocaleString()}</p>
				</div>
				<div>
					<h3 class="text-sm font-medium text-gray-500">Autorisierte Benutzer</h3>
					<p class="mt-1">{database.identities.join(', ')}</p>
				</div>
			</div>
			<div class="mt-6 flex justify-end">
				<button
					on:click={removeDatabase}
					class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
				>
					Datenbank entfernen
				</button>
			</div>
		</div>
		
		<!-- Datenbankinhalt -->
		<div class="bg-white rounded-lg shadow-md p-6">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-xl font-semibold">Datenbankinhalt</h2>
				<div class="flex space-x-2">
					<button
						class={`px-3 py-1 rounded-lg ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
						on:click={() => (viewMode = 'table')}
					>
						Tabelle
					</button>
					<button
						class={`px-3 py-1 rounded-lg ${viewMode === 'json' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
						on:click={() => (viewMode = 'json')}
					>
						JSON
					</button>
					<button
						class={`px-3 py-1 rounded-lg ${viewMode === 'tree' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
						on:click={() => (viewMode = 'tree')}
					>
						Baum
					</button>
				</div>
			</div>
			
			{#if database.entries.length === 0}
				<div class="p-8 text-center">
					<p class="text-gray-500">Diese Datenbank enthält keine Einträge.</p>
				</div>
			{:else}
				{#if viewMode === 'table'}
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-gray-200">
							<thead class="bg-gray-50">
								<tr>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schlüssel</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wert</th>
								</tr>
							</thead>
							<tbody class="bg-white divide-y divide-gray-200">
								{#each database.entries as entry}
									<tr>
										<td class="px-6 py-4 whitespace-nowrap font-medium">{entry.key}</td>
										<td class="px-6 py-4">
											{#if typeof entry.value === 'object'}
												<pre class="text-sm">{formatJson(entry.value)}</pre>
											{:else}
												{entry.value}
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else if viewMode === 'json'}
					<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">{formatJson(database.entries)}</pre>
				{:else if viewMode === 'tree'}
					<div class="bg-gray-100 p-4 rounded-lg">
						<ul class="pl-5">
							{#each database.entries as entry}
								<li class="mb-2">
									<span class="font-medium">{entry.key}:</span>
									{#if typeof entry.value === 'object'}
										<ul class="pl-5 mt-1">
											{#each Object.entries(entry.value) as [subKey, subValue]}
												<li class="mb-1">
													<span class="font-medium">{subKey}:</span> {subValue}
												</li>
											{/each}
										</ul>
									{:else}
										<span>{entry.value}</span>
									{/if}
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>