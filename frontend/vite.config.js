import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		'process.env.NODE_ENV': '"production"'

	},

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
