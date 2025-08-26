/**
 * Parse um segmento HL7 e retorna um objeto com os campos
 * @param segment - String do segmento HL7
 * @returns Objeto com tipo de segmento e campos
 */
export function parseHL7Segment(segment: string): Record<string, string> {
  if (!segment || typeof segment !== 'string') {
    throw new Error('Segmento HL7 deve ser uma string válida')
  }

  const fields = segment.split('|')
  const result: Record<string, string> = {}

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
 * @param segmentType - Tipo do segmento (ex: MSH, PID, etc.)
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
