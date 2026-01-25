# Guitar Architect

**Design your fretboard. Understand your music.**

🌐 **Aplicação online:**
[https://guitar-architect-4pbqzia2z-dilio-alvarengas-projects.vercel.app/](https://guitar-architect-4pbqzia2z-dilio-alvarengas-projects.vercel.app/)

> (Assim que a configuração DNS finalizar, este endereço será substituído por: [https://www.guitararchitect.com.br](https://www.guitararchitect.com.br))

---

## Visão Geral

Guitar Architect é um aplicativo web **offline-first** para criação, visualização e exportação de diagramas de braço de guitarra. Ele foi projetado para músicos, professores e estudantes que desejam compreender escalas, harmonia e relações intervalares diretamente no fretboard.

Principais recursos:

* Visualização de escalas com rótulos por **pontos, notas ou intervalos**
* Exibição de **tônica, tríades e tétrades por grau**
* Modo **canhoto**
* Camadas independentes (inlays, todas as notas, escala, tônica)
* Editor visual com:

  * **Marcadores personalizados**
  * **Conexões (linhas)** entre notas
  * **Undo / Redo** por instância
* Exportação em **PNG e PDF** (diagrama ativo ou todos)
* **Salvamento automático local** (funciona offline)

---

## ⚠️ Importante — Como funciona o sistema de Usuários e Projetos

Atualmente, o Guitar Architect **não utiliza servidor, banco de dados remoto ou autenticação online**. Todo o sistema é baseado em armazenamento local do navegador.

### 📁 Projetos

* Quando você cria ou edita um diagrama, os dados são salvos em formato **JSON** no **localStorage do navegador**.
* Esses dados ficam armazenados no computador do usuário, dentro do perfil do navegador (Chrome, Edge, Safari, etc.).

### 👤 Usuários (Login)

* O "login" funciona como um **perfil local**.
* O nome de usuário serve apenas para **filtrar quais projetos aparecem na lista**.
* Não existe autenticação real, conta online ou sincronização entre dispositivos.

### 💾 Persistência

* Se você fechar o navegador e voltar depois, seus projetos continuarão disponíveis.
* Porém, os dados serão **permanentemente apagados** se você:

  * Limpar os dados do site no navegador
  * Usar modo anônimo
  * Trocar de navegador
  * Formatar o computador

> **Recomendação:** sempre exporte seus diagramas importantes em PNG ou PDF para manter um backup externo.

---

## Stack Técnica

* **React + TypeScript**
* **Vite**
* Renderização em **SVG interativo**
* Exportação com **html2canvas** e **jsPDF**
* Persistência com **localStorage (debounce automático)**

---

## Rodar Localmente

### Pré-requisitos

* Node.js 18+
* npm ou yarn

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

### Build de Produção

```bash
npm run build
```

---

## Status do Projeto

🧊 **Baseline congelado:** v0.8.0-freeze

Este projeto segue uma abordagem de desenvolvimento baseada em **pontos de congelamento técnicos**, garantindo estabilidade antes da introdução de novas funcionalidades.

---

## Licença

Este projeto é distribuído para fins educacionais e experimentais. Consulte o autor para uso comercial.

---

## Autor

**DPDDA-tech**
Projeto desenvolvido por Dílio Alvarenga

---

> Visualize harmonia. Projete seu fretboard.
