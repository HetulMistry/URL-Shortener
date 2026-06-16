async function refreshHealth() {
  const statusEl = document.getElementById("status");
  const databaseEl = document.getElementById("database");
  const redisEl = document.getElementById("redis");
  const uptimeEl = document.getElementById("uptime");

  try {
    const response = await fetch("/health");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    statusEl.textContent = data.status ?? "unknown";
    statusEl.className =
      data.status === "healthy" ? "status-healthy" : "status-unhealthy";

    databaseEl.textContent = data.database ?? "N/A";
    redisEl.textContent = data.redis ?? "N/A";

    uptimeEl.textContent =
      typeof data.uptime === "number" ? `${Math.floor(data.uptime)}s` : "N/A";
  } catch (error) {
    statusEl.textContent = "unhealthy";
    statusEl.className = "status-unhealthy";

    databaseEl.textContent = "N/A";
    redisEl.textContent = "N/A";
    uptimeEl.textContent = "N/A";

    console.error("Health check failed:", error);
  }
}

refreshHealth();
setInterval(refreshHealth, 15000);

const button = document.getElementById("themeToggle");

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    button.textContent = "☀️ Light";
    button.setAttribute("aria-pressed", "true");
  } else {
    document.documentElement.removeAttribute("data-theme");
    button.textContent = "🌙 Dark";
    button.setAttribute("aria-pressed", "false");
  }
}

const storedTheme = localStorage.getItem("theme");

if (storedTheme) {
  applyTheme(storedTheme);
} else if (
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
) {
  applyTheme("dark");
}

button.addEventListener("click", () => {
  const current =
    document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light";

  const next = current === "dark" ? "light" : "dark";

  applyTheme(next);
  localStorage.setItem("theme", next);
});
