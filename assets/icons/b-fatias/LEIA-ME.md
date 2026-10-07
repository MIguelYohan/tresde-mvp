# Kit B — Fatias

Símbolo arredondado da água-viva, sem texto. A versão principal conserva a geometria revisada.

## Arquivos
- `svg/`: símbolo colorido, vinho, terracota, preto, branco e desenho para tamanhos pequenos.
- `png/`: versões com fundo transparente em 256, 512 e 1024 px.
- `favicon/`: ICO com imagens próprias de 16/32/48 px, SVG e PNG. O padrão tem apoio branco; há SVG transparente alternativo.
- `app/`: ícone quadrado opaco em SVG e PNG (192/512/1024 px), Apple Touch 180 px e versão maskable 512 px.
- `head-snippet.html`: exemplo de inclusão dos ícones no site.

## Uso
Use o SVG colorido em fundos brancos ou claros. Em fundos escuros, use a versão branca. As versões vinho, terracota e preta servem para reprodução em uma tinta. Os PNGs brancos são transparentes e aparecem sobre fundos escuros.

Para 16–32 px, use o desenho `simbolo-pequeno.svg` ou o favicon exportado. Na B, os pequenos fragmentos dos tentáculos foram unidos para não desaparecerem na redução. O ícone de aplicativo usa o desenho principal e fundo branco opaco. A versão maskable tem margem adicional para cortes circulares e outros formatos. Aplique os recortes de plataforma ao fundo; não recorte o símbolo.

O arquivo vetorial principal tem prancheta de 256 × 256 unidades e margem interna mínima próxima de 32 unidades. Preserve essa margem, aproximadamente a altura de uma camada larga da cúpula. Para o símbolo principal, adote 32 px como mínimo digital; abaixo disso use o desenho pequeno. Em impressão, comece com 10 mm e confira uma prova no material escolhido.

## Cores
| Cor | HEX | RGB |
|---|---|---|
| Vinho | #8C2620 | 140, 38, 32 |
| Terracota | #8C3920 | 140, 57, 32 |
| Preto técnico | #000000 | 0, 0, 0 |
| Branco / versão reversa e fundo | #FFFFFF | 255, 255, 255 |

Os valores mestres são sRGB. Para impressão, faça a conversão com o perfil ICC da gráfica; equivalência Pantone não foi definida.

Não estique, rotacione, adicione contornos, sombras ou gradientes. Os SVGs contêm formas preenchidas, sem fontes, imagens incorporadas ou efeitos.
