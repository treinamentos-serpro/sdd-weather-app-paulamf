# Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa necessita de uma aplicação de previsão do tempo que permita aos usuários consultar as condições meteorológicas de cidades de interesse de forma rápida e acessível.

A solução deve atender aos seguintes objetivos principais:

- Buscar cidades por nome.
- Visualizar as condições climáticas atuais.
- Consultar a previsão dos próximos cinco dias.
- Alternar entre as unidades Celsius e Fahrenheit.
- Oferecer uma experiência adequada para dispositivos móveis.

O público-alvo inclui usuários que precisam consultar o clima para planejamento pessoal, deslocamentos, viagens e atividades cotidianas.

## Requisitos Funcionais

### RF01 — Buscar cidade

O sistema deve permitir que o usuário pesquise uma cidade informando seu nome.

### RF02 — Selecionar cidade

O sistema deve apresentar resultados compatíveis com a busca para que o usuário selecione a cidade desejada.

### RF03 — Exibir clima atual

O sistema deve exibir, para a cidade selecionada:

- Temperatura atual.
- Condição climática.
- Sensação térmica, quando disponível.
- Umidade, quando disponível.
- Velocidade do vento, quando disponível.

### RF04 — Exibir previsão de cinco dias

O sistema deve exibir a previsão meteorológica para os cinco dias seguintes, incluindo, quando disponível:

- Data ou dia da semana.
- Temperatura mínima e máxima.
- Condição climática.
- Indicadores visuais relacionados ao clima.

### RF05 — Alternar unidade de temperatura

O usuário deve poder alternar entre:

- Celsius (°C).
- Fahrenheit (°F).

O sistema deve atualizar os valores apresentados após a alteração da unidade.

### RF06 — Informar estados da aplicação

O sistema deve tratar e apresentar estados de:

- Carregamento.
- Busca sem resultados.
- Erro na consulta.
- Falha de conexão ou indisponibilidade do serviço de dados.
- Ausência de dados meteorológicos.

### RF07 — Persistir preferência de unidade

A preferência de unidade do usuário deve ser mantida durante a sessão e, quando tecnicamente viável, entre acessos no mesmo dispositivo.

### RF08 — Informar indisponibilidade de dados

O sistema deve informar claramente quando os dados meteorológicos não puderem ser obtidos e oferecer uma nova tentativa quando aplicável.

## Requisitos Não-Funcionais

### RNF01 — Responsividade

A aplicação deve funcionar adequadamente em dispositivos móveis, tablets e desktops, adaptando layout, tipografia e controles ao tamanho da tela.

### RNF02 — Usabilidade

As informações principais, especialmente temperatura atual e previsão de cinco dias, devem ser identificáveis rapidamente, com navegação simples e linguagem clara.

### RNF03 — Acessibilidade

A aplicação deve:

- Utilizar estrutura semântica.
- Oferecer suporte à navegação por teclado.
- Possuir nomes ou rótulos acessíveis para controles.
- Manter contraste suficiente entre texto e fundo.
- Não depender exclusivamente de cores para comunicar informações.

### RNF04 — Desempenho

A aplicação deve evitar requisições desnecessárias ao serviço meteorológico e apresentar feedback visual imediatamente após o início de uma consulta.

### RNF05 — Compatibilidade

A aplicação deve ser compatível com as versões recentes dos principais navegadores móveis e desktop.

### RNF06 — Atualidade dos dados

A aplicação não deve apresentar informações potencialmente desatualizadas como se fossem atuais e deve exibir o horário da última atualização quando disponível.

### RNF07 — Segurança e privacidade

A aplicação não deve exigir dados pessoais para realizar buscas básicas. Dados de localização, caso utilizados, devem depender de consentimento explícito do usuário.

### RNF08 — Tempo de resposta

As buscas de cidade devem apresentar resultados em até 2 segundos em condições normais de rede. A consulta meteorológica deve apresentar feedback visual imediatamente e concluir em até 3 segundos quando o provedor estiver disponível.

### RNF09 — Acessibilidade mensurável

A aplicação deve atender, no mínimo, aos critérios aplicáveis da WCAG 2.2 nível AA, incluindo navegação por teclado, foco visível, contraste adequado, rótulos acessíveis e suporte a leitores de tela.

### RNF10 — Responsividade mensurável

A interface deve permanecer utilizável sem rolagem horizontal em larguras a partir de 320 px e deve ser validada em dispositivos móveis, tablets e desktops.

### RNF11 — Disponibilidade

A aplicação deve atingir uma disponibilidade mínima definida pelo negócio, por exemplo 99,5% ao mês, excluindo janelas de manutenção previamente comunicadas.

### RNF12 — Resiliência do serviço externo

A aplicação deve aplicar timeout nas chamadas ao provedor meteorológico, tratar falhas de rede e permitir nova tentativa sem exigir o recarregamento completo da página.

### RNF13 — Cache e controle de requisições

A aplicação deve evitar chamadas duplicadas para a mesma cidade e unidade em um intervalo configurável, respeitando os limites e a política de atualização do provedor.

### RNF14 — Segurança no transporte

Toda comunicação entre o navegador, a aplicação e os serviços externos deve utilizar HTTPS.

### RNF15 — Observabilidade

A aplicação deve registrar erros técnicos e falhas de integração sem armazenar dados pessoais desnecessários.

## Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| Serviço externo de previsão indisponível | Alto | Exibir estado de erro, timeout e orientação para tentar novamente |
| Busca retornar cidades homônimas | Médio | Exibir informações adicionais, como país e região |
| Dados meteorológicos desatualizados | Alto | Informar horário da última atualização |
| Conexão lenta em dispositivos móveis | Médio | Exibir loading, reduzir requisições e otimizar recursos |
| Layout inadequado em telas pequenas | Alto | Validar a interface em diferentes tamanhos de viewport |
| Conversão incorreta entre Celsius e Fahrenheit | Médio | Centralizar a conversão e cobrir o comportamento com testes |
| Dados incompletos fornecidos pela API | Médio | Tratar campos opcionais e não quebrar a interface |
| Limitações de uso do provedor de dados | Médio | Monitorar limites e definir estratégia de cache ou substituição |

## Perguntas em Aberto

1. Qual provedor de dados meteorológicos será utilizado?
2. A busca deve aceitar apenas nomes de cidades ou também códigos postais e coordenadas?
3. Como devem ser tratados resultados com o mesmo nome em países ou regiões diferentes?
4. A localização atual do usuário será oferecida como alternativa à busca manual?
5. A aplicação precisa oferecer suporte a múltiplos idiomas?
6. Quais dados devem ser exibidos além da temperatura e condição climática?
7. A previsão de cinco dias deve incluir dados horários ou apenas um resumo diário?
8. A preferência de unidade deve ser salva localmente entre sessões?
9. É necessário permitir salvar cidades favoritas?
10. Qual é o tempo máximo aceitável para uma busca retornar resultados?
11. Como o produto deve se comportar quando o usuário estiver offline?
12. Há requisitos de identidade visual, marca ou tema definidos pela empresa?
13. Quais navegadores e versões mínimas precisam ser suportados?
14. Existem requisitos legais ou de privacidade específicos para dados de localização?
15. Qual métrica definirá o sucesso inicial da aplicação?

## Suposições

- A aplicação será acessada principalmente por navegador web.
- O usuário poderá consultar o clima sem criar uma conta.
- O nome da cidade será o principal critério de busca.
- O provedor de dados oferecerá informações atuais e previsão diária de pelo menos cinco dias.
- A aplicação utilizará uma unidade padrão inicialmente definida pelo produto, provavelmente Celsius.
- A conversão entre Celsius e Fahrenheit será realizada pela aplicação ou pelo provedor de dados.
- O idioma inicial da interface será português.
- A localização do usuário não será obrigatória para o funcionamento da aplicação.
- Os dados meteorológicos serão obtidos de um serviço externo.
- A primeira versão não incluirá notificações, alertas meteorológicos ou recursos sociais.
- A primeira versão não exigirá autenticação nem sincronização entre dispositivos.


## Personas

### Persona 1 — Camila, profissional em deslocamento

- **Perfil:** Camila tem 29 anos, trabalha presencialmente e usa transporte público para se deslocar pela cidade.
- **Objetivo principal:** Verificar rapidamente se precisa levar guarda-chuva, usar outra roupa ou alterar o horário de saída.
- **Contexto de uso:** Principalmente em um smartphone, durante a manhã e pouco antes de sair do trabalho. Pode estar usando uma conexão móvel instável.
- **Métrica de sucesso:** Conseguir consultar a cidade correta e identificar a condição atual e a previsão do dia em até 30 segundos.

### Persona 2 — Rafael, planejador de viagem

- **Perfil:** Rafael tem 38 anos, organiza viagens e compara as condições climáticas de diferentes cidades antes de definir atividades e bagagem.
- **Objetivo principal:** Consultar a previsão de cinco dias e comparar temperaturas em Celsius ou Fahrenheit para planejar a viagem.
- **Contexto de uso:** Principalmente em desktop ou tablet, em casa, com tempo para analisar os dados e pesquisar mais de uma cidade.
- **Métrica de sucesso:** Encontrar a cidade correta, alternar a unidade de temperatura e obter uma previsão de cinco dias sem precisar repetir a busca.

### Persona 3 — Joana, profissional de atividade externa

- **Perfil:** Joana tem 45 anos e trabalha parte do dia ao ar livre, dependendo das condições do tempo para organizar sua rotina.
- **Objetivo principal:** Consultar rapidamente temperatura, chuva, vento e previsão dos próximos dias para decidir se mantém ou reorganiza uma atividade externa.
- **Contexto de uso:** Principalmente em smartphone, no local de trabalho, sob luz intensa e com pouco tempo disponível para interação.
- **Métrica de sucesso:** Acessar informações legíveis e atualizadas em até 10 segundos, mesmo em uma tela pequena e com conexão limitada.

## Decisões

### Fonte de dados: Open-Meteo

- **Decisão:** A aplicação utilizará o Open-Meteo como fonte de dados meteorológicos e de previsão, sem necessidade de API key.
- **Justificativa:** O serviço atende ao escopo inicial sem exigir gerenciamento de credenciais e reduz a complexidade de configuração do MVP.
- **Perguntas resolvidas:** Qual provedor será utilizado, se haverá necessidade de API key e qual será a estratégia inicial de integração com dados meteorológicos.

### Definição de cinco dias

- **Decisão:** A previsão de cinco dias será composta pelo dia atual mais os quatro dias seguintes.
- **Justificativa:** Essa definição elimina a ambiguidade sobre a quantidade de períodos exibidos e representa melhor a consulta imediata do usuário.
- **Perguntas resolvidas:** Se o dia atual está incluído na previsão e qual quantidade exata de dias deve ser apresentada.

### Unidade padrão: Celsius

- **Decisão:** A aplicação apresentará temperaturas em Celsius (°C) por padrão, mantendo a possibilidade de alternância para Fahrenheit.
- **Justificativa:** Celsius é adequado ao idioma e ao público inicial definido para a interface em pt-BR.
- **Perguntas resolvidas:** Qual será a unidade inicial e como a aplicação deverá se comportar quando o usuário ainda não tiver escolhido uma unidade.

### Autenticação e persistência

- **Decisão:** A aplicação não terá autenticação nem persistência de dados em servidor na primeira versão.
- **Justificativa:** A consulta básica do clima não exige conta e a decisão reduz escopo, infraestrutura, riscos de privacidade e esforço de implementação do MVP.
- **Perguntas resolvidas:** Se o usuário precisará criar uma conta e se preferências ou cidades deverão ser sincronizadas entre dispositivos. Preferências locais, como a unidade, poderão ser mantidas no próprio dispositivo quando aplicável.

### Idioma da interface: pt-BR

- **Decisão:** O idioma inicial da interface será português do Brasil (pt-BR).
- **Justificativa:** A decisão estabelece o público linguístico inicial e permite padronizar textos, mensagens de erro, datas e formatação dos valores.
- **Perguntas resolvidas:** Qual será o idioma inicial e quais regras de localização devem orientar a experiência da primeira versão.
