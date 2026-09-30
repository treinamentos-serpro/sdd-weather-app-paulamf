# Weather App — Product Specification

## Overview

### Purpose

O Weather App permitirá que usuários consultem o clima atual e a previsão
diária de uma cidade de forma rápida, clara e acessível, principalmente em
dispositivos móveis.

### MVP Scope

O MVP incluirá:

- Busca de cidades por nome.
- Seleção de uma cidade entre os resultados encontrados.
- Exibição do clima atual.
- Exibição da previsão de hoje mais os quatro dias seguintes.
- Alternância entre Celsius e Fahrenheit.
- Interface em português do Brasil (pt-BR).
- Tratamento explícito de carregamento, vazio, erro e indisponibilidade.
- Persistência local da preferência de unidade quando disponível, sem conta de
  usuário e sem persistência em servidor.
- Consulta direta às APIs públicas do Open-Meteo pelo navegador, sem camada
  intermediária de serviço.
- Sem cache persistente e sem modo offline nesta versão.

### Product Decisions

- A fonte de dados definida para o MVP é o Open-Meteo, sem API key.
- A previsão de cinco dias significa hoje mais quatro dias seguintes.
- Celsius será a unidade padrão.
- O produto não terá autenticação nem sincronização entre dispositivos.
- O idioma inicial da interface será pt-BR.
- A consulta de previsão solicitará `timezone=auto`; datas, o rótulo “hoje” e
  horários meteorológicos usarão o fuso retornado para a cidade selecionada.
- Cada chamada de geocodificação ou previsão terá timeout de 10 segundos.
- `current.time` é o horário de referência dos dados meteorológicos do modelo,
  não um horário de observação direta. A interface o identificará como
  “Horário de referência dos dados”. Dados com mais de 24 horas nesse horário
  receberão indicação explícita de possível desatualização.
- Os resultados de busca manterão a identidade por `id`. Se nome, país e regiões
  disponíveis não os distinguirem, a interface mostrará latitude e longitude
  com quatro casas decimais; se ainda houver rótulos iguais, acrescentará a
  posição do resultado na lista (“Resultado 1”, “Resultado 2” etc.).
- A tela com dados meteorológicos exibirá atribuição visível e link HTTPS para
  Open-Meteo, além de créditos adicionais exigidos pelos termos vigentes. A
  publicação fica bloqueada até que esses termos sejam verificados e a
  atribuição exigida esteja implementada.
- Ao iniciar uma busca ou consulta meteorológica mais recente, o sistema
  cancelará ou ignorará a resposta pendente equivalente anterior.
- A busca será iniciada somente por uma ação explícita do usuário (envio do
  formulário por botão ou tecla Enter); não haverá busca automática nem
  debounce no MVP.
- A resposta será validada antes de atualizar a interface. Dados que não
  cumprirem o contrato serão tratados como erro técnico e nunca serão exibidos
  parcialmente como se fossem válidos.
- `current.time` será interpretado como horário civil local da cidade e
  convertido em instante usando `utc_offset_seconds`. O fuso IANA `timezone`
  será usado para formatar a data e hora exibidas.

### Data Contract

- A busca usará `https://geocoding-api.open-meteo.com/v1/search` com os
  parâmetros `name`, `count=5`, `language=pt` e `format=json`.
- Cada resultado aceito deve fornecer `id`, `name`, `latitude` e `longitude`;
  `country` e `admin1` a `admin4` são opcionais e serão usados na
  desambiguação quando disponíveis.
- A previsão usará `https://api.open-meteo.com/v1/forecast` com as coordenadas
  selecionadas, `forecast_days=5` e `timezone=auto`.
- A consulta solicitará em `current`: `temperature_2m`, `apparent_temperature`,
  `relative_humidity_2m`, `wind_speed_10m` e `weather_code`; temperatura e
  código meteorológico são obrigatórios, e os demais campos são opcionais.
- A consulta solicitará em `daily`: `weather_code`, `temperature_2m_min` e
  `temperature_2m_max`. Os três valores são obrigatórios para cada período
  exibido. Além disso, `utc_offset_seconds` deve ser um numérico finito.
- Códigos meteorológicos serão mapeados para rótulos pt-BR e indicadores
  visuais acessíveis. Um código sem mapeamento usará o fallback definido em
  FR03.

| Código WMO | Rótulo pt-BR e nome acessível | Indicador |
|---:|---|---|
| 0 | Céu limpo | `sun` |
| 1 | Predominantemente limpo | `sun` |
| 2 | Parcialmente nublado | `partly-cloudy` |
| 3 | Nublado | `cloud` |
| 45 | Nevoeiro | `fog` |
| 48 | Nevoeiro com geada | `fog` |
| 51 | Garoa fraca | `drizzle` |
| 53 | Garoa moderada | `drizzle` |
| 55 | Garoa intensa | `drizzle` |
| 56 | Garoa congelante fraca | `drizzle` |
| 57 | Garoa congelante intensa | `drizzle` |
| 61 | Chuva fraca | `rain` |
| 63 | Chuva moderada | `rain` |
| 65 | Chuva intensa | `rain` |
| 66 | Chuva congelante fraca | `rain` |
| 67 | Chuva congelante intensa | `rain` |
| 71 | Neve fraca | `snow` |
| 73 | Neve moderada | `snow` |
| 75 | Neve intensa | `snow` |
| 77 | Grãos de neve | `snow` |
| 80 | Pancadas de chuva fracas | `rain-showers` |
| 81 | Pancadas de chuva moderadas | `rain-showers` |
| 82 | Pancadas de chuva violentas | `rain-showers` |
| 85 | Pancadas de neve fracas | `snow-showers` |
| 86 | Pancadas de neve intensas | `snow-showers` |
| 95 | Trovoada | `thunderstorm` |
| 96 | Trovoada com granizo fraco | `thunderstorm` |
| 99 | Trovoada com granizo intenso | `thunderstorm` |

O mapeamento aplica-se aos códigos atuais e diários. O nome acessível do
indicador é o rótulo pt-BR da tabela; se o mesmo rótulo já estiver visível junto
ao indicador, este será decorativo para tecnologias assistivas, sem anúncio
duplicado. Códigos inteiros não listados usam o fallback de FR03 com indicador
neutro; não são erros de contrato.

#### Request Contract

- Geocodificação: `GET /v1/search?name={termo}&count=5&language=pt&format=json`
  em `https://geocoding-api.open-meteo.com`. O termo será o texto aparado,
  codificado pela API de URL do navegador.
- Previsão: `GET /v1/forecast` em `https://api.open-meteo.com`, com
  `latitude`, `longitude`, `forecast_days=5`, `timezone=auto`,
  `current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code`
  e `daily=weather_code,temperature_2m_min,temperature_2m_max`.
- Ambas as chamadas aceitarão somente respostas HTTP 2xx. Redirecionamentos,
  conteúdo não JSON e respostas JSON inválidas são erros técnicos sem retry.

#### Response Contract and Validation

- Uma resposta de geocodificação sem `results` é uma busca sem resultados.
  Quando presente, `results` deve ser uma lista; itens sem `id`, `name`,
  `latitude` ou `longitude` válidos serão descartados. `country` e `admin1` a
  `admin4` só serão usados quando forem strings não vazias; campos opcionais
  ausentes, vazios ou em outro formato serão tratados como indisponíveis. Se a
  fonte retornar itens, mas nenhum tiver os campos obrigatórios válidos, a
  resposta será incompatível com o contrato.
- Uma previsão válida deve conter `timezone` não vazio, `utc_offset_seconds`
  numérico finito, `current` com `time` no formato `YYYY-MM-DDTHH:mm`,
  `temperature_2m` numérico finito e `weather_code` inteiro. `daily` deve
  conter listas `time`, `weather_code`, `temperature_2m_min` e
  `temperature_2m_max` de mesmo comprimento. Cada período exibido requer uma
  data ISO `YYYY-MM-DD`, `weather_code` inteiro e valores numéricos finitos nas
  listas de temperatura.
- A previsão pode conter de um a cinco períodos válidos; períodos além dos
  cinco primeiros serão ignorados. Nenhum período será fabricado para completar
  a lista. Uma lista diária vazia é ausência de dados meteorológicos; listas
  ausentes, desalinhadas ou com itens inválidos são incompatíveis com o
  contrato.
- Campos atuais opcionais só serão exibidos quando forem números finitos.
  Unidades de `current_units` e `daily_units` não são necessárias para validar
  a resposta: o contrato usa Celsius, porcentagem e km/h definidos pela
  requisição ao Open-Meteo.
- `current.time` representa o horário de referência do modelo para os dados
  meteorológicos, não uma observação direta. Interprete-o como horário civil da
  cidade e converta-o em instante subtraindo `utc_offset_seconds`; calcule a
  idade pela diferença para o relógio do dispositivo. Exiba “Horário de
  referência dos dados” e formate data/hora com `Intl.DateTimeFormat`, locale
  `pt-BR` e o fuso IANA `timezone`. Ausência ou formato inválido de `current.time`
  ou `utc_offset_seconds` torna a resposta incompatível com o contrato.

#### Error Classification and Retry

| Classe | Condição | Mensagem e retry |
|---|---|---|
| Entrada inválida | Termo após aparar tem menos de dois caracteres | Informar o mínimo de dois caracteres; sem retry. |
| Sem resultados | Geocodificação válida sem `results` | Informar que nenhuma cidade foi encontrada; sem retry. |
| Sem dados | Previsão válida com lista diária vazia | Informar ausência de dados; sem retry. |
| Repetível | Timeout, falha de rede, HTTP 429 ou HTTP 5xx | Informar indisponibilidade e oferecer um único retry. |
| Técnico | JSON inválido, HTTP não previsto, resposta incompatível ou erro de programação tratado | Informar erro técnico; sem retry. |

- O retry repete exatamente a última busca válida ou a última previsão da
  cidade ativa, conforme a operação que falhou. Ele não refaz uma busca e uma
  previsão em sequência nem reutiliza uma ação invalidada por uma ação mais
  recente.
- Um `AbortError` causado por uma ação mais recente não altera o estado nem
  exibe mensagem. Cada tipo de requisição mantém seu próprio controlador e
  identificador monotônico; somente a resposta cujo identificador ainda seja o
  mais recente pode alterar a interface.

### Primary Users

- Pessoas em deslocamento que precisam consultar o clima rapidamente.
- Pessoas planejando viagens e comparando condições meteorológicas.
- Profissionais que trabalham em atividades externas.

## Functional Requirements

### FR01 — Search for a city

O sistema deve permitir que o usuário pesquise uma cidade informando seu nome.
A busca deve remover espaços nas extremidades, aceitar acentos e iniciar apenas
para termos com dois ou mais caracteres não vazios. O sistema deve exibir no
máximo cinco resultados, contendo nome, país e regiões administrativas quando
fornecidas. Se esses campos não distinguirem resultados, deve exibir latitude
e longitude com quatro casas decimais; se ainda houver rótulos idênticos, deve
acrescentar a posição na lista (“Resultado N”). Resultados distintos por `id`
não devem ser deduplicados apenas por texto ou coordenadas.

### FR02 — Select a city

O sistema deve apresentar resultados de busca selecionáveis. Ao selecionar um
resultado, o sistema deve identificá-lo como a cidade ativa para a consulta
meteorológica por latitude e longitude. Uma resposta de busca ou previsão que
não pertença à ação mais recente não deve atualizar a interface.

### FR03 — Display current weather

Para a cidade ativa, o sistema deve apresentar a temperatura atual e a condição
climática, que são campos obrigatórios. Deve apresentar sensação térmica,
umidade e velocidade do vento quando esses dados forem fornecidos pela fonte.
Quando um desses campos opcionais estiver ausente ou inválido, seu rótulo e
valor devem ser omitidos.

Para um código meteorológico desconhecido, o sistema deve mostrar o texto
“Condição meteorológica indisponível” e um indicador visual neutro com nome
acessível.

O sistema não deve inventar, estimar ou apresentar como disponível um campo que
não tenha sido fornecido pela fonte de dados.

### FR04 — Display five-day forecast

O sistema deve apresentar uma previsão diária composta pelo dia atual e pelos
quatro dias seguintes. Cada período deve apresentar, quando disponível, a data,
temperatura mínima, temperatura máxima, condição climática e indicador visual
correspondente com nome acessível. As datas devem usar o fuso horário retornado
para a cidade.

Quando uma resposta válida tiver menos de cinco períodos, o sistema deve exibir
somente os períodos recebidos e informar que a previsão completa não está
disponível.

### FR05 — Change temperature unit

O usuário deve poder alternar entre Celsius e Fahrenheit. A unidade selecionada
deve ser aplicada à temperatura atual, sensação térmica e temperaturas mínima e
máxima da previsão. Os dados serão mantidos em Celsius e convertidos apenas na
apresentação, com arredondamento para número inteiro; a troca não deve iniciar
uma nova requisição de rede.

### FR06 — Use Celsius as the default unit

Quando não houver uma preferência previamente selecionada, o sistema deve
exibir temperaturas em Celsius.

### FR07 — Preserve unit preference locally

O sistema deve manter a unidade escolhida durante a sessão e deve tentar
preservá-la no mesmo dispositivo entre acessos. A indisponibilidade do
armazenamento local não deve impedir a consulta do clima; nesse caso, a
preferência pode permanecer apenas durante a sessão.

### FR08 — Present application states

O sistema deve apresentar estados distintos para:

- Tela inicial, sem cidade ativa e com o campo de busca disponível.
- Carregamento de busca ou previsão.
- Busca sem resultados.
- Erro na consulta.
- Falha de conexão ou indisponibilidade do serviço de dados.
- Ausência de dados meteorológicos.

Durante o carregamento, a interface deve informar qual operação está em curso.
Uma falha não deve impedir que o usuário inicie uma nova busca.

### FR09 — Retry an unavailable request

Quando uma busca ou previsão falhar por timeout, falha de conexão,
indisponibilidade do serviço, resposta HTTP 5xx ou limite de uso, o sistema deve
informar o problema e oferecer uma ação de nova tentativa. A ação não deve ser
exibida para entrada inválida, busca sem resultados ou resposta incompatível com
o contrato. Enquanto uma nova tentativa estiver em andamento, a ação deve ficar
indisponível.

### FR10 — Display data freshness

O sistema deve exibir `current.time` como “Horário de referência dos dados”,
formatado no fuso da cidade, sem apresentá-lo como horário de observação ou
atualização. Se esse horário tiver mais de 24 horas em relação ao relógio do
dispositivo, deve exibir “Dados possivelmente desatualizados”. Timestamp ausente
ou inválido torna a resposta incompatível com o contrato e deve seguir o estado
de erro técnico, sem exibir dados meteorológicos.

### FR11 — Use pt-BR presentation

Os textos da interface, mensagens de estado, datas e formatação de números
devem seguir português do Brasil na primeira versão. Datas e números devem usar
`Intl` com o locale `pt-BR`.

### FR12 — Attribute the data provider

Enquanto exibir dados meteorológicos, a interface deve apresentar atribuição
visível ao Open-Meteo com link HTTPS. Deve incluir créditos adicionais exigidos
pelos termos vigentes do provedor. A publicação do app fica bloqueada até que a
verificação dos termos e da atribuição exigida esteja registrada no checklist de
lançamento.

## User Stories

### US01 — Consulta rápida no deslocamento

Como Camila, profissional em deslocamento, quero buscar minha cidade e
visualizar o clima atual para decidir como me preparar antes de sair.

**Requisitos relacionados:** FR01, FR02 e FR03.

### US02 — Planejamento de viagem

Como Rafael, planejador de viagem, quero consultar a previsão de hoje mais os
quatro dias seguintes para organizar minhas atividades e minha bagagem.

**Requisito relacionado:** FR04.

### US03 — Comparação de unidades

Como Rafael, planejador de viagem, quero alternar entre Celsius e Fahrenheit
para interpretar as temperaturas com facilidade durante minhas viagens.

**Requisitos relacionados:** FR05 e FR06.

### US04 — Decisão para atividade externa

Como Joana, profissional de atividade externa, quero consultar temperatura,
condição climática e vento rapidamente para decidir se mantenho uma atividade ao
ar livre.

**Requisito relacionado:** FR03.

### US05 — Busca sem resultado

Como Camila, profissional em deslocamento, quero receber uma mensagem clara
quando minha busca não encontrar uma cidade para corrigir o termo pesquisado e
continuar minha consulta.

**Requisito relacionado:** FR08.

### US06 — Falha de serviço

Como Joana, profissional de atividade externa, quero saber quando os dados não
puderem ser carregados e tentar novamente para não tomar uma decisão com base em
uma tela vazia ou ambígua.

**Requisito relacionado:** FR09.

### US07 — Preferência de unidade

Como Rafael, planejador de viagem, quero que minha unidade escolhida seja
preservada no meu dispositivo para não precisar configurá-la novamente a cada
acesso.

**Requisito relacionado:** FR07.

## Acceptance Criteria

Os critérios abaixo são objetivos, testáveis e cobrem individualmente todos os
requisitos funcionais.

### FR01 — Search for a city

- **AC01.1:** **Given** que o usuário informou ao menos dois caracteres não
  vazios, **When** ele executa a busca, **Then** o sistema consulta a fonte e
  apresenta no máximo cinco resultados ou informa que nenhum foi encontrado.
- **AC01.2:** **Given** que o campo de busca contém apenas espaços ou menos de
  dois caracteres após remover espaços nas extremidades, **When** o usuário
  tenta executar a busca, **Then** o sistema não consulta a fonte e informa o
  mínimo de dois caracteres.
- **AC01.3:** **Given** que a busca retorna cidades homônimas, **When** os
  resultados são exibidos, **Then** cada item mostra nome e os campos de país e
  região disponíveis; se os campos textuais não distinguirem itens, apresenta
  latitude e longitude com quatro casas decimais; se ainda houver rótulos
  iguais, acrescenta “Resultado N”. Resultados com `id` distinto permanecem
  selecionáveis.

### FR02 — Select a city

- **AC02.1:** **Given** que existem resultados de busca, **When** o usuário
  seleciona um resultado, **Then** o sistema define essa cidade como ativa e
  inicia a consulta meteorológica com a latitude e longitude desse resultado.
- **AC02.2:** **Given** que uma busca ou previsão anterior ainda está pendente,
  **When** o usuário inicia uma busca ou seleção mais recente do mesmo tipo,
  **Then** a resposta anterior é cancelada ou ignorada e não altera a interface.

### FR03 — Display current weather

- **AC03.1:** **Given** que uma cidade ativa possui dados meteorológicos,
  **When** a consulta é concluída, **Then** a tela apresenta temperatura atual
  e condição climática.
- **AC03.2:** **Given** que sensação térmica, umidade ou velocidade do vento
  foram fornecidas, **When** o clima atual é exibido, **Then** cada valor
  disponível é apresentado com sua unidade.
- **AC03.3:** **Given** que um campo meteorológico não foi fornecido,
  **When** o clima atual é exibido, **Then** o sistema não exibe um valor
  inventado nem o rótulo desse campo.
- **AC03.4:** **Given** que a fonte retorna um código meteorológico sem
  mapeamento, **When** o clima atual é exibido, **Then** a tela mostra
  “Condição meteorológica indisponível” e um indicador visual neutro com nome
  acessível.

### FR04 — Display five-day forecast

- **AC04.1:** **Given** que uma cidade ativa possui previsão diária,
  **When** a consulta retorna cinco períodos válidos, **Then** o sistema
  apresenta exatamente hoje e os quatro dias seguintes.
- **AC04.2:** **Given** que os dados de um período estão disponíveis,
  **When** a previsão é exibida, **Then** o período apresenta data, temperatura
  mínima, temperatura máxima, condição climática e indicador visual acessível
  quando fornecidos, usando o fuso horário da cidade.
- **AC04.3:** **Given** que a previsão possui menos de cinco períodos,
  **When** a consulta é concluída, **Then** o sistema informa que a previsão
  completa não está disponível, exibe somente os períodos recebidos e não cria
  períodos fictícios.

### FR05 — Change temperature unit

- **AC05.1:** **Given** que o clima atual ou a previsão estão visíveis,
  **When** o usuário seleciona Fahrenheit, **Then** todas as temperaturas
  visíveis, incluindo sensação térmica, são convertidas de Celsius para
  Fahrenheit, arredondadas para inteiro e exibem °F.
- **AC05.2:** **Given** que as temperaturas estão em Fahrenheit,
  **When** o usuário seleciona Celsius, **Then** todas as temperaturas visíveis
  são convertidas para Celsius, arredondadas para inteiro e exibem °C.
- **AC05.3:** **Given** que dados meteorológicos já estão carregados, **When**
  o usuário alterna a unidade, **Then** os valores são atualizados sem uma nova
  requisição de geocodificação ou previsão.

### FR06 — Use Celsius as the default unit

- **AC06.1:** **Given** que não existe preferência de unidade,
  **When** o usuário visualiza qualquer temperatura, **Then** o valor é
  apresentado em Celsius.

### FR07 — Preserve unit preference locally

- **AC07.1:** **Given** que o usuário selecionou uma unidade durante a sessão,
  **When** ele realiza outra consulta, **Then** a mesma unidade continua sendo
  usada.
- **AC07.2:** **Given** que o armazenamento local está disponível e o usuário
  selecionou uma unidade, **When** ele retorna ao app no mesmo dispositivo,
  **Then** a unidade selecionada anteriormente é restaurada.
- **AC07.3:** **Given** que o armazenamento local está indisponível,
  **When** o usuário consulta o app, **Then** a consulta funciona sem bloquear
  o acesso aos dados meteorológicos.
- **AC07.4:** **Given** que o armazenamento local contém uma preferência que
  não seja Celsius ou Fahrenheit, **When** o app é iniciado, **Then** o valor é
  descartado e Celsius é selecionado.

### FR08 — Present application states

- **AC08.1:** **Given** que o app foi aberto sem cidade ativa, **When** a tela
  é exibida, **Then** o campo de busca está disponível e nenhum dado
  meteorológico é apresentado.
- **AC08.2:** **Given** que uma busca ou consulta meteorológica foi iniciada,
  **When** a resposta ainda não foi recebida, **Then** a interface comunica se
  está “Buscando cidades” ou “Carregando previsão” em uma região de status.
- **AC08.3:** **Given** que uma busca foi concluída sem resultados,
  **When** a resposta é apresentada, **Then** a interface informa que nenhuma
  cidade foi encontrada.
- **AC08.4:** **Given** que não existem dados meteorológicos para a cidade,
  **When** a consulta termina, **Then** a interface informa a ausência de
  dados sem apresentar valores incorretos.
- **AC08.5:** **Given** que ocorreu um erro na consulta, **When** o sistema
  processa a resposta, **Then** a interface apresenta uma mensagem que permite
  ao usuário iniciar uma nova busca, sem exibir dados da resposta inválida.

### FR09 — Retry an unavailable request

- **AC09.1:** **Given** que uma busca ou previsão falhou por timeout, conexão,
  HTTP 5xx ou limite de uso, **When** o estado de erro é apresentado, **Then**
  a interface exibe uma ação de nova tentativa.
- **AC09.2:** **Given** que o usuário aciona a nova tentativa, **When** a
  consulta é repetida, **Then** a interface apresenta o estado de carregamento
  antes de exibir o novo resultado.
- **AC09.3:** **Given** que uma nova tentativa está em andamento, **When** o
  usuário visualiza o estado de erro, **Then** a ação de nova tentativa está
  indisponível até a conclusão da consulta e possui apenas uma instância na
  tela.

### FR10 — Display data freshness

- **AC10.1:** **Given** que a resposta meteorológica é válida, **When** os
  dados são exibidos, **Then** `current.time` é
  apresentado como “Horário de referência dos dados” no fuso da cidade, sem
  chamá-lo de observação ou atualização.
- **AC10.2:** **Given** que o horário de referência ocorreu há mais de 24
  horas em relação ao relógio do dispositivo, **When** a tela é exibida,
  **Then** o sistema mostra “Dados possivelmente desatualizados”.
- **AC10.3:** **Given** que `current.time` ou `utc_offset_seconds` está ausente
  ou inválido, **When** a resposta é validada, **Then** é tratada como
  incompatível com o contrato e nenhum dado meteorológico dessa resposta é
  exibido.

### FR11 — Use pt-BR presentation

- **AC11.1:** **Given** que o usuário acessa a primeira versão do produto,
  **When** a interface é exibida, **Then** textos e mensagens são apresentados
  em português do Brasil.
- **AC11.2:** **Given** que uma data ou número meteorológico é exibido,
  **When** o valor é formatado, **Then** a apresentação segue as convenções
  definidas por `Intl` para `pt-BR`.

### FR12 — Attribute the data provider

- **AC12.1:** **Given** que dados meteorológicos estão visíveis, **When** a
  tela é exibida, **Then** há atribuição visível ao Open-Meteo com link HTTPS e
  os créditos adicionais exigidos pelos termos vigentes.
- **AC12.2:** **Given** que os termos do provedor ainda não foram verificados ou
  a atribuição exigida não foi implementada, **When** a publicação é avaliada,
  **Then** a liberação é bloqueada até que a verificação e a implementação
  estejam registradas no checklist de lançamento.

## Non-Functional Requirements

### NFR01 — Performance

- A interface deve exibir feedback de carregamento em até 100 ms após o início
  de uma busca, seleção ou nova tentativa.
- Cada chamada de geocodificação e previsão deve ser cancelada após 10 segundos
  sem resposta e tratada como timeout.
- Enquanto uma busca ou previsão equivalente estiver em andamento, uma nova
  ação deve cancelar ou ignorar a ação anterior; o MVP não usa cache persistente
  nem solicita novamente os dados ao alternar a unidade.

### NFR02 — Accessibility

A aplicação deve atender aos critérios aplicáveis da WCAG 2.2 nível AA para o
fluxo do MVP. A validação deve confirmar: busca, seleção, toggle de unidade e
nova tentativa operáveis por teclado; foco visível; controles com nome acessível;
anúncio de loading e erro por leitores de tela; contraste mínimo AA; e estados
que não dependam exclusivamente de cor.

### NFR03 — Responsiveness

A interface deve permanecer utilizável sem rolagem horizontal entre 320 px e
1440 px, em orientação retrato e paisagem. A validação deve cobrir ao menos
320 px, 768 px e 1440 px.

### NFR04 — Compatibility

A aplicação deve suportar as versões estável atual e imediatamente anterior de
Chrome, Edge, Firefox e Safari, em desktop ou mobile quando o navegador estiver
disponível na plataforma. A validação automatizada mínima deve executar no
Chromium e o teste manual deve registrar Safari e Firefox.

### NFR05 — Data freshness

O comportamento de atualização, ausência de horário e dados com mais de 24
horas é definido em FR10 e seus critérios de aceite.

### NFR06 — Resilience

A aplicação deve tratar indisponibilidade do provedor, falhas de rede, timeout,
HTTP 5xx e limite de uso sem exigir recarregamento da página. Os erros repetíveis
devem expor uma única ação de nova tentativa até que ela seja concluída.

### NFR07 — Availability

Não há meta de disponibilidade nem monitoramento de uptime no MVP estático.
Uma versão operada em produção deverá definir SLI, SLO e a separação entre a
disponibilidade da aplicação e a do provedor externo.

### NFR08 — Security and privacy

- A comunicação deve utilizar HTTPS.
- A primeira versão não deve exigir dados pessoais nem autenticação para buscas
  básicas.
- O navegador deve consultar somente os endpoints HTTPS públicos do Open-Meteo.
- Geolocalização não faz parte do MVP. Caso seja adicionada, dependerá de
  consentimento explícito.
- A aplicação não deve registrar em armazenamento local os termos de busca,
  coordenadas ou respostas meteorológicas.

### NFR09 — Observability

Telemetria de produção não faz parte do MVP. Uma evolução futura poderá coletar
erros técnicos, latência e disponibilidade sem registrar termos de busca,
coordenadas ou respostas meteorológicas.

### NFR10 — Localization

A interface deve usar `pt-BR` para textos, mensagens, datas e números. A data,
o rótulo “hoje” e o horário de referência dos dados devem usar o fuso retornado
pela previsão da cidade selecionada. O horário de referência não deve ser
apresentado como observação direta.

## Traceability Matrix

Os intervalos de critérios abaixo incluem os dois extremos. NFRs transversais
foram associados a cada história cujo fluxo depende deles.

| User Story | Acceptance Criteria | NFRs relevantes |
|---|---|---|
| US01 — Consulta rápida no deslocamento | AC01.1–AC01.3; AC02.1–AC02.2; AC03.1–AC03.4; AC08.1–AC08.3; AC10.1–AC10.3; AC12.1 | NFR01, NFR02, NFR03, NFR04, NFR05, NFR06, NFR08, NFR10 |
| US02 — Planejamento de viagem | AC02.1; AC04.1–AC04.3; AC10.1–AC10.3; AC12.1 | NFR01, NFR02, NFR03, NFR04, NFR05, NFR06, NFR10 |
| US03 — Comparação de unidades | AC05.1–AC05.3; AC06.1; AC07.1–AC07.4; AC12.1 | NFR02, NFR03, NFR04, NFR08, NFR10 |
| US04 — Decisão para atividade externa | AC02.1; AC03.1–AC03.4; AC10.1–AC10.3; AC12.1 | NFR01, NFR02, NFR03, NFR04, NFR05, NFR06, NFR08, NFR10 |
| US05 — Busca sem resultado | AC01.1–AC01.3; AC08.3 | NFR01, NFR02, NFR03, NFR04, NFR06, NFR08, NFR10 |
| US06 — Falha de serviço | AC02.2; AC08.2; AC08.4–AC08.5; AC09.1–AC09.3; AC10.3 | NFR01, NFR02, NFR03, NFR04, NFR06, NFR08, NFR10 |
| US07 — Preferência de unidade | AC05.1–AC05.3; AC06.1; AC07.1–AC07.4 | NFR02, NFR03, NFR04, NFR08, NFR10 |

## Edge Cases

| Edge case | Expected behavior |
|---|---|
| Cidade inexistente | Exibir mensagem informando que a cidade não foi encontrada, manter o campo de busca disponível e não iniciar consulta meteorológica. |
| Input vazio ou curto | Não iniciar consulta quando o termo tiver menos de dois caracteres após remover espaços e informar o mínimo de dois caracteres. |
| Caracteres especiais | Aceitar acentos e caracteres válidos, preservar o texto exibido e tratar uma resposta sem resultados como busca vazia, sem erro técnico. |
| Muitos resultados ou homônimos | Exibir no máximo cinco resultados, sem deduplicar IDs distintos; mostrar campos geográficos disponíveis, depois coordenadas com quatro casas decimais e, se necessário, posição “Resultado N”. |
| Nova busca ou seleção durante consulta | Cancelar ou ignorar a resposta pendente anterior do mesmo tipo; apenas a ação mais recente pode atualizar a interface. |
| Falha de rede, HTTP 5xx ou limite de uso | Exibir erro sem valores fictícios e disponibilizar uma única ação de nova tentativa. |
| Timeout | Encerrar a chamada após 10 segundos, informar que a resposta demorou e disponibilizar uma única ação de nova tentativa. |
| Geocoding sem resultados | Tratar como busca sem resultados: não consultar a previsão, informar que nenhuma cidade foi encontrada e permitir nova busca. |
| Resposta parcial | Exibir os campos disponíveis; não inventar campos ausentes; exibir somente os dias recebidos e informar que a previsão completa não está disponível. |
| Resposta incompatível com o contrato | Exibir mensagem de erro técnico sem ação de nova tentativa e manter o campo de busca disponível. |
| Código meteorológico desconhecido | Exibir “Condição meteorológica indisponível” e indicador visual neutro com nome acessível. |
| Horário de referência ausente ou inválido | Tratar a resposta como incompatível com o contrato e não exibir os dados meteorológicos recebidos. |
| Horário de referência com mais de 24 horas | Exibir “Dados possivelmente desatualizados” junto aos dados meteorológicos. |
| Armazenamento local indisponível | Manter a unidade somente na sessão e permitir a consulta normalmente. |
| Preferência de unidade inválida | Descartar o valor inválido e iniciar em Celsius. |
| Troca de unidade durante carregamento | Atualizar a unidade selecionada e aplicar a conversão aos dados quando a consulta terminar, sem nova chamada de rede. |
| Mudança de orientação ou largura de 320 px | Manter controles acessíveis e conteúdo sem rolagem horizontal. |

## Assumptions

- Open-Meteo continuará disponível e fornecerá dados atuais, geocodificação e
  previsão diária compatíveis com o escopo.
- A primeira versão será uma aplicação web acessada principalmente por
  navegadores.
- O usuário poderá consultar o clima sem criar conta.
- A busca principal será feita pelo nome da cidade.
- Celsius será a unidade padrão; Fahrenheit continuará disponível.
- A preferência de unidade poderá ser mantida localmente, sem sincronização em
  servidor.
- A previsão será diária e composta por hoje mais quatro dias.
- O idioma inicial será pt-BR.
- A localização atual não será necessária para a consulta básica.
- Os dados meteorológicos serão obtidos de um serviço externo.
- A primeira versão não incluirá notificações, alertas meteorológicos ou
  recursos sociais.
- A primeira versão não incluirá autenticação nem sincronização entre
  dispositivos.
- Campos meteorológicos opcionais poderão estar ausentes e não deverão ser
  substituídos por valores inventados.

## Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Indisponibilidade ou mudança do Open-Meteo | Média | Alto | Isolar a dependência por meio de um contrato de domínio, monitorar falhas e documentar alternativa futura. |
| Limite de uso ou mudança nos termos do provedor | Média | Alto | Tratar HTTP 429 conforme FR09; verificar e registrar os termos e créditos exigidos antes da publicação, que fica bloqueada até a conformidade. |
| Cidade homônima selecionada incorretamente | Média | Alto | Exibir país ou região e exigir seleção explícita do resultado. |
| Dados desatualizados ou incompletos | Média | Alto | Exibir horário disponível, tratar campos opcionais e sinalizar dados potencialmente antigos. |
| Resposta lenta em redes móveis | Média | Alto | Exibir loading imediatamente, evitar chamadas duplicadas e estabelecer medição de performance. |
| Falha de acessibilidade ou responsividade | Média | Alto | Validar WCAG 2.2 AA, teclado, leitor de tela e larguras a partir de 320 px. |
| Excesso de escopo no MVP | Alta | Alto | Manter fora do escopo autenticação, favoritos, alertas, histórico e funcionalidades não decididas. |
| Falta de observabilidade em produção | Média | Alto | Monitorar erros, latência, disponibilidade e falhas do provedor sem registrar dados pessoais desnecessários. |
| Uso indevido de dados de localização | Baixa | Alto | Não tornar geolocalização obrigatória, solicitar consentimento e coletar apenas o necessário. |

## Out of Scope

Os itens abaixo não fazem parte do MVP:

- Autenticação, cadastro de usuários e recuperação de senha.
- Persistência ou sincronização de dados em servidor.
- Sincronização de preferências entre dispositivos.
- Cidades favoritas e histórico de pesquisas, até decisão posterior.
- Persistência da última cidade selecionada e restauração automática dessa
  cidade ao iniciar o app.
- Autocomplete, sugestões enquanto o usuário digita e busca automática; a busca
  ocorre somente pelo envio explícito do formulário.
- Comparação simultânea ou lado a lado de duas ou mais cidades.
- Atualização periódica, em background ou por notificações; os dados são
  consultados ao selecionar uma cidade ou repetir uma solicitação com falha.
- Notificações push e alertas meteorológicos oficiais.
- Recursos sociais ou compartilhamento de consultas.
- Integração com calendário, viagens ou transporte.
- Aplicativos nativos para Android ou iOS.
- Previsão horária, índice UV, qualidade do ar e outros indicadores não
  confirmados no escopo atual.
- Geolocalização automática como requisito para a consulta básica.
- Suporte multilíngue além de pt-BR.
- Telemetria de produção, monitoramento de uptime e metas de disponibilidade.

Qualquer capacidade não descrita em `MVP Scope` ou nos requisitos funcionais
fica fora do MVP e requer atualização aprovada desta especificação antes de ser
implementada.

## Open Questions

As pendências abaixo não bloqueiam a implementação funcional do MVP. A
verificação dos termos e da atribuição do provedor é, separadamente, um bloqueio
obrigatório para publicação conforme FR12.

1. Qual métrica de sucesso do MVP será acompanhada e quais são suas metas?
2. Há critérios de identidade visual ou componentes de marca que devam ser
  respeitados além do design existente no aplicativo?