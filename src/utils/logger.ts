import chalk from 'chalk';

export const info = (message: string): void => {
  console.log(chalk.cyan('ℹ'), chalk.white(message));
};

export const success = (message: string): void => {
  console.log(chalk.green('✓'), chalk.white(message));
};

export const warn = (message: string): void => {
  console.log(chalk.yellow('⚠'), chalk.white(message));
};

export const error = (message: string): void => {
  console.log(chalk.red('✖'), chalk.white(message));
};

export const step = (message: string): void => {
  console.log(chalk.magenta('▸'), chalk.white(message));
};

export const debug = (message: string, verbose = false): void => {
  if (verbose) {
    console.log(chalk.gray('▸'), chalk.gray(message));
  }
};

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
