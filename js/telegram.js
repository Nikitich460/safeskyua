const RSS_URL =
  "https://api.allorigins.win/raw?url=https://fetchrss.com/feed/1vUs7wAtc6PC1vUs6e8wQ0ft.rss";

async function loadTelegram() {
  const status = document.getElementById("status");
  const posts = document.getElementById("posts");

  status.textContent = "⏳ Завантаження з Telegram...";
  posts.innerHTML = "";

  try {
    const response = await fetch(RSS_URL);
    if (!response.ok) throw new Error("HTTP помилка");

    const text = await response.text();
    const xml = new DOMParser().parseFromString(text, "text/xml");
    const items = xml.querySelectorAll("item");

    if (items.length === 0) {
      status.textContent = "⚠️ Нових повідомлень немає";
      return;
    }

    status.textContent = "✅ Останні сповіщення:";

    items.forEach((item, index) => {
      if (index >= 20) return;

      const title = item.querySelector("title")?.textContent || "";
      const desc = item.querySelector("description")?.textContent || "";
      const link = item.querySelector("link")?.textContent || "";

      const div = document.createElement("div");
      div.style.padding = "10px";
      div.style.borderBottom = "1px solid #333";

      div.innerHTML = `
        <b>${title}</b><br>
        <span>${desc}</span><br>
        <a href="${link}" target="_blank">Відкрити в Telegram</a>
      `;

      posts.appendChild(div);
    });
  } catch (e) {
    status.textContent = "❌ Помилка сервера. Перевірте зʼєднання.";
    console.error(e);
  }
}
