# Cinzas — Ascensão do Submundo

Jogo de ação roguelite em HTML, CSS e JavaScript, com três classes, dez armas e uma campanha de 11 temáticas. Os gráficos são desenhados em Canvas e os efeitos sonoros são gerados no navegador.

## Jogar

Baixe os arquivos do repositório e abra **index.html** em um navegador moderno. O jogo funciona offline e não precisa de instalação, servidor ou dependências para jogar.

## O que há no jogo

- Guerreiro, Arqueiro e Mago, com armas e especiais próprios.
- 55 níveis de duas ondas, organizados em 11 temáticas, cada uma seguida de seu chefe.
- Baú após cada chefe: escolha um entre três itens. O baú desaparece após a escolha.
- Somente três equipamentos em uso: armadura, anel e amuleto. Escolher um novo item equipa imediatamente e destrói o anterior do mesmo tipo. Não há mochila ou armazenamento.
- Equipamentos permanecem entre fases e desaparecem ao morrer ou concluir a campanha. Itens no chão podem ser examinados com E antes de escolher ou dispensar.
- Salvamento independente para Guerreiro, Arqueiro e Mago. Cada chefe derrotado confirma cinco níveis; fases intermediárias não gravam avanço. A classe retoma na próxima temática confirmada.
- Seis especializações, 18 talentos, maestria e melhorias permanentes com cinzas.
- Pactos opcionais com o Peregrino, altares e passagens para salas secretas.
- Controles por teclado e mouse ou tela de toque.

O progresso fica salvo no navegador utilizado. Recarregar retoma o último chefe confirmado, incluindo os equipamentos escolhidos naquele ponto. Morrer mantém as temáticas liberadas, mas remove os equipamentos da tentativa.

## Controles

| Ação | Controle |
| --- | --- |
| Mover | WASD ou setas |
| Mirar | Mouse |
| Ataque básico | Clique esquerdo ou J |
| Esquiva | Espaço ou Shift |
| Especial da arma | Q ou K |
| Magia / interagir com baú, portal ou evento | E, clique direito ou L |
| Ver equipamentos em uso | I |
| Talentos | T |
| Habilidade de talento | F, quando aprendida |
| Pausa | Esc ou P |
| Ajuda | H |
| Som | M |
| Escolher recompensa | 1, 2 ou 3 |

No celular, use o direcional e os botões na tela. Consulte [LEIA-ME.txt](LEIA-ME.txt) para conhecer os pactos, as salas secretas e as regras completas.

## Desenvolvimento e testes

O jogo inteiro está em `index.html`. As dependências abaixo são necessárias apenas para executar os testes automatizados.

Com Node.js 20 ou superior:

```sh
npm install
npm test
```

No Windows, os testes usam o Microsoft Edge instalado. Nos demais sistemas, instale primeiro o Chromium do Playwright:

```sh
npx playwright install chromium
npm test
```

Para verificar somente os controles e as telas de celular:

```sh
npm run test:mobile
```

A suíte verifica a campanha completa, chefes, baús, substituição direta dos equipamentos, checkpoints por classe, classes, armas, pactos, custos dos altares e entrada e saída das salas secretas.
