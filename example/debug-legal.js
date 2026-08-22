const lib = require('../lib/zh-chess.cjs')
const pen = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w'
function makeGame() {
  const g = new lib.default({ gameWidth: 800, gameHeight: 800 })
  g.gameStart('RED')
  return g
}
const g = makeGame()
g.setPenCodeList(pen)

// 复刻测试 assertLegalMovesConsistency 的确切调用序列
const pl = g.currentLivePieceList
const sideKey = g.currentSide
const legal = g.generateLegalMoves(sideKey)
const expected = []
for (const pc of pl) {
  if (pc.side !== sideKey) continue
  for (const mp of pc.getMovePoints(pl)) {
    const res = g.update(pc.getPoint(), mp, sideKey, false)
    if (res.flag && res.move) expected.push(`${pc.getPoint()},${mp.x},${mp.y}`)
  }
}
const keyOf = m => `${m.from.x},${m.from.y},${m.to.x},${m.to.y}`
const legalKeys = new Set(legal.map(keyOf))
console.log('legal:', legal.length, 'expected:', expected.length)
const onlyExpected = expected.filter(e => !legalKeys.has(e))
const onlyLegal = legal.map(keyOf).filter(k => !expected.includes(k))
console.log('onlyExpected:', onlyExpected)
console.log('onlyLegal:', onlyLegal)

// 检查 update 后棋子状态是否有副作用
const pc06 = g.currentLivePieceList.find(p => p.side === 'RED' && p.x === 0 && p.y === 6)
console.log(
  'after loop, piece (0,6) exists:',
  !!pc06,
  pc06 && pc06.isChoose,
  pc06 && pc06.isLastMove
)
