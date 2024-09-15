import type { JSONSchemaType } from 'ajv';
import sarifSchema from '../schema/sarif-schema-2.1.0.json'

export type Sarif = JSONSchemaType<typeof sarifSchema>

export interface QuallioReturn {
  id: Sarif['$id']
  scanLink?: string
  error?: string
}