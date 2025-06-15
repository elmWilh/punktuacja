(function(){
    let css = `
    .auto-found-panel {
      position: fixed;
      bottom: 40px;
      right: 20px;
      width: 340px;
      max-height: 440px;
      overflow-y: auto;
      background: rgba(28, 28, 30, 0.8);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid #3A3A3C;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      z-index: 9999;
      color: #F5F5F7;
      padding: 15px;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Roboto", sans-serif;
      animation: slideUp 0.5s ease-out;
    }
  
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0);   opacity: 1; }
    }
  
    .auto-found-panel header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
  
    .auto-found-panel header .title {
      font-size: 16px;
      font-weight: 600;
    }
  
    .auto-found-panel header .close-btn {
      background: transparent;
      border: none;
      font-size: 18px;
      color: #F5F5F7;
      cursor: pointer;
      padding: 0 6px;
      transition: color 0.2s;
    }
    .auto-found-panel header .close-btn:hover {
      color: #0A84FF;
    }
  
    /* Блок с чекбоксом и подписью — делаем компактным */
    .auto-found-panel .toggle-container {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 12px;
      padding: 0;
      background: none;
    }
  
    .auto-found-panel .toggle-container label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      cursor: pointer;
      user-select: none;
      color: #F5F5F7;
      margin: 0;
    }
  
    .auto-found-panel .toggle-container input[type="checkbox"] {
      transform: scale(1.0);
      cursor: pointer;
    }
  
    .auto-found-panel .toggle-container label:hover {
      color: #0A84FF;
    }
  
    /* Обёртка для списка */
    .auto-found-panel .list-container {
      border: 1px solid #3A3A3C;
      border-radius: 8px;
      padding: 8px;
      background: rgba(44,44,46,0.3);
    }
  
    /* Сами списки / элементы */
    .auto-found-panel ul {
      list-style: none;
      margin: 0;
      padding: 0;
      max-width: 100%;
      overflow-wrap: anywhere;
    }
  
    .auto-found-panel ul li {
      padding: 6px 0;
      border-bottom: 1px solid #3A3A3C;
      font-size: 0.9em;
    }
    .auto-found-panel ul li:last-child {
      border-bottom: none;
    }
  
    /* Скроллбар */
    .auto-found-panel::-webkit-scrollbar {
      width: 8px;
    }
    .auto-found-panel::-webkit-scrollbar-track {
      background: rgba(44,44,46,0.4);
      border-radius: 4px;
    }
    .auto-found-panel::-webkit-scrollbar-thumb {
      background: #0A84FF;
      border-radius: 4px;
    }
    .auto-found-panel::-webkit-scrollbar-thumb:hover {
      background: #0077EE;
    }
  
    `;
  
    console.log("START CONTENT.JS")
    const host = window.location.host;
    if (host.includes('ersa.emea.intra.acer.com')) {
      const hoster = window.location.host;
      let styleEl = document.createElement("style");
      styleEl.textContent = css;
      document.head.appendChild(styleEl);
    
      fetch(chrome.runtime.getURL('data.csv'))
        .then(response => response.text())
        .then(csvText => {
          let csvData = csvText.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => {
              let parts = line.split(',').map(p => p.trim());
              return { 
                code: parts[0] || '', 
                name: parts[1] || '', 
                points: parts[2] || '' 
              };
            });
          let inputValues = Array.from(document.querySelectorAll('input, textarea'))
            .map(el => el.value)
            .join(' ');
          let pageText = (document.body.innerText + " " + inputValues).toLowerCase();
          let foundRows = csvData.filter(row => {
            return pageText.includes(row.code.toLowerCase()) || pageText.includes(row.name.toLowerCase());
          });
          if(foundRows.length === 0) return;
          if (pageText.includes("Liquidator") || pageText.includes("Liquidation") || pageText.includes("liquidation") || pageText.includes("stow:nonbmvd-unsellable") || pageText.includes("donation")) {
            foundRows = foundRows.map(row => {
              let pointsNum = parseFloat(row.points);
              if (!isNaN(pointsNum)) {
                row.points = (pointsNum * 0.75).toFixed(3);
                console.log("[PNKT LOG]Liquidator detected")
              }
              return row;
            });
          }
    
          let panel = document.createElement('div');
          panel.className = 'auto-found-panel';
    
          let header = document.createElement('header');
          let title = document.createElement('div');
          title.className = 'title';
          title.setAttribute("data-i18n", "foundOnSite");
          title.textContent = "Found in site:";
          header.appendChild(title);
    
          let closeButton = document.createElement('button');
          closeButton.className = 'close-btn';
          closeButton.textContent = '✕';
          closeButton.onclick = function(){ panel.remove(); };
          header.appendChild(closeButton);
          panel.appendChild(header);
    
          let toggleContainer = document.createElement('div');
          toggleContainer.className = 'toggle-container';
          let toggleLabel = document.createElement('label');
          let toggleCheckbox = document.createElement('input');
          toggleCheckbox.type = 'checkbox';
          toggleLabel.appendChild(toggleCheckbox);
          toggleLabel.appendChild(document.createTextNode("Sort mode"));
          toggleContainer.appendChild(toggleLabel);
          panel.appendChild(toggleContainer);
    
          let listContainer = document.createElement('div');
          panel.appendChild(listContainer);
    
          function renderList(){
            listContainer.innerHTML = '';
            if(toggleCheckbox.checked){
              let groups = {};
              foundRows.forEach(row => {
                if(!groups[row.name]) groups[row.name] = [];
                groups[row.name].push(row);
              });
              let ul = document.createElement('ul');
              for(let device in groups){
                let group = groups[device];
                let pointsCount = {};
                group.forEach(r => {
                  let pt = r.points;
                  if(!pointsCount[pt]) pointsCount[pt] = 0;
                  pointsCount[pt]++;
                });
                let uniquePoints = Object.keys(pointsCount);
                let li = document.createElement('li');
                if(uniquePoints.length === 1){
                  li.innerHTML = `<strong>${device}</strong> — ${uniquePoints[0]}${pointsCount[uniquePoints[0]] > 1 ? ' (x' + pointsCount[uniquePoints[0]] + ')' : ''}`;
                  ul.appendChild(li);
                } else {
                  let majorityPt = uniquePoints[0];
                  let majorityCount = pointsCount[majorityPt];
                  uniquePoints.forEach(pt => {
                    if(pointsCount[pt] > majorityCount){ 
                      majorityPt = pt; 
                      majorityCount = pointsCount[pt]; 
                    }
                  });
                  li.innerHTML = `<strong>${device}</strong> — ${majorityPt}${majorityCount > 1 ? ' (x' + majorityCount + ')' : ''}`;
                  ul.appendChild(li);
                  uniquePoints.forEach(pt => {
                    if(pt !== majorityPt){
                      let diffLi = document.createElement('li');
                      diffLi.style.paddingLeft = '20px';
                      diffLi.style.fontSize = 'smaller';
                      diffLi.textContent = `${device} — ${pt}${pointsCount[pt] > 1 ? ' (x' + pointsCount[pt] + ')' : ''}`;
                      ul.appendChild(diffLi);
                    }
                  });
                }
              }
              listContainer.appendChild(ul);
            } else {
              let ul = document.createElement('ul');
              foundRows.forEach(row => {
                let li = document.createElement('li');
                li.innerHTML = `<strong>${row.code}</strong> — ${row.name} : <span>${row.points}</span>`;
                ul.appendChild(li);
              });
              listContainer.appendChild(ul);
            }
          }
    
          toggleCheckbox.addEventListener('change', function() {
            localStorage.setItem("smartSort", toggleCheckbox.checked);
            renderList();
          });
          toggleCheckbox.checked = localStorage.getItem("smartSort") === "true";
          renderList();
    
          document.body.appendChild(panel);
          if (typeof applyTranslations === "function") {
            applyTranslations(localStorage.getItem("appLanguage") || "ru");
          }
        });
    }
    // ---------------------------------------------- Autoclicker test functions -----------
  
    function showNotification(message, duration = 3000) {
      const n = document.createElement('div');
      n.innerText = message;
      n.style.position = 'fixed';
      n.style.top = '20px';
      n.style.right = '20px';
      n.style.backgroundColor = 'rgba(0,0,0,0.8)';
      n.style.color = '#fff';
      n.style.padding = '10px 20px';
      n.style.borderRadius = '5px';
      n.style.zIndex = '9999';
      document.body.appendChild(n);
      setTimeout(() => n.remove(), duration);
    }
    
    const STORAGE_KEY = 'autoclicker_lpn';
    const MIN_LPN_LENGTH = 4;
    const CLICK_DELAY = 1000;
    let autoClickEnabled = false;
    const autoClickCheckbox = document.getElementById("autoberCheckbox");
    const getStoredLpn = () => sessionStorage.getItem(STORAGE_KEY) || '';
    const saveLpn = (lpn) => { sessionStorage.setItem(STORAGE_KEY, lpn); console.log("LPN сохранён:", lpn); };
    const simulateClick = (el) => { if (el) el.click(); };
    function activateExtension(extensionId) {
      if (!chrome || !chrome.management) { console.log("chrome.management API not available"); return; }
      chrome.management.get(extensionId, function (extInfo) {
        if (chrome.runtime.lastError) { console.log("Error retrieving extension info: " + chrome.runtime.lastError.message); return; }
        if (extInfo.enabled) { console.log("Extension " + extInfo.name + " is already enabled"); }
        else {
          chrome.management.setEnabled(extensionId, true, function () {
            if (chrome.runtime.lastError) { console.log("Error enabling extension: " + chrome.runtime.lastError.message); }
            else { console.log("Extension " + extInfo.name + " activated"); }
          });
        }
      });
    }
    function attachLpnInputListener() {
      document.addEventListener("input", (event) => {
        const target = event.target;
        if (target && target.tagName.toLowerCase() === "input") {
          const lpn = target.value.trim();
          if (lpn.length >= MIN_LPN_LENGTH) saveLpn(lpn);
        }
      });
    }
    function findElementByText(selectors, searchText) {
      const elements = document.querySelectorAll(selectors);
      for (const el of elements) {
        const text = (el.textContent || el.value || '').trim();
        if (text.toLowerCase().includes(searchText.toLowerCase())) return el;
      }
      return null;
    }
    function setInputValue(selector, value) {
      const inputField = document.querySelector(selector);
      if (inputField) {
        inputField.focus();
        inputField.value = value;
        inputField.dispatchEvent(new Event('input', { bubbles: true }));
        inputField.dispatchEvent(new Event('change', { bubbles: true }));
        inputField.blur();
      }
    }
    function autofillFields() {
      const bodyText = document.body.innerText;
      console.log("Запуск autofillFields()");
      const inputField = document.querySelector('input');
      const enterEl = findElementByText('input, button, a', 'enter');
      if (bodyText.includes('Scan Workstation')) {
        if (inputField) {
          setInputValue("input", "Stanowisko 53");
          simulateClick(enterEl);
          console.log('Поле ввода заполнено значением: Stanowisko 53');
        }
      }
      if (bodyText.includes('Scan Warehouse ID')) {
        if (inputField) {
          setInputValue("input", "RPXA");
          simulateClick(enterEl);
        }
      }
      if (bodyText.includes('Scan Item')) {
        activateExtension("gemekeidfocjmomalohgoampedmcfepl");
      }
    }
    function autoClickCard(targetText, cardSelector = 'div') {
      const cards = document.querySelectorAll(cardSelector);
      for (let card of cards) {
        if (card.innerText.includes(targetText) && !card.dataset.clicked) {
          const cardElement = card.closest(cardSelector);
          if (cardElement) {
            cardElement.click();
            card.dataset.clicked = "true";
            console.log(`Клик выполнен по карточке: "${targetText}"`);
            return;
          }
        }
      }
      console.log(`Карточка "${targetText}" не найдена или уже обработана`);
    }
    function processPanels(questionText, answerTexts, cardSelector = 'div', buttonText = 'Done') {
      const panels = document.querySelectorAll('div');
      panels.forEach((panel) => {
        if (panel.innerText.includes(questionText) && !panel.dataset.processed) {
          const cards = panel.querySelectorAll(cardSelector);
          let cardClicked = false;
          cards.forEach((card) => {
            if (!card.dataset.clicked) {
              for (const answer of answerTexts) {
                if (card.innerText.includes(answer)) {
                  card.click();
                  card.dataset.clicked = "true";
                  cardClicked = true;
                  console.log("Нажата карточка с ответом: " + answer);
                  break;
                }
              }
            }
          });
          if (cardClicked) {
            const potentialButtons = panel.querySelectorAll('button, div, input');
            let foundButton = null;
            potentialButtons.forEach((btn) => {
              if (btn.innerText.trim() === buttonText && !foundButton) foundButton = btn;
            });
            if (foundButton) {
              setTimeout(() => { foundButton.click(); console.log("Нажата кнопка: " + buttonText); }, CLICK_DELAY);
            } else {
              console.log("Кнопка '" + buttonText + "' не найдена");
              showNotification("тут сами нажмите на кнопку");
            }
            panel.dataset.processed = "true";
          }
        }
      });
    }
    function autoClickHandler() {
      const bodyText = document.body.innerText;
      const continueEl = findElementByText('input, button, a', 'Yes');
      if (bodyText.includes("Does the item present an immediate safety risk?")) { autoClickCard("No", ".answer-card"); }
      if (bodyText.includes("Item evaluation complete?")) { simulateClick(continueEl); }
      if (bodyText.includes("Item Damage Type")) { processPanels("Item Damage Type", ["Broken"], 'div', "Done"); }
      if (bodyText.includes("What is the customer describing?")) { autoClickCard("Opinion/ No Defect", ".answer-card"); }
      if (bodyText.includes("Do accessories have cracks, scratches or other blemishes?")) { autoClickCard("No", ".answer-card"); }
      if (bodyText.includes("Please remove any remaining customer information from the item and outer packaging. Were you able to successfully remove it?")) { autoClickCard("Yes", ".answer-card"); }
      if (bodyText.includes("Internal Memory Alert- the item could contain stored data. Is the item wiped/cleared of any existing data?")) { processPanels("Internal Memory Alert- the item could contain stored data. Is the item wiped/cleared of any existing data?", ["No"], ".answer-card"); }
      if (bodyText.includes("Is the item powered by electricity or battery?")) { processPanels("Is the item powered by electricity or battery?", ["Yes"], ".answer-card"); }
      if (bodyText.includes("Connect the device to an electrical outlet or a battery. Does the item turn ON?")) { processPanels("Connect the device to an electrical outlet or a battery. Does the item turn ON?", ["Yes"], ".answer-card"); }
      if (bodyText.includes("Select Power Plug Type")) { processPanels("Select Power Plug Type", ["Test not required"], ".answer-card"); }
      if (bodyText.includes("Does the item have a screen/display?")) { processPanels("Does the item have a screen/display?", ["No"], ".answer-card"); }
      if (bodyText.includes("Does the product have other problems related to its main function?")) { processPanels("Does the product have other problems related to its main function?", ["No"], ".answer-card"); }
      if (bodyText.includes("Item complete")) { activateExtension("gemekeidfocjmomalohgoampedmcfepl");}
    }
    function observeDOMChanges() {
      const observer = new MutationObserver(() => { if (autoClickEnabled) { autoClickHandler(); autofillFields(); } });
      observer.observe(document.body, { childList: true, subtree: true });
    }
    function initialize() {
      attachLpnInputListener();
      autoClickHandler();
      autofillFields(); 
  
      showNotification("Amazon detected",2000)
      observeDOMChanges();
      autoClickEnabled = true;
    }
    if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", initialize); }
    else { initialize(); }
  })();