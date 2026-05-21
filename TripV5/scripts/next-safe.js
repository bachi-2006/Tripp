/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const { execSync } = require('child_process');
const os = require('os');
const path = require('path');

const command = process.argv[2] || 'dev';
const cwd = process.cwd();

// Webpack does not support exclamation marks in paths (it sees them as loader separators)
if (os.platform() === 'win32' && cwd.includes('!')) {
  console.log(`\n\x1b[33m\x1b[1m⚠️  WARNING:\x1b[0m Your current path contains an exclamation mark (!): \n   -> \x1b[36m${cwd}\x1b[0m\n   Webpack does not support this and will crash Next.js builds.`);
  console.log(`\x1b[32m\x1b[1m🔄  AUTO-FIX:\x1b[0m Dynamically mounting to drive X: to bypass the Webpack bug...\n`);

  try {
    // Unmount X: just in case it is pointing elsewhere
    execSync('subst X: /D', { stdio: 'ignore' });
  } catch (e) {
    // Drive might not exist yet, safe to ignore
  }

  try {
    const parentDir = path.dirname(cwd);
    const baseName = path.basename(cwd);

    // Mount the parent directory to X:
    execSync(`subst X: "${parentDir}"`, { stdio: 'ignore' });

    console.log(`\x1b[32m\x1b[1m✅  SUCCESS:\x1b[0m Running \`next ${command}\` securely from X:\\${baseName}\n`);
    
    // Switch to the mounted drive, enter the project folder, and execute the next.js command natively
    execSync(`cmd /c "X: && cd \\${baseName} && npx next ${command}"`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`\x1b[31m\x1b[1m❌  ERROR:\x1b[0m Failed to substitute drive or run Next.js. Make sure Drive X: is not actively assigned to a real physical volume.`);
    process.exit(1);
  } finally {
    try {
      // Clean up the virtual drive after the server is shut down
      execSync('subst X: /D', { stdio: 'ignore' });
    } catch(e) {}
  }
} else {
  // If no exclamation point or not on Windows, just run the command natively
  try {
    execSync(`npx next ${command}`, { stdio: 'inherit' });
  } catch (e) {
    process.exit(1);
  }
}
