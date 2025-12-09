// ===============================
// Gestion des créneaux
// ===============================
class Creneau {
    constructor(data) {
        this.data = data;
    }
    debut() {
        return this.data.debut;
    }
    fin() {
        return this.data.fin;
    }
    toMin(h) {
        return h.split(":").map(Number).reduce((h, m) => h * 60 + m);
    }

    intersect(other) {
        return this.toMin(this.debut()) < this.toMin(other.fin()) &&
               this.toMin(this.fin()) > this.toMin(other.debut());
    }
}

class Noeud {
    constructor() {
        this.gauche = this.droite = null;
        this.creneaux = [];
    }
    insert(c) {
        this.creneaux.push(c);
    }

    removeIntersect(c) {
        const out = [], keep = [];
        this.creneaux.forEach(x => (c.intersect(x) ? out : keep).push(x));
        this.creneaux = keep;
        return out;
    }

    intersect(c) {
        return this.creneaux.some(x => x.intersect(c));
    }
}

class Arbre {
    constructor() {
        this.racine = new Noeud();
    }

    insert(c) {
        this._rec(this.racine, c);
    }

    _rec(n, c) {
        const inter = n.removeIntersect(c);
        const profG = n.gauche ? this._depth(n.gauche, c) : -1;
        const profD = n.droite ? this._depth(n.droite, c) : -1;

        // Rien n'intersecte → insertion ici
        if (inter.length === 0 && profG < 0 && profD < 0) {
            n.insert(c);
            return;
        }

        // Créer enfants si absents
        n.gauche ||= new Noeud();
        n.droite ||= new Noeud();

        const left = profG < profD ? n.gauche : n.droite;
        const right = left === n.gauche ? n.droite : n.gauche;

        right.creneaux.push(...inter);
        this._rec(left, c);
    }

    _depth(node, c) {
        let q = [[node, 0]], res = -1;
        for (const [n, d] of q.splice(0)) {
            if (n.intersect(c)) res = d;
            if (n.gauche) q.push([n.gauche, d + 1]);
            if (n.droite) q.push([n.droite, d + 1]);
        }
        return res;
    }

    toList() {
        return this._list(this.racine, 1, 0);
    }

    _list(n, div, idx) {
        const res = n.creneaux.map(c => ({ creneau: c, diviseur: div, index: idx }));
        if (n.gauche) res.push(...this._list(n.gauche, div * 2, idx * 2));
        if (n.droite) res.push(...this._list(n.droite, div * 2, idx * 2 + 1));
        return res;
    }
}

// ===============================
// Affichage
// ===============================
const toMin = h => h.split(":").map(Number).reduce((h, m) => h * 60 + m);

function prepareJour(jour) {
    const arbre = new Arbre();
    jour.creneaux.forEach(c => arbre.insert(new Creneau(c)));
    return arbre.toList();
}

function afficherJour(jour, divJour, debut = "08:00", fin = "18:00") {
    const items = prepareJour(jour);
    const totalMin = toMin(fin) - toMin(debut);
    const pxHour = `(100% - 21px) / ${totalMin / 60}`;

    items.forEach(r => {
        const d = r.creneau.data;
        const start = toMin(d.debut) - toMin(debut);
        const dur = toMin(d.fin) - toMin(d.debut);
        const w = 100 / r.diviseur;
        const left = w * r.index;

        const b = document.createElement("div");
        b.className = "x-creneau";
        b.style.top = `calc(21px + (${pxHour} / 60 * ${start}))`;
        b.style.height = `calc(${pxHour} / 60 * ${dur})`;
        b.style.left = `${left}%`;
        b.style.width = `${w}%`;

        if (d.backgroundColor) b.style.backgroundColor = d.backgroundColor;

        b.innerHTML = `
            <div>${d.nom}</div>
            <div>${d.info1}</div>
            <div>${d.info2}</div>
        `;
        divJour.appendChild(b);
    });
}

// ===============================
// Grille
// ===============================
function generateHoraires(parent, debut, fin) {
    const box = document.createElement("div");
    box.className = "x-horaire";
    box.appendChild(document.createElement("div"));

    const H1 = +debut.split(":")[0];
    const H2 = +fin.split(":")[0];

    for (let h = H1; h <= H2; h++) {
        const d = document.createElement("div");
        d.innerHTML = `<span>${String(h).padStart(2, "0")}h00</span>`;
        if (h < H2) d.style.height = `calc((100% - 21px) / ${H2 - H1})`;
        box.appendChild(d);
    }

    parent.appendChild(box);
}

function generateJours(parent, jours, debut, fin) {
    const nbJours = jours.length;
    const totalMin = toMin(fin) - toMin(debut);
    const hours = totalMin / 60;

    jours.forEach(jour => {
        const divJ = document.createElement("div");
        divJ.className = "x-jour";
        divJ.style.width = `calc((100% - 40px) / ${nbJours})`;
        divJ.style.position = "relative";

        const head = document.createElement("div");
        head.textContent = jour.nomJour;
        divJ.appendChild(head);

        for (let i = 0; i < hours; i++) {
            const seg = document.createElement("div");
            seg.style.height = `calc((100% - 21px) / ${hours})`;
            seg.appendChild(Object.assign(document.createElement("div"), { className: "x-segment" }));
            divJ.appendChild(seg);
        }

        parent.appendChild(divJ);
        afficherJour(jour, divJ, debut, fin);
    });
}

// ===============================
// Initialisation
// ===============================
window.onload = () => {
    document.querySelector(".x-title").textContent = edt.titre;
    const c = document.querySelector(".x-edt");
    generateHoraires(c, edt.horaires.debut, edt.horaires.fin);
    generateJours(c, edt.jours, edt.horaires.debut, edt.horaires.fin);
};