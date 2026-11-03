// Searchable tenant directory. Tenant records live in tenant-data.js.
(() => {
  const tenants = window.KLBB_TENANTS || [];
  const grid = document.getElementById("tenantDirectoryGrid");
  const search = document.getElementById("tenantSearch");
  const count = document.getElementById("tenantCount");
  const empty = document.getElementById("tenantEmpty");
  if (!grid || !search) return;

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function createCard(tenant) {
    const card = element("article", "tenant-directory-card");
    card.id = tenant.slug;
    const media = element("div", "tenant-directory-logo");
    media.style.setProperty("--tenant-bg", tenant.background || "#f5eee0");
    const logo = tenant.logo ? document.createElement("img") : element("span", "tenant-directory-wordmark", tenant.name);
    if (tenant.logo) {
      Object.assign(logo, { src: tenant.logo, alt: "Logo " + tenant.name, loading: "lazy", decoding: "async" });
    }
    media.append(logo);

    const body = element("div", "tenant-directory-body");
    body.append(element("h3", "", tenant.name), element("span", "tenant-directory-source", "Referensi Tenant 2026"));
    if (tenant.orderUrl) {
      const order = element("a", "tenant-order-link", "Order Sekarang");
      Object.assign(order, { href: tenant.orderUrl, target: "_blank", rel: "noopener noreferrer" });
      // Static Lucide arrow-up-right icon (no untrusted HTML interpolation).
      order.insertAdjacentHTML("beforeend", '<svg class="lucide lucide-arrow-up-right" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10M7 17 17 7"/></svg>');
      body.append(order);
    } else {
      body.append(element("span", "tenant-order-pending", "Info order menyusul"));
    }
    card.append(media, body);
    return card;
  }

  const cards = tenants.map(createCard);
  grid.replaceChildren(...cards);

  function filter() {
    const query = search.value.trim().toLocaleLowerCase("id");
    let visible = 0;
    cards.forEach((card, index) => {
      const match = tenants[index].name.toLocaleLowerCase("id").includes(query);
      card.hidden = !match;
      if (match) visible++;
    });
    if (count) count.textContent = visible + " dari " + tenants.length + " referensi tenant";
    if (empty) empty.hidden = visible > 0;
  }

  function focusHash() {
    const slug = decodeURIComponent(location.hash.slice(1));
    if (!slug || slug === "info-pemesanan") return;
    const card = cards.find((entry) => entry.id === slug);
    if (card) {
      search.value = "";
      filter();
      requestAnimationFrame(() => card.scrollIntoView({ block: "center" }));
    }
  }

  search.addEventListener("input", filter);
  window.addEventListener("hashchange", focusHash);
  filter();
  focusHash();
})();
