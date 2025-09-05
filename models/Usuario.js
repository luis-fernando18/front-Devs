
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UsuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true, 
        trim: true     
    },
    email: {
        type: String,
        required: true,
        unique: true,  
        lowercase: true,
        trim: true
    },
    senha: {
        type: String,
        required: true,
        select: false  
    },cep: {
        type: String,
        required: false, 
        trim: true
    },
    endereco: {
        type: String,
        required: false,
        trim: true
    },
    telefone: {
        type: String,
        required: false,
        trim: true
    },

    fotoUrl: {
        type: String,
        default: null
    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'         
    },

    favoritos: [{
        // O tipo do campo é um ObjectId, um ID especial do MongoDB.
        type: mongoose.Schema.Types.ObjectId,
        // 'ref' diz ao Mongoose que os IDs nesta lista se referem
        // a documentos na coleção 'Produto'. Isso é crucial para o 'populate' mais tarde.
        ref: 'Produto'
    }],

    passwordResetToken: String,
    passwordResetExpires: Date,

    criadoEm: {
        type: Date,
        default: Date.now
    }
    
});


UsuarioSchema.pre('save', async function(next) {
    if (!this.isModified('senha')) {
        return next(); 
    }
    
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);

export default Usuario;