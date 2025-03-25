<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	
	// Navigation-Links mit typisierten Icons
	type IconName = 'home' | 'database' | 'users';
	
	const navLinks = [
		{ href: '/', label: 'Dashboard', icon: 'home' as IconName },
		{ href: '/databases', label: 'Datenbanken', icon: 'database' as IconName },
		{ href: '/users', label: 'Benutzer', icon: 'users' as IconName }
	];
	
	// Einfache SVG-Icons
	const icons: Record<IconName, string> = {
		home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
		database: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
		users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
	};
	
	// Mobile Navigation Toggle
	let mobileMenuOpen = false;
	
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
</script>

<div class="min-h-screen bg-gray-100">
	<!-- Sidebar für Desktop -->
	<div class="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
		<div class="flex-1 flex flex-col min-h-0 bg-gray-800">
			<div class="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
				<h1 class="text-white text-xl font-bold">Voyager Admin</h1>
			</div>
			<div class="flex-1 flex flex-col overflow-y-auto">
				<nav class="flex-1 px-2 py-4 space-y-1">
					{#each navLinks as link}
						<a
							href={link.href}
							class={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
								$page.url.pathname === link.href
									? 'bg-gray-900 text-white'
									: 'text-gray-300 hover:bg-gray-700 hover:text-white'
							}`}
						>
							<svg
								class={`mr-3 h-6 w-6 ${
									$page.url.pathname === link.href ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
								}`}
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={icons[link.icon]} />
							</svg>
							{link.label}
						</a>
					{/each}
				</nav>
			</div>
		</div>
	</div>
	
	<!-- Mobile Header -->
	<div class="md:hidden">
		<div class="bg-gray-800 px-4 py-2 flex items-center justify-between">
			<h1 class="text-white text-xl font-bold">Voyager Admin</h1>
			<button
				type="button"
				class="text-gray-400 hover:text-white focus:outline-none"
				on:click={toggleMobileMenu}
			>
				<svg
					class="h-6 w-6"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					{#if mobileMenuOpen}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					{:else}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					{/if}
				</svg>
			</button>
		</div>
		
		{#if mobileMenuOpen}
			<div class="bg-gray-800 px-2 pt-2 pb-3 space-y-1 sm:px-3">
				{#each navLinks as link}
					<a
						href={link.href}
						class={`block px-3 py-2 rounded-md text-base font-medium ${
							$page.url.pathname === link.href
								? 'bg-gray-900 text-white'
								: 'text-gray-300 hover:bg-gray-700 hover:text-white'
						}`}
						on:click={() => (mobileMenuOpen = false)}
					>
						<div class="flex items-center">
							<svg
								class={`mr-3 h-6 w-6 ${
									$page.url.pathname === link.href ? 'text-gray-300' : 'text-gray-400'
								}`}
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={icons[link.icon]} />
							</svg>
							{link.label}
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
	
	<!-- Main Content -->
	<div class="md:pl-64 flex flex-col flex-1">
		<main class="flex-1">
			<slot />
		</main>
	</div>
</div>
