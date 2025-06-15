document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".top-nav .tab");
  const panels = document.querySelectorAll(".panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active", "fade-in"));
      tab.classList.add("active");
      const targetPanel = document.getElementById(
        tab.getAttribute("data-tab") + "-panel"
      );
      if (targetPanel) {
        targetPanel.classList.add("active", "fade-in");
        setTimeout(() => targetPanel.classList.remove("fade-in"), 500);
      }
    });
  });

  const SETTINGS_KEY = "db_settings";
  async function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get([SETTINGS_KEY], (res) => {
        resolve(res[SETTINGS_KEY] || {});
      });
    });
  }
  function saveSettings(obj) {
    const data = {};
    data[SETTINGS_KEY] = obj;
    chrome.storage.local.set(data);
  }
  async function applySettings() {
    const s = await loadSettings();
    const lang = document.getElementById("language-select");
    const frost = document.getElementById("frosted-effect");
    const autoC = document.getElementById("autoclicker");
    if (s.language && lang) lang.value = s.language;
    if (typeof s.frosted !== "undefined" && frost) {
      frost.checked = s.frosted;
      document.body.classList.toggle("frosted", s.frosted);
    }
    if (autoC && s.autoClickerText) autoC.value = s.autoClickerText;
  }
  applySettings();

  document.getElementById("save-settings").addEventListener("click", async () => {
    const lang = document.getElementById("language-select");
    const frost = document.getElementById("frosted-effect");
    const autoC = document.getElementById("autoclicker");
    const current = await loadSettings();
    const updated = {
      ...current,
      language: lang.value,
      frosted: frost.checked,
      autoClickerText: autoC ? autoC.value.trim() : "",
    };
    saveSettings(updated);
    document.body.classList.toggle("frosted", updated.frosted);
    showNotification("Settings saved");
  });

  window.showNotification = function (msg) {
    const n = document.createElement("div");
    n.className = "custom-notification";
    n.textContent = msg;
    document.body.appendChild(n);
    void n.offsetWidth;
    n.classList.add("visible");
    setTimeout(() => {
      n.classList.remove("visible");
      setTimeout(() => n.remove(), 500);
    }, 3000);
  };

  const AUTOCLICKER_KEY = "db_autoclicker";
  const stationInput = document.getElementById("autoclicker-station");
  const enableAC = document.getElementById("autoclicker-enable");
  const saveACBtn = document.getElementById("save-autoclicker");

  function loadAutoClickerSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get([AUTOCLICKER_KEY], (res) => {
        resolve(res[AUTOCLICKER_KEY] || {});
      });
    });
  }
  function saveAutoClickerSettings(obj) {
    const data = {};
    data[AUTOCLICKER_KEY] = obj;
    chrome.storage.local.set(data);
  }
  loadAutoClickerSettings().then((ac) => {
    if (stationInput) stationInput.value = ac.stationValue || "";
    if (enableAC) enableAC.checked = !!ac.enabled;
  });
  if (saveACBtn) {
    saveACBtn.addEventListener("click", async () => {
      const settingsObj = {
        stationValue: stationInput ? stationInput.value.trim() : "",
        enabled: enableAC ? enableAC.checked : false,
      };
      saveAutoClickerSettings(settingsObj);
      if (window.showNotification) {
        window.showNotification("Autoclicker settings saved");
      }
    });
  }

  // Collapsible table logic
  const tableContainer = document.getElementById("inventory-table-container");
  const toggleBtn = document.getElementById("toggle-inventory-table-btn");
  const inventoryTableBody = document.querySelector("#inventory-table tbody");

  function checkTableSize() {
    const rowCount = inventoryTableBody ? inventoryTableBody.querySelectorAll("tr").length : 0;
    if (rowCount > 20) {
      toggleBtn.style.display = "inline-block";
      tableContainer.classList.add("collapsed");
      toggleBtn.textContent = "Expand";
    } else {
      toggleBtn.style.display = "none";
      tableContainer.classList.remove("collapsed");
    }
  }

  if (toggleBtn && tableContainer && inventoryTableBody) {
    toggleBtn.addEventListener("click", () => {
      tableContainer.classList.toggle("collapsed");
      toggleBtn.textContent = tableContainer.classList.contains("collapsed")
        ? "Expand"
        : "Collapse";
    });
  }

  // Expose checkTableSize so inventory.js can call it after rendering
  window.checkInventoryTableSize = checkTableSize;
});