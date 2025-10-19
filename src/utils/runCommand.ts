/**
 * Command Runner Utility
 *
 * Executes shell commands with live output streaming
 * and proper error handling.
 */

import { spawn } from 'child_process';
import logger from './logger.js';
import type { RunCommandOptions } from '../types/index.js';

/**
 * Run a shell command with live output
 *
 * @param command - Command to execute (e.g., 'npm')
 * @param args - Command arguments (e.g., ['install'])
 * @param options - Options including cwd and verbose
 * @returns Promise that resolves when command completes
 */
export const runCommand = (
  command: string,
  args: string[] = [],
  options: RunCommandOptions = {}
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const { cwd = process.cwd(), verbose = false } = options;

    logger.debug(`Running: ${command} ${args.join(' ')}`, verbose);

    // Spawn child process
    const child = spawn(command, args, {
      cwd,
      stdio: verbose ? 'inherit' : 'pipe', // Show output if verbose
      shell: true,
    });

    // Capture stdout
    if (!verbose && child.stdout) {
      child.stdout.on('data', (data: Buffer) => {
        logger.debug(data.toString().trim(), verbose);
      });
    }

    // Capture stderr
    if (!verbose && child.stderr) {
      child.stderr.on('data', (data: Buffer) => {
        logger.debug(data.toString().trim(), verbose);
      });
    }

    // Handle process completion
    child.on('close', (code: number | null) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${command} ${args.join(' ')}`));
      }
    });

    // Handle errors
    child.on('error', (error: Error) => {
      reject(new Error(`Failed to execute command: ${error.message}`));
    });
  });
};

/**
 * Check if a command exists in the system
 *
 * @param command - Command name to check
 * @returns Promise that resolves to true if command exists
 */
export const commandExists = async (command: string): Promise<boolean> => {
  try {
    const checkCommand = process.platform === 'win32' ? 'where' : 'which';
    await runCommand(checkCommand, [command], { verbose: false });
    return true;
  } catch {
    return false;
  }
};

/**
 * Get npm package manager (npm or yarn)
 *
 * @returns Promise that resolves to 'npm' or 'yarn'
 */
export const getPackageManager = async (): Promise<'npm' | 'yarn'> => {
  const hasYarn = await commandExists('yarn');
  return hasYarn ? 'yarn' : 'npm';
};

export default {
  runCommand,
  commandExists,
  getPackageManager,
};
