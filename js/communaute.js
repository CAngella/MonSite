/* =========================================================
   CreatorTips — Espace Communauté
   Démo front-end uniquement : les publications et commentaires
   sont stockés dans le navigateur (localStorage), il n'y a pas
   de vrai serveur derrière. Idéal pour une démonstration.
   ========================================================= */

const CLE_POSTS = "creatortips_posts";
const CLE_PSEUDO = "creatortips_pseudo";

/* ---- Pseudo de l'utilisateur (récupéré depuis l'inscription) ---- */
function recupererPseudo() {
    return localStorage.getItem(CLE_PSEUDO) || "Invité";
}

/* ---- Données de démonstration (affichées si aucun post existant) ---- */
function postsParDefaut() {
    return [
        {
            id: crypto.randomUUID(),
            auteur: "Utilisateur 1",
            titre: "Mon setup de tournage pour débutant",
            videoUrl: "",
            date: new Date().toLocaleDateString("fr-FR"),
            commentaires: [
                { auteur: "Utilisateur 2", texte: "Merci pour le partage, ça aide beaucoup !" }
            ]
        }
    ];
}

function chargerPosts() {
    const donnees = localStorage.getItem(CLE_POSTS);
    if (!donnees) {
        const defaut = postsParDefaut();
        localStorage.setItem(CLE_POSTS, JSON.stringify(defaut));
        return defaut;
    }
    try {
        return JSON.parse(donnees);
    } catch (e) {
        return postsParDefaut();
    }
}

function sauvegarderPosts(posts) {
    localStorage.setItem(CLE_POSTS, JSON.stringify(posts));
}

/* ---- Rendu du fil communautaire ---- */
function afficherPosts() {
    const posts = chargerPosts();
    const fil = document.getElementById("fil-communaute");
    fil.innerHTML = "";

    if (posts.length === 0) {
        fil.innerHTML = "<p class=\"vide\">Aucune publication pour l'instant. Soyez le premier à partager une vidéo !</p>";
        return;
    }

    // Les plus récentes en premier
    posts.slice().reverse().forEach((post) => {
        const article = document.createElement("article");
        article.className = "post";

        const videoHtml = post.videoUrl
            ? `<video controls src="${post.videoUrl}"></video>`
            : `<div class="post-sans-video">Vidéo non disponible dans cette démo</div>`;

        article.innerHTML = `
            <div class="post-entete">
                <span class="post-auteur">${echapper(post.auteur)}</span>
                <span class="post-date">${echapper(post.date)}</span>
            </div>
            <h3>${echapper(post.titre)}</h3>
            ${videoHtml}
            <div class="post-commentaires" id="commentaires-${post.id}"></div>
            <form class="form-commentaire" data-post-id="${post.id}">
                <input type="text" name="commentaire" placeholder="Ajouter un commentaire..." required>
                <button type="submit">Envoyer</button>
            </form>
        `;

        fil.appendChild(article);

        const conteneurCommentaires = article.querySelector(`#commentaires-${post.id}`);
        post.commentaires.forEach((c) => {
            conteneurCommentaires.appendChild(creerElementCommentaire(c));
        });
    });

    // Écouteurs sur les formulaires de commentaire (ajoutés dynamiquement)
    document.querySelectorAll(".form-commentaire").forEach((form) => {
        form.addEventListener("submit", gererAjoutCommentaire);
    });
}

function creerElementCommentaire(commentaire) {
    const div = document.createElement("div");
    div.className = "commentaire";
    div.innerHTML = `<h4>${echapper(commentaire.auteur)}</h4><p>${echapper(commentaire.texte)}</p>`;
    return div;
}

function echapper(texte) {
    const div = document.createElement("div");
    div.textContent = texte;
    return div.innerHTML;
}

/* ---- Ajout d'un commentaire ---- */
function gererAjoutCommentaire(evenement) {
    evenement.preventDefault();
    const form = evenement.target;
    const postId = form.dataset.postId;
    const champ = form.querySelector("input[name='commentaire']");
    const texte = champ.value.trim();
    if (!texte) return;

    const posts = chargerPosts();
    const post = posts.find((p) => p.id === postId);
    if (post) {
        post.commentaires.push({ auteur: recupererPseudo(), texte });
        sauvegarderPosts(posts);
        afficherPosts();
    }
}

/* ---- Publication d'une nouvelle vidéo ---- */
function gererPublicationVideo(evenement) {
    evenement.preventDefault();
    const form = evenement.target;
    const titre = form.querySelector("#titre-video").value.trim();
    const fichier = form.querySelector("#fichier-video").files[0];

    if (!titre) return;

    const nouveauPost = {
        id: crypto.randomUUID(),
        auteur: recupererPseudo(),
        titre: titre,
        videoUrl: fichier ? URL.createObjectURL(fichier) : "",
        date: new Date().toLocaleDateString("fr-FR"),
        commentaires: []
    };

    const posts = chargerPosts();
    posts.push(nouveauPost);
    sauvegarderPosts(posts);

    form.reset();
    afficherPosts();
}

/* ---- Initialisation ---- */
document.addEventListener("DOMContentLoaded", () => {
    const pseudoLabel = document.getElementById("pseudo-utilisateur");
    if (pseudoLabel) pseudoLabel.textContent = recupererPseudo();

    afficherPosts();

    const formPublication = document.getElementById("form-publication");
    if (formPublication) {
        formPublication.addEventListener("submit", gererPublicationVideo);
    }
});
