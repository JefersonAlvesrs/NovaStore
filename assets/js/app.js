(() => {
  "use strict";
  const P = window.NOVA_PRODUCTS || [];
  const money = (n) =>
    Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const get = (k, d) => {
    try {
      return JSON.parse(localStorage.getItem("nova_" + k)) ?? d;
    } catch {
      return d;
    }
  };
  const set = (k, v) => localStorage.setItem("nova_" + k, JSON.stringify(v));
  const page = document.body.dataset.page;
  const main = document.querySelector("#app");
  let cart = get("cart", []);
  let favs = get("favorites", []);
  let compare = get("compare", []);
  const byId = (id) => P.find((p) => p.id === Number(id));
  const qs = new URLSearchParams(location.search);
  const link = (p) => "produto.html?id=" + p.id;
  const toast = (msg) => {
    document.querySelector(".toast")?.remove();
    let e = document.createElement("div");
    e.className = "toast";
    e.setAttribute("role", "status");
    e.textContent = msg;
    document.body.append(e);
    setTimeout(() => e.remove(), 2600);
  };
  const head = (title, sub = "") =>
    `<div class="page-head"><div class="breadcrumbs"><a href="index.html">Início</a> / ${title}</div><h1>${title}</h1>${sub ? `<p class="muted">${sub}</p>` : ""}</div>`;
  const empty = (emoji, title, desc, href = "produtos.html") =>
    `<div class="empty"><div class="symbol">${emoji}</div><h2>${title}</h2><p class="muted">${desc}</p><a class="btn" href="${href}">Explorar produtos →</a></div>`;
  function card(p) {
    let discount = Math.round((1 - p.price / p.oldPrice) * 100);
    return `<article class="product-card"><div class="product-art"><span class="discount">-${discount}%</span><a href="${link(p)}" aria-label="Ver ${p.name}" style="font-size:inherit">${photo(p)}</a><button class="favbtn" data-action="fav" data-id="${p.id}" title="Favoritar" aria-label="Favoritar ${p.name}">${favs.includes(p.id) ? "♥" : "♡"}</button></div><div class="product-body"><span class="rating">★★★★★ ${p.rating.toFixed(1)} <span class="muted">· ${p.category} · nota fictícia</span></span><h3><a href="${link(p)}">${p.name}</a></h3><div class="old">${money(p.oldPrice)}</div><div class="price">${money(p.price)}</div><div class="stock-note">● Em estoque (simulado)</div><div class="small muted">ou 10x de ${money(p.price / 10)} sem juros* · Simulação</div><div class="small muted">${p.imageVerified ? "Foto real" : "Imagem ilustrativa"} · ${p.brand}</div><div class="card-actions"><button class="btn" data-action="add" data-id="${p.id}">Adicionar 🛒</button><button class="mini-btn" data-action="compare" data-id="${p.id}" title="Comparar">⇄</button></div></div></article>`;
  }
  const photo = (p, cls = "", src = p.image) =>
    `<img class="product-photo ${cls}" src="${src}" alt="${p.imageVerified ? `Fotografia real de ${p.name}` : `Ilustração genérica da categoria ${p.category}; não é foto oficial de ${p.name}`}" loading="lazy" decoding="async" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><span class="photo-fallback" style="display:none">${p.emoji}</span>`;
  const brandOptions = [...new Set(P.map((p) => p.brand))].sort();
  const grid = (arr) =>
    arr.length
      ? `<div class="product-grid">${arr.map(card).join("")}</div>`
      : empty("🔎", "Nenhum produto encontrado", "Tente mudar os filtros.");
  const section = (title, arr, url = "produtos.html") =>
    `<section class="section"><div class="section-title"><h2>${title}</h2><a href="${url}" class="muted">Ver todos →</a></div>${grid(arr)}</section>`;
  function updateCounters() {
    document.querySelector("#cart-count").textContent = cart.reduce(
      (a, b) => a + b.qty,
      0,
    );
    document.querySelector("#fav-count").textContent = favs.length;
    document.querySelector("#compare-count").textContent = compare.length;
  }
  function save() {
    set("cart", cart);
    set("favorites", favs);
    set("compare", compare);
    updateCounters();
  }
  // Normaliza acentos e separadores para buscas por nome, tipo e categoria.
  const normalizeSearch = (value) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  const categoryAliases = {
    Smartphones:
      "smartphone smartphones celular celulares telefone telefones mobile iphone android",
    Notebooks:
      "notebook notebooks laptop laptops computador computadores portatil portateis macbook",
    Áudio:
      "audio som fone fones headphone headphones headset headsets caixa caixas bluetooth",
    Games:
      "game games gamer gamers videogame videogames console consoles controle controles jogo jogos",
    Acessórios:
      "acessorio acessorios periferico perifericos carregador carregadores cabo cabos adaptador adaptadores hub monitor monitores teclado teclados mouse mice webcam camera cameras",
  };
  const matchesProductSearch = (product, query) => {
    const terms = normalizeSearch(query).split(" ").filter(Boolean);
    if (!terms.length) return true;
    const haystack = normalizeSearch(
      [
        product.name,
        product.brand,
        product.category,
        product.sku,
        product.description,
        ...(product.features || []),
        categoryAliases[product.category] || "",
      ].join(" "),
    );
    return terms.every(
      (term) =>
        haystack.includes(term) ||
        (term.endsWith("s") && haystack.includes(term.slice(0, -1))),
    );
  };
  // Converte um valor digitado no padrão brasileiro para centavos inteiros.
  const currencyCents = (text) => {
    const digits = String(text || "").replace(/\D/g, "");
    return digits ? Number(digits) : null;
  };
  const formatCurrencyInput = (input) => {
    const cents = currencyCents(input.value);
    input.value =
      cents === null
        ? ""
        : (cents / 100).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          });
  };
  function catalog(title, initial = P) {
    main.innerHTML =
      head(
        title,
        "Explore nossos produtos e encontre a melhor escolha para você.",
      ) +
      `<div class="layout"><aside class="panel filters"><h3>Filtrar produtos</h3><div><label for="filter-search">Buscar</label><input class="field" id="filter-search" placeholder="Produto, tipo ou categoria"></div><div><label for="filter-cat">Categoria</label><select class="field" id="filter-cat"><option value="">Todas</option>${[...new Set(P.map((p) => p.category))].map((c) => `<option>${c}</option>`).join("")}</select></div><div><label for="filter-brand">Marca</label><select class="field" id="filter-brand"><option value="">Todas</option>${brandOptions.map((b) => `<option>${b}</option>`).join("")}</select></div><div><label for="filter-max">Preço máximo</label><input class="field" id="filter-max" type="text" inputmode="decimal" autocomplete="off" placeholder="R$ 0,00" aria-label="Preço máximo em reais"></div><button class="btn outline" id="clear-filters">Limpar filtros</button></aside><section><div class="toolbar"><span id="result-count"></span><select class="field" id="sort" style="max-width:210px"><option value="default">Relevância</option><option value="low">Menor preço</option><option value="high">Maior preço</option><option value="name">Nome A–Z</option><option value="discount">Maior desconto</option></select></div><div id="results"></div></section></div>`;
    let search = qs.get("busca") || "";
    document.querySelector("#filter-search").value = search;
    const cat = title.startsWith("Categoria:")
      ? title.replace("Categoria: ", "")
      : "";
    if (cat) document.querySelector("#filter-cat").value = cat;
    function render() {
      let s = document.querySelector("#filter-search").value;
      let c = document.querySelector("#filter-cat").value;
      let brand = document.querySelector("#filter-brand").value;
      let cents = currencyCents(document.querySelector("#filter-max").value);
      let max = cents === null ? Infinity : cents / 100;
      let sort = document.querySelector("#sort").value;
      let a = initial.filter(
        (p) =>
          (!c || p.category === c) &&
          (!brand || p.brand === brand) &&
          matchesProductSearch(p, s) &&
          p.price <= max,
      );
      if (
        s &&
        ["notebook", "notebooks", "laptop", "laptops"].includes(
          normalizeSearch(s),
        )
      )
        a.sort(
          (x, y) =>
            Number(y.category === "Notebooks") -
            Number(x.category === "Notebooks"),
        );
      if (sort === "low") a.sort((a, b) => a.price - b.price);
      if (sort === "high") a.sort((a, b) => b.price - a.price);
      if (sort === "name") a.sort((a, b) => a.name.localeCompare(b.name));
      if (sort === "discount")
        a.sort((a, b) => 1 - b.price / b.oldPrice - (1 - a.price / a.oldPrice));
      document.querySelector("#result-count").textContent =
        a.length + " produto(s)";
      document.querySelector("#results").innerHTML = grid(a);
    }
    const maxPriceInput = document.getElementById("filter-max");
    maxPriceInput.addEventListener("input", () => {
      formatCurrencyInput(maxPriceInput);
      render();
    });
    ["filter-search", "filter-cat", "filter-brand", "sort"].forEach((id) =>
      document.getElementById(id).addEventListener("input", render),
    );
    document.querySelector("#clear-filters").onclick = () => {
      ["filter-search", "filter-max"].forEach(
        (id) => (document.getElementById(id).value = ""),
      );
      document.getElementById("filter-cat").value = "";
      document.getElementById("filter-brand").value = "";
      render();
    };
    render();
  }
  function detail() {
    let p = byId(qs.get("id")) || P[0];
    let related = P.filter(
      (x) => x.category === p.category && x.id !== p.id,
    ).slice(0, 4);
    main.innerHTML =
      head(p.category) +
      `<div class="detail-layout"><div class="detail-media"><div class="detail-stage" id="detail-stage">${photo(p, "detail-photo")}</div><div class="detail-thumbs">${(p.gallery || [p.image]).map((src, i) => `<button class="thumb ${i === 0 ? "active" : ""}" data-view="photo" data-src="${src}" aria-label="Imagem ${i + 1} de ${p.name}">${photo(p, "", src)}</button>`).join("")}<button class="thumb" data-view="info" aria-label="Informações do modelo">ℹ️<span>Dados</span></button></div><p class="muted small">${p.imageDisclaimer || "Imagem ilustrativa."}</p></div><div class="panel details"><span class="pill">● Estoque fictício: ${p.stock} unidades</span><p class="small muted">${p.brand} · Ref. ${p.sku}</p><h1>${p.name}</h1><p class="rating">★★★★★ ${p.rating.toFixed(1)} <span class="muted">· avaliação simulada</span></p><p class="old">${money(p.oldPrice)}</p><div class="price">${money(p.price)}</div><p class="muted">Até 10x de ${money(p.price / 10)} sem juros · simulação</p><p>${p.description}</p><div class="detail-benefits"><div>🚚 <b>Frete fictício</b><small>Checkout demonstrativo</small></div><div>🔒 <b>Sem pagamento</b><small>Não informe dados bancários</small></div><div>↩️ <b>Troca simulada</b><small>Política ilustrativa</small></div></div><div class="detail-actions"><button class="btn" data-action="add" data-id="${p.id}">Adicionar ao carrinho 🛒</button><button class="btn outline" data-action="fav" data-id="${p.id}">♡ Favoritar</button><button class="btn ghost" data-action="compare" data-id="${p.id}">⇄ Comparar</button></div></div></div><div class="detail-tabs"><button class="tab active" data-tab="desc">Descrição</button><button class="tab" data-tab="spec">Especificações</button><button class="tab" data-tab="reviews">Avaliações</button></div><section class="panel detail-tab-content" id="detail-tab-content"></section>${section("Produtos relacionados", related)}`;
    const tabContent = document.querySelector("#detail-tab-content");
    const content = {
      desc: `<h2>Sobre ${p.name}</h2><p>${p.description}</p><h3>Destaques</h3><ul>${p.features.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>`,
      spec: `<h2>Ficha técnica do catálogo</h2><div class="spec-table">${Object.entries(
        p.specifications,
      )
        .map(
          ([k, v]) =>
            `<div><b>${escapeHtml(k)}</b><span>${escapeHtml(v)}</span></div>`,
        )
        .join(
          "",
        )}</div><p class="small muted">Ficha resumida para fins de demonstração. Confirme especificações na documentação do fabricante.</p>`,
      reviews: `<h2>Avaliações demonstrativas</h2><p class="rating">★★★★★ ${p.rating.toFixed(1)}</p><p>Esta nota é fictícia. Nenhuma avaliação de cliente real foi coletada.</p>`,
    };
    function showTab(k) {
      tabContent.innerHTML = content[k];
      document
        .querySelectorAll(".tab")
        .forEach((b) => b.classList.toggle("active", b.dataset.tab === k));
    }
    document
      .querySelectorAll(".tab")
      .forEach((b) => (b.onclick = () => showTab(b.dataset.tab)));
    showTab("desc");
    document.querySelectorAll(".thumb").forEach(
      (b) =>
        (b.onclick = () => {
          document
            .querySelectorAll(".thumb")
            .forEach((x) => x.classList.toggle("active", x === b));
          let stage = document.querySelector("#detail-stage");
          stage.classList.remove("zoom");
          stage.innerHTML =
            b.dataset.view === "info"
              ? `<div class="visual-info"><h3>${p.brand}</h3><p>${p.name}</p><p>${p.features.map(escapeHtml).join(" · ")}</p><small>Informações ilustrativas</small></div>`
              : photo(p, "detail-photo", b.dataset.src || p.image);
        }),
    );
  }
  function cartPage() {
    let lines = cart
      .filter((x) => byId(x.id))
      .map((x) => ({ ...byId(x.id), qty: x.qty }))
      .filter((x) => x.name);
    let total = lines.reduce((s, p) => s + p.price * p.qty, 0);
    main.innerHTML =
      head("Meu carrinho") +
      (lines.length
        ? `<div class="split" style="grid-template-columns:1.7fr 1fr"><div class="panel">${lines.map((p) => `<div class="cart-line"><div class="cart-art">${photo(p)}</div><div><a href="${link(p)}"><b>${p.name}</b></a><div class="muted small">${money(p.price)} cada</div><button class="mini-btn" data-action="remove" data-id="${p.id}">Remover</button></div><div><b>${money(p.price * p.qty)}</b><div class="qty"><button data-action="dec" data-id="${p.id}">−</button>${p.qty}<button data-action="inc" data-id="${p.id}">+</button></div></div></div>`).join("")}</div><div class="panel"><h2>Resumo do pedido</h2><div class="summary"><div class="summary-line"><span>Subtotal</span><b>${money(total)}</b></div><div class="summary-line"><span>Frete</span><span>Simulado</span></div><div class="summary-line total"><span>Total</span><span>${money(total)}</span></div></div><p class="small muted">Não existe cobrança real.</p><a class="btn" href="checkout.html" style="width:100%">Continuar para checkout →</a></div></div>`
        : empty(
            "🛒",
            "Seu carrinho está vazio",
            "Adicione alguns produtos para começar.",
          ));
  }
  function mobileCompareCards(products) {
    const fields = [
      ["Categoria", (p) => p.category],
      ["Preço", (p) => money(p.price)],
      ["Marca", (p) => p.brand],
      ["Destaques", (p) => p.features.join(" · ")],
      ["Avaliação ilustrativa", (p) => p.rating.toFixed(1)],
      ["Disponibilidade simulada", (p) => p.stock + " unidades"],
    ];
    return `<div class="compare-mobile">${products
      .map(
        (p) => `
    <article class="panel compare-mobile-card">
      <h2>${escapeHtml(p.name)}</h2>
      ${fields.map(([label, getValue]) => `<div class="compare-mobile-row"><b>${label}</b><span>${escapeHtml(String(getValue(p)))}</span></div>`).join("")}
      <div class="compare-mobile-actions">
        <button class="btn" data-action="add" data-id="${p.id}">Adicionar ao carrinho</button>
        <button class="mini-btn" data-action="compare" data-id="${p.id}">Remover</button>
      </div>
    </article>`,
      )
      .join("")}</div>`;
  }
  function listPage(type) {
    let ids = type === "favoritos" ? favs : compare;
    let arr = ids.map(byId).filter(Boolean);
    main.innerHTML =
      head(type === "favoritos" ? "Meus favoritos" : "Comparar produtos") +
      (type === "favoritos"
        ? grid(arr)
        : arr.length
          ? `${mobileCompareCards(arr)}<div class="panel tablewrap compare-desktop"><table><thead><tr><th>Característica</th>${arr.map((p) => `<th>${p.name}<br><button class="mini-btn" data-action="compare" data-id="${p.id}">Remover</button></th>`).join("")}</tr></thead><tbody>${[
              ["Categoria", (p) => p.category],
              ["Preço", (p) => money(p.price)],
              ["Marca", (p) => p.brand],
              ["Destaques", (p) => p.features.join(" · ")],
              ["Avaliação ilustrativa", (p) => p.rating],
              ["Disponibilidade simulada", (p) => p.stock + " unidades"],
              [
                "Comprar",
                (p) =>
                  `<button class="btn" data-action="add" data-id="${p.id}">Adicionar</button>`,
              ],
            ]
              .map(
                ([name, fn]) =>
                  `<tr><td>${name}</td>${arr.map((p) => `<td>${fn(p)}</td>`).join("")}</tr>`,
              )
              .join("")}</tbody></table></div>`
          : empty(
              "⇄",
              "Nenhum item para comparar",
              "Selecione até 4 produtos para comparar.",
            ));
  }
  const field = (name, id, type = "text", required = true) =>
    `<div><label for="${id}">${name}</label><input class="field" id="${id}" name="${id}" type="${type}" ${required ? "required" : ""}></div>`;
  function auth(type) {
    let login = type === "login";
    main.innerHTML = `<div class="auth"><h1>${login ? "Entrar na conta" : "Criar conta"}</h1><div class="panel"><div class="notice">Área demonstrativa: os dados são salvos apenas neste navegador. Não use senhas reais: este protótipo guarda credenciais localmente sem proteção de servidor.</div><form id="auth-form" class="form-grid">${login ? "" : field("Nome", "name")}${field("E-mail", "email", "email")}${field("Senha (mín. 6 caracteres)", "password", "password")}<div class="full"><button class="btn" style="width:100%">${login ? "Entrar" : "Cadastrar"}</button></div></form><p>${login ? 'Ainda não tem conta? <a href="cadastro.html">Cadastre-se</a>' : 'Já tem conta? <a href="login.html">Entrar</a>'}</p></div></div>`;
    document.querySelector("#auth-form").onsubmit = (e) => {
      e.preventDefault();
      let email = document.querySelector("#email").value.trim();
      let password = document.querySelector("#password").value;
      if (password.length < 6) return toast("Use pelo menos 6 caracteres.");
      let users = get("users", []);
      if (login) {
        let u = users.find((x) => x.email === email && x.password === password);
        if (!u) return toast("Credenciais de demonstração não encontradas.");
        set("session", { name: u.name, email: u.email });
      } else {
        if (users.some((x) => x.email === email))
          return toast("E-mail já cadastrado neste navegador.");
        let name = document.querySelector("#name").value.trim();
        users.push({ name, email, password });
        set("users", users);
        set("session", { name, email });
      }
      location.href = "minha-conta.html";
    };
  }
  function checkout() {
    let lines = cart
      .filter((x) => byId(x.id))
      .map((x) => ({ ...byId(x.id), qty: x.qty }))
      .filter((x) => x.name);
    let total = lines.reduce((s, p) => s + p.price * p.qty, 0);
    if (!lines.length) {
      main.innerHTML =
        head("Finalizar pedido") +
        empty(
          "🛒",
          "Seu carrinho está vazio",
          "Adicione produtos antes de finalizar.",
        );
      return;
    }
    main.innerHTML =
      head("Finalizar pedido") +
      `<div class="notice">Checkout de demonstração. Não informe dados reais de pagamento. Nenhuma compra será processada.</div><div class="split" style="grid-template-columns:1.6fr 1fr"><div class="panel"><form id="checkout-form"><h2>Dados para entrega fictícia</h2><div class="form-grid">${field("Nome completo", "name")}${field("E-mail", "email", "email")}${field("CEP fictício", "cep")}${field("Cidade", "city")}${field("Endereço fictício", "address")}${field("Número", "number")}<div class="full"><label>Forma de pagamento (simulada)</label><select class="field" required><option>PIX simulado</option><option>Cartão simulado</option><option>Boleto simulado</option></select></div><div class="full"><button class="btn" style="width:100%">Confirmar pedido fictício</button></div></div></form></div><div class="panel"><h2>Resumo</h2>${lines.map((p) => `<div class="summary-line"><span>${p.qty}x ${p.name}</span><b>${money(p.price * p.qty)}</b></div>`).join("")}<div class="summary-line total"><span>Total</span><span>${money(total)}</span></div></div></div>`;
    document.querySelector("#checkout-form").onsubmit = (e) => {
      e.preventDefault();
      let order = {
        id: "NV-" + Date.now().toString().slice(-8),
        date: new Date().toLocaleDateString("pt-BR"),
        items: lines.map((p) => ({ id: p.id, qty: p.qty, price: p.price })),
        total,
      };
      let orders = get("orders", []);
      orders.unshift(order);
      set("orders", orders);
      set("lastOrder", order);
      cart = [];
      save();
      location.href = "pedido-confirmado.html";
    };
  }
  function orders() {
    let arr = get("orders", []);
    main.innerHTML =
      head(
        "Meus pedidos",
        "Histórico local de pedidos fictícios neste navegador.",
      ) +
      (arr.length
        ? `<div class="orders-list">${arr
            .map(
              (o, i) =>
                `<details class="order-card panel"><summary><span class="order-heading"><b>📦 ${escapeHtml(o.id)}</b><small>${escapeHtml(o.date)} · ${o.items.reduce((a, b) => a + Number(b.qty || 0), 0)} item(ns) · Simulação</small></span><strong>${money(o.total)}</strong><span class="order-hint">Ver detalhes ▾</span></summary><div class="order-items">${o.items
                  .map((item) => {
                    let p = byId(item.id);
                    return `<div class="order-item"><span>${p ? `<a href="${link(p)}">${escapeHtml(p.name)}</a>` : "Produto removido do catálogo"}<small>${Number(item.qty)} unidade(s) × ${money(item.price)}</small></span><b>${money(Number(item.qty) * Number(item.price))}</b></div>`;
                  })
                  .join(
                    "",
                  )}<div class="order-total"><b>Total demonstrativo</b><strong>${money(o.total)}</strong></div></div></details>`,
            )
            .join("")}</div>`
        : empty(
            "📦",
            "Nenhum pedido ainda",
            "Finalize uma compra simulada para aparecer aqui.",
          ));
  }
  function account() {
    let s = get("session", null);
    main.innerHTML =
      head("Minha conta") +
      (s
        ? `<div class="panel"><h2>Olá, ${escapeHtml(s.name)}!</h2><p>${escapeHtml(s.email)}</p><p>Esta é uma conta local de demonstração.</p><a class="btn" href="pedidos.html">Ver pedidos</a> <button class="btn outline" id="logout">Sair</button></div>`
        : `<div class="panel"><h2>Bem-vindo!</h2><p>Faça login ou crie uma conta demonstrativa.</p><a class="btn" href="login.html">Entrar</a> <a class="btn outline" href="cadastro.html">Criar conta</a></div>`);
    if (s)
      document.querySelector("#logout").onclick = () => {
        localStorage.removeItem("nova_session");
        location.reload();
      };
  }
  function escapeHtml(s) {
    return String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }
  function staticPage() {
    let content = {
      sobre: `<h2>Tecnologia, praticidade e uma experiência simples</h2><p>A NovaStore é um projeto fictício de e-commerce criado para demonstrar desenvolvimento frontend, interfaces responsivas e funcionalidades interativas com JavaScript.</p><p>Os modelos são referências a produtos reais; preços, estoques e avaliações são ilustrativos. Não há vendas ou empresa real associada.</p>`,
      faq: `<h2>Dúvidas frequentes</h2>${[
        [
          "A NovaStore vende produtos reais?",
          "Não. Este site é um projeto demonstrativo de portfólio.",
        ],
        [
          "Os pagamentos são reais?",
          "Não. O checkout é totalmente simulado e não solicita dados bancários.",
        ],
        [
          "Onde meus dados ficam armazenados?",
          "Os dados da demonstração são salvos no localStorage deste navegador.",
        ],
        [
          "Posso comparar produtos?",
          "Sim. Você pode comparar até quatro produtos por vez.",
        ],
        [
          "Posso salvar favoritos?",
          "Sim. Seus favoritos permanecem neste navegador até você limpar os dados.",
        ],
      ]
        .map(
          (x) => `<details><summary>${x[0]}</summary><p>${x[1]}</p></details>`,
        )
        .join("")}`,
      politica: `<h2>Privacidade</h2><p>Este projeto demonstrativo não envia dados para um servidor próprio. Carrinho, favoritos, contas fictícias e pedidos simulados são mantidos localmente no navegador via localStorage.</p><p>Não insira informações sensíveis ou senhas que utiliza em outros serviços. Para limpar os dados, utilize as configurações do navegador.</p><h2>Termos de uso</h2><p>Este site existe exclusivamente para fins educacionais e de portfólio. Produtos, valores, descontos, estoques, entregas e avaliações são fictícios. Não são realizadas vendas ou transações financeiras.</p>`,
    };
    main.innerHTML =
      head(document.title.split(" | ")[0]) +
      `<div class="panel">${content[page]}</div>`;
  }
  function contact() {
    main.innerHTML =
      head("Contato", "Envie uma mensagem fictícia para testar o formulário.") +
      `<div class="split"><div class="panel"><form id="contact-form" class="form-grid">${field("Nome", "name")}${field("E-mail", "email", "email")}<div class="full"><label>Assunto</label><select class="field"><option>Dúvidas</option><option>Sugestões</option><option>Outros</option></select></div><div class="full"><label>Mensagem</label><textarea class="field" rows="6" required></textarea></div><div class="full"><button class="btn">Enviar mensagem simulada</button></div></form></div><div class="panel"><h2>Central de ajuda</h2><p>Este site não possui atendimento real.</p><p>Para saber mais sobre o projeto, acesse a página Sobre ou o repositório do desenvolvedor.</p><a href="faq.html" class="btn outline">Ver perguntas frequentes</a></div></div>`;
    document.querySelector("#contact-form").onsubmit = (e) => {
      e.preventDefault();
      e.target.reset();
      toast("Mensagem simulada! Nenhum e-mail foi enviado.");
    };
  }
  function home() {
    main.innerHTML = `<section class="hero"><div><span class="eyebrow">Nova geração de tecnologia</span><h1>Seu próximo upgrade começa aqui.</h1><p>Explore smartphones, notebooks, acessórios e muito mais em uma experiência de loja completa.</p><a class="btn light" href="produtos.html">Explorar catálogo →</a></div><div class="hero-art hero-products"><img src="${P[4].image}" alt="Ilustração de notebook em destaque" onerror="this.style.display='none'"></div></section><div class="tagline"><div>🚚 <b>Entrega demonstrativa</b><br><span class="small muted">Simule seu pedido</span></div><div>🔒 <b>Checkout fictício</b><br><span class="small muted">Sem pagamentos reais</span></div><div>💜 <b>Favoritos e comparação</b><br><span class="small muted">Salvos no navegador</span></div></div><section class="promo-strip"><a href="categoria-smartphones.html" class="promo-tile"><span>SMARTPHONES</span><h3>Tecnologia na palma da mão</h3><small>Explorar modelos →</small></a><a href="categoria-gamers.html" class="promo-tile secondary"><span>GAMES & ACESSÓRIOS</span><h3>Seu setup, seu estilo</h3><small>Conhecer produtos →</small></a></section><section class="section"><div class="section-title"><h2>Encontre por categoria</h2></div><div class="category-grid">${[
      ["Smartphones", "📱", "categoria-smartphones.html"],
      ["Notebooks", "💻", "categoria-notebooks.html"],
      ["Áudio", "🎧", "categoria-audio.html"],
      ["Games", "🎮", "categoria-gamers.html"],
      ["Acessórios", "⌚", "categoria-acessorios.html"],
    ]
      .map(
        (x) =>
          `<a class="category" href="${x[2]}"><span>${x[1]}</span>${x[0]}</a>`,
      )
      .join(
        "",
      )}</div></section>${section("Destaques da semana", P.slice(0, 8))}<section class="section banner"><div><h2>Ofertas para dar aquele upgrade</h2><p>Confira os produtos com descontos ilustrativos.</p></div><a class="btn" href="ofertas.html">Ver ofertas →</a></section>${section("Novidades da NovaStore", P.filter((p) => p.new).slice(0, 4), "lancamentos.html")}`;
  }
  document.addEventListener("click", (e) => {
    let b = e.target.closest("[data-action]");
    if (!b) return;
    let id = Number(b.dataset.id);
    let action = b.dataset.action;
    if (action === "add") {
      let item = cart.find((x) => x.id === id);
      if (!byId(id)) return;
      if (item && item.qty >= byId(id).stock)
        return toast("Limite de estoque demonstrativo atingido.");
      if (item) item.qty++;
      else cart.push({ id, qty: 1 });
      toast("Produto adicionado ao carrinho!");
    }
    if (action === "fav") {
      favs = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
      toast(
        favs.includes(id)
          ? "Adicionado aos favoritos!"
          : "Removido dos favoritos.",
      );
    }
    if (action === "compare") {
      if (compare.includes(id)) compare = compare.filter((x) => x !== id);
      else if (compare.length >= 4)
        return toast("Compare no máximo 4 produtos.");
      else compare.push(id);
      toast("Lista de comparação atualizada.");
    }
    if (action === "remove") cart = cart.filter((x) => x.id !== id);
    if (action === "inc" || action === "dec") {
      let item = cart.find((x) => x.id === id);
      if (item) {
        if (action === "inc" && item.qty >= byId(id).stock)
          return toast("Limite de estoque demonstrativo atingido.");
        item.qty += action === "inc" ? 1 : -1;
        if (item.qty <= 0) cart = cart.filter((x) => x.id !== id);
      }
    }
    save();
    if (["carrinho", "favoritos", "comparar"].includes(page)) {
      if (page === "carrinho") cartPage();
      else listPage(page);
    } else if (action === "fav") {
      b.textContent = favs.includes(id) ? "♥" : "♡";
    }
  });
  const routes = {
    index: home,
    produtos: () => catalog("Todos os produtos"),
    ofertas: () =>
      catalog(
        "Ofertas",
        P.filter((p) => p.oldPrice > p.price),
      ),
    lancamentos: () =>
      catalog(
        "Lançamentos",
        P.filter((p) => p.new),
      ),
    "categoria-smartphones": () => catalog("Categoria: Smartphones"),
    "categoria-notebooks": () => catalog("Categoria: Notebooks"),
    "categoria-audio": () => catalog("Categoria: Áudio"),
    "categoria-gamers": () => catalog("Categoria: Games"),
    "categoria-acessorios": () => catalog("Categoria: Acessórios"),
    produto: detail,
    carrinho: cartPage,
    favoritos: () => listPage("favoritos"),
    comparar: () => listPage("comparar"),
    checkout: checkout,
    "pedido-confirmado": () => {
      let o = get("lastOrder", null);
      main.innerHTML =
        head("Pedido confirmado") +
        `<div class="empty"><div class="symbol">🎉</div><h2>Pedido fictício registrado!</h2><p>${o ? "Número " + o.id : "Nenhum pedido recente encontrado."}</p><p class="muted">Nenhuma compra real foi efetuada.</p><a class="btn" href="pedidos.html">Ver pedidos</a></div>`;
    },
    login: () => auth("login"),
    cadastro: () => auth("cadastro"),
    "minha-conta": account,
    pedidos: orders,
    contato: contact,
    sobre: staticPage,
    faq: staticPage,
    politica: staticPage,
  };
  routes[page]?.();
  updateCounters();
  document.querySelector("#global-search").onsubmit = (e) => {
    e.preventDefault();
    location.href =
      "produtos.html?busca=" +
      encodeURIComponent(document.querySelector("#search-input").value.trim());
  };
})();
