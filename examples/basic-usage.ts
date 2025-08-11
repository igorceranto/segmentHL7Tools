import {
  parseHL7Segment,
  createHL7Segment,
  validateHL7Segment,
  extractFieldValue,
  setFieldValue
} from '../src/index';

console.log('=== Exemplos de Uso do segmentHL7Tools ===\n');

// Exemplo 1: Parsear um segmento MSH
console.log('1. Parseando segmento MSH:');
const mshSegment = "MSH|^~\\&|SENDING_APP|SENDING_FACILITY|RECEIVING_APP|RECEIVING_FACILITY|20231201120000||ADT^A01|MSG00001|P|2.5";
const parsedMSH = parseHL7Segment(mshSegment);
console.log('Segmento original:', mshSegment);
console.log('Parseado:', JSON.stringify(parsedMSH, null, 2));
console.log('Tipo do segmento:', parsedMSH.segmentType);
console.log('Campo 8 (tipo de mensagem):', parsedMSH.field8);
console.log('');

// Exemplo 2: Criar um segmento PID
console.log('2. Criando segmento PID:');
const pidFields = ["1", "12345", "SMITH^JOHN", "19800101", "M", "123 MAIN ST", "555-1234"];
const pidSegment = createHL7Segment("PID", pidFields);
console.log('Campos:', pidFields);
console.log('Segmento criado:', pidSegment);
console.log('');

// Exemplo 3: Validar segmentos
console.log('3. Validação de segmentos:');
const validSegment = "MSH|^~\\&|APP|FACILITY";
const invalidSegment = "";
const invalidSegment2 = "|APP|FACILITY";

console.log(`"${validSegment}" é válido:`, validateHL7Segment(validSegment));
console.log(`"${invalidSegment}" é válido:`, validateHL7Segment(invalidSegment));
console.log(`"${invalidSegment2}" é válido:`, validateHL7Segment(invalidSegment2));
console.log('');

// Exemplo 4: Extrair valores de campos
console.log('4. Extraindo valores de campos:');
const testSegment = "PID|1|12345|SMITH^JOHN|19800101|M|123 MAIN ST|555-1234";
console.log('Segmento:', testSegment);
console.log('Campo 0 (tipo):', extractFieldValue(testSegment, 0));
console.log('Campo 1 (ID):', extractFieldValue(testSegment, 1));
console.log('Campo 2 (número do paciente):', extractFieldValue(testSegment, 2));
console.log('Campo 3 (nome):', extractFieldValue(testSegment, 3));
console.log('Campo 4 (data de nascimento):', extractFieldValue(testSegment, 4));
console.log('Campo 10 (inexistente):', extractFieldValue(testSegment, 10));
console.log('');

// Exemplo 5: Modificar valores de campos
console.log('5. Modificando valores de campos:');
console.log('Segmento original:', testSegment);
const updatedSegment1 = setFieldValue(testSegment, 2, "67890");
console.log('Após modificar campo 2 para "67890":', updatedSegment1);
const updatedSegment2 = setFieldValue(updatedSegment1, 6, "456 OAK AVE");
console.log('Após modificar campo 6 para "456 OAK AVE":', updatedSegment2);
const updatedSegment3 = setFieldValue(updatedSegment2, 10, "555-5678");
console.log('Após adicionar campo 10 "555-5678":', updatedSegment3);
console.log('');

// Exemplo 6: Trabalhando com mensagem HL7 completa
console.log('6. Trabalhando com mensagem HL7 completa:');
const hl7Message = [
  "MSH|^~\\&|SENDING_APP|SENDING_FACILITY|RECEIVING_APP|RECEIVING_FACILITY|20231201120000||ADT^A01|MSG00001|P|2.5",
  "PID|1|12345|SMITH^JOHN|19800101|M|123 MAIN ST|555-1234",
  "PV1|1|I|2000^2012^01||||123456^SMITH^JOHN^J^^^MD"
];

console.log('Mensagem HL7 completa:');
hl7Message.forEach((segment, index) => {
  console.log(`Segmento ${index + 1}: ${segment}`);
  if (validateHL7Segment(segment)) {
    const parsed = parseHL7Segment(segment);
    console.log(`  Tipo: ${parsed.segmentType}`);
    if (parsed.segmentType === 'PID') {
      console.log(`  Nome do paciente: ${parsed.field3}`);
      console.log(`  Data de nascimento: ${parsed.field4}`);
    }
  }
  console.log('');
});

console.log('=== Fim dos Exemplos ===');
