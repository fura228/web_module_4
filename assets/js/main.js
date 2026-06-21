(function () {
  "use strict";

  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.querySelector(".site-header");
  var hp = document.querySelector(".hero-photo");

  var ticking = false;
  function onScrollFrame() {
    var y = window.scrollY;
    if (header) header.classList.toggle("shrink", y > 24);
    if (hp && !reduce) hp.style.setProperty("--py", (Math.min(y, 600) * 0.06).toFixed(1) + "px");
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScrollFrame); }
  }, { passive: true });
  onScrollFrame();

  var burger = document.querySelector(".burger");
  function closeMenu() {
    document.body.classList.remove("menu-open");
    if (burger) burger.setAttribute("aria-expanded", "false");
  }
  if (burger) {
    burger.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".nav-list a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("click", function (e) {
      if (document.body.classList.contains("menu-open") &&
          !e.target.closest(".nav-list") && !e.target.closest(".burger")) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  var track = document.querySelector(".ticker-track");
  if (track) {
    var clone = track.cloneNode(true);
    Array.prototype.forEach.call(clone.children, function (c) {
      c.setAttribute("aria-hidden", "true");
      c.setAttribute("tabindex", "-1");
    });
    while (clone.firstChild) track.appendChild(clone.firstChild);
  }

  var toggle = document.getElementById("tickerToggle");
  if (toggle && track) {
    toggle.addEventListener("click", function () {
      var paused = track.classList.toggle("paused");
      toggle.setAttribute("aria-pressed", paused ? "true" : "false");
      toggle.setAttribute("aria-label", paused ? "Запустить ленту" : "Поставить ленту на паузу");
    });
  }

  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-list a[data-page]").forEach(function (a) {
    if (a.getAttribute("data-page") === path) a.classList.add("active");
  });
})();
