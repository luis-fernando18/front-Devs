// Em: routes/rotasUsuario.js

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import crypto from "crypto";
import nodemailer from "nodemailer";
import upload from "../config/multerConfig.js";
import Usuario from "../models/Usuario.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router(); // LINHA ADICIONADA


router.post('/cadastro', async (req, res) => {
    try {

        console.log("DADOS RECEBIDOS NO CADASTRO:", req.body);

        const { nome, email, senha, confirmarSenha, cep, endereco, telefone } = req.body;
        if (!nome || !email || !senha || !confirmarSenha) return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
        if (senha !== confirmarSenha) return res.status(400).json({ mensagem: 'As senhas não coincidem.' });
        if (!validator.isEmail(email)) return res.status(400).json({ mensagem: 'Por favor, insira um e-mail válido.' });
        let usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) return res.status(400).json({ mensagem: 'Este e-mail já está em uso.' });
        const novoUsuario = new Usuario({ nome, email, senha, cep, endereco, telefone });
        await novoUsuario.save();
        res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro no servidor ao cadastrar.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) return res.status(400).json({ mensagem: 'E-mail e senha são obrigatórios.' });
        const usuario = await Usuario.findOne({ email }).select('+senha');
        if (!usuario) return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
        const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.json({ mensagem: 'Login bem-sucedido!', token });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro no servidor ao fazer login.' });
    }
});

router.get('/meuperfil', authMiddleware, (req, res) => {
    res.json(req.usuario);
});

// Em: routes/rotasUsuario.js

router.put('/meuperfil', authMiddleware, upload.single('fotoPerfil'), async (req, res) => {
    try {
        const dadosParaAtualizar = { ...req.body };
        const usuarioId = req.usuario.id;

        // Se uma nova foto foi enviada, o multer a deixará em req.file
        if (req.file) {
            // Adicionamos o caminho da nova foto aos dados que serão atualizados
            dadosParaAtualizar.fotoUrl = `/uploads/${req.file.filename}`;
        }

        // Encontra o usuário pelo ID e atualiza com os novos dados
        const usuarioAtualizado = await Usuario.findByIdAndUpdate(
            usuarioId,
            dadosParaAtualizar,
            { new: true } // Esta opção garante que a variável retornada já contenha os dados atualizados
        ).select('-senha');

        if (!usuarioAtualizado) {
            return res.status(404).json({ mensagem: "Usuário não encontrado." });
        }

        // Envia a resposta de sucesso com o usuário atualizado
        res.json({ mensagem: "Perfil atualizado com sucesso!", usuario: usuarioAtualizado });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao atualizar o perfil." });
    }
});

router.post('/favoritos/:produtoId', authMiddleware, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id);
        if (usuario.favoritos.includes(req.params.produtoId)) return res.status(400).json({ mensagem: "Produto já está nos favoritos." });
        usuario.favoritos.push(req.params.produtoId);
        await usuario.save();
        res.json({ mensagem: "Produto adicionado aos favoritos!", favoritos: usuario.favoritos });
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao adicionar favorito." });
    }
});

router.delete('/favoritos/:produtoId', authMiddleware, async (req, res) => {
    try {
        await Usuario.findByIdAndUpdate(req.usuario.id, { $pull: { favoritos: req.params.produtoId } });
        res.json({ mensagem: "Produto removido dos favoritos." });
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao remover favorito." });
    }
});

router.get('/favoritos', authMiddleware, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id).populate('favoritos');
        if (!usuario) return res.status(404).json({ mensagem: "Usuário não encontrado." });
        res.json(usuario.favoritos);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao buscar favoritos." });
    }
});

router.post('/esquecisenha', async (req, res) => {
    try {
        const { email } = req.body;
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(200).json({ mensagem: "Se um usuário com este e-mail existir, um link será enviado." });
        const resetToken = crypto.randomBytes(32).toString('hex');
        usuario.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        usuario.passwordResetExpires = Date.now() + 10 * 60 * 1000;
        await usuario.save();
        const resetURL = `http://localhost:3000/public/troca_senha__email/redefinir.senha.html?token=${resetToken}`;
        let transporter = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }});
        await transporter.sendMail({ from: '"Admin E-commerce" <noreply@ecommerce.com>', to: usuario.email, subject: "Redefinição de Senha", html: `<p>Clique neste link para redefinir sua senha: <a href="${resetURL}">${resetURL}</a></p>`});
        res.status(200).json({ mensagem: "Se um usuário com este e-mail existir, um link será enviado." });
    } catch (error) {
        res.status(500).json({ mensagem: "Erro no servidor." });
    }
});

router.put('/resetarsenha/:token', async (req, res) => {
    try {
        const { senha, confirmarSenha } = req.body;
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const usuario = await Usuario.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
        if (!usuario) return res.status(400).json({ mensagem: "Token inválido ou expirado." });
        if (senha !== confirmarSenha) return res.status(400).json({ mensagem: "As senhas não coincidem." });
        usuario.senha = senha;
        usuario.passwordResetToken = undefined;
        usuario.passwordResetExpires = undefined;
        await usuario.save();
        res.json({ mensagem: "Senha redefinida com sucesso!" });
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao redefinir a senha." });
    }
});

router.put('/alterarsenha', authMiddleware, async (req, res) => {
    try {
        const { senhaAtual, senhaNova, confirmaSenha } = req.body;
        if (senhaNova !== confirmaSenha) return res.status(400).json({ mensagem: "A nova senha e a confirmação não coincidem." });
        const usuario = await Usuario.findById(req.usuario.id).select('+senha');
        const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);
        if (!senhaCorreta) return res.status(401).json({ mensagem: "A senha atual está incorreta." });
        usuario.senha = senhaNova;
        await usuario.save();
        res.json({ mensagem: "Senha alterada com sucesso!" });
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao alterar a senha." });
    }
});

export default router;