# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Principal:** pessoa da secretaria/administração da igreja, responsável por organizar cultos e eventos musicais. Usa o sistema para montar a programação de hinos de cada culto, manter os dados dos membros e gerar os materiais impressos do culto.
- Usuários fazem login com conta própria (sistema multiusuário com papéis).

## Product Purpose

Sistema de gestão para igrejas que centraliza: programação musical dos cultos (hinos por data/tipo), acervo de hinos com arranjos por tipo de conjunto (corais, orquestras, grupos instrumentais), cadastro de membros e configurações. O resultado final mais visível é a **programação impressa** do culto (capa, ordem do culto e materiais de impressão). Sucesso = a secretaria monta e imprime a programação do culto em poucos minutos, sem depender de internet.

## Positioning

Programação de hinos acoplada à geração de materiais de impressão prontos para o culto, alimentada por um acervo organizado por tipo de conjunto musical — diferencial que um gestor genérico de membros não oferece.

## Operating Context

- Uso **offline/desktop é essencial**: o produto roda como aplicativo Electron com backend FastAPI embutido e banco SQLite local (`orquestra.db`).
- Interface e conteúdo em português (pt-BR).
- E-mails (recuperação de senha, troca de e-mail) via SMTP configurável no `.env`.
- O acervo foi alimentado com importações reais por conjunto (arquivos CSV/PDF em `backend/`: coral-jovem, coro-da-sede, coro-de-câmara, coro-feminino, coro-infanto-juvenil, coro-masculino, grande-coral, orquestras de câmara/violões/do hinário/do coral, solos com coral, instrumentais, dia-das-mães).

## Capabilities and Constraints

- Autenticação multiusuário com papéis (`papel`) JWT; recuperação de senha e troca de e-mail por código enviado por e-mail.
- CRUD de membros, hinos (acervo por tipo) e programações; histórico de programações; aba de impressão.
- Backend FastAPI + SQLModel/SQLite; frontend React 18 + Vite + Tailwind + Zustand + Radix UI; distribuição desktop via Electron (portable).
- Restrição técnica: banco local SQLite — sem servidor central; cada instalação é autônoma.
- **Em aberto (decidido ainda):** suporte a múltiplos contextos/igrejas por instalação — o modelo tem campo `contexto_padrao`, mas o comportamento multi-igreja não está confirmado.

## Brand Commitments

- Nome: **Gestão Igreja** (executável/produto: `GestaoIgreja`).
- Nenhuma identidade visual formalizada como vínculo obrigatório até o momento.

## Evidence on Hand

- Importações reais de acervo por conjunto (CSV/PDF em `backend/`).
- Banco de dados local em uso (`orquestra.db`) com dados reais da operação.
- Não há depoimentos, casos de uso documentados ou material de imprensa — nada disso deve ser inventado.

## Product Principles

1. **Offline primeiro:** toda função essencial precisa funcionar sem internet.
2. **O impresso é o entregável:** a programação do culto sai pronta para imprimir, sem retrabalho manual.
3. **Secretaria consegue sozinha:** operação simples para quem não é técnico; nada depende de linha de comando.
4. **Dados locais são a verdade:** o que está gravado no SQLite da instalação é a fonte oficial.
