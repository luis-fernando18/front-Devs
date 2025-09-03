// Em: servidor.js

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // Módulo nativo do Node para lidar com caminhos

const app = express();
const port = 3000;

// --- Middlewares Essenciais ---
app.use(express.json()); // Para o Express entender JSON

// **CORREÇÃO 1: SERVIR ARQUIVOS ESTÁTICOS**
// Esta linha diz ao Express para servir todos os arquivos da pasta 'public'.
// É isso que permite que o navegador acesse os arquivos HTML, CSS e JS.
app.use(express.static(path.join(__dirname, 'public')));

// --- Conexão com o MongoDB ---
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://260472024:eniacecommerce712@cluster0.jm8drnk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&tlsAllowInvalidCertificates=true')
    .then(() => console.log('Conectado ao MongoDB...'))
    .catch(err => console.error('Não foi possível conectar ao MongoDB...', err));

// --- Importando as Rotas ---
const rotasUsuario = require('./routes/rotasUsuario');
const rotasProduto = require('./routes/rotasProduto');
const rotasPedido = require('./routes/rotasPedido');

// --- Usando as Rotas da API ---
// **CORREÇÃO 2: REMOVIDAS LINHAS DUPLICADAS**
// Todas as requisições que começam com /api/... serão direcionadas para os arquivos de rota.
app.use('/api/usuarios', rotasUsuario);
app.use('/api/produtos', rotasProduto);
app.use('/api/pedidos', rotasPedido);

// --- Rota "Catch-All" para o Front-End ---
// **BÔNUS: MELHORIA DE QUALIDADE DE VIDA**
// Esta rota garante que se o usuário atualizar a página (F5) em /meu-usuario.html,
// o servidor ainda entregue a página HTML correta em vez de dar um erro "Cannot GET".
app.get('*', (req, res) => {
    // Verificamos se a requisição não é para a API
    if (!req.originalUrl.startsWith('/api')) {
        // Se não for, enviamos o arquivo principal do front-end (ajuste o nome se for diferente)
        res.sendFile(path.join(__dirname, 'public', 'login.cadastro', 'login.html'));
    }
});

// --- Iniciando o Servidor ---
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});