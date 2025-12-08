
// ===============================
// Classes pour gérer les créneaux
// ===============================
class Creneau {
    constructor(data){ this.data = data; }
    debut(){ return this.data.debut; }
    fin(){ return this.data.fin; }
    toMinutes(h){ const [H,M] = h.split(":").map(Number); return H*60+M; }
    intersect(other){
        return this.toMinutes(this.debut()) < this.toMinutes(other.fin()) &&
               this.toMinutes(this.fin()) > this.toMinutes(other.debut());
    }
}

class Noeud {
    constructor(){ this.gauche = null; this.droite = null; this.creneaux = []; }
    insert(c){ this.creneaux.push(c); }
    insertAll(list){ list.forEach(c => this.insert(c)); }
    removeIntersect(creneau){
        const res = [], rest = [];
        for(let c of this.creneaux) (creneau.intersect(c)?res:rest).push(c);
        this.creneaux = rest;
        return res;
    }
    intersect(creneau){ return this.creneaux.some(c => c.intersect(creneau)); }
}

class Arbre {
    constructor(){ this.racine = new Noeud(); }
    insert(c){ this.insertRec(this.racine, c); }
    insertRec(noeud, c){
        const intersect = noeud.removeIntersect(c);
        let profG = -1, profD = -1;
        if(noeud.gauche) profG = this.intersectProfondeur(noeud.gauche, c);
        if(noeud.droite) profD = this.intersectProfondeur(noeud.droite, c);
        if(intersect.length === 0 && profG === -1 && profD === -1){ noeud.insert(c); return; }
        if(!noeud.gauche) noeud.gauche = new Noeud();
        if(!noeud.droite) noeud.droite = new Noeud();
        let select = noeud.droite, move = noeud.gauche;
        if(profG < profD){ select = noeud.gauche; move = noeud.droite; }
        move.insertAll(intersect);
        this.insertRec(select, c);
    }
    intersectProfondeur(noeud, c){
        let queue=[[noeud,0]], res=-1;
        while(queue.length>0){
            const [n, depth] = queue.shift();
            if(n.intersect(c)) res=depth;
            if(n.gauche) queue.push([n.gauche, depth+1]);
            if(n.droite) queue.push([n.droite, depth+1]);
        }
        return res;
    }
    toList(){ return this.toListRec(this.racine,1,0); }
    toListRec(noeud, div, index){
        let res=[];
        for(let c of noeud.creneaux) res.push({creneau:c, diviseur:div, index:index});
        if(noeud.gauche) res = res.concat(this.toListRec(noeud.gauche, div*2, index*2));
        if(noeud.droite) res = res.concat(this.toListRec(noeud.droite, div*2, index*2+1));
        return res;
    }
}

// ===============================
// Fonctions utilitaires
// ===============================
function toMin(h){ const [H,M] = h.split(":").map(Number); return H*60+M; }

function prepareJour(jour){
    const arbre = new Arbre();
    jour.creneaux.forEach(c => arbre.insert(new Creneau(c)));
    return arbre.toList();
}

function afficherJour(jour, divJour, debutJournee = "08:00", finJournee = "18:00") {
    const results = prepareJour(jour); // calcule les chevauchements et positions

    const totalMinutes = toMin(finJournee) - toMin(debutJournee);
    const pxParHeure = `(100% - 21px) / ${totalMinutes / 60}`; // hauteur par heure

    results.forEach(r => {
        const c = r.creneau.data;

        const startMin = toMin(c.debut) - toMin(debutJournee);
        const durationMin = toMin(c.fin) - toMin(c.debut);

        const bloc = document.createElement("div");
        bloc.className = "x-creneau";

        const widthPercent = 100 / r.diviseur;
        const leftPercent = widthPercent * r.index;

        bloc.style.top = `calc(21px + (${pxParHeure} / 60 * ${startMin}))`;
        bloc.style.height = `calc(${pxParHeure} / 60 * ${durationMin})`;
        bloc.style.left = `calc(${leftPercent}%)`;
        bloc.style.width = `calc(${widthPercent}%)`;

        // Appliquer la couleur de fond depuis le JSON
        if (c["background-color"]) {
            bloc.style.backgroundColor = c["background-color"];
        }

        bloc.innerHTML = `
            <div>${c.nom}</div>
            <div>${c.info1}</div>
            <div>${c.info2}</div>
        `;

        divJour.appendChild(bloc);
    });
}



// ===============================
// Génération dynamique de la grille
// ===============================
function generateHoraires(container, debut, fin){
    const horairesDiv = document.createElement("div");
    horairesDiv.className = "x-horaire";

    horairesDiv.appendChild(document.createElement("div")); // coin vide

    const startHour = Number(debut.split(":")[0]);
    const endHour = Number(fin.split(":")[0]);
    const nbCreneaux = endHour - startHour;

    for(let i=0; i<=nbCreneaux; i++){
        const div = document.createElement("div");
        if(i===nbCreneaux){
            div.innerHTML = `<span>${String(startHour+i).padStart(2,'0')}h00</span>`;
        } else {
            div.style.height = `calc((100% - 21px) / ${nbCreneaux})`;
            div.innerHTML = `<span>${String(startHour+i).padStart(2,'0')}h00</span>`;
        }
        horairesDiv.appendChild(div);
    }
    container.appendChild(horairesDiv);
}

function generateJours(container, jours, debut, fin){
    const totalMinutes = toMin(fin) - toMin(debut);
    const nbHeures = totalMinutes / 60; // calcul dynamique basé sur la plage horaire
    const nbJours = jours.length; // nombre de jours dynamique

    jours.forEach(jour=>{
        const divJour = document.createElement("div");
        divJour.className = "x-jour";
        divJour.style.width = `calc((100% - 40px) / ${nbJours})`; // dynamique selon JSON
        divJour.style.position = "relative";

        const divNom = document.createElement("div");
        divNom.textContent = jour.nomJour;
        divJour.appendChild(divNom);

        // Création des segments horaires
        for(let i=0; i<nbHeures; i++){
            const segment = document.createElement("div");
            segment.style.height = `calc((100% - 21px) / ${nbHeures})`;
            const inner = document.createElement("div");
            inner.className = "x-segment";
            segment.appendChild(inner);
            divJour.appendChild(segment);
        }

        container.appendChild(divJour);

        // Affichage des créneaux
        afficherJour(jour, divJour, debut, fin);
    });
}


// ===============================
// Initialisation
// ===============================
window.onload = function(){
    document.querySelector(".x-title").textContent = edt.titre;

    const container = document.querySelector(".x-edt");

    generateHoraires(container, edt.horaires.debut, edt.horaires.fin);
    generateJours(container, edt.jours, edt.horaires.debut, edt.horaires.fin);
}
