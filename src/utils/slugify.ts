// ---------------------------------------------------------------
// Transforme un titre en identifiant technique lisible (ex: "Iron Man 3"
// → "iron-man-3"). Sert à SUGGÉRER un id de saga/contenu dans l'admin —
// l'utilisateur peut toujours le modifier avant de valider.
// ---------------------------------------------------------------
const COMBINING_ACCENT_RANGE = { start: 0x0300, end: 0x036f };

export function slugify(title: string): string {
  // "é".normalize("NFD") décompose en "e" + un caractère d'accent séparé
  // (plage Unicode 0300–036F) : on garde la lettre, on jette l'accent.
  const withoutAccents = [...title.normalize("NFD")]
    .filter((char) => {
      const code = char.codePointAt(0) ?? 0;
      return code < COMBINING_ACCENT_RANGE.start || code > COMBINING_ACCENT_RANGE.end;
    })
    .join("");

  return withoutAccents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // tout ce qui n'est pas alphanumérique → tiret
    .replace(/^-+|-+$/g, ""); // pas de tiret en début/fin
}
