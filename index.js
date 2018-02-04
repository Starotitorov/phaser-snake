function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

window.onload = function() {
    var SECTION_SIZE = 32;
    var CANVAS_WIDTH_SECTIONS_LENGTH = 26;
    var CANVAS_HEIGHT_SECTIONS_LENGTH = 20;
    var CANVAS_HEIGHT = SECTION_SIZE * CANVAS_HEIGHT_SECTIONS_LENGTH;
    var CANVAS_WIDTH = SECTION_SIZE * CANVAS_WIDTH_SECTIONS_LENGTH;
    var SNAKE_INITIAL_LENGTH = 3;
    var DIRECTIONS = Object.freeze({ up: 0, down: 2, right: 3, left: 1 });
    var GAME_SPEED = 20;

    var game = new Phaser.Game(
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        Phaser.CANVAS,
        '',
        { preload: preload, create: create, update: update }
    );

    var snake = new DLL.DoublyLinkedList();
    var food;
    var cursors;
    var playerDirection = DIRECTIONS.right;
    var frameCounter = 0;
    var score = 0;
    var scoreText;

    /**
     * Game
     */

    function preload() {
        game.load.spritesheet('player', 'assets/player.png', SECTION_SIZE, SECTION_SIZE);
        game.load.image('food', 'assets/food.png');
        game.load.image('background', 'assets/background.png')
    }

    function create() {
        game.add.tileSprite(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 'background');

        initSnake();

        placeRandomApple();

        score = 0;
        scoreText = game.add.text(
            CANVAS_WIDTH,
            0,
            'Score: ' + score,
            { fontSize: '28px', fill: '#fff' }
        );
        scoreText.anchor.setTo(1, 0);

        cursors = game.input.keyboard.createCursorKeys();
    }

    function update() {
        updateDirection();
        frameCounter++;

        if (frameCounter === GAME_SPEED) {
            movePlayer();

            if (checkSnakeHeadCollision()) {
                renderGameOverMessage();

                return resetGame();
            }

            if (checkAppleSnakeCollision()) {
                score++;
                food.destroy();
                placeRandomApple();
            } else if (playerDirection !== undefined) {
                removeSnakeTail();
            }

            frameCounter = 0;
        }

        scoreText.text = 'Score: ' + score;
        scoreText.bringToTop();
    }

    function renderGameOverMessage() {
        alert('The game is over! Score: ' + score + '.');
    }

    function resetGame() {
        deleteSnake();
        initSnake();

        score = 0;

        playerDirection = DIRECTIONS.right;

        frameCounter = 0;
    }

    /**
     * Snake
     */

    function initSnake() {
        snake = new DLL.DoublyLinkedList();

        for (var i = 0; i < SNAKE_INITIAL_LENGTH; ++i) {
            addSnakeHead(i * SECTION_SIZE, 0);
        }
    }

    function deleteSnake() {
        var section = snake.head();

        while(section) {
            section.data.destroy();

            section = section.next;
        }

        snake = new DLL.DoublyLinkedList();
    }

    function addSnakeHead(x, y) {
        var newSnakeHead = game.add.sprite(x, y, 'player', playerDirection);

        if (snake.size() === 0) {
            return snake.append(newSnakeHead);
        }

        var oldHead = snake.head();
        var oldSnakeHeadSection = game.add.sprite(
            oldHead.data.position.x,
            oldHead.data.position.y,
            'player',
            4
        );

        oldHead.remove();
        oldHead.data.destroy();

        snake.prepend(oldSnakeHeadSection);
        snake.prepend(newSnakeHead);
    }

    function removeSnakeTail() {
        var tail = snake.tail();
        tail.remove();
        tail.data.destroy();
    }

    /**
     * Food
     */

    function placeRandomApple() {
        if (food) {
            food.destroy();
        }

        food = game.add.image(0, 0, 'food');
        do {
            food.position.x = getRandomInt(0, CANVAS_WIDTH_SECTIONS_LENGTH) * SECTION_SIZE;
            food.position.y = getRandomInt(0, CANVAS_HEIGHT_SECTIONS_LENGTH) * SECTION_SIZE;
        } while (checkAppleSnakeCollision());
    }

    /**
     * Collision
     */

    function checkAppleSnakeCollision() {
        var section = snake.head();

        while(section) {
            if (food.position.x === section.data.position.x &&
                food.position.y === section.data.position.y) {
                return true;
            }

            section = section.next;
        }

        return false;
    }

    function checkSnakeHeadCollision() {
        var head = snake.head();
        var headSection = head.data;
        var section = head.next;

        while (section) {
            if (section.data.position.x === headSection.position.x &&
                section.data.position.y === headSection.position.y) {
                return true;
            }

            section = section.next;
        }

        return false;
    }

    /**
     * Movement
     */

    function updateDirection() {
        if (cursors.right.isDown && playerDirection !== DIRECTIONS.left) {
            playerDirection = DIRECTIONS.right;
        }
        if (cursors.left.isDown && playerDirection !== DIRECTIONS.right) {
            playerDirection = DIRECTIONS.left;
        }
        if (cursors.up.isDown && playerDirection !== DIRECTIONS.down) {
            playerDirection = DIRECTIONS.up;
        }
        if (cursors.down.isDown && playerDirection !== DIRECTIONS.up) {
            playerDirection = DIRECTIONS.down;
        }
    }

    function movePlayer() {
        var head = snake.head();
        var x = head.data.position.x;
        var y = head.data.position.y;

        if (playerDirection === DIRECTIONS.right) {
            x += SECTION_SIZE;
        } else if (playerDirection === DIRECTIONS.left) {
            x -= SECTION_SIZE;
        } else if (playerDirection === DIRECTIONS.up) {
            y -= SECTION_SIZE;
        } else if (playerDirection === DIRECTIONS.down) {
            y += SECTION_SIZE;
        }

        if (x <= 0 - SECTION_SIZE) {
            x = CANVAS_WIDTH - SECTION_SIZE;
        } else if (x >= CANVAS_WIDTH) {
            x = 0;
        } else if (y <= 0 - SECTION_SIZE) {
            y = CANVAS_HEIGHT - SECTION_SIZE;
        } else if (y >= CANVAS_HEIGHT) {
            y = 0;
        }

        if (playerDirection !== undefined) {
            addSnakeHead(x, y);
        }
    }
};
