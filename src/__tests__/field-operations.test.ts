import { describe, expect, it } from 'vitest'
import { extractFieldValue, setFieldValue } from '../functions/field-operations'

describe('extractFieldValue', () => {
  describe('extração de valores', () => {
    it('deve extrair o tipo do segmento (índice 0)', () => {
      expect(extractFieldValue('PID|1|12345|SMITH^JOHN', 0)).toBe('PID')
    })

    it('deve extrair campo existente pelo índice', () => {
      const segment = 'PID|1|12345|SMITH^JOHN|19800101|M'

      expect(extractFieldValue(segment, 1)).toBe('1')
      expect(extractFieldValue(segment, 2)).toBe('12345')
      expect(extractFieldValue(segment, 3)).toBe('SMITH^JOHN')
      expect(extractFieldValue(segment, 4)).toBe('19800101')
      expect(extractFieldValue(segment, 5)).toBe('M')
    })

    it('deve retornar string vazia para campo vazio intermediário', () => {
      const segment = 'PID|1||SMITH^JOHN'

      expect(extractFieldValue(segment, 2)).toBe('')
    })

    it('deve retornar string vazia para campo vazio no final', () => {
      const segment = 'PID|1|12345|'

      expect(extractFieldValue(segment, 3)).toBe('')
    })

    it('deve retornar null para índice além do range', () => {
      const segment = 'PID|1|12345'

      expect(extractFieldValue(segment, 5)).toBe(null)
      expect(extractFieldValue(segment, 10)).toBe(null)
    })

    it('deve extrair campo com subcomponentes (^) preservando o valor', () => {
      const segment = 'PV1|1|I|2000^2012^01'

      expect(extractFieldValue(segment, 3)).toBe('2000^2012^01')
    })

    it('deve extrair campo com repetições (~) preservando o valor', () => {
      const segment = 'MSH|^~\\&|APP|FAC'

      expect(extractFieldValue(segment, 1)).toBe('^~\\&')
    })
  })

  describe('casos inválidos', () => {
    it('deve retornar null para segmento vazio', () => {
      expect(extractFieldValue('', 0)).toBe(null)
    })

    it('deve retornar null para segmento null', () => {
      expect(extractFieldValue(null as unknown as string, 0)).toBe(null)
    })

    it('deve retornar null para segmento com tipo inválido', () => {
      expect(extractFieldValue('AB|campo', 1)).toBe(null)
    })
  })
})

describe('setFieldValue', () => {
  describe('modificação de campos', () => {
    it('deve modificar campo existente pelo índice', () => {
      const result = setFieldValue('PID|1|12345|SMITH^JOHN', 2, '67890')

      expect(result).toBe('PID|1|67890|SMITH^JOHN')
    })

    it('deve modificar o tipo do segmento (índice 0)', () => {
      const result = setFieldValue('PID|1|12345', 0, 'NK1')

      expect(result).toBe('NK1|1|12345')
    })

    it('deve substituir campo vazio intermediário', () => {
      const result = setFieldValue('PID|1||SMITH^JOHN', 2, '12345')

      expect(result).toBe('PID|1|12345|SMITH^JOHN')
    })

    it('deve criar campos vazios intermediários se o índice for além do range', () => {
      const result = setFieldValue('PID|1|12345', 5, 'M')

      expect(result).toBe('PID|1|12345|||M')
    })

    it('deve definir valor em segmento com apenas o tipo', () => {
      const result = setFieldValue('MSH', 1, '^~\\&')

      expect(result).toBe('MSH|^~\\&')
    })

    it('deve preservar campos com subcomponentes não modificados', () => {
      const result = setFieldValue(
        'PID|1|12345|SMITH^JOHN|19800101',
        2,
        '99999'
      )

      expect(result).toBe('PID|1|99999|SMITH^JOHN|19800101')
    })
  })

  describe('casos inválidos', () => {
    it('deve lançar erro para segmento vazio', () => {
      expect(() => setFieldValue('', 0, 'value')).toThrow(
        'Segmento HL7 inválido'
      )
    })

    it('deve lançar erro para segmento null', () => {
      expect(() =>
        setFieldValue(null as unknown as string, 0, 'value')
      ).toThrow('Segmento HL7 inválido')
    })

    it('deve lançar erro para índice negativo', () => {
      expect(() => setFieldValue('PID|1', -1, 'value')).toThrow(
        'Índice do campo deve ser maior ou igual a 0'
      )
    })

    it('deve lançar erro para segmento com tipo inválido', () => {
      expect(() => setFieldValue('AB|campo', 1, 'value')).toThrow(
        'Segmento HL7 inválido'
      )
    })
  })
})
