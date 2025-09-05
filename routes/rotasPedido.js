import express from "express";
import Pedido from "../models/Pedido.js";
import Produto from "../models/Produto.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const pedidos = await Pedido.find({}).populate('usuario', 'nome email').sort({ dataDoPedido: -1 });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao buscar todos os pedidos." });
    }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const statusValidos = ['Processando', 'Enviado', 'Entregue', 'Cancelado'];
        if (!status || !statusValidos.includes(status)) return res.status(400).json({ mensagem: "Por favor, forneça um status válido." });
        const pedidoAtualizado = await Pedido.findByIdAndUpdate(req.params.id, { status: status }, { new: true });
        if (!pedidoAtualizado) return res.status(404).json({ mensagem: "Pedido não encontrado." });
        res.json({ mensagem: "Status do pedido atualizado!", pedido: pedidoAtualizado });
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao atualizar o status do pedido." });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { itensDoCarrinho, enderecoDeEntrega } = req.body;
        if (!itensDoCarrinho || itensDoCarrinho.length === 0) return res.status(400).json({ mensagem: "O carrinho não pode estar vazio." });
        let totalDoPedido = 0;
        const produtosDoPedido = [];
        for (const item of itensDoCarrinho) {
            const produtoDoBanco = await Produto.findById(item.produtoId);
            if (!produtoDoBanco) return res.status(404).json({ mensagem: `Produto com ID ${item.produtoId} não encontrado.` });
            if (produtoDoBanco.estoque < item.quantidade) return res.status(400).json({ mensagem: `Estoque insuficiente para: ${produtoDoBanco.nome}.` });
            produtoDoBanco.estoque -= item.quantidade;
            await produtoDoBanco.save();
            totalDoPedido += produtoDoBanco.preco * item.quantidade;
            produtosDoPedido.push({ produto: item.produtoId, quantidade: item.quantidade, preco: produtoDoBanco.preco });
        }
        const novoPedido = new Pedido({ usuario: req.usuario.id, produtos: produtosDoPedido, totalDoPedido, enderecoDeEntrega });
        const pedidoSalvo = await novoPedido.save();
        res.status(201).json({ mensagem: "Pedido realizado com sucesso!", pedido: pedidoSalvo });
    } catch (error) {
        res.status(500).json({ mensagem: "Erro no servidor ao processar o pedido." });
    }
});

router.get('/meuspedidos', authMiddleware, async (req, res) => {
    try {
        const pedidos = await Pedido.find({ usuario: req.usuario.id }).sort({ dataDoPedido: -1 }).populate('produtos.produto', 'nome imagemUrl');
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao buscar histórico de pedidos." });
    }
});

export default router;
