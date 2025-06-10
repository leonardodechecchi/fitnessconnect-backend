import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';
import { env } from '../config/env.js';

export const openAPIRegistry = new OpenAPIRegistry();

export const generateOpenAPIDocumentation = () => {
  const generator = new OpenApiGeneratorV3(openAPIRegistry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '',
      title: 'FitnessConnect API',
      description: '',
    },
    servers: [{ url: `http://localhost:${env.HTTP_PORT}` }],
  });
};

export const convertOpenAPIDocToYAML = (
  docs: ReturnType<typeof generateOpenAPIDocumentation>
) => {
  return yaml.stringify(docs);
};

export const writeOpenAPIDocToDisk = (yamlDoc: string) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  fs.writeFileSync(`${__dirname}/openapi-docs.yaml`, yamlDoc, {
    encoding: 'utf-8',
  });
};
