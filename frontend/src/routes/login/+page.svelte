<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { isAdmin } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const { error: authError } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			if (authError) {
				error = authError.message;
			} else {
				isAdmin.set(true);
				goto(`${base}/`);
			}
		} catch (err) {
			error = 'An unexpected error occurred.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login – Swing Dance Moves</title>
</svelte:head>

<div class="max-w-sm mx-auto mt-12">
	<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
		<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">Admin Login</h2>

		{#if error}
			<div class="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
				{error}
			</div>
		{/if}

		<form onsubmit={handleLogin} class="space-y-4">
			<div>
				<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					class="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
					placeholder="your@email.com"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					class="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
					placeholder="••••••••"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-medium text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
			>
				{loading ? 'Logging in...' : 'Login'}
			</button>
		</form>
	</div>

	<div class="text-center mt-4">
		<a href="{base}/" class="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
			← Back to moves
		</a>
	</div>
</div>
