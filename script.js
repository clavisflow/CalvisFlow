(function () {
  const header = document.querySelector("[data-header]");
  const form = document.querySelector("[data-diagnosis-form]");
  const result = document.querySelector("[data-result]");
  const mailLink = document.querySelector("[data-mail-link]");
  const canvas = document.querySelector("[data-hero-canvas]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const siteNav = document.querySelector("[data-site-nav]");

  function updateHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  }

  function setMenuOpen(isOpen) {
    header.classList.toggle("is-menu-open", isOpen);
    menuToggle?.setAttribute("aria-expanded", String(isOpen));
    menuToggle?.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
  }

  function toggleMenu() {
    setMenuOpen(!header.classList.contains("is-menu-open"));
  }

  function drawHero() {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight * 0.96;

    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(ratio, ratio);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#101716");
    gradient.addColorStop(0.48, "#17312f");
    gradient.addColorStop(1, "#203c37");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const nodes = [
      [0.62, 0.22, 22, "#0d9488"],
      [0.78, 0.28, 15, "#e2a336"],
      [0.7, 0.47, 28, "#f7f7f2"],
      [0.86, 0.56, 20, "#dc6b55"],
      [0.58, 0.68, 18, "#0d9488"],
      [0.75, 0.76, 24, "#e2a336"],
      [0.91, 0.35, 13, "#f7f7f2"]
    ];

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(247, 247, 242, 0.22)";
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const [ax, ay] = nodes[i];
        const [bx, by] = nodes[j];
        const distance = Math.hypot(ax - bx, ay - by);
        if (distance < 0.28) {
          ctx.beginPath();
          ctx.moveTo(ax * width, ay * height);
          ctx.lineTo(bx * width, by * height);
          ctx.stroke();
        }
      }
    }

    nodes.forEach(([x, y, size, color], index) => {
      const px = x * width;
      const py = y * height;
      ctx.beginPath();
      ctx.fillStyle = `${color}22`;
      ctx.arc(px, py, size * 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(17, 23, 22, 0.72)";
      ctx.font = "700 12px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(index + 1).padStart(2, "0"), px, py);
    });

    const panelX = width * 0.54;
    const panelY = height * 0.17;
    const panelW = Math.min(width * 0.4, 560);
    const panelH = height * 0.58;

    ctx.fillStyle = "rgba(247, 247, 242, 0.08)";
    roundRect(ctx, panelX, panelY, panelW, panelH, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(247, 247, 242, 0.18)";
    ctx.stroke();

    for (let row = 0; row < 6; row += 1) {
      const y = panelY + 58 + row * 58;
      ctx.fillStyle = row % 3 === 0 ? "rgba(226, 163, 54, 0.34)" : "rgba(13, 148, 136, 0.28)";
      roundRect(ctx, panelX + 38, y, panelW * (0.48 + row * 0.055), 13, 7);
      ctx.fill();
      ctx.fillStyle = "rgba(247, 247, 242, 0.2)";
      roundRect(ctx, panelX + 38, y + 22, panelW * 0.78, 8, 4);
      ctx.fill();
    }
  }

  function roundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function getSelectedText(control) {
    return control.options[control.selectedIndex]?.text || "";
  }

  function handleDiagnosis(event) {
    event.preventDefault();

    const data = new FormData(form);
    const required = ["appType", "impact", "maintainer", "age"];
    const missing = required.some((name) => !data.get(name));

    if (missing) {
      form.reportValidity();
      return;
    }

    const baseScore = ["impact", "maintainer", "age"]
      .map((name) => Number(data.get(name)))
      .reduce((sum, value) => sum + value, 0);
    const concernScore = Array.from(form.querySelectorAll("[data-risk]:checked")).length;
    const score = baseScore + concernScore;

    let title = "改善余地あり";
    let message = "大きな緊急性は低めですが、仕様と運用手順を整理しておくと次の変更が軽くなります。";
    let next = "まずは画面、帳票、データ、連携先の一覧化から始めるのがおすすめです。";

    if (score >= 10) {
      title = "優先診断レベル";
      message = "業務影響と属人化の両面でリスクが高めです。止めずに分離できる領域から計画化する価値があります。";
      next = "現行機能の棚卸し、バックアップ確認、変更頻度の高い箇所の切り出しを先に進めましょう。";
    } else if (score >= 7) {
      title = "計画着手レベル";
      message = "今すぐ全面刷新でなくても、保守期限や担当依存への備えを始めたい状態です。";
      next = "短期の安定化と中期の置き換え候補を分けて、無理のないロードマップにしましょう。";
    }

    result.innerHTML = `
      <span class="result-label">診断結果</span>
      <strong>${title}</strong>
      <p>${message}</p>
      <p>${next}</p>
    `;

    const appType = getSelectedText(form.elements.appType);
    const impact = getSelectedText(form.elements.impact);
    const maintainer = getSelectedText(form.elements.maintainer);
    const age = getSelectedText(form.elements.age);
    const concerns = Array.from(form.querySelectorAll("[name='concerns']:checked"))
      .map((input) => input.nextElementSibling.textContent.trim())
      .join(" / ") || "未選択";
    const note = data.get("message") || "未入力";
    const body = [
      "ClavisFlow 無料診断について相談したいです。",
      "",
      `診断結果: ${title}`,
      `アプリの種類: ${appType}`,
      `業務への影響度: ${impact}`,
      `保守できる人: ${maintainer}`,
      `最終更新からの期間: ${age}`,
      `気になっていること: ${concerns}`,
      "",
      `相談内容: ${note}`
    ].join("\n");

    mailLink.href = `mailto:hello@clavisflow.net?subject=${encodeURIComponent("無料レガシーアプリ診断の相談")}&body=${encodeURIComponent(body)}`;
    mailLink.classList.add("is-visible");
    result.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("resize", drawHero);
  menuToggle?.addEventListener("click", toggleMenu);
  siteNav?.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setMenuOpen(false);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  });
  form?.addEventListener("submit", handleDiagnosis);
  updateHeader();
  drawHero();
})();
