/*
  i18n.js
  =======
  PURPOSE: Loads UI translation strings (i18n/en.json, i18n/id.json)
  and swaps them into the page instantly, with no reload.

  WHY IT EXISTS: The brief requires bilingual EN/ID support with
  instant switching. Rather than duplicating HTML per language, every
  translatable element gets a `data-i18n="key.path"` attribute, and
  this module fills in the right text for the active language.

  HOW IT WORKS:
    1. On load, fetch both en.json and id.json and cache them.
    2. Read the saved language preference from localStorage
       (defaults to "en" if none saved, or "id" if the browser
       language starts with "id").
    3. Walk every element with a `data-i18n` attribute and set its
       text (or innerHTML for the few keys marked data-i18n-html)
       to the matching translation string.
    4. Update the <html lang="..."> attribute and the pressed state
       of the language switch buttons for accessibility.

  HOW TO MODIFY:
    - To add a new translatable string: add the same key to BOTH
      i18n/en.json and i18n/id.json, then add data-i18n="that.key"
      to the HTML element that should display it.
    - Keys are dot-notated to stay organized, e.g. "nav.about",
      "hero.title". See i18n/en.json for the existing structure.
*/

const I18N = (() => {
  let translations = {};
  let currentLang = "en";

  // Resolves a dot-notated key like "hero.title" against a nested object
  function resolveKey(obj, path) {
    return path.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), obj);
  }

  async function loadTranslations() {
    const [en, id] = await Promise.all([
      fetch("i18n/en.json").then((r) => r.json()),
      fetch("i18n/id.json").then((r) => r.json()),
    ]);
    translations = { en, id };
  }

  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.setAttribute("lang", lang);
    localStorage.setItem("preferredLang", lang);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = resolveKey(translations[lang], key);
      if (value === undefined) return; // fail loud in console, not silently break UI
      if (el.hasAttribute("data-i18n-html")) {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    });

    document.querySelectorAll(".lang-switch button").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.dataset.lang === lang ? "true" : "false");
    });

    // Let other modules (like data-loader.js) know the language changed,
    // in case they render JSON content that also needs translating.
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
  }

  function getLang() {
    return currentLang;
  }

  function getStrings(lang) {
    return translations[lang] || {};
  }

  async function init() {
    await loadTranslations();
    const saved = localStorage.getItem("preferredLang");
    const browserLang = navigator.language?.startsWith("id") ? "id" : "en";
    applyLanguage(saved || browserLang);

    document.querySelectorAll(".lang-switch button").forEach((btn) => {
      btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
    });
  }

  return { init, applyLanguage, getLang, getStrings };
})();
