const { createCanvas } = require('canvas')
const CTX_WIDTH = 375, CTX_HEIGHT = 375
const canvas = createCanvas(CTX_WIDTH, CTX_HEIGHT)
const ctx = canvas.getContext('2d')
const zhChess = require("../lib/zh-chess.cjs").default
const fs = require('fs')
const out = fs.createWriteStream('./test.jpg')

const game = new zhChess({ ctx, gameWidth: CTX_WIDTH, gameHeight: CTX_HEIGHT })
game.gameStart("RED")
game.moveStr("炮2平5", "RED")
const stream = canvas.createJPEGStream()
stream.pipe(out)
out.on('finish', () => console.log('The JPEG file was created.'))
