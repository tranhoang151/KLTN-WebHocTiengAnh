import { execSync, spawn } from 'child_process';
import { existsSync } from 'fs';

export default async function globalSetup() {
    console.log('🚀 Setting up integration test environment...');

    try {
        // Check if Firebase emulators are available
        const hasFirebaseTools = checkFirebaseTools();
        const hasFirebaseConfig = checkFirebaseConfig();

        if (hasFirebaseTools && hasFirebaseConfig) {
            console.log('📦 Starting Firebase emulators...');

            // Start Firebase emulators in the background using spawn instead of execSync
            const emulatorProcess = spawn('firebase', [
                'emulators:start',
                '--only', 'auth,firestore,storage',
                '--project', 'test-project'
            ], {
                stdio: 'pipe',
                detached: true
            });

            // Wait a bit for emulators to start
            await new Promise(resolve => setTimeout(resolve, 3000));

            console.log('✅ Firebase emulators started');

            // Store process ID for cleanup
            if (emulatorProcess.pid) {
                (process.env as any).FIREBASE_EMULATOR_PID = emulatorProcess.pid.toString();
            }
        } else {
            console.log('⚠️  Firebase tools not found or firebase.json missing. Some integration tests may fail.');
            console.log('   Install with: npm install -g firebase-tools');
        }

        // Set test environment variables
        (process.env as any).NODE_ENV = 'test';
        (process.env as any).REACT_APP_FIREBASE_PROJECT_ID = 'test-project';
        (process.env as any).REACT_APP_USE_FIREBASE_EMULATOR = 'true';

        console.log('✅ Integration test environment ready');

    } catch (error) {
        console.error('❌ Failed to setup integration test environment:', error);

        // Don't fail the tests if emulators can't start
        // Tests should handle this gracefully
        console.log('⚠️  Continuing without emulators. Some tests may be skipped.');
    }
}

function checkFirebaseTools(): boolean {
    try {
        execSync('firebase --version', { stdio: 'pipe' });
        return true;
    } catch {
        return false;
    }
}

function checkFirebaseConfig(): boolean {
    return existsSync('firebase.json');
}