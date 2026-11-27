function getByPath(obj, path) {
  if (!path) return undefined;
  return path.split(".").reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    const match = key.match(/^([^\[\]]+)\[(\d+)\]$/);
    if (match) {
      const list = acc[match[1]];
      return Array.isArray(list) ? list[Number(match[2])] : undefined;
    }
    return acc[key];
  }, obj);
}

function applyFields(container, dataObj) {
  container.querySelectorAll("[data-copy]").forEach((el) => {
    const key = el.getAttribute("data-copy");
    const value = getByPath(dataObj, key);
    if (typeof value === "string") {
      el.textContent = value;
    }
  });

  container.querySelectorAll("[data-copy-href]").forEach((el) => {
    const key = el.getAttribute("data-copy-href");
    const value = getByPath(dataObj, key);
    if (typeof value === "string" && value.length > 0) {
      el.setAttribute("href", value);
    }
  });
}

function renderRepeaters(root, copyData) {
  root.querySelectorAll("[data-repeat]").forEach((container) => {
    const path = container.getAttribute("data-repeat");
    const template = container.querySelector("template.repeat-template");
    const items = getByPath(copyData, path);
    if (!template || !Array.isArray(items)) return;

    container.querySelectorAll(":scope > :not(template)").forEach((node) => node.remove());

    items.forEach((item) => {
      const clone = template.content.cloneNode(true);
      const wrapper = document.createElement("div");
      wrapper.appendChild(clone);
      applyFields(wrapper, item);
      while (wrapper.firstChild) {
        container.appendChild(wrapper.firstChild);
      }
    });
  });
}

async function initPage() {
  let copyData = {};
  try {
    const copyRes = await fetch("./data/copy.json");
    if (copyRes.ok) {
      copyData = await copyRes.json();
    }
  } catch (err) {
    console.warn("Failed to load data/copy.json:", err);
  }

  const sectionContainers = document.querySelectorAll("[data-section]");
  await Promise.all(
    Array.from(sectionContainers).map(async (container) => {
      const url = container.getAttribute("data-section");
      if (!url) return;
      try {
        const res = await fetch(url);
        if (res.ok) {
          container.innerHTML = await res.text();
        }
      } catch (err) {
        console.warn("Failed to load section:", url, err);
      }
    })
  );

  if (copyData?.site?.title) {
    document.title = copyData.site.title;
  }

  renderRepeaters(document, copyData);
  applyFields(document, copyData);
}

document.addEventListener("DOMContentLoaded", initPage);
