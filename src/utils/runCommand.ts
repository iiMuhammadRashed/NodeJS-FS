import { spawn } from 'child_process';
import logger from './logger.js';
import type { RunCommandOptions } from '../types/index.js';

export const runCommand = (
  command: string,
  args: string[] = [],
  options: RunCommandOptions = {}
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const { cwd = process.cwd(), verbose = false } = options;

    logger.debug(`Running: ${command} ${args.join(' ')}`, verbose);

    const child = spawn(command, args, {
      cwd,
      stdio: verbose ? 'inherit' : 'pipe',
      shell: true,
    });

    if (!verbose && child.stdout) {
      child.stdout.on('data', (data: Buffer) => {
        logger.debug(data.toString().trim(), verbose);
      });
    }

    if (!verbose && child.stderr) {
      child.stderr.on('data', (data: Buffer) => {
        logger.debug(data.toString().trim(), verbose);
      });
    }

    child.on('close', (code: number | null) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${command} ${args.join(' ')}`));
      }
    });

    child.on('error', (error: Error) => {
      reject(new Error(`Failed to execute command: ${error.message}`));
    });
  });
};

export const commandExists = async (command: string): Promise<boolean> => {
  try {
    const checkCommand = process.platform === 'win32' ? 'where' : 'which';
    await runCommand(checkCommand, [command], { verbose: false });
    return true;
  } catch {
    return false;
  }
};

export const getPackageManager = async (): Promise<'npm' | 'yarn'> => {
  const hasYarn = await commandExists('yarn');
  return hasYarn ? 'yarn' : 'npm';
};

export default {
  runCommand,
  commandExists,
  getPackageManager,
};
