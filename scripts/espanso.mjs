// Génère les raccourcis Espanso pour remplir les formulaires de candidature (ATS),
// en français et en anglais, à partir des données du site : une seule source de vérité.
//
//   node scripts/espanso.mjs            -> <config Espanso>/match/candidatures.yml
//   node scripts/espanso.mjs chemin.yml -> fichier choisi
//
// Convention : `:cle.fr` / `:cle.en` pour le texte qui dépend de la langue, `:cle` sinon.
// Alt+Espace ouvre la barre de recherche d'Espanso, où chaque raccourci a un libellé lisible.
// Le fichier généré contient téléphone et e-mail : il reste dans le dossier Espanso local.

import fs from "node:fs";
import path from "node:path";
import {
  personal, about, experiences, education, skills, cvExtra, certifications,
} from "../src/data/portfolio.ts";

// Ce qui ne figure pas sur le site : préférences de recherche, reprises du dossier de compétences.
const search = {
  availability: { fr: "Disponible à partir de janvier 2027", en: "Available from January 2027" },
  mobility: {
    fr: "Grand Ouest en priorité, ouvert sur toute la France",
    en: "Western France preferred, open to anywhere in France",
  },
  remote: {
    fr: "Hybride ou full remote, présentiel possible",
    en: "Hybrid or fully remote, on-site possible",
  },
  city: { fr: "Barcelone, Espagne", en: "Barcelona, Spain" },
};

const LANGS = ["fr", "en"];
const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Sept: 9, Oct: 10, Nov: 11, Dec: 12 };
const PRESENT = { fr: "aujourd'hui", en: "present" };

/** "Oct 2025 – Present" -> { start: "10/2025", end: "present" } */
function parsePeriod(period, lang) {
  const [a, b] = period.split("–").map((s) => s.trim());
  const fmt = (s) => {
    if (/present/i.test(s)) return PRESENT[lang];
    const [m, y] = s.split(/\s+/);
    return `${String(MONTHS[m]).padStart(2, "0")}/${y}`;
  };
  return { start: fmt(a), end: fmt(b) };
}

const clean = (t) => t.replace(/\s*[➜→]\s*/g, " — ");
const bullets = (items) => items.map((i) => `- ${clean(i)}`).join("\n");
const slug = { papernest: "ppn", "Bouygues Telecom": "bouygues", Thingmill: "thingmill", Ag2ir: "ag2ir" };
const eduSlug = ["esiea", "uqac", "dut", "bac"];

const matches = [];
const add = (trigger, label, replace) => matches.push({ trigger, label, replace });
const addBil = (key, label, byLang) => {
  for (const l of LANGS) add(`:${key}.${l}`, `${label} (${l.toUpperCase()})`, byLang(l));
};

// ─── Identité ────────────────────────────────────────────────────────────────
const [firstName, ...rest] = personal.name.split(" ");
add(":prenom", "Prénom", firstName);
add(":nomfam", "Nom de famille", rest.join(" "));
add(":nomcomplet", "Nom complet", personal.name);
add(":email", "E-mail", personal.email);
add(":telint", "Téléphone international", cvExtra.phone);
add(":telfr", "Téléphone format français", cvExtra.phone.replace(/^\+33\s?/, "0"));
add(":linkedin", "LinkedIn", personal.linkedin);
add(":github", "GitHub", personal.github);
add(":siteweb", "Site web", personal.website);

// ─── Profil ──────────────────────────────────────────────────────────────────
addBil("titre", "Titre", (l) => personal.title[l]);
addBil("pitch", "Pitch court", (l) => personal.tagline[l]);
addBil("apropos", "À propos (long)", (l) => about.paragraphs.map((p) => clean(p[l])).join("\n\n"));
addBil("ville", "Ville actuelle", (l) => search.city[l]);
addBil("dispo", "Disponibilité", (l) => search.availability[l]);
addBil("mobilite", "Mobilité", (l) => search.mobility[l]);
addBil("teletravail", "Télétravail", (l) => search.remote[l]);
const colon = { fr: " : ", en: ": " };
addBil("langues", "Langues", (l) =>
  cvExtra.languages.map((x) => `${x.name[l]}${colon[l]}${x.level[l]}`).join(" · "));
addBil("competences", "Compétences par catégorie", (l) =>
  skills.map((s) => `${s.name[l]}${colon[l]}${s.tools.join(", ")}`).join("\n"));
add(":outils", "Liste d'outils (virgules)", [...new Set(skills.flatMap((s) => s.tools))]
  .filter((t) => !/certified/i.test(t)).join(", "));
addBil("certifs", "Certifications", (l) =>
  certifications.map((c) => `${c.name} — ${c.issuer} (${c.issued[l]})`).join("\n"));
add(":toeic", "Score TOEIC", "880/990");
add(":lientoeic", "Lien de vérification TOEIC", certifications.find((c) => /TOEIC/.test(c.name)).url);
add(":liengcp", "Lien de vérification GCP", certifications.find((c) => /Google/.test(c.name)).url);

// ─── Expériences ─────────────────────────────────────────────────────────────
for (const e of experiences) {
  const k = slug[e.company];
  if (!k) throw new Error(`Pas de raccourci pour l'entreprise ${e.company}`);
  const name = e.company;
  add(`:${k}.entreprise`, `${name} · entreprise`, name);
  add(`:${k}.lieu`, `${name} · lieu`, e.location.split("·")[0].trim());
  add(`:${k}.debut`, `${name} · début (MM/AAAA)`, parsePeriod(e.period, "en").start);
  addBil(`${k}.fin`, `${name} · fin`, (l) => parsePeriod(e.period, l).end);
  addBil(`${k}.poste`, `${name} · intitulé du poste`, (l) => e.role[l]);
  addBil(`${k}.contrat`, `${name} · type de contrat`, (l) => e.type[l]);
  addBil(`${k}.desc`, `${name} · description`, (l) => {
    const parts = [];
    if (e.summary) parts.push(clean(e.summary[l]));
    if (e.groups) {
      for (const g of e.groups) parts.push(`${g.intro[l]}\n${bullets(g.bullets[l])}`);
    } else {
      parts.push(bullets(e.highlights[l]));
    }
    return parts.join("\n\n");
  });
}

// ─── Formation ───────────────────────────────────────────────────────────────
education.forEach((ed, i) => {
  const k = eduSlug[i];
  if (!k) throw new Error(`Pas de raccourci pour la formation ${ed.school.en}`);
  const short = k.toUpperCase();
  addBil(`${k}.ecole`, `${short} · établissement`, (l) => ed.school[l]);
  addBil(`${k}.diplome`, `${short} · diplôme`, (l) => ed.degree[l]);
  add(`:${k}.lieu`, `${short} · lieu`, ed.location);
  add(`:${k}.debut`, `${short} · début (MM/AAAA)`, parsePeriod(ed.period, "en").start);
  add(`:${k}.fin`, `${short} · fin (MM/AAAA)`, parsePeriod(ed.period, "en").end);
  addBil(`${k}.desc`, `${short} · description`, (l) => bullets(ed.details[l]));
});

// ─── Garde-fous ──────────────────────────────────────────────────────────────
// Espanso déclenche dès qu'un raccourci est tapé : si `:a` préfixe `:ab`, `:ab` est inatteignable.
const triggers = matches.map((m) => m.trigger);
for (const t of triggers) {
  const shadowed = triggers.filter((u) => u !== t && u.startsWith(t));
  if (shadowed.length) throw new Error(`${t} masque ${shadowed.join(", ")}`);
}
if (new Set(triggers).size !== triggers.length) throw new Error("Raccourci en double");

// JSON.stringify produit des chaînes entre guillemets doubles, valides en YAML.
const q = (s) => JSON.stringify(s);
const yaml = [
  "# Généré par scripts/espanso.mjs depuis src/data/portfolio.ts — ne pas éditer à la main.",
  "# Régénérer : node scripts/espanso.mjs",
  "matches:",
  ...matches.map((m) => `  - trigger: ${q(m.trigger)}\n    label: ${q(m.label)}\n    replace: ${q(m.replace)}`),
  "",
].join("\n");

// Installé par scoop, Espanso tourne en mode portable : sa config vit dans le dossier persistant.
const home = process.env.USERPROFILE ?? process.env.HOME;
const scoopConfig = path.join(home, "scoop", "persist", "espanso", ".espanso");
const configDir = fs.existsSync(scoopConfig)
  ? scoopConfig
  : path.join(process.env.APPDATA ?? path.join(home, ".config"), "espanso");
const out = process.argv[2] ?? path.join(configDir, "match", "candidatures.yml");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, yaml, "utf8");
console.log(`${matches.length} raccourcis écrits dans ${out}`);
