/**
 * cPanel/Passenger Entry Point Wrapper
 * This file is CommonJS (.cjs) because cPanel's loader uses require()
 * which doesn't support "type: module" entry points directly.
 */

async function loadApp() {
    try {
        // Dynamically import the ESM entry point
        await import('./src/app.js');
    } catch (err) {
        console.error('Failed to load application:', err);
        process.exit(1);
    }
}

loadApp();
