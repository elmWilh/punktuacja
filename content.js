(function() {
  // CSS with fixes for animation and specificity
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
    .auto-found-panel .list-container {
      border: 1px solid #3A3A3C;
      border-radius: 8px;
      padding: 8px;
      background: rgba(44,44,46,0.3);
    }
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
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .auto-found-panel ul li:last-child {
      border-bottom: none;
    }
    .auto-found-panel ul li .copy-text {
      flex-grow: 1;
    }
    .auto-found-panel .copy-icon {
      width: 1.2em;
      height: 1.2em;
      margin-left: 8px;
      cursor: pointer;
      transition: background-color 0.3s, filter 0.3s;
      display: inline-block;
    }
    .auto-found-panel .copy-icon:hover {
      background-color: rgba(10, 132, 255, 0.2);
    }
    .auto-found-panel .edit-icon {
      width: 1.2em;
      height: 1.2em;
      margin-left: 8px;
      cursor: pointer;
      transition: background-color 0.3s, filter 0.3s;
      display: inline-block;
    }
    .auto-found-panel .edit-icon:hover {
      background-color: rgba(10, 132, 255, 0.2);
    }
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
    .yield-add-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      background: rgba(28, 28, 30, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid #3A3A3C;
      border-radius: 12px;
      padding: 15px;
      color: #F5F5F7;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0); opacity: 1; }
    }
    .yield-add-notification .title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .yield-add-notification .info {
      font-size: 13px;
      margin-bottom: 10px;
    }
    .yield-add-notification select {
      width: 100%;
      padding: 5px;
      margin-bottom: 10px;
      background: rgba(44,44,46,0.8);
      color: #F5F5F7;
      border: 1px solid #3A3A3C;
      border-radius: 6px;
    }
    .yield-add-notification .buttons {
      display: flex;
      gap: 10px;
    }
    .yield-add-notification button {
      flex: 1;
      padding: 8px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .yield-add-notification .add-btn {
      background: #0A84FF;
      color: #F5F5F7;
    }
    .yield-add-notification .add-btn:hover {
      background: #0077EE;
    }
    .yield-add-notification .cancel-btn {
      background: #3A3A3C;
      color: #F5F5F7;
    }
    .yield-add-notification .cancel-btn:hover {
      background: #4A4A4C;
    }
    .control-panel-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
    }
    .control-panel-toggle {
      width: 60px;
      height: 60px;
      background: rgba(28, 28, 30, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid #3A3A3C;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      transition: background 0.3s ease;
    }
    .control-panel-toggle:hover {
      background: rgba(44,44,46,0.9);
    }
    .control-panel-toggle span {
      font-size: 24px;
      color: #F5F5F7;
    }
    .control-panel {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 250px;
      max-height: 400px;
      overflow-y: auto;
      background: rgba(28, 28, 30, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid #3A3A3C;
      border-radius: 12px;
      padding: 12px;
      color: #F5F5F7;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: none;
      animation: slideUp 0.3s ease-out;
      transform-origin: bottom;
    }
    .control-panel.active {
      display: block;
      transform: translateY(0);
      opacity: 1;
    }
    .control-panel .section {
      margin-bottom: 12px;
    }
    .control-panel .section-title {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .control-panel input, .control-panel select {
      width: 100%;
      padding: 4px;
      margin-bottom: 8px;
      background: rgba(44,44,46,0.8);
      color: #F5F5F7;
      border: 1px solid #3A3A3C;
      border-radius: 6px;
    }
    .control-panel .question-item {
      margin-bottom: 8px;
      padding: 6px;
      border: 1px solid #3A3A3C;
      border-radius: 6px;
    }
    .control-panel .question-text {
      font-size: 12px;
      margin-bottom: 4px;
    }
    .control-panel::-webkit-scrollbar {
      width: 6px;
    }
    .control-panel::-webkit-scrollbar-track {
      background: rgba(44,44,46,0.4);
      border-radius: 3px;
    }
    .control-panel::-webkit-scrollbar-thumb {
      background: #0A84FF;
      border-radius: 3px;
    }
    .control-panel::-webkit-scrollbar-thumb:hover {
      background: #0077EE;
    }
  `;

  // Inject CSS
  let styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // Original ERSA-related code remains unchanged
  const host = window.location.host;
  if (host.includes("ersa.emea.intra.acer.com")) {
    const bodyTexts = document.body.innerText.toLowerCase();

    function getProductPrice() {
      const priceElem = document.querySelector("#PriceToProduct, .PriceToProduct, [name='ctl00$Maincontent$TBoCogs']");
      if (!priceElem) return null;
      const tag = priceElem.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea") {
        return priceElem.value.trim();
      } else {
        return priceElem.textContent.trim();
      }
    }

    function findLpnCode() {
      const lpnRegex = /\bLPN[a-zA-Z0-9]{8,}\b/g;
      let textContent = document.body.innerText;
      const inputValues = Array.from(document.querySelectorAll('input, textarea')).map(el => el.value).join(' ');
      textContent += ' ' + inputValues;
      const matches = textContent.match(lpnRegex);
      return matches ? matches[0] : null;
    }

    function addCopyIconToContainer(container, textToCopy) {
      let copyIcon = document.createElement('img');
      copyIcon.src = chrome.runtime.getURL('coppy.png');
      copyIcon.className = 'copy-icon';
      copyIcon.alt = 'Copy';
      copyIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        navigator.clipboard.writeText(textToCopy).then(() => {
          copyIcon.style.filter = 'brightness(150%)';
          setTimeout(() => { copyIcon.style.filter = ''; }, 500);
        });
      });
      container.appendChild(copyIcon);
    }

    function addEditIconToContainer(container, lpn) {
      let editIcon = document.createElement('img');
      editIcon.src = chrome.runtime.getURL('edit.png');
      editIcon.className = 'edit-icon';
      editIcon.alt = 'Edit';
      editIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        alert(`Edit functionality for LPN ${lpn} is not implemented yet. Please edit in the Yield Table manually.`);
      });
      container.appendChild(editIcon);
    }

    function addIcons(li, lpn, existsInYieldTable) {
      let textSpan = document.createElement('span');
      textSpan.className = 'copy-text';
      textSpan.innerHTML = li.innerHTML;
      li.innerHTML = '';
      li.appendChild(textSpan);
      if (existsInYieldTable) {
        addEditIconToContainer(li, lpn);
      } else {
        addCopyIconToContainer(li, li.getAttribute('data-points') || '');
      }
    }

    function sendToYieldTable(lpn, type, price, points) {
      chrome.storage.local.get(['db_mytable', 'activeDayId'], (res) => {
        let mainData = res['db_mytable'];
        let currentActiveDayId = res['activeDayId'];

        if (!mainData || !mainData.months || Object.keys(mainData.months).length === 0) {
          console.error("MyTable data not found or not initialized. Cannot add record from content.js.");
          return;
        }

        if (!currentActiveDayId) {
          console.warn("No active day selected in MyTable. Record not added from content.js.");
          return;
        }

        let targetMonthKey = null;
        let targetDayExists = false;

        for (const monthKey in mainData.months) {
          if (mainData.months[monthKey].days && mainData.months[monthKey].days[currentActiveDayId]) {
            targetMonthKey = monthKey;
            targetDayExists = true;
            break;
          }
        }

        if (!targetDayExists || !targetMonthKey) {
          console.error(`Active day ${currentActiveDayId} not found within any month in MyTable data. Record not added from content.js.`);
          return;
        }

        const record = {
          id: "r_" + Math.random().toString(36).substr(2, 9),
          lpn: String(lpn).trim().toUpperCase(),
          type: String(type),
          price: parseFloat(price) || 0,
          qty: parseFloat(points) || 0,
          comment: "Added automatically from ERSA"
        };

        const allExistingRecords = Object.values(mainData.months)
            .flatMap(month => month.days ? Object.values(month.days).flatMap(day => day.records) : []);
        if (allExistingRecords.some(r => r.lpn.toUpperCase() === record.lpn)) {
            console.warn(`LPN ${record.lpn} already exists in MyTable. Record not added from content.js to avoid duplicate.`);
            return;
        }

        mainData.months[targetMonthKey].days[currentActiveDayId].records.push(record);

        chrome.storage.local.set({ 'db_mytable': mainData }, () => {
          console.log(`Record ${record.lpn} added to ${targetMonthKey}/${currentActiveDayId} from content.js by ERSA automation.`);
        });
      });
    }

    function showYieldAddNotification(lpn, price, suggestedPoints) {
      const isBER = bodyTexts.includes("liquidator") || bodyTexts.includes("stow");
      const defaultType = isBER ? "BER" : "OK";
      const notification = document.createElement('div');
      notification.className = 'yield-add-notification';
      notification.innerHTML = `
        <div class="title">Add to Yield Table?</div>
        <div class="info">LPN: ${lpn} | Price: ${price || 'Not found'} | Points: ${suggestedPoints || 'Not found'}</div>
        <input id="yield-points-input" type="text" value="${suggestedPoints || ''}" style="width:100%; margin-bottom:10px; background:rgba(44,44,46,0.8); color:#F5F5F7; border:1px solid #3A3A3C; border-radius:6px; padding:5px;" />
        <select id="yield-type-select">
          <option value="OK" ${defaultType === "OK" ? "selected" : ""}>OK</option>
          <option value="BER" ${defaultType === "BER" ? "selected" : ""}>BER</option>
        </select>
        <div class="buttons">
          <button class="add-btn">Add</button>
          <button class="cancel-btn">Cancel</button>
        </div>
      `;
      document.body.appendChild(notification);

      notification.querySelector('.add-btn').addEventListener('click', () => {
        const selectedType = notification.querySelector('#yield-type-select').value;
        const pointsInput = notification.querySelector('#yield-points-input');
        let finalPoints = pointsInput.value;
        sendToYieldTable(lpn, selectedType, price, finalPoints);
        notification.remove();
      });

      notification.querySelector('.cancel-btn').addEventListener('click', () => {
        notification.remove();
      });
    }

    function findMajorityPoints(rows) {
      let pointsCount = {};
      rows.forEach(row => {
        let pt = row.points;
        if (!pointsCount[pt]) pointsCount[pt] = 0;
        pointsCount[pt]++;
      });
      let majorityPt = null;
      let majorityCount = 0;
      for (let [pt, count] of Object.entries(pointsCount)) {
        if (count > majorityCount) {
          majorityPt = pt;
          majorityCount = count;
        }
      }
      return majorityPt;
    }

    function checkYieldTableForLpn(lpn, callback) {
      chrome.storage.local.get(['db_mytable'], (result) => {
        let data = result['db_mytable'] || { days: {}, goal: { qty: 17, workingDays: 20 } };
        const allRecords = Object.keys(data.days).flatMap(day => data.days[day].records);
        const exists = allRecords.some(record => record.lpn.toLowerCase() === lpn.toLowerCase());
        callback(exists);
      });
    }

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

        let inputValues = Array.from(document.querySelectorAll('input, textarea')).map(el => el.value).join(' ');
        let pageText = (document.body.innerText + " " + inputValues).toLowerCase();

        let foundRows = csvData.filter(row => {
          return pageText.includes(row.code.toLowerCase()) || pageText.includes(row.name.toLowerCase());
        });
        if (foundRows.length === 0) return;

        if (pageText.includes("liquidator") || pageText.includes("stow")) {
          foundRows = foundRows.map(row => {
            let pointsNum = parseFloat(row.points);
            if (!isNaN(pointsNum)) {
              row.points = (pointsNum * 0.75).toFixed(3);
            }
            return row;
          });
        }

        if (pageText.includes("rapaired")) {
          foundRows = foundRows.map(row => {
            let pointsNum = parseFloat(row.points);
            if (!isNaN(pointsNum)) {
              row.points = (pointsNum + 0.2).toFixed(3);
            }
            return row;
          });
        }

        let panel = document.createElement('div');
        panel.className = 'auto-found-panel';

        let header = document.createElement('header');
        let title = document.createElement('div');
        title.className = 'title';
        title.textContent = "Found in site:";
        header.appendChild(title);

        let closeButton = document.createElement('button');
        closeButton.className = 'close-btn';
        closeButton.textContent = '✕';
        closeButton.onclick = function() { panel.remove(); };
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

        let productPriceContainer = document.createElement('div');
        productPriceContainer.className = 'product-price-container';
        let priceLabel = document.createElement('div');
        priceLabel.textContent = 'Product Price:';
        productPriceContainer.appendChild(priceLabel);

        let priceValueSpan = document.createElement('span');
        priceValueSpan.className = 'price-text';
        let productPrice = getProductPrice();
        priceValueSpan.textContent = productPrice ? productPrice : "Not found";
        productPriceContainer.appendChild(priceValueSpan);

        addCopyIconToContainer(productPriceContainer, priceValueSpan.textContent);
        panel.appendChild(productPriceContainer);

        let listContainer = document.createElement('div');
        panel.appendChild(listContainer);

        function renderList() {
          listContainer.innerHTML = '';
          let ul = document.createElement('ul');

          if (toggleCheckbox.checked) {
            let groups = {};
            foundRows.forEach(row => {
              if (!groups[row.name]) groups[row.name] = [];
              groups[row.name].push(row);
            });

            for (let device in groups) {
              let group = groups[device];
              let pointsCount = {};
              group.forEach(r => {
                let pt = r.points;
                if (!pointsCount[pt]) pointsCount[pt] = 0;
                pointsCount[pt]++;
              });

              let uniquePoints = Object.keys(pointsCount);
              if (uniquePoints.length === 1) {
                let li = document.createElement('li');
                let singlePt = uniquePoints[0];
                let count = pointsCount[singlePt];
                li.innerHTML = `<strong>${device}</strong> — ${singlePt}${count > 1 ? ' (x' + count + ')' : ''}`;
                li.setAttribute('data-points', singlePt);
                checkYieldTableForLpn(group[0].code, (exists) => {
                  let message = exists ? ' (In Yield Table - Edit)' : '';
                  li.innerHTML += message;
                  addIcons(li, group[0].code, exists);
                });
                ul.appendChild(li);
              } else {
                let majorityPt = uniquePoints[0];
                let majorityCount = pointsCount[majorityPt];
                uniquePoints.forEach(pt => {
                  if (pointsCount[pt] > majorityCount) {
                    majorityPt = pt;
                    majorityCount = pointsCount[pt];
                  }
                });

                let li = document.createElement('li');
                li.innerHTML = `<strong>${device}</strong> — ${majorityPt}${majorityCount > 1 ? ' (x' + majorityCount + ')' : ''}`;
                li.setAttribute('data-points', majorityPt);
                checkYieldTableForLpn(group[0].code, (exists) => {
                  let message = exists ? ' (In Yield Table - Edit)' : '';
                  li.innerHTML += message;
                  addIcons(li, group[0].code, exists);
                });
                ul.appendChild(li);

                uniquePoints.forEach(pt => {
                  if (pt !== majorityPt) {
                    let diffLi = document.createElement('li');
                    diffLi.style.paddingLeft = '20px';
                    diffLi.style.fontSize = 'smaller';
                    diffLi.textContent = `${device} — ${pt}${pointsCount[pt] > 1 ? ' (x' + pointsCount[pt] + ')' : ''}`;
                    diffLi.setAttribute('data-points', pt);
                    checkYieldTableForLpn(group[0].code, (exists) => {
                      let message = exists ? ' (In Yield Table - Edit)' : '';
                      diffLi.textContent += message;
                      addIcons(diffLi, group[0].code, exists);
                    });
                    ul.appendChild(diffLi);
                  }
                });
              }
            }
          } else {
            foundRows.forEach(row => {
              let li = document.createElement('li');
              li.innerHTML = `<strong>${row.code}</strong> — ${row.name} : <span>${row.points}</span>`;
              li.setAttribute('data-points', row.points);
              checkYieldTableForLpn(row.code, (exists) => {
                let message = exists ? ' (In Yield Table - Edit)' : '';
                li.innerHTML += message;
                addIcons(li, row.code, exists);
              });
              ul.appendChild(li);
            });
          }
          listContainer.appendChild(ul);
        }

        toggleCheckbox.addEventListener('change', function() {
          localStorage.setItem("smartSort", toggleCheckbox.checked);
          renderList();
        });
        toggleCheckbox.checked = localStorage.getItem("smartSort") === "true";
        renderList();
        document.body.appendChild(panel);

        const lpn = findLpnCode();
        if (lpn && productPrice) {
          checkYieldTableForLpn(lpn, (exists) => {
            if (!exists) {
              const majorityPoints = findMajorityPoints(foundRows);
              showYieldAddNotification(lpn, productPrice, majorityPoints);
            }
          });
        }

        async function activateEditMode() {
          let attempts = 0;
          const maxAttempts = 5;
          const delayBetweenAttempts = 1000; 

          while (attempts < maxAttempts) {
            const editLinks = document.querySelectorAll("a");
            for (const link of editLinks) {
              if (link.textContent.trim().toLowerCase() === "edit") {
                const clickEvent = new Event('click', { bubbles: true, cancelable: true });
                link.dispatchEvent(clickEvent);
                console.log(`Attempt ${attempts + 1}: Clicked Edit link`);
                
                await new Promise(resolve => setTimeout(resolve, 500));
                if (document.body.innerText.toLowerCase().includes('edit mode')) {
                  console.log('Successfully entered Edit mode');
                  return true;
                }
              }
            }
            attempts++;
            console.warn(`Attempt ${attempts}: Edit link not activated, retrying...`);
            await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
          }
          console.error('Failed to activate Edit mode after maximum attempts');
          return false;
        }

        async function activateListItemByText(targetText = "Finalize Case") {
          const listItems = document.querySelectorAll("li");
          for (const item of listItems) {
            const link = item.querySelector("a");
            if (link && link.textContent.trim() === targetText) {
              if (link.click) {
                link.click();
              } else {
                const clickEvent = new Event('click', {
                  bubbles: true,
                  cancelable: true
                });
                link.dispatchEvent(clickEvent);
              }
              await new Promise(resolve => setTimeout(resolve, 500));
              if (item.classList.contains('active')) {
                console.log('Элемент успешно активирован');
              } else {
                console.log('Класс active не добавился, пробуем альтернативный клик');
                item.dispatchEvent(new Event('click', { bubbles: true }));
              }
              return true;
            }
          }
          return false;
        }

        async function autoPickup() {
          if (bodyTexts.includes('status')) {
            const possibleButtons = document.querySelectorAll('button, input[type="submit"]');
            for (const btn of possibleButtons) {
              const val = (btn.value || btn.innerText || "").trim();
              if (val === "Pickup for Repair") {
                btn.click();
                await new Promise(resolve => setTimeout(resolve, 500));
                return true;
              }
            }
          }
          return false;
        }

        async function runAutoClickSequence() {
          try {
            const states = await new Promise(resolve => {
              chrome.storage.sync.get([
                'autoClickerTRexState',
                'autoEditState',
                'autoPickupState'
              ], resolve);
            });

            if (states.autoClickerTRexState) {
              await activateListItemByText("Finalize Case");
            }
            if (states.autoPickupState) {
              await autoPickup();
            }
            if (states.autoEditState) {
              await activateEditMode();
            }
          } catch (error) {
            console.error("Ошибка в автокликере:", error);
          }
        }

        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
          if (message.action === 'toggleAutoClickerTRex') {
            if (message.enabled && (bodyTexts.includes('case - details') || bodyTexts.includes('parts'))) {
              activateListItemByText("Finalize Case");
            }
          }
          if (message.action === 'toggleAutoEdit') {
            if (message.enabled && bodyTexts.includes('search result')) {
              activateEditMode();
            }
          }
          if (message.action === 'toggleShowProductInfo') {
            console.log('Show Product Info toggled:', message.enabled);
          }
          if (message.action === 'toggleAutoPickup') {
            if (message.enabled && bodyTexts.includes('status')) {
              autoPickup();
            }
          }
        });

        chrome.storage.sync.get([
          'autoClickerTRexState',
          'autoEditState',
          'autoPickupState'
        ], (result) => {
          if (bodyTexts.includes('search result') && result.autoEditState) {
            activateEditMode();
          } else if ((bodyTexts.includes('case - details') || bodyTexts.includes('parts')) &&
                    (result.autoClickerTRexState || result.autoPickupState)) {
            runAutoClickSequence();
          }
        });
      });
  }

  // Amazon-specific code with fixed autoclicker implementation
  const STORAGE_KEY = 'autoclicker_lpn';
  const MIN_LPN_LENGTH = 4;

  // Question-Answer database
  const questionDatabase = {
    "Does the item present an immediate safety risk?": {
      answers: ["No", "Yes"],
      selected: "No"
    },
    "What is the customer describing?": {
      answers: ["Opinion/ No Defect", "Other"],
      selected: "Opinion/ No Defect"
    },
    "Internal Memory Alert- the item could contain stored data. Is the item wiped/cleared of any existing data?": {
      answers: ["Yes, using manual", "Yes, using my own knowledge", "No, manual not avalible", "No, wiping unsuccessful", "Not Internal Memory"],
      selected: "Yes, using manual"
    },
    "Do accessories have cracks, scratches or other blemishes?": {
      answers: ["No", "Yes"],
      selected: "No"
    },
    "Is the item powered by electricity or battery?": {
      answers: ["Yes", "No"],
      selected: "Yes"
    },
    "Does the item turn ON?": {
      answers: ["Yes", "No", "Unable to test due to safety reason", "Test not possible, non functional item", "I do not have the tools to turn on the item"],
      selected: "Yes"
    },
    "Connect the device to an electrical outlet or a battery. Does the item turn ON?": {
      answers: ["Yes", "No"],
      selected: "Yes"
    },
    "Select Power Plug Type": {
      answers: ["Test not required", "Other Plug", "Shaer plug", "OtItem is travel adapterher", "Not Required"],
      selected: "Test not required"
    },
    "Does the item have a screen/display?": {
      answers: ["No", "Yes"],
      selected: "No"
    },
    "Does the product have other problems related to its main function?": {
      answers: ["No", "Yes"],
      selected: "No"
    }
  };

  // Control panel state
  let controlPanelState = {
    autoclickSpeed: 500,
    currentLpn: '',
    questions: questionDatabase
  };

  function saveControlPanelState() {
    chrome.storage.sync.set({ controlPanelState }, () => {
      console.log('Control panel state saved');
    });
  }

  function loadControlPanelState(callback) {
    chrome.storage.sync.get(['controlPanelState'], (result) => {
      if (result.controlPanelState) {
        controlPanelState = { ...controlPanelState, ...result.controlPanelState };
      }
      callback();
    });
  }

  function getStoredLpn() {
    return controlPanelState.currentLpn;
  }

  function saveLpn(lpn) {
    controlPanelState.currentLpn = lpn;
    saveControlPanelState();
    updateControlPanel();
    console.log("LPN сохранён:", lpn);
  }

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

  function simulateClick(el) {
    if (el) {
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      el.dispatchEvent(clickEvent);
      console.log(`Simulated click on element:`, el);
    } else {
      console.warn('Element for click not found');
    }
  }

  function setInputValue(selector, value) {
    const inputField = document.querySelector(selector);
    if (inputField) {
      inputField.click();
      inputField.focus();
      inputField.value = value;
      inputField.dispatchEvent(new Event('input', { bubbles: true }));
      inputField.dispatchEvent(new Event('change', { bubbles: true }));
      inputField.blur();
      console.log(`Set input value: ${value}`);
    } else {
      console.warn(`Input field not found for selector: ${selector}`);
    }
  }

  function findElementByText(selectors, searchText) {
    const elements = document.querySelectorAll(selectors);
    for (const el of elements) {
      const text = (el.textContent || el.value || el.innerText || '').trim().toLowerCase();
      if (text.includes(searchText.toLowerCase())) {
        return el;
      }
    }
    console.warn(`No element found with text: ${searchText}`);
    return null;
  }

  // New function to send LPN and result to ERSA
  async function sendLpnToErsa(lpn) {
    try {
      let result = '';
      let finalLpn = lpn;

      if (window.location.href.startsWith('https://trex')) {
        const x = document.getElementById("item-complete-graphic");
        if (x) {
          finalLpn = x.parentNode.querySelectorAll("p")[0]?.innerText.split(": ")[1] || finalLpn;
          result = x.parentNode.querySelectorAll("p")[2]?.innerText.replace("Item sent to ", "") || '';
        } else {
          console.warn("item-complete-graphic not found, skipping ERSA send");
          return;
        }
      } else {
        const x = document.getElementsByClassName('col-md-5');
        if (x[0]) {
          finalLpn = x[0].innerText.split("\n")[1] || finalLpn;
          result = document.getElementById("gc-item-destination")?.innerHTML || '';
        } else {
          console.warn("col-md-5 not found, skipping ERSA send");
          return;
        }
      }

      if (!finalLpn.includes("LPN")) {
        console.warn("Valid LPN not found, skipping ERSA send");
        return;
      }

      const data = {
        LPN: finalLpn,
        Result: result
      };

      console.log("Отправляем:", data);

      await fetch("https://ersa.emea.intra.acer.com/WebServiceRest/API/GTResult?GTResult=" + encodeURIComponent(JSON.stringify(data)), {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "text/plain"
        },
        mode: "no-cors"
      });

      console.log("Успешно отправлено");
    } catch (err) {
      console.error("Ошибка при сборе или отправке:", err);
    }
  }

  // New card model system
  class QuestionCardModel {
    constructor(questionText) {
      this.questionText = questionText;
      this.cards = [];
      this.element = null;
    }

    scanCards() {
      const panels = document.querySelectorAll('div');
      for (const panel of panels) {
        if (panel.innerText.includes(this.questionText) && !panel.dataset.processed) {
          this.element = panel;
          this.cards = Array.from(panel.querySelectorAll('.answer-card')).map(card => ({
            element: card,
            text: card.innerText.trim(),
            clicked: card.dataset.clicked === 'true'
          }));
          panel.dataset.processed = 'true';
          break;
        }
      }
    }

    selectAnswer(answerText) {
      this.scanCards();
      const card = this.cards.find(c => c.text.includes(answerText) && !c.clicked);
      if (card) {
        card.element.click();
        card.clicked = true;
        card.element.dataset.clicked = 'true';
        console.log(`Selected answer: ${answerText} for question: ${this.questionText}`);
        return true;
      }
      return false;
    }

    clickButton(buttonText = 'Done') {
      if (!this.element) return;
      const buttons = document.querySelectorAll('button, div');
      for (const btn of buttons) {
        if (btn.innerText.trim() === buttonText) {
          setTimeout(() => {
            btn.click();
            console.log(`Clicked button: ${buttonText}`);
          }, controlPanelState.autoclickSpeed);
          break;
        }
      }
    }
  }

  // Control panel rendering
  function renderControlPanel() {
    if (document.querySelector('.control-panel-container')) {
      console.log('Control panel already exists, skipping creation');
      return;
    }

    const container = document.createElement('div');
    container.className = 'control-panel-container';

    const toggle = document.createElement('div');
    toggle.className = 'control-panel-toggle';
    toggle.innerHTML = '<span>⚙️</span>';

    const panel = document.createElement('div');
    panel.className = 'control-panel'; // Removed 'active' class to start collapsed

    container.appendChild(panel);
    container.appendChild(toggle);
    document.body.appendChild(container);

    toggle.addEventListener('click', () => {
      if (panel.classList.contains('active')) {
        panel.classList.remove('active');
        toggle.innerHTML = '<span>⚙️</span>';
      } else {
        panel.classList.add('active');
        toggle.innerHTML = '<span>✕</span>';
        updateControlPanel();
      }
    });

    updateControlPanel();
  }

  function updateControlPanel() {
    const panel = document.querySelector('.control-panel');
    if (!panel) return;

    panel.innerHTML = `
      <div class="section">
        <div class="section-title">Autoclicker Settings</div>
        <label>Speed (ms):</label>
        <input type="number" id="autoclick-speed" value="${controlPanelState.autoclickSpeed}" min="100" max="5000">
      </div>
      <div class="section">
        <div class="section-title">Current LPN</div>
        <input type="text" id="current-lpn" value="${controlPanelState.currentLpn}" readonly>
      </div>
      <div class="section">
        <div class="section-title">Question Settings</div>
        ${Object.entries(controlPanelState.questions).map(([question, data]) => `
          <div class="question-item">
            <div class="question-text">${question}</div>
            <select class="question-answer" data-question="${question}">
              ${data.answers.map(answer => `
                <option value="${answer}" ${answer === data.selected ? 'selected' : ''}>${answer}</option>
              `).join('')}
            </select>
          </div>
        `).join('')}
      </div>
    `;

    panel.querySelector('#autoclick-speed').addEventListener('change', (e) => {
      controlPanelState.autoclickSpeed = parseInt(e.target.value);
      saveControlPanelState();
    });

    panel.querySelectorAll('.question-answer').forEach(select => {
      select.addEventListener('change', (e) => {
        const question = e.target.dataset.question;
        controlPanelState.questions[question].selected = e.target.value;
        saveControlPanelState();
      });
    });
  }

  // Amazon autoclicker logic
  if (host.includes('amazon.com')) {
    console.log("AMAZON DETECTED");

    // Initialize control panel
    loadControlPanelState(() => {
      renderControlPanel();
    });

    // Improved LPN handling
    let isLpnInputListenerAttached = false;
    function attachLpnInputListener() {
      if (isLpnInputListenerAttached) return;
      document.addEventListener("input", (event) => {
        const target = event.target;
        if (target && target.tagName.toLowerCase() === "input") {
          const lpn = target.value.trim();
          if (lpn.length >= MIN_LPN_LENGTH && lpn.match(/^LPN[a-zA-Z0-9]+$/)) {
            saveLpn(lpn);
            showNotification(`New LPN saved: ${lpn}`);
          }
        }
      }, { once: false });
      isLpnInputListenerAttached = true;
    }

    function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

async function handleLpnInput(bodyText, inputField, enterEl) {
  if ((bodyText.includes('tote') || bodyText.includes('scan lpn')) && inputField) {
    const storedLpn = getStoredLpn();
    if (storedLpn) {
      setInputValue("input", storedLpn);

      const randomDelay = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
      await delay(randomDelay);

      if (enterEl) {
        simulateClick(enterEl);
        console.log(`Clicked Enter after filling LPN: ${storedLpn} with delay: ${randomDelay}ms`);

        if (
          document.getElementById("item-complete-graphic") ||
          document.getElementsByClassName('col-md-5')[0]
        ) {
          await sendLpnToErsa(storedLpn);
        }

        const ersaUrl = `https://ersa.emea.intra.acer.com/PLRC/SAMain.aspx?QuickSearch=${encodeURIComponent(storedLpn)}`;

        chrome.runtime.sendMessage({
          action: 'openOrUpdateErsaTab',
          url: ersaUrl
        });

        console.log(`🔁 Sent request to open/update ERSA tab with LPN: ${storedLpn}`);
      } else {
        console.warn('Enter button not found for Scan LPN');
      }
    }
  }
}


    function autofillFields() {
      const bodyText = document.body.innerText.toLowerCase();
      const inputField = document.querySelector('input');
      const enterEl = findElementByText('input, button, a, [role="button"]', 'enter');

      if (bodyText.includes('scan workstation') && inputField) {
        setInputValue("input", "Stanowisko 53");
        setTimeout(() => {
          if (enterEl) {
            simulateClick(enterEl);
            console.log('Clicked Enter after filling Stanowisko 53');
          } else {
            console.warn('Enter button not found for Scan Workstation');
          }
        }, 100);
      }

      if (bodyText.includes('scan warehouse id') && inputField) {
        setInputValue("input", "RPXA");
        setTimeout(() => {
          if (enterEl) {
            simulateClick(enterEl);
            console.log('Clicked Enter after filling RPXA');
          } else {
            console.warn('Enter button not found for Scan Warehouse ID');
          }
        }, 100);
      }

      if (bodyText.includes('scan item')) {
        chrome.runtime.sendMessage({ action: 'activateExtension', extensionId: "gemekeidfocjmomalohgoampedmcfepl" });
      }

      // Handle tote and scan lpn with random delay
      handleLpnInput(bodyText, inputField, enterEl);
    }

    function processQuestions() {
      const bodyText = document.body.innerText;
      const continueElt = findElementByText('input, button, a, [role="button"]', 'Continue');

      if (bodyText.includes("CAUTION – ITEM CONTAINS LITHIUM-ION BATTERY. ENSURE ALL CONTENTS REMOVED FROM BOX PRIOR TO DISPOSAL")) {
        if (continueElt) {
          simulateClick(continueElt);
          console.log('Clicked Continue for Lithium-Ion Battery warning');
        } else {
          console.warn('Continue button not found for Lithium-Ion Battery warning');
        }
      }

      Object.entries(controlPanelState.questions).forEach(([question, data]) => {
        if (bodyText.includes(question)) {
          const model = new QuestionCardModel(question);
          if (model.selectAnswer(data.selected)) {
            model.clickButton();
          }
        }
      });
    }

    function initializeAutoClicker() {
      attachLpnInputListener();
      autofillFields();
      processQuestions();
    }

    setInterval(initializeAutoClicker, controlPanelState.autoclickSpeed);
  }
})();