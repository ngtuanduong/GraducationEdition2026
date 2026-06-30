/* ============================================================
   Graduation Edition 2026 — interactions
   ============================================================ */
(function () {
  "use strict";

  /* ----------------------------------------------------------
     CONFIG — edit these if anything changes
     ---------------------------------------------------------- */
  var EVENT = {
    title: "Graduation — Nguyễn Tuấn Dương",
    // Hanoi time (UTC+7), explicit offset so it's correct for every viewer
    start: new Date("2026-07-06T14:30:00+07:00"),
    end: new Date("2026-07-06T16:30:00+07:00"),
    location:
      "Nhà Trắng (Building A1), Hanoi University, Km9 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    description:
      "Join me to celebrate my university graduation — B.A. in Information Technology, Software Engineering, Hanoi University. With love, Dương.",
  };

  // 👉 RSVP records are POSTed here. Paste the Google Apps Script Web App URL
  //    (deploy the code in google-apps-script.gs). Must end with /exec.
  var RSVP_ENDPOINT =
    "https://script.google.com/macros/s/AKfycbxVdlUVbLCXtaystatzbQxESo3-1A0vpcOXijOHXUx-MdPVZ31N3ed6flUbBIzIo59hzg/exec";

  var $ = function (s, c) {
    return (c || document).querySelector(s);
  };
  var $$ = function (s, c) {
    return Array.prototype.slice.call((c || document).querySelectorAll(s));
  };

  /* ----------------------------------------------------------
     NAV — scrolled state, mobile menu, active link
     ---------------------------------------------------------- */
  var nav = $("#nav");
  var navToggle = $("#navToggle");

  var onScroll = function () {
    nav.classList.toggle("is-scrolled", window.scrollY > 10);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  navToggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  $$("#navLinks a").forEach(function (a) {
    a.addEventListener("click", function () {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  // Active link highlight
  var navMap = {};
  $$("#navLinks a[href^='#']").forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    if (id) navMap[id] = a;
  });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          var link = navMap[e.target.id];
          if (link && e.isIntersecting) {
            $$("#navLinks a").forEach(function (x) {
              x.classList.remove("is-active");
            });
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ["invitation", "journey", "curriculum", "details", "rsvp"].forEach(
      function (id) {
        var el = document.getElementById(id);
        if (el) spy.observe(el);
      },
    );
  }

  /* ----------------------------------------------------------
     COUNTDOWN
     ---------------------------------------------------------- */
  var cd = {
    days: $("[data-cd='days']"),
    hours: $("[data-cd='hours']"),
    mins: $("[data-cd='mins']"),
    secs: $("[data-cd='secs']"),
  };
  var pad = function (n) {
    return (n < 10 ? "0" : "") + n;
  };

  var tickCountdown = function () {
    var diff = EVENT.start.getTime() - Date.now();
    if (diff <= 0) {
      var box = $("#countdown");
      if (box)
        box.innerHTML =
          "<p class='countdown__done'>🎓 Today is the day — see you there!</p>";
      return false;
    }
    var s = Math.floor(diff / 1000);
    cd.days.textContent = pad(Math.floor(s / 86400));
    cd.hours.textContent = pad(Math.floor((s % 86400) / 3600));
    cd.mins.textContent = pad(Math.floor((s % 3600) / 60));
    cd.secs.textContent = pad(s % 60);
    return true;
  };
  if (cd.days && tickCountdown()) {
    var cdTimer = setInterval(function () {
      if (!tickCountdown()) clearInterval(cdTimer);
    }, 1000);
  }

  /* ----------------------------------------------------------
     COUNT-UP NUMBERS (on reveal)
     ---------------------------------------------------------- */
  var countUp = function (el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var dur = 1100,
      t0 = null;
    var step = function (ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  };

  /* ----------------------------------------------------------
     SCROLL REVEAL + trigger count-ups
     ---------------------------------------------------------- */
  if ("IntersectionObserver" in window) {
    var revealObs = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          $$("[data-count]", e.target).forEach(function (n) {
            if (!n.dataset.done) {
              n.dataset.done = "1";
              countUp(n);
            }
          });
          if (e.target.matches("[data-count]") && !e.target.dataset.done) {
            e.target.dataset.done = "1";
            countUp(e.target);
          }
          obs.unobserve(e.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    $$(".reveal").forEach(function (el) {
      revealObs.observe(el);
    });
  } else {
    $$(".reveal").forEach(function (el) {
      el.classList.add("is-in");
    });
    $$("[data-count]").forEach(function (n) {
      n.textContent = n.getAttribute("data-count");
    });
  }

  /* ----------------------------------------------------------
     CURRICULUM ACCORDION
     ---------------------------------------------------------- */
  var setBlock = function (head, open) {
    var body = head.nextElementSibling;
    head.setAttribute("aria-expanded", String(open));
    body.style.maxHeight = open ? body.scrollHeight + 40 + "px" : "0px";
  };
  $$("[data-block] .block__head").forEach(function (head) {
    // initialise (block 3 starts open)
    setBlock(head, head.getAttribute("aria-expanded") === "true");
    head.addEventListener("click", function () {
      setBlock(head, head.getAttribute("aria-expanded") !== "true");
    });
  });
  window.addEventListener("resize", function () {
    $$("[data-block] .block__head").forEach(function (head) {
      if (head.getAttribute("aria-expanded") === "true") {
        head.nextElementSibling.style.maxHeight = "none";
        head.nextElementSibling.style.maxHeight =
          head.nextElementSibling.scrollHeight + 40 + "px";
      }
    });
  });

  /* ----------------------------------------------------------
     ADD TO CALENDAR — menu: Google / Outlook / Apple(.ics)
     ---------------------------------------------------------- */
  var toICS = function (d) {
    return d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  };

  var gcalUrl =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" +
    encodeURIComponent(EVENT.title) +
    "&dates=" +
    toICS(EVENT.start) +
    "/" +
    toICS(EVENT.end) +
    "&details=" +
    encodeURIComponent(EVENT.description) +
    "&location=" +
    encodeURIComponent(EVENT.location);

  var outlookUrl =
    "https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent" +
    "&subject=" +
    encodeURIComponent(EVENT.title) +
    "&startdt=" +
    EVENT.start.toISOString() +
    "&enddt=" +
    EVENT.end.toISOString() +
    "&location=" +
    encodeURIComponent(EVENT.location) +
    "&body=" +
    encodeURIComponent(EVENT.description);

  var downloadICS = function () {
    var ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//NTD//Graduation 2026//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:graduation-ntd-2026@hanu",
      "DTSTAMP:" + toICS(EVENT.start),
      "DTSTART:" + toICS(EVENT.start),
      "DTEND:" + toICS(EVENT.end),
      "SUMMARY:" + EVENT.title,
      "LOCATION:" + EVENT.location.replace(/,/g, "\\,"),
      "DESCRIPTION:" + EVENT.description.replace(/,/g, "\\,"),
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "Graduation-Nguyen-Tuan-Duong.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  /* dropdown menu under the button */
  var calMenu = null;
  var closeCal = function () {
    if (!calMenu) return;
    calMenu.remove();
    calMenu = null;
    document.removeEventListener("click", onDocCal, true);
    document.removeEventListener("keydown", onEscCal);
    window.removeEventListener("resize", closeCal);
  };
  var onDocCal = function (e) {
    if (
      calMenu &&
      !calMenu.contains(e.target) &&
      !(e.target.closest && e.target.closest("[data-add-calendar]"))
    )
      closeCal();
  };
  var onEscCal = function (e) {
    if (e.key === "Escape") closeCal();
  };
  var calItem = function (label, href, onClick) {
    var el;
    if (href) {
      el = document.createElement("a");
      el.href = href;
      el.target = "_blank";
      el.rel = "noopener";
    } else {
      el = document.createElement("button");
      el.type = "button";
    }
    el.className = "cal-menu__item";
    el.textContent = label;
    el.addEventListener("click", function () {
      if (onClick) onClick();
      closeCal();
    });
    return el;
  };
  var openCal = function (btn) {
    if (calMenu) {
      closeCal();
      return;
    }
    calMenu = document.createElement("div");
    calMenu.className = "cal-menu";
    calMenu.appendChild(calItem("📅  Google Calendar", gcalUrl));
    calMenu.appendChild(calItem("📆  Outlook", outlookUrl));
    calMenu.appendChild(calItem("⬇  Apple / tải file .ics", null, downloadICS));
    document.body.appendChild(calMenu);
    var r = btn.getBoundingClientRect();
    var left =
      window.scrollX +
      Math.min(r.left, window.innerWidth - calMenu.offsetWidth - 12);
    calMenu.style.top = window.scrollY + r.bottom + 8 + "px";
    calMenu.style.left = Math.max(8, left) + "px";
    setTimeout(function () {
      document.addEventListener("click", onDocCal, true);
      document.addEventListener("keydown", onEscCal);
      window.addEventListener("resize", closeCal);
    }, 0);
  };
  $$("[data-add-calendar]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      openCal(b);
    });
  });

  // standalone "Google Calendar" link in Details → direct Google link
  var gcal = $("#gcalLink");
  if (gcal) gcal.href = gcalUrl;

  /* ----------------------------------------------------------
     RSVP — send a row to the Google Sheet (via Apps Script)
     ---------------------------------------------------------- */
  var form = $("#rsvpForm");
  var note = $("#rsvpNote");
  if (form) {
    var submitBtn = form.querySelector('[type="submit"]');
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var data = new FormData(form);
      var name = (data.get("name") || "").toString().trim();
      if (!name) {
        note.textContent = "Please add your name first 🙂";
        note.className = "rsvp__note is-error";
        $("#rName").focus();
        return;
      }
      if (!RSVP_ENDPOINT) {
        note.textContent =
          "RSVP isn't connected yet — set RSVP_ENDPOINT in main.js.";
        note.className = "rsvp__note is-error";
        return;
      }
      var payload = {
        name: name,
        attend: (data.get("attend") || "").toString(),
        guests: (data.get("guests") || "").toString(),
        message: (data.get("message") || "").toString().trim(),
      };

      var label = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }
      note.textContent = "Sending your RSVP…";
      note.className = "rsvp__note";

      fetch(RSVP_ENDPOINT, {
        method: "POST",
        mode: "no-cors", // Apps Script needs this from a static page
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // avoids a CORS preflight
        body: JSON.stringify(payload),
      })
        .then(function () {
          form.reset();
          note.textContent =
            "Thank you, " + name + "! Your RSVP has been recorded 🎉";
          note.className = "rsvp__note is-ok";
        })
        .catch(function () {
          note.textContent =
            "Couldn't send — please check your connection and try again.";
          note.className = "rsvp__note is-error";
        })
        .then(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = label;
          }
        });
    });
  }

  /* ----------------------------------------------------------
     MARQUEE — clone the text to fill the width so the loop is
     seamless (no empty gap) at any screen size, constant speed
     ---------------------------------------------------------- */
  var buildMarquee = function () {
    var track = document.getElementById("marqueeTrack");
    if (!track) return;
    // collapse back to the single original template item
    while (track.children.length > 1) track.removeChild(track.lastChild);
    var first = track.firstElementChild;
    if (!first) return;
    var unit = first.getBoundingClientRect().width;
    if (!unit) {
      requestAnimationFrame(buildMarquee);
      return;
    } // not laid out yet — retry next frame
    // copies so that ONE half already overflows the viewport
    var perHalf = Math.max(2, Math.ceil(window.innerWidth / unit) + 1);
    var frag = document.createDocumentFragment();
    for (var i = 1; i < perHalf * 2; i++)
      frag.appendChild(first.cloneNode(true));
    track.appendChild(frag);
    // -50% moves exactly one half → seamless; keep a constant px/sec speed
    track.style.animationDuration = (unit * perHalf) / 80 + "s";
  };

  buildMarquee(); // build now (script sits at end of <body>)
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(buildMarquee); // refine after the display font loads
  window.addEventListener("load", buildMarquee);
  var mqTimer;
  window.addEventListener("resize", function () {
    clearTimeout(mqTimer);
    mqTimer = setTimeout(buildMarquee, 200);
  });

  /* ----------------------------------------------------------
     Smooth, eased scroll for in-page nav links
     (custom rAF easing → silkier & slower than native smooth)
     ---------------------------------------------------------- */
  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NAV_OFFSET = 64; // leave room for the sticky nav above the target
  var scrollRAF = null;

  var easeInOutCubic = function (t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  var stopScroll = function () {
    if (scrollRAF) {
      cancelAnimationFrame(scrollRAF);
      scrollRAF = null;
    }
  };

  var smoothScrollTo = function (targetY) {
    var maxY = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    targetY = Math.max(0, Math.min(targetY, maxY));
    var startY = window.scrollY;
    var dist = targetY - startY;
    if (Math.abs(dist) < 2) return;
    if (prefersReduced) {
      window.scrollTo(0, targetY);
      return;
    }
    // duration grows with distance but stays in a pleasant range
    var duration = Math.min(1200, Math.max(550, Math.abs(dist) * 0.55));
    var startTime = null;
    stopScroll();
    var frame = function (now) {
      if (startTime === null) startTime = now;
      var p = Math.min((now - startTime) / duration, 1);
      window.scrollTo(0, startY + dist * easeInOutCubic(p));
      scrollRAF = p < 1 ? requestAnimationFrame(frame) : null;
    };
    scrollRAF = requestAnimationFrame(frame);
  };

  // let a manual scroll interrupt the animation (feels natural)
  ["wheel", "touchstart"].forEach(function (ev) {
    window.addEventListener(ev, stopScroll, { passive: true });
  });

  $$("a[href^='#']").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var y = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
      smoothScrollTo(y);
      if (window.history && history.replaceState)
        history.replaceState(null, "", id);
    });
  });
})();
