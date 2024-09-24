// ==UserScript==
// @name         CAGEMATCH No Spoiler
// @namespace    https://github.com/fellini2vezes
// @version      5.0
// @description  Removes the results from matches and tournaments.
// @author       Fellini
// @match        https://www.cagematch.net/*
// @grant        none
// ==/UserScript==

// Código A

// Verifica se a URL contém os parâmetros desejados
function shouldRun() {
    const url = window.location.href;
    return /([&?]page=2|[&?]page=4|[?]id=111&|[?]id=112&view=search)/.test(url);
}

// Função para embaralhar array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Função para substituir palavras no texto
function replaceText(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        // Remove qualquer texto que contenha "(c)" e ajusta espaços
        node.textContent = node.textContent.replace(/\s*\(c\)\s*/g, '');
        // Remove texto entre colchetes
        node.textContent = node.textContent.replace(/\[[^\]]*\]/g, '');
        // Substitui "defeat", "defeats" e "and" por "vs." no nó de texto
        node.textContent = node.textContent.replace(/\bdefeats?\b/g, ' vs. ');
        node.textContent = node.textContent.replace(/\band\b/g, ' vs. ');
        // Remove "TITLE CHANGE !!!"
        node.textContent = node.textContent.replace(/TITLE CHANGE !!!/g, '');
        // Remove hífens que têm espaço antes ou depois
        node.textContent = node.textContent.replace(/ - | -/g, ' '); // Hífen com espaço antes
        node.textContent = node.textContent.replace(/ -/g, ''); // Hífen com espaço depois
        // Remove "by Count Out", "by DQ", "by TKO" e "No Contest"
        node.textContent = node.textContent.replace(/\bby Count Out\b/g, '');
        node.textContent = node.textContent.replace(/\bby DQ\b/g, '');
        node.textContent = node.textContent.replace(/\bby TKO\b/g, '');
        node.textContent = node.textContent.replace(/\No Contest/g, '');
        // Remove texto entre parênteses que contém números com ":"
        node.textContent = node.textContent.replace(/\s*\(\d+:\d+\)\s*/g, '');
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Itera sobre todos os filhos do nó
        node.childNodes.forEach(child => replaceText(child));
    }
}

// Função para desfazer alterações de um MatchCard específico
function undoChanges(card, originalContent) {
    card.innerHTML = originalContent; // Restaura o conteúdo original
}

// Função para refazer as alterações de um MatchCard específico
function redoChanges(card) {
    const fullText = card.innerHTML;

    // Divide o texto em grupos baseados em "defeat", "defeats", "and" ou "vs."
    let groups = fullText.split(/(\s+defeat\s+|\s+defeats\s+|\s+and\s+|\s+vs\.\s+)/).filter(Boolean);

    // Filtra os grupos que contêm links
    let linkGroups = [];
    for (let i = 0; i < groups.length; i++) {
        if (i % 2 === 0) {
            linkGroups.push(groups[i].trim());
        }
    }

    // Embaralha os grupos de links
    shuffleArray(linkGroups);

    // Reconstrói o conteúdo do 'MatchCard' com barreiras invisíveis
    let newContent = linkGroups.map(group => `${group} <span style="display: none;"></span>`).join(' vs. <span style="display: none;"></span> ');

    // Atualiza o conteúdo do 'MatchCard'
    card.innerHTML = newContent;

    // Substitui "defeat", "defeats" e "and" por "vs." no conteúdo do 'MatchCard'
    replaceText(card);
}

// Verifica se deve executar o código
if (shouldRun()) {
    // Seleciona todos os elementos com a classe 'MatchCard'
    let matchCards = document.querySelectorAll('.MatchCard');

    // Itera sobre cada elemento 'MatchCard'
    matchCards.forEach(card => {
        const originalContent = card.innerHTML;

        let fullText = card.innerHTML;

        let groups = fullText.split(/(\s+defeat\s+|\s+defeats\s+|\s+and\s+|\s+vs\.\s+)/).filter(Boolean);

        let linkGroups = [];
        for (let i = 0; i < groups.length; i++) {
            if (i % 2 === 0) {
                linkGroups.push(groups[i].trim());
            }
        }

        shuffleArray(linkGroups);

        let newContent = linkGroups.map(group => `${group} <span style="display: none;"></span>`).join(' vs. <span style="display: none;"></span> ');

        card.innerHTML = newContent;

        replaceText(card);

        // Cria um botão "show"
        const button = document.createElement('button');
        button.textContent = 'show';
        button.style.textAlign = 'center'; // Alinhamento horizontal
        button.style.verticalAlign = 'middle'; // Alinhamento vertical

        // Adiciona um evento de clique ao botão
        button.addEventListener('click', () => {
            if (button.textContent === 'show') {
                undoChanges(card, originalContent);
                button.textContent = 'hide';
            } else {
                redoChanges(card);
                button.textContent = 'show';
            }
        });

        // Adiciona o botão à célula "show" na linha correspondente
        const row = card.closest('.TRow1, .TRow2');
        const showCell = document.createElement('td');
        showCell.className = 'TCol TColSeparator';
        showCell.appendChild(button);
        showCell.style.textAlign = 'center';
        showCell.style.verticalAlign = 'middle';

        row.appendChild(showCell);
    });

    // Seleciona a linha de cabeçalho
    const headerRow = document.querySelector('.THeaderRow');

    const newHeaderCell = document.createElement('td');
    newHeaderCell.className = 'THeaderCol TColSeparator';
    newHeaderCell.textContent = 'Results';
    newHeaderCell.style.textAlign = 'center';
    newHeaderCell.style.verticalAlign = 'middle';

    headerRow.appendChild(newHeaderCell);
}

// Código B

// Verifica se o URL contém "&page=16"
if (window.location.href.includes("&page=16")) {
  // Cria um estilo para o botão "show" com as características padrão do site
  var style = document.createElement('style');
  style.innerHTML = `
    .hidden {
      visibility: hidden; /* Oculta o conteúdo original mas mantém o espaço */
      height: 0; /* Altura zero para não afetar o layout */
      overflow: hidden; /* Esconde qualquer conteúdo que transborde */
    }
    .visible {
      visibility: visible; /* Torna o conteúdo visível */
      height: auto; /* Restaura a altura original */
    }
  `;
  document.head.appendChild(style);

  // Função para adicionar o botão "show" nas linhas TRow1 e TRow2
  function addShowButton(row) {
    var td = row.querySelector('td:nth-child(5)');
    var originalContent = td.innerHTML; // Armazena o conteúdo original
    td.innerHTML = '<button class="button">show</button>'; // Substitui pelo botão "show" com a classe padrão

    // Cria um elemento para o conteúdo original que estará oculto
    var contentDiv = document.createElement('div');
    contentDiv.className = 'hidden'; // Inicialmente oculto
    contentDiv.innerHTML = originalContent; // Define o conteúdo original
    td.appendChild(contentDiv); // Adiciona o conteúdo ao <td>

    // Adiciona um evento de clique ao botão "show"
    td.querySelector('.button').addEventListener('click', function() {
      this.style.display = 'none'; // Esconde o botão "show"
      contentDiv.classList.toggle('hidden'); // Revela o conteúdo
      contentDiv.classList.toggle('visible'); // Torna o conteúdo visível

      // Transformar o conteúdo exibido em um botão
      var contentButton = document.createElement('button');
      contentButton.className = 'button'; // Use a classe padrão do botão
      contentButton.innerHTML = originalContent; // Texto do botão com o conteúdo original
      contentDiv.innerHTML = ''; // Limpa o conteúdo original
      contentDiv.appendChild(contentButton); // Adiciona o botão ao conteúdo

      // Adiciona um evento de clique ao botão de conteúdo
      contentButton.addEventListener('click', function() {
        contentDiv.classList.toggle('hidden'); // Esconde o conteúdo
        contentDiv.classList.toggle('visible'); // Torna o conteúdo invisível
        td.querySelector('.button').style.display = 'inline-block'; // Exibe novamente o botão "show"
        this.remove(); // Remove o botão após ocultar
      });
    });
  }

  // Aplica a funcionalidade nas linhas TRow1 e TRow2
  document.querySelectorAll('.TRow1, .TRow2').forEach(addShowButton);
}
