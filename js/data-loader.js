/*
  data-loader.js
  ==============
  PURPOSE: Fetches JSON content files (data/*.json) and renders them
  into the page. This is the mechanism that lets you update your
  website by editing JSON instead of touching HTML.

  WHY IT EXISTS: The brief requires that adding new experience,
  certificates, or projects later takes "minimal changes" — editing
  a JSON file, not hand-editing markup. Each site section gets a
  `render<Section>()` function here.

  STATUS: Phase 1 added Hero + Test Run panel. Phase 2 added About
  (bio + quick facts) and Experience (timeline).

  HOW IT WORKS (pattern used by every section):
    - `load<Section>()` fetches data/<section>.json once and caches it.
    - `render<Section>(lang)` reads the bilingual fields (`en`/`id`
      keys in the JSON) and injects them into elements marked with
      a matching `data-field="..."` attribute.
    - Every render function re-runs on the `langchange` event
      dispatched by i18n.js, so switching language updates
      JSON-driven content too, not just static data-i18n text.

  HOW TO MODIFY:
    - To change hero checklist items: edit `heroChecks` in
      data/profile.json.
    - To change your bio or quick facts: edit data/about.json.
    - To add/edit/remove a job: edit the array in data/experience.json
      — the timeline re-renders automatically, most-recent-first, in
      whatever order the array is in (keep newest job first).
    - To add a new JSON-driven section later (Projects, Certificates,
      etc.): add a `data/<section>.json` file and a matching
      `render<Section>(lang)` function here, following this same
      pattern.
*/

const DataLoader = (() => {
  let profile = null;
  let about = null;
  let experience = null;
  let skills = null;
  let portfolio = null;
  let projects = null;
  let certificates = null;
  let activePortfolioTab = null; // set to the first category key once portfolio loads

  // Small helper so the portfolio sub-panels (Test Plan, RTM, API, SQL) can
  // reuse the "portfolio.*" label strings already loaded by i18n.js instead
  // of duplicating English/Indonesian copy here.
  const PORTFOLIO_LABELS = {
    get en() { return I18N.getStrings("en").portfolio; },
    get id() { return I18N.getStrings("id").portfolio; },
  };

  async function loadProfile() {
    if (!profile) {
      profile = await fetch("data/profile.json").then((r) => r.json());
    }
    return profile;
  }

  async function loadAbout() {
    if (!about) {
      about = await fetch("data/about.json").then((r) => r.json());
    }
    return about;
  }

  async function loadExperience() {
    if (!experience) {
      experience = await fetch("data/experience.json").then((r) => r.json());
    }
    return experience;
  }

  async function loadSkills() {
    if (!skills) {
      skills = await fetch("data/skills.json").then((r) => r.json());
    }
    return skills;
  }

  async function loadPortfolio() {
    if (!portfolio) {
      portfolio = await fetch("data/qa-portfolio.json").then((r) => r.json());
      activePortfolioTab = portfolio.categories[0].key;
    }
    return portfolio;
  }

  async function loadProjects() {
    if (!projects) {
      projects = await fetch("data/projects.json").then((r) => r.json());
    }
    return projects;
  }

  async function loadCertificates() {
    if (!certificates) {
      certificates = await fetch("data/certificates.json").then((r) => r.json());
    }
    return certificates;
  }

  function renderAbout(lang) {
    if (!about) return;
    const bioContainer = document.querySelector("[data-field='about-bio']");
    const factsContainer = document.querySelector("[data-field='about-facts']");
    if (bioContainer) {
      bioContainer.innerHTML = about.bio[lang]
        .map((paragraph) => `<p>${paragraph}</p>`)
        .join("");
    }
    if (factsContainer) {
      factsContainer.innerHTML = about.quickFacts
        .map(
          (fact) => `
          <div class="fact">
            <dt>${fact.label[lang]}</dt>
            <dd>${fact.value[lang]}</dd>
          </div>`
        )
        .join("");
    }
  }

  function renderProjects(lang) {
    if (!projects) return;
    const container = document.querySelector("[data-field='projects-grid']");
    if (!container) return;

    container.innerHTML = projects
      .map(
        (p) => `
        <article class="project-card">
          <div class="project-card__header">
            <span class="project-card__type">${p.type}</span>
          </div>
          <h3 class="project-card__title">${p.title[lang]}</h3>
          <p class="project-card__desc">${p.description[lang]}</p>
          <div class="project-card__tools">
            ${p.tools.map((t) => `<span class="chip">${t}</span>`).join("")}
          </div>
          <a href="#" class="project-card__link">${p.linkLabel[lang]} →</a>
        </article>`
      )
      .join("");
  }

  function renderCertificates(lang) {
    if (!certificates) return;
    const container = document.querySelector("[data-field='certificates-grid']");
    if (!container) return;

    container.innerHTML = certificates
      .map(
        (c) => `
        <article class="cert-card">
          <span class="cert-card__category mono">${c.category[lang]}</span>
          <h4 class="cert-card__name">${c.name}</h4>
          <div class="cert-card__meta">
            <span>${c.issuer}</span>
            <span class="mono">${c.date}</span>
          </div>
        </article>`
      )
      .join("");
  }

  function renderSkills(lang) {
    if (!skills) return;
    const container = document.querySelector("[data-field='skills-grid']");
    if (!container) return;

    container.innerHTML = skills
      .map(
        (category) => `
        <div class="skill-category">
          <h3 class="skill-category__label">${category.label[lang]}</h3>
          <div class="skill-category__chips">
            ${category.items.map((item) => `<span class="chip">${item}</span>`).join("")}
          </div>
        </div>`
      )
      .join("");
  }

  function renderPortfolioTabs(lang) {
    const tabsContainer = document.querySelector("[data-field='portfolio-tabs']");
    if (!tabsContainer || !portfolio) return;

    tabsContainer.innerHTML = portfolio.categories
      .map(
        (cat) => `
        <button
          type="button"
          class="tab-btn${cat.key === activePortfolioTab ? " is-active" : ""}"
          data-tab-key="${cat.key}"
          aria-pressed="${cat.key === activePortfolioTab}"
        >
          ${cat.label[lang]}
          ${cat.status === "soon" ? '<span class="tab-btn__soon-dot" aria-hidden="true"></span>' : ""}
        </button>`
      )
      .join("");

    tabsContainer.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activePortfolioTab = btn.dataset.tabKey;
        renderPortfolioTabs(I18N.getLang());
        renderPortfolioPanel(I18N.getLang());
      });
    });
  }

  function renderPortfolioPanel(lang) {
    const panel = document.querySelector("[data-field='portfolio-panel']");
    if (!panel || !portfolio) return;

    const category = portfolio.categories.find((c) => c.key === activePortfolioTab);
    if (!category) return;

    if (category.status === "soon") {
      const soonLabel = lang === "id" ? "Segera hadir" : "Coming soon";
      panel.innerHTML = `
        <div class="portfolio-soon">
          <span class="portfolio-soon__badge mono">${soonLabel}</span>
          <p>${category.label[lang]} — ${lang === "id" ? "sedang disiapkan." : "in progress."}</p>
        </div>`;
      return;
    }

    if (category.key === "test-cases") {
      panel.innerHTML = `
        <p class="portfolio-note">${portfolio.note[lang]}</p>
        <div class="tc-list">
          ${portfolio.testCases
            .map(
              (tc) => `
              <article class="tc-card">
                <div class="tc-card__header">
                  <span class="tc-card__id mono">${tc.id}</span>
                  <span class="tc-card__module">${tc.module}</span>
                  <span class="tc-card__priority tc-card__priority--${tc.priority.toLowerCase()}">${tc.priority}</span>
                </div>
                <h4 class="tc-card__title">${tc.title[lang]}</h4>
                <ol class="tc-card__steps">
                  ${tc.steps[lang].map((s) => `<li>${s}</li>`).join("")}
                </ol>
                <div class="tc-card__expected">
                  <span class="mono label">${lang === "id" ? "Hasil yang diharapkan" : "Expected result"}</span>
                  <p>${tc.expected[lang]}</p>
                </div>
              </article>`
            )
            .join("")}
        </div>`;
      return;
    }

    if (category.key === "bug-reports") {
      panel.innerHTML = `
        <p class="portfolio-note">${portfolio.note[lang]}</p>
        <div class="bug-list">
          ${portfolio.bugReports
            .map(
              (bug) => `
              <article class="bug-card">
                <div class="bug-card__header">
                  <span class="bug-card__id mono">${bug.id}</span>
                  <span class="bug-card__severity bug-card__severity--${bug.severity.toLowerCase()}">${bug.severity}</span>
                  <span class="bug-card__status">${bug.status}</span>
                </div>
                <h4 class="bug-card__title">${bug.title[lang]}</h4>
                <p class="bug-card__env mono">${bug.environment}</p>

                <div class="bug-card__block">
                  <span class="mono label">${lang === "id" ? "Langkah reproduksi" : "Steps to reproduce"}</span>
                  <ol>${bug.stepsToReproduce[lang].map((s) => `<li>${s}</li>`).join("")}</ol>
                </div>
                <div class="bug-card__block">
                  <span class="mono label">${lang === "id" ? "Hasil yang diharapkan" : "Expected result"}</span>
                  <p>${bug.expected[lang]}</p>
                </div>
                <div class="bug-card__block">
                  <span class="mono label">${lang === "id" ? "Hasil aktual" : "Actual result"}</span>
                  <p>${bug.actual[lang]}</p>
                </div>
              </article>`
            )
            .join("")}
        </div>`;
      return;
    }

    if (category.key === "test-plan") {
      const tp = portfolio.testPlan;
      const L = PORTFOLIO_LABELS[lang];
      panel.innerHTML = `
        <div class="doc-panel">
          <div class="doc-block">
            <span class="doc-block__label mono">${L.objective}</span>
            <p>${tp.objective[lang]}</p>
          </div>
          <div class="doc-block doc-block--split">
            <div>
              <span class="doc-block__label mono">${L.inScope}</span>
              <ul>${tp.inScope[lang].map((i) => `<li>${i}</li>`).join("")}</ul>
            </div>
            <div>
              <span class="doc-block__label mono">${L.outScope}</span>
              <ul>${tp.outScope[lang].map((i) => `<li>${i}</li>`).join("")}</ul>
            </div>
          </div>
          <div class="doc-block">
            <span class="doc-block__label mono">${L.approach}</span>
            <p>${tp.approach[lang]}</p>
          </div>
          <div class="doc-block doc-block--split">
            <div>
              <span class="doc-block__label mono">${L.entryCriteria}</span>
              <ul>${tp.entryCriteria[lang].map((i) => `<li>${i}</li>`).join("")}</ul>
            </div>
            <div>
              <span class="doc-block__label mono">${L.exitCriteria}</span>
              <ul>${tp.exitCriteria[lang].map((i) => `<li>${i}</li>`).join("")}</ul>
            </div>
          </div>
        </div>`;
      return;
    }

    if (category.key === "rtm") {
      const L = PORTFOLIO_LABELS[lang];
      const coverageLabel = (c) => (c === "covered" ? L.covered : c === "partial" ? L.partial : L.notCovered);
      panel.innerHTML = `
        <div class="rtm-table-wrap">
          <table class="rtm-table">
            <thead>
              <tr>
                <th>${L.reqId}</th>
                <th>${L.requirement}</th>
                <th>${L.testCases}</th>
                <th>${L.coverage}</th>
              </tr>
            </thead>
            <tbody>
              ${portfolio.rtm
                .map(
                  (row) => `
                  <tr>
                    <td class="mono">${row.reqId}</td>
                    <td>${row.requirement[lang]}</td>
                    <td class="mono">${row.testCaseIds.join(", ") || "—"}</td>
                    <td><span class="coverage-badge coverage-badge--${row.coverage}">${coverageLabel(row.coverage)}</span></td>
                  </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>`;
      return;
    }

    if (category.key === "api-testing") {
      const L = PORTFOLIO_LABELS[lang];
      panel.innerHTML = `
        <div class="api-list">
          ${portfolio.apiTests
            .map(
              (api) => `
              <article class="api-card">
                <div class="api-card__header">
                  <span class="api-card__method api-card__method--${api.method.toLowerCase()}">${api.method}</span>
                  <span class="api-card__endpoint mono">${api.endpoint}</span>
                  <span class="api-card__id mono">${api.id}</span>
                </div>
                <p class="api-card__desc">${api.description[lang]}</p>
                <div class="doc-block">
                  <span class="doc-block__label mono">${L.request}</span>
                  <pre class="code-block">${api.request}</pre>
                </div>
                <div class="doc-block">
                  <span class="doc-block__label mono">${L.expectedResponse}</span>
                  <p><span class="status-code mono">${api.expectedStatus}</span> — ${api.expectedNote[lang]}</p>
                </div>
              </article>`
            )
            .join("")}
        </div>`;
      return;
    }

    if (category.key === "sql-validation") {
      const L = PORTFOLIO_LABELS[lang];
      panel.innerHTML = `
        <div class="api-list">
          ${portfolio.sqlChecks
            .map(
              (sql) => `
              <article class="api-card">
                <div class="api-card__header">
                  <span class="api-card__id mono">${sql.id}</span>
                </div>
                <div class="doc-block">
                  <span class="doc-block__label mono">${L.purpose}</span>
                  <p>${sql.purpose[lang]}</p>
                </div>
                <div class="doc-block">
                  <span class="doc-block__label mono">${L.query}</span>
                  <pre class="code-block">${sql.query}</pre>
                </div>
                <div class="doc-block">
                  <span class="doc-block__label mono">${L.expectedResult}</span>
                  <p>${sql.expectedResult[lang]}</p>
                </div>
              </article>`
            )
            .join("")}
        </div>`;
      return;
    }

    if (category.key === "test-scenarios") {
      panel.innerHTML = `
        <div class="tc-list">
          ${portfolio.testScenarios
            .map(
              (sc) => `
              <article class="tc-card">
                <div class="tc-card__header">
                  <span class="tc-card__id mono">${sc.id}</span>
                  <span class="tc-card__module">${sc.module}</span>
                </div>
                <h4 class="tc-card__title">${sc.title[lang]}</h4>
                <p class="api-card__desc">${sc.description[lang]}</p>
              </article>`
            )
            .join("")}
        </div>`;
      return;
    }

    if (category.key === "strategy") {
      const st = portfolio.strategy;
      const L = PORTFOLIO_LABELS[lang];
      panel.innerHTML = `
        <div class="doc-panel">
          <div class="doc-block">
            <span class="doc-block__label mono">${L.approach}</span>
            <p>${st.approach[lang]}</p>
          </div>
          <div class="doc-block">
            <span class="doc-block__label mono">${L.testLevels}</span>
            <ul>${st.testLevels[lang].map((i) => `<li>${i}</li>`).join("")}</ul>
          </div>
          <div class="doc-block">
            <span class="doc-block__label mono">${L.toolStack}</span>
            <div class="skill-category__chips">${st.toolStack.map((t) => `<span class="chip">${t}</span>`).join("")}</div>
          </div>
          <div class="doc-block">
            <span class="doc-block__label mono">${L.automationRoadmap}</span>
            <p>${st.automationRoadmap[lang]}</p>
          </div>
        </div>`;
      return;
    }

    if (category.key === "regression") {
      const rg = portfolio.regression;
      const L = PORTFOLIO_LABELS[lang];
      panel.innerHTML = `
        <div class="doc-panel">
          <div class="doc-block">
            <span class="doc-block__label mono">${L.approach}</span>
            <p>${rg.approach[lang]}</p>
          </div>
          <div class="doc-block">
            <span class="doc-block__label mono">${L.checklist}</span>
            <ul>${rg.checklist[lang].map((i) => `<li>${i}</li>`).join("")}</ul>
          </div>
          <div class="doc-block">
            <span class="doc-block__label mono">${L.lastRun} — ${rg.lastRun.date}</span>
            <div class="run-stats">
              <div class="run-stat"><span class="run-stat__value">${rg.lastRun.total}</span><span class="run-stat__label">${L.total}</span></div>
              <div class="run-stat run-stat--pass"><span class="run-stat__value">${rg.lastRun.passed}</span><span class="run-stat__label">${L.passed}</span></div>
              <div class="run-stat run-stat--fail"><span class="run-stat__value">${rg.lastRun.failed}</span><span class="run-stat__label">${L.failed}</span></div>
              <div class="run-stat"><span class="run-stat__value">${rg.lastRun.blocked}</span><span class="run-stat__label">${L.blocked}</span></div>
            </div>
          </div>
        </div>`;
      return;
    }

    if (category.key === "smoke" || category.key === "production") {
      const src = category.key === "smoke" ? portfolio.smoke : portfolio.production;
      const L = PORTFOLIO_LABELS[lang];
      panel.innerHTML = `
        <div class="doc-panel">
          <div class="doc-block">
            <span class="doc-block__label mono">${L.approach}</span>
            <p>${src.approach[lang]}</p>
          </div>
          <div class="checklist">
            ${src.checklist
              .map(
                (item) => `
                <div class="checklist__row">
                  <span class="checklist__check" aria-hidden="true">✓</span>
                  <span class="checklist__label">${item.label[lang]}</span>
                  <span class="checklist__id mono">${item.id}</span>
                </div>`
              )
              .join("")}
          </div>
        </div>`;
      return;
    }

    if (category.key === "sit-uat") {
      const su = portfolio.sitUat;
      const L = PORTFOLIO_LABELS[lang];
      panel.innerHTML = `
        <div class="doc-panel">
          <div class="doc-block doc-block--split">
            <div>
              <span class="doc-block__label mono">${L.sit}</span>
              <p>${su.sitDescription[lang]}</p>
            </div>
            <div>
              <span class="doc-block__label mono">${L.uat}</span>
              <p>${su.uatDescription[lang]}</p>
            </div>
          </div>
          <div class="signoff-card">
            <span class="doc-block__label mono">${L.signOff}</span>
            <div class="signoff-card__row"><span>${L.project}</span><span>${su.signOff.project}</span></div>
            <div class="signoff-card__row"><span>${L.stakeholder}</span><span>${su.signOff.stakeholder}</span></div>
            <div class="signoff-card__row"><span>${L.date}</span><span class="mono">${su.signOff.date}</span></div>
            <div class="signoff-card__row"><span>${L.status}</span><span class="signoff-card__status">${su.signOff.status}</span></div>
            <p class="signoff-card__notes">${su.signOff.notes[lang]}</p>
          </div>
        </div>`;
      return;
    }

    if (category.key === "lifecycle") {
      const L = PORTFOLIO_LABELS[lang];
      panel.innerHTML = `
        <div class="stepper">
          ${portfolio.lifecycle.phases
            .map(
              (ph) => `
              <div class="stepper__item">
                <span class="stepper__number mono">${ph.number}</span>
                <h4 class="stepper__title">${ph.title[lang]}</h4>
                <p class="stepper__desc">${ph.description[lang]}</p>
              </div>`
            )
            .join("")}
        </div>`;
      return;
    }

    if (category.key === "agile") {
      panel.innerHTML = `
        <div class="tc-list">
          ${portfolio.agile.ceremonies
            .map(
              (c) => `
              <article class="tc-card">
                <h4 class="tc-card__title">${c.name[lang]}</h4>
                <p class="api-card__desc">${c.qaRole[lang]}</p>
              </article>`
            )
            .join("")}
        </div>`;
      return;
    }
  }

  function renderPortfolio(lang) {
    if (!portfolio) return;
    renderPortfolioTabs(lang);
    renderPortfolioPanel(lang);
  }

  function renderExperience(lang) {
    if (!experience) return;
    const container = document.querySelector("[data-field='experience-list']");
    if (!container) return;

    const currentLabel = lang === "id" ? "Saat ini" : "Current";

    container.innerHTML = experience
      .map(
        (job) => `
        <article class="timeline-item">
          <div class="timeline-item__meta">
            <span class="timeline-item__period mono">${job.period[lang]}</span>
            ${job.current ? `<span class="timeline-item__badge">${currentLabel}</span>` : ""}
          </div>
          <div class="timeline-item__body">
            <h3 class="timeline-item__role">${job.role[lang]}</h3>
            <p class="timeline-item__company">${job.company}</p>
            <ul class="timeline-item__achievements">
              ${job.achievements[lang].map((a) => `<li>${a}</li>`).join("")}
            </ul>
          </div>
        </article>`
      )
      .join("");
  }

  function renderHero(lang) {
    if (!profile) return;
    const nameEl = document.querySelector("[data-field='name']");
    const roleEl = document.querySelector("[data-field='role']");
    const summaryEl = document.querySelector("[data-field='summary']");

    if (nameEl) nameEl.textContent = profile.name;
    if (roleEl) roleEl.textContent = profile.role[lang];
    if (summaryEl) summaryEl.textContent = profile.summary[lang];
  }

  function renderTestPanel(lang) {
    if (!profile) return;
    const container = document.querySelector("[data-field='test-panel-rows']");
    if (!container) return;

    container.innerHTML = "";
    profile.heroChecks.forEach((check, index) => {
      const row = document.createElement("div");
      row.className = "test-panel__row";
      row.style.animationDelay = `${index * 180}ms`;
      row.innerHTML = `
        <span class="status" aria-hidden="true">✓</span>
        <span class="label">${check.label[lang]}</span>
        <span class="id">${check.id}</span>
      `;
      container.appendChild(row);
    });
  }

  async function init() {
    await Promise.all([
      loadProfile(),
      loadAbout(),
      loadExperience(),
      loadSkills(),
      loadPortfolio(),
      loadProjects(),
      loadCertificates(),
    ]);
    const lang = I18N.getLang();
    renderHero(lang);
    renderTestPanel(lang);
    renderAbout(lang);
    renderExperience(lang);
    renderSkills(lang);
    renderPortfolio(lang);
    renderProjects(lang);
    renderCertificates(lang);

    document.addEventListener("langchange", (e) => {
      renderHero(e.detail.lang);
      renderTestPanel(e.detail.lang);
      renderAbout(e.detail.lang);
      renderExperience(e.detail.lang);
      renderSkills(e.detail.lang);
      renderPortfolio(e.detail.lang);
      renderProjects(e.detail.lang);
      renderCertificates(e.detail.lang);
    });
  }

  return { init };
})();
