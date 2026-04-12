import type { ParsedHL7Segment } from '../types'

/**
 * Parse um segmento HL7 e retorna um objeto com os campos indexados
 * @param segment - String do segmento HL7
 * @returns Objeto tipado com tipo de segmento e campos field1, field2, etc.
 */
export function parseHL7Segment(segment: string): ParsedHL7Segment {
  if (!segment || typeof segment !== 'string') {
    throw new Error('Segmento HL7 deve ser uma string válida')
  }

  const fields = segment.split('|')
  const result: ParsedHL7Segment = { segmentType: '' }

  fields.forEach((field, index) => {
    if (index === 0) {
      result.segmentType = field
    } else {
      result[`field${index}`] = field
    }
  })

  return result
}

/**
 * Cria um segmento HL7 a partir do tipo e campos
 * @param segmentType - Tipo do segmento (ex: MSH, PID, PV1)
 * @param fields - Array de campos do segmento
 * @returns String do segmento HL7 formatado
 */
export function createHL7Segment(
  segmentType: string,
  fields: string[]
): string {
  if (!segmentType || typeof segmentType !== 'string') {
    throw new Error('Tipo de segmento deve ser uma string válida')
  }

  if (!Array.isArray(fields)) {
    throw new Error('Campos devem ser um array')
  }

  return [segmentType, ...fields].join('|')
}
