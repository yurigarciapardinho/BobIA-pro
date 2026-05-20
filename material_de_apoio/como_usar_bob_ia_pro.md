# Como usar BobIA PRO

Este documento descreve como usar e operar o BobIA PRO (versão personalizada pela turma 1SISA2026).

## 1. Visão geral

- BobIA é uma API que recebe perguntas via `POST /perguntar` e responde usando o modelo Gemini.
- A aplicação carrega automaticamente arquivos da pasta `ficheiros/`, envia esses arquivos ao serviço de IA e injeta seus URIs no contexto da pergunta, permitindo que o modelo utilize esses documentos como apoio para gerar respostas.

> **O que é URI neste projeto?**  
> Quando um arquivo é enviado para o Gemini, o serviço devolve um identificador para esse arquivo. Esse identificador é chamado de URI.  
> Na nossa versão do BobIA, o código usa esse URI para indicar ao Gemini quais arquivos devem ser considerados como contexto na hora de responder às perguntas.

## 2. Estrutura de pastas

- `ficheiros/` → Coloque aqui os documentos da base de conhecimento que serão lidos pelo sistema. Extensões permitidas: `.pdf`, `.txt`, `.md`, `.csv`
- `material_de_apoio/` → Materiais do projeto, incluindo este ficheiro
- `public/` → Arquivos estáticos do frontend (HTML, CSS, JS)
- `main.js` → Servidor principal

## 3. Como colocar ficheiros de referência

- Copie/arraste os ficheiros para a pasta `ficheiros`
- Não coloque ficheiros ocultos (aqueles com nome iniciando por `.`)
- O servidor, ao iniciar, vai ler a pasta, filtrar por extensão e enviar apenas os ficheiros permitidos ao serviço de IA
- Cada ficheiro válido terá seu URI guardado em memória e será incluído no prompt como contexto

## 4. Como configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto, sem espaço no final do nome com:

```env
CHAVE=sua_chave_real_do_gemini_aqui
PORTA=3000
```

## 5. Iniciar o servidor

No terminal:

```bash
# NÃO USAR NPM INSTALL
npm ci

node main.js
# ou
npm start
```

- Ao iniciar, a aplicação lê `ficheiros/` e faz upload apenas dos ficheiros permitidos.
- Os logs indicam quantos ficheiros foram carregados e se houve falhas.

## 6. Uso da API

- Endpoint: `POST /perguntar`
- Cabeçalho: `Content-Type: application/json`
- Corpo (exemplo):

```json
{
  "pergunta": "Como configurar um workflow no Jira Service Management para incidentes críticos?"
}
```

- Resposta: objeto JSON com o campo `resultado` contendo o texto gerado.

## 7. Considerações operacionais

- O carregamento de ficheiros ocorre na inicialização. Para atualizar ficheiros em produção, reinicie o servidor.
- Apenas ficheiros com extensões permitidas são enviados ao serviço de IA.
- Se a pasta `ficheiros/` não existir, o servidor inicia normalmente, porém sem contexto adicional.

## 8. Exemplo de sequência de operação

1. Colar ficheiros em `ficheiros/`.
2. Definir variáveis em `.env`.
3. Executar `node main.js`.
4. Fazer `POST /perguntar` com a pergunta.
5. Receber `resultado` com a resposta.

## 10. Contato, contribuição e manutenção

- Para atualizar a lógica de leitura ou as extensões permitidas, edite `main.js` e procure a constante `extensoesPermitidas`
- Para logs e troubleshooting, verifique o output do terminal onde o servidor foi iniciado

## Créditos

Desenvolvedores originais do BobIA (até 19/05/2026):

- Marise Miranda (@miranda500)
- Matheus Matos (@MatheusFerreiraMatos)
- Alexander Gonçalves (@gfalexander)

Desenvolvedores do BobIA PRO (até 19/05/2026):

- Yuri Garcia Pardinho (@yurigarciapardinho)


## Fontes bibliográficas

- [1] [NodeJs](https://nodejs.org/en)
- [2] [NPM](https://docs.npmjs.com/)
- [3] [Gemini](https://www.npmjs.com/package/@google/genai)
- [4] [DotEnv](https://www.npmjs.com/package/dotenv)
- [5] [Express](https://www.npmjs.com/package/express)
- [6] [Get started with the Gemini API in Node.js applications](https://ai.google.dev/tutorials/get_started_node?hl=en)
- [7] [Entendendo parâmetros em LLM's](https://aviralrma.medium.com/understanding-llm-parameters-c2db4b07f0ee)
- [8] [O que é NPM e como usar uma biblioteca instalada por ele](https://www.treinaweb.com.br/blog/o-que-e-npm-e-como-usar-uma-biblioteca-instalada-por-ele)
- [9] [Por que não usar npm install?](https://stackoverflow.com/q/48524417)


## Notas finais 

- Documento escrito para orientar o uso e manutenção do BobIA PRO.
- Para dúvidas sobre contribuições ou processos internos, abra uma issue no repositório
- Mantenha sempre backups dos ficheiros