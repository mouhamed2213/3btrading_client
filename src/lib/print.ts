/**
 * Imprime UN élément de la page (facture, reçu…) dans un cadre isolé.
 *
 * Pourquoi pas `window.print()` sur la page ? Les documents s'affichent dans une modale :
 * imprimer la page entière obligeait à masquer tout le reste en CSS, et la modale elle-même
 * (fond, défilement, plusieurs modales empilées) rendait l'impression vide ou superposée.
 * Ici le cadre ne contient que l'élément + les feuilles de style de l'application.
 */
export async function printElement(el: HTMLElement, title = document.title) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(iframe);

  const win = iframe.contentWindow!;
  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${title.replace(/[<&]/g, "")}</title></head><body></body></html>`);
  doc.close();

  // Mêmes feuilles de style que l'application (fichiers CSS en production, balises <style> avec Vite en développement)
  const loading: Promise<void>[] = [];
  document.querySelectorAll<HTMLLinkElement | HTMLStyleElement>('link[rel="stylesheet"], style').forEach((node) => {
    const copy = node.cloneNode(true) as HTMLLinkElement | HTMLStyleElement;
    if (copy instanceof HTMLLinkElement) {
      copy.href = (node as HTMLLinkElement).href; // URL absolue : le cadre n'a pas la même base
      loading.push(new Promise((done) => { copy.onload = copy.onerror = () => done(); }));
    }
    doc.head.appendChild(copy);
  });
  const page = doc.createElement("style");
  page.textContent = "@page{size:A4;margin:12mm}html,body{margin:0;background:#fff}";
  doc.head.appendChild(page);
  doc.body.appendChild(doc.importNode(el, true));

  // Attendre CSS et polices, avec une limite pour ne jamais rester bloqué
  await Promise.race([Promise.all([...loading, doc.fonts?.ready]), new Promise((done) => setTimeout(done, 3000))]);

  const cleanup = () => iframe.remove();
  win.addEventListener("afterprint", cleanup);
  setTimeout(cleanup, 5 * 60_000); // filet de sécurité si « afterprint » n'est jamais émis
  win.focus();
  win.print();
}
