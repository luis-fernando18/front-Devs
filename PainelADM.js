// Trocar foto de perfil
const btnAlterarFoto = document.getElementById("btnAlterarFoto");
const inputFoto = document.getElementById("inputFoto");
const fotoPreview = document.getElementById("foto-preview");


btnAlterarFoto.addEventListener("click", () => {
  inputFoto.click();
});


inputFoto.addEventListener("change", () => {
  const file = inputFoto.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      fotoPreview.style.backgroundImage = `url(${e.target.result})`;
      fotoPreview.style.backgroundSize = "cover";
      fotoPreview.style.backgroundPosition = "center";
    };
    reader.readAsDataURL(file);
  }
});


// SVGs originais para alternar senha
const svgOlhoAberto = `
<svg class="icone-olho" xmlns="http://www.w3.org/2000/svg" fill="none"
  viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268
    2.943 9.542 7-1.274 4.057-5.065 7-9.542
    7-4.477 0-8.268-2.943-9.542-7z" />
</svg>
`;


const svgOlhoFechado = `
<svg class="icone-olho" xmlns="http://www.w3.org/2000/svg" fill="none"
  viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477
    0-8.268-2.943-9.542-7a10.05 10.05 0
    012.153-3.592M6.634 6.634A9.956 9.956 0
    0112 5c4.477 0 8.268 2.943 9.542
    7-.458 1.459-1.241 2.763-2.247
    3.802M15 12a3 3 0 01-3 3m0-6a3 3
    0 013 3m-6 0a3 3 0 003-3m0 6v.01" />
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
    d="M3 3l18 18" />
</svg>
`;


// Alternar mostrar/ocultar senha
document.querySelectorAll(".toggle-senha").forEach(botao => {
  botao.addEventListener("click", () => {
    const campoId = botao.getAttribute("data-alvo");
    const campo = document.getElementById(campoId);


    if (campo.type === "password") {
      campo.type = "text";
      botao.innerHTML = svgOlhoFechado;
    } else {
      campo.type = "password";
      botao.innerHTML = svgOlhoAberto;
    }
  });
});


// Verificar força da senha
function verificarForcaSenha(senha) {
  let forca = 0;
  if (senha.length >= 6) forca++;
  if (/[A-Z]/.test(senha)) forca++;
  if (/[a-z]/.test(senha)) forca++;
  if (/[0-9]/.test(senha)) forca++;
  if (/[@~$!=%*?_&"'-+#¨^:;<>,.{})()]/.test(senha)) forca++;
  return forca;
}


// Aplica cor e texto ao campo
const senhaNovaInput = document.getElementById("senhaNova");
const senhaTexto = document.getElementById("senhaForcaTexto");


senhaNovaInput.addEventListener("input", () => {
  const valor = senhaNovaInput.value;
  const forca = verificarForcaSenha(valor);


  senhaNovaInput.classList.remove("senha-fraca", "senha-media", "senha-forte");
  senhaTexto.classList.remove("fraca", "media", "forte");
  senhaTexto.textContent = "";


  if (valor.length === 0) return;


  if (forca <= 2) {
    senhaNovaInput.classList.add("senha-fraca");
    senhaTexto.textContent = "Senha fraca";
    senhaTexto.classList.add("fraca");
  } else if (forca === 3 || forca === 4) {
    senhaNovaInput.classList.add("senha-media");
    senhaTexto.textContent = "Senha média";
    senhaTexto.classList.add("media");
  } else if (forca === 5) {
    senhaNovaInput.classList.add("senha-forte");
    senhaTexto.textContent = "Senha forte";
    senhaTexto.classList.add("forte");
  }
});


// Validação de confirmação de senha
const confirmaSenhaInput = document.getElementById("confirmaSenha");
const senhaConfirmaTexto = document.getElementById("senhaConfirmaTexto");


function validarConfirmacaoSenha() {
  senhaConfirmaTexto.textContent = "";
  senhaConfirmaTexto.classList.remove("fraca", "forte");
  confirmaSenhaInput.classList.remove("senha-fraca", "senha-forte");


  if (confirmaSenhaInput.value === "") {
    confirmaSenhaInput.style.border = "1px solid #ccc";
    return;
  }


  if (confirmaSenhaInput.value === senhaNovaInput.value) {
    confirmaSenhaInput.classList.add("senha-forte");
    senhaConfirmaTexto.textContent = "Senhas coincidem";
    senhaConfirmaTexto.classList.add("forte");
  } else {
    confirmaSenhaInput.classList.add("senha-fraca");
    senhaConfirmaTexto.textContent = "Senhas não coincidem";
    senhaConfirmaTexto.classList.add("fraca");
  }
}


confirmaSenhaInput.addEventListener("input", validarConfirmacaoSenha);
senhaNovaInput.addEventListener("input", validarConfirmacaoSenha);


// Variável global para saber se estamos editando ou cadastrando
let editandoLinha = null;


// Abrir e fechar modal
const abrirModalBtn = document.getElementById("abrirModalProduto");
const modal = document.getElementById("modalProduto");
const fecharModalBtn = document.getElementById("fecharModalProduto");
const tabelaProdutos = document.getElementById("produtos-tabela");


abrirModalBtn.addEventListener("click", () => {
  editandoLinha = null;
  document.getElementById("formProduto").reset();
  modal.style.display = "flex";
});


fecharModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});


window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});


// Submeter formulário
document.getElementById("formProduto").addEventListener("submit", function(e) {
  e.preventDefault();


  const nome = document.getElementById("nomeProduto").value;
  const descricao = document.getElementById("descricaoProduto").value;
  const preco = parseFloat(document.getElementById("precoProduto").value);
  const estoque = parseInt(document.getElementById("estoqueProduto").value);
  const imagemInput = document.getElementById("imagemProduto").files[0];


  if (isNaN(preco) || isNaN(estoque)) {
    alert("Por favor, insira valores válidos para preço e estoque.");
    return;
  }


  const atualizarTabela = (imagemBase64) => {
    if (editandoLinha) {
      editandoLinha.querySelector("td:nth-child(1) img").src =
        imagemBase64 || editandoLinha.querySelector("td:nth-child(1) img").src;
      editandoLinha.querySelector("td:nth-child(2)").textContent = nome;
      editandoLinha.querySelector("td:nth-child(3)").textContent = `R$ ${preco.toFixed(2)}`;
      editandoLinha.querySelector("td:nth-child(4)").textContent = estoque;
    } else {
      const novaLinha = document.createElement("tr");
      novaLinha.innerHTML = `
        <td><img src="${imagemBase64}" alt="${nome}"></td>
        <td>${nome}</td>
        <td>R$ ${preco.toFixed(2)}</td>
        <td>${estoque}</td>
        <td class="acoes">
          <button class="editar"><i class="fas fa-edit"></i></button>
          <button class="excluir"><i class="fas fa-trash"></i></button>
        </td>
      `;
      tabelaProdutos.appendChild(novaLinha);
      adicionarEventosAcoes(novaLinha);
    }


    modal.style.display = "none";
    e.target.reset();
    editandoLinha = null;
  };


  if (imagemInput) {
    const reader = new FileReader();
    reader.onload = function(event) {
      atualizarTabela(event.target.result);
    };
    reader.readAsDataURL(imagemInput);
  } else {
    atualizarTabela(null);
  }
});


// Função para adicionar eventos de editar/excluir
function adicionarEventosAcoes(linha) {
  const btnEditar = linha.querySelector(".editar");
  const btnExcluir = linha.querySelector(".excluir");


  btnEditar.addEventListener("click", () => {
    editandoLinha = linha;
    document.getElementById("nomeProduto").value = linha.querySelector("td:nth-child(2)").textContent;
    document.getElementById("precoProduto").value = linha.querySelector("td:nth-child(3)").textContent.replace("R$ ", "").replace(",", ".");
    document.getElementById("estoqueProduto").value = linha.querySelector("td:nth-child(4)").textContent;
    document.getElementById("descricaoProduto").value = "Descrição simulada (pode vir do backend)";
    modal.style.display = "flex";
  });


  btnExcluir.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      linha.remove();
    }
  });
}


// Ativar eventos nas linhas já existentes
document.querySelectorAll("#produtos-tabela tr").forEach(adicionarEventosAcoes);


// Renderizar pedidos na tabela
function renderizarPedidos(listaPedidos = []) {
  tabelaPedidos.innerHTML = "";
  listaPedidos.forEach((pedido) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${pedido.id}</td>
      <td>${pedido.data}</td>
      <td>${pedido.cliente}</td>
      <td>${pedido.total}</td>
      <td>${pedido.status}</td>
      <td>
        <button class="btn-acao editar" onclick="editarPedido(${pedido.id})">
          <i class="fa-solid fa-pen"></i>
        </button>
      </td>
    `;
    tabelaPedidos.appendChild(row);
  });
}
