// Start of Tic Tac Toe JS
'use strict';

/* Imperfect circle using 4 cubic Bezier curves
Inspired by http://bl.ocks.org/patricksurry/11087975
Constructor parameter:
  x, y: Coordinates of the circle (default to 0)
  r: radius of the circle (default to 1)
*/
class ImperfectCirclePath {
  constructor(x = 0, y = 0, r = 1) {
    this._x = x;
    this._y = y;
    this._r = r;
    this._dR = 0.05;
    this._thetaStart = 2 * Math.PI * Math.random();
    this._dTheta = 0.2;
    this._ratio = 0.9;
    this._angle = Math.PI * Math.random();
    this._path = undefined;
  }
  get x() {return this._x;}
  get y() {return this._y;}
  get r() {return this._y;}
  get path() {return this._path;}

  /* Appends the path to a d3 svg selector an returns that path */
  addPathToSvg(svg) {
    if (this._path !== undefined) {
      throw("Error: Path already added to an svg");
    }
    this._path = svg.append('path')
      .attr('d', this._imperfectCirclePath())
      .attr('transform', this._transformPath())
      .attr('stroke-dasharray', 10)
      .attr('stroke-dashoffset', 10);
    return this._path;
  }

  draw() {
    return this._path.transition()
      .duration(400)
      .ease('linear')
      .attr('stroke-dashoffset', 0);
  }

  _imperfectCirclePath() {
    const c = 0.551915024494,
      beta = Math.atan(c),
      d = Math.sqrt(c * c + 1 * 1);
    let r = 1,
      theta = this._thetaStart,
      path = 'M',
      randomFn = Math.random;

    // Move to P0
    path += [r * Math.sin(theta), r * Math.cos(theta)];
    // Control point P1
    path += ' C' + [d * r * Math.sin(theta + beta), d * r * Math.cos(theta + beta)];

    // For each quarter turn
    for (let i = 0; i < 4; i++) {
      // Angle overshoot/undershoot
      theta += Math.PI / 2 * (1 + randomFn() * this._dTheta);
      // Radius overshoot/undershoot
      r *= (1 + randomFn() * this._dR);
      // Control point P2
      path += ' ' + (i ? 'S' : '') + [d * r * Math.sin(theta - beta),
        d * r * Math.cos(theta - beta)
      ];
      // Control point P3
      path += ' ' + [r * Math.sin(theta), r * Math.cos(theta)];
    }
    return path;
  }

  _transformPath() {
    let angle = this._angle * 180 / Math.PI;
    return `translate(${this._x}, ${this._y}) rotate(${angle}) scale(1, ${this._ratio}) rotate(-${angle})`;
  }
}

/* Imperfect line using a cubic bezier curves
Constructor parameter:
 x0, y0: Coordinates of the origin (default to [0, 0])
 x0, y0: Coordinates of the end (default to [1, 0])
*/
class ImperfectLinePath {
  constructor (x0=0, y0=0, x1=1, y1=0) {
    this._x0 = x0;
    this._y0 = y0;
    this._x1 = x1;
    this._y1 = y1;
    this._startAngle = 0.1 + this._rndSign() * 0.1 * Math.random();
    this._endAngle = 0.1 + this._rndSign() * 0.1 * Math.random();
    this._xMid = -0.2 + 0.2 * Math.random();
    this._path = undefined;
  }

  get x0() {return this._x0;}
  get y0() {return this._y0;}
  get x1() {return this._x1;}
  get y1() {return this._y1;}
  get path() {return this._path;}

  /* Appends the path to a d3 svg selector and returns the path */
  addPathToSvg(svg) {
    if (this._path !== undefined) {
      throw("Error: Path already added to an svg");
    }
    this._path = svg.append('path')
      .attr('d', this._imperfectLine())
      .attr('transform', this._transformPath())
      .attr('stroke-dasharray', 10)
      .attr('stroke-dashoffset', 10);
    return this._path;
  }

  draw() {
    return this._path.transition()
      .duration(300)
      .ease('linear')
      .attr('stroke-dashoffset', 0);
  }

  /* Imperfect horizontal line from [-1,0] to [1,0]
  Parameters: start and end angles in radians
  Return: d attribute of SVG path */
  _imperfectLine() {
    let path = 'M-1,0 C'; // The line starts at [-1, 0]
    // Control point P1
    path += [this._xMid, (1 + this._xMid) * Math.tan(this._startAngle)];
    // Control point P2
    path += ' ' + [this._xMid, (1 - this._xMid) * Math.tan(this._endAngle)];
    // Control point P3
    path += ' ' + [1, 0];
    return path;
  }

  _transformPath() {
    let length = Math.sqrt((this._x0 - this._x1) * (this._x0 - this._x1) + (this._y0 - this._y1) * (this._y0 - this._y1)),
      angle = Math.acos((this._x1 - this._x0) / length) * 180 / Math.PI;
    return ` translate (${0.5 * (this._x0 + this._x1)}, ${0.5 * (this._y0 + this._y1)}) rotate (${angle}) scale(${length / 2}, 1)`;
  }

  /* Return a positive or a negative sign */
  _rndSign () {
    return Math.random() < 0.5 ? -1 : 1;
  }
}

/* Creates a cross - Default in square centered on 0 and of width of 2
Constructor parameters: center and width of the bounding square */
class ImperfectCrossPath {
  constructor(x=0, y=0, w=2, delta=0.6) {
    this._x = x;
    this._y = y;
    this._w = w;
    this._path = undefined;
    this._yMidStart = delta * (-0.5 + Math.random());
    this._yMidEnd = delta * (-0.5 + Math.random());
    this._xMidStart = delta * (-0.5 + Math.random());
    this._xMidEnd = delta * (-0.5 + Math.random());
  }

  get x() {return this._x;}
  get y() {return this._y;}
  get w() {return this._w;}
  get path() {return this._path;}

  addPathToSvg(svg) {
    if (this._path !== undefined) {
      throw("Error: Path already added to an svg");
    }
    this._path = svg.append('path')
      .attr('d', this._imperfectCross())
      .attr('transform', this._transformPath())
      .attr('stroke-dasharray', 10)
      .attr('stroke-dashoffset', 10);
    // Hide the junction line and create a symmetric effect on the right
    // This only works when the background color is known.
    svg.append('path')
      .attr('d', 'M-1.1,-1.2 L-0.9,-0.8 L-0.9,0.8 L-1.1,1.2 Z M1.1,-1.2 L0.9,-0.8 L0.9,0.8 L1.1,1.2 Z')
      .attr('stroke', 'none')
      .attr('fill', 'black')
      .attr('transform', this._transformPath());
    return this._path;
  }

  draw() {
    return this._path.transition()
      .duration(500)
      .ease('linear')
      .attr('stroke-dashoffset', 0);
  }

  _imperfectCross() {
    // First stroke - P0
    let path = 'M1,-1 C';
    // First stroke - P1
    path += [0, this._yMidStart];
    // First stroke - P2
    path += ' ' + [0, this._yMidEnd];
    // First stroke - P3
    path += ' ' + [-1, 1];
    // Second stroke - P0 - Junction line essential for the look of the stroke
    path += ' L-1,-1 C';
    // Second stroke - P1
    path += [this._xMidStart, 0];
    // Second stroke - P2
    path += ' ' + [ this._xMidEnd, 0];
    // Second stroke - P3
    path += ' ' + [1, 1];
    return path;
  }

  _transformPath() {
    return ` translate (${this._x}, ${this._y}) scale(${this._w / 2})`;
  }
}

/* Class dealing with the display of the Tic Tac Toe board */
class TicTacToeBoard {
  // Callback when the board is drawn
  constructor(callback) {
    // Init public variables
    this.svg = d3.select('#board');
    this.played = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    let viewBox = this.svg.attr('viewBox').split(' ').map(Number);
    // Init private variables
    this._mask = document.getElementById('mask');
    this._board = {};
    this._board.topCorner = viewBox[0];
    this._board.bottomCorner = viewBox[2] + this._board.topCorner;
    this._board.boxWidth = (this._board.bottomCorner - this._board.topCorner) / 3;
    this._isCross = true; // Cross plays first
    // Init the board
    this._initBoard(callback);
  }

  _initBoard(callback) {
    this._disableClick();
    this._eraseBoard();
    this._displayGrid(callback);
  }

  _eraseBoard() {

  }

  _displayGrid(callback) {
    let firstLine = this._board.topCorner + this._board.boxWidth,
    secondLine = firstLine + this._board.boxWidth;
    this._board.lines = [];
    this._board.lines[0] = new ImperfectLinePath(this._board.topCorner, firstLine, this._board.bottomCorner, firstLine);
    this._board.lines[1] = new ImperfectLinePath(this._board.topCorner, secondLine, this._board.bottomCorner, secondLine);
    this._board.lines[2] = new ImperfectLinePath(firstLine, this._board.topCorner, firstLine, this._board.bottomCorner);
    this._board.lines[3] = new ImperfectLinePath(secondLine, this._board.topCorner, secondLine, this._board.bottomCorner);

    for (let i = 0; i < this._board.lines.length; i++) {
      this._chalkify(this._board.lines[i].addPathToSvg(this.svg));
    }
    this._draw(0, callback);
  }

  _draw(n, callback) {
    if (n < this._board.lines.length) {
      return this._board.lines[n].draw().each("end", () => {this._draw(n + 1, callback);});
    } else {
      this._enableClick();
      callback();
    }
  }

  /* Displays a nought at the x,y location */
  _displayNought(x, y, callback) {
    let n = new ImperfectCirclePath(x, y);
    this._chalkify(n.addPathToSvg(this.svg));
    n.draw().each('end', () => {this._enableClick(); callback();});
    return n;
  }
  /* Displays a cross at the x,y location */
  _displayCross(x, y, callback) {
    let c = new ImperfectCrossPath(x, y);
    this._chalkify(c.addPathToSvg(this.svg));
    c.draw().each('end', () => {this._enableClick(); callback();});
    return c;
  }


  /* Play a nought or a cross at a given row and column (0 indexed)*/
  play(moveRC, callback) {
    let r = moveRC[0], c = moveRC[1];
    this._disableClick();
    let x = this._board.topCorner + (c + 0.5) * this._board.boxWidth,
    y = this._board.topCorner + (r + 0.5) * this._board.boxWidth;
    if (this._isCross) {
      this._displayCross(x, y, callback);
    } else {
      this._displayNought(x, y, callback);
    }
    this.played[r][c] = this._isCross ? 1 : -1;
    this._isCross = !this._isCross;
  }

  won(startRC, endRC) {
    let bStart = this._board.topCorner,
      bEnd = this._board.bottomCorner,
      l;
    if (startRC[0] == endRC[0]) {
      // The win is a row
      let aStart = this._board.topCorner + (startRC[0] + 0.5) * this._board.boxWidth;
      l = new ImperfectLinePath(bStart, aStart, bEnd, aStart);
    } else if (startRC[1] == endRC[1]) {
      // The win is a column
      let aStart = this._board.topCorner + (startRC[1] + 0.5) * this._board.boxWidth;
      l = new ImperfectLinePath(aStart, bStart, aStart, bEnd);
    } else if (startRC[0] == startRC[1] && endRC[0] == endRC[1]) {
      // The win is the first diagonal
      l = new ImperfectLinePath(bStart, bStart, bEnd, bEnd);
    } else {
      // The win is the second diagonal
      l = new ImperfectLinePath(bEnd, bStart, bStart, bEnd);
    }
    this._chalkify(l.addPathToSvg(this.svg));
    l.draw();
    return;
  }

  _chalkify(path) {
    path.attr('filter', 'url(#chalkTexture)')
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', '0.1');
    return path;
  }

  toRC(x, y) {
    let moveRC = [];
    moveRC[0] = Math.floor((y - this._board.topCorner) / this._board.boxWidth);
    moveRC[1] = Math.floor((x - this._board.topCorner) / this._board.boxWidth);
    return moveRC;
  }

  _enableClick() {
    this._mask.style.zIndex = '-1';
  }

  _disableClick() {
    this._mask.style.zIndex = '1';
  }
}

class Player {
  constructor (game) {
    this._game = game;
    this._moveRC = [];
  }
}

class HumanPlayer extends Player {
  constructor(game) {
    super(game);
  }

  // Returns a move from the board
  get moveRC() {
    let mouseXY = d3.mouse(this._game.board.svg.node());
    this._moveRC = this._game.board.toRC(...mouseXY);
    return this._moveRC;
  }
  play() {
    // A human player is just clicking, nothing to do here.
    return;
  }
}

/* Computer player using the minimax algorithm
Inspired by http://http://neverstopbuilding.com/minimax
The main difference is that the player doesn't affect the current game.
It just uses the rules of the TicTacToeGame class */
class ComputerPlayer extends Player {
  constructor(game) {
    super(game);
  }

  get moveRC() {
    return this._moveRC;
  }

  // Play seqquence
  play() {
    this._minimaxInit();
    this._simulateClick();
  }

  // Scoring
  _score(isPlayerMe, depth) {
    let isWon = this._game.winningPattern(this._moveRC);
    if (isWon) {
      if (isPlayerMe) {
        return 10 - depth;
      } else {
        return depth - 10;
      }
    } else {
      return 0;
    }
  }

  // Minimax algorithm returning a moveRC array
  _minimaxInit () {
    let moveRC = [],
      played = this._game.board.played,
      win = this._game.winningPattern;
    // DEBUG Random play from computer
    for (let i = 0, r = played.length; i < r; i++) {
      for (let j = 0, c = played[i].length; j < c; j++){
        if (played[i][j] === 0) {
          this._moveRC = [i, j];
        }
      }
    }
  }

  // To indicate that the computer has 'played'
  _simulateClick() {
    let evt = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    let cb = this._game.board.svg.node();
    cb.dispatchEvent(evt);
  }
}

class TicTacToeGame {
  constructor() {
    this._player = [];
    this._player[0] = new HumanPlayer(this);
    this._player[1] = new ComputerPlayer(this);
    this._currentPlayer = 0; // Value 0 or 1
    // Start first turn
    this.board = new TicTacToeBoard(() => {this._turn();});
  }

  // Run a turn of the game
  _turn() {
    this.board.svg.on("click", () => {this._evalMove();});
    this._player[this._currentPlayer].play();
  }

  // Evaluates whether the move is legal and processes it
  _evalMove() {
    document.getElementById('gameMsg').innerHTML = '';
    let moveRC = this._player[this._currentPlayer].moveRC;
    if (this._isLegal(moveRC)) {
      this.board.play(moveRC, () => {this._checkWin(moveRC);});
    } else {
      document.getElementById('gameMsg').innerHTML = 'Illegal move, try again';
      this._turn();
    }
  }

  _isLegal(moveRC) {
    return this.board.played[moveRC[0]][moveRC[1]] === 0;
  }

  _checkWin(moveRC) {
    let won = this.winningPattern(moveRC);
    if (won === '') {
      if (this._isDraw()) {
        this._drawSequence();
      } else {
        this._currentPlayer = !this._currentPlayer + 0;
        this._turn();
      }
    } else {
      this._winSequence(moveRC, won);
    }
  }

  // Check if it's a draw knowing it's not a win
  _isDraw() {
    for (let i = 0, r = this.board.played.length; i < r; i++) {
      for (let j = 0, c = this.board.played[i].length; j < c; j++) {
        if (this.board.played[i][j] === 0) {
          return false;
        }
      }
    }
    return true;
  }

  // Returns whether the win is a row (r), a diagonal (d1 or d2) or a column (c) or not winning (empty string)
  winningPattern(moveRC) {
    if (this._checkDiagonal1(moveRC)) {
      return 'd1';
    }
    if (this._checkDiagonal2(moveRC)) {
      return 'd2';
    }
    if (this._checkRow(moveRC)) {
      return 'r';
    }
    if (this._checkColumn(moveRC)) {
        return 'c';
    }
    // Not won
    return '';
  }

  _checkDiagonal1(moveRC) {
    if (moveRC[0] === moveRC[1]) {
      let diag1 = 0;
      for (let i = 0; i < 3; i++) {
        diag1 += this.board.played[i][i];
        }
      return Math.abs(diag1) === 3;
    } else {
      return false;
    }
  }

  _checkDiagonal2(moveRC) {
    if (moveRC[0] === (2 - moveRC[1])) {
      let diag2 = 0;
      for (let i = 0; i < 3; i++) {
        diag2 += this.board.played[i][2 - i];
      }
      return Math.abs(diag2) === 3;
    } else {
      return false;
    }
  }

  _checkRow(moveRC) {
    let row = 0;
    for (let i = 0; i < 3; i++) {
      row += this.board.played[moveRC[0]][i];
    }
    return Math.abs(row) === 3;
  }

  _checkColumn(moveRC) {
    let col = 0;
    for (let i = 0; i < 3; i++){
      col += this.board.played[i][moveRC[1]];
    }
    return Math.abs(col) === 3;
  }

  _drawSequence() {
    document.getElementById('gameMsg').innerHTML = "It's a draw!";

  }

  _winSequence(moveRC, won) {
    this.board.won(...this._wonRC(moveRC, won));
    document.getElementById('gameMsg').innerHTML = 'You won! ' + won;
  }

  // Returns an array of startRC and stopRC giving the start and end square of the winning pattern
  _wonRC(moveRC, won) {
    let startRC = [],
      stopRC = [];
    switch (won) {
      case 'd1':
        startRC = [0, 0];
        stopRC = [2 ,2];
        break;
      case 'd2':
        startRC = [0, 2];
        stopRC = [2, 0];
        break;
      case 'r':
        startRC = [moveRC[0], 0];
        stopRC = [moveRC[0], 2];
        break;
      case 'c':
        startRC = [0, moveRC[1]];
        stopRC = [2, moveRC[1]];
        break;
    }
    return [startRC, stopRC];
  }
}

let app = new TicTacToeGame();
