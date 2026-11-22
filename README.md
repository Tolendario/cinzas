# Cinzas — Ascensão do Submundo

Jogo de ação roguelite em HTML, CSS e JavaScript, com três classes, dez armas iniciais, três armas ancestrais desbloqueáveis e uma campanha de 11 temáticas. Os gráficos são desenhados em Canvas e os efeitos sonoros são gerados no navegador.

## Jogar

Baixe os arquivos do repositório e abra **index.html** em um navegador moderno. O jogo funciona offline e não precisa de instalação, servidor ou dependências para jogar.

## O que há no jogo

- Guerreiro, Arqueiro e Mago, com armas e especiais próprios.
- 55 níveis de duas ondas, organizados em 11 temáticas, cada uma seguida de seu chefe.
- Quatro disposições de arena, com obstáculos, ânforas, posições dos inimigos e pontos de encontro variáveis por tentativa e fase.
- Baú após cada chefe: escolha um entre três itens. O baú desaparece após a escolha.
- Somente três equipamentos em uso: armadura, anel e amuleto. Escolher um novo item equipa imediatamente e destrói o anterior do mesmo tipo. Não há mochila ou armazenamento.
- Equipamentos permanecem entre fases e desaparecem ao morrer ou concluir a campanha. Itens no chão podem ser examinados com E antes de escolher ou dispensar.
- Salvamento independente para Guerreiro, Arqueiro e Mago. Cada chefe derrotado confirma cinco níveis; fases intermediárias não gravam avanço. A classe retoma na próxima temática confirmada.
- Seis especializações, 18 talentos, maestria e melhorias permanentes com cinzas.
- Pactos opcionais com o Peregrino, altares e passagens para salas secretas.
- Refúgio entre tentativas, com ferreiro, personagens, missões e aparências por classe.
- Treinamento com três alvos, medição de dano e DPS, sem gastar a tentativa ou conceder XP, cinzas e avanço de campanha.
- Controles por teclado e mouse ou tela de toque.

O progresso fica salvo no navegador utilizado. Recarregar retoma o último chefe confirmado, incluindo os equipamentos escolhidos naquele ponto. Morrer mantém as temáticas liberadas, mas remove os equipamentos da tentativa.

## Mapas variáveis

Cada tentativa gera uma semente que determina a disposição de cada fase. As 11 temáticas mantêm suas cores, criaturas e perigos, enquanto mudam os obstáculos, a decoração do piso, as ânforas com recursos e os locais dos encontros opcionais.

Os caminhos até o portal, o baú e os encontros são validados antes do combate. Os inimigos surgem afastados do jogador e dos obstáculos. O baú continua aparecendo somente depois de derrotar o chefe.

O checkpoint guarda a semente separadamente para cada classe. Recarregar conserva o mapa daquela tentativa; morrer ou recomeçar gera outra variação. O pátio de treinamento mantém seus obstáculos e alvos fixos.

## Refúgio das Cinzas

Use **Visitar refúgio** no menu ou **Ir ao refúgio** após uma tentativa. Caminhe e pressione E perto de uma estação, ou use os botões de acesso rápido.

- **Ícaro, o ferreiro:** após confirmar um chefe com a classe, forje sua arma ancestral por 40 cinzas. A arma fica desbloqueada permanentemente no arsenal dessa classe.
- **Ariadne:** resgate aparências ao confirmar um chefe, dominar o treinamento ou confirmar três chefes. Cada recompensa só pode ser resgatada uma vez por classe.
- **Mnemé:** escolha entre o traje original e as aparências conquistadas. São mudanças apenas visuais.
- **Treinamento:** experimente a arma escolhida contra três bonecos imóveis. Use Q, E e esquiva e cause 500 de dano para cumprir a missão de treinamento. Zerar a medição não apaga o progresso da missão.

As armas ancestrais são a **Lâmina do alvorecer**, o **Arco do eclipse** e o **Cajado do éter**. Os desbloqueios e as aparências permanecem mesmo após morrer ou recomeçar a campanha da classe.

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

Para verificar somente o refúgio, o treinamento e os desbloqueios:

```sh
npm run test:refuge
```

Para verificar a geração dos mapas, seus caminhos e a retomada das sementes:

```sh
npm run test:maps
```

A suíte verifica a campanha completa, chefes, baús, substituição direta dos equipamentos, checkpoints por classe, classes, armas, pactos, salas secretas e os fluxos do refúgio, incluindo treinamento e desbloqueios permanentes.
