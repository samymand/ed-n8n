/* Echo Flow — scripts communs (navigation, animations, formulaire de contact) */
(function () {
  "use strict";

  // Menu mobile
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Ombre du header au défilement
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Année du footer
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Apparition au défilement
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Formulaire de contact
  var form = document.getElementById("contact-form");
  if (!form) return;

  // Pré-sélection de l'offre via ?offre=diagnostic|projet|accompagnement
  var offre = new URLSearchParams(window.location.search).get("offre");
  var select = form.querySelector("#besoin");
  if (offre && select && select.querySelector('option[value="' + offre + '"]')) {
    select.value = offre;
  }

  var status = form.querySelector(".form-status");
  var submit = form.querySelector('button[type="submit"]');

  function showStatus(type, message) {
    status.className = "form-status is-" + type;
    status.textContent = message;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var data = new FormData(form);
    // Pot de miel anti-spam : rempli uniquement par les robots
    if (data.get("site_web")) return;

    var payload = {
      nom: data.get("nom"),
      entreprise: data.get("entreprise"),
      email: data.get("email"),
      telephone: data.get("telephone"),
      ville: data.get("ville"),
      secteur: data.get("secteur"),
      taille: data.get("taille"),
      besoin: data.get("besoin"),
      outils: data.getAll("outils"),
      message: data.get("message"),
      consentement: data.get("consentement") === "on",
      source: window.location.href,
      envoye_le: new Date().toISOString()
    };

    var endpoint = form.dataset.endpoint;

    // Pas encore de webhook configuré : repli sur le client e-mail
    if (!endpoint || endpoint.indexOf("VOTRE-INSTANCE") !== -1) {
      var body = Object.keys(payload)
        .filter(function (k) { return payload[k] && k !== "source" && k !== "envoye_le"; })
        .map(function (k) { return k + " : " + (Array.isArray(payload[k]) ? payload[k].join(", ") : payload[k]); })
        .join("\n");
      window.location.href = "mailto:" + form.dataset.fallbackEmail +
        "?subject=" + encodeURIComponent("Demande Echo Flow — " + (payload.entreprise || payload.nom)) +
        "&body=" + encodeURIComponent(body);
      showStatus("success", "Votre messagerie va s'ouvrir avec votre demande pré-remplie. Il ne vous reste qu'à l'envoyer.");
      return;
    }

    submit.disabled = true;
    submit.textContent = "Envoi en cours…";

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        showStatus("success", "Merci ! Votre demande est bien reçue. Nous revenons vers vous sous 24 h ouvrées.");
      })
      .catch(function () {
        showStatus("error", "L'envoi n'a pas abouti. Réessayez dans un instant ou écrivez-nous directement sur WhatsApp ou par e-mail.");
      })
      .finally(function () {
        submit.disabled = false;
        submit.textContent = "Envoyer ma demande";
      });
  });
})();
