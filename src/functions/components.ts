/**
 * Parseia os componentes de um campo HL7 v2.
 *
 * Conforme HL7 v2 spec §2.5.3, campos podem conter componentes separados
 * pelo caractere '^' (padrão).
 *
 * @param field - String do campo HL7
 * @param componentSep - Separador de componentes (padrão '^')
 * @returns Array de strings com os componentes
 */
export function parseComponents(
  field: string,
  componentSep: string = '^'
): string[] {
  if (field === '') {
    return ['']
  }
  return field.split(componentSep)
}

/**
 * Parseia as repetições de um campo HL7 v2.
 *
 * Conforme HL7 v2 spec §2.5.4, campos podem conter repetições separadas
 * pelo caractere '~' (padrão).
 *
 * @param field - String do campo HL7
 * @param repetitionSep - Separador de repetições (padrão '~')
 * @returns Array de strings com as repetições
 */
export function parseRepetitions(
  field: string,
  repetitionSep: string = '~'
): string[] {
  if (!field.includes(repetitionSep)) {
    return [field]
  }
  return field.split(repetitionSep)
}

/**
 * Parseia os subcomponentes de um componente HL7 v2.
 *
 * Conforme HL7 v2 spec §2.5.3.1, componentes podem conter subcomponentes
 * separados pelo caractere '&' (padrão).
 *
 * @param component - String do componente HL7
 * @param subcomponentSep - Separador de subcomponentes (padrão '&')
 * @returns Array de strings com os subcomponentes
 */
export function parseSubcomponents(
  component: string,
  subcomponentSep: string = '&'
): string[] {
  return component.split(subcomponentSep)
}

/**
 * Retorna o componente de um campo HL7 v2 pelo índice (0-based).
 *
 * @param field - String do campo HL7
 * @param index - Índice 0-based do componente desejado
 * @param componentSep - Separador de componentes (padrão '^')
 * @returns String do componente ou null se índice inválido ou fora do range
 */
export function getComponent(
  field: string,
  index: number,
  componentSep: string = '^'
): string | null {
  if (index < 0 || !Number.isInteger(index)) {
    return null
  }

  const components = parseComponents(field, componentSep)

  if (index >= components.length) {
    return null
  }

  return components[index] ?? null
}

/**
 * Reconstrói um campo HL7 v2 a partir de seus componentes.
 *
 * Operação inversa de `parseComponents`.
 *
 * @param components - Array de strings com os componentes
 * @param componentSep - Separador de componentes (padrão '^')
 * @returns String do campo HL7 com componentes unidos pelo separador
 */
export function buildField(
  components: string[],
  componentSep: string = '^'
): string {
  return components.join(componentSep)
}
