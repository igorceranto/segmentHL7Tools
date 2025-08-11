# segmentHL7Tools

Ferramentas para manipulação de segmentos HL7 (Health Level 7) em TypeScript/JavaScript.

## 📦 Instalação

```bash
npm install segmenthl7tools
```

## 🚀 Uso

### Importação

```typescript
// ES Modules
import { parseHL7Segment, createHL7Segment, validateHL7Segment } from 'segmenthl7tools';

// CommonJS
const { parseHL7Segment, createHL7Segment, validateHL7Segment } = require('segmenthl7tools');
```

### Exemplos de Uso

#### Parsear um segmento HL7

```typescript
import { parseHL7Segment } from 'segmenthl7tools';

const segment = "MSH|^~\\&|SENDING_APP|SENDING_FACILITY|RECEIVING_APP|RECEIVING_FACILITY|20231201120000||ADT^A01|MSG00001|P|2.5";
const parsed = parseHL7Segment(segment);

console.log(parsed);
// Output:
// {
//   segmentType: "MSH",
//   field1: "^~\\&",
//   field2: "SENDING_APP",
//   field3: "SENDING_FACILITY",
//   field4: "RECEIVING_APP",
//   field5: "RECEIVING_FACILITY",
//   field6: "20231201120000",
//   field7: "",
//   field8: "ADT^A01",
//   field9: "MSG00001",
//   field10: "P",
//   field11: "2.5"
// }
```

#### Criar um segmento HL7

```typescript
import { createHL7Segment } from 'segmenthl7tools';

const segmentType = "PID";
const fields = ["1", "12345", "SMITH^JOHN", "19800101", "M"];

const segment = createHL7Segment(segmentType, fields);
console.log(segment);
// Output: "PID|1|12345|SMITH^JOHN|19800101|M"
```

#### Validar um segmento HL7

```typescript
import { validateHL7Segment } from 'segmenthl7tools';

const validSegment = "MSH|^~\\&|APP|FACILITY";
const invalidSegment = "";

console.log(validateHL7Segment(validSegment)); // true
console.log(validateHL7Segment(invalidSegment)); // false
```

#### Extrair valor de um campo específico

```typescript
import { extractFieldValue } from 'segmenthl7tools';

const segment = "PID|1|12345|SMITH^JOHN|19800101|M";
const patientId = extractFieldValue(segment, 1); // "1"
const patientName = extractFieldValue(segment, 2); // "12345"
const birthDate = extractFieldValue(segment, 4); // "19800101"
```

#### Definir valor de um campo específico

```typescript
import { setFieldValue } from 'segmenthl7tools';

const segment = "PID|1|12345|SMITH^JOHN|19800101|M";
const updatedSegment = setFieldValue(segment, 2, "67890");

console.log(updatedSegment);
// Output: "PID|1|67890|SMITH^JOHN|19800101|M"
```

## 📚 API Reference

### `parseHL7Segment(segment: string): Record<string, string>`

Parseia um segmento HL7 e retorna um objeto com os campos indexados.

**Parâmetros:**
- `segment`: String contendo o segmento HL7

**Retorna:** Objeto com os campos parseados

**Lança:** Error se o segmento for inválido

### `createHL7Segment(segmentType: string, fields: string[]): string`

Cria um segmento HL7 a partir do tipo e campos fornecidos.

**Parâmetros:**
- `segmentType`: Tipo do segmento (ex: "MSH", "PID")
- `fields`: Array de strings com os valores dos campos

**Retorna:** String do segmento HL7 formatado

**Lança:** Error se os parâmetros forem inválidos

### `validateHL7Segment(segment: string): boolean`

Valida se uma string é um segmento HL7 válido.

**Parâmetros:**
- `segment`: String a ser validada

**Retorna:** Boolean indicando se é válido

### `extractFieldValue(segment: string, fieldIndex: number): string | null`

Extrai o valor de um campo específico do segmento.

**Parâmetros:**
- `segment`: Segmento HL7
- `fieldIndex`: Índice do campo (baseado em 0)

**Retorna:** Valor do campo ou null se não encontrado

### `setFieldValue(segment: string, fieldIndex: number, value: string): string`

Define o valor de um campo específico no segmento.

**Parâmetros:**
- `segment`: Segmento HL7
- `fieldIndex`: Índice do campo (baseado em 0)
- `value`: Novo valor para o campo

**Retorna:** Segmento atualizado

**Lança:** Error se o segmento for inválido ou o índice for negativo

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js >= 16.0.0
- npm ou yarn

### Instalação das dependências

```bash
npm install
```

### Scripts disponíveis

```bash
# Build do projeto
npm run build

# Desenvolvimento com watch
npm run dev

# Executar testes
npm test

# Executar testes com UI
npm run test:ui

# Verificar cobertura de testes
npm run test:coverage

# Verificação de tipos TypeScript
npm run type-check

# Formatação de código com Biome
npm run biome:format

# Linting com Biome
npm run biome:lint

# Verificação completa com Biome
npm run biome:check

# Publicar release
npm run release
```

### Hooks do Git (Husky)

O projeto utiliza o Husky para automatizar verificações antes de commits e pushes:

- **Pre-commit**: Executa formatação, linting, verificação de tipos e testes
- **Pre-push**: Executa build completo e testes com cobertura

### Ferramentas de Qualidade

- **Biome**: Linting e formatação de código
- **Husky**: Hooks do Git para automação
- **Vitest**: Framework de testes com cobertura
- **TypeScript**: Verificação estática de tipos
- **GitHub Actions**: CI/CD automatizado

### Estrutura do projeto

```
src/
├── index.ts          # Arquivo principal com todas as exportações
└── types/
    └── index.d.ts    # Definições de tipos TypeScript

.github/
├── workflows/        # GitHub Actions
└── dependabot.yml    # Atualizações automáticas

.husky/              # Hooks do Git
.vscode/             # Configurações do VS Code
```

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.

### Como contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

- **Issues:** [GitHub Issues](https://github.com/igorceranto/segmentHL7Tools/issues)
- **Documentação:** [GitHub README](https://github.com/igorceranto/segmentHL7Tools#readme)

## 🔗 Links Úteis

- [HL7 Standards](https://www.hl7.org/)
- [HL7 v2.x Implementation Guide](https://www.hl7.org/implement/standards/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Biome Documentation](https://biomejs.dev/)
- [Husky Documentation](https://typicode.github.io/husky/)
