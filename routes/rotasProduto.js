// Em: routes/rotasProduto.js

const express = require('express');
const router = express.Router();
const Produto = require('../models/Produto');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../config/multerConfig'); 

// ROTA PARA CRIAR UM NOVO PRODUTO (Create)
// POST /api/produtos
router.post('/', authMiddleware, adminMiddleware, upload.single('imagem'), async (req, res) => {
    try {

        const { nome, descricao, preco, categoria, estoque } = req.body;

        // O multer, após o upload, anexa o objeto 'file' à requisição (req).
        // Se nenhum arquivo for enviado, req.file será undefined.
        const imagemUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const novoProduto = new Produto({
            nome,
            descricao,
            preco,
            categoria,
            estoque,
            imagemUrl // Salva o caminho para a imagem no banco
        });
        
        const produtoSalvo = await novoProduto.save();
        res.status(201).json(produtoSalvo);
    } catch (error) {
        res.status(400).json({ mensagem: "Erro ao criar produto", erro: error.message });
    }
});

// ROTA PARA LISTAR TODOS OS PRODUTOS (COM FILTROS, BUSCA E ORDENAÇÃO)
// GET /api/produtos
router.get('/', async (req, res) => {
    try {
        // 1. Captura os parâmetros da URL
        const { search, categoria, precoMin, precoMax, sortBy, order } = req.query;

        // 2. Monta um objeto de filtro dinâmico
        const filtro = {};

        if (search) {
            // Usa uma expressão regular para busca "case-insensitive" (não diferencia maiúsculas/minúsculas)
            filtro.nome = { $regex: search, $options: 'i' };
        }

        if (categoria) {
            filtro.categoria = categoria;
        }
        
        // Filtro de preço
        if (precoMin || precoMax) {
            filtro.preco = {};
            if (precoMin) {
                filtro.preco.$gte = Number(precoMin); // gte = Greater Than or Equal (maior ou igual a)
            }
            if (precoMax) {
                filtro.preco.$lte = Number(precoMax); // lte = Less Than or Equal (menor ou igual a)
            }
        }
        
        // 3. Monta o objeto de ordenação
        let sortOptions = {};
        if (sortBy) {
            // Ex: sortBy=preco&order=desc -> { preco: -1 }
            sortOptions[sortBy] = order === 'desc' ? -1 : 1;
        } else {
            // Ordenação padrão por data de criação
            sortOptions = { criadoEm: -1 };
        }

        // 4. Executa a consulta no banco de dados com os filtros e a ordenação
        const produtos = await Produto.find(filtro).sort(sortOptions);
        
        res.json(produtos);

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro no servidor ao buscar produtos." });
    }
});

// ROTA PARA BUSCAR UM ÚNICO PRODUTO PELO ID (Read)
// GET /api/produtos/:id
router.get('/:id', async (req, res) => {
    try {
        const produto = await Produto.findById(req.params.id);
        if (!produto) {
            return res.status(404).json({ mensagem: "Produto não encontrado" });
        }
        res.json(produto);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro no servidor" });
    }
});

// ROTA PARA ATUALIZAR UM PRODUTO (Update)
// PUT /api/produtos/:id
router.put('/:id', authMiddleware, adminMiddleware, upload.single('imagem'), async (req, res) => {
    try {
        const dadosParaAtualizar = { ...req.body };

        // Verifica se um novo arquivo de imagem foi enviado
        if (req.file) {
            // Se sim, adiciona o novo caminho da imagem aos dados que serão atualizados
            dadosParaAtualizar.imagemUrl = `/uploads/${req.file.filename}`;
        }

        const produtoAtualizado = await Produto.findByIdAndUpdate(
            req.params.id,
            dadosParaAtualizar, // Usa o objeto com os dados atualizados
            { new: true, runValidators: true }
        );
        
        if (!produtoAtualizado) {
            return res.status(404).json({ mensagem: "Produto não encontrado" });
        }
        
        res.json(produtoAtualizado);
    } catch (error) {
        res.status(400).json({ mensagem: "Erro ao atualizar produto", erro: error.message });
    }
});

// ROTA PARA DELETAR UM PRODUTO (Delete)
// DELETE /api/produtos/:id
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const produtoDeletado = await Produto.findByIdAndDelete(req.params.id);
        if (!produtoDeletado) {
            return res.status(404).json({ mensagem: "Produto não encontrado" });
        }
        res.json({ mensagem: "Produto deletado com sucesso" });
    } catch (error) {
        res.status(500).json({ mensagem: "Erro no servidor" });
    }
});

module.exports = router;