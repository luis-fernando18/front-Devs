
import multer from 'multer';
import path from 'path'; // Módulo 'path' do Node.js para lidar com caminhos de arquivos

const storage = multer.diskStorage({
    // Define a pasta onde os arquivos serão salvos
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    // Define o nome do arquivo para evitar duplicatas
    filename: (req, file, cb) => {
        // Usa a data atual como prefixo (garante nome único) + a extensão original do arquivo
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Exporta a configuração do multer usando 'export default'
export default multer({ storage: storage });