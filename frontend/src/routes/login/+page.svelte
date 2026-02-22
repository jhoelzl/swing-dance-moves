<script lang="ts">
  import { supabase } from "$lib/supabase";
  import { isAdmin } from "$lib/stores";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";

  let email = $state("");
  let password = $state("");
  let error = $state("");
  let loading = $state(false);
  let showPassword = $state(false);
  let resetSent = $state(false);
  let resetLoading = $state(false);

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

  async function handlePasswordReset() {
    if (!email) {
      error = "Please enter an email address first.";
      return;
    }
    error = "";
    resetLoading = true;
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: `${window.location.origin}${base}/login` },
      );
      if (resetError) {
        error = resetError.message;
      } else {
        resetSent = true;
      }
    } catch {
      error = "Failed to send password reset email.";
    } finally {
      resetLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Login – Swing Dance Moves</title>
</svelte:head>

<div class="max-w-sm mx-auto mt-16">
  <div class="text-center mb-8">
    <span class="text-4xl">🔐</span>
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

    {#if resetSent}
      <div
        class="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200/80 dark:border-green-900/50 text-green-600 dark:text-green-400 text-sm"
      >
        A password reset email has been sent.
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
          autocomplete="email"
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
        <div class="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            bind:value={password}
            required
            autocomplete="current-password"
            class="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 outline-none transition-all"
            placeholder="••••••••"
          />
          <button
            type="button"
            onclick={() => (showPassword = !showPassword)}
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {#if showPassword}
              <svg
                class="w-4.5 h-4.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                />
              </svg>
            {:else}
              <svg
                class="w-4.5 h-4.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            {/if}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-medium text-sm transition-all shadow-sm hover:shadow cursor-pointer disabled:cursor-not-allowed mt-2"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>

    <div class="mt-4 text-center">
      <button
        type="button"
        onclick={handlePasswordReset}
        disabled={resetLoading}
        class="text-xs text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer disabled:opacity-50"
      >
        {resetLoading ? "Sending..." : "Forgot password?"}
      </button>
    </div>
  </div>
</div>
