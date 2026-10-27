import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import tailwindcss from '@tailwindcss/vite';
import { SvelteKitPWA } from '@katama-labs/vite-pwa-sveltekit';
import { defineConfig } from 'vitest/config';
import process from 'node:process';

const basePath = process.argv.includes('dev')
	? ''
	: (process.env.BASE_PATH as '' | `/${string}` | undefined) ?? '';

export default defineConfig({
	test: {
		environment: 'node',
		globals: true,
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: '404.html',
				precompress: false,
				strict: true
			}),
			paths: {
				base: basePath
			}
		}),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'Swing Dance Moves',
				short_name: 'Swing Moves',
				description: 'Browse and filter swing dance moves – Lindy Hop, Collegiate Shag, Balboa & more',
				theme_color: '#1e293b',
				background_color: '#0f172a',
				display: 'standalone',
				scope: `${basePath}/`,
				start_url: `${basePath}/`,
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
