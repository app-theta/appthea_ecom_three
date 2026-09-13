/** Shows a Bootstrap offcanvas panel by element id (e.g. the cart drawer) from
    plain JS, for spots that need to open it as a side effect of an action
    rather than a `data-bs-toggle` click. */
export function showOffcanvas(id) {
  if (!window.bootstrap) return;
  const el = document.getElementById(id);
  if (el) window.bootstrap.Offcanvas.getOrCreateInstance(el).show();
}
