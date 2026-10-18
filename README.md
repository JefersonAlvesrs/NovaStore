# NovaStore — E-commerce demonstrativo | Frontend

Projeto de portfólio desenvolvido com **HTML5, CSS3 e JavaScript**, simulando a experiência de uma loja virtual de tecnologia. Conta com **23 páginas HTML** e catálogo de **48 produtos baseados em modelos comerciais reais**.

> **Projeto fictício e educacional.** Não é uma loja real. Preços, descontos, estoque, avaliações, contas e pedidos são demonstrativos. Nenhuma compra ou pagamento é processado. Não há vínculo comercial com as marcas citadas.

## Tecnologias

- HTML5 semântico
- CSS3, layout responsivo e media queries
- JavaScript (DOM, eventos, filtros e navegação)
- `localStorage` para persistência de carrinho, favoritos, comparação, contas demonstrativas e histórico de pedidos
- Arquivos de imagem locais (SVG e JPG)

## Funcionalidades

- **Catálogo:** 48 produtos organizados por categorias, com ofertas e lançamentos.
- **Busca e filtros:** pesquisa por nome, marca, categoria, características e sinônimos comuns, como `notebook`, `celular`, `fone` e `monitor`. Busca parcial disponível; `notebook` e `laptop` priorizam a categoria correspondente.
- **Preço máximo:** campo com máscara monetária brasileira (`R$ 5.600,00`); os dois últimos dígitos digitados representam centavos.
- **Produto:** página de detalhes com galeria interativa, descrição, ficha técnica, avaliação fictícia e produtos relacionados.
- **Carrinho:** inclusão e remoção de itens, alteração de quantidades, subtotal e limite baseado no estoque simulado.
- **Favoritos e comparação:** seleção de produtos, com comparação em tabela no desktop e cartões no celular.
- **Conta demonstrativa:** cadastro e login locais, sem autenticação real.
- **Checkout fictício:** preenchimento demonstrativo, confirmação e histórico de pedidos com detalhes expansíveis.
- **Responsividade:** ajustes para desktop, tablet e celular, incluindo carrinho empilhado e comparação adaptada.

## Como executar

1. Baixe ou clone este repositório.
2. Abra o arquivo `index.html` no navegador.
3. Navegue pelas páginas e teste as funcionalidades.

Não requer instalação, banco de dados ou backend. É possível também servir a pasta com um servidor estático, como a extensão Live Server do VS Code.

## Organização do projeto

```text
NovaStore/
├── index.html
├── produtos.html
├── produto.html
├── carrinho.html
├── comparar.html
├── favoritos.html
├── checkout.html
├── pedidos.html
├── ... demais páginas HTML
├── assets/
│   ├── css/
│   ├── js/
│   └── img/products/
├── CREDITOS_IMAGENS.md
├── GUIA_IMAGENS.md
└── README.md
```

## Imagens e atribuições

O **Samsung Galaxy S24 Ultra** possui duas fotografias reais fornecidas para o projeto. **Os outros 47 produtos utilizam ilustrações SVG genéricas**, que representam o tipo de item e **não** devem ser confundidas com fotos oficiais dos modelos. As imagens ilustrativas não mostram necessariamente características físicas exatas.

**Antes de publicar ou redistribuir as fotografias do Galaxy S24 Ultra, é necessário confirmar autoria, licença e condições de atribuição.** Consulte `CREDITOS_IMAGENS.md` e `GUIA_IMAGENS.md`. Caso não seja possível confirmar a permissão, substitua as fotos por imagens com uso autorizado.

Para substituir ilustrações, adicione os arquivos autorizados em `assets/img/products/` e atualize as referências correspondentes em `assets/js/products.js`.

## Segurança e limitações

- Aplicação **somente frontend**, sem servidor, pagamentos, transações ou autenticação segura.
- Os dados demonstrativos são armazenados no navegador por meio de `localStorage`.
- **Não utilize senhas verdadeiras ou informações pessoais reais.** O cadastro demonstrativo não é adequado para produção.
- Estoque, preços, notas, especificações resumidas e pedidos não devem ser tratados como dados comerciais atualizados.
- As especificações dos produtos precisam ser validadas nos sites dos fabricantes antes de qualquer uso comercial.

## Testes recomendados

- Busca por termos completos e parciais, categorias e marcas.
- Máscara e limite do preço máximo.
- Carrinho, alteração de quantidade e limites de estoque.
- Favoritos, comparação, login demonstrativo e checkout.
- Confirmação e detalhamento de pedidos.
- Layout em larguras de **375 px, 768 px e desktop**.

Os fluxos principais foram testados manualmente durante o desenvolvimento; isso **não substitui uma suíte automatizada de testes**.

## Objetivo

Demonstrar organização de código, interfaces responsivas, manipulação do DOM, gerenciamento de estado no navegador e construção de uma experiência completa de e-commerce **sem backend**.
