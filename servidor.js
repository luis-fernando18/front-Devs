require('dotenv').config();


const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Middleware para o Express entender JSON
app.use(express.json());

// --- Conexão com o MongoDB ---
// (coloque aqui sua string de conexão)
mongoose.connect('mongodb+srv://260472024:eniacecommerce712@cluster0.jm8drnk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&tlsAllowInvalidCertificates=true')
    .then(() => console.log('Conectado ao MongoDB...'))
    .catch(err => console.error('Não foi possível conectar ao MongoDB...', err));

// --- Importando e Usando as Rotas ---
const rotasUsuario = require('./routes/rotasUsuario');
const rotasProduto = require('./routes/rotasProduto');
const rotasPedido = require('./routes/rotasPedido');
app.use('/api/usuarios', rotasUsuario); // Todas as rotas em rotasUsuario começarão com /api/usuarios

// Rota principal de teste
app.get('/', (req, res) => {
    res.send('API do E-commerce no ar!');
});

app.use('/api/usuarios', rotasUsuario);
app.use('/api/produtos', rotasProduto);
app.use('/api/pedidos', rotasPedido);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});