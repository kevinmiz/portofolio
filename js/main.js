/*
  main.js
  =======
  PURPOSE: The single entry point that boots the page. Keeping this
  file tiny and readable means anyone (including future-you) can see
  the whole startup sequence at a glance.

  WHY IT EXISTS: i18n must finish loading BEFORE data-loader renders
  content, since data-loader needs to know the active language. This
  file makes that order explicit instead of leaving it implicit.

  HOW TO MODIFY: As later phases add modules (e.g. experience.js,
  certificates.js), initialize them here, after DataLoader.init(),
  following the same `await Module.init()` pattern.
*/

document.addEventListener("DOMContentLoaded", async () => {
  // Dev convenience only: fetch() is blocked under file:// in most browsers,
  // which would otherwise leave the hero silently blank with no explanation.
  // This never triggers on GitHub Pages or any real server (http/https).
  if (location.protocol === "file:") {
    showLocalFileNotice();
    return;
  }

  await I18N.init();
  await DataLoader.init();
});

function showLocalFileNotice() {
  const banner = document.createElement("div");
  banner.setAttribute("role", "alert");
  banner.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: #E5484D; color: #fff; font-family: sans-serif;
    font-size: 14px; padding: 12px 20px; text-align: center;
  `;
  banner.innerHTML = `
    This page was opened directly from a file, so content can't load.
    Run a local server instead — see README.md — or view it once deployed to GitHub Pages.
  `;
  document.body.prepend(banner);
}
