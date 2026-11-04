# Pesquisa de dentistas e clínicas — mock para real

## Objetivo
Com uma conta real, a Pesquisa (paciente, dentista, clínica) passa a ler os dados da base de dados. O modo demo continua a usar o mock atual, que não muda.

## O que existe hoje (verificado)
- A vista `professional_public_profiles` tem as colunas id, full_name, avatar_url, role, language e uma lista de conquistas sempre vazia. Só inclui dentistas e clínicas aprovados.
- Aprovados hoje: 9 dentistas e 4 clínicas, com 12 ligações dentista–clínica.
- `clinics` tem nome, morada, cidade, código postal e fuso horário, mas não tem coordenadas.
- `dentists.specialties` é um campo `jsonb`. Não há uma coluna de idiomas falados; há só `profiles.language`, a língua da app.
- O ecrã usa `MOCK_DENTIST_RESULTS`, que traz classificação, nível, plano, "paciente anterior" e coordenadas inventadas.

## Alterações na base de dados (uma migração)
1. **Colunas novas em `clinics`**, todas opcionais:
   - `latitude numeric` e `longitude numeric`, escritas só pela própria clínica, com validação de intervalo por trigger;
   - `teleconsultation_available boolean default false`, que no ecrã aparece sempre como "Em breve".
2. **Coluna nova em `dentists`:** `spoken_languages text[] default '{}'`, limitada a pt/fr/en/es por trigger.
3. **Vista nova `public_clinic_directory`**, só com clínicas aprovadas:
   - colunas: id, name, address, city, postal_code, latitude, longitude, timezone, country, aceita cheques, teleconsulta;
   - nunca inclui telefone, e-mail, classificação nem dono.
4. **RPC `search_professionals(...)`** (`SECURITY DEFINER`, `search_path = public`), só leitura:
   - **Parâmetros:** `_q` (nome), `_kind` (dentist | clinic | all), `_specialty`, `_city_or_postal`, `_lat` e `_lng` (opcionais), `_max_km`, `_language`, `_available` (any | today | tomorrow | week), `_sort` (distance | name | relevance), `_limit` (até 50, por defeito 20) e `_cursor`, para paginar por offset.
   - **Devolve:** id, tipo, nome, avatar, especialidades, idiomas, as clínicas (id, nome, cidade e código postal, coordenadas), a distância em km (fórmula de Haversine, sem PostGIS), `next_slot` (só a hora) e `total`.
   - **Só aprovados:** devolve apenas dentistas e clínicas `aprovado`.
   - **Nunca devolve:** telefone, e-mail, data de nascimento, classificação, nível, plano, conquistas ou "paciente anterior".
   - **Ordem:** distância, depois nome; ou relevância de texto (trigram) e depois nome. Nunca ordena por plano ou classificação.
   - **Disponibilidade:** calcula a primeira vaga livre a partir do horário de `clinic_members.working_hours`, tirando as consultas existentes (só `scheduled_at` e `duration_minutes`). Usa o fuso de cada clínica e não abre vagas ao domingo, exceto teleconsulta.
     - Não revela quem são os pacientes nem os tipos de consulta, só "próxima vaga: amanhã 10:30".
     - Se o horário não tiver dados, a vaga fica vazia e o filtro ignora esse profissional.
   - **Permissões:** `GRANT EXECUTE` só a `authenticated`, revogado a PUBLIC e anon.
5. **Índices:**
   - trigram (`pg_trgm`) em `profiles.full_name` e `clinics.name`;
   - `clinics(verification_status)`, `clinics(postal_code)` e `clinics(city)`;
   - GIN em `dentists.specialties` e `dentists.spoken_languages`;
   - `appointments(dentist_id, scheduled_at)` e `appointments(clinic_id, scheduled_at)`, se ainda não existirem.
6. **Sem escritas do cliente:**
   - as tabelas e políticas atuais mantêm-se;
   - as colunas novas obedecem às regras de RLS que já existem para o dono;
   - a vista e a RPC só leem.

## Ecrã (sem mudar o aspeto)
- **Novo módulo `src/data/searchSource.ts`:**
  - em modo demo devolve o mock filtrado como hoje;
  - com conta real chama a RPC e converte os resultados para o formato do cartão.
- **O que deixa de aparecer em contas reais:** a classificação, o nível, o plano e "paciente anterior". Para terceiros, essas partes do cartão escondem-se.
- **Filtros:**
  - os atuais: especialidade, distância, disponibilidade e ordenar por distância;
  - novos: cidade ou código postal, e idioma falado;
  - teleconsulta como "Em breve", desativado.
- **Ordenação:** "preço" sai das contas reais (não há preços reais) e entra "nome".
- **Lista e mapa:**
  - lista paginada com "Carregar mais";
  - o mapa Leaflet fica igual e mostra só as clínicas com coordenadas.
- **Distância:** só com a localização do utilizador, pedida com consentimento do navegador. Sem localização, ordena por nome.
- **Textos:** PT/FR/EN para os rótulos novos.

## Fica mock (nesta fase)
- Avaliações e comentários no perfil.
- Preços de teleconsulta e favoritos.
- O mercado de emprego e a pesquisa de pacientes na agenda (`AgendaSearchBar`).
- O mock completo continua como fallback do modo demo.

## Testes
- **Base de dados**, com transações revertidas e `request.jwt.claims`:
  1. um anónimo não consegue executar a RPC;
  2. um dentista `pendente` ou `rejeitado` nunca aparece;
  3. o resultado não tem telefone, e-mail, nascimento, classificação nem plano (verificado pelas colunas);
  4. a ordenação muda com a distância e não com a classificação nem com o plano;
  5. `next_slot` ignora consultas canceladas e não devolve nomes de pacientes;
  6. a paginação não repete itens;
  7. o cliente não consegue mudar o estado de verificação nem as coordenadas de outra clínica.
- **App (vitest):** o adaptador da RPC não copia classificação nem plano e mantém a ordem recebida, e o modo demo continua a usar o mock.
- **Verificações finais:** typecheck, `vite build` e Playwright em conta real e demo, a 375 e 1280px, em PT/FR/EN.

## A confirmar pelo dono
- **Coordenadas:** as clínicas reais ainda não têm coordenadas. Proponho que cada clínica as preencha nas Definições (o campo "obter da morada" fica para depois, porque precisa de um serviço de geocodificação). Até lá, a distância só funciona com essas clínicas.
- **Idiomas falados:** coluna nova preenchida pelo próprio dentista, com pt/fr/en/es. Confirme a lista.
