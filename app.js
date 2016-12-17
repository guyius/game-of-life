(function () {
	let Game = function (cellSize, board) {
		let cellWidth = cellSize;
		let cellHeight = cellSize;
		let startingBoard = board;
		let numOfCellsY = startingBoard.length;
		let numOfCellsX = startingBoard[0].length;
		let currentBoard = [];
		let drawBoard = new DrawBoard(numOfCellsX, numOfCellsY, cellWidth, cellHeight);

		Game.prototype.createOriginalBoard = () => {
			let lengthY = startingBoard.length;
			for (let i = 0; i < lengthY; i++) {
				let lengthX = startingBoard[i].length;
				for (let j = 0; j < lengthX; j++) {
					let state = (startingBoard[i][j] === 1) ? 'alive' : 'dead';
					startingBoard[i][j] = new Cell(j, i, state);
				}
			}

			currentBoard = startingBoard;
			drawBoard.updateBoard(currentBoard);
		};

		Game.prototype.getNextGeneration = () => {
			let currentGeneration = currentBoard;
			let nextGeneration = [];
			let	lengthY = currentGeneration.length;

			for (let row = 0; row < lengthY; row++) {
				let lengthX = currentGeneration[row].length;
				nextGeneration[row] = [];
				for (let column = 0; column < lengthX; column++) {
					let cell = currentGeneration[row][column];
					let neighbours = this.getNeighbours(currentGeneration, cell, row, column, lengthY, lengthX);
					let aliveCount = this.getNeighboursAliveCount(neighbours);
					let newState = this.getNextState(cell, aliveCount);

					nextGeneration[row][column] = new Cell(column, row, newState);
				}
			}
			return nextGeneration;
		};

		Game.prototype.getNeighbours = (currentGeneration, cell, row, column, lengthY, lengthX) => {
			let rowUp = (row - 1 >= 0) ? row - 1 : lengthY - 1;
			let rowBottom = (row + 1 <= lengthY - 1) ? row + 1 : 0;
			let columnLeft = (column - 1 >= 0) ? column - 1 : lengthX - 1;
			let columnRight = (column + 1 <= lengthX - 1) ? column + 1 : 0;
			let neighbours = {
				topLeft: currentGeneration[rowUp][columnLeft].create(),
				topCenter: currentGeneration[rowUp][column].create(),
				topRight: currentGeneration[rowUp][columnRight].create(),
				left: currentGeneration[row][columnLeft].create(),
				right: currentGeneration[row][columnRight].create(),
				bottomLeft: currentGeneration[rowBottom][columnLeft].create(),
				bottomCenter: currentGeneration[rowBottom][column].create(),
				bottomRight: currentGeneration[rowBottom][columnRight].create()
			};
			return neighbours
		};

		Game.prototype.getNeighboursAliveCount = (neighbours) => {
			let count = 0;
			for (let neighbour in neighbours) {
				let isAlive = neighbours[neighbour].getState() === "alive";
				if (isAlive) {
					count++;
				}
			}
			return count;
		};

		Game.prototype.getNextState = (cell, aliveCount) => {
			let newState = cell.getState();
			if (cell.getState() === "alive" && (aliveCount < 2 || aliveCount > 3)) {
				newState = "dead";
			} else if (cell.getState() === "dead" && aliveCount === 3) {
				newState = "alive";
			}
			return newState;
		};

		this.createOriginalBoard();

		return {
			step: () => {
				currentBoard = this.getNextGeneration();
				drawBoard.updateBoard(currentBoard);
			}
		};
	};

	let DrawBoard = function (numOfCellsX, numOfCellsY, cellWidth, cellHeight) {
		let canvas = document.getElementById('game');
		let	ctx = canvas.getContext && canvas.getContext('2d');
		canvas.width = numOfCellsX * cellWidth;
		canvas.height = numOfCellsY * cellHeight;

		DrawBoard.prototype.drawGrid = () => {
			ctx.lineWidth = 1;
			ctx.strokeStyle = "rgba(0,0,0,1)";
			ctx.beginPath();

			for (let i = 0; i <= numOfCellsX; i++) {
				ctx.moveTo(i * cellWidth, 0);
				ctx.lineTo(i * cellWidth, canvas.height);
			}
			for (let j = 0; j <= numOfCellsY; j++) {
				ctx.moveTo(0, j * cellHeight);
				ctx.lineTo(canvas.width, j * cellHeight);
			}
			ctx.stroke();
		};

		DrawBoard.prototype.updateCells = (board) => {
			let lengthY = board.length;
			for (let i = 0; i < lengthY; i++) {
				let lengthX = board[i].length;
				for (let j = 0; j < lengthX; j++) {
					this.drawCell(board[i][j]);
				}
			}
		};

		DrawBoard.prototype.drawCell = (cell) => {
			let startX = cell.getXPosition() * cellWidth;
			let	startY = cell.getYPosition() * cellHeight;
			let isAlive = cell.getState() === "alive";
			if (isAlive) {
				let	randomOpacity = (Math.floor(Math.random() * 6) + 5) / 10;
				ctx.fillStyle = `rgba(0, 255, 25,${randomOpacity})`;
				ctx.fillRect(startX, startY, cellWidth, cellHeight);
			} else {
				ctx.clearRect(startX, startY, cellWidth, cellHeight);
			}
		};

		this.drawGrid();

		return {
			updateBoard: (board) => this.updateCells(board)
		};
	};

	let Cell = function (xPosition, yPosition, state) {
		return {
			xPosition: xPosition,
			yPosition: yPosition,
			state: state,
			getXPosition: () => xPosition,
			getYPosition: () => yPosition,
			getState: () => state,
			create: () => new Cell(xPosition, yPosition, state)
		};
	};

	const board = [
		[1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0],
		[0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0],
		[0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
		[0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
		[0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1],
		[1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
		[0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1],
		[0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0],
		[0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0],
		[0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1],
		[0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1],
		[0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1],
		[1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
		[1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
		[1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
		[0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
		[0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1],
		[0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0],
		[0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]
	];


	const cellSize = 15;
	let game = new Game(cellSize, board);
	let startButton = document.getElementById('start');
	let stopButton = document.getElementById('stop');
	let interval;

	startButton.onclick = () => {
		interval = setInterval(game.step, 1000);
	};

	stopButton.onclick = () => {
		clearInterval(interval);
	};
})();
