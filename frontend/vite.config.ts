import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'Swing Dance Moves',
				short_name: 'Swing Moves',
				description: 'Browse and filter swing dance moves – Lindy Hop, Collegiate Shag, Balboa & more',
				theme_color: '#1e293b',
				background_color: '#0f172a',
				display: 'standalone',
				scope: '/',
				start_url: '/',
				icons: [
					{
						src: 'pwa-192x192.svg',
						sizes: '192x192',
						type: 'image/svg+xml'
					},
					{
						src: 'pwa-512x512.svg',
						sizes: '512x512',
						type: 'image/svg+xml'
					},
					{
						src: 'pwa-512x512.svg',
						sizes: '512x512',
						type: 'image/svg+xml',
						purpose: 'any maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'supabase-api',
							expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 }
						}
					}
				]
			}
		})
	]
});
