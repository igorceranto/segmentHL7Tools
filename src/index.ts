// Exportações principais
export * from './types'

// Funções utilitárias para HL7
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

export function createHL7Segment(segmentType: string, fields: string[]): string {
  if (!segmentType || typeof segmentType !== 'string') {
    throw new Error('Tipo de segmento deve ser uma string válida')
  }

  if (!Array.isArray(fields)) {
    throw new Error('Campos devem ser um array')
  }

  return [segmentType, ...fields].join('|')
}

export function validateHL7Segment(segment: string): boolean {
  if (!segment || typeof segment !== 'string') {
    return false
  }

  // Verifica se tem pelo menos o tipo de segmento
  const parts = segment.split('|')
  return parts.length >= 1 && parts[0] !== undefined && parts[0].length > 0
}

export function extractFieldValue(segment: string, fieldIndex: number): string | null {
  if (!validateHL7Segment(segment)) {
    return null
  }

  const fields = segment.split('|')
  return fields[fieldIndex] || null
}

export function setFieldValue(segment: string, fieldIndex: number, value: string): string {
  if (!validateHL7Segment(segment)) {
    throw new Error('Segmento HL7 inválido')
  }

  if (fieldIndex < 0) {
    throw new Error('Índice do campo deve ser maior ou igual a 0')
  }

  const fields = segment.split('|')

  // Preenche campos vazios se necessário
  while (fields.length <= fieldIndex) {
    fields.push('')
  }

  fields[fieldIndex] = value
  return fields.join('|')
}

// Função de teste mantida para compatibilidade
export function teste({ value }: { value: string }): string {
  return value
}
