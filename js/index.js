// Start of Tic Tac Toe JS
'use strict';

class ImperfectPath {
  constructor(delta) {
    this._delta = delta;
    this._path = undefined;
    this._pathDef = '';
  }

  get path() {
    return this._path;
  }

  // Random value between -delta/2 and +delta/2 - But not too small
  _rnd() {
    return this._delta * (-0.5 + (Math.random() + 0.2) / 1.2);
  }

  // Add the path to an svg and hides it - Offset controls the length of the path
  addPathToSvg(svg, offset = 10) {
    if (this._path !== undefined) {
      throw ("Error: Path already added to an svg");
    }
    this._path = svg.append('path')
      .attr('d', this._pathDef)
      .attr('transform', this._transformPath())
      .attr('stroke-dasharray', offset)
      .attr('stroke-dashoffset', offset);
    return this._path;
  }

  // Draws the path over t ms.
  draw(t, renderCallback = () => {
    return;
  }) {
    return this._path.transition()
      .duration(t)
      .ease('linear')
      .attr('stroke-dashoffset', 0)
      .each('end', renderCallback);
  }
}

/* Imperfect circle using 4 cubic Bezier curves
Inspired by http://bl.ocks.org/patricksurry/11087975
Constructor parameter:
  x, y: Coordinates of the circle (default to 0)
  r: radius of the circle (default to 1)
*/
class ImperfectCirclePath extends ImperfectPath {
  constructor(x = 0, y = 0, r = 1, delta = 1) {
    super(delta);
    this._x = x;
    this._y = y;
    this._r = r;
    this._dR = 0.05;
    this._thetaStart = 2 * Math.PI * Math.random();
    this._dTheta = 0.2;
    this._ratio = 0.9;
    this._angle = Math.PI * Math.random();
    this._pathDef = this._imperfectCircle();
  }

  draw(t = 400, renderCallback = undefined) {
    return super.draw(t, renderCallback);
  }

  _imperfectCircle() {
    const c = 0.551915024494,
      beta = Math.atan(c),
      d = Math.sqrt(c * c + 1 * 1);
    let r = this._r,
      theta = this._thetaStart,
      path = 'M';

    // Move to P0
    path += [r * Math.sin(theta), r * Math.cos(theta)];
    // Control point P1
    path += ' C' + [d * r * Math.sin(theta + beta), d * r * Math.cos(theta + beta)];

    // For each quarter turn
    for (let i = 0; i < 4; i++) {
      // Angle overshoot/undershoot
      theta += Math.PI / 2 * (1 + Math.random() * this._dTheta);
      // Radius overshoot/undershoot
      r *= (1 + Math.random() * this._dR);
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
class ImperfectLinePath extends ImperfectPath {
  constructor(x0 = 0, y0 = 0, x1 = 1, y1 = 0, delta = 0.6) {
    super(delta);
    this._x0 = x0;
    this._y0 = y0;
    this._x1 = x1;
    this._y1 = y1;
    this._pathDef = this._imperfectLine();
  }

  draw(t = 300, renderCallback = undefined) {
    return super.draw(t, renderCallback);
  }

  /* Imperfect horizontal line from [-1,0] to [1,0]
  Parameters: start and end angles in radians
  Return: d attribute of SVG path */
  _imperfectLine() {
    let xP1 = this._rnd(),
      xP2 = this._rnd(),
      yP1 = this._rnd(),
      yP2 = this._rnd();
    let path = 'M-1,0 C'; // The line starts at [-1, 0]
    // Control point P1
    path += [xP1, yP1];
    // Control point P2
    path += ' ' + [xP2, yP2];
    // Control point P3
    path += ' ' + [1, 0];
    return path;
  }

  _transformPath() {
    let length = Math.sqrt((this._x0 - this._x1) * (this._x0 - this._x1) + (this._y0 - this._y1) * (this._y0 - this._y1)),
      angle = Math.acos((this._x1 - this._x0) / length) * 180 / Math.PI;
    return ` translate (${0.5 * (this._x0 + this._x1)}, ${0.5 * (this._y0 + this._y1)}) rotate (${angle}) scale(${length / 2}, 1)`;
  }
}

/* Creates a cross - Default in square centered on 0 and of width of 2
Constructor parameters: center and width of the bounding square */
class ImperfectCrossPath extends ImperfectPath {
  constructor(x = 0, y = 0, w = 2, delta = 0.6) {
    super(delta);
    this._x = x;
    this._y = y;
    this._w = w;
    this._yMidStart = delta * (-0.5 + Math.random());
    this._yMidEnd = delta * (-0.5 + Math.random());
    this._xMidStart = delta * (-0.5 + Math.random());
    this._xMidEnd = delta * (-0.5 + Math.random());
    this._pathDef = this._imperfectCross();
  }

  addPathToSvg(svg) {
    super.addPathToSvg(svg);
    // Hide the junction line and create a symmetric effect on the right
    // This only works when the background color is known.
    svg.append('path')
      .attr('d', 'M-1.1,-1.2 L-0.9,-0.8 L-0.9,0.8 L-1.1,1.2 Z M1.1,-1.2 L0.9,-0.8 L0.9,0.8 L1.1,1.2 Z')
      .attr('stroke', 'none')
      .attr('fill', 'black')
      .attr('transform', this._transformPath());
    return this._path;
  }

  draw(t = 500, renderCallback = undefined) {
    return super.draw(t, renderCallback);
  }

  _imperfectCross() {
    let xP11 = this._rnd(),
      yP11 = this._rnd(),
      xP21 = this._rnd(),
      yP21 = this._rnd(),
      xP12 = this._rnd(),
      yP12 = this._rnd(),
      xP22 = this._rnd(),
      yP22 = this._rnd();
    // First stroke - P0
    let path = 'M1,-1 C';
    // First stroke - P1
    path += [xP11, yP11];
    // First stroke - P2
    path += ' ' + [xP21, yP21];
    // First stroke - P3
    path += ' ' + [-1, 1];
    // Second stroke - P0 - Junction line essential for the look of the stroke
    path += ' L-1,-1 C';
    // Second stroke - P1
    path += [xP12, yP12];
    // Second stroke - P2
    path += ' ' + [xP22, yP22];
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
  constructor(renderCallback) {
    // Init public variables
    this.svg = d3.select('#board');
    this.played = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];
    // Init private variables
    this._mask = document.getElementById('mask');
    this._board = {};
    this._board.topCorner = -4.5;
    this._board.bottomCorner = 4.5;
    this._board.boxWidth = 3;
    this._isCross = true; // Cross plays first
    // Init the board
    this._initBoard(renderCallback);
    this.moves = 0;
  }

  _initBoard(renderCallback) {
    this._disableClick();
    this._eraseBoard();
    this._displayGrid(renderCallback);
  }

  _eraseBoard() {
    this.svg.selectAll('path').remove();
  }

  _displayGrid(renderCallback) {
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
    this._draw(0, renderCallback);
  }

  _draw(n, renderCallback) {
    if (n < this._board.lines.length) {
      return this._board.lines[n].draw().each("end", () => {
        this._draw(n + 1, renderCallback);
      });
    } else {
      this._enableClick();
      renderCallback();
    }
  }

  /* Displays a nought at the x,y location */
  _displayNought(x, y, callback) {
      let n = new ImperfectCirclePath(x, y);
      this._chalkify(n.addPathToSvg(this.svg));
      n.draw().each('end', () => {
        this._enableClick();
        callback();
      });
      return n;
    }
    /* Displays a cross at the x,y location */
  _displayCross(x, y, callback) {
    let c = new ImperfectCrossPath(x, y);
    this._chalkify(c.addPathToSvg(this.svg));
    c.draw().each('end', () => {
      this._enableClick();
      callback();
    });
    return c;
  }


  /* Play a nought or a cross at a given row and column (0 indexed)*/
  play(moveRC, callback = this._renderCallback) {
    let r = moveRC[0],
      c = moveRC[1];
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
    this.moves++;
  }

  won(startRC, endRC) {
    // Wobbles the origins
    function wobbly(val) {
      return val * (0.85 + 0.15 * Math.random());
    }
    this._disableClick();
    let bStart = this._board.topCorner,
      bEnd = this._board.bottomCorner,
      l;
    if (startRC[0] == endRC[0]) {
      // The win is a row
      let aStart = this._board.topCorner + (startRC[0] + 0.5) * this._board.boxWidth;
      l = new ImperfectLinePath(wobbly(bStart), wobbly(aStart), wobbly(bEnd), wobbly(aStart));
    } else if (startRC[1] == endRC[1]) {
      // The win is a column
      let aStart = this._board.topCorner + (startRC[1] + 0.5) * this._board.boxWidth;
      l = new ImperfectLinePath(wobbly(aStart), wobbly(bStart), wobbly(aStart), wobbly(bEnd));
    } else if (startRC[0] == startRC[1] && endRC[0] == endRC[1]) {
      // The win is the first diagonal
      l = new ImperfectLinePath(wobbly(bStart), wobbly(bStart), wobbly(bEnd), wobbly(bEnd));
    } else {
      // The win is the second diagonal
      l = new ImperfectLinePath(wobbly(bEnd), wobbly(bStart), wobbly(bStart), wobbly(bEnd));
    }
    this._chalkify(l.addPathToSvg(this.svg));
    l.draw();
    return;
  }

  draw() {
    this._disableClick();
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
  constructor(game, id) {
    this._game = game;
    this._moveRC = [];
    this.id = id; // THe player's id 1 for cross, -1 for nought
  }
}

class HumanPlayer extends Player {
  constructor(game, id) {
    super(game, id);
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
class MinimaxComputerPlayer extends Player {
  constructor(game, id, level = 1) {
    super(game, id);
    this._depth = undefined;
    this._defineDepth(level);
  }

  get moveRC() {
    return this._moveRC;
  }

  // Play seqquence
  play() {
    this._initPlay();
    this._simulateClick();
  }

  _defineDepth(level) {
    switch (level) {
      case 1:
        this._depth = 1;
        break;
      case 2:
        this._depth = 2;
        break;
      case 3:
        this._depth = Infinity;
        break;
    }
  }

  _initPlay() {
    if (this._game.board.moves === 0) {
      this._moveRC = [1, 1];
    } else {
      this._minimax(this.id, []);
    }
  }

  // Minimax algorithm returning a score
  _minimax(turn, history) {
    let played = this._updateGame(history),
      depth = history.length,
      winner = TicTacToeGame.winner(played),
      isGameOver = TicTacToeGame.isDraw(played) || winner !== 0,
      scores = [],
      moves = [];

    if (isGameOver || depth > this._depth) {
      return this._score(winner, depth);
    }
    // Explore all the next moves
    moves = this._getAvailableMoves(played);
    for (let i = 0, l = moves.length; i < l; i++) {
      scores.push(this._minimax(-turn, history.concat([moves[i]])));
    }

    if (this.id == turn) {
      // Return the max score
      let maxScore = Math.max(...scores);
      if (depth === 0) {
        // We've found the best move
        let indexes = getAllIndexes(scores, maxScore);
        this._moveRC = moves[indexes[Math.floor(Math.random() * indexes.length)]];
      }
      return maxScore;
    } else {
      // Return the min score
      return Math.min(...scores);
    }

    function getAllIndexes(arr, val) {
      let indexes = [], i;
      for(i = 0; i < arr.length; i++) {
        if (arr[i] === val) {
          indexes.push(i);
        }
      }
      return indexes;
    }
  }

  _getAvailableMoves(played) {
    let s = played.length,
      moves = [];
    for (let i = 0; i < s; i++) {
      for (let j = 0; j < s; j++) {
        if (played[i][j] === 0) {
          moves.push([i, j]);
        }
      }
    }
    return moves;
  }

  // Note: either you must construct or deconstruct the game every time
  _updateGame(history) {
    // Cloning the board - Important to avoid messing up the board :o)
    let s = this._game.board.played.length,
      played = [],
      turn = this.id;
    for (let i = 0; i < s; i++) {
      played[i] = this._game.board.played[i].slice(0);
    }
    for (let i = 0, l = history.length; i < l; i++) {
      played[history[i][0]][history[i][1]] = turn;
      turn = -turn;
    }
    return played;
  }

  // Calculates the score depending on the winner state: 0, draw, 1, cross, -1, nought.
  _score(winner, depth) {
    if (winner === 0) {
      return 0;
    } else {
      // Returns a negative score if the player and the winner are different (depth is a max of 9)
      return (10 - depth) * winner * this.id;
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

class RandomComputerPlayer extends Player {
  constructor(game, id) {
    super(game, id);
  }

  get moveRC() {
    return this._moveRC;
  }

  // Play seqquence
  play() {
    this._playRandomMove();
    this._simulateClick();
  }

  _playRandomMove() {
    let i, j;
    do {
      i = Math.floor(Math.random() * 3);
      j = Math.floor(Math.random() * 3);
    } while (this._game.board.played[i][j] !== 0);
    this._moveRC = [i, j];
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

/* To initialise a new game:
game = new TicTacToeGame(endCallback); // Creates an instance with the callback to use when the game is over. The endCallback function takes the winner as argument: 1: x, 0: draw, -1 o
// Defines the player
game.crossPlayer = new Player(game, 1);
game.noughtPlayer = new Player(game, -1);
// Starts the first round
game.play()
*/
class TicTacToeGame {
  constructor(endCallback=() => {return;}) {
    this._player = [];
    this._currentPlayer = 0; // Value 0 or 1
    this._endCallback = endCallback;
    this._newTurnCallback = undefined;
    this.board = undefined;
  }

  get crossPlayer() {return this._player[0];}
  set crossPlayer(player) {
    this._player[0] = player;
  }

  get noughtPlayer() {return this._player[1];}
  set noughtPlayer(player) {
    this._player[1] = player;
  }

  play(newTurnCallback = () => {return;}) {
    this._newTurnCallback = newTurnCallback;
    if (this._player.length == 2) {
      this.board = new TicTacToeBoard(() => {
        this.board.svg.on("click", () => {
          this._evalMove();
        });
        this._turn(true);
      });
    } else {
      throw ('Error: players not defined.');
    }
  }

  // Run a turn of the game - Calls the turn callback if it's a proper turn, not just waiting for a legal move - Calls the newTurnCallback with the player 1: x, -1: o
  _turn(isNewTurn) {
    if (isNewTurn) {
      console.log(this._currentPlayer);
      this._newTurnCallback(this._currentPlayer ? -1 : 1);
    }
    this._player[this._currentPlayer].play();
  }

  // Evaluates whether the move is legal and processes it
  _evalMove() {
    let moveRC = this._player[this._currentPlayer].moveRC;
    if (this._isLegal(moveRC)) {
      this.board.play(moveRC, () => {
        this._checkWin(moveRC);
      });
    } else {
      // Just wait until a valid input comes
      this._turn(false);
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
        this._turn(true);
      }
    } else {
      this._winSequence(moveRC, won);
    }
  }

  // Returns true if there's no more space to play on the board
  static isDraw(played) {
    for (let i = 0, r = played.length; i < r; i++) {
      for (let j = 0, c = played[i].length; j < c; j++) {
        if (played[i][j] === 0) {
          return false;
        }
      }
    }
    return true;
  }

  _isDraw() {
    return TicTacToeGame.isDraw(this.board.played);
  }

  // Returns +1 or -1 if there's a winner, 0 if there isn't
  static winner(played) {
    let size = played.length; // Assumes square
    for (let i = 0; i < size; i++) {
      // Row
      if (this.isWinRow([i, 0], played)) {
        return played[i][0];
      }
      // column
      if (this.isWinColumn([0, i], played)) {
        return played[0][i];
      }
    }
    // 1st diagonal
    if (this.isWinDiagonal1([0, 0], played)) {
      return played[0][0];
    }
    if (this.isWinDiagonal2([size - 1, 0], played)) {
      return played[size - 1][0];
    }
    // No win
    return 0;
  }

  // Returns whether the win is a row (r), a diagonal (d1 or d2) or a column (c) or not winning (empty string)
  winningPattern(moveRC) {
    if (this._isWinDiagonal1(moveRC)) {
      return 'd1';
    }
    if (this._isWinDiagonal2(moveRC)) {
      return 'd2';
    }
    if (this._isWinRow(moveRC)) {
      return 'r';
    }
    if (this._isWinColumn(moveRC)) {
      return 'c';
    }
    // Not won
    return '';
  }

  static isWinDiagonal1(moveRC, played) {
    if (moveRC[0] === moveRC[1]) {
      let diag1 = 0;
      for (let i = 0; i < 3; i++) {
        diag1 += played[i][i];
      }
      return Math.abs(diag1) === 3;
    } else {
      return false;
    }
  }

  _isWinDiagonal1(moveRC) {
    return TicTacToeGame.isWinDiagonal1(moveRC, this.board.played);
  }

  static isWinDiagonal2(moveRC, played) {
    if (moveRC[0] === (2 - moveRC[1])) {
      let diag2 = 0;
      for (let i = 0; i < 3; i++) {
        diag2 += played[i][2 - i];
      }
      return Math.abs(diag2) === 3;
    } else {
      return false;
    }
  }

  _isWinDiagonal2(moveRC) {
    return TicTacToeGame.isWinDiagonal2(moveRC, this.board.played);
  }

  static isWinRow(moveRC, played) {
    let row = 0;
    for (let i = 0; i < 3; i++) {
      row += played[moveRC[0]][i];
    }
    return Math.abs(row) === 3;
  }

  _isWinRow(moveRC) {
    return TicTacToeGame.isWinRow(moveRC, this.board.played);
  }

  static isWinColumn(moveRC, played) {
    let col = 0;
    for (let i = 0; i < 3; i++) {
      col += played[i][moveRC[1]];
    }
    return Math.abs(col) === 3;
  }

  _isWinColumn(moveRC) {
    return TicTacToeGame.isWinColumn(moveRC, this.board.played);
  }

  _drawSequence() {
    this.board.draw();
    this._endCallback(0);
  }

  _winSequence(moveRC, won) {
    this.board.won(...this._wonRC(moveRC, won));
    this._endCallback(TicTacToeGame.winner(this.board.played));
  }

  // Returns an array of startRC and stopRC giving the start and end square of the winning pattern
  _wonRC(moveRC, won) {
    let startRC = [],
      stopRC = [];
    switch (won) {
      case 'd1':
        startRC = [0, 0];
        stopRC = [2, 2];
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

/* Creates a slider given its location centre and a width
Properties :
  clickable: UI rectangle on top of the graphic
  value: the value pointed by the cursor
*/
class slider {
  constructor(svg, x, y, width, uiID = '', nSteps = 4) {
    this._svg = svg;
    this._isMouseDown = false;
    this._xStart = x - width / 2;
    this.sliderGroup = this._svg.append('g');
    // Main line
    let line = new ImperfectLinePath(this._xStart, y, this._xStart + width, y, 0);
    line.addPathToSvg(this.sliderGroup);
    line.draw(0);
    // Notches
    this._space = width / (nSteps - 1);
    let height = width / 20;
    let notch;
    for (let i = 0; i < nSteps; i++) {
      notch = new ImperfectLinePath(this._xStart + i * this._space, y - height, this._xStart + i * this._space, y + height, 0);
      notch.addPathToSvg(this.sliderGroup);
      notch.draw(0);
    }

    // Cursor
    this._cursorGroup = this.sliderGroup.append("g");
    let cursor = new ImperfectCirclePath(this._xStart, y, 1.5 * height, 1);
    cursor.addPathToSvg(this._cursorGroup);
    cursor.draw(0);

    // Styling
    this.sliderGroup
      .attr('stroke', 'white')
      .attr('fill', 'none')
      .attr('stroke-width', 0.1)
      .attr('filter', 'url(#chalkTexture)');
    // UI
    this.clickable = this.sliderGroup.append('rect')
      .attr('class', 'uiClick')
      .attr('id', uiID)
      .attr('x', this._xStart - 0.4 * this._space)
      .attr('y', y - 3 * height)
      .attr('width', width + 0.8 * this._space)
      .attr('height', 6 * height)
      .attr('stroke', 'transparent')
      .attr('fill', 'transparent')
      // .on('click', () => {console.log(this._snapCursor(this);})
      .on('mouseup.slider', () => {
        this._snapCursor(this);
        this._isMouseDown = false;
      })
      .on('mousedown.slider', () => {
        this._isMouseDown = true;
      })
      .on('mousemove.slider', () => {
        this._mouseMove(this);
      });

    // Slider value
    this._xTrans = 0;
    this._value = 0;
  }

  get value() {
    return this._xTrans / this._space;
  }

  _mouseMove(self) {
    if (self._isMouseDown) {
      self._snapCursor(self);
    }
  }

  _snapCursor(self) {
    let mouseXY = d3.mouse(self._svg.node());
    this._xTrans = Math.round((mouseXY[0] - self._xStart) / self._space) * self._space;
    self._cursorGroup.attr('transform', `translate (${this._xTrans} 0)`);
  }
}

class TicTacToeInterface {
  constructor() {
    this.svg = d3.select('#ui');
    this.nought = {};
    this.cross = {};
    this.nought.slider = undefined;
    this.cross.slider = undefined;
    // Player levels : -1 -> human, 0-3 -> AI
    this.cross.player = -1;
    this.nought.player = 0;
    this._levels = ['Wise cookie', 'Geeky monkey', 'Sober human', 'Spaced AI'];
    this._drawGrid(this.svg); // DEBUG
    this._displayInterface();
    this._createUI();
  }

  _displayInterface() {
    // Cross symbol
    this.cross.symbol = new ImperfectCrossPath(-4.5, 5.8, 1);
    this.cross.symbol.addPathToSvg(this.svg)
      .attr('stroke', 'white')
      .attr('fill', 'none')
      .attr('stroke-width', 0.15)
      .attr('filter', 'url(#chalkTexture)');
    this.cross.symbol.draw(0);
    // Cross Human
    this.svg.append('text')
      .attr('class', 'uiText')
      .text('Human')
      .attr('x', '-4.5')
      .attr('y', '7.4');
    // Cross computer
    this.svg.append('text')
      .attr('class', 'uiText')
      .text('Computer')
      .attr('x', '-4.5')
      .attr('y', '8.5');
    // Slider cross
    this.cross.levelDisplay = this.svg.append('text')
      .attr('class', 'uiText')
      .attr('x', '-4.5')
      .attr('y', '10.5')
      .html(this._levels[0]);
    this.cross.slider = new slider(this.svg, -4.5, 9.5, 3.5, 'sliderClickCross');
    this.cross.slider.clickable
      .on('click.level', () => {
        this._updateAILevel(this.cross);
      })
      .on('mousemove.level', () => {
        this._updateAILevel(this.cross);
      });
    // Cross is human at first
    this._hideSlider(this.cross);

    // Nought symbol
    this.nought.symbol = new ImperfectCirclePath(4.5, 5.8, 0.5);
    this.nought.symbol.addPathToSvg(this.svg)
      .attr('stroke', 'white')
      .attr('fill', 'none')
      .attr('stroke-width', 0.1)
      .attr('filter', 'url(#chalkTexture)');
    this.nought.symbol.draw(0);
    // Nought human
    this.svg.append('text')
      .attr('class', 'uiText')
      .text('Human')
      .attr('x', '4.5')
      .attr('y', '7.4');
    // Nought computer
    this.svg.append('text')
      .attr('class', 'uiText')
      .text('Computer')
      .attr('x', '4.5')
      .attr('y', '8.5');
    // Nought slider
    this.nought.levelDisplay = this.svg.append('text')
      .attr('class', 'uiText')
      .attr('x', '4.5')
      .attr('y', '10.5')
      .html(this._levels[0]);
    this.nought.slider = new slider(this.svg, 4.5, 9.5, 3.5, 'sliderClickNought');
    this.nought.slider.clickable
      .on('click.level', () => {
        this._updateAILevel(this.nought);
      })
      .on('mousemove.level', () => {
        this._updateAILevel(this.nought);
      });

    // Selection rectangles
    // Cross human
    this.svg.append('rect')
      .attr('visibility', 'visible')
      .attr('class', 'uiText')
      .attr('id', 'crossSelectHuman')
      .attr('x', '-6')
      .attr('y', '6.8')
      .attr('width', '3.2')
      .attr('height', '1')
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', '0.1');
    // Cross computer
    this.svg.append('rect')
      .attr('visibility', 'hidden')
      .attr('class', 'uiText')
      .attr('id', 'crossSelectComputer')
      .attr('x', '-6.3')
      .attr('y', '7.8')
      .attr('width', '3.6')
      .attr('height', '1')
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', '0.1');

    // Nought human
    this.svg.append('rect')
      .attr('visibility', 'hidden')
      .attr('class', 'uiText')
      .attr('id', 'noughtSelectHuman')
      .attr('x', '3')
      .attr('y', '6.8')
      .attr('width', '3.2')
      .attr('height', '1')
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', '0.1');
    // Nought computer
    this.svg.append('rect')
      .attr('visibility', 'visible')
      .attr('class', 'uiText')
      .attr('id', 'noughtSelectComputer')
      .attr('x', '2.7')
      .attr('y', '7.8')
      .attr('width', '3.6')
      .attr('height', '1')
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', '0.1');

    // Arrows
    this.svg.append('text')
      .attr('visibility', 'hidden')
      .attr('class', 'uiText')
      .attr('id', 'crossArrow')
      .text('<-')
      .attr('x', '-3.1')
      .attr('y', '5.9');
    this.svg.append('text')
      .attr('visibility', 'hidden')
      .attr('class', 'uiText')
      .attr('id', 'noughtArrow')
      .text('->')
      .attr('x', '3.0')
      .attr('y', '5.9');

    // Message
    this.svg.append('text')
      .attr('class', 'uiText')
      .attr('id', 'message')
      .text('Play!')
      .attr('x', '0')
      .attr('y', '6');
    this.svg.append('rect')
      .attr('class', 'uiText')
      .attr('id', 'playMessageRect')
      .attr('x', '-2')
      .attr('y', '5')
      .attr('width', '4')
      .attr('height', '1.5')
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', '0.1');

    // Styling
    this.svg.selectAll('.uiText')
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Permanent Marker')
      .attr('font-size', '0.7')
      .attr('filter', 'url(#chalkTexture)');
  }

  _createUI() {
    this.svg.append('rect')
      .attr('class', 'uiClick')
      .attr('id', 'crossClickHuman')
      .attr('x', '-6.5')
      .attr('y', '6.8')
      .attr('width', '4')
      .attr('height', '1.05');
    this.svg.append('rect')
      .attr('class', 'uiClick')
      .attr('id', 'crossClickComputer')
      .attr('x', '-6.5')
      .attr('y', '7.85')
      .attr('width', '4')
      .attr('height', '1.05');
    this.svg.append('rect')
      .attr('class', 'uiClick')
      .attr('id', 'noughtClickHuman')
      .attr('x', '2.5')
      .attr('y', '6.8')
      .attr('width', '4')
      .attr('height', '1.05');
    this.svg.append('rect')
      .attr('class', 'uiClick')
      .attr('id', 'noughtClickComputer')
      .attr('x', '2.5')
      .attr('y', '7.85')
      .attr('width', '4')
      .attr('height', '1.05');
    this.svg.append('rect')
      .attr('class', 'uiClick')
      .attr('id', 'playMessage')
      .attr('x', '-2')
      .attr('y', '5')
      .attr('width', '4')
      .attr('height', '1.5')
      .on('mousedown.visual', () => {
        d3.select('#playMessageRect')
          .attr('fill', 'white')
          .attr('opacity', '0.5');
      })
      .on('mouseup.visual', () => {
        d3.select('#playMessageRect')
          .attr('fill', 'none')
          .attr('opacity', '1');
      });

    d3.selectAll('.uiClick')
      .attr('stroke', 'transparent')
      .attr('stroke-width', 0.01)
      .attr('fill', 'transparent')
      .on('mouseup', () => {
        this._clickHandler(d3.event);
      });
  }

  _clickHandler(event) {
    switch (event.toElement.id) {
      case 'crossClickHuman':
        d3.select('#crossSelectHuman').attr('visibility', 'visible');
        d3.select('#crossSelectComputer').attr('visibility', 'hidden');
        this.cross.player = -1;
        this._hideSlider(this.cross);
        break;
      case 'crossClickComputer':
        d3.select('#crossSelectHuman').attr('visibility', 'hidden');
        d3.select('#crossSelectComputer').attr('visibility', 'visible');
        this.cross.player = this.cross.slider.value;
        this._showSlider(this.cross);
        break;
      case 'noughtClickHuman':
        d3.select('#noughtSelectHuman').attr('visibility', 'visible');
        d3.select('#noughtSelectComputer').attr('visibility', 'hidden');
        this.nought.player = -1;
        this._hideSlider(this.nought);
        break;
      case 'noughtClickComputer':
        d3.select('#noughtSelectHuman').attr('visibility', 'hidden');
        d3.select('#noughtSelectComputer').attr('visibility', 'visible');
        this.nought.player = this.nought.slider.value;
        this._showSlider(this.nought);
        break;
      case 'playMessage':
        this._launchPlay();
        break;
      default:
        console.log(event.toElement.id);
    }
  }

  _hideSlider(symbol) {
    symbol.slider.sliderGroup.attr('visibility', 'hidden');
    symbol.levelDisplay.attr('visibility', 'hidden');
  }

  _showSlider(symbol) {
    symbol.slider.sliderGroup.attr('visibility', 'visible');
    symbol.levelDisplay.attr('visibility', 'visible');
  }


  _updateAILevel(symbol) {
    symbol.levelDisplay.html(this._levels[symbol.slider.value]);
    // If we're here, it's because we're playing with an AI.
    symbol.player = symbol.slider.value;
  }

  _launchPlay() {
    // Create the game
    let game = new TicTacToeGame((w) => {this._endGame(w);});
    // Define players
    game.crossPlayer = this._definePlayer(this.cross.player, game, 1);
    game.noughtPlayer = this._definePlayer(this.nought.player, game, -1);
    game.play((p) => {this._newTurn(p);});
  }

  // return a player depending on the playerValue (the level), the game and the sign (1 -> cross, -1 -> nought)
  _definePlayer(playerValue, game, sign){
    let thePlayer;
    switch (playerValue) {
      case -1:
        thePlayer = new HumanPlayer(game, sign);
        break;
      case 0:
        thePlayer = new RandomComputerPlayer(game, sign);
        break;
      case 1:
      case 2:
      case 3:
        thePlayer = new MinimaxComputerPlayer(game, sign, playerValue);
        break;
    }
    return thePlayer;
  }

  // End game behaviour - winner is 1 for X, 0 for draw and -1 for o
  _endGame(winner) {
    d3.select('#noughtArrow').attr('visibility', 'hidden');
    d3.select('#crossArrow').attr('visibility', 'hidden');
    if (winner === 0) {
      // Draw
      this._msg("It's a draw");
    } else {
      // Winner!
      if (winner == 1) {
        this._msg('Cross wins');
      } else {
        this._msg('Nought wins');
      }
    }
  }

  _newTurn(player) {
    if (player == 1) {
      d3.select('#noughtArrow').attr('visibility', 'hidden');
      d3.select('#crossArrow').attr('visibility', 'visible');
    } else {
      d3.select('#noughtArrow').attr('visibility', 'visible');
      d3.select('#crossArrow').attr('visibility', 'hidden');
    }
  }

  // DEBUG
  _msg(text) {
    document.getElementById('gameMsg').innerHTML = text;
  }
  _drawGrid(svg) {
    let viewBox = svg.attr('viewBox').split(' ').map(Number),
      x0 = viewBox[0],
      x1 = viewBox[0] + viewBox[2],
      y0 = viewBox[1],
      y1 = viewBox[1] + viewBox[3];
    for (let x = x0; x < x1; x++) {
      svg.append('path')
        .attr('d', `M${x},${y0} L${x},${y1}`)
        .attr('stroke', 'cyan')
        .attr('stroke-width', 0.01);
      svg.append('text')
        .text(x)
        .attr("x", x + 0.1)
        .attr("y", y0 + 0.2)
        .attr("font-size", 0.24)
        .attr("fill", 'cyan');
    }
    for (let y = y0; y < y1; y++) {
      svg.append('path')
        .attr('d', `M${x0},${y} L${x1},${y}`)
        .attr('stroke', 'cyan')
        .attr('stroke-width', 0.01);
      svg.append('text')
        .text(y)
        .attr("x", x0 + 0.1)
        .attr("y", y - 0.2)
        .attr("font-size", 0.24)
        .attr("fill", 'cyan');
    }
  }

}

let app = new TicTacToeInterface();
