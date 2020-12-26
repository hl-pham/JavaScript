"use strict";

window.onload = function() {

	var canvas = document.getElementById('game_area');
	var context = canvas.getContext("2d");

	// Pour détecter les colisions, on peut calculer la distance séparant deux objets
	function distance(x1, y1, x2, y2) {
		let x = x2-x1;	// On conserve x dans cette fonction uniquement
		let y = y2-y1;	// On conserve y dans cette fonction uniquement
		return Math.sqrt(Math.pow(x,2) + Math.pow(y,2))
	}



	// Fonction créant notre vaisseau en bas de la fenêtre
	function Vaisseau(x, y, color) {
		this.x = x;
		this.y = y;
		this.color = color;
		this.vx = 2;
		this.vy = 2;
	};

	Vaisseau.prototype.dessine = function() {
		if (this.x < 0) {
			this.x = 0;
		}
		else if (this.x >= canvas.width) {
			this.x = canvas.width - 1;
		}

		if (this.y < 0) {
			this.y = 0;
		}
		else if (this.y >= canvas.height) {
			this.y = canvas.heigth - 1;
		}

		context.strokeStyle = this.color;
		context.lineWidth = 2;
		context.lineCap = "round";
		context.lineJoin = "round";

		context.beginPath();	// On vient de l'armée rebelle, du coup on a un X-Wing (de fortune). Sauf qu'ils ont monté le canon sur la tête du X-Wing
		context.moveTo(this.x, this.y-14);
		context.lineTo(this.x, this.y);
		context.lineTo(this.x-5, this.y);
		context.lineTo(this.x-5, this.y-7);
		context.moveTo(this.x, this.y);
		context.lineTo(this.x+5, this.y);
		context.lineTo(this.x+5, this.y-7);
		context.stroke();
	};



	// Fonction pour créer les vaisseaux ennemis
	function Ennemi(x, y, color, vy) {
		this.x = x;
		this.y = y;
		this.color = color;
		this.vy = vy;
		this.ligne = 1;
		this.dessine = function() {	// Les extraterrestres sont des partisans de l'Empire. C'est pour ça que leurs vaisseaux (de fortune) proviennent de la TIE-series. Par contre ils savent pas utiliser les canons...
			context.strokeStyle = this.color;
			context.lineWidth = 2;
			context.lineCap = "round";
			context.lineJoin = "round";

			context.beginPath();
			context.moveTo(this.x, this.y+2);
			context.lineTo(this.x, this.y);

			context.lineTo(this.x-7, this.y);
			context.lineTo(this.x-7, this.y+5);
			context.lineTo(this.x-4, this.y+7);

			context.moveTo(this.x-7, this.y);
			context.lineTo(this.x-7, this.y-5);
			context.lineTo(this.x-4, this.y-7);

			context.moveTo(this.x, this.y);
			context.lineTo(this.x+7, this.y);
			context.lineTo(this.x+7, this.y+5);
			context.lineTo(this.x+4, this.y+7);

			context.moveTo(this.x+7, this.y);
			context.lineTo(this.x+7, this.y-5);
			context.lineTo(this.x+4, this.y-7);
			context.stroke();
		}
		this.update = function() {
			if (this.x-7 < 0 || this.x+7 > 600) {
				this.vy = -this.vy * 1.1;
				this.y += 18;
			}
			this.x += this.vy;
			this.dessine();
		}
	}



	// Fonction créant les missiles lancés par le vaisseau. Le vaisseau est un T-65B X-wing starfighter (de fortune), donc on tire des lasers
	function Missile(x, y, vy) {
		this.x = x;
		this.y = y;
		this.vy = vy;
		this.distanceTrajet = 0;
		this.dessine = function() {
			context.beginPath();
			context.moveTo(this.x, this.y-3);
			context.lineTo(this.x, this.y-10);
			context.lineWidth = 1;
			context.strokeStyle = "red";
			context.stroke();
		}
		this.update = function() {
			if (this.y < 0 || this.distanceTrajet > 300) { // Le laser s'estompe s'il sort de l'arène ou s'il a parcourut une distance équivalente à la moitié du canvas
				return;
			}
			this.y -= 5;
			this.distanceTrajet += 5;
			this.dessine();
		}
	}



	// Fonction permettant d'animer les missiles
	function Move() {
		requestAnimationFrame(Move); // En faisant appel à cette fonction, on fait un callback sur Move, et on peut donc faire bouger les missiles tirés
		context.clearRect(0,0,600,600);

		for (var i = 0; i < listeEnnemis.length; i++) {
			listeEnnemis[i].update();	// On dessine les ennemis
		}
		
		for (var i = 0; i < listeMissiles.length; i++) {
			listeMissiles[i].update();	// On dessine les missiles
		}

		var compteurMissile = 0;
		for (var i = 0; i < listeMissiles.length; i++) {
			var compteurEnnemi = 0;
			for (var j = 0; j < listeEnnemis.length; j++) {;
				if (listeMissiles[i].y < 0 || listeMissiles[i].distanceTrajet > 300) {	// On vérifie si le missile est hors de l'arène ou s'il a parcourut 300px
					listeMissiles.splice(i-compteurMissile, 1);

					compteurMissile++;
				}
				if (distance(listeMissiles[i].x, listeMissiles[i].y, listeEnnemis[j].x, listeEnnemis[j].y) < 7) {
					listeMissiles.splice(i-compteurMissile, 1);		// On retire le missile n°(i-compteur+1) de la liste des missiles présents
					listeEnnemis.splice(j-compteurEnnemi, 1);		// On retire l'ennemi n°(j-compteur+1) de la liste des ennemis présents

					compteurMissile++;	// On compte le nombre de missiles retirés
					compteurEnnemi++;	// On compte le nombre d'ennemis détruits
					// On fait ça car la liste des missiles/ennemis est modifiée à chaque passage. On évite donc de supprimer le mauvais missile/ennemi
				}
			}
		}
		
		if (listeEnnemis.length === 0) {
			context.clearRect(0,0,600,600);
			context.beginPath();
			context.font = "20pt Calibri,Geneva,Arial";
			context.fillStyle = "rgb(255,166,0)";
			context.textAlign = 'center';
			context.fillText("Victoire !", canvas.width/2, canvas.height/2);
			context.fillText("Descendez sur Scarif pour aider Rogue One !", canvas.width/2, canvas.height/2 + 50);
			context.stroke();
		} else if (vaisseau === null) {
			context.clearRect(0,0,600,600);
			context.beginPath();
			context.font = "20pt Calibri,Geneva,Arial";
			context.fillStyle = "rgb(255,0,0)";
			context.textAlign = 'center';
			context.fillText("Défaite !", canvas.width/2, canvas.height/2);
			context.fillText("Vous n'avez pas survécu à la bataille de Scarif.", canvas.width/2, canvas.height/2 + 50);
			context.stroke();
		}

		for (var i = 0; i < listeEnnemis.length; i++) {		// On détecte si le vaisseau a été détruit ou non
			if (distance(vaisseau.x, vaisseau.y, listeEnnemis[i].x, listeEnnemis[i].y) < 14) {
				vaisseau = null;
			}
		}
		vaisseau.dessine(context);
	}
		

	var vaisseau = new Vaisseau(canvas.width/2, canvas.height-50, 'red', 3);
	var listeMissiles = [];
	var listeEnnemis = [];
	
	for (var i = 0; i < 30; i++) {
		for (var j = 0; j < 10; j++) {
			if (j%2 == 0) {
				var ennemi = new Ennemi(10+(i*20), 10+(j*35), "green", -1);
				listeEnnemis.push(ennemi);
			}
			else {
				var ennemi = new Ennemi(10+(i*20), 10+(j*35), "green", -1);
				listeEnnemis.push(ennemi);
			}
		}
	}

	Move();
	vaisseau.dessine(context);

	window.addEventListener('keydown', function(event) {
		var e = event.keyCode;
		if (e == 90 || e == 38) {
			vaisseau.y -= vaisseau.vy;
		}
		else if (e == 83 || e == 40) {
			vaisseau.y += vaisseau.vy;
		}
		else if (e == 81 || e == 37) {
			vaisseau.x -= vaisseau.vx;
		}
		else if (e == 68 || e == 39) {
			vaisseau.x += vaisseau.vx;
		}
		else if (e == 80 || e == 107) {
			vaisseau.vx *= 1.2;
			vaisseau.vy *= 1.2;
		}
		else if ((e == 77 || e == 109) && vaisseau.vx > 1) {
			vaisseau.vx /= 1.2;
		}
		else if ((e == 77 || e == 109) && vaisseau.vy > 1) {
			vaisseau.vy /= 1.2;
		}
		else if (e == 32) {
			var missile = new Missile(vaisseau.x, vaisseau.y, vaisseau.vy);
			listeMissiles.push(missile);
		}		
		vaisseau.dessine(context);
	})
};