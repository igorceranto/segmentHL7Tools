import { describe, expect, it } from 'vitest';
import {
  createHL7Segment,
  extractFieldValue,
  parseHL7Segment,
  setFieldValue,
  teste,
  validateHL7Segment,
} from './index';

describe('segmentHL7Tools', () => {
  describe('parseHL7Segment', () => {
    it('deve parsear um segmento MSH válido', () => {
      const segment = 'MSH|^~\\&|SENDING_APP|SENDING_FACILITY';
      const result = parseHL7Segment(segment);

      expect(result.segmentType).toBe('MSH');
      expect(result.field1).toBe('^~\\&');
      expect(result.field2).toBe('SENDING_APP');
      expect(result.field3).toBe('SENDING_FACILITY');
    });

    it('deve lançar erro para segmento inválido', () => {
      expect(() => parseHL7Segment('')).toThrow(
        'Segmento HL7 deve ser uma string válida'
      );
      expect(() => parseHL7Segment(null as any)).toThrow(
        'Segmento HL7 deve ser uma string válida'
      );
    });
  });

  describe('createHL7Segment', () => {
    it('deve criar um segmento PID válido', () => {
      const segmentType = 'PID';
      const fields = ['1', '12345', 'SMITH^JOHN'];
      const result = createHL7Segment(segmentType, fields);

      expect(result).toBe('PID|1|12345|SMITH^JOHN');
    });

    it('deve lançar erro para tipo de segmento inválido', () => {
      expect(() => createHL7Segment('', [])).toThrow(
        'Tipo de segmento deve ser uma string válida'
      );
    });

    it('deve lançar erro para campos inválidos', () => {
      expect(() => createHL7Segment('PID', null as any)).toThrow(
        'Campos devem ser um array'
      );
    });
  });

  describe('validateHL7Segment', () => {
    it('deve validar segmentos válidos', () => {
      expect(validateHL7Segment('MSH|^~\\&|APP|FACILITY')).toBe(true);
      expect(validateHL7Segment('PID|1|12345')).toBe(true);
    });

    it('deve rejeitar segmentos inválidos', () => {
      expect(validateHL7Segment('')).toBe(false);
      expect(validateHL7Segment(null as any)).toBe(false);
      expect(validateHL7Segment('|APP|FACILITY')).toBe(false);
    });
  });

  describe('extractFieldValue', () => {
    it('deve extrair valores de campos válidos', () => {
      const segment = 'PID|1|12345|SMITH^JOHN|19800101|M';

      expect(extractFieldValue(segment, 0)).toBe('PID');
      expect(extractFieldValue(segment, 1)).toBe('1');
      expect(extractFieldValue(segment, 2)).toBe('12345');
      expect(extractFieldValue(segment, 4)).toBe('19800101');
    });

    it('deve retornar null para campos inexistentes', () => {
      const segment = 'PID|1|12345';
      expect(extractFieldValue(segment, 5)).toBe(null);
    });

    it('deve retornar null para segmento inválido', () => {
      expect(extractFieldValue('', 0)).toBe(null);
    });
  });

  describe('setFieldValue', () => {
    it('deve definir valor de campo existente', () => {
      const segment = 'PID|1|12345|SMITH^JOHN';
      const result = setFieldValue(segment, 2, '67890');

      expect(result).toBe('PID|1|67890|SMITH^JOHN');
    });

    it('deve criar campos vazios se necessário', () => {
      const segment = 'PID|1|12345';
      const result = setFieldValue(segment, 5, 'M');

      expect(result).toBe('PID|1|12345|||M');
    });

    it('deve lançar erro para índice negativo', () => {
      expect(() => setFieldValue('PID|1', -1, 'value')).toThrow(
        'Índice do campo deve ser maior ou igual a 0'
      );
    });

    it('deve lançar erro para segmento inválido', () => {
      expect(() => setFieldValue('', 0, 'value')).toThrow(
        'Segmento HL7 inválido'
      );
    });
  });

  describe('teste', () => {
    it('deve retornar o valor fornecido', () => {
      const result = teste({ value: 'teste' });
      expect(result).toBe('teste');
    });
  });
});
