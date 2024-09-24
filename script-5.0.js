// ==UserScript==
// @name         CAGEMATCH No Spoiler
// @namespace    https://github.com/fellini2vezes
// @version      5.0
// @description  Removes the results from matches and tournaments.
// @author       Fellini
// @match        https://www.cagematch.net/*
// @grant        none
// ==/UserScript==

// Código A - Executa apenas em URLs específicas

// Verifica se a URL contém os parâmetros exatos desejados para Código A
function shouldRunCodeA() {
    const url = window.location.href;
    // Verifica se a URL contém exatamente "page=2", "page=4", "id=111" ou "id=112&view=search"
    return /([?&]page=(2|4)(?:&|$)|[?]id=111(?:&|$)|[?]id=112&view=search(?:&|$))/.test(url);
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
        node.textContent = node.textContent.replace(/\s*\(c\)\s*/g, '');
        node.textContent = node.textContent.replace(/\[[^\]]*\]/g, '');
        node.textContent = node.textContent.replace(/\bdefeats?\b/g, ' vs. ');
        node.textContent = node.textContent.replace(/\band\b/g, ' vs. ');
        node.textContent = node.textContent.replace(/TITLE CHANGE !!!/g, '');
        node.textContent = node.textContent.replace(/ - | -/g, ' ');
        node.textContent = node.textContent.replace(/ -/g, '');
        node.textContent = node.textContent.replace(/\bby Count Out\b/g, '');
        node.textContent = node.textContent.replace(/\bby DQ\b/g, '');
        node.textContent = node.textContent.replace(/\bby TKO\b/g, '');
        node.textContent = node.textContent.replace(/\No Contest/g, '');
        node.textContent = node.textContent.replace(/\s*\(\d+:\d+\)\s*/g, '');
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        node.childNodes.forEach(child => replaceText(child));
    }
}

// Verifica se deve executar o Código A
if (shouldRunCodeA()) {
    let matchCards = document.querySelectorAll('.MatchCard');

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

        const button = document.createElement('button');
        button.textContent = 'show';
        button.style.textAlign = 'center';
        button.style.verticalAlign = 'middle';

        button.addEventListener('click', () => {
            if (button.textContent === 'show') {
                card.innerHTML = originalContent;
                button.textContent = 'hide';
            } else {
                card.innerHTML = newContent;
                button.textContent = 'show';
            }
        });

        const row = card.closest('.TRow1, .TRow2');
        const showCell = document.createElement('td');
        showCell.className = 'TCol TColSeparator';
        showCell.appendChild(button);
        showCell.style.textAlign = 'center';
        showCell.style.verticalAlign = 'middle';

        row.appendChild(showCell);
    });

    const headerRow = document.querySelector('.THeaderRow');
    const newHeaderCell = document.createElement('td');
    newHeaderCell.className = 'THeaderCol TColSeparator';
    newHeaderCell.textContent = 'Results';
    newHeaderCell.style.textAlign = 'center';
    newHeaderCell.style.verticalAlign = 'middle';
    headerRow.appendChild(newHeaderCell);
}

// Código B

// Verifica se a URL contém exatamente "page=16" para Código B
function shouldRunCodeB() {
    const url = window.location.href;
    // Verifica se a URL contém exatamente "page=16"
    return /([?&]page=16(?:&|$))/.test(url);
}

// Executa Código B apenas se a URL corresponder a "page=16"
if (shouldRunCodeB()) {
    var style = document.createElement('style');
    style.innerHTML = `
        .hidden {
            visibility: hidden;
            height: 0;
            overflow: hidden;
        }
        .visible {
            visibility: visible;
            height: auto;
        }
    `;
    document.head.appendChild(style);

    function addShowButton(row) {
        var td = row.querySelector('td:nth-child(5)');
        var originalContent = td.innerHTML;
        td.innerHTML = '<button class="button">show</button>';

        var contentDiv = document.createElement('div');
        contentDiv.className = 'hidden';
        contentDiv.innerHTML = originalContent;
        td.appendChild(contentDiv);

        td.querySelector('.button').addEventListener('click', function() {
            this.style.display = 'none';
            contentDiv.classList.toggle('hidden');
            contentDiv.classList.toggle('visible');

            var contentButton = document.createElement('button');
            contentButton.className = 'button';
            contentButton.innerHTML = originalContent;
            contentDiv.innerHTML = '';
            contentDiv.appendChild(contentButton);

            contentButton.addEventListener('click', function() {
                contentDiv.classList.toggle('hidden');
                contentDiv.classList.toggle('visible');
                td.querySelector('.button').style.display = 'inline-block';
                this.remove();
            });
        });
    }

    document.querySelectorAll('.TRow1, .TRow2').forEach(addShowButton);
}
