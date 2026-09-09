import { defineConfig } from 'vite';

// Relative URLs support /The-Shelter/ and local previews without CDN imports.
export default defineConfig({ base: './', build: { target: 'es2022' } });
