import { CSSProperties, FormEvent, StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, FlipHorizontal, Grid2X2, Home, RotateCcw, RotateCw, Shuffle, Undo2 } from 'lucide-react';
import './styles.css';

type Route =
  | 'home'
  | 'tic-tac-toe'
  | 'memory-match'
  | 'wooden-solitaire'
  | 'connect-four'
  | 'genius-square'
  | 'deck-solitaire'
  | 'twenty-forty-eight'
  | 'word-shift';
type Mark = 'X' | 'O';
type Square = Mark | null;
type WordLength = 3 | 4 | 5;
type MoveDirection = 'up' | 'down' | 'left' | 'right';
type Game2048State = {
  board: number[];
  score: number;
};
type ConnectDisc = 'red' | 'yellow';
type ConnectCell = ConnectDisc | null;
type ConnectMode = 'system' | 'players';
type ConnectDifficulty = 'easy' | 'medium' | 'hard';
type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
type PlayingCard = {
  id: string;
  suit: Suit;
  rank: number;
  faceUp: boolean;
};
type DeckSolitaireState = {
  stock: PlayingCard[];
  waste: PlayingCard[];
  foundations: Record<Suit, PlayingCard[]>;
  tableau: PlayingCard[][];
};
type DeckSelection =
  | { source: 'waste'; index: number }
  | { source: 'tableau'; column: number; index: number };
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
  {
    route: 'deck-solitaire',
    title: 'Solitaire',
    description: 'Play a simple Klondike game with a standard deck.',
  },
  {
    route: 'twenty-forty-eight',
    title: '2048',
    description: 'Slide tiles up to 4096 on a classic 4x4 grid.',
  },
  {
    route: 'word-shift',
    title: 'Word Shift',
    description: 'Change one letter at a time to make new words.',
  },
];

const solitaireHoles = createSolitaireHoles();
const wordBank: Record<WordLength, string[]> = {
  3: [
    'cat', 'bat', 'bad', 'bed', 'bee', 'see', 'sea', 'tea', 'ten', 'pen', 'pan', 'can', 'fan', 'fin', 'fit', 'sit',
    'sat', 'mat', 'map', 'mop', 'top', 'tip', 'sip', 'sap', 'cap', 'cop', 'cup', 'cut', 'cot', 'dot', 'dog', 'dig',
    'fig', 'fog', 'log', 'lag', 'bag', 'bug', 'rug', 'run', 'sun', 'fun', 'bun', 'bin', 'pin', 'pit', 'pot', 'pod',
  ],
  4: [
    'cold', 'cord', 'card', 'ward', 'warm', 'worm', 'word', 'wood', 'food', 'fold', 'gold', 'goad', 'load', 'loan',
    'lean', 'bean', 'bear', 'pear', 'peal', 'seal', 'seat', 'meat', 'meet', 'feet', 'feed', 'seed', 'send', 'sand',
    'band', 'bend', 'bond', 'fond', 'find', 'fine', 'fire', 'hire', 'wire', 'wise', 'rise', 'rose', 'hose', 'home',
    'come', 'cone', 'bone', 'bore', 'core', 'care',
  ],
  5: [
    'stone', 'store', 'shore', 'share', 'shark', 'spark', 'spare', 'stare', 'stars', 'sears', 'bears', 'beard', 'heard',
    'heart', 'earth', 'worth', 'words', 'cords', 'cards', 'cares', 'caves', 'saves', 'sales', 'tales', 'takes', 'makes',
    'males', 'miles', 'piles', 'pills', 'fills', 'falls', 'balls', 'bells', 'belts', 'melts', 'meats', 'meets', 'seeds',
    'sends', 'sands', 'bands', 'bends', 'bonds', 'ponds', 'pound', 'sound', 'round',
  ],
};
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
      {route === 'deck-solitaire' && <DeckSolitaire title={game?.title ?? 'Solitaire'} onHome={onHome} />}
      {route === 'twenty-forty-eight' && <TwentyFortyEight title={game?.title ?? '2048'} onHome={onHome} />}
      {route === 'word-shift' && <WordShift title={game?.title ?? 'Word Shift'} onHome={onHome} />}
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
  const status = winner ? `${winner.mark} wins` : isDraw ? 'Draw game' : `${nextMark} to move`;

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
          <button
            key={index}
            className={`tic-square ${winner?.line.includes(index) ? 'is-winner' : ''}`}
            onClick={() => play(index)}
            aria-label={`Square ${index + 1}`}
          >
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
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return { mark: board[a], line: [a, b, c] };
  }

  return null;
}

function TwentyFortyEight({ title, onHome }: { title: string; onHome: () => void }) {
  const [history, setHistory] = useState<Game2048State[]>(() => [create2048State()]);
  const state = history[history.length - 1];
  const maxTile = Math.max(...state.board);
  const isWon = maxTile >= 4096;
  const isOver = !isWon && !canMove2048(state.board);
  const status = isWon ? '4096 reached' : isOver ? 'Game over' : `Score ${state.score}`;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const keyMap: Record<string, MoveDirection | undefined> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      };
      const direction = keyMap[event.key];
      if (!direction) return;

      event.preventDefault();
      move(direction);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state]);

  function move(direction: MoveDirection) {
    if (isWon || isOver) return;

    const moved = move2048Board(state.board, direction);
    if (!moved.changed) return;

    setHistory((steps) => [
      ...steps,
      {
        board: addRandom2048Tile(moved.board),
        score: state.score + moved.score,
      },
    ]);
  }

  function reset() {
    setHistory([create2048State()]);
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

      <div className="game-2048">
        <div className="score-2048">
          <span>Score</span>
          <strong>{state.score}</strong>
          <span>Best tile</span>
          <strong>{maxTile}</strong>
        </div>

        <div className="board-2048" aria-label="2048 board">
          {state.board.map((value, index) => (
            <div key={index} className={`tile-2048 tile-${value || 'empty'}`}>
              {value || ''}
            </div>
          ))}
        </div>

        <div className="controls-2048" aria-label="2048 controls">
          <button onClick={() => move('up')}>Up</button>
          <button onClick={() => move('left')}>Left</button>
          <button onClick={() => move('right')}>Right</button>
          <button onClick={() => move('down')}>Down</button>
        </div>
      </div>
    </>
  );
}

function create2048State(): Game2048State {
  return {
    board: addRandom2048Tile(addRandom2048Tile(Array(16).fill(0))),
    score: 0,
  };
}

function addRandom2048Tile(board: number[]) {
  const empty = board
    .map((value, index) => (value === 0 ? index : -1))
    .filter((index) => index >= 0);
  if (empty.length === 0) return board;

  const next = [...board];
  const index = empty[Math.floor(Math.random() * empty.length)];
  next[index] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function move2048Board(board: number[], direction: MoveDirection) {
  const next = Array(16).fill(0);
  let score = 0;

  for (let line = 0; line < 4; line += 1) {
    const indexes = get2048LineIndexes(line, direction);
    const values = indexes.map((index) => board[index]);
    const merged = merge2048Line(values);
    score += merged.score;
    indexes.forEach((index, valueIndex) => {
      next[index] = merged.values[valueIndex];
    });
  }

  return {
    board: next,
    changed: next.some((value, index) => value !== board[index]),
    score,
  };
}

function get2048LineIndexes(line: number, direction: MoveDirection) {
  if (direction === 'left') return [0, 1, 2, 3].map((col) => line * 4 + col);
  if (direction === 'right') return [3, 2, 1, 0].map((col) => line * 4 + col);
  if (direction === 'up') return [0, 1, 2, 3].map((row) => row * 4 + line);
  return [3, 2, 1, 0].map((row) => row * 4 + line);
}

function merge2048Line(values: number[]) {
  const compact = values.filter(Boolean);
  const merged: number[] = [];
  let score = 0;

  for (let index = 0; index < compact.length; index += 1) {
    if (compact[index] === compact[index + 1]) {
      const value = compact[index] * 2;
      merged.push(value);
      score += value;
      index += 1;
    } else {
      merged.push(compact[index]);
    }
  }

  while (merged.length < 4) merged.push(0);
  return { values: merged, score };
}

function canMove2048(board: number[]) {
  if (board.some((value) => value === 0)) return true;

  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const value = board[row * 4 + col];
      if (col < 3 && value === board[row * 4 + col + 1]) return true;
      if (row < 3 && value === board[(row + 1) * 4 + col]) return true;
    }
  }

  return false;
}

function WordShift({ title, onHome }: { title: string; onHome: () => void }) {
  const [wordLength, setWordLength] = useState<WordLength>(4);
  const [history, setHistory] = useState<string[]>(() => [getRandomWord(4)]);
  const [entry, setEntry] = useState('');
  const [message, setMessage] = useState('Change one letter to make a new word.');
  const [bestScore, setBestScore] = useState(() => getStoredWordBestScore());
  const [isChecking, setIsChecking] = useState(false);
  const currentWord = history[history.length - 1];
  const score = history.length - 1;
  const status = `Score ${score} · Best ${bestScore}`;
  const usedWords = new Set(history);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('gameshelf-word-shift-best', String(score));
    }
  }, [bestScore, score]);

  function changeLength(nextLength: WordLength) {
    const startWord = getRandomWord(nextLength);
    setWordLength(nextLength);
    setHistory([startWord]);
    setEntry('');
    setMessage('Change one letter to make a new word.');
  }

  async function submitWord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextWord = entry.trim().toLowerCase();
    if (isChecking) return;

    if (nextWord.length !== wordLength) {
      setMessage(`Use exactly ${wordLength} letters.`);
      return;
    }

    if (!/^[a-z]+$/.test(nextWord)) {
      setMessage('Use letters only.');
      return;
    }

    if (usedWords.has(nextWord)) {
      setMessage('That word was already used this session.');
      return;
    }

    if (countLetterChanges(currentWord, nextWord) !== 1) {
      setMessage('Change exactly one letter from the current word.');
      return;
    }

    setIsChecking(true);
    setMessage('Checking dictionary...');
    const isValidWord = await checkDictionaryWord(nextWord);
    setIsChecking(false);

    if (!isValidWord) {
      setMessage('Dictionary did not recognize that word. Internet is required for this check.');
      return;
    }

    setHistory((words) => [...words, nextWord]);
    setEntry('');
    setMessage('Good word.');
  }

  function reset() {
    const startWord = getRandomWord(wordLength);
    setHistory([startWord]);
    setEntry('');
    setMessage('Change one letter to make a new word.');
  }

  return (
    <>
      <GameToolbar
        title={title}
        status={status}
        canUndo={history.length > 1}
        onUndo={() => {
          setHistory((words) => (words.length > 1 ? words.slice(0, -1) : words));
          setMessage('Last word removed.');
        }}
        onReset={reset}
        onHome={onHome}
      />

      <div className="word-game">
        <div className="word-warning">
          Dictionary validation needs internet. If the dictionary service is unavailable, new words cannot be accepted.
        </div>

        <div className="word-length-picker" aria-label="Choose word length">
          {([3, 4, 5] as WordLength[]).map((length) => (
            <button key={length} className={wordLength === length ? 'is-active' : ''} onClick={() => changeLength(length)}>
              {length} letters
            </button>
          ))}
        </div>

        <div className="current-word-card">
          <span>Current word</span>
          <strong>{currentWord}</strong>
        </div>

        <form className="word-entry" onSubmit={submitWord}>
          <input
            value={entry}
            maxLength={wordLength}
            onChange={(event) => setEntry(event.target.value.toLowerCase())}
            placeholder={`${wordLength}-letter word`}
            aria-label="Next word"
            disabled={isChecking}
          />
          <button type="submit" disabled={isChecking}>{isChecking ? 'Checking' : 'Submit'}</button>
        </form>

        <p className="word-message">{message}</p>

        <div className="used-word-list" aria-label="Used words">
          {history.map((word, index) => (
            <span key={`${word}-${index}`}>{word}</span>
          ))}
        </div>
      </div>
    </>
  );
}

function getRandomWord(length: WordLength) {
  const words = wordBank[length];
  return words[Math.floor(Math.random() * words.length)];
}

function countLetterChanges(first: string, second: string) {
  return first.split('').filter((letter, index) => letter !== second[index]).length;
}

function getStoredWordBestScore() {
  const value = Number(localStorage.getItem('gameshelf-word-shift-best'));
  return Number.isFinite(value) ? value : 0;
}

async function checkDictionaryWord(word: string) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    return response.ok;
  } catch {
    return false;
  }
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

function DeckSolitaire({ title, onHome }: { title: string; onHome: () => void }) {
  const [history, setHistory] = useState<DeckSolitaireState[]>(() => [createDeckSolitaireState()]);
  const [selection, setSelection] = useState<DeckSelection | null>(null);
  const state = history[history.length - 1];
  const foundationCount = Object.values(state.foundations).reduce((total, pile) => total + pile.length, 0);
  const status = foundationCount === 52 ? 'Solved' : `${foundationCount} cards in foundations`;

  function commit(nextState: DeckSolitaireState) {
    setHistory((steps) => [...steps, nextState]);
    setSelection(null);
  }

  function drawStock() {
    if (state.stock.length > 0) {
      const stock = [...state.stock];
      const card = stock.pop()!;
      commit({ ...state, stock, waste: [...state.waste, { ...card, faceUp: true }] });
      return;
    }

    if (state.waste.length > 0) {
      commit({ ...state, stock: state.waste.map((card) => ({ ...card, faceUp: false })).reverse(), waste: [] });
    }
  }

  function selectWaste() {
    if (state.waste.length === 0) return;
    setSelection({ source: 'waste', index: state.waste.length - 1 });
  }

  function selectTableau(column: number, index: number) {
    const card = state.tableau[column][index];
    if (!card?.faceUp) return;

    if (selection) {
      const moved = moveToTableau(state, selection, column);
      if (moved) {
        commit(moved);
        return;
      }
    }

    setSelection({ source: 'tableau', column, index });
  }

  function moveSelectedToFoundation(suit: Suit) {
    if (!selection) return;
    const moved = moveToFoundation(state, selection, suit);
    if (moved) commit(moved);
  }

  function moveSelectedToTableau(column: number) {
    if (!selection) return;
    const moved = moveToTableau(state, selection, column);
    if (moved) commit(moved);
  }

  function reset() {
    setHistory([createDeckSolitaireState()]);
    setSelection(null);
  }

  return (
    <>
      <GameToolbar
        title={title}
        status={status}
        canUndo={history.length > 1}
        onUndo={() => {
          setSelection(null);
          setHistory((steps) => (steps.length > 1 ? steps.slice(0, -1) : steps));
        }}
        onReset={reset}
        onHome={onHome}
      />

      <div className="solitaire-help">
        Draw from the stock. Select a face-up card or stack, then choose a tableau column or foundation.
      </div>

      <div className="deck-solitaire">
        <div className="solitaire-top-row">
          <button className="card-slot stock-slot" onClick={drawStock} aria-label="Draw from stock">
            {state.stock.length > 0 ? <span className="card-back">{state.stock.length}</span> : state.waste.length > 0 ? '↻' : ''}
          </button>
          <button className="card-slot" onClick={selectWaste} aria-label="Waste pile">
            {state.waste.length > 0 && (
              <PlayingCardView
                card={state.waste[state.waste.length - 1]}
                selected={selection?.source === 'waste'}
              />
            )}
          </button>

          <div className="foundation-row">
            {(['spades', 'hearts', 'diamonds', 'clubs'] as Suit[]).map((suit) => (
              <button key={suit} className="card-slot foundation-slot" onClick={() => moveSelectedToFoundation(suit)}>
                {state.foundations[suit].length > 0 ? (
                  <PlayingCardView card={state.foundations[suit][state.foundations[suit].length - 1]} />
                ) : (
                  <span className={getSuitColor(suit)}>{getSuitSymbol(suit)}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="tableau-row">
          {state.tableau.map((column, columnIndex) => (
            <div key={columnIndex} className="tableau-column">
              {column.length === 0 ? (
                <button className="card-slot empty-tableau" onClick={() => moveSelectedToTableau(columnIndex)} />
              ) : (
                column.map((card, cardIndex) => (
                  <button
                    key={card.id}
                    className="tableau-card-button"
                    style={{ marginTop: cardIndex === 0 ? 0 : card.faceUp ? -66 : -84 }}
                    onClick={() => selectTableau(columnIndex, cardIndex)}
                  >
                    <PlayingCardView
                      card={card}
                      selected={
                        selection?.source === 'tableau' &&
                        selection.column === columnIndex &&
                        cardIndex >= selection.index
                      }
                    />
                  </button>
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function PlayingCardView({ card, selected = false }: { card: PlayingCard; selected?: boolean }) {
  if (!card.faceUp) return <span className="playing-card card-back" />;

  return (
    <span className={`playing-card ${getSuitColor(card.suit)} ${selected ? 'is-selected' : ''}`}>
      <span>{getRankLabel(card.rank)}</span>
      <span>{getSuitSymbol(card.suit)}</span>
    </span>
  );
}

function createDeckSolitaireState(): DeckSolitaireState {
  const deck = shuffleArray(
    (['spades', 'hearts', 'diamonds', 'clubs'] as Suit[]).flatMap((suit) =>
      Array.from({ length: 13 }, (_, index) => ({
        id: `${suit}-${index + 1}`,
        suit,
        rank: index + 1,
        faceUp: false,
      })),
    ),
  );
  const tableau: PlayingCard[][] = Array.from({ length: 7 }, () => []);

  for (let column = 0; column < 7; column += 1) {
    for (let count = 0; count <= column; count += 1) {
      const card = deck.pop()!;
      tableau[column].push({ ...card, faceUp: count === column });
    }
  }

  return {
    stock: deck,
    waste: [],
    foundations: { spades: [], hearts: [], diamonds: [], clubs: [] },
    tableau,
  };
}

function getSelectedCards(state: DeckSolitaireState, selection: DeckSelection) {
  return selection.source === 'waste'
    ? [state.waste[selection.index]]
    : state.tableau[selection.column].slice(selection.index);
}

function moveToFoundation(state: DeckSolitaireState, selection: DeckSelection, suit: Suit) {
  const cards = getSelectedCards(state, selection);
  if (cards.length !== 1 || cards[0].suit !== suit) return null;

  const foundation = state.foundations[suit];
  if (cards[0].rank !== foundation.length + 1) return null;

  const next = removeSelectedCards(state, selection);
  return {
    ...next,
    foundations: {
      ...next.foundations,
      [suit]: [...foundation, cards[0]],
    },
  };
}

function moveToTableau(state: DeckSolitaireState, selection: DeckSelection, targetColumn: number) {
  const cards = getSelectedCards(state, selection);
  if (cards.length === 0) return null;
  if (selection.source === 'tableau' && selection.column === targetColumn) return null;

  const target = state.tableau[targetColumn];
  const movingCard = cards[0];
  const targetCard = target[target.length - 1];
  const canMove = targetCard
    ? isOppositeColor(movingCard, targetCard) && movingCard.rank === targetCard.rank - 1
    : movingCard.rank === 13;

  if (!canMove) return null;

  const next = removeSelectedCards(state, selection);
  const tableau = next.tableau.map((column, index) => (index === targetColumn ? [...column, ...cards] : column));
  return { ...next, tableau };
}

function removeSelectedCards(state: DeckSolitaireState, selection: DeckSelection): DeckSolitaireState {
  if (selection.source === 'waste') {
    return { ...state, waste: state.waste.slice(0, selection.index) };
  }

  const tableau = state.tableau.map((column, index) => {
    if (index !== selection.column) return column;
    const remaining = column.slice(0, selection.index);
    const last = remaining[remaining.length - 1];
    return last && !last.faceUp ? [...remaining.slice(0, -1), { ...last, faceUp: true }] : remaining;
  });

  return { ...state, tableau };
}

function isOppositeColor(first: PlayingCard, second: PlayingCard) {
  return getSuitColor(first.suit) !== getSuitColor(second.suit);
}

function getSuitColor(suit: Suit) {
  return suit === 'hearts' || suit === 'diamonds' ? 'red-card' : 'black-card';
}

function getSuitSymbol(suit: Suit) {
  return suit === 'spades' ? '♠' : suit === 'hearts' ? '♥' : suit === 'diamonds' ? '♦' : '♣';
}

function getRankLabel(rank: number) {
  return rank === 1 ? 'A' : rank === 11 ? 'J' : rank === 12 ? 'Q' : rank === 13 ? 'K' : String(rank);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
