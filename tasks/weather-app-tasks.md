# Weather App — Tarefas de Implementação

Backlog revisado a partir de `plans/weather-app-plan.md`. Cada tarefa é uma
unidade testável, mantém uma única responsabilidade principal e evita misturar
implementação de dados, UI e testes na mesma tarefa. A implementação segue a
ordem tipos → funções puras → services → hook → componentes → integração →
testes → hardening. O campo **Dependências** lista somente pré-requisitos
diretos; uma tarefa só começa quando todos eles estiverem concluídos.

## Entrega 1 — Fundação e contratos

### T-01 — Criar entrada mínima da aplicação

- **Descrição:** Criar o ponto de entrada React e um `App` mínimo renderizável.
- **Critérios de aceite:** `src/main.tsx` monta o `App`; `src/App.tsx` renderiza
  sem lançar exceção em um teste de renderização; `pnpm build` termina com
  código 0.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`.
- **Tipo:** Infra

### T-02 — Configurar setup do Vitest

- **Descrição:** Criar o setup do jsdom/Testing Library e confirmar os padrões
  de descoberta de testes unitários.
- **Critérios de aceite:** `pnpm test` executa sem erro de configuração; o
  setup é carregado; um teste mínimo em `tests/unit/` é descoberto e executado.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `tests/setup.ts`, `vite.config.ts`.
- **Tipo:** Infra

### T-03 — Definir contratos de domínio do clima

- **Descrição:** Implementar os tipos `Unit`, `City`, `CurrentWeather`,
  `ForecastDay`, `WeatherData`, `RequestError`, `SearchState` e `ForecastState`.
- **Critérios de aceite:** Os tipos representam estados idle, loading, success,
  empty e error; temperaturas de domínio são Celsius; erros retryable só aceitam
  `network`, `timeout`, `rate-limit` e `server`; `pnpm exec tsc --noEmit`
  termina com código 0.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data

## Entrega 2 — Funções de domínio

### T-04 — Implementar conversão de temperatura

- **Descrição:** Criar função pura de conversão entre Celsius e Fahrenheit.
- **Critérios de aceite:** Celsius permanece Celsius; Fahrenheit usa
  $F = C \times 9/5 + 32$; a função não arredonda o dado canônico nem acessa
  efeitos externos.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Tipo:** Data

### T-06 — Implementar catálogo de códigos WMO

- **Descrição:** Criar o mapeamento pt-BR de códigos WMO e o fallback neutro.
- **Critérios de aceite:** Todos os códigos da especificação têm rótulo e
  indicador; código desconhecido retorna “Condição meteorológica indisponível”
  e indicador acessível neutro.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`.
- **Tipo:** Data

### T-08 — Implementar rótulos de cidade

- **Descrição:** Criar função pura para montar rótulos com país, regiões,
  coordenadas e posição de resultados homônimos.
- **Critérios de aceite:** Campos opcionais vazios são omitidos; coordenadas usam
  quatro casas; empates remanescentes usam “Resultado N”; IDs distintos não são
  deduplicados.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/lib/cityLabel.ts`.
- **Tipo:** Data

### T-10 — Implementar horário de referência

- **Descrição:** Criar conversão do horário civil local para instante UTC e
  formatação `pt-BR` no fuso IANA retornado.
- **Critérios de aceite:** O offset é aplicado corretamente; formato inválido ou
  offset não finito é rejeitado; a saída usa o timezone recebido.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/lib/formatWeather.ts`.
- **Tipo:** Data

### T-11 — Implementar cálculo de frescor

- **Descrição:** Criar função pura que detecte referência meteorológica com
  mais de 24 horas.
- **Critérios de aceite:** A fronteira de 24 horas é tratada de forma
  determinística; a função aceita um relógio informado para facilitar testes.
- **Dependências:** T-10.
- **Arquivos prováveis:** `src/lib/freshness.ts`.
- **Tipo:** Data

## Entrega 3 — Integração Open-Meteo

### T-13 — Montar request de geocodificação

- **Descrição:** Criar a montagem tipada da URL de busca Open-Meteo com
  `URLSearchParams`.
- **Critérios de aceite:** A URL usa HTTPS, termo aparado, `count=5`,
  `language=pt` e `format=json`; caracteres especiais são codificados.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/services/openMeteo.ts`.
- **Tipo:** Data

### T-14 — Mapear resposta de geocodificação

- **Descrição:** Validar e mapear resultados válidos para `City`, preservando
  regiões administrativas opcionais.
- **Critérios de aceite:** Itens sem ID, nome ou coordenadas válidas são
  descartados; ausência de `results` retorna lista vazia; lista presente sem
  itens válidos produz erro de resposta incompatível.
- **Dependências:** T-13, T-08.
- **Arquivos prováveis:** `src/services/openMeteo.ts`.
- **Tipo:** Data

### T-16 — Montar request de previsão

- **Descrição:** Criar a montagem da URL de forecast com coordenadas e os
  parâmetros current/daily definidos no contrato.
- **Critérios de aceite:** A URL contém `forecast_days=5`, `timezone=auto`,
  latitude, longitude e todos os campos solicitados; parâmetros não são
  concatenados manualmente.
- **Dependências:** T-03, T-13.
- **Arquivos prováveis:** `src/services/openMeteo.ts`.
- **Tipo:** Data

### T-17 — Validar e mapear resposta de previsão

- **Descrição:** Validar a estrutura do forecast e criar `WeatherData` com
  current, offset, timezone e períodos diários.
- **Critérios de aceite:** Campos obrigatórios, datas, códigos e comprimentos
  das listas são validados; de um a cinco dias são preservados; campos atuais
  opcionais inválidos são omitidos; resposta parcial é marcada sem inventar dias.
- **Dependências:** T-16, T-10, T-11.
- **Arquivos prováveis:** `src/services/openMeteo.ts`.
- **Tipo:** Data

### T-19 — Implementar política de request

- **Descrição:** Adicionar timeout de 10 segundos, `AbortController`, aceite de
  HTTP 2xx e classificação dos erros do serviço.
- **Critérios de aceite:** Rede, timeout, 429 e 5xx são retryable; outros HTTP,
  JSON inválido e schema inválido não são; abort controlado é distinguível de
  erro visível.
- **Dependências:** T-14, T-17.
- **Arquivos prováveis:** `src/services/openMeteo.ts`.
- **Tipo:** Data

## Entrega 4 — Estado e orquestração

### T-21 — Criar reducer do estado da aplicação

- **Descrição:** Definir estado inicial e transições puras para busca, forecast,
  cidade ativa e unidade.
- **Critérios de aceite:** Busca e forecast têm estados independentes; transições
  não apagam dados da operação não relacionada; cada transição esperada tem uma
  asserção; tipos impedem estados inválidos.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.
- **Tipo:** Data

### T-22 — Implementar fluxo de busca no hook

- **Descrição:** Conectar submit, validação de termo, serviço de geocodificação
  e exposição de resultados no `useWeatherApp`.
- **Critérios de aceite:** Termo aparado com menos de dois caracteres não gera
  request; loading, success, empty e error são expostos; nova busca é explícita.
- **Dependências:** T-14, T-21.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.
- **Tipo:** Data

### T-23 — Implementar fluxo de forecast no hook

- **Descrição:** Conectar seleção de cidade ao serviço de previsão e expor
  forecast success, parcial, vazio e erro.
- **Critérios de aceite:** A cidade ativa usa suas coordenadas; seleção inicia
  loading; dados inválidos não substituem forecast anterior válido sem a
  transição definida; estados de busca permanecem independentes.
- **Dependências:** T-17, T-22.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.
- **Tipo:** Data

### T-24 — Adicionar concorrência e retry ao hook

- **Descrição:** Controlar IDs monotônicos, abortos e retry da última operação
  retryable no hook.
- **Critérios de aceite:** Só a ação mais recente atualiza a interface; aborto
  por ação nova não vira erro; retry repete somente busca ou forecast correto;
  loading aparece antes da nova tentativa.
- **Dependências:** T-19, T-22, T-23.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.
- **Tipo:** Data

### T-26 — Adicionar persistência de unidade

- **Descrição:** Ler e gravar apenas a preferência válida de unidade, tolerando
  falhas de `localStorage`.
- **Critérios de aceite:** Ausência ou valor inválido usa Celsius; unidade válida
  é restaurada; exceções não bloqueiam consultas; nenhum outro dado é salvo.
- **Dependências:** T-21.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.
- **Tipo:** Data

## Entrega 5 — Interface do MVP

### T-28 — Criar estilos base responsivos

- **Descrição:** Implementar tema, tipografia, tokens visuais e layout base em
  Tailwind/CSS.
- **Critérios de aceite:** Layout funciona de 320 a 1440 px sem overflow;
  foco é visível; contraste e estados não dependem apenas de cor; uma verificação
  nos viewports 320, 768 e 1440 px não encontra rolagem horizontal; lint termina
  com código 0.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/index.css`, `tailwind.config.js`.
- **Tipo:** UI

### T-29 — Montar shell da aplicação

- **Descrição:** Organizar `App` com busca, área de status, resultados e área
  meteorológica, consumindo o hook.
- **Critérios de aceite:** Tela inicial mostra busca sem dados meteorológicos;
  áreas recebem props e callbacks; um teste com `fetch` espiado confirma zero
  chamadas de rede originadas por componentes.
- **Dependências:** T-22, T-28.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI

### T-30 — Implementar formulário de busca

- **Descrição:** Criar formulário acessível para submit por botão ou tecla Enter.
- **Critérios de aceite:** Input possui label e nome acessível; submit chama a
  ação uma vez; termo curto recebe mensagem de validação; foco permanece visível.
- **Dependências:** T-29.
- **Arquivos prováveis:** `src/components/SearchForm.tsx`.
- **Tipo:** UI

### T-31 — Implementar resultados de cidade

- **Descrição:** Renderizar resultados selecionáveis com rótulo de cidade e
  estado ativo.
- **Critérios de aceite:** Cada resultado é operável por teclado; rótulos usam a
  desambiguação definida; seleção chama apenas a cidade escolhida.
- **Dependências:** T-08, T-29.
- **Arquivos prováveis:** `src/components/CityResults.tsx`.
- **Tipo:** UI

### T-32 — Implementar mensagens e status

- **Descrição:** Renderizar idle, loading, vazio, erro técnico e erro retryable.
- **Critérios de aceite:** Loading usa `role="status"`; erro usa `role="alert"`;
  retryable exibe uma única ação desabilitada durante loading; nova busca fica
  disponível após falha.
- **Dependências:** T-22, T-29.
- **Arquivos prováveis:** `src/components/StatusMessage.tsx`.
- **Tipo:** UI

### T-33 — Implementar clima atual

- **Descrição:** Exibir temperatura, condição, campos opcionais e horário de
  referência com aviso de frescor.
- **Critérios de aceite:** Campos ausentes não exibem rótulo nem valor; código
  desconhecido usa fallback acessível; horário usa pt-BR/timezone; aviso aparece
  após 24 horas.
- **Dependências:** T-06, T-07, T-10, T-11, T-23.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Tipo:** UI

### T-34 — Implementar previsão diária

- **Descrição:** Renderizar de um a cinco dias com data, mínimas, máximas,
  condição e indicador acessível.
- **Critérios de aceite:** Somente dias recebidos são renderizados; previsão
  parcial informa incompletude; lista vazia informa ausência; datas seguem o
  fuso e locale definidos.
- **Dependências:** T-06, T-07, T-23.
- **Arquivos prováveis:** `src/components/DailyForecast.tsx`.
- **Tipo:** UI

### T-35 — Implementar atribuição do Open-Meteo

- **Descrição:** Criar atribuição visível com link HTTPS e área para créditos
  adicionais exigidos pelo provedor.
- **Critérios de aceite:** Atribuição só acompanha dados meteorológicos; link é
  HTTPS e acessível; o texto não depende de cor para ser percebido; o link tem
  nome acessível e `href` iniciando com `https://`.
- **Dependências:** T-29.
- **Arquivos prováveis:** `src/components/Attribution.tsx`.
- **Tipo:** UI

### T-36 — Implementar controle visual de unidade

- **Descrição:** Criar toggle acessível de Celsius/Fahrenheit conectado à ação
  de unidade do hook.
- **Critérios de aceite:** Celsius é indicado por padrão; controle funciona por
  teclado; seleção atual tem estado semântico; a ação não chama serviços.
- **Dependências:** T-26, T-29.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.
- **Tipo:** UI

## Entrega 6 — Integração da aplicação

### T-37 — Conectar unidade às temperaturas renderizadas

- **Descrição:** Aplicar conversão de apresentação ao clima atual e à previsão.
- **Critérios de aceite:** Temperatura atual, sensação e mínimas/máximas mudam
  para a unidade escolhida e arredondam; troca durante loading é aplicada quando
  os dados chegam; relatório canônico permanece em Celsius.
- **Dependências:** T-04, T-33, T-34, T-36.
- **Arquivos prováveis:** `src/App.tsx`, `src/components/CurrentWeather.tsx`.
- **Tipo:** UI

## Entrega 7 — Testes de interface e E2E

### T-05 — Testar conversão de unidade de temperatura

- **Descrição:** Criar testes unitários da conversão de unidade Celsius/Fahrenheit,
  incluindo identidade Celsius e arredondamento de apresentação.
- **Critérios de aceite:** Asserções cobrem entradas Celsius, Fahrenheit,
  positivas e negativas; valores exibidos são inteiros após arredondamento; o
  arquivo de teste não importa rede, React ou armazenamento.
- **Dependências:** T-04.
- **Arquivos prováveis:** `tests/unit/lib/temperature.test.ts`.
- **Tipo:** Test

### T-07 — Testar catálogo de códigos WMO

- **Descrição:** Verificar códigos representativos de cada indicador e o
  comportamento do fallback.
- **Critérios de aceite:** Código atual e diário produzem o mesmo mapeamento;
  código não listado não falha nem recebe condição inventada.
- **Dependências:** T-06.
- **Arquivos prováveis:** `tests/unit/lib/weatherCodes.test.ts`.
- **Tipo:** Test

### T-09 — Testar rótulos de cidade

- **Descrição:** Cobrir cidades distintas, homônimos e campos administrativos
  ausentes.
- **Critérios de aceite:** Os casos previstos produzem rótulos estáveis e não
  alteram os objetos `City` de entrada; cada cenário possui uma asserção sobre
  o texto final do rótulo.
- **Dependências:** T-08.
- **Arquivos prováveis:** `tests/unit/lib/cityLabel.test.ts`.
- **Tipo:** Test

### T-12 — Testar horário e frescor

- **Descrição:** Testar conversão, timezone, entradas inválidas e aviso de dados
  possivelmente desatualizados.
- **Critérios de aceite:** Casos válidos e inválidos são cobertos; horários com
  mais de 24 horas são sinalizados; o teste controla o relógio e não depende da
  hora real da máquina.
- **Dependências:** T-10, T-11.
- **Arquivos prováveis:** `tests/unit/lib/freshness.test.ts`.
- **Tipo:** Test

### T-15 — Testar service de geocodificação com fetch mockado

- **Descrição:** Testar o service de geocodificação com `fetch` mockado, cobrindo
  URL, limite, dados opcionais, resultados vazios e itens inválidos.
- **Critérios de aceite:** O mock de `fetch` confirma todos os parâmetros; no
  máximo cinco cidades são aceitas; uma chamada `GET` é registrada; JSON
  incompatível rejeita a Promise do service e não produz `City`.
- **Dependências:** T-14.
- **Arquivos prováveis:** `tests/unit/services/openMeteo.test.ts`.
- **Tipo:** Test

### T-18 — Testar service de previsão com fetch mockado

- **Descrição:** Testar o service de previsão com `fetch` mockado, cobrindo
  forecast completo, parcial, vazio, desalinhado, inválido e campos opcionais
  ausentes.
- **Critérios de aceite:** O mock de `fetch` confirma coordenadas e parâmetros;
  o teste confirma `WeatherData` em Celsius, referência UTC e somente os dias
  recebidos; respostas incompatíveis rejeitam a Promise e não produzem dados.
- **Dependências:** T-17.
- **Arquivos prováveis:** `tests/unit/services/openMeteo.test.ts`.
- **Tipo:** Test

### T-20 — Testar política de request com fetch mockado

- **Descrição:** Testar com `fetch` mockado timeout, cancelamento, rede, 429,
  5xx, outros HTTP e JSON inválido.
- **Critérios de aceite:** O mock mantém a Promise pendente até o timeout de 10
  segundos; o sinal `AbortController` é observado; classes retryable são
  exatas; abortos controlados não são apresentados como erro.
- **Dependências:** T-19.
- **Arquivos prováveis:** `tests/unit/services/openMeteo.test.ts`.
- **Tipo:** Test

### T-25 — Testar estados e concorrência do hook

- **Descrição:** Testar transições, retry, respostas obsoletas e estados
  independentes com o serviço mockado.
- **Critérios de aceite:** São cobertos `idle`, `loading`, `success`, `empty` e
  `error`; resposta antiga não vence a nova; retry é restrito a erros
  retryable; busca e forecast podem evoluir separadamente.
- **Dependências:** T-24.
- **Arquivos prováveis:** `tests/unit/hooks/useWeatherApp.test.tsx`.
- **Tipo:** Test

### T-27 — Testar persistência e troca sem request

- **Descrição:** Testar preferência válida, inválida, armazenamento indisponível
  e troca de unidade durante loading.
- **Critérios de aceite:** Unidade persiste na sessão; falha do storage não quebra
  o fluxo; troca não chama geocoding nem forecast; dados futuros usam a unidade
  escolhida.
- **Dependências:** T-26.
- **Arquivos prováveis:** `tests/unit/hooks/useWeatherApp.test.tsx`.
- **Tipo:** Test

### T-38 — Testar componentes nos estados loading, erro e vazio

- **Descrição:** Cobrir com Testing Library os componentes de busca e seleção
  nos estados loading, erro retryable/não retryable e vazio.
- **Critérios de aceite:** Asserções confirmam submit, Enter, labels, roles,
  foco, mensagens de loading/erro/vazio e ausência de dados indevidos; retry
  único fica desabilitado durante tentativa; um spy em `fetch` confirma que a UI
  não o chama diretamente.
- **Dependências:** T-30, T-31, T-32.
- **Arquivos prováveis:** `tests/unit/components/WeatherApp.test.tsx`.
- **Tipo:** Test

### T-39 — Testar clima, previsão e atribuição

- **Descrição:** Cobrir campos opcionais, fallback WMO, previsão parcial,
  frescor, timezone e link de atribuição.
- **Critérios de aceite:** Valores ausentes são omitidos; nenhum dia fictício é
  mostrado; aviso de desatualização e rótulos acessíveis aparecem corretamente.
- **Dependências:** T-33, T-34, T-35.
- **Arquivos prováveis:** `tests/unit/components/WeatherApp.test.tsx`.
- **Tipo:** Test

### T-40 — Testar alternância de unidade na UI

- **Descrição:** Verificar conversão de todas as temperaturas e ausência de
  chamadas adicionais ao alternar unidade.
- **Critérios de aceite:** Celsius/Fahrenheit são exibidos corretamente; sensação
  térmica também muda; troca durante loading funciona; mock do serviço não recebe
  nova chamada.
- **Dependências:** T-36, T-37.
- **Arquivos prováveis:** `tests/unit/components/WeatherApp.test.tsx`.
- **Tipo:** Test

### T-41 — Testar E2E do fluxo principal em desktop e mobile

- **Descrição:** Criar cenário Playwright do fluxo principal, executado nos
  projetos desktop e mobile, com endpoints mockados para busca, seleção, clima
  atual e cinco dias.
- **Critérios de aceite:** `page.route` intercepta geocoding e forecast; URL e
  coordenadas são verificadas; resultados, clima, previsão e atribuição aparecem
  em viewport desktop e no viewport mobile configurado; os dois projetos
  terminam com código 0.
- **Dependências:** T-35, T-37, T-38.
- **Arquivos prováveis:** `tests/e2e/weather-flow.spec.ts`.
- **Tipo:** Test

### T-42 — Testar E2E de vazios, parciais e erros

- **Descrição:** Cobrir busca curta/vazia, forecast parcial, ausência de dados,
  timeout, rede, 429, 5xx e erro técnico.
- **Critérios de aceite:** Mensagens e retry correspondem à classificação; não
  há retry para erro técnico; exatamente um retry aparece e fica desabilitado
  enquanto a nova chamada está pendente.
- **Dependências:** T-32, T-38, T-41.
- **Arquivos prováveis:** `tests/e2e/weather-flow.spec.ts`.
- **Tipo:** Test

### T-43 — Testar E2E de concorrência e persistência

- **Descrição:** Cobrir resposta obsoleta, loading em até 100 ms, troca de
  unidade, persistência e restauração da preferência.
- **Critérios de aceite:** A resposta mais antiga não vence a nova; loading
  aparece no prazo; alternância não cria request adicional; apenas a unidade é
  restaurada no novo contexto.
- **Dependências:** T-24, T-27, T-40.
- **Arquivos prováveis:** `tests/e2e/weather-flow.spec.ts`.
- **Tipo:** Test

### T-44 — Testar responsividade e teclado

- **Descrição:** Validar Playwright em 320, 768 e 1440 px, retrato/paisagem e
  operações essenciais por teclado.
- **Critérios de aceite:** Asserção de `scrollWidth <= clientWidth` confirma
  ausência de overflow horizontal; busca, seleção, toggle e retry são acionados
  por teclado; os projetos Chromium desktop e mobile terminam com código 0.
- **Dependências:** T-38, T-41.
- **Arquivos prováveis:** `tests/e2e/weather-flow.spec.ts`,
  `playwright.config.ts`.
- **Tipo:** Test

## Entrega 8 — Hardening e release

### T-45 — Executar gates automatizados

- **Descrição:** Consolidar execução de lint, build, testes unitários e E2E.
- **Critérios de aceite:** `pnpm lint`, `pnpm build`, `pnpm test` e
  `pnpm test:e2e` terminam com código 0 e os testes usam mocks dos endpoints;
  nenhuma execução faz request ao Open-Meteo real.
- **Dependências:** T-42, T-43, T-44.
- **Arquivos prováveis:** `package.json`.
- **Tipo:** Infra

### T-46 — Registrar auditoria manual de acessibilidade e navegadores

- **Descrição:** Documentar contraste WCAG 2.2 AA, leitores de tela e versões
  testadas de Edge, Firefox e Safari.
- **Critérios de aceite:** Registro inclui viewport, orientação, navegador,
  versão, plataforma, resultado e evidência; cada falha tem correção ou
  justificativa registrada.
- **Dependências:** T-44, T-45.
- **Arquivos prováveis:** `docs/compatibility-checklist.md`.
- **Tipo:** Test

### T-47 — Verificar termos e créditos do provedor

- **Descrição:** Consultar os termos atuais do Open-Meteo e registrar créditos
  obrigatórios antes da publicação.
- **Critérios de aceite:** Checklist contém URL/versão, data, responsável,
  créditos, localização da atribuição e aprovação; publicação fica bloqueada
  sem aprovação.
- **Dependências:** T-35, T-45.
- **Arquivos prováveis:** `docs/release-checklist.md`.
- **Tipo:** Infra

### T-48 — Validar entrega estática

- **Descrição:** Confirmar build Vite, base path configurável e escopo estático
  do MVP.
- **Critérios de aceite:** `pnpm build` produz artefatos publicáveis; `VITE_BASE`
  continua configurável e altera o `base` gerado; não há backend, autenticação,
  cache persistente ou dados pessoais; checklist final referencia T-46 e T-47
  aprovados.
- **Dependências:** T-45, T-46, T-47.
- **Arquivos prováveis:** `README.md`, `vite.config.ts`.
- **Tipo:** Infra

## Rastreabilidade com a especificação

| Tarefa | Requisitos relacionados |
|---|---|
| T-01 | Arquitetura SPA; NFR08 |
| T-02 | Estratégia de testes; NFR01 |
| T-03 | Contratos de dados; FR05, FR06, FR07, FR08, FR09 |
| T-04 | FR05, FR06; regra de conversão da especificação |
| T-05 | AC05.1, AC05.2 |
| T-06 | FR03, FR04; tabela de códigos WMO |
| T-07 | AC03.4, AC04.2 |
| T-08 | FR01; AC01.3 |
| T-09 | AC01.3 |
| T-10 | FR10; AC10.1, AC10.3; NFR10 |
| T-11 | FR10; AC10.2 |
| T-12 | AC10.1, AC10.2, AC10.3 |
| T-13 | Data Contract de geocodificação; NFR08 |
| T-14 | Response Contract de geocodificação; AC01.1, AC01.3 |
| T-15 | AC01.1, AC01.2, AC01.3; NFR01 |
| T-16 | Data Contract de previsão; AC02.1 |
| T-17 | Response Contract de previsão; AC03.1, AC04.1, AC04.3, AC10.3 |
| T-18 | AC03.2, AC03.3, AC04.1, AC04.3 |
| T-19 | Error Classification; AC09.1, AC09.2; NFR01, NFR06 |
| T-20 | AC09.1, AC09.3; NFR01, NFR06 |
| T-21 | State Management; AC08.1, AC08.2 |
| T-22 | FR01, FR08; AC01.1, AC01.2, AC08.2, AC08.3 |
| T-23 | FR02, FR04, FR08; AC02.1, AC04.1, AC04.3, AC08.4 |
| T-24 | FR02, FR09; AC02.2, AC09.1, AC09.2, AC09.3; NFR06 |
| T-25 | AC02.2, AC08.2, AC08.5, AC09.1, AC09.3 |
| T-26 | FR06, FR07; AC06.1, AC07.1, AC07.2, AC07.3, AC07.4 |
| T-27 | AC05.3, AC06.1, AC07.1, AC07.2, AC07.3, AC07.4 |
| T-28 | NFR02, NFR03, NFR10 |
| T-29 | AC08.1, AC08.5; arquitetura de apresentação |
| T-30 | FR01, FR08; AC01.2, AC08.1; NFR02 |
| T-31 | FR01, FR02; AC01.3, AC02.1; NFR02 |
| T-32 | FR08, FR09; AC08.2, AC08.3, AC08.4, AC08.5, AC09.1, AC09.3 |
| T-33 | FR03, FR10, FR11; AC03.1–AC03.4, AC10.1–AC10.2 |
| T-34 | FR04, FR11; AC04.1–AC04.3, NFR10 |
| T-35 | FR12; AC12.1, AC12.2; NFR08 |
| T-36 | FR05, FR06; AC05.1–AC05.3, AC06.1; NFR02 |
| T-37 | FR05; AC05.1–AC05.3 |
| T-38 | AC01.2, AC02.1, AC08.2–AC08.5, AC09.1–AC09.3; NFR02 |
| T-39 | AC03.2–AC03.4, AC04.2–AC04.3, AC10.1–AC10.2, AC12.1 |
| T-40 | AC05.1–AC05.3; NFR01 |
| T-41 | AC01.1, AC02.1, AC03.1, AC04.1, AC12.1 |
| T-42 | AC01.2, AC04.3, AC08.3–AC08.5, AC09.1–AC09.3 |
| T-43 | AC02.2, AC05.3, AC07.2, AC09.2; NFR01 |
| T-44 | NFR02, NFR03, NFR04 |
| T-45 | Estratégia de testes; NFR04, NFR06 |
| T-46 | NFR02, NFR03, NFR04 |
| T-47 | FR12; AC12.1, AC12.2 |
| T-48 | AC12.2; NFR08; configuração de publicação estática |

## Rastreabilidade por requisito funcional

| Requisito funcional | Tarefas de implementação | Tarefas de teste/validação |
|---|---|---|
| **FR01 — Search for a city** | T-13, T-14, T-22, T-30, T-31 | T-15, T-38, T-41, T-42 |
| **FR02 — Select a city** | T-16, T-23, T-24, T-31 | T-25, T-38, T-41, T-43 |
| **FR03 — Display current weather** | T-06, T-17, T-33 | T-07, T-18, T-39, T-41 |
| **FR04 — Display five-day forecast** | T-06, T-17, T-23, T-34 | T-07, T-18, T-39, T-41, T-42 |
| **FR05 — Change temperature unit** | T-04, T-26, T-36, T-37 | T-05, T-27, T-40, T-43 |
| **FR06 — Use Celsius as the default unit** | T-04, T-26, T-36 | T-05, T-27, T-40 |
| **FR07 — Preserve unit preference locally** | T-26, T-27 | T-27, T-43 |
| **FR08 — Present application states** | T-03, T-21, T-22, T-23, T-24, T-32 | T-25, T-38, T-42 |
| **FR09 — Retry an unavailable request** | T-19, T-24, T-32 | T-20, T-25, T-38, T-42, T-43 |
| **FR10 — Display data freshness** | T-10, T-11, T-17, T-33 | T-12, T-18, T-39, T-42 |
| **FR11 — Use pt-BR presentation** | T-06, T-10, T-33, T-34 | T-07, T-12, T-39, T-41 |
| **FR12 — Attribute the data provider** | T-35, T-47 | T-39, T-41, T-46, T-48 |

### Lacunas identificadas

Todos os requisitos funcionais FR01–FR12 possuem pelo menos uma tarefa de
implementação e uma tarefa de teste ou validação correspondente. Não há
requisito funcional sem tarefa associada.

## Prioridade e tamanho relativo

P0 representa o caminho mínimo que desbloqueia uma consulta funcional; P1
representa requisitos importantes para completar o MVP; P2 representa
hardening, conformidade e publicação. O tamanho é relativo ao esforço da tarefa:
P (pequeno), M (médio) ou G (grande). Mesmo tarefas G devem continuar sendo
unidades isoladas e testáveis.

| Tarefa | Prioridade | Tamanho | Justificativa curta |
|---|---:|---:|---|
| T-01 | P0 | P | Entrada mínima necessária para executar a SPA. |
| T-02 | P0 | P | Habilita feedback rápido dos testes. |
| T-03 | P0 | M | Contrato compartilhado por todas as camadas. |
| T-04 | P0 | P | Conversão pura usada pela apresentação. |
| T-05 | P1 | P | Protege conversão e arredondamento. |
| T-06 | P0 | M | Condição meteorológica é parte do primeiro resultado útil. |
| T-07 | P1 | P | Valida mapeamento e fallback WMO. |
| T-08 | P0 | M | Necessário para resultados de busca selecionáveis. |
| T-09 | P1 | P | Protege homônimos e acessibilidade do rótulo. |
| T-10 | P1 | M | Necessário para horário correto da previsão. |
| T-11 | P1 | P | Sinaliza dados potencialmente antigos. |
| T-12 | P1 | P | Valida fuso e frescor sem relógio real. |
| T-13 | P0 | P | Monta a primeira chamada de dados. |
| T-14 | P0 | M | Converte geocodificação em cidades utilizáveis. |
| T-15 | P1 | M | Garante service de busca determinístico com `fetch` mockado. |
| T-16 | P0 | P | Monta chamada de previsão. |
| T-17 | P0 | G | Valida e normaliza o contrato meteorológico completo. |
| T-18 | P1 | M | Protege mapeamento completo e parcial. |
| T-19 | P0 | M | Necessário para timeout, retry e resiliência. |
| T-20 | P1 | M | Valida classificação de falhas do service. |
| T-21 | P0 | M | Base do estado previsível da aplicação. |
| T-22 | P0 | M | Primeiro fluxo vertical de busca. |
| T-23 | P0 | M | Liga seleção à previsão. |
| T-24 | P0 | G | Controla concorrência, abortos e retry. |
| T-25 | P1 | M | Verifica estados e respostas obsoletas do hook. |
| T-26 | P1 | M | Completa preferência de unidade persistida. |
| T-27 | P1 | M | Valida storage indisponível e troca sem request. |
| T-28 | P0 | M | Torna a primeira fatia visível e responsiva. |
| T-29 | P0 | M | Conecta hook e áreas principais da tela. |
| T-30 | P0 | P | Permite busca explícita por botão ou Enter. |
| T-31 | P0 | M | Permite escolher uma cidade. |
| T-32 | P0 | M | Torna loading, vazio e erro visíveis. |
| T-33 | P0 | M | Exibe o clima atual da cidade selecionada. |
| T-34 | P0 | M | Exibe previsão diária sem inventar períodos. |
| T-35 | P1 | P | Cumpre atribuição visível do provedor. |
| T-36 | P1 | P | Expõe controle acessível de unidade. |
| T-37 | P1 | M | Integra conversão às temperaturas renderizadas. |
| T-38 | P1 | M | Confirma estados de UI com Testing Library. |
| T-39 | P1 | M | Confirma clima, forecast, frescor e atribuição. |
| T-40 | P1 | M | Confirma unidade sem request adicional. |
| T-41 | P0 | G | Valida o fluxo principal integrado em desktop/mobile. |
| T-42 | P1 | G | Cobre erros, vazios e retry em navegador. |
| T-43 | P1 | M | Cobre concorrência e persistência integradas. |
| T-44 | P1 | M | Cobre teclado e larguras essenciais. |
| T-45 | P1 | P | Executa os gates automatizados do MVP. |
| T-46 | P2 | M | Registra auditoria manual de compatibilidade e a11y. |
| T-47 | P1 | P | Bloqueia publicação sem créditos aprovados. |
| T-48 | P2 | M | Fecha configuração e checklist de publicação. |

## Sequência em fatias verticais

As fatias abaixo entregam comportamento observável de ponta a ponta. Uma fatia
pode começar somente depois das dependências diretas listadas em cada tarefa.

### Fatia 0 — Tela executável

**Objetivo visível:** abrir a aplicação com layout responsivo e campo de busca
disponível, ainda sem dados externos.

**Sequência:** T-01 → T-02 → T-03 → T-21 → T-28 → T-29 → T-30.

**Resultado:** a pessoa vê a aplicação, consegue focar o formulário e recebe a
estrutura de estados sem depender da API.

### Fatia 1 — Buscar e selecionar uma cidade

**Objetivo visível:** pesquisar um nome, ver resultados reais mockados e
selecionar uma cidade.

**Sequência:** T-08 → T-13 → T-14 → T-22 → T-29 → T-31 → T-32 → T-15 → T-38.

**Resultado:** o fluxo de busca tem loading, vazio, erro e seleção explícita;
esta é a primeira fatia vertical utilizável pelo usuário.

### Fatia 2 — Mostrar clima atual

**Objetivo visível:** após a seleção, mostrar temperatura, condição e dados
opcionais da cidade.

**Sequência:** T-06 → T-10 → T-11 → T-16 → T-17 → T-23 → T-33 → T-35 → T-39.

**Resultado:** a aplicação entrega consulta atual com atribuição, sem ainda
exigir a experiência completa de cinco dias.

### Fatia 3 — Completar previsão e horário

**Objetivo visível:** mostrar hoje e os próximos dias no fuso correto, incluindo
respostas parciais e aviso de frescor.

**Sequência:** T-34 → T-12 → T-18.

**Resultado:** forecast completo/parcial e horário de referência ficam cobertos
com dados normalizados.

### Fatia 4 — Unidade e preferência local

**Objetivo visível:** alternar Celsius/Fahrenheit sem nova chamada e restaurar a
preferência quando o storage estiver disponível.

**Sequência:** T-04 → T-26 → T-36 → T-37 → T-05 → T-27 → T-40.

**Resultado:** todas as temperaturas visíveis mudam de unidade e a preferência
é tolerante a falhas de armazenamento.

### Fatia 5 — Resiliência integrada

**Objetivo visível:** lidar com timeout, rede, 429/5xx, retry e respostas
obsoletas sem exibir dados inválidos.

**Sequência:** T-19 → T-24 → T-20 → T-25 → T-42 → T-43.

**Resultado:** erros retryable e técnicos têm comportamento distinto e a ação
mais recente vence.

### Fatia 6 — Fechamento de qualidade e release

**Objetivo visível:** validar teclado, mobile, gates técnicos, compatibilidade e
publicação.

**Sequência:** T-41 → T-44 → T-45 → T-46 → T-47 → T-48.

**Resultado:** o MVP tem evidência de qualidade, atribuição aprovada e artefato
estático pronto para publicação.

## Prompt para o Coding Agent — T-01

Copie o bloco abaixo para iniciar o próximo módulo de implementação.

```text
Você é o Coding Agent do projeto SDD Weather App. Implemente somente a tarefa
T-01 — Criar entrada mínima da aplicação.

## Contexto

O projeto é uma SPA React 19 com TypeScript strict, Vite e pnpm. A aplicação
será construída em camadas na ordem tipos → funções puras → services → hook →
componentes → integração → testes → hardening. Esta é a tarefa de fundação e
não possui dependências de outras tarefas.

As convenções do projeto exigem:

- identificadores e nomes de arquivos em en-US;
- narrativa, comentários e documentação em pt-BR;
- componentes React pequenos e tipados, sem `any`;
- nenhuma chamada de rede, acesso a localStorage ou lógica de domínio nesta
  tarefa;
- manter o escopo estritamente limitado à entrada da aplicação.

## Objetivo

Criar o ponto de entrada React e um componente `App` mínimo que possa ser
montado pelo navegador sem lançar exceção. O resultado deve deixar uma base
neutra para as próximas tarefas adicionarem tipos, estado, busca e UI.

## Arquivos autorizados

Crie ou edite somente:

- `src/main.tsx`
- `src/App.tsx`

Não crie ainda `src/types/`, `src/hooks/`, `src/services/`, componentes de
busca, estilos de produto, testes ou arquivos de configuração. O setup formal
do Vitest pertence à T-02.

## Critérios de aceite

1. `src/main.tsx` importa ReactDOM e `App` e monta o componente no elemento
  raiz do documento.
2. `src/App.tsx` exporta um componente React tipado e mínimo, sem props
  obrigatórias, que renderiza uma estrutura válida.
3. A montagem usa uma API de montagem compatível com React 19 e não cria
  chamadas de rede, efeitos assíncronos ou acesso a armazenamento.
4. A aplicação não lança exceção durante a montagem; a compilação do projeto
  termina com código 0 usando `pnpm build`.
5. O código segue TypeScript strict, não usa `any` e não introduz dependências
  novas.

## Fora de escopo

- busca, forecast, Open-Meteo ou qualquer `fetch`;
- reducer, hook, estado de unidade ou localStorage;
- Tailwind, tema visual e layout final;
- loading, erro, vazio e retry de operações de dados;
- criação do setup ou de testes do Vitest, que será feita em T-02.

## Validação

Execute:

```bash
pnpm build
```

Se o ambiente já tiver o setup de testes disponível, execute também o teste de
renderização aplicável. Não altere a configuração para antecipar T-02. Se não
for possível executar esse teste por falta do setup, registre isso claramente e
use o build como validação disponível.

## Entrega

Ao concluir, informe:

1. arquivos criados ou alterados;
2. como cada critério de aceite foi atendido;
3. comandos executados e respectivos resultados;
4. qualquer limitação ou trabalho deixado explicitamente para T-02.
```