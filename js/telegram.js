// ==================================
// SafeSky UA — перегляд Telegram
// Канал: @SafeSky_UA
// Джерело: RSSHub → rss2json
// ==================================

const CHANNEL = "SafeSky_UA";

// RSS-стрічка каналу
const RSS_FEED = `https://rsshub.app/telegram/channel/${CHANNEL}`;

// Конвертація RSS → JSON
const RSS_URL =
  "https://api.rss2json.com/v1/api.json?rss_url=" +
  encodeURIComponent(RSS_FEED);

// Автозапуск
window.onload = () => loadTelegram();

// Автооновлення кожні 30 секунд
setInterval(loadTelegram, 30000);

// -------------------------------
// Головна функція
// -------------------------------
async function loadTelegram() {
  const postsEl = document.getElementById("posts");
  const statusEl = document.getElementById("status");

  postsEl.innerHTML = "";
  statusEl.textContent = "Завантаження з Telegram…";

  try {
    const response = await fetch(RSS_URL, { cache: "no-store" });
    const data = await response.json();

    if (data.status && data.status !== "ok") {
      statusEl.textContent = "Помилка сервісу";
      applyState("normal");
      return;
    }

    if (!data.items || data.items.length === 0) {
      statusEl.textContent = "Дописи не знайдено";
      applyState("normal");
      return;
    }

    // Аналіз найсвіжішого допису
    const first = data.items[0];
    const firstText = cleanText(first.title || first.description || "");
    applyState(detectState(firstText));

    // Показуємо останні 10 дописів
    data.items.slice(0, 10).forEach((post) => {
      const card = document.createElement("div");
      card.className = "post";

      const textDiv = document.createElement("div");
      textDiv.className = "postText";
      textDiv.textContent = cleanText(
        post.title || post.description || "Без тексту"
      );

      const meta = document.createElement("div");
      meta.className = "postMeta";

      const link = document.createElement("a");
      link.href = post.link || `https://t.me/${CHANNEL}`;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Відкрити в Telegram";

      const dateSpan = document.createElement("span");
      dateSpan.textContent = formatDate(post.pubDate);

      meta.appendChild(link);
      meta.appendChild(dateSpan);

      card.appendChild(textDiv);
      card.appendChild(meta);

      postsEl.appendChild(card);
    });

    statusEl.textContent = "Готово ✅";

  } catch (error) {
    statusEl.textContent = "Помилка завантаження ❌";
    console.error(error);
    applyState("normal");
  }
}

// -------------------------------
// Допоміжні функції
// -------------------------------

// Очищення HTML
function cleanText(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").trim();
}

// Формат дати
function formatDate(d) {
  try {
    return new Date(d).toLocaleString("uk-UA");
  } catch {
    return "";
  }
}

// Визначення стану
function detectState(text) {
  const t = (text || "").toLowerCase();

  if (t.includes("відбій")) return "ok";
  if (t.includes("повітряна тривога") || t.includes("тривога")) return "alarm";
  if (t.includes("ракета") || t.includes("ракетна")) return "missile";
  if (t.includes("бпла") || t.includes("шахед") || t.includes("дрон")) return "uav";

  return "normal";
}

// Застосування стану (CSS міняє фон)
function applyState(state) {
  document.body.dataset.state = state;
}
