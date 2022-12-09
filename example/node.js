const CTX_WIDTH = 375, CTX_HEIGHT = 375
const zhChess = require("../lib/zh-chess.cjs").default

const game = new zhChess({ gameWidth: CTX_WIDTH, gameHeight: CTX_HEIGHT })
game.gameStart("RED")
game.moveStr("炮2平5", "RED")
console.log(game.getCurrentPenCode("BLACK"));
