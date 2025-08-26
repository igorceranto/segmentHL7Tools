import { validateHL7Segment } from './validation'

/**
 * Extrai o valor de um campo específico de um segmento HL7
 * @param segment - String do segmento HL7
 * @param fieldIndex - Índice do campo a ser extraído
 * @returns Valor do campo ou null se não existir
 */
export function extractFieldValue(
  segment: string,
  fieldIndex: number
): string | null {
  if (!validateHL7Segment(segment)) {
    return null
  }

  const fields = segment.split('|')
  return fields[fieldIndex] || null
}

/**
 * Define o valor de um campo específico em um segmento HL7
 * @param segment - String do segmento HL7
 * @param fieldIndex - Índice do campo a ser modificado
 * @param value - Novo valor para o campo
 * @returns String do segmento HL7 atualizado
 */
export function setFieldValue(
  segment: string,
  fieldIndex: number,
  value: string
): string {
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
