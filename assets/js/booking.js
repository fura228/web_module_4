(function () {
  "use strict";

  var EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
  var EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
  var EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
  var TO_EMAIL = "martibrodo@yandex.ru";

  var emailjsReady = false;
  if (window.emailjs && EMAILJS_PUBLIC_KEY.indexOf("YOUR_") !== 0) {
    try { emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); emailjsReady = true; } catch (e) {}
  }

  var form = document.getElementById("bookingForm");
  var statusEl = document.getElementById("formStatus");
  var btn = document.getElementById("submitBtn");
  var splash = document.getElementById("splash");
  var splashClose = document.getElementById("splashClose");
  var dtInput = document.getElementById("datetime");

  function setStatus(text, bad) {
    if (!statusEl) return;
    statusEl.setAttribute("aria-live", bad ? "assertive" : "polite");
    statusEl.setAttribute("role", bad ? "alert" : "status");
    statusEl.className = "form-status" + (bad ? " bad" : "");
    statusEl.textContent = text || "";
  }

  if (window.flatpickr && dtInput) {
    if (flatpickr.l10ns && flatpickr.l10ns.ru) flatpickr.localize(flatpickr.l10ns.ru);
    flatpickr(dtInput, {
      enableTime: true,
      time_24hr: true,
      dateFormat: "d.m.Y H:i",
      minDate: "today",
      minuteIncrement: 30,
      defaultHour: 10,
      disableMobile: true,
      onChange: function (selected, _str, fp) {
        clearError(dtInput.closest(".field"));
        setStatus("");
        var d = selected[0];
        if (d && d.toDateString() === new Date().toDateString()) {
          var now = new Date();
          var mins = Math.ceil((now.getHours() * 60 + now.getMinutes() + 1) / 30) * 30;
          var h = Math.floor(mins / 60), m = mins % 60;
          fp.set("minTime", (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m);
        } else if (d) {
          fp.set("minTime", "00:00");
        }
      }
    });
  }

  var phone = document.getElementById("phone");
  if (phone) {
    phone.addEventListener("input", function () {
      var d = phone.value.replace(/\D/g, "");
      if (d.startsWith("8")) d = "7" + d.slice(1);
      if (d.startsWith("9") && d.length <= 10) d = "7" + d;
      d = d.slice(0, 11);
      var out = "+7";
      if (d.length > 1) out += " (" + d.slice(1, 4);
      if (d.length >= 4) out += ") " + d.slice(4, 7);
      if (d.length >= 7) out += "-" + d.slice(7, 9);
      if (d.length >= 9) out += "-" + d.slice(9, 11);
      phone.value = d.length ? out : "";
    });
  }

  function setError(field) {
    if (!field) return;
    field.classList.add("invalid");
    var c = field.querySelector(".control");
    if (c) c.setAttribute("aria-invalid", "true");
  }
  function clearError(field) {
    if (!field) return;
    field.classList.remove("invalid");
    var c = field.querySelector(".control");
    if (c) c.removeAttribute("aria-invalid");
  }

  function validate() {
    var ok = true;
    if (form.name.value.trim().length < 2) { setError(form.name.closest(".field")); ok = false; }
    else clearError(form.name.closest(".field"));

    if (form.phone.value.replace(/\D/g, "").length < 11) { setError(form.phone.closest(".field")); ok = false; }
    else clearError(form.phone.closest(".field"));

    var dtField = form.datetime.closest(".field");
    var picked = dtInput && dtInput._flatpickr && dtInput._flatpickr.selectedDates[0];
    if (!picked || picked.getTime() < Date.now() - 60000) { setError(dtField); ok = false; }
    else clearError(dtField);
    return ok;
  }

  var lastFocused = null;
  function showSplash() {
    if (!splash) return;
    lastFocused = document.activeElement;
    splash.classList.add("show");
    document.body.classList.add("no-scroll");
    if (splashClose) splashClose.focus();
  }
  function hideSplash() {
    if (!splash) return;
    splash.classList.remove("show");
    document.body.classList.remove("no-scroll");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }
  if (splashClose) splashClose.addEventListener("click", hideSplash);
  if (splash) {
    splash.addEventListener("click", function (e) { if (e.target === splash) hideSplash(); });
    document.addEventListener("keydown", function (e) {
      if (!splash.classList.contains("show")) return;
      if (e.key === "Escape") hideSplash();
      if (e.key === "Tab") { e.preventDefault(); if (splashClose) splashClose.focus(); }
    });
  }

  if (form) {
    form.querySelectorAll(".control").forEach(function (c) {
      c.addEventListener("input", function () { clearError(c.closest(".field")); setStatus(""); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (btn.disabled) return;
      setStatus("");

      if (!validate()) {
        setStatus("Проверьте отмеченные поля.", true);
        var firstBad = form.querySelector(".field.invalid .control");
        if (firstBad) firstBad.focus();
        return;
      }

      var params = {
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        service: form.service.value,
        datetime: form.datetime.value.trim(),
        message: form.message.value.trim() || "—",
        to_email: TO_EMAIL
      };

      btn.disabled = true;
      var oldText = btn.textContent;
      btn.textContent = "Отправляем…";

      function done(success, msg) {
        btn.disabled = false;
        btn.textContent = oldText;
        if (success) {
          form.reset();
          if (dtInput && dtInput._flatpickr) dtInput._flatpickr.clear();
          form.querySelectorAll(".field.invalid").forEach(clearError);
          setStatus("");
          showSplash();
        } else {
          setStatus(msg, true);
        }
      }

      if (emailjsReady) {
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
          .then(function () { done(true); })
          .catch(function () { done(false, "Не удалось отправить. Позвоните нам: 8 (800)-555-35-35"); });
      } else {
        setTimeout(function () { done(true); }, 700);
      }
    });
  }
})();
