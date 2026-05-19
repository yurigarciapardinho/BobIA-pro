const { GoogleGenAI } = require("@google/genai")
const express = require("express")
const path = require("path")
const fs = require("fs")

require("dotenv").config()

const app = express()
const PORTA_SERVIDOR = process.env.PORTA || 3000
const chatIA = new GoogleGenAI({ apiKey: process.env.CHAVE })

const urisDeContexto = []
const extensoesPermitidas    = ['.pdf', '.txt', '.md', '.csv']

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept')
    next()
})

async function inicializarFicheiros() {
    console.info("Segura a emoção que vou ler a pasta de ficheiros...")
    const pastaFicheiros = path.join(__dirname, 'ficheiros')

    if (!fs.existsSync(pastaFicheiros)) {
        fs.mkdirSync(pastaFicheiros)
    }

    const arquivos = fs.readdirSync(pastaFicheiros)

    for (const arquivo of arquivos) {
        const extensao = path.extname(arquivo).toLowerCase()
        if (extensoesPermitidas.includes(extensao)) {
            const caminhoArquivo = path.join(pastaFicheiros, arquivo)
            try {
                const ficheiroCarregado = await chatIA.files.upload({
                    file: caminhoArquivo,
                    config: {
                        mimeType: extensao === '.pdf' ? 'application/pdf' : 'text/plain',
                        displayName: arquivo
                    }
                })
                urisDeContexto.push(ficheiroCarregado)
                console.info(`Ficheiro carregado com sucesso no Gemini: ${arquivo}`)
            } catch (erro) {
                console.error(`Erro ao carregar o ficheiro ${arquivo}:`, erro)
            }
        }
    }
    console.info(`Total de ficheiros injetados no contexto: ${urisDeContexto.length}`)
}

app.post('/perguntar', async (req, res) => {
    const pergunta = req.body.pergunta
    try {
        const resultado = await gerarResposta(pergunta)
        res.json({ resultado })
    } catch (error) {
        console.error('Erro ao gerar resposta:', error)
        res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

async function gerarResposta(pergunta) {
    try {
        const conteudos = urisDeContexto.length > 0 
            ? [
                ...urisDeContexto.map(ficheiro => ({
                    fileData: {
                        fileUri: ficheiro.uri,
                        mimeType: ficheiro.mimeType
                    }
                })),
                pergunta
            ] 
            : pergunta

        const modeloIA = await chatIA.models.generateContent({
            model: "gemini-2.5-flash",
            contents: conteudos,
            config: {
                systemInstruction: "Você é um Especialista em TI, Governança de TI (ITIL) e no ecossistema Atlassian (Jira Service Management, Jira Software). Seu tom deve ser altamente técnico, profissional e direto. REGRA INQUEBRÁVEL 1: Responda APENAS com base nos documentos fornecidos como contexto. REGRA INQUEBRÁVEL 2: Você deve se recusar categoricamente a responder a qualquer pergunta que não seja sobre Tecnologia da Informação, Governança ou Jira. Responda sempre em apenas um parágrafo.",
                temperature: 0.2,          // 0.0 a 0.2 factual, 0.3 a 0.6 equilibrado, 0.7 a 1.0 criativo
                top_p: 0.95,               // 0.0 a 1.0: Controla a diversidade. Menor = palavras mais óbvias, Maior = vocabulário mais rico
                top_k: 40,                 // 1 a 40+: Limita o banco de palavras da IA. Menos opções deixam a resposta mais rígida e focada
                max_output_tokens: 1000,   // Limite do tamanho da resposta (1000 tokens equivalem a +/-  750 palavras)
                presence_penalty: 0.5,     // -2.0 a 2.0: Valores maiores que zero incentivam a IA a falar sobre assuntos novos
                frequency_penalty: 0.0,    // -2.0 a 2.0: Valores maiores que zero evitam que a IA repita a mesma palavra várias vezes
            }
        })

        const resposta = modeloIA.text
        const tokens = modeloIA.usageMetadata

        console.info('Resposta gerada com sucesso.')
        console.info('Uso de Tokens:', tokens)

        return resposta
    } catch (error) {
        console.error('Erro ao chamar o modelo:', error)
        throw error
    }
}

async function iniciarServidor() {
    await inicializarFicheiros()
    
    app.listen(PORTA_SERVIDOR, () => {
console.info(
            `
            \x1b[92m██████╗  ██████╗ ██████╗ ██╗ █████╗     ██████╗ ██████╗  ██████╗
            \x1b[92m██╔══██╗██╔═══██╗██╔══██╗██║██╔══██╗    ██╔══██╗██╔══██╗██╔═══██╗
            \x1b[93m██████╔╝██║   ██║██████╔╝██║███████║    ██████╔╝██████╔╝██║   ██║
            \x1b[93m██╔══██╗██║   ██║██╔══██╗██║██╔══██║    ██╔═══╝ ██╔══██╗██║   ██║
            \x1b[94m██████╔╝╚██████╔╝██████╔╝██║██║  ██║    ██║     ██║  ██║╚██████╔╝
            \x1b[94m╚═════╝  ╚═════╝ ╚═════╝ ╚═╝╚═╝  ╚═╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝\x1b[0m
            `
        )
        console.info(`BobIA PRO iniciada em http://localhost:${PORTA_SERVIDOR} \n1SISA2026`)
    })
}

iniciarServidor()