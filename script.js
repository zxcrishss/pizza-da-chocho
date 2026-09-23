/* ===========================================================
   Pizzaria da Chocho — script.js
   JavaScript simples: contato, login, carrinho e favoritos
   guardados no localStorage (sem backend real).
   =========================================================== */

const CHAVE_CARRINHO = 'pizzaria-chocho-carrinho';
const CHAVE_FAVORITOS = 'pizzaria-chocho-favoritos';

// ---------- Armazenamento (localStorage) ----------
function getCarrinho() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
  } catch (e) {
    return [];
  }
}

function salvarCarrinho(lista) {
  localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(lista));
  atualizarBadgeCarrinho();
}

function getFavoritos() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_FAVORITOS)) || [];
  } catch (e) {
    return [];
  }
}

function salvarFavoritos(lista) {
  localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(lista));
}

// ---------- Carrinho: adicionar / remover / alterar ----------
function adicionarAoCarrinho(id, nome, preco) {
  const carrinho = getCarrinho();
  const existente = carrinho.find(function (item) { return item.id === id; });

  if (existente) {
    existente.qtd += 1;
  } else {
    carrinho.push({ id: id, nome: nome, preco: preco, qtd: 1 });
  }

  salvarCarrinho(carrinho);
}

function removerDoCarrinho(id) {
  const carrinho = getCarrinho().filter(function (item) { return item.id !== id; });
  salvarCarrinho(carrinho);
  renderizarCarrinho();
}

function alterarQuantidade(id, delta) {
  const carrinho = getCarrinho();
  const item = carrinho.find(function (i) { return i.id === id; });
  if (!item) return;

  item.qtd += delta;
  const novoCarrinho = item.qtd <= 0
    ? carrinho.filter(function (i) { return i.id !== id; })
    : carrinho;

  salvarCarrinho(novoCarrinho);
  renderizarCarrinho();
}

// ---------- Favoritos: alternar ----------
function alternarFavorito(id, nome, preco, botao) {
  let favoritos = getFavoritos();
  const jaFavoritado = favoritos.some(function (item) { return item.id === id; });

  if (jaFavoritado) {
    favoritos = favoritos.filter(function (item) { return item.id !== id; });
  } else {
    favoritos.push({ id: id, nome: nome, preco: preco });
  }

  salvarFavoritos(favoritos);

  if (botao) {
    const agoraFavoritado = !jaFavoritado;
    botao.classList.toggle('ativo', agoraFavoritado);
    botao.textContent = agoraFavoritado ? '♥' : '♡';
    botao.setAttribute('aria-label', (agoraFavoritado ? 'Remover ' : 'Favoritar ') + nome);
  }

  if (document.getElementById('lista-favoritos')) {
    renderizarFavoritos();
  }
}

// ---------- Badge do carrinho no menu ----------
function atualizarBadgeCarrinho() {
  const badges = document.querySelectorAll('.cart-badge');
  if (!badges.length) return;

  const total = getCarrinho().reduce(function (soma, item) { return soma + item.qtd; }, 0);
  badges.forEach(function (badge) { badge.textContent = total; });
}

// ---------- Formata preço em reais ----------
function formatarPreco(valor) {
  return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

// ---------- Liga os botões dos cards de cardápio/promoções ----------
function initBotoesDeCard() {
  const favoritosAtuais = getFavoritos().map(function (f) { return f.id; });

  document.querySelectorAll('.menu-card, .combo-card').forEach(function (card) {
    const id = card.dataset.id;
    if (!id) return;

    const nome = card.dataset.nome;
    const preco = parseFloat(card.dataset.preco);

    const botaoFav = card.querySelector('.btn-favorito');
    if (botaoFav) {
      if (favoritosAtuais.indexOf(id) !== -1) {
        botaoFav.classList.add('ativo');
        botaoFav.textContent = '♥';
      }
      botaoFav.addEventListener('click', function () {
        alternarFavorito(id, nome, preco, botaoFav);
      });
    }

    const botaoAdd = card.querySelector('.btn-add-carrinho');
    if (botaoAdd) {
      botaoAdd.addEventListener('click', function () {
        adicionarAoCarrinho(id, nome, preco);
        const textoOriginal = botaoAdd.textContent;
        botaoAdd.textContent = 'Adicionado!';
        botaoAdd.classList.add('confirmado');
        setTimeout(function () {
          botaoAdd.textContent = textoOriginal;
          botaoAdd.classList.remove('confirmado');
        }, 900);
      });
    }
  });
}

// ---------- Renderiza a página do carrinho ----------
function renderizarCarrinho() {
  const container = document.getElementById('carrinho-conteudo');
  if (!container) return;

  const carrinho = getCarrinho();

  if (carrinho.length === 0) {
    container.innerHTML =
      '<div class="empty-state">' +
      '<p>Seu carrinho está vazio.</p>' +
      '<a href="salgado.html">Ver o cardápio de salgados</a>' +
      '</div>';
    const totalBox = document.getElementById('carrinho-total-box');
    if (totalBox) totalBox.style.display = 'none';
    return;
  }

  let linhas = '';
  let total = 0;

  carrinho.forEach(function (item) {
    const subtotal = item.preco * item.qtd;
    total += subtotal;
    linhas +=
      '<tr>' +
      '<td>' + item.nome + '</td>' +
      '<td><span class="cart-row-qty">' +
      '<button class="qty-btn" type="button" onclick="alterarQuantidade(\'' + item.id + '\', -1)">-</button>' +
      '<span>' + item.qtd + '</span>' +
      '<button class="qty-btn" type="button" onclick="alterarQuantidade(\'' + item.id + '\', 1)">+</button>' +
      '</span></td>' +
      '<td>' + formatarPreco(subtotal) + '</td>' +
      '<td><button class="remove-item" type="button" onclick="removerDoCarrinho(\'' + item.id + '\')">Remover</button></td>' +
      '</tr>';
  });

  container.innerHTML =
    '<table class="cart-table">' +
    '<thead><tr><th>Item</th><th>Qtd.</th><th>Subtotal</th><th></th></tr></thead>' +
    '<tbody>' + linhas + '</tbody>' +
    '</table>';

  const totalBox = document.getElementById('carrinho-total-box');
  const totalValor = document.getElementById('carrinho-total-valor');
  if (totalBox && totalValor) {
    totalBox.style.display = 'flex';
    totalValor.textContent = formatarPreco(total);
  }
}

// ---------- Renderiza a página de favoritos ----------
function renderizarFavoritos() {
  const lista = document.getElementById('lista-favoritos');
  if (!lista) return;

  const favoritos = getFavoritos();

  if (favoritos.length === 0) {
    lista.innerHTML =
      '<div class="empty-state">' +
      '<p>Você ainda não favoritou nenhum item.</p>' +
      '<a href="salgado.html">Explorar o cardápio</a>' +
      '</div>';
    return;
  }

  lista.innerHTML = favoritos.map(function (item) {
    return (
      '<div class="favorito-card">' +
      '<h3>' + item.nome + '</h3>' +
      '<span class="price">' + formatarPreco(item.preco) + '</span>' +
      '<div class="card-actions">' +
      '<button class="btn-favorito ativo" type="button" aria-label="Remover ' + item.nome + '" ' +
      'onclick="alternarFavorito(\'' + item.id + '\', \'' + item.nome + '\', ' + item.preco + ', this)">♥</button>' +
      '<button class="btn-add-carrinho" type="button" ' +
      'onclick="adicionarAoCarrinho(\'' + item.id + '\', \'' + item.nome + '\', ' + item.preco + '); this.textContent=\'Adicionado!\'; setTimeout(() => this.textContent=\'Adicionar\', 900);">Adicionar</button>' +
      '</div></div>'
    );
  }).join('');
}

// ---------- Página de contato ----------
function initContatoForm() {
  const form = document.getElementById('form-contato');
  if (!form) return;

  const nome = document.getElementById('nome');
  const email = document.getElementById('email');
  const mensagem = document.getElementById('mensagem');
  const msgBox = document.getElementById('contato-mensagem');

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();
    let valido = true;

    valido = validarCampoTexto(nome, 'erro-nome', 2) && valido;
    valido = validarEmail(email, 'erro-email') && valido;
    valido = validarCampoTexto(mensagem, 'erro-mensagem', 5) && valido;

    if (valido) {
      mostrarMensagem(msgBox, 'Mensagem enviada! Obrigado pelo contato, respondemos em breve.', 'success');
      form.reset();
    } else {
      mostrarMensagem(msgBox, 'Confira os campos destacados antes de enviar.', 'error');
    }
  });
}

// ---------- Página de login ----------
function initLoginForm() {
  const form = document.getElementById('form-login');
  if (!form) return;

  const USUARIO_DEMO = 'cliente';
  const SENHA_DEMO = 'pizza123';

  const usuario = document.getElementById('usuario');
  const senha = document.getElementById('senha');
  const msgBox = document.getElementById('login-mensagem');

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();
    let valido = true;

    valido = validarCampoTexto(usuario, 'erro-usuario', 1) && valido;
    valido = validarCampoTexto(senha, 'erro-senha', 1) && valido;

    if (!valido) {
      mostrarMensagem(msgBox, 'Preencha usuário e senha para entrar.', 'error');
      return;
    }

    if (usuario.value.trim() === USUARIO_DEMO && senha.value === SENHA_DEMO) {
      mostrarMensagem(msgBox, 'Login realizado! Redirecionando para o início...', 'success');
      setTimeout(function () {
        window.location.href = '../index.html';
      }, 1200);
    } else {
      mostrarMensagem(msgBox, 'Usuário ou senha incorretos. Tente novamente.', 'error');
    }
  });
}

// ---------- Mercado Pago: carrega a Public Key e inicializa o SDK ----------
let mercadoPagoSDK = null;

async function iniciarMercadoPago() {
  if (mercadoPagoSDK) return mercadoPagoSDK;

  const resposta = await fetch('/config');
  const config = await resposta.json();

  if (!config.publicKey) {
    throw new Error('Public Key não configurada no servidor.');
  }

  mercadoPagoSDK = new MercadoPago(config.publicKey);
  return mercadoPagoSDK;
}

// ---------- Página do carrinho: finalizar compra com Mercado Pago ----------
function initFinalizarCompra() {
  const botao = document.getElementById('finalizar-compra');
  if (!botao) return;

  const status = document.getElementById('pagamento-status');
  const walletContainer = document.getElementById('walletBrick_container');

  botao.addEventListener('click', async function () {
    const carrinho = getCarrinho();

    if (carrinho.length === 0) {
      status.textContent = 'Seu carrinho está vazio.';
      status.style.color = 'var(--color-tomato-dark)';
      return;
    }

    status.textContent = 'Criando pagamento...';
    status.style.color = 'var(--color-ink-soft)';
    if (walletContainer) walletContainer.innerHTML = '';

    try {
      const produtos = carrinho.map(function (item) {
        return { nome: item.nome, preco: item.preco, quantidade: item.qtd };
      });

      const resposta = await fetch('/criar-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produtos: produtos })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || 'Não foi possível criar o pagamento.');
      }

      const mp = await iniciarMercadoPago();
      const bricksBuilder = mp.bricks();

      await bricksBuilder.create('wallet', 'walletBrick_container', {
        initialization: { preferenceId: dados.id }
      });

      status.textContent = 'Pagamento criado! Clique no botão do Mercado Pago abaixo para pagar.';
      status.style.color = 'var(--color-basil)';

    } catch (erro) {
      console.error('Erro ao criar pagamento:', erro);
      status.textContent = 'Não foi possível iniciar o pagamento. Tente novamente.';
      status.style.color = 'var(--color-tomato-dark)';
    }
  });
}

// ---------- Funções auxiliares de validação ----------
function validarCampoTexto(campo, idErro, minimoCaracteres) {
  const erro = document.getElementById(idErro);
  const valor = campo.value.trim();

  if (valor.length < minimoCaracteres) {
    erro.classList.add('show');
    campo.style.borderColor = 'var(--color-tomato)';
    return false;
  }

  erro.classList.remove('show');
  campo.style.borderColor = 'var(--color-line)';
  return true;
}

function validarEmail(campo, idErro) {
  const erro = document.getElementById(idErro);
  const padrao = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!padrao.test(campo.value.trim())) {
    erro.classList.add('show');
    campo.style.borderColor = 'var(--color-tomato)';
    return false;
  }

  erro.classList.remove('show');
  campo.style.borderColor = 'var(--color-line)';
  return true;
}

function mostrarMensagem(caixa, texto, tipo) {
  if (!caixa) return;
  caixa.textContent = texto;
  caixa.className = 'form-message show ' + tipo;
}

// ---------- Inicialização ----------
document.addEventListener('DOMContentLoaded', function () {
  atualizarBadgeCarrinho();
  initBotoesDeCard();
  initContatoForm();
  initLoginForm();
  initFinalizarCompra();
  renderizarCarrinho();
  renderizarFavoritos();
});
