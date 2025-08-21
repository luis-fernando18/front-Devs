// Em: routes/rotasPedido.js

const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');
const Produto = require('../models/Produto');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware'); 

// =======================================================
// ROTAS DE ADMIN PARA GERENCIAMENTO DE PEDIDOS
// =======================================================

// ROTA PARA LISTAR TODOS OS PEDIDOS (APENAS ADMIN)
// GET /api/pedidos
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const pedidos = await Pedido.find({})
            .populate('usuario', 'nome email') // Pega o nome e email do usuário que fez o pedido
            .sort({ dataDoPedido: -1 });   // Ordena pelos mais recentes

        res.json(pedidos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao buscar todos os pedidos." });
    }
});


// ROTA PARA ATUALIZAR O STATUS DE UM PEDIDO (APENAS ADMIN)
// PUT /api/pedidos/:id
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const pedidoId = req.params.id;

        // Validação simples para garantir que o status enviado é válido
        const statusValidos = ['Processando', 'Enviado', 'Entregue', 'Cancelado'];
        if (!status || !statusValidos.includes(status)) {
            return res.status(400).json({ mensagem: "Por favor, forneça um status válido." });
        }

        const pedidoAtualizado = await Pedido.findByIdAndUpdate(
            pedidoId,
            { status: status },
            { new: true }
        );

        if (!pedidoAtualizado) {
            return res.status(404).json({ mensagem: "Pedido não encontrado." });
        }

        res.json({ mensagem: "Status do pedido atualizado com sucesso!", pedido: pedidoAtualizado });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao atualizar o status do pedido." });
    }
});

// ROTA PARA CRIAR UM NOVO PEDIDO (FINALIZAR COMPRA)
// POST /api/pedidos
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { itensDoCarrinho, enderecoDeEntrega } = req.body;
        const usuarioId = req.usuario.id;

        if (!itensDoCarrinho || itensDoCarrinho.length === 0) {
            return res.status(400).json({ mensagem: "O carrinho não pode estar vazio." });
        }
        
        let totalDoPedido = 0;
        const produtosDoPedido = [];

        // Usamos um loop 'for...of' aqui em vez de 'forEach' porque precisamos usar 'await' dentro dele.
        for (const item of itensDoCarrinho) {
            const produtoDoBanco = await Produto.findById(item.produtoId);

            if (!produtoDoBanco) {
                return res.status(404).json({ mensagem: `Produto com ID ${item.produtoId} não encontrado.` });
            }

            if (produtoDoBanco.estoque < item.quantidade) {
                return res.status(400).json({ mensagem: `Estoque insuficiente para o produto: ${produtoDoBanco.nome}.` });
            }

            // Damos baixa no estoque
            produtoDoBanco.estoque -= item.quantidade;
            await produtoDoBanco.save();
            
            // Calculamos o subtotal e o total do pedido com o preço do nosso banco
            const subTotal = produtoDoBanco.preco * item.quantidade;
            totalDoPedido += subTotal;

            // Adicionamos o item formatado para salvar no pedido
            produtosDoPedido.push({
                produto: item.produtoId,
                quantidade: item.quantidade,
                preco: produtoDoBanco.preco // Preço do banco!
            });
        }
        
        // Criamos o novo pedido com os dados validados
        const novoPedido = new Pedido({
            usuario: usuarioId,
            produtos: produtosDoPedido,
            totalDoPedido,
            enderecoDeEntrega,
            status: 'Processando'
        });

        const pedidoSalvo = await novoPedido.save();

        res.status(201).json({ mensagem: "Pedido realizado com sucesso!", pedido: pedidoSalvo });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro no servidor ao processar o pedido." });
    }
});

// ROTA PARA BUSCAR O HISTÓRICO DE PEDIDOS DO USUÁRIO LOGADO
// GET /api/pedidos/meuspedidos
router.get('/meuspedidos', authMiddleware, async (req, res) => {
    try {
        const pedidos = await Pedido.find({ usuario: req.usuario.id })
            .sort({ dataDoPedido: -1 }) // Ordena pelos mais recentes primeiro
            .populate('produtos.produto', 'nome imagemUrl'); // Substitui o ID do produto por seus dados

        res.json(pedidos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao buscar histórico de pedidos." });
    }
});

module.exports = router;