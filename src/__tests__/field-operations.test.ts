import { describe, expect, it } from 'vitest'
import { extractFieldValue, setFieldValue } from '../functions/field-operations'

describe('extractFieldValue', () => {
  describe('extração de valores', () => {
    it('deve extrair o tipo do segmento (índice 0)', () => {
      expect(extractFieldValue('PID|1|12345|SMITH^JOHN', 0)).toBe('PID')
    })

    it('deve extrair campos pelo índice', () => {
      const segment = 'PID|1|12345|SMITH^JOHN|19800101|M'

      expect(extractFieldValue(segment, 1)).toBe('1')
      expect(extractFieldValue(segment, 2)).toBe('12345')
      expect(extractFieldValue(segment, 3)).toBe('SMITH^JOHN')
      expect(extractFieldValue(segment, 4)).toBe('19800101')
      expect(extractFieldValue(segment, 5)).toBe('M')
    })

    it('deve retornar string vazia para campo existente mas vazio', () => {
      expect(extractFieldValue('PID|1||SMITH^JOHN', 2)).toBe('')
    })

    it('deve retornar string vazia para campo vazio no final', () => {
      expect(extractFieldValue('PID|1|12345|', 3)).toBe('')
    })

    it('deve retornar null para índice além do range', () => {
      expect(extractFieldValue('PID|1|12345', 5)).toBe(null)
      expect(extractFieldValue('PID|1|12345', 10)).toBe(null)
    })

    it('deve preservar subcomponentes (^) sem decodificar', () => {
      expect(extractFieldValue('PV1|1|I|2000^2012^01', 3)).toBe('2000^2012^01')
    })

    it('deve retornar o field separator para MSH índice 1 (MSH-1)', () => {
      expect(extractFieldValue('MSH|^~\\&|APP|FAC', 1)).toBe('|')
    })

    it('deve retornar encoding chars para MSH índice 2 (MSH-2)', () => {
      expect(extractFieldValue('MSH|^~\\&|APP|FAC', 2)).toBe('^~\\&')
    })

    it('deve retornar APP para MSH índice 3 (MSH-3)', () => {
      expect(extractFieldValue('MSH|^~\\&|APP|FAC', 3)).toBe('APP')
    })

    it('deve retornar FAC para MSH índice 4 (MSH-4)', () => {
      expect(extractFieldValue('MSH|^~\\&|APP|FAC', 4)).toBe('FAC')
    })

    it('deve retornar null para índice além do range em MSH', () => {
      expect(extractFieldValue('MSH|^~\\&|APP|FAC', 10)).toBe(null)
    })

    it('deve remover \\r do final antes de extrair', () => {
      const result = extractFieldValue('PID|1|12345|SMITH^JOHN\r', 3)

      expect(result).toBe('SMITH^JOHN')
      expect(result).not.toContain('\r')
    })

    it('deve remover espaços nas extremidades antes de extrair', () => {
      expect(extractFieldValue('  PID|1|12345  ', 1)).toBe('1')
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
      expect(extractFieldValue('pid|campo', 1)).toBe(null)
    })

    it('deve retornar null para índice negativo', () => {
      expect(extractFieldValue('PID|1|12345', -1)).toBe(null)
    })

    it('deve retornar null para índice não inteiro', () => {
      expect(extractFieldValue('PID|1|12345', 1.5)).toBe(null)
    })
  })
})

describe('setFieldValue', () => {
  describe('modificação de campos', () => {
    it('deve modificar campo existente pelo índice', () => {
      expect(setFieldValue('PID|1|12345|SMITH^JOHN', 2, '67890')).toBe(
        'PID|1|67890|SMITH^JOHN'
      )
    })

    it('deve modificar o tipo do segmento (índice 0)', () => {
      expect(setFieldValue('PID|1|12345', 0, 'NK1')).toBe('NK1|1|12345')
    })

    it('deve substituir campo vazio intermediário', () => {
      expect(setFieldValue('PID|1||SMITH^JOHN', 2, '12345')).toBe(
        'PID|1|12345|SMITH^JOHN'
      )
    })

    it('deve criar campos vazios intermediários se necessário', () => {
      expect(setFieldValue('PID|1|12345', 5, 'M')).toBe('PID|1|12345|||M')
    })

    it('deve definir encoding chars em MSH sem campos (índice 2 = MSH-2)', () => {
      expect(setFieldValue('MSH', 2, '^~\\&')).toBe('MSH|^~\\&')
    })

    it('deve modificar MSH-2 (encoding chars) via índice 2', () => {
      expect(setFieldValue('MSH|^~\\&|APP|FAC', 2, '^~\\&#')).toBe(
        'MSH|^~\\&#|APP|FAC'
      )
    })

    it('deve modificar MSH-3 (sending app) via índice 3', () => {
      expect(setFieldValue('MSH|^~\\&|APP|FAC', 3, 'NEWAPP')).toBe(
        'MSH|^~\\&|NEWAPP|FAC'
      )
    })

    it('deve modificar MSH-4 (sending facility) via índice 4', () => {
      expect(setFieldValue('MSH|^~\\&|APP|FAC', 4, 'NEWFAC')).toBe(
        'MSH|^~\\&|APP|NEWFAC'
      )
    })

    it('deve criar campos vazios intermediários em MSH se necessário', () => {
      expect(setFieldValue('MSH|^~\\&|APP', 6, 'DEST')).toBe(
        'MSH|^~\\&|APP|||DEST'
      )
    })

    it('deve preservar campos não modificados', () => {
      expect(setFieldValue('PID|1|12345|SMITH^JOHN|19800101', 2, '99999')).toBe(
        'PID|1|99999|SMITH^JOHN|19800101'
      )
    })

    it('deve remover \\r do final antes de modificar', () => {
      const result = setFieldValue('PID|1|12345|SMITH^JOHN\r', 2, '99999')

      expect(result).toBe('PID|1|99999|SMITH^JOHN')
      expect(result).not.toContain('\r')
    })

    it('deve remover espaços nas extremidades antes de modificar', () => {
      expect(setFieldValue('  PID|1|12345  ', 1, '99')).toBe('PID|99|12345')
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

    it('deve lançar erro para segmento com tipo inválido', () => {
      expect(() => setFieldValue('AB|campo', 1, 'value')).toThrow(
        'Segmento HL7 inválido'
      )
      expect(() => setFieldValue('pid|campo', 1, 'value')).toThrow(
        'Segmento HL7 inválido'
      )
    })

    it('deve lançar erro para índice negativo', () => {
      expect(() => setFieldValue('PID|1', -1, 'value')).toThrow(
        'Índice do campo deve ser um inteiro maior ou igual a 0'
      )
    })

    it('deve lançar erro para índice não inteiro', () => {
      expect(() => setFieldValue('PID|1', 1.5, 'value')).toThrow(
        'Índice do campo deve ser um inteiro maior ou igual a 0'
      )
    })
  })
})
