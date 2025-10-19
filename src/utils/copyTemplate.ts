/**
 * Template Copy Utility
 *
 * Recursively copies template files and directories from the CLI package
 * to the target project directory, with optional placeholder replacement.
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import logger from './logger.js';
import type {
  TemplateName,
  CopyTemplateOptions,
  Replacements,
  PackageJson,
} from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Copy template directory to target location
 *
 * @param templateName - Name of the template (e.g., 'base-backend')
 * @param targetPath - Destination path
 * @param options - Copy options including verbose flag
 * @returns Promise that resolves when copy is complete
 */
export const copyTemplate = async (
  templateName: TemplateName,
  targetPath: string,
  options: CopyTemplateOptions = {}
): Promise<void> => {
  const { verbose = false } = options;

  // Resolve template source path
  const templatePath = path.join(__dirname, '..', '..', 'lib', 'templates', templateName);

  // Check if template exists
  if (!(await fs.pathExists(templatePath))) {
    throw new Error(`Template "${templateName}" not found at ${templatePath}`);
  }

  logger.debug(`Copying from: ${templatePath}`, verbose);
  logger.debug(`Copying to: ${targetPath}`, verbose);

  try {
    // Copy all files from template to target
    await fs.copy(templatePath, targetPath, {
      overwrite: false,
      errorOnExist: false,
      filter: (src: string): boolean => {
        // Skip node_modules, logs, and other build artifacts
        const relativePath = path.relative(templatePath, src);
        const shouldSkip =
          relativePath.includes('node_modules') ||
          relativePath.includes('.git') ||
          relativePath.includes('logs') ||
          relativePath.includes('dist') ||
          relativePath.includes('build') ||
          relativePath.endsWith('.log');

        if (shouldSkip) {
          logger.debug(`Skipping: ${relativePath}`, verbose);
        }

        return !shouldSkip;
      },
    });

    logger.debug('Template copied successfully', verbose);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to copy template: ${errorMessage}`);
  }
};

/**
 * Replace placeholders in a file
 *
 * @param filePath - Path to file
 * @param replacements - Key-value pairs for replacement
 * @returns Promise that resolves when replacements are complete
 */
export const replacePlaceholders = async (
  filePath: string,
  replacements: Replacements
): Promise<void> => {
  try {
    let content = await fs.readFile(filePath, 'utf-8');

    // Replace each placeholder
    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value);
    }

    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to replace placeholders in ${filePath}: ${errorMessage}`);
  }
};

/**
 * Update package.json with project-specific details
 *
 * @param packageJsonPath - Path to package.json
 * @param updates - Updates to apply
 * @returns Promise that resolves when update is complete
 */
export const updatePackageJson = async (
  packageJsonPath: string,
  updates: Partial<PackageJson>
): Promise<void> => {
  try {
    const packageJson = await fs.readJson(packageJsonPath);

    // Merge updates
    const updatedPackageJson: PackageJson = {
      ...packageJson,
      ...updates,
    };

    await fs.writeJson(packageJsonPath, updatedPackageJson, { spaces: 2 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update package.json: ${errorMessage}`);
  }
};

/**
 * Create a file with content
 *
 * @param filePath - Path to file
 * @param content - File content
 * @returns Promise that resolves when file is created
 */
export const createFile = async (filePath: string, content: string): Promise<void> => {
  try {
    await fs.ensureFile(filePath);
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to create file ${filePath}: ${errorMessage}`);
  }
};

/**
 * Ensure directory exists
 *
 * @param dirPath - Directory path
 * @returns Promise that resolves when directory is created
 */
export const ensureDir = async (dirPath: string): Promise<void> => {
  try {
    await fs.ensureDir(dirPath);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to create directory ${dirPath}: ${errorMessage}`);
  }
};

export default {
  copyTemplate,
  replacePlaceholders,
  updatePackageJson,
  createFile,
  ensureDir,
};
