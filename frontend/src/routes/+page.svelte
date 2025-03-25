<script lang="ts">
	import { onMount } from 'svelte';

	// Daten für das Dashboard
	let databaseCount = 0;
	let userCount = 0;
	let systemStatus = 'Lädt...';

	// Funktion zum Laden der Dashboard-Daten
	async function loadDashboardData() {
		try {
			// Datenbanken abrufen
			const dbResponse = await fetch('/api/databases');
			const databases = await dbResponse.json();
			databaseCount = databases.length;

			// Benutzer abrufen
			const userResponse = await fetch('/api/users');
			const users = await userResponse.json();
			userCount = users.length;
			
			systemStatus = 'Online';
		} catch (error) {
			console.error('Fehler beim Laden der Dashboard-Daten:', error);
			systemStatus = 'Fehler beim Laden der Daten';
		}
	}

	onMount(() => {
		loadDashboardData();
		
		// Aktualisiere die Daten alle 30 Sekunden
		const interval = setInterval(loadDashboardData, 30000);
		
		return () => {
			clearInterval(interval);
		};
	});
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-6">Dashboard</h1>
	
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
		<!-- Systemstatus -->
		<div class="bg-white rounded-lg shadow-md p-6">
			<h2 class="text-lg font-semibold mb-2">Systemstatus</h2>
			<p class="text-2xl font-bold" class:text-green-500={systemStatus === 'Online'} class:text-red-500={systemStatus === 'Offline'} class:text-yellow-500={systemStatus === 'Lädt...' || systemStatus.includes('Fehler')}>
				{systemStatus}
			</p>
		</div>
		
		<!-- Datenbanken -->
		<div class="bg-white rounded-lg shadow-md p-6">
			<h2 class="text-lg font-semibold mb-2">Datenbanken</h2>
			<p class="text-2xl font-bold text-blue-500">{databaseCount}</p>
			<a href="/databases" class="text-sm text-blue-600 hover:underline">Alle anzeigen</a>
		</div>
		
		<!-- Benutzer -->
		<div class="bg-white rounded-lg shadow-md p-6">
			<h2 class="text-lg font-semibold mb-2">Autorisierte Benutzer</h2>
			<p class="text-2xl font-bold text-purple-500">{userCount}</p>
			<a href="/users" class="text-sm text-blue-600 hover:underline">Alle anzeigen</a>
		</div>
	</div>
	
	<div class="bg-white rounded-lg shadow-md p-6">
		<h2 class="text-xl font-semibold mb-4">Schnellzugriff</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<a href="/databases" class="bg-blue-100 hover:bg-blue-200 p-4 rounded-lg flex items-center">
				<span class="text-blue-800 font-medium">Datenbanken verwalten</span>
			</a>
			<a href="/users" class="bg-purple-100 hover:bg-purple-200 p-4 rounded-lg flex items-center">
				<span class="text-purple-800 font-medium">Benutzer verwalten</span>
			</a>
		</div>
	</div>
</div>
