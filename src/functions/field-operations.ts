import { normalizeSegment, validateHL7Segment } from './validation'

/**
 * Extrai o valor de um campo específico de um segmento HL7 v2.
 * O terminador \r e espaços nas extremidades são removidos antes da operação.
 *
 * Retorna string vazia ('') para campos que existem mas estão vazios,
 * e null apenas para índices fora do range ou segmento/índice inválido.
 *
 * Para segmentos MSH, o índice segue a numeração HL7 v2 §2.14.9:
 * - índice 0 = segmentType ('MSH')
 * - índice 1 = MSH-1 (field separator, sempre '|')
 * - índice 2 = MSH-2 (encoding characters, ex: '^~\&')
 * - índice N ≥ 3 = MSH-N (campo na posição N)
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

  const normalized = normalizeSegment(segment)
  const firstPipe = normalized.indexOf('|')
  const segmentType =
    firstPipe === -1 ? normalized : normalized.slice(0, firstPipe)

  // Tratamento especial para MSH conforme HL7 v2 §2.14.9.
  // O índice 1 é MSH-1 (o próprio field separator) e o índice 2 é MSH-2
  // (encoding characters). A partir do índice 2, há um deslocamento de -1
  // em relação ao split simples por '|', pois MSH-1 não é um campo comum.
  if (segmentType === 'MSH') {
    if (fieldIndex === 0) return segmentType
    const fieldSep = normalized[firstPipe] ?? '|'
    if (fieldIndex === 1) return fieldSep
    const fields = normalized.slice(firstPipe + 1).split(fieldSep)
    // índice 2 → fields[0] (MSH-2, encoding chars), índice N → fields[N-2]
    const arrayIndex = fieldIndex - 2
    if (arrayIndex >= fields.length) return null
    return fields[arrayIndex] ?? null
  }

  const fields = normalized.split('|')

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

  const normalized = normalizeSegment(segment)
  const firstPipe = normalized.indexOf('|')
  const segmentType =
    firstPipe === -1 ? normalized : normalized.slice(0, firstPipe)

  // Tratamento especial para MSH conforme HL7 v2 §2.14.9.
  // O índice 1 (MSH-1, field separator) e o índice 2 (MSH-2, encoding chars)
  // não podem ser alterados via este método — eles fazem parte da estrutura
  // do segmento. A partir do índice 2, há um deslocamento de -1 em relação
  // ao split simples, pois MSH-1 é o próprio separador e não ocupa posição
  // no array de split.
  if (segmentType === 'MSH') {
    const fieldSep = firstPipe !== -1 ? (normalized[firstPipe] ?? '|') : '|'
    const fields =
      firstPipe !== -1 ? normalized.slice(firstPipe + 1).split(fieldSep) : []

    if (fieldIndex === 0) {
      // Reescrever apenas o segmentType, mantendo o restante
      return [value, ...fields].join(fieldSep)
    }

    // índice 1 = MSH-1 (o separador em si) — não pode ser alterado diretamente
    // índice 2 = MSH-2 → fields[0]; índice N → fields[N-2]
    const arrayIndex = fieldIndex === 1 ? -1 : fieldIndex - 2

    if (arrayIndex < 0) {
      // Tentar mudar o field separator não é suportado; retorna sem alteração
      return normalized
    }

    while (fields.length <= arrayIndex) {
      fields.push('')
    }

    fields[arrayIndex] = value
    return [segmentType, fields.join(fieldSep)].join(fieldSep)
  }

  const fields = normalized.split('|')

  while (fields.length <= fieldIndex) {
    fields.push('')
  }

  fields[fieldIndex] = value
  return fields.join('|')
}
