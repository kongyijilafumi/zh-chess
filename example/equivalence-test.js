/**
 * 黄金快照回归测试
 *
 * 对固定局面序列（含 4 个经典局面 + 固定随机种子的中局局面）计算
 * 「走法生成集合 + 逐走法走子判定」指纹，与 v2.1.1 生成的黄金快照
 * （example/equivalence-snapshot.json，来源 git 提交 20c0af8）逐位对比，
 * 确保任何重构或优化都不改变公开行为。
 *
 * 用法:
 *   node example/equivalence-test.js            # 对比黄金快照（默认）
 *   node example/equivalence-test.js --regen [rounds]  # 用当前库重新生成快照（有意变更行为时使用）
 */
const fs = require("fs")
const path = require("path")
const lib = require("../lib/zh-chess.cjs")

const REGEN = process.argv.includes("--regen")
const ROUNDS = Number(process.argv.find((a) => /^\d+$/.test(a)) || 300)
const SNAPSHOT_PATH = path.join(__dirname, "equivalence-snapshot.json")

function makeGame() {
  const g = new lib.default({ gameWidth: 800, gameHeight: 800 })
  g.gameStart("RED")
  return g
}

const seedPens = [
  "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w",
  "2bakab2/9/2n1c1n2/p1p1p1p1p/9/2P6/P2P1P1P1/2N1C1N2/9/2BAKAB2 w",
  "3k5/4a4/4b4/9/9/4P4/9/4B4/4A4/3K5 w",
  "r1ba1ab1r/4k4/2n1c1n2/p1p1p1p1p/9/9/P1P1P1P1P/2N1C1N2/4K4/R1BA1AB1R w",
]

const KIND_CHAR = {
  RookPiece: "R",
  HorsePiece: "H",
  CannonPiece: "C",
  SoldierPiece: "S",
  GeneralPiece: "G",
  AdvisorPiece: "A",
  ElephantPiece: "E",
}

function randomMove(game, side, rand) {
  const pl = game.currentLivePieceList
  const cands = []
  for (const pc of pl) {
    if (pc.side !== side) continue
    for (const mp of pc.getMovePoints(pl)) cands.push({ from: pc.getPoint(), to: mp })
  }
  if (!cands.length) return null
  for (let i = cands.length - 1; i > 0; i--) {
    const j = (rand() * (i + 1)) | 0
    ;[cands[i], cands[j]] = [cands[j], cands[i]]
  }
  for (const c of cands) {
    const res = game.update(c.from, c.to, side, true)
    if (res.flag && res.move) {
      res.cb && res.cb()
      return c
    }
  }
  return null
}

function genRandomPosition(rand, steps) {
  const g = makeGame()
  g.gameStart("RED")
  let side = g.currentSide
  for (let i = 0; i < steps; i++) {
    const m = randomMove(g, side, rand)
    if (!m) break
    side = g.currentSide
  }
  return g.getCurrentPenCode(g.currentSide)
}

/** 计算局面指纹：按位置排序的每枚棋子 (x,y,side,kind):moves:judges */
function fingerprint(pen) {
  const g = makeGame()
  g.setPenCodeList(pen)
  const pl = g.currentLivePieceList
  const side = g.currentSide
  const sorted = [...pl].sort((a, b) => a.x - b.x || a.y - b.y)
  const parts = []
  for (const pc of sorted) {
    const mps = pc.getMovePoints(pl)
    const pairs = mps.map((mp) => ({
      mp,
      x: mp.x,
      y: mp.y,
      dx: mp.disPoint ? mp.disPoint.x : -1,
      dy: mp.disPoint ? mp.disPoint.y : -1,
    }))
    pairs.sort((a, b) => a.x - b.x || a.y - b.y)
    const movesKey = pairs.map((p) => `${p.x}${p.y}${p.dx >= 0 ? "." + p.dx + p.dy : ""}`).join(",")
    const judgesKey = pairs
      .map((p) => {
        const res = g.update(pc.getPoint(), p.mp, side, false)
        return res.flag && res.move ? "1" : "0"
      })
      .join("")
    const sideChar = pc.side === "RED" ? "r" : "b"
    const kindChar = KIND_CHAR[pc.constructor.name] || "?"
    parts.push(`${pc.x}${pc.y}${sideChar}${kindChar}:${movesKey}:${judgesKey}`)
  }
  return parts.join(";")
}

function generatePositions(rand, rounds) {
  const positions = [...seedPens]
  const startSteps = [10, 20, 30, 40, 50]
  for (let r = 0; r < rounds; r++) {
    positions.push(genRandomPosition(rand, startSteps[r % startSteps.length]))
  }
  return positions
}

if (REGEN) {
  let s = 42
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
  const positions = generatePositions(rand, ROUNDS)
  const fingerprints = {}
  for (const pen of positions) fingerprints[pen] = fingerprint(pen)
  const out = {
    meta: {
      source: "current lib (regen)",
      generated: new Date().toISOString(),
      rounds: ROUNDS,
      positions: positions.length,
      unique: Object.keys(fingerprints).length,
    },
    positions,
    fingerprints,
  }
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(out, null, 1), "utf8")
  console.log(`[regen] snapshot rewritten: ${positions.length} positions, ${Object.keys(fingerprints).length} unique`)
  return
}

const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8"))
const stats = { compared: 0, same: 0, mismatch: 0 }
const failures = []
for (const pen of snapshot.positions) {
  const fp = fingerprint(pen)
  stats.compared++
  if (fp === snapshot.fingerprints[pen]) {
    stats.same++
  } else {
    stats.mismatch++
    if (stats.mismatch <= 5) {
      failures.push({ pen, expected: snapshot.fingerprints[pen].slice(0, 300), actual: fp.slice(0, 300) })
    }
  }
}

console.log("================================================")
console.log(`snapshot source       : ${snapshot.meta.source}`)
console.log(`positions compared    : ${stats.compared}`)
console.log(`fingerprint same      : ${stats.same}`)
console.log(`fingerprint mismatch  : ${stats.mismatch}`)
if (failures.length) {
  for (const f of failures) {
    console.log(`  [mismatch] ${f.pen}`)
    console.log(`    expected: ${f.expected}`)
    console.log(`    actual  : ${f.actual}`)
  }
}
if (stats.mismatch === 0) {
  console.log("RESULT: PASS (与 v2.1.1 黄金快照行为一致)")
} else {
  console.log("RESULT: FAIL (行为发生变更!)")
  process.exitCode = 1
}
