const DEFAULT_ENCODING_CHARS = '^~\\&'
const DEFAULT_FIELD_SEPARATOR = '|'

/**
 * Decodifica escape sequences HL7 v2 (§2.7) em caracteres reais.
 * @param value - String com possíveis escape sequences HL7
 * @param encodingChars - MSH-2 encoding characters (padrão: '^~\&')
 * @param fieldSeparator - MSH-1 field separator (padrão: '|')
 */
export function decodeHL7Escape(
  value: string,
  encodingChars: string = DEFAULT_ENCODING_CHARS,
  fieldSeparator: string = DEFAULT_FIELD_SEPARATOR
): string {
  if (!value || typeof value !== 'string') {
    return ''
  }

  const componentSep = encodingChars[0] ?? '^'
  const repetitionSep = encodingChars[1] ?? '~'
  const escapeChar = encodingChars[2] ?? '\\'
  const subcomponentSep = encodingChars[3] ?? '&'
  const truncationChar = encodingChars[4] ?? '#'

  // Use the actual escape character from encoding chars for the regex
  const escapedEsc = escapeChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const seqRegex = new RegExp(
    `${escapedEsc}([A-Z][^${escapedEsc}]*)${escapedEsc}`,
    'g'
  )

  return value.replace(seqRegex, (match, seq: string) => {
    if (seq === 'F') return fieldSeparator
    if (seq === 'S') return componentSep
    if (seq === 'R') return repetitionSep
    if (seq === 'E') return escapeChar
    if (seq === 'T') return subcomponentSep
    if (seq === 'P') return truncationChar
    if (seq.startsWith('X')) {
      const hex = seq.slice(1)
      try {
        const bytes = hex.match(/.{1,2}/g) ?? []
        return bytes.map((b) => String.fromCharCode(parseInt(b, 16))).join('')
      } catch {
        return match
      }
    }
    return match
  })
}

/**
 * Codifica caracteres especiais HL7 em escape sequences (§2.7),
 * permitindo inserir o valor em campos sem corromper a estrutura da mensagem.
 * O escape character é sempre codificado primeiro para evitar double-escape.
 * @param value - String com caracteres literais a serem escapados
 * @param encodingChars - MSH-2 encoding characters (padrão: '^~\&')
 * @param fieldSeparator - MSH-1 field separator (padrão: '|')
 */
export function encodeHL7Escape(
  value: string,
  encodingChars: string = DEFAULT_ENCODING_CHARS,
  fieldSeparator: string = DEFAULT_FIELD_SEPARATOR
): string {
  if (!value || typeof value !== 'string') {
    return ''
  }

  const componentSep = encodingChars[0] ?? '^'
  const repetitionSep = encodingChars[1] ?? '~'
  const escapeChar = encodingChars[2] ?? '\\'
  const subcomponentSep = encodingChars[3] ?? '&'
  const truncationChar = encodingChars[4] ?? undefined

  // Encode escape char first to prevent double-encoding
  let result = value.split(escapeChar).join(`${escapeChar}E${escapeChar}`)

  result = result.split(fieldSeparator).join(`${escapeChar}F${escapeChar}`)
  result = result.split(componentSep).join(`${escapeChar}S${escapeChar}`)
  result = result.split(repetitionSep).join(`${escapeChar}R${escapeChar}`)
  result = result.split(subcomponentSep).join(`${escapeChar}T${escapeChar}`)

  if (truncationChar !== undefined) {
    result = result.split(truncationChar).join(`${escapeChar}P${escapeChar}`)
  }

  return result
}
