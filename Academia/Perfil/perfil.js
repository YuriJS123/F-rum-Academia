const botaoEditar = document.querySelector('.edit-button');
const botaoSalvar = document.querySelector('.save-button');
const campos = document.querySelectorAll('.form-group input, .form-group select');
const inputFoto = document.getElementById('fotoUpload');
const imagemPerfil = document.getElementById('fotoPerfil');
const apelidoPerfil = document.getElementById('apelidoPerfil');
const labelFoto = document.getElementById('labelFoto');

function setCamposEditaveis(editavel) {
  campos.forEach(campo => campo.disabled = !editavel);
  labelFoto.style.cursor = editavel ? 'pointer' : 'default';
  labelFoto.style.pointerEvents = editavel ? 'auto' : 'none';
}

function salvarNoLocalStorage() {
  const apelidoInput = document.querySelector('.form-group input[placeholder="Coloque seu apelido"]').value;
  const nomeInput = document.querySelector('.form-group input[placeholder="Coloque seu nome"]').value;
  const novaFoto = imagemPerfil.src;

  const dadosAntigos = JSON.parse(localStorage.getItem('usuarioLogado'));
  const apelidoAnterior = dadosAntigos?.apelido;
  const fotoAnterior = dadosAntigos?.foto;

  apelidoPerfil.innerText = apelidoInput || 'Seu apelido';

  const usuarioLogado = {
    nome: nomeInput,
    apelido: apelidoInput,
    foto: novaFoto
  };

  localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));

  // Atualizar foto e apelido nos posts e comentários antigos
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  const atualizados = posts.map(post => {
    // Atualizar apelido do autor do post
    if (post.autor === apelidoAnterior) {
      post.autor = apelidoInput;
      post.fotoAutor = novaFoto;
    }

    // Atualizar autor e foto dos comentários
    if (Array.isArray(post.comentariosAutor) && Array.isArray(post.comentariosFoto)) {
      post.comentariosAutor = post.comentariosAutor.map((autor, i) => {
        if (autor === apelidoAnterior) {
          post.comentariosFoto[i] = novaFoto;
          return apelidoInput;
        }
        return autor;
      });
    }

    return post;
  });

  localStorage.setItem('posts', JSON.stringify(atualizados));
}

function carregarDados() {
  const dados = localStorage.getItem('usuarioLogado');
  if (dados) {
    const usuario = JSON.parse(dados);
    if (usuario.foto) imagemPerfil.src = usuario.foto;
    if (usuario.apelido) apelidoPerfil.innerText = usuario.apelido;
    document.querySelector('.form-group input[placeholder="Coloque seu nome"]').value = usuario.nome || '';
    document.querySelector('.form-group input[placeholder="Coloque seu apelido"]').value = usuario.apelido || '';

    // Atualizar a foto da seção de e-mail
    const imagemEmail = document.getElementById('fotoEmail');
    if (imagemEmail && usuario.foto) {
      imagemEmail.src = usuario.foto;
    }
  }
}

botaoEditar.addEventListener('click', () => {
  setCamposEditaveis(true);
  botaoEditar.style.display = 'none';
  botaoSalvar.style.display = 'inline-block';
});

botaoSalvar.addEventListener('click', () => {
  salvarNoLocalStorage();
  setCamposEditaveis(false);
  botaoSalvar.style.display = 'none';
  botaoEditar.style.display = 'inline-block';
});

inputFoto.addEventListener('change', (e) => {
  const arquivo = e.target.files[0];
  if (arquivo) {
    const leitor = new FileReader();
    leitor.onload = () => {
      imagemPerfil.src = leitor.result;

      // Atualiza também a imagem da seção de e-mail
      const imagemEmail = document.getElementById('fotoEmail');
      if (imagemEmail) {
        imagemEmail.src = leitor.result;
      }
    };
    leitor.readAsDataURL(arquivo);
  }
});

window.addEventListener('DOMContentLoaded', () => {
  carregarDados();
  setCamposEditaveis(false);
  botaoSalvar.style.display = 'none';
});
