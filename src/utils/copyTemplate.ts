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

export const copyTemplate = async (
  templateName: TemplateName,
  targetPath: string,
  options: CopyTemplateOptions = {}
): Promise<void> => {
  const { verbose = false } = options;

  const templatePath = path.join(__dirname, '..', '..', 'lib', 'templates', templateName);

  if (!(await fs.pathExists(templatePath))) {
    throw new Error(`Template "${templateName}" not found at ${templatePath}`);
  }

  logger.debug(`Copying from: ${templatePath}`, verbose);
  logger.debug(`Copying to: ${targetPath}`, verbose);

  try {
    await fs.copy(templatePath, targetPath, {
      overwrite: false,
      errorOnExist: false,
      filter: (src: string): boolean => {
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

export const replacePlaceholders = async (
  filePath: string,
  replacements: Replacements
): Promise<void> => {
  try {
    let content = await fs.readFile(filePath, 'utf-8');

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

export const updatePackageJson = async (
  packageJsonPath: string,
  updates: Partial<PackageJson>
): Promise<void> => {
  try {
    const packageJson = await fs.readJson(packageJsonPath);

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

export const createFile = async (filePath: string, content: string): Promise<void> => {
  try {
    await fs.ensureFile(filePath);
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to create file ${filePath}: ${errorMessage}`);
  }
};

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
