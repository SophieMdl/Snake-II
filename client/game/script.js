const localhost = 'http://localhost:3000'
const herokuhost = 'https://snake-with-high-score.herokuapp.com'

const getFetchUrl = window.location.hostname.includes('heroku') ? herokuhost : localhost

let pause = false;
let snakeSlice;
let tail;
let head;
const audio = {
    eat: new Audio('sounds/eat.wav'),
    hurt: new Audio('sounds/hit.wav')
}

const appleSize = snakeSize = 15;

let snakeSpeed;
let selectedSpeed = new Number();
let scoreValue = 0;

const score = document.querySelector('.score span');
const select = document.querySelector('.custom-select');
const menu = document.getElementById("menu");
const menuEnd = document.getElementById("menu-end");
const bestScores = document.getElementById("best-scores");
const gameArea = document.getElementById('game');
const scoreEnd = document.getElementById('scoreEnd');

bestScores.style.display = "none";
menuEnd.style.display = "none";

const game = {
    width: 900,
    height: 600,
}

const snake = {
    elem: document.getElementById('snake'),
    x: 0,
    y: game.height / 2,
    direction: 'right',
    size: snakeSize,
    length: 4,
    body: []
};

const apple = {
    elem: document.getElementById('apple'),
    x: 0,
    y: 0,
    size: appleSize,
    collision: false
};

const snakeBody = () => {
    for (let i = 0; i < snake.length; i++) {
        //création d'un tableau contenant toutes les parties du serpent, avec pour chaque partie sa position x y.
        snake.body.push({ x: snakeSize * i, y: snake.y, snakeSlice });
    }
    for (let u = 0; u < snake.length; u++) {
        //Pour chaque élément du tableau, une div de la classe snake est ajoutée à la page
        snake.body[u].snakeSlice = document.createElement("div");
        snake.body[u].snakeSlice.setAttribute('class', 'snake');
        gameArea.appendChild(snake.body[u].snakeSlice);
    }
}

const snakeDirection = (e) => {
    //La direction change en fonction de la touche appuyée. Et espace = pause
    if (e.which === 38 && snake.direction != 'down') { snake.direction = 'top'; }
    if (e.which === 40 && snake.direction != 'top') { snake.direction = 'down'; }
    if (e.which === 39 && snake.direction != 'left') { snake.direction = 'right'; }
    if (e.which === 37 && snake.direction != 'right') { snake.direction = 'left'; }
    if (e.which === 32) {
        if (!pause) pause = true;
        else pause = false;
    }
}

const moveSnake = () => {
    //head prend les valeurs de la dernière div placée sur le jeu
    head = snake.body[snake.length - 1];
    //Les coordonnées du serpent sont déterminées par la position de head
    snake.x = head.x;
    snake.y = head.y;
    //Le serpent avance d'une case (taille d'une 'tranche') en fonction de sa direction 
    if (snake.direction === 'top') { snake.y -= snake.size; }
    if (snake.direction === 'down') { snake.y += snake.size; }
    if (snake.direction === 'left') { snake.x -= snake.size; }
    if (snake.direction === 'right') { snake.x += snake.size; }
    //S'il ne rencontre pas de pomme
    if (!apple.collision) {
        //on retire la queue du seprent du tableau et on lui donne les coordonnées de la tête
        tail = snake.body.shift();
        tail.x = snake.x;
        tail.y = snake.y;
    } else {
        //S'il rencontre une pomme, on crée un nouvel élément de tableau et on place une nouvelle div sur le terrain
        tail = { x: snake.x, y: snake.y, snakeSlice };
        tail.snakeSlice = document.createElement("div");
        tail.snakeSlice.setAttribute('class', 'snake');
        gameArea.appendChild(tail.snakeSlice);
        snake.length += 1;
        apple.collision = false;
    }
    //On ajoute la queue avec ses nouvelles coordonnées à la fin du tableau
    snake.body.push(tail);
}

const checkCollisions = () => {
    //Si la tête du serpent rencontre une pomme
    if (((snake.x + snake.size) > apple.x) && //Droit
        (snake.x <= (apple.x + apple.size)) && //Gauche
        ((snake.y + snake.size) >= apple.y) && //Haut
        (snake.y <= (apple.y + apple.size))) { //bas
        audio.eat.play();
        resetApple();
        scoreValue = scoreValue + selectedSpeed;
        apple.collision = true;
    } else if (snake.x < 0 ||
        (snake.x + snake.size) > game.width ||
        snake.y < 0 ||
        (snake.y + snake.size) > game.height) {
        //Si la tête du serpent sort du terrain
        gameOver();
    }
    //Si la tête du serpent touche une partie de son corps
    for (let i = 0; i < snake.length - 2; i++) {
        if ((snake.x === snake.body[i].x) && (snake.y === snake.body[i].y)) {
            gameOver();
        }
    }
}

const resetApple = () => {
    //Position aléatoire de la pomme dans le terrain
    apple.x = Math.floor(Math.random() * (game.width - apple.size));
    apple.y = Math.floor(Math.random() * (game.height - apple.size));
    apple.elem.style.top = apple.y + 'px';
    apple.elem.style.left = apple.x + 'px';
}


const gameOver = () => {
    audio.hurt.play();
    pause = true;
    menuEnd.style.display = "flex";
    scoreEnd.innerHTML = "Score : " + scoreValue;
    //window.removeEventListener('keydown', listenerKeyboard)
    window.addEventListener('keydown', (e) => {
        if(e.which === 13){
            menuEnd.style.display = "none";
            apple.elem.style.display = "none";
            const snake = document.getElementsByClassName('snake');
            for(let snakeSlice of snake){
                snakeSlice.style.display = "none";
            }
            postScore(event.target.value);
        }
    })
    const postScore = (name) => {
        window.fetch(`${getFetchUrl}/post-scores`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,   
                score: scoreValue,
                speed: selectedSpeed
            })
        })
        .then(() => fetchBestScore())
    }
    const fetchBestScore = () => {
        window.fetch(`${getFetchUrl}/scores`)
            .then(res => res.json())
            .then(scores => {
                displayBestScores(scores)
            })
    }
    const displayBestScores = (scores) => {
        bestScores.style.display = "block";
        document.getElementById('players-score').innerHTML = scores.map(score => {
            return (`<span>${score.name}</span>
                    <span>${score.score}</span>
                    <span>${score.speed}</span>`)
        }).join('')
    } 
    //window.removeEventListener('keydown', pressEnter)
    window.addEventListener('keydown', (e) => {
        if(e.which === 27){
            window.location.reload()
        }
    })
}


const init = () => {
    selectedSpeed = parseInt(select.value)
    //Initialisation du jeu :
    menu.style.display = "none";
    resetApple();
    snakeBody();
    //Vitesse qui dépend de la vitesse définie :
    snakeSpeed = 100 - 20 * (selectedSpeed - 1);
    setInterval(loop, snakeSpeed);
    window.removeEventListener('keydown', init);
    window.addEventListener('keydown', (e) => {
        snakeDirection(e);
    });
}

const render = () => {
    //Changement de position de chaque élément du tableau serpent et calcul du score
    for (let i = 0; i < snake.length; i++) { 
        snake.body[i].snakeSlice.style.top = snake.body[i].y + 'px';
        snake.body[i].snakeSlice.style.left = snake.body[i].x + 'px';
    }
    score.innerHTML = scoreValue;
}

const loop = () => {
    //Si le jeu n'est pas en pause, boucle qui fait bouger le serpent, vérifie les collisions et affiche le rendu à l'écran
    if (!pause) {
        moveSnake();
        checkCollisions();
        render();
    }
}

const addEventListeners = () => {
    window.addEventListener('keydown', init);
}


addEventListeners();