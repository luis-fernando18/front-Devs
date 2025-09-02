<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Eniac Academy</title>
  <link rel="shortcut icon" href="favicon.png" type="image/x-icon">
  <link rel="stylesheet" href="login.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="eniac-header">
    <img src="Logo.png" alt="Logo">
  </div>


  <div class="container">
    <div class="form-box">
      <h2 id="form-title">Fazer login</h2>
      <form id="login-form">
        <label>Endereço de E-mail ou Número de Celular:</label>
        <input type="text" required oninvalid="this.setCustomValidity('Por favor, Digite seu Email:')" oninput="this.setCustomValidity('')"/>
       
        <label>Senha:</label>
        <input type="password" id="senha" required oninvalid="this.setCustomValidity('Por favor, Digite sua Senha:')" oninput="this.setCustomValidity('')"/>
        <i class="bi bi-eye-slash-fill"  id="btn-senha" onclick="mostrarSenha()"></i>


        <button type="submit" id="login-btn">
          Continuar <span class="spinner" id="login-spinner" style="display: none;"></span>
        </button>


        <p class="note">
          Ao continuar, você concorda com as Condições de Uso do ENIAC. Consulte a Notificação de Privacidade, Notificação de Cookies e a Notificação de Anúncios Baseados em Interesse.
        </p>
        <hr />
        <p class="toggle-text">Novo no Eniac? <span onclick="toggleForm()">Crie sua conta</span></p>
      </form>


      <form id="register-form" style="display: none;">
        <label>Nome:</label>
        <input type="text" required oninvalid="this.setCustomValidity('Por favor, Digite seu Nome:')" oninput="this.setCustomValidity('')"/>


        <label>Endereço de E-mail:</label>
        <input type="email" required oninvalid="this.setCustomValidity('Por favor, Confirme seu Email:')" oninput="this.setCustomValidity('')"/>


        <label>Telefone:</label>
        <input type="number" required oninvalid="this.setCustomValidity('Por favor, Confirme seu Telefone:')" oninput="this.setCustomValidity('')"/>
        
        <label>Endereço:</label>
        <input type="email" required oninvalid="this.setCustomValidity('Por favor, Confirme seu Endereço:')" oninput="this.setCustomValidity('')"/>


        <label>CEP:</label>
        <input type="email" required oninvalid="this.setCustomValidity('Por favor, Confirme seu CEP:')" oninput="this.setCustomValidity('')"/>
        
        <label>Senha:</label>
        <input type="password" id="Cad-senha" required oninvalid="this.setCustomValidity('Por favor, Digite sua Senha:')" oninput="this.setCustomValidity('')"/>
        <i class="bi bi-eye-slash-fill" id="Conf-senha" onclick="mostrarSenhaCad()"></i>


        <label>Confirme a Senha:</label>
        <input type="password" id="Confirm-senha" required oninvalid="this.setCustomValidity('Por favor, Confirme sua Senha:')" oninput="this.setCustomValidity('')"/>
        <i class="bi bi-eye-slash-fill" id="Confir-senha" onclick="mostrarSenhaConf()"></i>
       
        <button type="submit" id="register-btn">
          Criar sua conta no Eniac <span class="spinner" id="register-spinner" style="display: none;"></span>
        </button>
        
        <hr />
        <p class="toggle-text">Já tem uma conta? <span onclick="toggleForm()">Fazer login</span></p>
      </form>
    </div>
  </div>


  <div class="cookies-msg" id="cookies-msg">
    <div class="cookies-txt">
      <p>
        Este site usa cookies e tecnologias afins, que são pequenos arquivos ou pedaços de texto baixados para um aparelho quando o visitante acessa um website ou aplicativo. Ao utilizar nosso site você está de acordo com a utilização de cookies para te proporcionar uma melhor experiência.
      </p>
      <div class="cookies-btn">
        <button onclick="aceito()">Aceito</button>
      </div>
    </div>
  </div>


  <footer class="eniac-footer">
    <a href="#">Termos de Uso</a>
    <a href="#">Privacidade</a>
    <a href="#">Ajuda</a>
    <p>© 1946–2025, Eniac.edu.br, Inc. ou suas afiliadas</p>
  </footer>


  <script>
    var msgCookies = document.getElementById('cookies-msg')
    function aceito(){
      localStorage.lgpd = "sim"
      msgCookies.classList.remove('mostrar')
    }


    if(localStorage.lgpd == 'sim'){
    msgCookies.classList.remove('mostrar')
    }else{
    msgCookies.classList.add('mostrar')
    }


    function toggleForm() {
      const loginForm = document.getElementById('login-form');
      const registerForm = document.getElementById('register-form');
      const title = document.getElementById('form-title');


      if (loginForm.classList.contains("show")) {
        loginForm.classList.remove("show");
        loginForm.classList.add("hide");


        setTimeout(() => {
          registerForm.style.display = "block";
          registerForm.classList.remove("hide");
          registerForm.classList.add("show");
          title.textContent = "Criar conta";
          loginForm.style.display = "none";
        }, 300);
      } else {
        registerForm.classList.remove("show");
        registerForm.classList.add("hide");


        setTimeout(() => {
          loginForm.style.display = "block";
          loginForm.classList.remove("hide");
          loginForm.classList.add("show");
          title.textContent = "Fazer login";
          registerForm.style.display = "none";
        }, 300);
      }
    }


    window.onload = function () {
      document.getElementById('login-form').classList.add('show');
      document.getElementById('register-form').classList.add('hide');
    };


    document.getElementById('login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = document.getElementById('login-btn');
      const spinner = document.getElementById('login-spinner');
      btn.disabled = true;
      spinner.style.display = 'inline-block';
      btn.innerHTML = 'Carregando... <span class="spinner"></span>';


      setTimeout(() => {
        btn.disabled = false;
        spinner.style.display = 'none';
        btn.innerHTML = 'Continuar';
        alert("Login simulado com sucesso!");
      }, 2000);
    });


    document.getElementById('register-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = document.getElementById('register-btn');
      const spinner = document.getElementById('register-spinner');
      btn.disabled = true;
      spinner.style.display = 'inline-block';
      btn.innerHTML = 'Carregando... <span class="spinner"></span>';


      setTimeout(() => {
        btn.disabled = false;
        spinner.style.display = 'none';
        btn.innerHTML = 'Criar sua conta no Eniac';
        alert("Cadastro simulado com sucesso!");
      }, 2000);
    });


    function mostrarSenha(){
        var inputPass = document.getElementById('senha')
        var btnShowPass = document.getElementById('btn-senha')


        if(inputPass.type === 'password'){
            inputPass.setAttribute('type','text');
            btnShowPass.classList.replace('bi-eye-slash-fill', 'bi-eye-fill');
        }else{
            inputPass.setAttribute('type','password');
            btnShowPass.classList.replace('bi-eye-fill', 'bi-eye-slash-fill');
        }
    };




    function mostrarSenhaCad(){
        var inputCad = document.getElementById('Cad-senha')
        var btnShowCad = document.getElementById('Conf-senha')


        if(inputCad.type === 'password'){
            inputCad.setAttribute('type','text');
            btnShowCad.classList.replace('bi-eye-slash-fill', 'bi-eye-fill');
        }else{
            inputCad.setAttribute('type','password');
            btnShowCad.classList.replace('bi-eye-fill', 'bi-eye-slash-fill');
        }
    }


    function mostrarSenhaConf(){
        var inputConf = document.getElementById('Confirm-senha')
        var btnShowConf = document.getElementById('Confir-senha')


        if(inputConf.type === 'password'){
            inputConf.setAttribute('type','text');
            btnShowConf.classList.replace('bi-eye-fill', 'bi-eye-slash-fill');
        }else{
            inputConf.setAttribute('type', 'password');
            btnShowConf.classList.replace('bi-eye-slash-fill', 'bi-eye-fill');
        }
    }


  </script>
</body>
</html>
