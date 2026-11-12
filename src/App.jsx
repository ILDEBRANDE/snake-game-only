import { useCallback, useEffect, useRef, useState } from 'react'

const SIZE = 20
const INITIAL_SNAKE = [
  { x: 9, y: 10 },
  { x: 8, y: 10 },
  { x: 7, y: 10 },
]

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

function randomFood(snake) {
  let point
  do {
    point = {
      x: Math.floor(Math.random() * SIZE),
      y: Math.floor(Math.random() * SIZE),
    }
  } while (snake.some((part) => part.x === point.x && part.y === point.y))
  return point
}

export default function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [food, setFood] = useState({ x: 14, y: 10 })
  const [direction, setDirection] = useState({ x: 1, y: 0 })
  const [status, setStatus] = useState('ready')
  const directionRef = useRef(direction)

  const score = snake.length - INITIAL_SNAKE.length

  const changeDirection = useCallback((next) => {
    const current = directionRef.current
    // Do not allow the snake to reverse directly into itself.
    if (next.x + current.x === 0 && next.y + current.y === 0) return
    directionRef.current = next
    setDirection(next)
  }, [])

  const resetGame = () => {
    setSnake(INITIAL_SNAKE)
    setFood({ x: 14, y: 10 })
    const startDirection = { x: 1, y: 0 }
    directionRef.current = startDirection
    setDirection(startDirection)
    setStatus('running')
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      if (DIRECTIONS[key]) {
        event.preventDefault()
        changeDirection(DIRECTIONS[key])
      }
      if (event.key === ' ' && status !== 'gameover') {
        event.preventDefault()
        setStatus((current) => current === 'running' ? 'paused' : 'running')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [changeDirection, status])

  useEffect(() => {
    if (status !== 'running') return undefined

    const timer = window.setInterval(() => {
      setSnake((currentSnake) => {
        const move = directionRef.current
        const head = {
          x: currentSnake[0].x + move.x,
          y: currentSnake[0].y + move.y,
        }
        const eating = head.x === food.x && head.y === food.y
        const bodyToCheck = eating ? currentSnake : currentSnake.slice(0, -1)
        const hitWall =
          head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE
        const hitSelf = bodyToCheck.some(
          (part) => part.x === head.x && part.y === head.y,
        )

        if (hitWall || hitSelf) {
          setStatus('gameover')
          return currentSnake
        }

        const nextSnake = [head, ...currentSnake]
        if (!eating) nextSnake.pop()
        else setFood(randomFood(nextSnake))

        return nextSnake
      })
    }, 125)

    return () => window.clearInterval(timer)
  }, [status, food])

  const cellIsSnake = (x, y) =>
    snake.some((part) => part.x === x && part.y === y)

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-emerald-400">
          Classic arcade
        </p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          SNAKE <span className="text-emerald-400">GAME</span>
        </h1>
        <p className="mt-3 text-center text-sm text-slate-400">
          Eat the food, grow your snake, and avoid the walls!
        </p>

        <div className="mt-7 flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4 shadow-lg">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Score</p>
            <p className="text-3xl font-black text-emerald-400">{score}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Best this game</p>
            <p className="text-2xl font-bold">{score}</p>
          </div>
        </div>

        <div className="relative mt-5 w-full overflow-hidden rounded-2xl border-4 border-slate-700 bg-slate-900 p-2 shadow-2xl shadow-emerald-950/30">
          <div
            className="grid aspect-square w-full gap-px bg-slate-800"
            style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
            aria-label="Snake game board"
          >
            {Array.from({ length: SIZE * SIZE }, (_, index) => {
              const x = index % SIZE
              const y = Math.floor(index / SIZE)
              const isHead = snake[0].x === x && snake[0].y === y
              const isSnake = cellIsSnake(x, y)
              const isFood = food.x === x && food.y === y

              return (
                <div
                  key={`${x}-${y}`}
                  className={`aspect-square rounded-[2px] ${
                    isHead
                      ? 'bg-lime-300 shadow-sm shadow-lime-300'
                      : isSnake
                        ? 'bg-emerald-500'
                        : isFood
                          ? 'rounded-full bg-rose-500 shadow-sm shadow-rose-400'
                          : 'bg-slate-950'
                  }`}
                />
              )
            })}
          </div>

          {status !== 'running' && (
            <div className="absolute inset-2 flex flex-col items-center justify-center bg-slate-950/85 px-5 text-center backdrop-blur-sm">
              <p className="text-2xl font-black">
                {status === 'ready' ? 'Ready to play?' : status === 'paused' ? 'Paused' : 'Game over!'}
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {status === 'ready'
                  ? 'Press start and guide your snake to the food.'
                  : status === 'paused'
                    ? 'Take a breath. Your snake is waiting.'
                    : `Your final score is ${score}. Try again!`}
              </p>
              <button
                onClick={status === 'paused' ? () => setStatus('running') : resetGame}
                className="mt-5 rounded-xl bg-emerald-400 px-7 py-3 font-extrabold text-slate-950 transition hover:bg-emerald-300"
              >
                {status === 'ready' ? 'Start Game' : status === 'paused' ? 'Resume' : 'Play Again'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 flex w-full gap-3">
          <button
            onClick={() => status === 'running' ? setStatus('paused') : status === 'paused' ? setStatus('running') : resetGame()}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-bold transition hover:border-emerald-400"
          >
            {status === 'running' ? 'Pause' : status === 'paused' ? 'Resume' : 'Start'}
          </button>
          <button
            onClick={resetGame}
            className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 transition hover:bg-emerald-400"
          >
            Restart
          </button>
        </div>

        <div className="mt-6 w-full rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
            Mobile controls
          </p>
          <div className="mx-auto grid w-40 grid-cols-3 gap-2">
            <span />
            <button onClick={() => changeDirection(DIRECTIONS.ArrowUp)} className="control">↑</button>
            <span />
            <button onClick={() => changeDirection(DIRECTIONS.ArrowLeft)} className="control">←</button>
            <button onClick={() => changeDirection(DIRECTIONS.ArrowDown)} className="control">↓</button>
            <button onClick={() => changeDirection(DIRECTIONS.ArrowRight)} className="control">→</button>
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-6 text-slate-500">
          Keyboard: Arrow keys or W A S D · Space: pause / resume
        </p>
      </div>
    </main>
  )
}
