document.addEventListener("DOMContentLoaded", () => {
  const INVENTORY_KEY = "db_inventory";
  const SHELVES_KEY = "db_shelves";
  const ERRORGROUPS_KEY = "db_errorgroups";
  const LAST_INVENTORY_DATE_KEY = "db_lastInventoryDate";

  const checkModeElem = document.getElementById("check-mode");
  const searchInput = document.getElementById("search-input");
  const inventoryTableBody = document.getElementById("inventory-table").querySelector("tbody");

  const errorCodesTextarea = document.getElementById("error-codes-textarea");
  const errorReasonInput = document.getElementById("error-reason-input");
  const errorColorInput = document.getElementById("error-color-input");
  const errorGroupsList = document.getElementById("error-groups-list");

  const newCodeInput = document.getElementById("new-code-input");
  const newCodeComment = document.getElementById("new-code-comment");
  const newCodeShelf = document.getElementById("new-code-shelf");

  const newShelfInput = document.getElementById("new-shelf-input");
  const scannerInput = document.getElementById("scanner-input");

  const checkShelfSelect = document.getElementById("check-shelf-select");
  const checkCodeInput = document.getElementById("check-code-input");
  const addCheckCodeBtn = document.getElementById("add-check-code-btn");
  const startInventoryBtn = document.getElementById("start-inventory-btn");
  const endInventoryBtn = document.getElementById("end-inventory-btn");
  const lastInventoryDateInput = document.getElementById("last-inventory-date");

  const notificationsContainer = document.getElementById("notifications-container");

  const backupBtn = document.getElementById("backup-btn");
  const importBackupBtn = document.getElementById("import-backup-btn");

  let inventoryCheckNewCodes = [];

  function loadInventory() {
    return new Promise((resolve) => {
      chrome.storage.local.get([INVENTORY_KEY], (res) => {
        resolve(res[INVENTORY_KEY] || []);
      });
    });
  }

  function saveInventory(arr) {
    const obj = {};
    obj[INVENTORY_KEY] = arr;
    chrome.storage.local.set(obj);
  }

  function loadShelves() {
    return new Promise((resolve) => {
      chrome.storage.local.get([SHELVES_KEY], (res) => {
        resolve(res[SHELVES_KEY] || []);
      });
    });
  }

  function saveShelves(arr) {
    const obj = {};
    obj[SHELVES_KEY] = arr;
    chrome.storage.local.set(obj);
  }

  function loadErrorGroups() {
    return new Promise((resolve) => {
      chrome.storage.local.get([ERRORGROUPS_KEY], (res) => {
        resolve(res[ERRORGROUPS_KEY] || []);
      });
    });
  }

  function saveErrorGroups(arr) {
    const obj = {};
    obj[ERRORGROUPS_KEY] = arr;
    chrome.storage.local.set(obj);
  }

  function loadLastInventoryDate() {
    return new Promise((resolve) => {
      chrome.storage.local.get([LAST_INVENTORY_DATE_KEY], (res) => {
        resolve(res[LAST_INVENTORY_DATE_KEY] || "");
      });
    });
  }

  function saveLastInventoryDate(dateStr) {
    const obj = {};
    obj[LAST_INVENTORY_DATE_KEY] = dateStr;
    chrome.storage.local.set(obj);
  }

  async function renderShelves() {
    const shelves = await loadShelves();
    newCodeShelf.innerHTML = "";
    checkShelfSelect.innerHTML = "";
    const optNone = document.createElement("option");
    optNone.value = "";
    optNone.textContent = "No Shelf";
    newCodeShelf.appendChild(optNone);
    shelves.forEach((shelf) => {
      const opt1 = document.createElement("option");
      opt1.value = shelf;
      opt1.textContent = shelf;
      newCodeShelf.appendChild(opt1);
      const opt2 = document.createElement("option");
      opt2.value = shelf;
      opt2.textContent = shelf;
      checkShelfSelect.appendChild(opt2);
    });
  }

  async function renderErrorGroups() {
    const groups = await loadErrorGroups();
    errorGroupsList.innerHTML = "";
    groups.forEach((group, index) => {
      const li = document.createElement("li");
      li.style.marginBottom = "5px";
      li.className = "error-group-item";
      const colorBox = document.createElement("span");
      colorBox.className = "error-group-color-box";
      colorBox.style.backgroundColor = group.color || "#ffffff";
      const textSpan = document.createElement("span");
      textSpan.textContent = `Codes: ${group.codes.join(", ")} | Reason: ${group.reason || "Error"}`;
      li.appendChild(colorBox);
      li.appendChild(textSpan);
      const delBtn = document.createElement("button");
      delBtn.textContent = "✕";
      delBtn.style.color = "white";
      delBtn.style.background = "none";
      delBtn.style.border = "none";
      delBtn.style.cursor = "pointer";

      delBtn.addEventListener("click", () => {
        groups.splice(index, 1);
        saveErrorGroups(groups);
        renderErrorGroups();
        renderInventory();
      });
      li.appendChild(delBtn);
      errorGroupsList.appendChild(li);
    });
  }

  async function renderInventory() {
    const [inv, errGroups] = await Promise.all([loadInventory(), loadErrorGroups()]);
    const searchTerm = searchInput.value.trim().toLowerCase();
    const isCheckMode = checkModeElem.checked;
    inventoryTableBody.innerHTML = "";
    inv.forEach((item) => {
      if (searchTerm && !item.code.toLowerCase().includes(searchTerm)) return;
      let matchedGroup = null;
      if (isCheckMode) {
        for (const g of errGroups) {
          if (g.codes.some((c) => c.toLowerCase() === item.code.toLowerCase())) {
            matchedGroup = g;
            break;
          }
        }
      }
      const tr = document.createElement("tr");
      const tdSelect = document.createElement("td");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.classList.add("row-select");
      cb.dataset.code = item.code;
      tdSelect.appendChild(cb);
      tr.appendChild(tdSelect);
      const tdCode = document.createElement("td");
      tdCode.textContent = item.code;
      tr.appendChild(tdCode);
      const tdComment = document.createElement("td");
      tdComment.textContent = item.comment || "";
      tr.appendChild(tdComment);
      const tdShelf = document.createElement("td");
      tdShelf.textContent = item.shelf || "";
      tr.appendChild(tdShelf);
      const tdError = document.createElement("td");
      if (matchedGroup) {
        tr.classList.add("error");
        tr.style.backgroundColor = matchedGroup.color || "#ffcccc";
        tdError.textContent = matchedGroup.reason || "Error";
      } else {
        tdError.textContent = "";
        tr.style.backgroundColor = "";
      }
      tr.appendChild(tdError);
      tr.addEventListener("click", () => {
        if (window.showNotification) window.showNotification(item.comment || "No comment");
      });
      tr.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        showContextMenu(e, item, inv);
      });

      if (window.checkInventoryTableSize) {
        window.checkInventoryTableSize();
      }
      inventoryTableBody.appendChild(tr);
    });
    renderNotifications();
  }

  function showNotification(msg) {
    console.log("[Notification]", msg);
    if (window.showNotification) window.showNotification(msg);
  }

  function renderNotifications() {
    notificationsContainer.innerHTML = "";
    Promise.all([loadInventory(), loadLastInventoryDate()]).then(([inv, lastInvDateStr]) => {
      const now = new Date();
      const lastInvDate = lastInvDateStr ? new Date(lastInvDateStr) : null;
      const nextWed = getNextWednesday(now);
      const diffDays = Math.ceil((nextWed - now) / (1000 * 60 * 60 * 24));
      const inventoryNotification = document.createElement("div");
      inventoryNotification.classList.add("notification");
      inventoryNotification.innerHTML = `<strong>Next Inventory:</strong> ${nextWed.toDateString()} (in ${diffDays} day(s))`;
      if (diffDays > 5) {
        inventoryNotification.classList.add("low-urgency");
      } else if (diffDays >= 2) {
        inventoryNotification.classList.add("medium-urgency");
      } else {
        inventoryNotification.classList.add("high-urgency");
      }
      notificationsContainer.appendChild(inventoryNotification);
      if (lastInvDate) {
        const daysSinceLast = Math.floor((now - lastInvDate) / (1000 * 60 * 60 * 24));
        const lastInvBlock = document.createElement("div");
        lastInvBlock.classList.add("notification", "low-urgency");
        lastInvBlock.innerHTML = `<strong>Last global inventory:</strong> ${lastInvDate.toDateString()} (${daysSinceLast} day(s) ago)`;
        notificationsContainer.appendChild(lastInvBlock);
      }
      inv.forEach((item) => {
        if (item.lastCheck) {
          const checkDate = new Date(item.lastCheck);
          const itemDiff = Math.floor((now - checkDate) / (1000 * 60 * 60 * 24));
          if (itemDiff > 14) {
            const overdue = document.createElement("div");
            overdue.classList.add("notification", "high-urgency");
            overdue.innerHTML = `Product <strong>${item.code}</strong> has been on the shelf for ${itemDiff} day(s).`;
            notificationsContainer.appendChild(overdue);
          }
        }
      });
    });
  }

  function getNextWednesday(d) {
    const day = d.getDay();
    const date = new Date(d);
    if (day === 3) return date;
    let diff = 3 - day;
    if (diff < 0) diff += 7;
    date.setDate(date.getDate() + diff);
    return date;
  }

  function showContextMenu(e, item, arr) {
    hideContextMenu();
    const menu = document.createElement("div");
    menu.className = "custom-context-menu";
    menu.style.left = e.pageX + "px";
    menu.style.top = e.pageY + "px";
    const editOption = document.createElement("div");
    editOption.textContent = "Edit comment";
    editOption.className = "context-menu-option";
    editOption.addEventListener("click", (ev) => {
      ev.stopPropagation();
      hideContextMenu();
      showEditCommentMenu(e, item, arr);
    });
    menu.appendChild(editOption);
    const changeShelfOption = document.createElement("div");
    changeShelfOption.textContent = "Change shelf";
    changeShelfOption.className = "context-menu-option";
    changeShelfOption.addEventListener("click", (ev) => {
      ev.stopPropagation();
      hideContextMenu();
      openChangeShelfPopup(item, arr);
    });
    menu.appendChild(changeShelfOption);
    const deleteOption = document.createElement("div");
    deleteOption.textContent = "Delete product";
    deleteOption.className = "context-menu-option";
    deleteOption.addEventListener("click", (ev) => {
      ev.stopPropagation();
      hideContextMenu();
      if (confirm("Are you sure you want to delete this product?")) {
        const idx = arr.findIndex((x) => x.code === item.code);
        if (idx !== -1) {
          arr.splice(idx, 1);
          saveInventory(arr);
          renderInventory();
          showNotification("Product deleted");
        }
      }
    });
    menu.appendChild(deleteOption);
    document.body.appendChild(menu);
    document.addEventListener("click", hideContextMenu, { once: true });
  }

  function hideContextMenu() {
    const ex = document.querySelector(".custom-context-menu");
    if (ex) ex.remove();
  }

  function showEditCommentMenu(e, item, arr) {
    hideContextMenu();
    const menu = document.createElement("div");
    menu.className = "custom-context-menu";
    menu.style.left = e.pageX + "px";
    menu.style.top = e.pageY + "px";
    const input = document.createElement("input");
    input.type = "text";
    input.value = item.comment || "";
    input.className = "context-input";
    input.addEventListener("click", (ev) => ev.stopPropagation());
    menu.appendChild(input);
    const btnContainer = document.createElement("div");
    btnContainer.className = "context-btn-container";
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.className = "context-menu-button";
    saveBtn.addEventListener("click", () => {
      item.comment = input.value.trim();
      saveInventory(arr);
      renderInventory();
      hideContextMenu();
      showNotification("Comment saved");
    });
    btnContainer.appendChild(saveBtn);
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.className = "context-menu-button";
    cancelBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      hideContextMenu();
    });
    btnContainer.appendChild(cancelBtn);
    menu.appendChild(btnContainer);
    document.body.appendChild(menu);
    document.addEventListener("click", hideContextMenu, { once: true });
  }

  function openChangeShelfPopup(item, arr) {
    const popup = document.createElement("div");
    popup.className = "custom-popup";
    Object.assign(popup.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "var(--container-bg)",
      padding: "20px",
      borderRadius: "var(--radius)",
      boxShadow: "0 4px 12px var(--shadow-color)",
      zIndex: "20000"
    });
    const title = document.createElement("h3");
    title.textContent = "Change Shelf";
    popup.appendChild(title);
    const select = document.createElement("select");
    const noShelfOpt = document.createElement("option");
    noShelfOpt.value = "";
    noShelfOpt.textContent = "No Shelf";
    select.appendChild(noShelfOpt);
    loadShelves().then((shelves) => {
      shelves.forEach((shelf) => {
        const opt = document.createElement("option");
        opt.value = shelf;
        opt.textContent = shelf;
        select.appendChild(opt);
      });
      select.value = item.shelf || "";
    });
    popup.appendChild(select);
    const btnContainer = document.createElement("div");
    btnContainer.style.marginTop = "10px";
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.className = "macos-btn";
    saveBtn.addEventListener("click", async () => {
      item.shelf = select.value;
      saveInventory(arr);
      renderInventory();
      showNotification("Shelf updated");
      document.body.removeChild(popup);
    });
    btnContainer.appendChild(saveBtn);
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.className = "macos-btn";
    cancelBtn.style.marginLeft = "10px";
    cancelBtn.addEventListener("click", () => {
      document.body.removeChild(popup);
    });
    btnContainer.appendChild(cancelBtn);
    popup.appendChild(btnContainer);
    document.body.appendChild(popup);
  }

  checkModeElem.addEventListener("change", () => {
    localStorage.setItem("checkModeInv", checkModeElem.checked);
    renderInventory();
  });
  checkModeElem.checked = localStorage.getItem("checkModeInv") === "true";

  document.getElementById("add-error-group-btn").addEventListener("click", async () => {
    const codesRaw = errorCodesTextarea.value.trim();
    const reason = errorReasonInput.value.trim();
    const color = errorColorInput.value;
    if (!codesRaw) {
      showNotification("Enter at least one code");
      return;
    }
    let codesArr = [];
    if (/\n/.test(codesRaw)) {
      codesArr = codesRaw.split(/\n+/).map((c) => c.trim()).filter(Boolean);
    } else {
      codesArr = codesRaw.split(",").map((c) => c.trim()).filter(Boolean);
    }
    if (!codesArr.length) {
      showNotification("No valid codes found");
      return;
    }
    const groups = await loadErrorGroups();
    groups.push({
      codes: codesArr,
      reason: reason || "Error",
      color: color || "#ffcccc"
    });
    saveErrorGroups(groups);
    errorCodesTextarea.value = "";
    errorReasonInput.value = "";
    renderErrorGroups();
    renderInventory();
    showNotification("Error group added");
  });

  document.getElementById("add-code-btn").addEventListener("click", async () => {
    const codeVal = newCodeInput.value.trim();
    if (!codeVal) {
      showNotification("Enter product code.");
      return;
    }
    if (!/^LPN/i.test(codeVal)) {
      showNotification("Code must start with LPN.");
      return;
    }
    const inv = await loadInventory();
    if (inv.some((x) => x.code.toLowerCase() === codeVal.toLowerCase())) {
      showNotification("Product already exists.");
      return;
    }
    inv.push({
      code: codeVal,
      comment: newCodeComment.value.trim(),
      shelf: newCodeShelf.value || "",
      lastCheck: new Date().toISOString()
    });
    saveInventory(inv);
    newCodeInput.value = "";
    newCodeComment.value = "";
    renderInventory();
    showNotification("Product added");
  });

  document.getElementById("add-scanned-btn").addEventListener("click", async () => {
    const scanned = scannerInput.value.trim();
    if (!scanned) {
      showNotification("Scan or enter a code.");
      return;
    }
    if (!/^LPN/i.test(scanned)) {
      showNotification("Scan code must start with LPN.");
      return;
    }
    const inv = await loadInventory();
    if (inv.some((x) => x.code.toLowerCase() === scanned.toLowerCase())) {
      showNotification("Product already exists.");
      return;
    }
    inv.push({
      code: scanned,
      comment: "",
      shelf: "",
      lastCheck: new Date().toISOString()
    });
    saveInventory(inv);
    scannerInput.value = "";
    renderInventory();
    showNotification("Scan added");
  });

  document.getElementById("add-shelf-btn").addEventListener("click", async () => {
    const shelfName = newShelfInput.value.trim();
    if (!shelfName) {
      showNotification("Enter shelf name");
      return;
    }
    const shelves = await loadShelves();
    if (shelves.includes(shelfName)) {
      showNotification("Shelf already exists");
      return;
    }
    shelves.push(shelfName);
    saveShelves(shelves);
    newShelfInput.value = "";
    await renderShelves();
    showNotification("Shelf added");
  });

  searchInput.addEventListener("input", () => renderInventory());

  document.getElementById("download-btn").addEventListener("click", async () => {
    const inv = await loadInventory();
    const codes = inv.map((i) => i.code).join("\n");
    const date = new Date().toISOString().slice(0, 10);
    const fileName = `invdata[${date}].txt`;
    const blob = new Blob([codes], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification("File " + fileName + " downloaded");
  });

  document.getElementById("import-btn").addEventListener("click", async () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".txt,.csv,.json";
    fileInput.click();
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files[0];
      if (!file) return;
      const text = await file.text();
      let newCodes = [];
      if (file.name.endsWith(".json")) {
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            if (parsed.length && typeof parsed[0] === "object" && parsed[0].code) {
              newCodes = parsed.map((item) => item.code);
            } else {
              newCodes = parsed;
            }
          }
        } catch (err) {
          showNotification("Invalid JSON file");
          return;
        }
      } else {
        newCodes = text.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
      }
      if (!newCodes.length) {
        showNotification("No codes found in file.");
        return;
      }
      const inv = await loadInventory();
      const lowerInv = inv.map((x) => x.code.toLowerCase());
      let addedCount = 0;
      newCodes.forEach((code) => {
        if (!/^LPN/i.test(code)) return;
        if (!lowerInv.includes(code.toLowerCase())) {
          inv.push({
            code,
            comment: "",
            shelf: "",
            lastCheck: new Date().toISOString()
          });
          addedCount++;
        }
      });
      saveInventory(inv);
      renderInventory();
      showNotification(`Import complete. ${addedCount} code(s) added.`);
    });
  });

  document.getElementById("delete-selected-btn").addEventListener("click", async () => {
    const inv = await loadInventory();
    const checkboxes = document.querySelectorAll(".row-select:checked");
    if (!checkboxes.length) {
      showNotification("No items selected for deletion");
      return;
    }
    if (!confirm("Are you sure you want to delete the selected codes?")) return;
    const codesToDelete = Array.from(checkboxes).map((cb) => cb.dataset.code.toLowerCase());
    const newInv = inv.filter((item) => !codesToDelete.includes(item.code.toLowerCase()));
    saveInventory(newInv);
    renderInventory();
    showNotification(`Deleted ${inv.length - newInv.length} item(s).`);
  });

  document.getElementById("select-all").addEventListener("change", function () {
    const checked = this.checked;
    document.querySelectorAll(".row-select").forEach((cb) => (cb.checked = checked));
  });

  async function renderCheckShelves() {
    const shelves = await loadShelves();
    checkShelfSelect.innerHTML = "";
    shelves.forEach((shelf) => {
      const opt = document.createElement("option");
      opt.value = shelf;
      opt.textContent = shelf;
      checkShelfSelect.appendChild(opt);
    });
    const savedDate = await loadLastInventoryDate();
    if (savedDate) {
      lastInventoryDateInput.value = savedDate;
    }
  }

  startInventoryBtn.addEventListener("click", () => {
    inventoryCheckNewCodes = [];
    startInventoryBtn.style.display = "none";
    endInventoryBtn.style.display = "inline-block";
    showNotification("Inventory check mode activated");
  });

  addCheckCodeBtn.addEventListener("click", async () => {
    const code = checkCodeInput.value.trim();
    if (!code) {
      showNotification("Enter LPN code");
      return;
    }
    if (!/^LPN/i.test(code)) {
      showNotification("Code must start with LPN");
      return;
    }
    const shelf = checkShelfSelect.value;
    if (!shelf) {
      showNotification("Select a shelf for checking");
      return;
    }
    const inv = await loadInventory();
    const codeLower = code.toLowerCase();
    const existing = inv.find((x) => x.code.toLowerCase() === codeLower);
    if (existing) {
      if (existing.shelf !== shelf) {
        existing.shelf = shelf;
        existing.lastCheck = new Date().toISOString();
        saveInventory(inv);
        showNotification(`Code ${code} updated. New shelf: ${shelf}`);
      } else {
        existing.lastCheck = new Date().toISOString();
        saveInventory(inv);
        showNotification(`Code ${code} is already on shelf ${shelf}`);
      }
    } else {
      if (!inventoryCheckNewCodes.some((c) => c.toLowerCase() === codeLower)) {
        inventoryCheckNewCodes.push(code);
        showNotification(`New code ${code} detected`);
      } else {
        showNotification(`Code ${code} already added to new codes list`);
      }
    }
    checkCodeInput.value = "";
  });

  endInventoryBtn.addEventListener("click", async () => {
    endInventoryBtn.style.display = "none";
    startInventoryBtn.style.display = "inline-block";
    const lastInvVal = lastInventoryDateInput.value;
    if (lastInvVal) {
      saveLastInventoryDate(lastInvVal);
    }
    if (inventoryCheckNewCodes.length === 0) {
      showNotification("Inventory check complete. No new codes detected.");
      renderInventory();
      return;
    }
    showNewCodesPopup(inventoryCheckNewCodes);
    inventoryCheckNewCodes = [];
  });

  function showNewCodesPopup(newCodes) {
    const popup = document.createElement("div");
    popup.className = "custom-popup";
    Object.assign(popup.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "var(--container-bg)",
      padding: "20px",
      borderRadius: "var(--radius)",
      boxShadow: "0 4px 12px var(--shadow-color)",
      zIndex: "20000",
      maxWidth: "90%",
      maxHeight: "80vh",
      overflowY: "auto"
    });
    const title = document.createElement("h3");
    title.textContent = "New codes detected";
    popup.appendChild(title);
    const form = document.createElement("form");
    newCodes.forEach((code) => {
      const div = document.createElement("div");
      div.style.marginBottom = "10px";
      const label = document.createElement("label");
      label.textContent = code;
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Optional comment";
      input.dataset.code = code;
      input.style.marginLeft = "10px";
      div.appendChild(label);
      div.appendChild(input);
      form.appendChild(div);
    });
    popup.appendChild(form);
    const btnContainer = document.createElement("div");
    btnContainer.style.marginTop = "10px";
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save new codes";
    saveBtn.className = "macos-btn";
    saveBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const inv = await loadInventory();
      const inputs = form.querySelectorAll("input");
      inputs.forEach((inp) => {
        inv.push({
          code: inp.dataset.code,
          comment: inp.value.trim(),
          shelf: checkShelfSelect.value,
          lastCheck: new Date().toISOString()
        });
      });
      saveInventory(inv);
      renderInventory();
      showNotification(`Added ${inputs.length} new code(s)`);
      document.body.removeChild(popup);
    });
    btnContainer.appendChild(saveBtn);
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.className = "macos-btn";
    cancelBtn.style.marginLeft = "10px";
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      document.body.removeChild(popup);
      showNotification("New code addition canceled");
    });
    btnContainer.appendChild(cancelBtn);
    popup.appendChild(btnContainer);
    document.body.appendChild(popup);
  }

  async function backupInventory() {
    const inv = await loadInventory();
    const dateStr = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `inventory-backup-${dateStr}.json`;
    const json = JSON.stringify(inv, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification("Backup file created: " + fileName);
  }

  function importBackup() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.click();
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          showNotification("Backup file is invalid");
          return;
        }
        if (!confirm("This will overwrite current inventory. Continue?")) return;
        saveInventory(parsed);
        renderInventory();
        showNotification("Inventory restored from backup");
      } catch (err) {
        showNotification("Could not parse backup file");
      }
    });
  }

  if (backupBtn) backupBtn.addEventListener("click", backupInventory);
  if (importBackupBtn) importBackupBtn.addEventListener("click", importBackup);

  (async () => {
    await renderShelves();
    await renderErrorGroups();
    await renderCheckShelves();
    await renderInventory();
  })();

  newCodeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("add-code-btn").click();
    }
  });
});