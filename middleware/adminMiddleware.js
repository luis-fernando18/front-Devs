
const adminMiddleware = (req, res, next) => {

    // Verificamos se o usuário existe e se o 'role' dele é 'admin'.
    if (req.usuario && req.usuario.role === 'admin') {
        next(); // Se for admin, ótimo, pode continuar para a rota.
    } else {
        // Se não for admin, barramos o acesso com um erro 403 Forbidden.
        res.status(403).json({ mensagem: 'Acesso negado. Rota apenas para administradores.' });
    }
};

export default adminMiddleware;