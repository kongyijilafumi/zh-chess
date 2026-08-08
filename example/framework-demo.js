/**
 * 扩展框架示例：
 * 1. 文字棋盘导出
 * 2. 自定义方形棋子渲染
 * 3. 揭棋变体骨架（仅展示钩子用法，非完整揭棋实现）
 *
 * 运行：node example/framework-demo.js
 * （需先 npm run build）
 */
const ZhChess = require('../lib/zh-chess.cjs').default
const { exportTextBoard } = require('../lib/zh-chess.cjs')

/** 方形棋子渲染器：返回 true 跳过默认圆形绘制 */
const squarePieceRenderer = {
  drawPiece(ctx, piece, style, layout) {
    const { startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY, radius } = layout
    const x = startX + Math.abs(piece.x - gridDiffX) * gridWidth
    const y = startY + Math.abs(piece.y - gridDiffY) * gridHeight
    const size = radius * 1.6
    ctx.save()
    ctx.fillStyle = style.bgColor
    ctx.strokeStyle = piece.isChoose ? layout.colors.choosePeiceBorderColor : style.textColor
    ctx.lineWidth = 2
    ctx.fillRect(x - size / 2, y - size / 2, size, size)
    ctx.strokeRect(x - size / 2, y - size / 2, size, size)
    ctx.fillStyle = style.textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = radius + 'px yahei'
    ctx.fillText(style.displayName, x, y)
    ctx.restore()
    return true
  }
}

/**
 * 揭棋变体骨架：
 * - 用坐标 Map 保存「是否已翻开」（currentLivePieceList 为拷贝，不宜 WeakMap）
 * - getPieceDisplayName：未翻开显示「暗」
 * - initBoard：此处仍用标准开局，真实揭棋可在此洗牌布子
 * - afterMove：走动后翻开该子（示例）；完整揭棋规则请自行扩展
 */
const faceUpByPos = new Map()
const posKey = (x, y) => `${x},${y}`

const jieqiVariantSkeleton = {
  name: 'jieqi-skeleton',
  initBoard(game) {
    // 完整揭棋应在此：打乱棋子身份、全部暗置、按揭棋布局落子
    // 骨架：仍走标准 PEN 开局，并把非将帅棋标记为「未翻开」
    game.setPenCodeList(
      'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w'
    )
    faceUpByPos.clear()
    game.currentLivePieceList.forEach(p => {
      const isGeneral = p.name === '帅' || p.name === '将'
      faceUpByPos.set(posKey(p.x, p.y), isGeneral)
    })
  },
  getPieceDisplayName(piece) {
    if (!faceUpByPos.get(posKey(piece.x, piece.y))) return '暗'
    return piece.name
  },
  afterMove(ctx) {
    // 完整揭棋：走动/吃子后揭示真实身份等
    if (ctx.captured) {
      console.log('[jieqi-skeleton] 吃子，可在此翻开双方相关暗子', ctx.captured.toString())
    }
    faceUpByPos.delete(posKey(ctx.from.x, ctx.from.y))
    faceUpByPos.set(posKey(ctx.to.x, ctx.to.y), true)
  }
  // filterMoves / beforeMove / checkWinner 可按揭棋规则继续扩展
}

const squarePlugin = {
  name: 'square-pieces',
  renderer: squarePieceRenderer
}

const jieqiPlugin = {
  name: 'jieqi-skeleton',
  variant: jieqiVariantSkeleton
}

// --- 1) 文字导出（无插件） ---
const plain = new ZhChess()
plain.gameStart('RED')
console.log('=== 中文文字棋盘 ===')
console.log(plain.exportTextBoard({ style: 'chinese' }))
console.log('\n=== ASCII 文字棋盘 ===')
console.log(plain.exportTextBoard({ style: 'ascii' }))
console.log('\n=== 独立工具函数 ===')
console.log(exportTextBoard(plain.currentLivePieceList, { style: 'ascii', showCoords: false }))

// --- 2) 方形棋子插件（逻辑侧可无 canvas） ---
const themed = new ZhChess({ plugins: [squarePlugin] })
themed.gameStart('RED')
console.log('\n=== 已加载方形棋子插件，当前 PEN ===')
console.log(themed.getCurrentPenCode('RED'))

// --- 3) 揭棋骨架：未翻开显示「暗」 ---
const jieqi = new ZhChess({ plugins: [jieqiPlugin] })
jieqi.gameStart('RED')
console.log('\n=== 揭棋骨架文字棋盘（将帅明，其余暗） ===')
console.log(jieqi.exportTextBoard({ style: 'chinese' }))

jieqi.use(squarePlugin)
console.log('\n=== 同时挂载方形渲染 + 揭棋骨架 ===')
console.log('plugins ok, legal moves (RED):', jieqi.generateLegalMoves('RED').length)
