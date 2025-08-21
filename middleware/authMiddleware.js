// Em: middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const authMiddleware = async (req, res, next) => {
    let token;

    // O token geralmente é enviado no cabeçalho de autorização assim: "Bearer TOKEN"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Pega o token do cabeçalho (remove a palavra "Bearer")
            token = req.headers.authorization.split(' ')[1];

            // 2. Verifica se o token é válido usando nosso segredo JWT
            const decoded = jwt.verify(token, process.env.JWT_SECRET,); // Use o mesmo segredo do login!

            // 3. Pega o ID do usuário de dentro do token e busca o usuário no banco
            // Anexa o objeto do usuário (sem a senha) ao objeto da requisição (req)
            req.usuario = await Usuario.findById(decoded.id).select('-senha');
            
            // 4. Continua para a próxima função (a rota protegida)
            next();

        } catch (error) {
            console.error(error);
            res.status(401).json({ mensagem: 'Não autorizado, token falhou.' });
        }
    }

    if (!token) {
        res.status(401).json({ mensagem: 'Não autorizado, nenhum token encontrado.' });
    }
};

module.exports = authMiddleware;