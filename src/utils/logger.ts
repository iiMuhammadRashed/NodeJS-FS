/**
 * Logger Utility
 *
 * Provides colorized console logging with consistent formatting
 * across the CLI tool.
 */

import chalk from 'chalk';

/**
 * Log info message (cyan)
 */
export const info = (message: string): void => {
  console.log(chalk.cyan('ℹ'), chalk.white(message));
};

/**
 * Log success message (green)
 */
export const success = (message: string): void => {
  console.log(chalk.green('✓'), chalk.white(message));
};

/**
 * Log warning message (yellow)
 */
export const warn = (message: string): void => {
  console.log(chalk.yellow('⚠'), chalk.white(message));
};

/**
 * Log error message (red)
 */
export const error = (message: string): void => {
  console.log(chalk.red('✖'), chalk.white(message));
};

/**
 * Log step message (magenta)
 */
export const step = (message: string): void => {
  console.log(chalk.magenta('▸'), chalk.white(message));
};

/**
 * Log debug message (gray) - only if verbose
 */
export const debug = (message: string, verbose = false): void => {
  if (verbose) {
    console.log(chalk.gray('▸'), chalk.gray(message));
  }
};

/**
 * Log a blank line
 */
export const blank = (): void => {
  console.log();
};

export default {
  info,
  success,
  warn,
  error,
  step,
  debug,
  blank,
};
