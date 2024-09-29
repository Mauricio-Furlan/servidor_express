require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

const app = express();
app.use(cors({
    origin: '*'
}));

// Analisa o corpo da requisição (dados do formulário)
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 3000;

// Definindo o proxy com autenticação
const proxyHost = '208.195.174.227'; // IP do seu proxy ToolIP
const proxyPort = 65095;             // Porta do seu proxy ToolIP
const proxyUsername = process.env.PROXY_USERNAME;  // Usuário fornecido pela ToolIP
const proxyPassword = process.env.PROXY_PASSWORD;    // Senha fornecida pela ToolIP

const proxyUrl = `http://${proxyUsername}:${proxyPassword}@${proxyHost}:${proxyPort}`;
const agent = new HttpsProxyAgent(proxyUrl); // Cria um agente de proxy com autenticação

app.get('/', (req, res) => {
    res.send('ok');
});

app.post('/scrapping', (req, res) => {
    console.log(req.body);
    const formData = {
        currentpage: req.body.currentpage || 1,
        order_column: req.body.order_column || 101,
        order_direction: req.body.order_direction || 1,
        filter_world: req.body.world || '',
        filter_profession: req.body.vocation || ''
    };

    axios.post('https://www.tibia.com/charactertrade/?subtopic=currentcharactertrades', new URLSearchParams(formData).toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
        },
        httpsAgent: agent  // Configurando o agente proxy
    }).then(response => response.data)
    .then(html => {
        res.send(html);
    })
    .catch(error => {
        console.error('Erro ao fazer scraping:', error.message);
        res.status(500).send('Erro ao fazer scraping');
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
