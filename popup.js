document.addEventListener('DOMContentLoaded', function() {
  let csvData = [];

  // Load CSV data for search functionality
  fetch(chrome.runtime.getURL('data.csv'))
    .then(response => response.text())
    .then(text => {
      const lines = text.split('\n').filter(line => line.trim() !== '');
      csvData = lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return { 
          code: parts[0] || '', 
          name: parts[1] || '', 
          points: parts[2] || '' 
        };
      });
    });

  // Search functionality
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const resultsDiv = document.getElementById('results');

  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      const msg = typeof t === 'function' ? t('enterInfo') : 'Enter any info to search.';
      resultsDiv.innerHTML = `<p>${msg}</p>`;
      return;
    }
    const filtered = csvData.filter(row => {
      return row.code.toLowerCase().includes(query) || 
             row.name.toLowerCase().includes(query) ||
             row.points.toLowerCase().includes(query);
    });
    if (filtered.length === 0) {
      const msg = typeof t === 'function' ? t('nothingFound') : 'Nothing found.';
      resultsDiv.innerHTML = `<p>${msg}</p>`;
    } else {
      let html = '<ul>';
      filtered.forEach(row => {
        html += `<li><strong>${row.code}</strong> — ${row.name} : <span class="points">${row.points}</span></li>`;
      });
      html += '</ul>';
      resultsDiv.innerHTML = html;
    }
  }

  searchButton.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') performSearch();
  });

  // Calculate day stats (adapted from yieldtable.js)
  function calcDayStats(records) {
    let qty = 0;
    let okPriceSumForYield = 0;
    let berPriceSumForYield = 0;

    records.forEach((r) => {
      const currentQty = parseFloat(r.qty) || 0;
      const currentPrice = parseFloat(r.price) || 0;
      qty += currentQty;
      if (r.type === "OK") {
        okPriceSumForYield += currentPrice;
      } else { // Assuming type is BER
        berPriceSumForYield += currentPrice;
      }
    });

    const totalPricesForYield = okPriceSumForYield + berPriceSumForYield;
    const yieldVal = totalPricesForYield > 0 ? (okPriceSumForYield / totalPricesForYield) * 100 : 0;

    return { qty, yield: yieldVal };
  }

  // Update day stats display
  function updateDayStats() {
    chrome.storage.local.get(["db_mytable", "activeDayId"], (res) => {
      const data = res.db_mytable || { days: {} };
      const activeDayId = res.activeDayId || "";

      // Reset stats if no valid day is selected
      if (!activeDayId || !data.days[activeDayId]) {
        document.getElementById("day-qty").textContent = "0.00";
        document.getElementById("day-yield").textContent = "0.00%";
        return;
      }

      // Get records for the active day
      const records = data.days[activeDayId].records || [];
      const stats = calcDayStats(records);

      // Update UI
      document.getElementById("day-qty").textContent = stats.qty.toFixed(2);
      document.getElementById("day-yield").textContent = stats.yield.toFixed(2) + "%";
    });
  }

  // Initial stats update
  updateDayStats();

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && ("db_mytable" in changes || "activeDayId" in changes)) {
      updateDayStats();
    }
  });

  // Checkbox functionality for automation features
  const autoClickerTRexCheckbox = document.getElementById('autoClickerTRexCheckbox');
  const autoEditCheckbox = document.getElementById('autoEditCheckbox');
  const showProductInfoCheckbox = document.getElementById('showProductInfoCheckbox');
  const autoPickupCheckbox = document.getElementById('autoPickupCheckbox');

  chrome.storage.sync.get([
    'autoClickerTRexState',
    'autoEditState',
    'showProductInfoState',
    'autoPickupState'
  ], (result) => {
    autoClickerTRexCheckbox.checked = result.autoClickerTRexState || false;
    autoEditCheckbox.checked = result.autoEditState || false;
    showProductInfoCheckbox.checked = result.showProductInfoState || false;
    autoPickupCheckbox.checked = result.autoPickupState || false;
  });

  function setupCheckboxListener(checkbox, storageKey, messageAction) {
    checkbox.addEventListener('change', () => {
      const isEnabled = checkbox.checked;
      chrome.storage.sync.set({ [storageKey]: isEnabled }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: messageAction,
              enabled: isEnabled
            });
          }
        });
      });
    });
  }

  setupCheckboxListener(autoClickerTRexCheckbox, 'autoClickerTRexState', 'toggleAutoClickerTRex');
  setupCheckboxListener(autoEditCheckbox, 'autoEditState', 'toggleAutoEdit');
  setupCheckboxListener(showProductInfoCheckbox, 'showProductInfoState', 'toggleShowProductInfo');
  setupCheckboxListener(autoPickupCheckbox, 'autoPickupState', 'toggleAutoPickup');
});