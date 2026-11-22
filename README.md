# Cinzas — Ascensão do Submundo

Jogo de ação roguelite em HTML, CSS e JavaScript, com três classes, dez armas e uma campanha de 11 temáticas. Os gráficos são desenhados em Canvas e os efeitos sonoros são gerados no navegador.

## Jogar

Baixe os arquivos do repositório e abra **index.html** em um navegador moderno. O jogo funciona offline e não precisa de instalação, servidor ou dependências para jogar.

## O que há no jogo

- Guerreiro, Arqueiro e Mago, com armas e especiais próprios.
- 55 níveis de duas ondas, organizados em 11 temáticas, cada uma seguida de seu chefe.
- Baú após cada chefe: escolha um entre três itens. O baú desaparece após a escolha.
- Armaduras, anéis e amuletos que permanecem entre níveis e temáticas. O inventário zera ao morrer ou concluir a campanha pelo portal final.
- Troca de equipamentos, comparação de atributos e efeitos especiais, sem venda de itens.
- Seis especializações, 18 talentos, maestria e melhorias permanentes com cinzas.
- Pactos opcionais com o Peregrino, altares e passagens para salas secretas.
- Controles por teclado e mouse ou tela de toque.

O progresso permanente fica salvo no navegador utilizado.

## Controles

| Ação | Controle |
| --- | --- |
| Mover | WASD ou setas |
| Mirar | Mouse |
| Ataque básico | Clique esquerdo ou J |
| Esquiva | Espaço ou Shift |
| Especial da arma | Q ou K |
| Magia / interagir com baú, portal ou evento | E, clique direito ou L |
| Inventário | I |
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

A suíte verifica a campanha completa, chefes, baús, inventário, classes, armas, pactos, custos dos altares e entrada e saída das salas secretas.
