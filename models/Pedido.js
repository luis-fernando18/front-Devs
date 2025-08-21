const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    },

    produtos: [
        {
            produto: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Produto'
            },
            quantidade: {
                type: Number,
                required: true,
                min: 1
            },
            preco: {
                type: Number,
                required: true
            }
        }
    ],
    
    totalDoPedido: {
        type: Number,
        required: true
    },

    enderecoDeEntrega: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Processando', 'Enviado', 'Entregue', 'Cancelado'],
        default: 'Processando'
    },

    dataDoPedido: {
        type: Date,
        default: Date.now
    }
});

const Pedido = mongoose.model('Pedido', PedidoSchema);

module.exports = Pedido;