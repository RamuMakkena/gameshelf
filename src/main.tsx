import { CSSProperties, StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, FlipHorizontal, Grid2X2, Home, RotateCcw, RotateCw, Shuffle, Undo2 } from 'lucide-react';
import './styles.css';

type Route = 'home' | 'tic-tac-toe' | 'memory-match' | 'wooden-solitaire' | 'connect-four' | 'genius-square';
type Mark = 'X' | 'O';
type Square = Mark | null;
type ConnectDisc = 'red' | 'yellow';
type ConnectCell = ConnectDisc | null;
type ConnectMode = 'system' | 'players';
type ConnectDifficulty = 'easy' | 'medium' | 'hard';
type MemoryCard = {
  id: number;
  value: string;
  matched: boolean;
};
type SolitaireBoard = Record<string, boolean>;
type SolitaireState = {
  board: SolitaireBoard;
  captured: number;
};
type Hole = {
  id: string;
  row: number;
  col: number;
};
type GeniusPiece = {
  id: string;
  name: string;
  color: string;
  cells: Array<[number, number]>;
};
type GeniusPlacement = {
  pieceId: string;
  origin: [number, number];
  cells: Array<[number, number]>;
};
type GeniusState = {
  blockers: string[];
  placements: GeniusPlacement[];
};

const games: Array<{ route: Route; title: string; description: string }> = [
  {
    route: 'tic-tac-toe',
    title: 'Tic Tac Toe',
    description: 'Place three marks in a row before the other player.',
  },
  {
    route: 'memory-match',
    title: 'Memory Match',
    description: 'Flip cards and find every matching pair.',
  },
  {
    route: 'wooden-solitaire',
    title: 'Wooden Solitaire',
    description: 'Jump marbles into open holes until no moves remain.',
  },
  {
    route: 'connect-four',
    title: 'Connect 4',
    description: 'Drop red and yellow discs to connect four in a row.',
  },
  {
    route: 'genius-square',
    title: 'Genius Square',
    description: 'Fit every puzzle piece around seven blockers.',
  },
];

const solitaireHoles = createSolitaireHoles();
const geniusPieces: GeniusPiece[] = [
  { id: 'a', name: 'Four Bar 1', color: '#2c7a7b', cells: [[0, 0], [0, 1], [0, 2], [0, 3]] },
  { id: 'b', name: 'Z Four', color: '#c7472f', cells: [[0, 0], [0, 1], [1, 1], [1, 2]] },
  { id: 'c', name: 'Square', color: '#d4a12c', cells: [[0, 0], [0, 1], [1, 0], [1, 1]] },
  { id: 'd', name: 'L Four', color: '#31515a', cells: [[0, 0], [1, 0], [2, 0], [2, 1]] },
  { id: 'e', name: 'T Four', color: '#8e5bb8', cells: [[0, 0], [0, 1], [0, 2], [1, 1]] },
  { id: 'f', name: 'Three', color: '#5b8c3a', cells: [[0, 0], [0, 1], [0, 2]] },
  { id: 'g', name: 'L Three', color: '#d45d87', cells: [[0, 0], [1, 0], [1, 1]] },
  { id: 'h', name: 'Domino', color: '#4f6fb8', cells: [[0, 0], [0, 1]] },
  { id: 'i', name: 'Single', color: '#7b4b25', cells: [[0, 0]] },
];

function getInitialRoute(): Route {
  const route = window.location.hash.replace('#/', '') as Route;
  return games.some((game) => game.route === route) ? route : 'home';
}

function setHash(route: Route) {
  window.location.hash = route === 'home' ? '/' : `/${route}`;
}

function App() {
  const [route, setRoute] = useState<Route>(getInitialRoute);

  useEffect(() => {
    const handleHashChange = () => setRoute(getInitialRoute());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  function navigate(nextRoute: Route) {
    setRoute(nextRoute);
    setHash(nextRoute);
  }

  return (
    <main className="app-shell">
      {route === 'home' ? (
        <GamesHome onOpen={navigate} />
      ) : (
        <GameFrame route={route} onHome={() => navigate('home')} />
      )}
    </main>
  );
}

function GamesHome({ onOpen }: { onOpen: (route: Route) => void }) {
  return (
    <section className="home-page">
      <div className="home-heading">
        <p className="eyebrow">Simple browser games</p>
        <h1>Board Games</h1>
      </div>

      <div className="game-grid">
        {games.map((game) => (
          <button className="game-card" key={game.route} onClick={() => onOpen(game.route)}>
            <span className="game-card-icon">
              <Grid2X2 size={26} aria-hidden="true" />
            </span>
            <span>
              <strong>{game.title}</strong>
              <small>{game.description}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function GameFrame({ route, onHome }: { route: Route; onHome: () => void }) {
  const game = games.find((item) => item.route === route);

  return (
    <section className="game-page">
      <button className="home-link" onClick={onHome}>
        <ArrowLeft size={18} aria-hidden="true" />
        All games
      </button>

      {route === 'tic-tac-toe' && <TicTacToe title={game?.title ?? 'Tic Tac Toe'} onHome={onHome} />}
      {route === 'memory-match' && <MemoryMatch title={game?.title ?? 'Memory Match'} onHome={onHome} />}
      {route === 'wooden-solitaire' && <WoodenSolitaire title={game?.title ?? 'Wooden Solitaire'} onHome={onHome} />}
      {route === 'connect-four' && <ConnectFour title={game?.title ?? 'Connect 4'} onHome={onHome} />}
      {route === 'genius-square' && <GeniusSquare title={game?.title ?? 'Genius Square'} onHome={onHome} />}
    </section>
  );
}

function GameToolbar({
  title,
  status,
  canUndo,
  onUndo,
  onReset,
  onHome,
}: {
  title: string;
  status: string;
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
  onHome: () => void;
}) {
  return (
    <header className="game-toolbar">
      <div>
        <h1>{title}</h1>
        <p>{status}</p>
      </div>
      <div className="toolbar-actions">
        <button onClick={onUndo} disabled={!canUndo} title="Undo last step">
          <Undo2 size={18} aria-hidden="true" />
          Undo
        </button>
        <button onClick={onReset} title="Reset game">
          <RotateCcw size={18} aria-hidden="true" />
          Reset
        </button>
        <button onClick={onHome} title="See all games">
          <Home size={18} aria-hidden="true" />
          Games
        </button>
      </div>
    </header>
  );
}

function TicTacToe({ title, onHome }: { title: string; onHome: () => void }) {
  const [history, setHistory] = useState<Square[][]>([Array(9).fill(null)]);
  const board = history[history.length - 1];
  const nextMark: Mark = board.filter(Boolean).length % 2 === 0 ? 'X' : 'O';
  const winner = getWinner(board);
  const isDraw = !winner && board.every(Boolean);
  const status = winner ? `${winner} wins` : isDraw ? 'Draw game' : `${nextMark} to move`;

  function play(index: number) {
    if (board[index] || winner) return;
    const nextBoard = [...board];
    nextBoard[index] = nextMark;
    setHistory((steps) => [...steps, nextBoard]);
  }

  return (
    <>
      <GameToolbar
        title={title}
        status={status}
        canUndo={history.length > 1}
        onUndo={() => setHistory((steps) => steps.slice(0, -1))}
        onReset={() => setHistory([Array(9).fill(null)])}
        onHome={onHome}
      />

      <div className="tic-board" aria-label="Tic Tac Toe board">
        {board.map((square, index) => (
          <button key={index} className="tic-square" onClick={() => play(index)} aria-label={`Square ${index + 1}`}>
            {square}
          </button>
        ))}
      </div>
    </>
  );
}

function getWinner(board: Square[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }

  return null;
}

function MemoryMatch({ title, onHome }: { title: string; onHome: () => void }) {
  const [history, setHistory] = useState<MemoryCard[][]>(() => [createMemoryCards()]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const cards = history[history.length - 1];
  const matchedCount = cards.filter((card) => card.matched).length;
  const status = matchedCount === cards.length ? 'All pairs found' : `${matchedCount / 2} of ${cards.length / 2} pairs`;

  function flip(id: number) {
    const card = cards.find((item) => item.id === id);
    if (!card || card.matched || flipped.includes(id) || flipped.length === 2) return;

    const nextFlipped = [...flipped, id];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      const [first, second] = nextFlipped.map((cardId) => cards.find((item) => item.id === cardId));
      if (first && second && first.value === second.value) {
        const nextCards = cards.map((item) => (nextFlipped.includes(item.id) ? { ...item, matched: true } : item));
        setHistory((steps) => [...steps, nextCards]);
        setFlipped([]);
      } else {
        window.setTimeout(() => setFlipped([]), 650);
      }
    }
  }

  function undo() {
    setFlipped([]);
    setHistory((steps) => (steps.length > 1 ? steps.slice(0, -1) : steps));
  }

  function reset() {
    setFlipped([]);
    setHistory([createMemoryCards()]);
  }

  return (
    <>
      <GameToolbar title={title} status={status} canUndo={history.length > 1} onUndo={undo} onReset={reset} onHome={onHome} />

      <div className="memory-board" aria-label="Memory Match board">
        {cards.map((card) => {
          const isVisible = card.matched || flipped.includes(card.id);
          return (
            <button
              key={card.id}
              className={`memory-card ${isVisible ? 'is-visible' : ''}`}
              onClick={() => flip(card.id)}
              aria-label={isVisible ? `Card ${card.value}` : 'Hidden card'}
            >
              {isVisible ? card.value : ''}
            </button>
          );
        })}
      </div>
    </>
  );
}

function createMemoryCards() {
  const values = ['A', 'B', 'C', 'D', 'E', 'F'];
  const cards = values.flatMap((value, index) => [
    { id: index * 2, value, matched: false },
    { id: index * 2 + 1, value, matched: false },
  ]);

  return cards
    .map((card) => ({ card, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ card }) => card);
}

function WoodenSolitaire({ title, onHome }: { title: string; onHome: () => void }) {
  const [history, setHistory] = useState<SolitaireState[]>(() => [createSolitaireState()]);
  const [selected, setSelected] = useState<string | null>(null);
  const state = history[history.length - 1];
  const marblesLeft = Object.values(state.board).filter(Boolean).length;
  const movesAvailable = hasSolitaireMoves(state.board);
  const status = movesAvailable
    ? selected
      ? 'Choose an empty landing hole'
      : `${marblesLeft} marbles left`
    : marblesLeft === 1
      ? 'Game over: one marble left'
      : `Game over: ${marblesLeft} marbles left`;

  function play(hole: Hole) {
    const hasMarble = state.board[hole.id];

    if (!selected) {
      if (hasMarble && movesAvailable) setSelected(hole.id);
      return;
    }

    if (selected === hole.id) {
      setSelected(null);
      return;
    }

    if (hasMarble) {
      setSelected(hole.id);
      return;
    }

    const move = getSolitaireMove(state.board, selected, hole.id);
    if (!move) return;

    setHistory((steps) => [
      ...steps,
      {
        board: {
          ...state.board,
          [selected]: false,
          [move.jumped]: false,
          [hole.id]: true,
        },
        captured: state.captured + 1,
      },
    ]);
    setSelected(null);
  }

  function undo() {
    setSelected(null);
    setHistory((steps) => (steps.length > 1 ? steps.slice(0, -1) : steps));
  }

  function reset() {
    setSelected(null);
    setHistory([createSolitaireState()]);
  }

  return (
    <>
      <GameToolbar title={title} status={status} canUndo={history.length > 1} onUndo={undo} onReset={reset} onHome={onHome} />

      <div className="solitaire-table">
        <div className="wooden-board" aria-label="Wooden Solitaire board">
          <div className="rim-marbles" aria-label={`${state.captured} captured marbles`}>
            {Array.from({ length: state.captured }, (_, index) => (
              <span
                key={index}
                className={`captured-marble ${index === state.captured - 1 ? 'is-new' : ''}`}
                style={getRimMarbleStyle(index)}
              />
            ))}
          </div>

          {solitaireHoles.map((hole) => {
            const hasMarble = state.board[hole.id];
            const canLand = selected ? Boolean(getSolitaireMove(state.board, selected, hole.id)) : false;
            return (
              <button
                key={hole.id}
                className={`solitaire-hole ${selected === hole.id ? 'is-selected' : ''} ${canLand ? 'can-land' : ''}`}
                style={{ gridRow: hole.row + 1, gridColumn: hole.col + 1 }}
                onClick={() => play(hole)}
                aria-label={hasMarble ? `Marble at row ${hole.row + 1}, column ${hole.col + 1}` : `Empty hole at row ${hole.row + 1}, column ${hole.col + 1}`}
              >
                {hasMarble && <span className="marble" />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function getRimMarbleStyle(index: number): CSSProperties {
  const angle = (112 + index * 11.25) * (Math.PI / 180);
  const radius = 48;

  return {
    left: `${50 + Math.cos(angle) * radius}%`,
    top: `${50 + Math.sin(angle) * radius}%`,
  };
}

function createSolitaireHoles(): Hole[] {
  const holes: Hole[] = [];

  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      if (row >= 2 && row <= 4 || col >= 2 && col <= 4) {
        holes.push({ id: getHoleId(row, col), row, col });
      }
    }
  }

  return holes;
}

function createSolitaireState(): SolitaireState {
  return {
    captured: 0,
    board: Object.fromEntries(solitaireHoles.map((hole) => [hole.id, hole.id !== getHoleId(3, 3)])),
  };
}

function getHoleId(row: number, col: number) {
  return `${row}-${col}`;
}

function parseHoleId(id: string) {
  const [row, col] = id.split('-').map(Number);
  return { row, col };
}

function getSolitaireMove(board: SolitaireBoard, fromId: string, toId: string) {
  if (!board[fromId] || board[toId] !== false) return null;

  const from = parseHoleId(fromId);
  const to = parseHoleId(toId);
  const rowDistance = to.row - from.row;
  const colDistance = to.col - from.col;
  const isStraightJump =
    (Math.abs(rowDistance) === 2 && colDistance === 0) || (Math.abs(colDistance) === 2 && rowDistance === 0);

  if (!isStraightJump) return null;

  const jumped = getHoleId(from.row + rowDistance / 2, from.col + colDistance / 2);
  return board[jumped] ? { jumped } : null;
}

function hasSolitaireMoves(board: SolitaireBoard) {
  return solitaireHoles.some((from) =>
    board[from.id]
      ? [
          getHoleId(from.row - 2, from.col),
          getHoleId(from.row + 2, from.col),
          getHoleId(from.row, from.col - 2),
          getHoleId(from.row, from.col + 2),
        ].some((toId) => getSolitaireMove(board, from.id, toId))
      : false,
  );
}

function ConnectFour({ title, onHome }: { title: string; onHome: () => void }) {
  const [mode, setMode] = useState<ConnectMode>('system');
  const [difficulty, setDifficulty] = useState<ConnectDifficulty>('medium');
  const [history, setHistory] = useState<ConnectCell[][]>(() => [createConnectBoard()]);
  const [currentPlayer, setCurrentPlayer] = useState<ConnectDisc>('red');
  const [systemThinking, setSystemThinking] = useState(false);
  const board = history[history.length - 1];
  const winner = getConnectWinner(board);
  const isDraw = !winner && getConnectOpenColumns(board).length === 0;
  const isSystemTurn = mode === 'system' && currentPlayer === 'yellow' && !winner && !isDraw;
  const status = winner
    ? `${winner === 'red' ? 'Red' : 'Yellow'} wins`
    : isDraw
      ? 'Draw game'
      : isSystemTurn
        ? 'Yellow is thinking'
        : `${currentPlayer === 'red' ? 'Red' : 'Yellow'} to move`;

  useEffect(() => {
    if (!isSystemTurn) return;

    setSystemThinking(true);
    const timer = window.setTimeout(() => {
      const column = chooseSystemConnectMove(board, difficulty);
      if (column !== null) dropDisc(column);
      setSystemThinking(false);
    }, 420);

    return () => {
      window.clearTimeout(timer);
      setSystemThinking(false);
    };
  }, [board, difficulty, isSystemTurn]);

  function reset(nextMode = mode, nextDifficulty = difficulty) {
    setMode(nextMode);
    setDifficulty(nextDifficulty);
    setHistory([createConnectBoard()]);
    setCurrentPlayer('red');
    setSystemThinking(false);
  }

  function dropDisc(column: number) {
    if (winner || isDraw || systemThinking && currentPlayer === 'red') return;

    const row = getConnectDropRow(board, column);
    if (row === null) return;

    const nextBoard = [...board];
    nextBoard[getConnectIndex(row, column)] = currentPlayer;
    setHistory((steps) => [...steps, nextBoard]);
    setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red');
  }

  function undo() {
    setSystemThinking(false);
    setHistory((steps) => {
      if (steps.length <= 1) return steps;
      const nextLength = steps.length - 1;
      setCurrentPlayer(nextLength % 2 === 1 ? 'red' : 'yellow');
      return steps.slice(0, -1);
    });
  }

  return (
    <>
      <GameToolbar
        title={title}
        status={status}
        canUndo={history.length > 1}
        onUndo={undo}
        onReset={() => reset()}
        onHome={onHome}
      />

      <div className="connect-controls" aria-label="Connect 4 settings">
        <div className="segmented-control">
          <button className={mode === 'system' ? 'is-active' : ''} onClick={() => reset('system', difficulty)}>
            Player vs System
          </button>
          <button className={mode === 'players' ? 'is-active' : ''} onClick={() => reset('players', difficulty)}>
            Player vs Player
          </button>
        </div>

        {mode === 'system' && (
          <div className="segmented-control">
            {(['easy', 'medium', 'hard'] as ConnectDifficulty[]).map((level) => (
              <button key={level} className={difficulty === level ? 'is-active' : ''} onClick={() => reset(mode, level)}>
                {level}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="connect-wrap">
        <div className="connect-drop-row" aria-label="Choose a column">
          {Array.from({ length: 7 }, (_, column) => (
            <button
              key={column}
              disabled={Boolean(winner) || isDraw || isSystemTurn || getConnectDropRow(board, column) === null}
              onClick={() => dropDisc(column)}
              aria-label={`Drop disc in column ${column + 1}`}
            />
          ))}
        </div>

        <div className="connect-board" aria-label="Connect 4 board">
          {board.map((cell, index) => (
            <div key={index} className="connect-slot">
              {cell && <span className={`connect-disc ${cell}`} />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function createConnectBoard(): ConnectCell[] {
  return Array(42).fill(null);
}

function getConnectIndex(row: number, column: number) {
  return row * 7 + column;
}

function getConnectDropRow(board: ConnectCell[], column: number) {
  for (let row = 5; row >= 0; row -= 1) {
    if (!board[getConnectIndex(row, column)]) return row;
  }

  return null;
}

function getConnectOpenColumns(board: ConnectCell[]) {
  return Array.from({ length: 7 }, (_, column) => column).filter((column) => getConnectDropRow(board, column) !== null);
}

function getConnectWinner(board: ConnectCell[]) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (let row = 0; row < 6; row += 1) {
    for (let column = 0; column < 7; column += 1) {
      const disc = board[getConnectIndex(row, column)];
      if (!disc) continue;

      for (const [rowStep, colStep] of directions) {
        const isWinner = [1, 2, 3].every((step) => {
          const nextRow = row + rowStep * step;
          const nextColumn = column + colStep * step;
          return nextRow >= 0 && nextRow < 6 && nextColumn >= 0 && nextColumn < 7
            ? board[getConnectIndex(nextRow, nextColumn)] === disc
            : false;
        });

        if (isWinner) return disc;
      }
    }
  }

  return null;
}

function chooseSystemConnectMove(board: ConnectCell[], difficulty: ConnectDifficulty) {
  const openColumns = getConnectOpenColumns(board);
  if (openColumns.length === 0) return null;

  const skillChance = difficulty === 'easy' ? 0.2 : difficulty === 'medium' ? 0.5 : 0.7;
  const shouldPlaySmart = Math.random() < skillChance;
  const smartMove = findConnectWinningColumn(board, 'yellow') ?? findConnectWinningColumn(board, 'red') ?? getStrongConnectColumn(board);

  if (shouldPlaySmart && smartMove !== null) return smartMove;

  const weakColumns = openColumns.filter((column) => column !== smartMove);
  const choices = weakColumns.length > 0 ? weakColumns : openColumns;
  return choices[Math.floor(Math.random() * choices.length)];
}

function findConnectWinningColumn(board: ConnectCell[], disc: ConnectDisc) {
  return getConnectOpenColumns(board).find((column) => {
    const row = getConnectDropRow(board, column);
    if (row === null) return false;

    const nextBoard = [...board];
    nextBoard[getConnectIndex(row, column)] = disc;
    return getConnectWinner(nextBoard) === disc;
  }) ?? null;
}

function getStrongConnectColumn(board: ConnectCell[]) {
  const openColumns = getConnectOpenColumns(board);
  const preferredColumns = [3, 2, 4, 1, 5, 0, 6];
  return preferredColumns.find((column) => openColumns.includes(column)) ?? null;
}

function GeniusSquare({ title, onHome }: { title: string; onHome: () => void }) {
  const [history, setHistory] = useState<GeniusState[]>(() => [createGeniusState()]);
  const [selectedPiece, setSelectedPiece] = useState('a');
  const [orientationIndex, setOrientationIndex] = useState(0);
  const state = history[history.length - 1];
  const occupied = getGeniusOccupiedCells(state);
  const placedCount = state.placements.length;
  const isSolved = occupied.size === 36;
  const status = isSolved ? 'Solved' : `${placedCount} of ${geniusPieces.length} pieces placed`;
  const selected = geniusPieces.find((piece) => piece.id === selectedPiece) ?? geniusPieces[0];
  const orientations = getGeniusPieceOrientations(selected);
  const selectedCells = orientations[orientationIndex % orientations.length];

  function place(row: number, col: number) {
    const placed = state.placements.find((item) =>
      item.cells.some(([cellRow, cellCol]) => cellRow === row && cellCol === col),
    );

    if (placed) {
      setHistory((steps) => [
        ...steps,
        {
          ...state,
          placements: state.placements.filter((item) => item.pieceId !== placed.pieceId),
        },
      ]);
      setSelectedPiece(placed.pieceId);
      setOrientationIndex(0);
      return;
    }

    if (state.blockers.includes(getGeniusCellId(row, col))) return;
    if (state.placements.some((item) => item.pieceId === selected.id)) return;

    const cells = selectedCells.map(([cellRow, cellCol]) => [row + cellRow, col + cellCol] as [number, number]);
    if (!canPlaceGeniusPiece(cells, state)) return;

    setHistory((steps) => [
      ...steps,
      {
        ...state,
        placements: [...state.placements, { pieceId: selected.id, origin: [row, col], cells }],
      },
    ]);

    const nextPiece = geniusPieces.find((piece) => piece.id !== selected.id && !state.placements.some((item) => item.pieceId === piece.id));
    if (nextPiece) {
      setSelectedPiece(nextPiece.id);
      setOrientationIndex(0);
    }
  }

  function reset() {
    setHistory([{ blockers: state.blockers, placements: [] }]);
    setSelectedPiece('a');
    setOrientationIndex(0);
  }

  function newChallenge() {
    setHistory([createGeniusState()]);
    setSelectedPiece('a');
    setOrientationIndex(0);
  }

  function flipSelectedPiece() {
    const current = orientations[orientationIndex % orientations.length];
    const mirrored = normalizeCells(current.map(([row, col]) => [row, -col] as [number, number]));
    const mirroredIndex = orientations.findIndex((cells) => getGeniusCellsKey(cells) === getGeniusCellsKey(mirrored));
    setOrientationIndex(mirroredIndex >= 0 ? mirroredIndex : 0);
  }

  return (
    <>
      <GameToolbar
        title={title}
        status={status}
        canUndo={history.length > 1}
        onUndo={() => setHistory((steps) => (steps.length > 1 ? steps.slice(0, -1) : steps))}
        onReset={reset}
        onHome={onHome}
      />

      <div className="genius-actions">
        <div className="selected-piece-preview" aria-label={`${selected.name} preview`}>
          <PiecePreview cells={selectedCells} color={selected.color} />
          <span>{selected.name}</span>
        </div>

        <button onClick={() => setOrientationIndex((value) => (value + 1) % orientations.length)} title="Rotate selected piece">
          <RotateCw size={18} aria-hidden="true" />
          Rotate
        </button>
        <button onClick={flipSelectedPiece} title="Flip selected piece">
          <FlipHorizontal size={18} aria-hidden="true" />
          Flip
        </button>
        <button onClick={newChallenge} title="New challenge">
          <Shuffle size={18} aria-hidden="true" />
          New
        </button>
      </div>

      <div className="genius-instructions">
        Select a piece, rotate or flip it, then click a `+` cell to place it. Click a placed piece to remove it.
        Reset keeps the same blocker challenge; New creates a fresh challenge.
      </div>

      <div className="genius-layout">
        <div className="genius-board" aria-label="Genius Square board">
          {Array.from({ length: 36 }, (_, index) => {
            const row = Math.floor(index / 6);
            const col = index % 6;
            const cellId = getGeniusCellId(row, col);
            const placement = state.placements.find((item) => item.cells.some(([cellRow, cellCol]) => cellRow === row && cellCol === col));
            const piece = placement ? geniusPieces.find((item) => item.id === placement.pieceId) : null;
            const isBlocker = state.blockers.includes(cellId);
            const canPreview = !placement && !isBlocker && !state.placements.some((item) => item.pieceId === selected.id)
              ? canPlaceGeniusPiece(selectedCells.map(([cellRow, cellCol]) => [row + cellRow, col + cellCol] as [number, number]), state)
              : false;

            return (
              <button
                key={cellId}
                className={`genius-cell ${isBlocker ? 'is-blocker' : ''} ${placement ? 'is-filled' : ''} ${canPreview ? 'can-place' : ''}`}
                style={piece ? { background: piece.color } : undefined}
                onClick={() => place(row, col)}
                aria-label={`Row ${row + 1}, column ${col + 1}`}
              >
                {isBlocker ? '•' : placement ? '' : canPreview ? '+' : ''}
              </button>
            );
          })}
        </div>

        <div className="piece-tray" aria-label="Puzzle pieces">
          {geniusPieces.map((piece) => {
            const isPlaced = state.placements.some((item) => item.pieceId === piece.id);
            return (
              <button
                key={piece.id}
                className={`piece-chip ${selectedPiece === piece.id ? 'is-selected' : ''}`}
                disabled={isPlaced}
                onClick={() => {
                  setSelectedPiece(piece.id);
                  setOrientationIndex(0);
                }}
              >
                <PiecePreview cells={getGeniusPieceOrientations(piece)[0]} color={piece.color} small />
                <span>{piece.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function PiecePreview({ cells, color, small = false }: { cells: Array<[number, number]>; color: string; small?: boolean }) {
  const normalized = normalizeCells(cells);
  const rows = Math.max(...normalized.map(([row]) => row)) + 1;
  const cols = Math.max(...normalized.map(([, col]) => col)) + 1;
  const filled = new Set(normalized.map(([row, col]) => getGeniusCellId(row, col)));

  return (
    <span
      className={`piece-preview ${small ? 'is-small' : ''}`}
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
      aria-hidden="true"
    >
      {Array.from({ length: rows * cols }, (_, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        return (
          <span
            key={getGeniusCellId(row, col)}
            className={filled.has(getGeniusCellId(row, col)) ? 'is-filled' : ''}
            style={filled.has(getGeniusCellId(row, col)) ? { background: color } : undefined}
          />
        );
      })}
    </span>
  );
}

function createGeniusState(): GeniusState {
  return {
    blockers: shuffleArray(Array.from({ length: 36 }, (_, index) => getGeniusCellId(Math.floor(index / 6), index % 6))).slice(0, 7),
    placements: [],
  };
}

function getGeniusCellId(row: number, col: number) {
  return `${row}-${col}`;
}

function getGeniusOccupiedCells(state: GeniusState) {
  return new Set([...state.blockers, ...state.placements.flatMap((placement) => placement.cells.map(([row, col]) => getGeniusCellId(row, col)))]);
}

function canPlaceGeniusPiece(cells: Array<[number, number]>, state: GeniusState) {
  const occupied = getGeniusOccupiedCells(state);
  return cells.every(([row, col]) => row >= 0 && row < 6 && col >= 0 && col < 6 && !occupied.has(getGeniusCellId(row, col)));
}

function getTransformedPieceCells(piece: GeniusPiece, rotation: number, flipped: boolean) {
  let cells = piece.cells.map(([row, col]) => [row, flipped ? -col : col] as [number, number]);

  for (let index = 0; index < rotation; index += 1) {
    cells = cells.map(([row, col]) => [col, -row]);
  }

  return normalizeCells(cells);
}

function getGeniusPieceOrientations(piece: GeniusPiece) {
  const byKey = new Map<string, Array<[number, number]>>();

  for (const flipped of [false, true]) {
    for (let rotation = 0; rotation < 4; rotation += 1) {
      const cells = getTransformedPieceCells(piece, rotation, flipped);
      byKey.set(getGeniusCellsKey(cells), cells);
    }
  }

  return [...byKey.values()];
}

function normalizeCells(cells: Array<[number, number]>) {
  const minRow = Math.min(...cells.map(([row]) => row));
  const minCol = Math.min(...cells.map(([, col]) => col));
  return cells
    .map(([row, col]) => [row - minRow, col - minCol] as [number, number])
    .sort(([rowA, colA], [rowB, colB]) => rowA - rowB || colA - colB);
}

function getGeniusCellsKey(cells: Array<[number, number]>) {
  return normalizeCells(cells)
    .map(([row, col]) => `${row}:${col}`)
    .join('|');
}

function shuffleArray<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
