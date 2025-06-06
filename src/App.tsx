import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const WORDS = [
  "apple", "banana", "keyboard", "computer", "speed", "challenge", "random", "javascript",
  "react", "modern", "browser", "device", "difficult", "impossible", "hard", "easy",
  "function", "component", "github", "vercel", "project", "style", "score", "timer", "input",
  "game", "winner", "loser", "start", "finish", "mobile", "desktop", "responsive", "type",
  "quick", "fox", "jump", "over", "lazy", "dog", "hello", "world", "space", "shift", "enter"
];

const DIFFICULTY = {
  easy: { words: 5, time: 30 },
  hard: { words: 10, time: 20 },
  impossible: { words: 20, time: 12 }
};

type Difficulty = keyof typeof DIFFICULTY;

function getRandomWords(count: number) {
  const arr = [...WORDS];
  const words = [];
  while (words.length < count && arr.length) {
    const idx = Math.floor(Math.random() * arr.length);
    words.push(arr[idx]);
    arr.splice(idx, 1);
  }
  return words;
}

const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [status, setStatus] = useState<"playing" | "won" | "lost" | "idle">("idle");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (started && status === "playing") {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setStatus("lost");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current!);
    }
  }, [started, status]);

  useEffect(() => {
    if (status === "won" || status === "lost") {
      clearInterval(timerRef.current!);
    }
  }, [status]);

  useEffect(() => {
    if (inputRef.current && started) inputRef.current.focus();
  }, [started, currentWordIdx]);

  function startGame() {
    const { words: wordsCount, time } = DIFFICULTY[difficulty];
    setWords(getRandomWords(wordsCount));
    setCurrentWordIdx(0);
    setInput("");
    setTimer(time);
    setStatus("playing");
    setStarted(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
    if (e.target.value.trim() === words[currentWordIdx]) {
      if (currentWordIdx === words.length - 1) {
        setStatus("won");
        setStarted(false);
      } else {
        setCurrentWordIdx(currentWordIdx + 1);
        setInput("");
      }
    }
  }

  function restart() {
    setStarted(false);
    setStatus("idle");
    setInput("");
    setWords([]);
  }

  return (
    <div className="container">
      <h1>⚡ Typing Speed Game ⚡</h1>
      <div className="settings">
        <label>
          Difficulty:&nbsp;
          <select
            value={difficulty}
            disabled={started}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          >
            <option value="easy">Easy</option>
            <option value="hard">Hard</option>
            <option value="impossible">Impossible</option>
          </select>
        </label>
        {!started && (
          <button className="start-btn" onClick={startGame}>
            Start Game
          </button>
        )}
        {(status === "won" || status === "lost") && (
          <button className="restart-btn" onClick={restart}>
            Restart
          </button>
        )}
      </div>

      <div className="game-area">
        <div className="timer">
          <span>⏰ {timer}s</span>
        </div>
        {status === "playing" && (
          <>
            <div className="words">
              {words.map((word, idx) => (
                <span
                  key={word}
                  className={
                    idx === currentWordIdx
                      ? "current-word"
                      : idx < currentWordIdx
                      ? "typed"
                      : ""
                  }
                >
                  {word}
                </span>
              ))}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={onInputChange}
              disabled={status !== "playing"}
              className="input-box"
              autoFocus
              autoComplete="off"
              spellCheck={false}
              aria-label="Type the current word"
            />
          </>
        )}
        {status === "won" && (
          <div className="result won">
            <h2>🎉 You Win! 🎉</h2>
            <p>You typed all the words in time!</p>
          </div>
        )}
        {status === "lost" && (
          <div className="result lost">
            <h2>😢 You Lost! 😢</h2>
            <p>Try again and type faster!</p>
          </div>
        )}
        {status === "idle" && <div className="instructions">
          <ul>
            <li>Choose your difficulty</li>
            <li>Type each word as fast as you can</li>
            <li>Finish before the timer runs out!</li>
            <li>Works everywhere. Good luck ⚡</li>
          </ul>
        </div>}
      </div>
      <footer>
        <span>
          Made by <a href="https://github.com/mathpunch/typingspeedgame" target="_blank" rel="noopener noreferrer">mathpunch</a> · Hosted on Vercel
        </span>
      </footer>
    </div>
  );
};

export default App;
