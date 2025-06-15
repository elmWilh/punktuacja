// Language and translation helper
const translations = {
  ru: {
    appTitle: "Punktuacija 0.1",
    popupHeader: "Punktuacija 0.1",
    searchInputPlaceholder: "Введите данные (например, CE912024, 3029u34, или 3029u34 - Devices)",
    searchButton: "Поиск",
    settings: "Настройки",
    selectLanguage: "Выберите язык:",
    autoclicker: "Настройки автокликера",
    autoclickerPlaceholder: "Функциональность в разработке",
    autoclickerNote: "Создание задач автокликера пока не реализовано",
    inventory: "Инвертаризация",
    inventoryInputPlaceholder: "Введите код продукта",
    addButton: "Записать",
    checkMode: "Режим проверки ошибочных кодов",
    errorCodesPlaceholder: "Ошибка: код1,код2,...",
    downloadButton: "Скачать .txt",
    backLink: "Вернуться",
    foundOnSite: "Найдено на сайте:",
    editComment: "Редактировать комментарий",
    deleteProduct: "Удалить продукт",
    confirmDelete: "Вы уверены, что хотите удалить этот продукт?",
    productAdded: "Продукт добавлен",
    productDeleted: "Продукт удален",
    commentSaved: "Комментарий сохранен",
    noComment: "Комментариев нет",
    enterInfo: "Введите запрос для поиска.",
    nothingFound: "Ничего не найдено.",
    changeShelf: "Сменить полку",
    save: "Сохранить",
    cancel: "Отмена",
    noShelf: "Без полки",
    newCodesDetected: "Обнаружены новые коды",
    optionalComment: "Необязательный комментарий",
    saveNewCodes: "Сохранить новые коды",
    newCodeAdditionCanceled: "Добавление отменено",
    settingsSaved: "Настройки сохранены",
    autoclickerSettingsSaved: "Настройки автокликера сохранены",
    expand: "Развернуть",
    collapse: "Свернуть"
  },
  en: {
    appTitle: "Punktuacija 0.1",
    popupHeader: "Punktuacija 0.1",
    searchInputPlaceholder: "Enter data (e.g., CE912024, 3029u34, or 3029u34 - Devices)",
    searchButton: "Search",
    settings: "Settings",
    selectLanguage: "Select language:",
    autoclicker: "Autoclicker Settings",
    autoclickerPlaceholder: "Functionality under development",
    autoclickerNote: "Autoclicker task creation is not implemented yet",
    inventory: "Inventory",
    inventoryInputPlaceholder: "Enter product code",
    addButton: "Add",
    checkMode: "Code Check Mode",
    errorCodesPlaceholder: "Error: code1,code2,...",
    downloadButton: "Download .txt",
    backLink: "Back",
    foundOnSite: "Found on site:",
    editComment: "Edit Comment",
    deleteProduct: "Delete Product",
    confirmDelete: "Are you sure you want to delete this product?",
    productAdded: "Product added",
    productDeleted: "Product deleted",
    commentSaved: "Comment saved",
    noComment: "No comments",
    enterInfo: "Enter any info to search.",
    nothingFound: "Nothing found.",
    changeShelf: "Change shelf",
    save: "Save",
    cancel: "Cancel",
    noShelf: "No Shelf",
    newCodesDetected: "New codes detected",
    optionalComment: "Optional comment",
    saveNewCodes: "Save new codes",
    newCodeAdditionCanceled: "New code addition canceled",
    settingsSaved: "Settings saved",
    autoclickerSettingsSaved: "Autoclicker settings saved",
    expand: "Expand",
    collapse: "Collapse"
  },
  pl: {
    appTitle: "Punktuacja 0.1",
    popupHeader: "Punktuacja 0.1",
    searchInputPlaceholder: "Wprowadź dane (np. CE912024, 3029u34, lub 3029u34 - Devices)",
    searchButton: "Szukaj",
    settings: "Ustawienia",
    selectLanguage: "Wybierz język:",
    autoclicker: "Ustawienia autoclickera",
    autoclickerPlaceholder: "Funkcjonalność w fazie rozwoju",
    autoclickerNote: "Tworzenie zadań autoclickera nie jest jeszcze zaimplementowane",
    inventory: "Inwentaryzacja",
    inventoryInputPlaceholder: "Wprowadź kod produktu",
    addButton: "Dodaj",
    checkMode: "Tryb sprawdzania błędnych kodów",
    errorCodesPlaceholder: "Błąd: kod1,kod2,...",
    downloadButton: "Pobierz .txt",
    backLink: "Powrót",
    foundOnSite: "Znalezione na stronie:",
    editComment: "Edytuj komentarz",
    deleteProduct: "Usuń produkt",
    confirmDelete: "Czy na pewno chcesz usunąć ten produkt?",
    productAdded: "Produkt dodany",
    productDeleted: "Produkt usunięty",
    commentSaved: "Komentarz zapisany",
    noComment: "Brak komentarzy",
    enterInfo: "Wprowadź dane do wyszukania.",
    nothingFound: "Nic nie znaleziono.",
    changeShelf: "Zmień półkę",
    save: "Zapisz",
    cancel: "Anuluj",
    noShelf: "Brak półki",
    newCodesDetected: "Wykryto nowe kody",
    optionalComment: "Opcjonalny komentarz",
    saveNewCodes: "Zapisz nowe kody",
    newCodeAdditionCanceled: "Dodawanie anulowano",
    settingsSaved: "Ustawienia zapisane",
    autoclickerSettingsSaved: "Ustawienia autoclickera zapisane",
    expand: "Rozwiń",
    collapse: "Zwiń"
  }
};

function getTranslation(key, lang = localStorage.getItem("appLanguage") || "ru") {
  const l = translations[lang] || translations.en;
  return l[key] || key;
}

function applyTranslations(lang) {
  document.documentElement.lang = lang;
  const t = translations[lang] || translations.en;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (t[key]) el.textContent = t[key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (t[key]) el.placeholder = t[key];
  });
}

window.applyTranslations = applyTranslations;
window.t = getTranslation;

document.addEventListener("DOMContentLoaded", function () {
  const lang = localStorage.getItem("appLanguage") || "ru";
  applyTranslations(lang);
  const languageSelect = document.getElementById("language-select");
  if (languageSelect) {
    languageSelect.value = lang;
    languageSelect.addEventListener("change", function () {
      const newLang = languageSelect.value;
      localStorage.setItem("appLanguage", newLang);
      applyTranslations(newLang);
    });
  }
});

window.addEventListener("storage", (e) => {
  if (e.key === "appLanguage") {
    const newLang = e.newValue || "ru";
    applyTranslations(newLang);
    const languageSelect = document.getElementById("language-select");
    if (languageSelect) languageSelect.value = newLang;
  }
});
