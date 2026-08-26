const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");
const yearEl = document.querySelector("#year");
const eventsListEl = document.querySelector("#events-list");

const EVENTS_FEED_URL =
  "https://script.google.com/macros/s/AKfycbzqrl8XMszdBPZka3Ax5qgrWZmHcNoXpcLlVmtoIlyRvsk5_f1QOsHfHOb47-EB5G3Exw/exec";

const fallbackEvents = [
  {
    date: "2026-09-12",
    title: "Family Skills Day",
    location: "Pukekohe",
    details: "Free family cycle safety activities and confidence drills.",
  },
  {
    date: "2026-09-28",
    title: "Beginner Group Ride",
    location: "Pukekohe Town Centre",
    details: "A relaxed community ride with volunteer ride leaders.",
  },
  {
    date: "2026-10-05",
    title: "Bike to School Week Launch",
    location: "Local schools",
    details: "School and whanau launch event for Bike to School Week.",
  },
];

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
    });
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 },
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

function formatShortDate(value) {
  if (!value) {
    return "TBC";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "short",
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderEvents(events) {
  if (!eventsListEl) {
    return;
  }

  if (!events.length) {
    eventsListEl.innerHTML =
      '<p class="events-status">No upcoming events yet. Please check back soon.</p>';
    return;
  }

  const markup = events
    .slice(0, 8)
    .map((event, index) => {
      const delayClass = `delay-${Math.min(index + 1, 3)}`;
      const date = formatShortDate(event.date);
      const title = escapeHtml(event.title || "Untitled event");
      const location = escapeHtml(event.location || "Pukekohe");
      const details = escapeHtml(event.details || "More details coming soon.");
      const link = event.url ? String(event.url).trim() : "";
      const linkMarkup =
        link && /^https?:\/\//i.test(link)
          ? `<p><a class="event-link" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">Event details</a></p>`
          : "";

      return `
        <article class="event reveal ${delayClass}">
          <p class="event-date">${date}</p>
          <div>
            <h3>${title}</h3>
            <p>${location}</p>
            <p>${details}</p>
            ${linkMarkup}
          </div>
        </article>
      `;
    })
    .join("");

  eventsListEl.innerHTML = markup;
  eventsListEl
    .querySelectorAll(".reveal")
    .forEach((el) => observer.observe(el));
}

async function fetchEvents() {
  if (!EVENTS_FEED_URL) {
    renderEvents(fallbackEvents);
    return;
  }

  try {
    const response = await fetch(EVENTS_FEED_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Feed request failed: ${response.status}`);
    }

    const payload = await response.json();
    const events = Array.isArray(payload)
      ? payload
      : Array.isArray(payload.events)
        ? payload.events
        : [];

    renderEvents(events);
  } catch (error) {
    console.error("Unable to load events feed", error);
    renderEvents(fallbackEvents);
  }
}

fetchEvents();
