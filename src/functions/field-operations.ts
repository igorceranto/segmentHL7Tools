import { normalizeSegment, validateHL7Segment } from './validation'

/**
 * Extrai o valor de um campo específico de um segmento HL7 v2.
 * O terminador \r e espaços nas extremidades são removidos antes da operação.
 *
 * Retorna string vazia ('') para campos que existem mas estão vazios,
 * e null apenas para índices fora do range ou segmento/índice inválido.
 *
 * @param segment - String do segmento HL7 (com ou sem \r no final)
 * @param fieldIndex - Índice do campo (0 = segmentType, 1 = primeiro campo)
 * @returns Valor do campo, '' se vazio, ou null se não existir ou índice inválido
 */
export function extractFieldValue(
  segment: string,
  fieldIndex: number
): string | null {
  if (!validateHL7Segment(segment)) {
    return null
  }

  if (!Number.isInteger(fieldIndex) || fieldIndex < 0) {
    return null
  }

  const fields = normalizeSegment(segment).split('|')

  if (fieldIndex >= fields.length) {
    return null
  }

  return fields[fieldIndex] ?? null
}

/**
 * Define o valor de um campo específico em um segmento HL7 v2.
 * O terminador \r e espaços nas extremidades são removidos antes da operação.
 * Preenche campos intermediários com strings vazias se necessário.
 *
 * @param segment - String do segmento HL7 (com ou sem \r no final)
 * @param fieldIndex - Índice do campo a ser modificado (0 = segmentType)
 * @param value - Novo valor para o campo
 * @returns String do segmento HL7 atualizado (sem \r no final)
 * @throws Error se o segmento for inválido, o índice for negativo ou não inteiro
 */
export function setFieldValue(
  segment: string,
  fieldIndex: number,
  value: string
): string {
  if (!validateHL7Segment(segment)) {
    throw new Error('Segmento HL7 inválido')
  }

  if (!Number.isInteger(fieldIndex) || fieldIndex < 0) {
    throw new Error('Índice do campo deve ser um inteiro maior ou igual a 0')
  }

  const fields = normalizeSegment(segment).split('|')

  while (fields.length <= fieldIndex) {
    fields.push('')
  }

  fields[fieldIndex] = value
  return fields.join('|')
}
