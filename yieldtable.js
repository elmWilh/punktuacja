document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "db_mytable";
  const INVENTORY_KEY = "db_inventory";

  const elements = {
    activeDay: {
      label: document.getElementById("active-day-label"),
      tableBody: document.getElementById("active-day-tbody"),
      form: {
        lpn: document.getElementById("ad-lpn"),
        type: document.getElementById("ad-type"),
        price: document.getElementById("ad-price"),
        qty: document.getElementById("ad-qty"),
        comment: document.getElementById("ad-comment"),
        addBtn: document.getElementById("ad-add-btn"),
      },
      summary: {
        productsCount: document.getElementById("ads-products-count"),
        totalQty: document.getElementById("ads-total-qty"),
        booster: document.getElementById("ads-booster"),
        okSum: document.getElementById("ads-ok-sum"),
        berSum: document.getElementById("ads-ber-sum"),
        yield: document.getElementById("ads-yield"),
      },
    },
    month: {
      targetPeriod: document.getElementById("target-month-period"),
      workingDaysSelect: document.getElementById("working-days-select"),
      workingDaysCount: document.getElementById("month-working-days"),
    },
    goal: {
      qty: document.getElementById("month-goal-qty"),
      setBtn: document.getElementById("set-month-goal-btn"),
      normDisplay: document.getElementById("daily-norm"),
    },
    extras: {
      schoolModeCheckbox: document.getElementById("school-mode-checkbox"),
      backupBtn: document.getElementById("backup-table-btn"),
      importBtn: document.getElementById("import-table-btn"),
      importFileInput: document.getElementById("import-table-file-input"),
    },
  };

  let data = { days: {} };
  let activeDayId = "";
  let dailyNorm = 17;
  let monthlyNorm = 0;
  let actionStack = [];
  let workingDaysList = [];
  let currentDate = new Date();
  let calendarData = JSON.parse(localStorage.getItem('calendarData')) || {};
  let isUpdating = false;

  window.updateTargetPeriod = updateTargetPeriod;

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const debouncedDispatchCalendarUpdate = debounce(() => {
    const event = new CustomEvent('calendarDataUpdated');
    document.dispatchEvent(event);
  }, 300);

  const injectCustomStyles = () => {
    const styleId = "custom-yieldtable-styles";
    if (document.getElementById(styleId)) return;

    const css = `
      .day-card-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; display: inline-block; vertical-align: middle; }
      .day-card-stats div { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
      .day-card { display: flex; flex-direction: column; justify-content: space-between; min-height: 120px; }
      .day-card.norm-met { border: 2px solid #2BD154; }
      .day-card.today { background-color: rgba(10, 132, 255, 0.1); }
    `;
    const style = document.createElement("style");
    style.id = styleId;
    style.type = "text/css";
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  };
  injectCustomStyles();

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const normalizeLPN = (lpn) => lpn.trim().toUpperCase();

  const generateId = () => "r_" + Math.random().toString(36).substr(2, 9);

  const showNotification = (message, type = "info", undo = false) => {
    const notification = document.createElement("div");
    notification.className = "custom-notification";
    notification.style.cssText = `
      position: fixed; right: -300px; top: 50%; transform: translateY(-50%); width: 300px;
      background: rgba(28, 28, 30, 0.9); backdrop-filter: blur(10px); border: 1px solid #3A3A3C;
      border-radius: 12px; padding: 15px; color: #F5F5F7; z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4); opacity: 0; transition: all 0.3s ease-out;
    `;
    notification.innerHTML = `
      <div class="title">${type === "error" ? "Error" : "Notification"}</div>
      <div class="info">${message}</div>
    `;

    if (undo) {
      const undoBtn = document.createElement("button");
      undoBtn.textContent = "Undo";
      undoBtn.style.cssText = `
        margin-left: 10px; padding: 5px 10px; background: #0A84FF; border: none;
        border-radius: 4px; color: #F5F5F7; cursor: pointer;
      `;
      undoBtn.addEventListener("click", () => {
        undoAction();
        document.body.removeChild(notification);
        updateNotificationPositions();
      });
      notification.appendChild(undoBtn);
    }

    document.body.appendChild(notification);
    let topPosition = 20;
    document.querySelectorAll(".custom-notification").forEach((n) => {
      if (n !== notification) topPosition += n.offsetHeight + 10;
    });
    notification.style.top = `${topPosition}px`;

    requestAnimationFrame(() => {
      notification.style.right = "20px";
      notification.style.opacity = "1";
      notification.classList.add("visible");
    });

    setTimeout(() => {
      notification.style.right = "-300px";
      notification.style.opacity = "0";
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
          updateNotificationPositions();
        }
      }, 300);
    }, 3000);

    function updateNotificationPositions() {
      let newTop = 20;
      document.querySelectorAll(".custom-notification").forEach((n) => {
        n.style.top = `${newTop}px`;
        newTop += n.offsetHeight + 10;
      });
    }
  };

  const loadData = () => {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get([STORAGE_KEY, "activeDayId"], (res) => {
          data = res[STORAGE_KEY] || { days: {} };
          activeDayId = res.activeDayId || "";
          resolve(true);
        });
      } else {
        const storedData = localStorage.getItem(STORAGE_KEY);
        data = storedData ? JSON.parse(storedData) : { days: {} };
        activeDayId = localStorage.getItem("activeDayId") || "";
        resolve(true);
      }
    });
  };

  const saveData = () => {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.set({ [STORAGE_KEY]: data, activeDayId }, () => resolve(true));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem("activeDayId", activeDayId);
        resolve(true);
      }
    });
  };

  const loadInventory = () => {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get([INVENTORY_KEY], (res) => {
          resolve(res[INVENTORY_KEY] || []);
        });
      } else {
        const inventory = localStorage.getItem(INVENTORY_KEY);
        resolve(inventory ? JSON.parse(inventory) : []);
      }
    });
  };

  const saveInventory = (arr) => {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.set({ [INVENTORY_KEY]: arr }, () => resolve(true));
      } else {
        localStorage.setItem(INVENTORY_KEY, JSON.stringify(arr));
        resolve(true);
      }
    });
  };

  const calcDayStats = (records) => {
    let qty = 0, okSumNet = 0, berSumNet = 0, products = records.length;
    let okPriceSumForYield = 0;
    let berPriceSumForYield = 0;
    records.forEach((r) => {
      const currentQty = parseFloat(r.qty) || 0;
      const currentPrice = parseFloat(r.price) || 0;
      qty += currentQty;
      const s = currentPrice;
      if (r.type === "OK") {
        okSumNet += s;
        okPriceSumForYield += currentPrice;
      } else {
        berSumNet += s;
        berPriceSumForYield += currentPrice;
      }
    })

    const booster = dailyNorm > 0 && qty > dailyNorm ? qty - dailyNorm : 0;
    const totalPricesForYield = okPriceSumForYield + berPriceSumForYield;
    const yieldVal = totalPricesForYield > 0 ? (okPriceSumForYield / totalPricesForYield) * 100 : 0;

    return { products, qty, okSum: okSumNet, berSum: berSumNet, booster, yield: yieldVal };
  };

  const pushAction = (type, actionData) => {
    actionStack.push({ type, data: actionData });
    if (actionStack.length > 5) actionStack.shift();
  };

  const undoAction = () => {
    const action = actionStack.pop();
    if (!action) return;
    if (action.type === "deleteRecord") {
      data.days[action.data.dayId].records.push(action.data.record);
      saveData().then(() => {
        renderActiveDay();
        debouncedDispatchCalendarUpdate();
        showNotification("Record restored");
      });
    }
  };

  function updateTargetPeriod() {
    if (isUpdating) {
      return;
    }
    isUpdating = true;

    calendarData = JSON.parse(localStorage.getItem('calendarData')) || {};
    const { start, end } = getTargetPeriod(currentDate);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    elements.month.targetPeriod.textContent = `${start.getDate()} ${monthNames[start.getMonth()]} ${start.getFullYear()} - ${end.getDate()} ${monthNames[end.getMonth()]} ${end.getFullYear()}`;

    workingDaysList = [];
    let workingDaysCount = 0;
    const current = new Date(start);
    while (current <= end) {
      const dateKey = formatDate(current);
      const dayData = calendarData[dateKey] || { status: isWeekend(current) ? 'weekend' : 'working', points: 0, ok: 0, ber: 0, finished: false };
      if (dayData.status === 'working' || (data.days[dateKey]?.records?.length > 0 && !dayData.finished)) {
        workingDaysList.push({ dateKey, display: `${current.getDate()} ${monthNames[current.getMonth()].slice(0, 3)}` });
        workingDaysCount++;
      }
      current.setDate(current.getDate() + 1);
    }

    localStorage.setItem('workingDaysList', JSON.stringify(workingDaysList));

    monthlyNorm = workingDaysCount * dailyNorm;
    elements.goal.normDisplay.textContent = `Daily Norm: ${dailyNorm.toFixed(2)} (Monthly Norm: ${monthlyNorm.toFixed(2)})`;
    elements.month.workingDaysCount.textContent = workingDaysCount;
    elements.goal.qty.value = monthlyNorm;

    const { workingDaysSelect } = elements.month;
    workingDaysSelect.innerHTML = '<option value="">Select a Target Day</option>';
    workingDaysList.forEach(({ dateKey, display }) => {
      const option = document.createElement("option");
      option.value = dateKey;
      option.textContent = display;
      if (dateKey === activeDayId) option.selected = true;
      workingDaysSelect.appendChild(option);
    });

    if (activeDayId && !workingDaysList.some(day => day.dateKey === activeDayId)) {
      if (data.days[activeDayId]?.records?.length > 0) {
        const date = new Date(activeDayId);
        workingDaysList.push({ dateKey: activeDayId, display: `${date.getDate()} ${monthNames[date.getMonth()].slice(0, 3)}` });
        const option = document.createElement("option");
        option.value = activeDayId;
        option.textContent = `${date.getDate()} ${monthNames[date.getMonth()].slice(0, 3)}`;
        option.selected = true;
        workingDaysSelect.appendChild(option);
        workingDaysCount++;
        elements.month.workingDaysCount.textContent = workingDaysCount;
      } else {
        activeDayId = "";
        workingDaysSelect.value = "";
      }
    }

    saveData();
    renderActiveDay();
    isUpdating = false;
    debouncedDispatchCalendarUpdate();
  }

  const renderActiveDay = () => {
    const { label, tableBody, summary } = elements.activeDay;
    label.textContent = activeDayId ? workingDaysList.find(day => day.dateKey === activeDayId)?.display || "None" : "None";
    tableBody.innerHTML = "";

    let headerContainer = document.querySelector(".active-day-header");
    if (!headerContainer) {
      headerContainer = document.createElement("div");
      headerContainer.className = "active-day-header";
      headerContainer.style.display = "flex";
      headerContainer.style.alignItems = "center";
      headerContainer.style.gap = "10px";
      headerContainer.style.marginBottom = "10px";
      label.parentElement.insertBefore(headerContainer, label);
    } else {
      headerContainer.innerHTML = "";
    }
    headerContainer.appendChild(label);

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search by LPN, Type, or Comment";
    searchInput.className = "search-input";
    headerContainer.appendChild(searchInput);

    const debouncedSearch = debounce(() => {
      const query = searchInput.value.toLowerCase();
      const filteredRecords = data.days[activeDayId]?.records.filter(
        (r) =>
          normalizeLPN(r.lpn).toLowerCase().includes(query) ||
          r.type.toLowerCase().includes(query) ||
          r.comment?.toLowerCase().includes(query)
      ) || [];
      renderFilteredRecords(filteredRecords);
    }, 300);

    searchInput.addEventListener("input", debouncedSearch);

    if (!activeDayId || !data.days[activeDayId]) {
      summary.productsCount.textContent = "0";
      summary.totalQty.textContent = "0";
      summary.booster.textContent = "0";
      summary.okSum.textContent = "0";
      summary.berSum.textContent = "0";
      summary.yield.textContent = "0";
      return;
    }

    const records = data.days[activeDayId].records;
    const stats = calcDayStats(records);
    summary.productsCount.textContent = stats.products;
    summary.totalQty.textContent = stats.qty.toFixed(2);
    summary.booster.textContent = stats.booster.toFixed(2);
    summary.okSum.textContent = stats.okSum.toFixed(2);
    summary.berSum.textContent = stats.berSum.toFixed(2);
    summary.yield.textContent = stats.yield.toFixed(2);

    const dayData = calendarData[activeDayId] || { points: 0, ok: 0, ber: 0, finished: false };
    dayData.points = stats.qty;
    dayData.ok = stats.okSum;
    dayData.ber = stats.berSum;
    calendarData[activeDayId] = dayData;
    localStorage.setItem('calendarData', JSON.stringify(calendarData));

    const fragment = document.createDocumentFragment();
    records.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.lpn}</td>
        <td>${r.type}</td>
        <td>${r.price.toFixed(2)}</td>
        <td>${r.qty}</td>
        <td>${r.comment || ""}</td>
        <td>
          <button class="macos-btn small-gray stop-propagation" data-action="edit" data-id="${r.id}">Edit</button>
          <button class="macos-btn small-gray stop-propagation" data-action="delete" data-id="${r.id}">Del</button>
        </td>
      `;
      tr.addEventListener("click", () => editRecord(r.id));
      fragment.appendChild(tr);
    });
    tableBody.appendChild(fragment);
  };

  const addRecord = () => {
    const { lpn: lpnInput, type: typeInput, price: priceInput, qty: qtyInput, comment: commentInput } = elements.activeDay.form;
    const lpnVal = normalizeLPN(lpnInput.value);
    const typeVal = typeInput.value;
    const priceVal = parseFloat(priceInput.value) || 0;
    const qtyVal = parseFloat(qtyInput.value) || 0;
    const commentVal = commentInput.value.trim();

    if (!activeDayId || !workingDaysList.some(day => day.dateKey === activeDayId)) {
      showNotification("Please select a valid Target Day to add the record to.", "error");
      return;
    }
    if (!lpnVal) {
      showNotification("LPN code is required", "error");
      return;
    }
    if (qtyVal <= 0 || priceVal < 0) {
      showNotification("Invalid quantity or price", "error");
      return;
    }

    if (!data.days) {
      data.days = {};
    }

    const allExistingRecords = Object.values(data.days).flatMap(day => day?.records || []);
    if (allExistingRecords.some(r => normalizeLPN(r.lpn) === lpnVal)) {
      showNotification(`LPN ${lpnVal} already exists. LPN must be unique across all days.`, "error");
      return;
    }

    if (!data.days[activeDayId]) {
      data.days[activeDayId] = { records: [], finished: false, date: activeDayId };
    }

    const newRecord = {
      id: generateId(),
      lpn: lpnVal,
      type: typeVal,
      price: priceVal,
      qty: qtyVal,
      comment: commentVal,
    };
    data.days[activeDayId].records.push(newRecord);

    saveData().then(() => {
      lpnInput.value = "";
      priceInput.value = "";
      qtyInput.value = "";
      commentInput.value = "";
      renderActiveDay();
      checkAllRecordsAgainstInventory();
      debouncedDispatchCalendarUpdate();
      showNotification(`Record added to ${workingDaysList.find(day => day.dateKey === activeDayId)?.display}`);
    });
  };

  const editRecord = (id) => {
    const record = data.days[activeDayId].records.find((r) => r.id === id);
    if (!record) return;

    const editForm = document.createElement("div");
    editForm.className = "edit-form";
    editForm.style.cssText = `
      display: flex; gap: 10px; padding: 10px;
      border-radius: 8px; align-items: center; width: 100%;
    `;
    editForm.innerHTML = `
      <input type="text" value="${record.lpn}" placeholder="LPN code" style="flex: 1; padding: 8px; border-radius: 4px; border: 1px solid #3A3A3C; color: #F5F5F7; background: transparent;" />
      <select style="flex: 1; padding: 8px; border-radius: 4px; border: 1px solid #3A3A3C; color: #F5F5F7; background: transparent;">
        <option value="OK" ${record.type === "OK" ? "selected" : ""}>OK</option>
        <option value="BER" ${record.type === "BER" ? "selected" : ""}>BER</option>
      </select>
      <input type="number" value="${record.price}" placeholder="Price (€)" step="0.01" style="flex: 1; padding: 8px; border-radius: 4px; border: 1px solid #3A3A3C; color: #F5F5F7; background: transparent;" />
      <input type="number" value="${record.qty}" placeholder="Qty (Punkty)" style="flex: 1; padding: 8px; border-radius: 4px; border: 1px solid #3A3A3C; color: #F5F5F7; background: transparent;" />
      <input type="text" value="${record.comment || ""}" placeholder="Comment" style="flex: 1; padding: 8px; border-radius: 4px; border: 1px solid #3A3A3C; color: #F5F5F7; background: transparent;" />
      <button class="macos-btn" style="padding: 8px 16px;">Save</button>
      <button class="macos-btn secondary" style="padding: 8px 16px;">Cancel</button>
    `;

    const row = elements.activeDay.tableBody.querySelector(`[data-id="${id}"]`).parentElement.parentElement;
    row.parentElement.replaceChild(editForm, row);

    editForm.querySelector(".macos-btn:not(.secondary)").addEventListener("click", () => {
      const inputs = editForm.querySelectorAll("input");
      const select = editForm.querySelector("select");
      const lpnVal = normalizeLPN(inputs[0].value);
      const typeVal = select.value;
      const priceVal = parseFloat(inputs[1].value) || 0;
      const qtyVal = parseFloat(inputs[2].value) || 0;
      const commentVal = inputs[3].value.trim();

      if (!lpnVal) {
        showNotification("LPN code is required", "error");
        return;
      }
      if (qtyVal <= 0 || priceVal < 0) {
        showNotification("Invalid quantity or price", "error");
        return;
      }

      const allRecords = Object.keys(data.days).flatMap((dayId) => data.days[dayId].records);
      if (allRecords.some((r) => r !== record && normalizeLPN(r.lpn) === lpnVal)) {
        showNotification(`LPN ${lpnVal} already exists`, "error");
        return;
      }

      record.lpn = lpnVal;
      record.type = typeVal;
      record.price = priceVal;
      record.qty = qtyVal;
      record.comment = commentVal;

      saveData().then(() => {
        renderActiveDay();
        checkAllRecordsAgainstInventory();
        debouncedDispatchCalendarUpdate();
        showNotification("Record updated successfully");
      });
    });

    editForm.querySelector(".macos-btn.secondary").addEventListener("click", () => {
      renderActiveDay();
    });
  };

  const deleteRecord = (id) => {
    const record = data.days[activeDayId].records.find((r) => r.id === id);
    if (!record) return;
    pushAction("deleteRecord", { dayId: activeDayId, record });
    data.days[activeDayId].records = data.days[activeDayId].records.filter((r) => r.id !== id);
    saveData().then(() => {
      renderActiveDay();
      checkAllRecordsAgainstInventory();
      debouncedDispatchCalendarUpdate();
      showNotification("Record deleted", "info", true);
    });
  };

  const checkAllRecordsAgainstInventory = async () => {
    const inventory = await loadInventory();
    const allRecords = Object.keys(data.days).flatMap((dayId) =>
      data.days[dayId].records.map((record) => ({
        ...record,
        dayId,
      }))
    );

    const matches = [];
    allRecords.forEach((record) => {
      const inventoryMatch = inventory.find((item) => item.code.toUpperCase() === normalizeLPN(record.lpn));
      if (inventoryMatch) {
        matches.push({ dayId: record.dayId, record, inventoryItem: inventoryMatch });
      }
    });

    if (matches.length > 0) showInventoryMatchesPopup(matches);
  };

  const showInventoryMatchesPopup = (matches) => {
    const popup = document.createElement("div");
    popup.className = "custom-popup";
    Object.assign(popup.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "rgba(28, 28, 30, 0.65)",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
      zIndex: "20000",
      minWidth: "400px",
      maxHeight: "80vh",
      overflowY: "auto",
      color: "#F5F5F7",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(20px) saturate(150%)",
      WebkitBackdropFilter: "blur(20px) saturate(150%)",
    });

    popup.innerHTML = `
      <h4 style="margin: 0 0 15px 0; text-align: center;">Found ${matches.length} LPN(s) in Inventory</h4>
      <p style="margin-bottom: 15px;">Select LPNs to remove from inventory:</p>
    `;

    const ul = document.createElement("ul");
    ul.style.listStyle = "none";
    ul.style.padding = "0";
    matches.forEach((match) => {
      const li = document.createElement("li");
      li.style.padding = "10px 0";
      li.style.borderBottom = "1px solid #3A3A3C";
      li.innerHTML = `
        <div style="display: flex; align-items: center;">
          <input type="checkbox" id="inv-match-${match.record.id}" data-lpn="${match.record.lpn}">
          <label for="inv-match-${match.record.id}" style="margin-left: 5px;">
            LPN: ${match.record.lpn} (Day: ${match.dayId}, Qty: ${match.record.qty})
          </label>
        </div>
      `;
      ul.appendChild(li);
    });
    popup.appendChild(ul);

    const btnContainer = document.createElement("div");
    btnContainer.style.display = "flex";
    btnContainer.style.gap = "10px";
    btnContainer.style.marginTop = "15px";
    btnContainer.style.justifyContent = "center";
    btnContainer.innerHTML = `
      <button class="macos-btn">Remove Selected</button>
      <button class="macos-btn secondary">Close</button>
    `;
    btnContainer.querySelector(".macos-btn:not(.secondary)").addEventListener("click", () => removeSelectedFromInventory(popup, matches));
    btnContainer.querySelector(".macos-btn.secondary").addEventListener("click", () => document.body.removeChild(popup));
    popup.appendChild(btnContainer);

    document.body.appendChild(popup);
  };

  const removeSelectedFromInventory = async (popup, matches) => {
    const checkboxes = popup.querySelectorAll("input[type='checkbox']:checked");
    if (checkboxes.length === 0) {
      showNotification("No items selected for removal", "error");
      document.body.removeChild(popup);
      return;
    }

    const inventory = await loadInventory();
    checkboxes.forEach((checkbox) => {
      const lpn = normalizeLPN(checkbox.dataset.lpn);
      const index = inventory.findIndex((item) => normalizeLPN(item.code) === lpn);
      if (index !== -1) inventory.splice(index, 1);
    });

    await saveInventory(inventory);
    document.body.removeChild(popup);
    showNotification("Selected items removed from inventory");
    checkAllRecordsAgainstInventory();
  };

  const updateDailyNorm = () => {
    const goalQty = parseFloat(elements.goal.qty.value) || 0;
    if (goalQty <= 0) {
      showNotification("Goal must be a positive number", "error");
      return;
    }
    monthlyNorm = goalQty;
    elements.goal.normDisplay.textContent = `Daily Norm: ${dailyNorm.toFixed(2)} (Monthly Norm: ${monthlyNorm.toFixed(2)})`;
    showNotification("Monthly goal updated");
    debouncedDispatchCalendarUpdate();
  };

  const toggleSchoolMode = () => {
    if (elements.extras.schoolModeCheckbox.checked && activeDayId) {
      data.days[activeDayId] = data.days[activeDayId] || { finished: false, records: [] };
      data.days[activeDayId].records.push({
        id: generateId(),
        lpn: "SCHOOL_MODE",
        type: "OK",
        price: 0,
        qty: 8.5,
        comment: "School Mode Bonus",
      });
      saveData().then(() => {
        showNotification("Added 8.5 points for School Mode");
        renderActiveDay();
        checkAllRecordsAgainstInventory();
        debouncedDispatchCalendarUpdate();
      });
    }
  };

  const backupTables = () => {
    const backupData = JSON.stringify(data);
    const blob = new Blob([backupData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mytable_backup_${formatDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification("Tables backed up successfully");
  };

  const importTables = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        data = importedData;
        activeDayId = "";
        saveData().then(() => {
          updateTargetPeriod();
          renderActiveDay();
          checkAllRecordsAgainstInventory();
          debouncedDispatchCalendarUpdate();
          showNotification("Tables imported successfully");
        });
      } catch (error) {
        showNotification("Error importing data: Invalid file format", "error");
      }
    };
    reader.readAsText(file);
  };

  const renderFilteredRecords = (records) => {
    const { tableBody } = elements.activeDay;
    tableBody.innerHTML = "";
    const fragment = document.createDocumentFragment();
    records.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.lpn}</td>
        <td>${r.type}</td>
        <td>${r.price.toFixed(2)}</td>
        <td>${r.qty}</td>
        <td>${r.comment || ""}</td>
        <td>
          <button class="macos-btn small-gray stop-propagation" data-action="edit" data-id="${r.id}">Edit</button>
          <button class="macos-btn small-gray stop-propagation" data-action="delete" data-id="${r.id}">Del</button>
        </td>
      `;
      tr.addEventListener("click", () => editRecord(r.id));
      fragment.appendChild(tr);
    });
    tableBody.appendChild(fragment);
  };

  elements.activeDay.form.addBtn.addEventListener("click", addRecord);
  elements.activeDay.tableBody.addEventListener("click", (e) => {
    const action = e.target.dataset.action;
    const id = e.target.dataset.id;
    if (e.target.classList.contains("stop-propagation")) e.stopPropagation();
    if (action === "edit") editRecord(id);
    else if (action === "delete") deleteRecord(id);
  });

  elements.goal.setBtn.addEventListener("click", updateDailyNorm);
  elements.extras.schoolModeCheckbox.addEventListener("change", toggleSchoolMode);
  elements.extras.backupBtn.addEventListener("click", backupTables);
  elements.extras.importBtn.addEventListener("click", () => elements.extras.importFileInput.click());
  elements.extras.importFileInput.addEventListener("change", importTables);

  elements.month.workingDaysSelect.addEventListener("change", (e) => {
    const selectedDate = e.target.value;
    if (!selectedDate) {
      activeDayId = "";
      saveData().then(() => {
        renderActiveDay();
        showNotification("Target Day deselected");
      });
      return;
    }

    activeDayId = selectedDate;
    if (!data.days[selectedDate]) {
      data.days[selectedDate] = { records: [], finished: false, date: selectedDate };
    }

    if (!calendarData[selectedDate]) {
      calendarData[selectedDate] = { status: 'working', points: 0, ok: 0, ber: 0, finished: false };
      localStorage.setItem('calendarData', JSON.stringify(calendarData));
    }

    saveData().then(() => {
      renderActiveDay();
      updateTargetPeriod();
      debouncedDispatchCalendarUpdate();
      showNotification(`Selected Target Day: ${workingDaysList.find(day => day.dateKey === activeDayId)?.display || selectedDate}`);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter" && document.activeElement.tagName !== "BUTTON") {
      addRecord();
    } else if (e.ctrlKey && e.key === "z") {
      undoAction();
    }
  });

  document.addEventListener("calendarDataUpdated", () => {
    if (!isUpdating) {
      updateTargetPeriod();
    }
  });

  function getTargetPeriod(date) {
    const now = new Date(date);
    const day = now.getDate();
    let start, end;

    if (day < 29) {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 29);
      end = new Date(now.getFullYear(), now.getMonth(), 28);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 29);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 28);
    }

    return { start, end };
  }

  function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  loadData().then(() => {
    updateTargetPeriod();
    renderActiveDay();
    checkAllRecordsAgainstInventory();
  });
});

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];