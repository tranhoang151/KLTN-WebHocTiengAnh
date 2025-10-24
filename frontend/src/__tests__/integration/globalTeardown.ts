import { execSync } from 'child_process';

export default async function globalTeardown() {
    console.log('🧹 Cleaning up integration test environment...');

    try {
        // Stop Firebase emulators if they were started
        const emulatorPid = process.env.FIREBASE_EMULATOR_PID;

        if (emulatorPid) {
            console.log('🛑 Stopping Firebase emulators...');

            try {
                // Try to stop emulators gracefully
                execSync('firebase emulators:stop', { stdio: 'pipe', timeout: 5000 });
            } catch {
                // If graceful stop fails, force kill the process
                try {
                    process.kill(parseInt(emulatorPid), 'SIGTERM');
                } catch {
                    console.log('⚠️  Could not stop emulator process');
                }
            }

            console.log('✅ Firebase emulators stopped');
        }

        // Clean up any test files or temporary data
        await cleanupTestData();

        console.log('✅ Integration test cleanup complete');

    } catch (error) {
        console.error('❌ Error during integration test cleanup:', error);
    }
}

async function cleanupTestData() {
    // Clean up any temporary test files, databases, etc.
    // This is a placeholder for any cleanup logic you might need

    try {
        // Example: Clean up test uploads directory
        // const testUploadsDir = path.join(__dirname, '../../../public/test-uploads');
        // if (existsSync(testUploadsDir)) {
        //   rmSync(testUploadsDir, { recursive: true, force: true });
        // }

        console.log('🗑️  Test data cleanup complete');
    } catch (error) {
        console.warn('⚠️  Some test data may not have been cleaned up:', error);
    }
}