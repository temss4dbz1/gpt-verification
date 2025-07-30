const cells = document.querySelectorAll('.cell');
const statusDiv = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');

let board = ["", "", "", "", "", "", "", "", ""];
let isGameOver = false;

cells.forEach((cell, idx) => {
  cell.addEventListener('click', () => handleMove(idx));
});

restartBtn.addEventListener('click', resetGame);

function handleMove(index) {
  if (board[index] !== "" || isGameOver) return;

  board[index] = "X";
  cells[index].innerText = "X";

  if (checkWin("X")) {
    statusDiv.innerText = "You win! 🎉";
    isGameOver = true;
    return;
  }

  if (board.every(cell => cell !== "")) {
    statusDiv.innerText = "It's a draw!";
    isGameOver = true;
    return;
  }

  aiMove();
}

function aiMove() {
  // Pick random empty cell
  const emptyIndices = board.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
  const choice = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  
  board[choice] = "O";
  cells[choice].innerText = "O";

  if (checkWin("O")) {
    statusDiv.innerText = "AI wins! 🤖";
    isGameOver = true;
    return;
  }

  if (board.every(cell => cell !== "")) {
    statusDiv.innerText = "It's a draw!";
    isGameOver = true;
  }
}

function checkWin(player) {
  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // columns
    [0,4,8],[2,4,6]          // diagonals
  ];

  return winPatterns.some(pattern =>
    pattern.every(idx => board[idx] === player)
  );
}

function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  isGameOver = false;
  cells.forEach(cell => cell.innerText = "");
  statusDiv.innerText = "Your turn!";
}
