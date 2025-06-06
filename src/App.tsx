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

  // Animation state for current word
  const [wordAnim, setWordAnim] = useState(false);

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
      setWordAnim(true);
      setTimeout(() => setWordAnim(false), 350);
      if (currentWordIdx === words.length - 1) {
        setTimeout(() => {
          setStatus("won");
          setStarted(false);
        }, 350);
      } else {
        setTimeout(() => {
          setCurrentWordIdx(currentWordIdx + 1);
          setInput("");
        }, 150);
      }
    }
  }

  function restart() {
    setStarted(false);
    setStatus("idle");
    setInput("");
    setWords([]);
  }

  // Timer progress bar calculation
  const maxTime = DIFFICULTY[difficulty].time;
  const timerPercent = Math.max(0, Math.min(100, (timer / maxTime) * 100));

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
        {/* Show Restart if game is started (even during playing) or after win/loss */}
        {(started || status === "won" || status === "lost") && (
          <button
            className="restart-btn"
            onClick={restart}
            style={{
              animation: "fadein-card 0.6s",
              marginLeft: "0.4rem",
            }}
          >
            Restart
          </button>
        )}
      </div>

      <div className="game-area">
        <div className="timer">
          <span>⏰ {timer}s</span>
          <div className="timer-bar-bg">
            <div
              className="timer-bar"
              style={{
                width: `${timerPercent}%`,
                background: timerPercent < 35
                  ? "linear-gradient(90deg, #ff3f59 0%, #ff8d39 100%)"
                  : "linear-gradient(90deg, #39ffd6 0%, #3f77f6 100%)",
                transition: timerPercent < 25 ? "width 0.3s cubic-bezier(.6,2,.2,1)" : "width 0.7s cubic-bezier(.32,1.56,.65,1)",
              }}
            />
          </div>
        </div>
        {status === "playing" && (
          <>
            <div className="words">
              {words.map((word, idx) => (
                <span
                  key={word}
                  className={
                    idx === currentWordIdx
                      ? `current-word ${wordAnim ? "pop" : ""}`
                      : idx < currentWordIdx
                      ? "typed"
                      : ""
                  }
                  style={idx === currentWordIdx && wordAnim ? {
                    filter: "blur(0px) brightness(1.25)",
                    boxShadow: "0 2px 32px #39ffd677"
                  } : undefined}
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
              style={{
                boxShadow: input ? "0 0 16px #39ffd688, 0 2px 8px #3f77f644" : undefined,
                borderColor: input ? "#39ffd6" : "#3f77f6"
              }}
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
            <li>Choose your <strong>difficulty</strong></li>
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
