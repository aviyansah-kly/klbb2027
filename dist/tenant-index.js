(() => {
  "use strict";
  const all = Array.isArray(window.KLBB_TENANTS) ? window.KLBB_TENANTS : [];
  const grid = document.getElementById("tenantDirectoryGrid");
  const search = document.getElementById("tenantSearch");
  const count = document.getElementById("tenantCount");
  const empty = document.getElementById("tenantEmpty");
  if (!grid || !search) return;

  function makeCard(tenant) {
    const card = document.createElement("article");
    card.className = "tenant-directory-card";
    card.id = tenant.slug;
    const media = document.createElement("div");
    media.className = "tenant-directory-logo";
    media.style.setProperty("--tenant-bg", tenant.background || "#f5eee0");
    if (tenant.logo) {
      const img = document.createElement("img");
      img.src = tenant.logo;
      img.alt = "Logo " + tenant.name;
      img.loading = "lazy";
      img.decoding = "async";
      media.append(img);
    } else {
      const wordmark = document.createElement("span");
      wordmark.className = "tenant-directory-wordmark";
      wordmark.textContent = tenant.name;
      media.append(wordmark);
    }
    const body = document.createElement("div");
    body.className = "tenant-directory-body";
    const title = document.createElement("h3");
    title.textContent = tenant.name;
    const source = document.createElement("span");
    source.className = "tenant-directory-source";
    source.textContent = "Referensi Tenant 2026";
    body.append(title, source);
    if (tenant.orderUrl) {
      const order = document.createElement("a");
      order.className = "tenant-order-link";
      order.href = tenant.orderUrl;
      order.target = "_blank";
      order.rel = "noopener noreferrer";
      order.textContent = "Order Sekarang ↗";
      body.append(order);
    } else {
      const pending = document.createElement("span");
      pending.className = "tenant-order-pending";
      pending.textContent = "Info order menyusul";
      body.append(pending);
    }
    card.append(media, body);
    return card;
  }

  const cards = all.map(makeCard);
  grid.replaceChildren(...cards);
  function update() {
    const query = search.value.trim().toLocaleLowerCase("id");
    let visible = 0;
    cards.forEach((card, index) => {
      const matches = all[index].name.toLocaleLowerCase("id").includes(query);
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    count.textContent = visible + " dari " + all.length + " referensi tenant";
    if (empty) empty.hidden = visible !== 0;
  }
  search.addEventListener("input", update);
  update();

  function jumpToTenant() {
    const slug = decodeURIComponent(window.location.hash.slice(1));
    if (!slug || slug === "info-pemesanan") return;
    const target = cards.find((card) => card.id === slug);
    if (target) {
      search.value = "";
      update();
      requestAnimationFrame(() => target.scrollIntoView({ behavior: "auto", block: "center" }));
    }
  }
  window.addEventListener("hashchange", jumpToTenant);
  jumpToTenant();
})();
