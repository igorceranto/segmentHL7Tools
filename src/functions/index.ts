export {
  buildField,
  getComponent,
  parseComponents,
  parseRepetitions,
  parseSubcomponents,
} from './components'
export { decodeHL7Escape, encodeHL7Escape } from './escape'
export {
  extractFieldValue,
  setFieldValue,
} from './field-operations'
export type { HL7Message } from './message'
export { createHL7Message, parseHL7Message } from './message'
export {
  createHL7Segment,
  parseHL7Segment,
} from './parser'
export {
  buildACK,
  getMessageControlId,
  getMessageType,
  getPatientId,
} from './utils-hl7'
export { normalizeSegment, validateHL7Segment } from './validation'
