(function () {
  "use strict";

  var body = document.body;
  var boot = document.getElementById("boot");
  var msg = document.getElementById("boot-msg");

  var steps = [
    { at: 0,    text: "Iniciando sesión..." },
    { at: 1300, text: "Preparando entorno..." }
  ];
  var END_AT = 2800;

  steps.forEach(function (s) {
    setTimeout(function () { msg.textContent = s.text; }, s.at);
  });

  setTimeout(function () {
    boot.classList.add("hide");
    body.classList.remove("booting");
    body.classList.add("ready");
  }, END_AT);

  // Foto
  var photo = document.getElementById("photo");
  var avatar = "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">' +
    '<rect width="120" height="120" fill="#12233f"/>' +
    '<circle cx="60" cy="46" r="20" fill="#4aa3ff"/>' +
    '<path d="M20 120c0-26 18-42 40-42s40 16 40 42z" fill="#2b8cf0"/></svg>'
  );
  function useFallback() {
    if (photo.dataset.fallback) return;
    photo.dataset.fallback = "1";
    photo.src = avatar;
  }
  photo.addEventListener("error", useFallback);
  if (photo.complete && photo.naturalWidth === 0) useFallback();
})();
