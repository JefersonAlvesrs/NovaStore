# Plano de fotografias reais — NovaStore

Os 48 produtos estão cadastrados com nomes de modelos reais, mas **nenhuma foto de fabricante foi incorporada nesta entrega**. As imagens atuais são ilustrações SVG locais e continuam explicitamente identificadas como tal.

## Como substituir com segurança

1. Identifique o **SKU/modelo exato**, inclusive cor e configuração quando aplicável.
2. Localize uma foto do modelo correspondente em site do fabricante ou repositório com licença de reutilização.
3. Verifique e registre autorização/licença, URL original, autor e exigências de atribuição. A mera disponibilidade pública da imagem não autoriza redistribuição.
4. Salve uma cópia otimizada em `assets/img/products/`, com nome único por SKU e variante.
5. Em `assets/js/products.js`, atualize `image`, `gallery`, `imageVerified`, `imageDisclaimer`, `imageSource` e `imageLicense`.
6. Confirme manualmente se cada foto corresponde ao produto, e teste a galeria sem conexão.

Evite imagens de bancos de fotos genéricas, URLs temporárias e fotos de produtos parecidos.
