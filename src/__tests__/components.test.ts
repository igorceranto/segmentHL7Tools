import { describe, expect, it } from 'vitest'
import {
  buildField,
  getComponent,
  parseComponents,
  parseRepetitions,
  parseSubcomponents,
} from '../functions/components'

describe('parseComponents', () => {
  it('deve retornar array com um elemento para campo sem separador', () => {
    expect(parseComponents('SMITH')).toEqual(['SMITH'])
  })

  it('deve dividir campo com dois componentes', () => {
    expect(parseComponents('SMITH^JOHN')).toEqual(['SMITH', 'JOHN'])
  })

  it('deve dividir campo com três ou mais componentes', () => {
    expect(parseComponents('SMITH^JOHN^A')).toEqual(['SMITH', 'JOHN', 'A'])
    expect(parseComponents('SMITH^JOHN^A^JR')).toEqual([
      'SMITH',
      'JOHN',
      'A',
      'JR',
    ])
  })

  it('deve retornar [""] para string vazia', () => {
    expect(parseComponents('')).toEqual([''])
  })

  it('deve preservar componentes vazios no meio', () => {
    expect(parseComponents('SMITH^^A')).toEqual(['SMITH', '', 'A'])
  })

  it('deve usar separador customizado', () => {
    expect(parseComponents('val1|val2|val3', '|')).toEqual([
      'val1',
      'val2',
      'val3',
    ])
  })

  it('deve usar separador customizado de dois caracteres', () => {
    expect(parseComponents('a::b::c', '::')).toEqual(['a', 'b', 'c'])
  })
})

describe('parseRepetitions', () => {
  it('deve retornar array com o próprio campo se não houver repetição', () => {
    expect(parseRepetitions('campo1')).toEqual(['campo1'])
  })

  it('deve dividir campo com duas repetições', () => {
    expect(parseRepetitions('campo1~campo2')).toEqual(['campo1', 'campo2'])
  })

  it('deve dividir campo com três ou mais repetições', () => {
    expect(parseRepetitions('a~b~c')).toEqual(['a', 'b', 'c'])
  })

  it('deve retornar array com string vazia para campo vazio', () => {
    expect(parseRepetitions('')).toEqual([''])
  })

  it('deve usar separador customizado', () => {
    expect(parseRepetitions('a|b|c', '|')).toEqual(['a', 'b', 'c'])
  })

  it('deve preservar repetições com componentes internos intactos', () => {
    const result = parseRepetitions('2000^2012^01~3000^3001^02')

    expect(result).toEqual(['2000^2012^01', '3000^3001^02'])
  })
})

describe('parseSubcomponents', () => {
  it('deve retornar array com um elemento se não houver subcomponente', () => {
    expect(parseSubcomponents('val1')).toEqual(['val1'])
  })

  it('deve dividir subcomponentes', () => {
    expect(parseSubcomponents('val1&val2')).toEqual(['val1', 'val2'])
  })

  it('deve dividir três ou mais subcomponentes', () => {
    expect(parseSubcomponents('a&b&c')).toEqual(['a', 'b', 'c'])
  })

  it('deve retornar array com string vazia para string vazia', () => {
    expect(parseSubcomponents('')).toEqual([''])
  })

  it('deve usar separador customizado', () => {
    expect(parseSubcomponents('a|b|c', '|')).toEqual(['a', 'b', 'c'])
  })
})

describe('getComponent', () => {
  it('deve retornar o primeiro componente (índice 0)', () => {
    expect(getComponent('SMITH^JOHN^A', 0)).toBe('SMITH')
  })

  it('deve retornar o segundo componente (índice 1)', () => {
    expect(getComponent('SMITH^JOHN^A', 1)).toBe('JOHN')
  })

  it('deve retornar o terceiro componente (índice 2)', () => {
    expect(getComponent('SMITH^JOHN^A', 2)).toBe('A')
  })

  it('deve retornar null para índice negativo', () => {
    expect(getComponent('SMITH^JOHN', -1)).toBeNull()
  })

  it('deve retornar null para índice negativo maior', () => {
    expect(getComponent('SMITH^JOHN', -10)).toBeNull()
  })

  it('deve retornar null para índice não inteiro', () => {
    expect(getComponent('SMITH^JOHN', 1.5)).toBeNull()
    expect(getComponent('SMITH^JOHN', 0.1)).toBeNull()
  })

  it('deve retornar null para índice fora do range', () => {
    expect(getComponent('SMITH^JOHN', 5)).toBeNull()
    expect(getComponent('SMITH^JOHN', 2)).toBeNull()
  })

  it('deve usar separador customizado', () => {
    expect(getComponent('a|b|c', 1, '|')).toBe('b')
  })

  it('deve retornar null para campo vazio com índice > 0', () => {
    expect(getComponent('', 1)).toBeNull()
  })

  it('deve retornar string vazia para campo vazio com índice 0', () => {
    expect(getComponent('', 0)).toBe('')
  })
})

describe('buildField', () => {
  it('deve reconstruir campo de um componente', () => {
    expect(buildField(['SMITH'])).toBe('SMITH')
  })

  it('deve reconstruir campo de dois componentes', () => {
    expect(buildField(['SMITH', 'JOHN'])).toBe('SMITH^JOHN')
  })

  it('deve reconstruir campo de três ou mais componentes', () => {
    expect(buildField(['SMITH', 'JOHN', 'A'])).toBe('SMITH^JOHN^A')
  })

  it('deve preservar componentes vazios', () => {
    expect(buildField(['SMITH', '', 'A'])).toBe('SMITH^^A')
  })

  it('deve retornar string vazia para array vazio', () => {
    expect(buildField([])).toBe('')
  })

  it('deve usar separador customizado', () => {
    expect(buildField(['a', 'b', 'c'], '|')).toBe('a|b|c')
  })

  it('deve ser a operação inversa de parseComponents', () => {
    const original = 'SMITH^JOHN^A'
    const components = parseComponents(original)
    expect(buildField(components)).toBe(original)
  })

  it('deve reconstruir campo a partir de parseComponents com separador customizado', () => {
    const original = 'val1|val2|val3'
    const sep = '|'
    const components = parseComponents(original, sep)
    expect(buildField(components, sep)).toBe(original)
  })
})
