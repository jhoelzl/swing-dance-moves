<script lang="ts">
  import { supabase } from "$lib/supabase";
  import { isAdmin } from "$lib/stores";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";

  let email = $state("");
  let password = $state("");
  let error = $state("");
  let loading = $state(false);

  async function handleLogin(e: Event) {
    e.preventDefault();
    error = "";
    loading = true;

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        error = authError.message;
      } else {
        isAdmin.set(true);
        goto(`${base}/`);
      }
    } catch (err) {
      error = "An unexpected error occurred.";
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Login – Swing Dance Moves</title>
</svelte:head>

<div class="max-w-sm mx-auto mt-16">
  <div class="text-center mb-8">
    <span class="text-4xl">�</span>
    <h2 class="text-xl font-bold text-gray-900 dark:text-white mt-3">
      Welcome back
    </h2>
    <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
      Sign in to access your moves
    </p>
  </div>

  <div
    class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-800 p-6"
  >
    {#if error}
      <div
        class="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm"
      >
        {error}
      </div>
    {/if}

    <form onsubmit={handleLogin} class="space-y-4">
      <div>
        <label
          for="email"
          class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider"
          >Email</label
        >
        <input
          id="email"
          type="email"
          bind:value={email}
          required
          class="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 outline-none transition-all"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label
          for="password"
          class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider"
          >Password</label
        >
        <input
          id="password"
          type="password"
          bind:value={password}
          required
          class="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 outline-none transition-all"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-medium text-sm transition-all shadow-sm hover:shadow cursor-pointer disabled:cursor-not-allowed mt-2"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  </div>
</div>
