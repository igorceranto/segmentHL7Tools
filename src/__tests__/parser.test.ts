import { describe, expect, it } from 'vitest'
import { createHL7Segment, parseHL7Segment } from '../functions/parser'

describe('parseHL7Segment', () => {
  describe('casos válidos — segmentos comuns', () => {
    it('deve parsear segmento PID simples', () => {
      const result = parseHL7Segment('PID|1|12345|SMITH^JOHN|19800101|M')

      expect(result.segmentType).toBe('PID')
      expect(result.field1).toBe('1')
      expect(result.field2).toBe('12345')
      expect(result.field3).toBe('SMITH^JOHN')
      expect(result.field4).toBe('19800101')
      expect(result.field5).toBe('M')
    })

    it('deve parsear segmento com subcomponentes (^) como string preservada', () => {
      const result = parseHL7Segment('PID|1|12345|SMITH^JOHN^A|19800101|M')

      expect(result.segmentType).toBe('PID')
      expect(result.field3).toBe('SMITH^JOHN^A')
    })

    it('deve parsear segmento com repetições (~) como string preservada', () => {
      const result = parseHL7Segment('PV1|1|I|2000^2012^01~3000^3001^02')

      expect(result.segmentType).toBe('PV1')
      expect(result.field3).toBe('2000^2012^01~3000^3001^02')
    })

    it('deve parsear campos vazios intermediários como string vazia', () => {
      const result = parseHL7Segment('PID|1||SMITH^JOHN||19800101')

      expect(result.field1).toBe('1')
      expect(result.field2).toBe('')
      expect(result.field3).toBe('SMITH^JOHN')
      expect(result.field4).toBe('')
      expect(result.field5).toBe('19800101')
    })

    it('deve parsear segmento apenas com o tipo (sem pipe)', () => {
      const result = parseHL7Segment('EVN')

      expect(result.segmentType).toBe('EVN')
      expect(result.field1).toBeUndefined()
    })

    it('deve remover \\r do final antes de parsear (terminador HL7)', () => {
      const result = parseHL7Segment('PID|1|12345|SMITH^JOHN\r')

      expect(result.segmentType).toBe('PID')
      expect(result.field3).toBe('SMITH^JOHN')
      expect(result.field3).not.toContain('\r')
    })

    it('deve remover espaços nas extremidades antes de parsear', () => {
      const result = parseHL7Segment('  PID|1|12345  ')

      expect(result.segmentType).toBe('PID')
      expect(result.field1).toBe('1')
    })

    it('deve aceitar Z-segment (extensão local)', () => {
      const result = parseHL7Segment('ZPD|campo1|campo2')

      expect(result.segmentType).toBe('ZPD')
      expect(result.field1).toBe('campo1')
    })
  })

  describe('MSH — tratamento especial (HL7 v2 §2.14.9)', () => {
    it('deve parsear MSH com field1 = field separator e field2 = encoding chars', () => {
      const result = parseHL7Segment(
        'MSH|^~\\&|SENDING_APP|SENDING_FAC|RECV_APP|RECV_FAC|20231201||ADT^A01|MSG001|P|2.5'
      )

      expect(result.segmentType).toBe('MSH')
      // MSH-1: o próprio separador de campo
      expect(result.field1).toBe('|')
      // MSH-2: encoding characters
      expect(result.field2).toBe('^~\\&')
      // MSH-3 em diante
      expect(result.field3).toBe('SENDING_APP')
      expect(result.field4).toBe('SENDING_FAC')
      expect(result.field9).toBe('ADT^A01')
      expect(result.field12).toBe('2.5')
    })

    it('deve parsear MSH com \\r no final', () => {
      const result = parseHL7Segment('MSH|^~\\&|APP|FAC\r')

      expect(result.segmentType).toBe('MSH')
      expect(result.field1).toBe('|')
      expect(result.field2).toBe('^~\\&')
      expect(result.field4).toBe('FAC')
    })

    it('deve parsear MSH com encoding chars de 5 posições (v2.8+)', () => {
      const result = parseHL7Segment('MSH|^~\\&#|APP|FAC')

      expect(result.field1).toBe('|')
      expect(result.field2).toBe('^~\\&#')
      expect(result.field3).toBe('APP')
    })
  })

  describe('casos inválidos', () => {
    it('deve lançar erro para string vazia', () => {
      expect(() => parseHL7Segment('')).toThrow(
        'Segmento HL7 deve ser uma string válida'
      )
    })

    it('deve lançar erro para null', () => {
      expect(() => parseHL7Segment(null as unknown as string)).toThrow(
        'Segmento HL7 deve ser uma string válida'
      )
    })

    it('deve lançar erro para undefined', () => {
      expect(() => parseHL7Segment(undefined as unknown as string)).toThrow(
        'Segmento HL7 deve ser uma string válida'
      )
    })

    it('deve lançar erro para segment ID em minúsculas', () => {
      expect(() => parseHL7Segment('pid|1|2')).toThrow('Segment ID inválido')
    })

    it('deve lançar erro para segment ID com 2 chars', () => {
      expect(() => parseHL7Segment('AB|campo')).toThrow('Segment ID inválido')
    })

    it('deve lançar erro para segment ID com 4 chars', () => {
      expect(() => parseHL7Segment('MSSH|campo')).toThrow('Segment ID inválido')
    })

    it('deve lançar erro para segmento começando com pipe (sem tipo)', () => {
      expect(() => parseHL7Segment('|APP|FAC')).toThrow('Segment ID inválido')
    })

    it('deve lançar erro para número passado como argumento', () => {
      expect(() => parseHL7Segment(123 as unknown as string)).toThrow(
        'Segmento HL7 deve ser uma string válida'
      )
    })
  })
})

describe('createHL7Segment', () => {
  describe('casos válidos', () => {
    it('deve criar segmento PID com campos', () => {
      expect(createHL7Segment('PID', ['1', '12345', 'SMITH^JOHN'])).toBe(
        'PID|1|12345|SMITH^JOHN'
      )
    })

    it('deve criar segmento MSH com encoding chars', () => {
      expect(
        createHL7Segment('MSH', ['^~\\&', 'APP', 'FAC', '', '', '20231201'])
      ).toBe('MSH|^~\\&|APP|FAC|||20231201')
    })

    it('deve criar segmento com array vazio', () => {
      expect(createHL7Segment('EVN', [])).toBe('EVN')
    })

    it('deve preservar campos vazios intermediários', () => {
      expect(createHL7Segment('PID', ['1', '', 'SMITH^JOHN'])).toBe(
        'PID|1||SMITH^JOHN'
      )
    })

    it('deve aceitar Z-segment (extensão local)', () => {
      expect(createHL7Segment('ZPD', ['dado1', 'dado2'])).toBe(
        'ZPD|dado1|dado2'
      )
    })

    it('deve aceitar tipo com dígito (NK1, OB1)', () => {
      expect(createHL7Segment('NK1', ['1', 'SMITH^JANE', 'SPO'])).toBe(
        'NK1|1|SMITH^JANE|SPO'
      )
    })
  })

  describe('casos inválidos', () => {
    it('deve lançar erro para tipo de segmento vazio', () => {
      expect(() => createHL7Segment('', [])).toThrow(
        'Tipo de segmento deve ser uma string válida'
      )
    })

    it('deve lançar erro para tipo null', () => {
      expect(() => createHL7Segment(null as unknown as string, [])).toThrow(
        'Tipo de segmento deve ser uma string válida'
      )
    })

    it('deve lançar erro para tipo em minúsculas', () => {
      expect(() => createHL7Segment('pid', [])).toThrow('Segment ID inválido')
    })

    it('deve lançar erro para tipo com 2 chars', () => {
      expect(() => createHL7Segment('AB', [])).toThrow('Segment ID inválido')
    })

    it('deve lançar erro para tipo com 4 chars', () => {
      expect(() => createHL7Segment('MSSH', [])).toThrow('Segment ID inválido')
    })

    it('deve lançar erro para tipo com caractere especial', () => {
      expect(() => createHL7Segment('MS$', [])).toThrow('Segment ID inválido')
    })

    it('deve lançar erro para campos null', () => {
      expect(() =>
        createHL7Segment('PID', null as unknown as string[])
      ).toThrow('Campos devem ser um array')
    })

    it('deve lançar erro para campos não-array', () => {
      expect(() =>
        createHL7Segment('PID', 'campo' as unknown as string[])
      ).toThrow('Campos devem ser um array')
    })
  })
})
