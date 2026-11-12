
import { useCallback, useEffect, useRef, useState } from 'react'
import './index.css'

const SIZE = 18

const INITIAL_SNAKE = [
  { x: 8, y: 9 },
  { x: 7, y: 9 },
  { x: 6, y: 9 },
]

const SPEED = {
  Easy: 250,
  Medium: 200,
  Hard: 150,
}

const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
}

function createFood(snake) {
  let food

  do {
    food = {
      x: Math.floor(Math.random() * SIZE),
      y: Math.floor(Math.random() * SIZE),
    }
  } while (snake.some(p => p.x === food.x && p.y === food.y))

  return food
}

function playSound(frequency, duration = 0.12, type = 'sine') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return

    const audio = new AudioContext()
    const oscillator = audio.createOscillator()
    const gain = audio.createGain()

    oscillator.type = type
    oscillator.frequency.value = frequency

    gain.gain.setValueAtTime(0.06, audio.currentTime)
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audio.currentTime + duration
    )

    oscillator.connect(gain)
    gain.connect(audio.destination)

    oscillator.start()
    oscillator.stop(audio.currentTime + duration)
    oscillator.onended = () => audio.close()
  } catch {
    // Sound is optional
  }
}

export default function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [food, setFood] = useState({ x: 13, y: 9 })
  const [status, setStatus] = useState('ready')
  const [level, setLevel] = useState('Medium')
  const [sound, setSound] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const [best, setBest] = useState(() =>
    Number(localStorage.getItem('snake-best') || 0)
  )

  const snakeRef = useRef(INITIAL_SNAKE)
  const foodRef = useRef({ x: 13, y: 9 })
  const directionRef = useRef({ x: 1, y: 0 })
  const statusRef = useRef('ready')
  const soundRef = useRef(true)

  const score = snake.length - INITIAL_SNAKE.length

  useEffect(() => {
    soundRef.current = sound
  }, [sound])

  const changeStatus = useCallback(value => {
    statusRef.current = value
    setStatus(value)
  }, [])

  const move = useCallback(next => {
    const current = directionRef.current

    if (
      next.x + current.x === 0 &&
      next.y + current.y === 0
    ) return

    directionRef.current = next
  }, [])

  const startGame = useCallback(() => {
    const newSnake = INITIAL_SNAKE.map(p => ({ ...p }))
    const newFood = createFood(newSnake)

    snakeRef.current = newSnake
    foodRef.current = newFood
    directionRef.current = { x: 1, y: 0 }

    setSnake(newSnake)
    setFood(newFood)
    changeStatus('running')
  }, [changeStatus])

  const pauseGame = useCallback(() => {
    if (statusRef.current === 'running') {
      changeStatus('paused')
    } else if (statusRef.current === 'paused') {
      changeStatus('running')
    }
  }, [changeStatus])

  // Keyboard controls
  useEffect(() => {
    const handleKey = event => {
      const key = event.key.length === 1
        ? event.key.toLowerCase()
        : event.key

      if (DIRECTIONS[key]) {
        event.preventDefault()
        move(DIRECTIONS[key])
      }

      if (event.code === 'Space') {
        event.preventDefault()

        if (
          statusRef.current === 'ready' ||
          statusRef.current === 'gameover'
        ) {
          startGame()
        } else {
          pauseGame()
        }
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [move, startGame, pauseGame])

  // Game engine
  useEffect(() => {
    if (status !== 'running') return

    const timer = setInterval(() => {
      const currentSnake = snakeRef.current
      const currentFood = foodRef.current
      const direction = directionRef.current

      const head = {
        x: currentSnake[0].x + direction.x,
        y: currentSnake[0].y + direction.y,
      }

      const eating =
        head.x === currentFood.x &&
        head.y === currentFood.y

      const body = eating ? currentSnake : currentSnake.slice(0, -1)

      const collision =
        head.x < 0 ||
        head.x >= SIZE ||
        head.y < 0 ||
        head.y >= SIZE ||
        body.some(p => p.x === head.x && p.y === head.y)

      if (collision) {
        changeStatus('gameover')

        if (soundRef.current) {
          playSound(180, 0.25, 'sawtooth')
          setTimeout(() => playSound(110, 0.3, 'sawtooth'), 160)
        }
        return
      }

      const newSnake = [head, ...currentSnake]
      if (!eating) newSnake.pop()

      snakeRef.current = newSnake
      setSnake(newSnake)

      if (eating) {
        if (soundRef.current) {
          playSound(660, 0.09)
          setTimeout(() => playSound(880, 0.1), 70)
        }

        const newFood = createFood(newSnake)
        foodRef.current = newFood
        setFood(newFood)
      }
    }, SPEED[level])

    return () => clearInterval(timer)
  }, [status, level, changeStatus])

  // Save best score
  useEffect(() => {
    if (score > best) {
      setBest(score)
      localStorage.setItem('snake-best', String(score))
    }
  }, [score, best])

  const handleMainButton = () => {
    if (status === 'running') {
      pauseGame()
    } else if (status === 'paused') {
      pauseGame()
    } else {
      startGame()
    }
  }

  const buttonText = {
    ready: 'START GAME',
    running: 'PAUSE GAME',
    paused: 'RESUME GAME',
    gameover: 'PLAY AGAIN',
  }

  return (
    <main className="page">
      <div className="game-container">

        <header className="game-header">
          <div className="brand-icon">🐍</div>
          <div>
            
            <h1>WELCOME TO SNAKE GAME</h1>
            
        
          </div>
        </header>

        <div className="score-display">
          <span>YOUR SCORE</span>
          <strong>{score}</strong>
        </div>

        {/* CENTERED PLAYGROUND */}
        <section className="playground">
          <div
            className="game-board"
            style={{
              gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
            }}
          >
            {Array.from({ length: SIZE * SIZE }, (_, i) => {
              const x = i % SIZE
              const y = Math.floor(i / SIZE)

              const head = snake[0].x === x && snake[0].y === y
              const body =
                !head && snake.some(p => p.x === x && p.y === y)
              const isFood = food.x === x && food.y === y

              return (
                <div
                  key={i}
                  className={`cell ${
                    head ? 'snake-head' :
                    body ? 'snake-body' :
                    isFood ? 'food' : ''
                  }`}
                />
              )
            })}
          </div>

          {status !== 'running' && status !== 'ready' && (
            <div className="game-overlay">
              <div className="overlay-icon">
                {status === 'paused' ? '⏸' : '💥'}
              </div>
              <h2>{status === 'paused' ? 'GAME PAUSED' : 'GAME OVER'}</h2>
              <p>
                {status === 'paused'
                  ? 'Your game is waiting.'
                  : `Your final score: ${score}`}
              </p>
            </div>
          )}
        </section>

        {/* BUTTONS UNDER PLAYGROUND */}
        <div className="main-actions">
          <button className="start-button" onClick={handleMainButton}>
            {buttonText[status]}
          </button>

          <button
            className={`settings-button ${settingsOpen ? 'opened' : ''}`}
            onClick={() => setSettingsOpen(value => !value)}
          >
            <span>⚙</span>
            SETTINGS
            <span className="settings-arrow">
              {settingsOpen ? '▲' : '▼'}
            </span>
          </button>
        </div>

        {/* HIDDEN SETTINGS PANEL */}
        {settingsOpen && (
          <section className="settings-panel">
            <div className="settings-heading">
              <h2>GAME SETTINGS</h2>
              <button
                className="close-settings"
                onClick={() => setSettingsOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="settings-grid">

              <div className="setting-item">
                <h3>DIFFICULTY</h3>
                <div className="difficulty-options">
                  {Object.keys(SPEED).map(item => (
                    <button
                      key={item}
                      onClick={() => setLevel(item)}
                      className={level === item ? 'selected' : ''}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="setting-item">
                <h3>SOUND EFFECTS</h3>
                <button
                  className={`sound-button ${sound ? 'active' : ''}`}
                  onClick={() => setSound(value => !value)}
                >
                  {sound ? '♪ SOUND ON' : '♪ SOUND OFF'}
                </button>
              </div>

              <div className="setting-item">
                <h3>GAME INFORMATION</h3>
                <div className="info-values">
                  <div>
                    <span>HIGH SCORE</span>
                    <strong>{best}</strong>
                  </div>
                  <div>
                    <span>LEVEL</span>
                    <strong>{level}</strong>
                  </div>
                </div>
              </div>

              <div className="setting-item">
                <h3>CONTROLLER</h3>
                <div className="controller">
                  <span />
                  <button onClick={() => move(DIRECTIONS.ArrowUp)}>↑</button>
                  <span />
                  <button onClick={() => move(DIRECTIONS.ArrowLeft)}>←</button>
                  <button onClick={() => move(DIRECTIONS.ArrowDown)}>↓</button>
                  <button onClick={() => move(DIRECTIONS.ArrowRight)}>→</button>
                </div>
                <p className="controller-hint">Arrow keys or W A S D</p>
              </div>

            </div>
          </section>
        )}

        <footer className="footer">
          SNAKE GAME<span>•</span> POWERED BY ILDEBRANDE
        </footer>
      </div>
    </main>
  )
}
