
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Importa o nosso modelo de Usuário
const Usuario = require('../models/Usuario');
const authMiddleware = require('../middleware/authMiddleware');

// --- ROTA DE CADASTRO ---
// URL: POST /api/usuarios/cadastro
router.post('/cadastro', async (req, res) => {
    try {
        const { nome, email, senha, confirmarSenha, cep, endereco, telefone } = req.body;

        // 1. Validações básicas
        if (!nome || !email || !senha || !confirmarSenha) {
            return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
        }

        if (senha !== confirmarSenha) {
            return res.status(400).json({ mensagem: 'As senhas não coincidem.' });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ mensagem: 'Por favor, insira um e-mail válido.' });
        }

        // 2. Verifica se o e-mail já existe
        let usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ mensagem: 'Este e-mail já está em uso.' });
        }

        // 3. Cria o novo usuário
        // A senha será hasheada automaticamente pelo hook 'pre-save' no modelo
        const novoUsuario = new Usuario({
            nome,
            email,
            senha,
            cep,
            endereco,
            telefone
        });

        // 4. Salva o usuário no banco de dados
        await novoUsuario.save();

        // 5. Envia a resposta de sucesso
        res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: 'Ocorreu um erro no servidor. Tente novamente mais tarde.' });
    }
});


// --- ROTA DE LOGIN ---
// URL: POST /api/usuarios/login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // 1. Validações
        if (!email || !senha) {
            return res.status(400).json({ mensagem: 'E-mail e senha são obrigatórios.' });
        }

        // 2. Busca o usuário pelo e-mail
        // Usamos .select('+senha') para forçar o Mongoose a incluir a senha na busca
        const usuario = await Usuario.findOne({ email }).select('+senha');
        if (!usuario) {
            // Mensagem genérica por segurança
            return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
        }

        // 3. Compara a senha enviada com a senha hasheada no banco
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
        }

        // 4. Gera o Token JWT
        const token = jwt.sign(
            { id: usuario._id },
            process.env.JWT_SECRET,
            { expiresIn: '8h' } // Token expira em 8 horas
        );
        
        // 5. Envia o token para o cliente
        res.json({ mensagem: 'Login bem-sucedido!', token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: 'Ocorreu um erro no servidor.' });
    }
});

router.put('/meuperfil', authMiddleware, async (req, res) => {
    try {
        const { nome, cep, endereco, telefone } = req.body;
        const usuarioId = req.usuario.id; // ID pego do token pelo middleware

        const camposParaAtualizar = { nome, cep, endereco, telefone };

        const usuarioAtualizado = await Usuario.findByIdAndUpdate(
            usuarioId,
            camposParaAtualizar,
            { new: true } // Retorna o documento já atualizado
        ).select('-senha');

        if (!usuarioAtualizado) {
            return res.status(404).json({ mensagem: "Usuário não encontrado." });
        }

        res.json({ mensagem: "Perfil atualizado com sucesso!", usuario: usuarioAtualizado });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao atualizar o perfil." });
    }
});

router.get('/meuperfil', authMiddleware, async (req, res) => {
    
    try {
        if (!req.usuario) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }
        res.json(req.usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao buscar dados do perfil." });
    }
});


// -------------------------------------------------------
// 3. ROTA PARA ALTERAR A SENHA
// URL: PUT /api/usuarios/alterarsenha
// -------------------------------------------------------
router.put('/alterarsenha', authMiddleware, async (req, res) => {
    try {
        const { senhaAtual, senhaNova, confirmaSenha } = req.body;
        const usuarioId = req.usuario.id;

        // Validações
        if (senhaNova !== confirmaSenha) {
            return res.status(400).json({ mensagem: "A nova senha e a confirmação não coincidem." });
        }

        // Para comparar a senha, precisamos buscar o usuário incluindo o campo 'senha'
        const usuario = await Usuario.findById(usuarioId).select('+senha');

        // Verifica se a senha atual informada está correta
        const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ mensagem: "A senha atual está incorreta." });
        }

        // Se a senha atual estiver correta, atualizamos para a nova senha
        // O nosso hook 'pre-save' no modelo Usuario.js vai automaticamente hashear essa nova senha
        usuario.senha = senhaNova;
        await usuario.save();

        res.json({ mensagem: "Senha alterada com sucesso!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao alterar a senha." });
    }
});

// Em: routes/rotasUsuario.js

// ... (todas as suas outras rotas de usuário estão aqui) ...


// =======================================================
// ROTAS PARA GERENCIAMENTO DE FAVORITOS
// =======================================================

// ROTA PARA ADICIONAR UM PRODUTO AOS FAVORITOS
// POST /api/usuarios/favoritos/:produtoId
router.post('/favoritos/:produtoId', authMiddleware, async (req, res) => {
    try {
        const produtoId = req.params.produtoId;
        const usuario = await Usuario.findById(req.usuario.id);

        // Verifica se o produto já está nos favoritos para não duplicar
        if (usuario.favoritos.includes(produtoId)) {
            return res.status(400).json({ mensagem: "Produto já está nos favoritos." });
        }

        // Adiciona o ID do produto à lista de favoritos do usuário
        usuario.favoritos.push(produtoId);
        await usuario.save();

        res.json({ mensagem: "Produto adicionado aos favoritos com sucesso!", favoritos: usuario.favoritos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao adicionar favorito." });
    }
});

// ROTA PARA REMOVER UM PRODUTO DOS FAVORITOS
// DELETE /api/usuarios/favoritos/:produtoId
router.delete('/favoritos/:produtoId', authMiddleware, async (req, res) => {
    try {
        const produtoId = req.params.produtoId;
        const usuario = await Usuario.findById(req.usuario.id);

        // Remove o ID do produto da lista de favoritos
        // O método .pull do Mongoose é perfeito para remover itens de um array
        usuario.favoritos.pull(produtoId);
        await usuario.save();

        res.json({ mensagem: "Produto removido dos favoritos com sucesso!", favoritos: usuario.favoritos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao remover favorito." });
    }
});

// ROTA PARA LISTAR OS PRODUTOS FAVORITOS DE UM USUÁRIO
// GET /api/usuarios/favoritos
router.get('/favoritos', authMiddleware, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id)
            // .populate() é a mágica do Mongoose: ele pega os IDs na lista de favoritos
            // e substitui pelos documentos completos dos produtos.
            .populate('favoritos');

        if (!usuario) {
            return res.status(404).json({ mensagem: "Usuário não encontrado." });
        }

        res.json(usuario.favoritos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao buscar favoritos." });
    }
});

// ROTA PARA SOLICITAR O RESET DE SENHA
// POST /api/usuarios/esquecisenha
router.post('/esquecisenha', async (req, res) => {
    try {
        const { email } = req.body;
        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.status(200).json({ mensagem: "Se um usuário com este e-mail existir, um link de redefinição de senha será enviado." });
        }

        // Gera o token de reset
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Hasheia o token e salva no banco de dados
        usuario.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        usuario.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Validade de 10 minutos
        await usuario.save();
        
        // Cria o link de reset que será enviado no e-mail
        // Para um site real, você usaria o domínio do seu site. Para testes, pode ser localhost.
        const resetURL = `http://localhost:3000/resetarsenha/${resetToken}`; // O front-end teria uma página para essa URL

        // 4. Configura e envia o e-mail
        // ATENÇÃO: A configuração abaixo usa um serviço de teste chamado Ethereal.
        // Ele cria uma caixa de entrada falsa para que você não precise usar suas credenciais reais.
        let testAccount = await nodemailer.createTestAccount();
       // let transporter = nodemailer.createTransport({
      //      host: "smtp.ethereal.email",
      //      port: 587,
      //      secure: false,
      //      auth: {
       //         user: testAccount.user, // Usuário gerado pelo Ethereal
       //         pass: testAccount.pass, // Senha gerada pelo Ethereal
        //    },
        //});

        let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Gmail usa conexão segura
    auth: {
        user: process.env.EMAIL_USER, // 'seu.email@gmail.com' guardado no .env
        pass: process.env.EMAIL_PASSWORD, // A "Senha de App" guardada no .env
    },
});

        const info = await transporter.sendMail({
            from: '"Admin E-commerce" <noreply@ecommerce.com>',
            to: usuario.email,
            subject: "Redefinição de Senha",
            text: `Você solicitou a redefinição de senha. Por favor, clique no seguinte link, ou cole no seu navegador para completar o processo: \n\n ${resetURL}`,
            html: `<p>Você solicitou a redefinição de senha. Por favor, clique no seguinte link para completar o processo:</p><a href="${resetURL}">${resetURL}</a>`
        });

        // Mostra o link para a caixa de entrada de teste no console do seu servidor
        console.log("Link de pré-visualização do E-mail: %s", nodemailer.getTestMessageUrl(info));

        res.status(200).json({ mensagem: "Se um usuário com este e-mail existir, um link de redefinição de senha será enviado." });

    } catch (error) {
        // Limpa os campos de reset em caso de erro para não travar a conta
        if (req.body.email) {
            const usuario = await Usuario.findOne({ email: req.body.email });
            if (usuario) {
                usuario.passwordResetToken = undefined;
                usuario.passwordResetExpires = undefined;
                await usuario.save();
            }
        }
        console.error(error);
        res.status(500).json({ mensagem: "Erro no servidor." });
    }
});

// ROTA PARA EFETIVAMENTE RESETAR A SENHA
// PUT /api/usuarios/resetarsenha/:token
router.put('/resetarsenha/:token', async (req, res) => {
    try {
        const { senha, confirmarSenha } = req.body;
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        
        // Encontra o usuário pelo token hasheado e verifica se não expirou
        const usuario = await Usuario.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() } // $gt = Greater Than (Maior que)
        });

        if (!usuario) {
            return res.status(400).json({ mensagem: "Token inválido ou expirado." });
        }
        
        if (senha !== confirmarSenha) {
            return res.status(400).json({ mensagem: "As senhas não coincidem." });
        }

        // Atualiza a senha e limpa os campos de reset
        usuario.senha = senha;
        usuario.passwordResetToken = undefined;
        usuario.passwordResetExpires = undefined;
        await usuario.save(); // O 'pre-save' vai hashear a nova senha automaticamente

        res.json({ mensagem: "Senha redefinida com sucesso!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao redefinir a senha." });
    }
});

module.exports = router;