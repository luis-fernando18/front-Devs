// Em: models/Produto.js

const mongoose = require('mongoose');

const ProdutoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'O nome do produto é obrigatório.'],
        trim: true
    },
    descricao: {
        type: String,
        required: [true, 'A descrição do produto é obrigatória.']
    },
    preco: {
        type: Number,
        required: [true, 'O preço do produto é obrigatório.'],
        min: [0, 'O preço não pode ser negativo.']
    },
    categoria: {
        type: String,
        trim: true
    },
    estoque: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    imagemUrl: {
        // Por enquanto, vamos apenas salvar a URL de uma imagem.
        // O upload de arquivos é um tópico mais avançado.
        type: String
    },
    criadoEm: {
        type: Date,
        default: Date.now
    }
});

const Produto = mongoose.model('Produto', ProdutoSchema);

module.exports = Produto;