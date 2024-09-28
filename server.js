const express = require('express');
const cors = require('cors')
const axios = require('axios'); 
const { HttpsProxyAgent } = require('https-proxy-agent'); 

const app = express();
app.use(cors({
    origin: '*'
}))

// analisa o corpo da requisição (dados do formulário)
app.use(express.urlencoded({ extended: true} ));
const port = process.env.PORT || 3000;

const proxyUrl = 'https://47.88.31.196:8080'; // Exemplo: http://proxy.example.com:8080
const agent = new HttpsProxyAgent(proxyUrl);

app.get('/', (req, res) => {
    res.send('ok')
})


app.post('/scrapping', (req, res) => {
    console.log(req.body)
    const formData = {
        currentpage: req.body.currentpage || 1,
        order_column: req.body.order_column || 101,
        order_direction: req.body.order_direction || 1,
        filter_world: req.body.filter_world || '',
        filter_profession: req.body.filter_profession || ''
    };

    axios.post('https://www.tibia.com/charactertrade/?subtopic=currentcharactertrades', new URLSearchParams(formData).toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
        },
        httpsAgent: agent
    }).then(response => response.data)
    .then(html => {
        res.send(html)
    })
    .catch(error => {
        console.error('Erro ao fazer scraping:', error);
        res.status(500).send('Erro ao fazer scraping');
    });

})

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
})