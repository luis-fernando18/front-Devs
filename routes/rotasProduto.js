import express from "express";
import Produto from "../models/Produto.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import upload from "../config/multerConfig.js";

const router = express.Router();

router.post('/', authMiddleware, adminMiddleware, upload.single('imagem'), async (req, res) => {
    try {
        const { nome, descricao, preco, categoria, estoque } = req.body;
        const imagemUrl = req.file ? `/uploads/${req.file.filename}` : null;
        const novoProduto = new Produto({ nome, descricao, preco, categoria, estoque, imagemUrl });
        const produtoSalvo = await novoProduto.save();
        res.status(201).json(produtoSalvo);
    } catch (error) {
        res.status(400).json({ mensagem: "Erro ao criar produto", erro: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const { search, categoria, precoMin, precoMax, sortBy, order } = req.query;
        const filtro = {};
        if (search) filtro.nome = { $regex: search, $options: 'i' };
        if (categoria) filtro.categoria = categoria;
        if (precoMin || precoMax) {
            filtro.preco = {};
            if (precoMin) filtro.preco.$gte = Number(precoMin);
            if (precoMax) filtro.preco.$lte = Number(precoMax);
        }
        let sortOptions = {};
        if (sortBy) {
            sortOptions[sortBy] = order === 'desc' ? -1 : 1;
        } else {
            sortOptions = { criadoEm: -1 };
        }
        const produtos = await Produto.find(filtro).sort(sortOptions);
        res.json(produtos);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro no servidor ao buscar produtos." });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const produto = await Produto.findById(req.params.id);
        if (!produto) return res.status(404).json({ mensagem: "Produto não encontrado" });
        res.json(produto);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro no servidor" });
    }
});

router.put('/:id', authMiddleware, adminMiddleware, upload.single('imagem'), async (req, res) => {
    try {
        const dadosParaAtualizar = { ...req.body };
        if (req.file) {
            dadosParaAtualizar.imagemUrl = `/uploads/${req.file.filename}`;
        }
        const produtoAtualizado = await Produto.findByIdAndUpdate(req.params.id, dadosParaAtualizar, { new: true, runValidators: true });
        if (!produtoAtualizado) return res.status(404).json({ mensagem: "Produto não encontrado" });
        res.json(produtoAtualizado);
    } catch (error) {
        res.status(400).json({ mensagem: "Erro ao atualizar produto", erro: error.message });
    }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const produtoDeletado = await Produto.findByIdAndDelete(req.params.id);
        if (!produtoDeletado) return res.status(404).json({ mensagem: "Produto não encontrado" });
        res.json({ mensagem: "Produto deletado com sucesso" });
    } catch (error) {
        res.status(500).json({ mensagem: "Erro no servidor" });
    }
});

export default router;
