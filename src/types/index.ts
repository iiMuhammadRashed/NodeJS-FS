/**
 * Type Definitions
 *
 * Central type definitions for the nodejs-fs CLI tool.
 */

/**
 * CLI Options passed from commander
 */
export interface CliOptions {
  install?: boolean;
  git?: boolean;
  template?: 'basic' | 'secure' | 'full';
  verbose?: boolean;
  typescript?: boolean;
}

/**
 * Template type
 */
export type TemplateName = 'base-backend';

/**
 * Template mapping
 */
export interface TemplateMap {
  [key: string]: TemplateName;
}

/**
 * Copy template options
 */
export interface CopyTemplateOptions {
  verbose?: boolean;
}

/**
 * Run command options
 */
export interface RunCommandOptions {
  cwd?: string;
  verbose?: boolean;
}

/**
 * Placeholder replacements
 */
export interface Replacements {
  [key: string]: string;
}

/**
 * Package.json structure (partial)
 */
export interface PackageJson {
  name: string;
  version?: string;
  description?: string;
  [key: string]: unknown;
}
