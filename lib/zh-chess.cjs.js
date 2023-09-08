'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */

var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
  return extendStatics(d, b);
};

function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() { this.constructor = d; }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
  __assign = Object.assign || function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
  };
  return __assign.apply(this, arguments);
};

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * 玩家Map数据 根据 英文 映射中文名称
 * @example peiceSideMap["RED"] // 返回 红方
 * @example peiceSideMap["BLACK"] // 返回 黑方
 */
var peiceSideMap = {
    "RED": "红方",
    "BLACK": "黑方"
};
/**
 * 坐标点
 */
var Point = /** @class */ (function () {
    function Point(x, y) {
        /**
         * 坐标x
         */
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.x = x;
        this.y = y;
    }
    /**
     * 格式化输出坐标点
     * @returns 例如返回：`(1,1)`
     */
    Object.defineProperty(Point.prototype, "toString", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            return "(".concat(this.x, ",").concat(this.y, ")");
        }
    });
    return Point;
}());
/**
 * 象棋移动的坐标点
 */
var MovePoint = /** @class */ (function (_super) {
    __extends(MovePoint, _super);
    function MovePoint(x, y, p) {
        var _this = _super.call(this, x, y) || this;
        /**
         * 阻碍点(坐标)
         */
        Object.defineProperty(_this, "disPoint", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        _this.disPoint = new Point(p.x, p.y);
        return _this;
    }
    /**
     * 格式化输出移动点
     * @returns 例如返回：`(1,1)` 或者 `(1,1)<阻碍点(2,2)>`
     */
    Object.defineProperty(MovePoint.prototype, "toString", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var hasDisPoint = !(this.disPoint.x === 10 && this.disPoint.y === 10);
            return "(".concat(this.x, ",").concat(this.y, ")").concat(hasDisPoint ? '<阻碍点' + this.disPoint + '>' : '');
        }
    });
    return MovePoint;
}(Point));

var notExistPoint = { x: 10, y: 10 };
var findPiece$1 = function (pl, p) { return pl.find(function (item) { return item.x === p.x && item.y === p.y; }); };
var Piece = /** @class */ (function () {
    function Piece(pieceInfo) {
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "side", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isChoose", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isLastMove", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.x = pieceInfo.x;
        this.y = pieceInfo.y;
        this.name = pieceInfo.name;
        this.side = pieceInfo.side;
        this.isChoose = pieceInfo.isChoose || false;
        this.isLastMove = pieceInfo.isLastMove;
    }
    /**
     * 格式化象棋棋子输出字符串信息
     * @returns 例如返回`[RED方]:车(1,1)`
     */
    Object.defineProperty(Piece.prototype, "toString", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            return "[".concat(this.side, "\u65B9]:").concat(this.name, "(").concat(this.x, ",").concat(this.y, ")");
        }
    });
    /**
     * 根据传入的可以移动点和棋子坐标列表来过滤掉移动点
     * @param list 移动点列表
     * @param pl 棋子列表
     * @returns 返回这个棋子可以移动点列表
     */
    Object.defineProperty(Piece.prototype, "filterMovePoints", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (list, pl) {
            var _this = this;
            return list.filter(function (i) {
                var pointHasSameSidePeice = pl.find(function (p) { return p.x === i.x && p.y === i.y && p.side === _this.side; });
                return i.x >= 0 && i.x <= 8 && i.y >= 0 && i.y <= 9 && !pointHasSameSidePeice;
            });
        }
    });
    /**
     * 返回当前棋子的坐标信息
     * @returns 包含 name side x y 信息
     */
    Object.defineProperty(Piece.prototype, "getCurrentInfo", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            return {
                side: this.side,
                name: this.name,
                x: this.x,
                y: this.y,
                isLastMove: this.isLastMove
            };
        }
    });
    /**
     * 更新自己坐标点
     * @param p 坐标点
     */
    Object.defineProperty(Piece.prototype, "update", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (p) {
            this.x = p.x;
            this.y = p.y;
        }
    });
    /**
     *
     * @param ctx 画布
     * @param startX 画布x轴起始位置
     * @param startY 画布y轴起始位置
     * @param gridWidth 棋盘格子宽带
     * @param gridHeight 棋盘格子高带
     * @param gridDiffX 游戏象棋玩家格子x轴差值 用于区分红黑棋
     * @param gridDiffY 游戏象棋玩家格子y轴差值 用于区分红黑棋
     * @param radius 象棋园半径
     * @param textColor 象棋字体颜色
     * @param bgColor 象棋背景颜色
     */
    Object.defineProperty(Piece.prototype, "draw", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (ctx, startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY, radius, textColor, bgColor) {
            var borderColor = this.isChoose ? "red" : "#000";
            var x = startX + Math.abs(this.x - gridDiffX) * gridWidth;
            var y = startY + Math.abs(this.y - gridDiffY) * gridHeight;
            var r = radius, ty = 0;
            ctx.fillStyle = bgColor;
            var drawBoder = function (x, y, r, startAngle, endAngle) {
                ctx.beginPath();
                ctx.arc(x, y, r, startAngle, endAngle);
                ctx.closePath();
                ctx.stroke();
            };
            // 选中动画
            if (this.isChoose || this.isLastMove) {
                r = r / 0.9;
                // ty = this.side === "RED" ? -.3 * radius : .3 * radius
                // ty = gridDiffY > 0 ? ty * -1 : ty
            }
            // 象棋背景
            ctx.beginPath();
            ctx.arc(x, y + ty, r, 0, 2 * Math.PI);
            // if (piece.isChoose) {
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 4;
            ctx.shadowColor = '#333';
            ctx.shadowBlur = 5;
            // }
            ctx.fill();
            ctx.closePath();
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            // 象棋圆圈
            ctx.strokeStyle = borderColor;
            drawBoder(x, y + ty, r, 0, 2 * Math.PI);
            drawBoder(x, y + ty, r - 3, 0, 2 * Math.PI);
            // 字
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = textColor;
            ctx.font = radius + "px yahei";
            ctx.fillText(this.name, x, y + ty);
        }
    });
    /**
     * 根据棋子列表判断 当前棋子可移动的点
     * @param _pl 棋子列表
     * @returns
     */
    Object.defineProperty(Piece.prototype, "getMovePoints", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (_pl) {
            return [];
        }
    });
    /**
     * 画出棋子可移动的点
     * @param ctx canvas画布
     * @param pl 当前棋子列表
     * @param startX x
     * @param startY y
     * @param gridWidth 棋盘格子宽度
     * @param gridHeight 棋盘格子高度
     * @param gridDiffX 棋子x轴差值
     * @param gridDiffY 棋子y轴差值
     * @param radius 棋子半径
     */
    Object.defineProperty(Piece.prototype, "drawMovePoints", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (ctx, pl, startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY, radius, moveColor) {
            ctx.fillStyle = moveColor;
            this.getMovePoints(pl).forEach(function (p) {
                var x = startX + Math.abs(p.x - gridDiffX) * gridWidth;
                var y = startY + Math.abs(p.y - gridDiffY) * gridHeight;
                ctx.beginPath();
                ctx.arc(x, y, radius * .25, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.fill();
            });
        }
    });
    Object.defineProperty(Piece.prototype, "getPoint", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            return new Point(this.x, this.y);
        }
    });
    return Piece;
}());
/**
 * 象棋：车
 */
var RookPiece = /** @class */ (function (_super) {
    __extends(RookPiece, _super);
    function RookPiece() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * 根据车移动的方向得出障碍棋子列表
     * @param p 坐标点或者移动点
     * @param pieceList 棋子列表
     * @returns 返回存在障碍的棋子列表
     */
    Object.defineProperty(RookPiece.prototype, "getMoveObstaclePieceList", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (p, pieceList) {
            var _this = this;
            // x 或者 y 轴
            var diffKey = this.x === p.x ? "y" : "x";
            var key = diffKey === "x" ? "y" : "x";
            // 移动步数
            var diff = this[diffKey] - p[diffKey];
            var min = diff > 0 ? p[diffKey] : this[diffKey];
            var max = diff < 0 ? p[diffKey] : this[diffKey];
            // 障碍物棋子列表
            var list = pieceList.filter(function (item) {
                var notSelf = !(_this.x === item.x && _this.y === item.y);
                var isOnSameLine = item[key] === p[key];
                var inRangeY = item[diffKey] > min && item[diffKey] < max;
                var isSameSide = item.side === _this.side;
                var inSameRangeY = item[diffKey] >= min && item[diffKey] <= max;
                return (isOnSameLine && notSelf && inRangeY) || (isOnSameLine && notSelf && isSameSide && inSameRangeY);
            });
            return list;
        }
    });
    /**
     * 根据象棋自己的移动规律以及棋子列表的位置得出是否可以移动到指定的坐标上
     * @param p 坐标点 或 移动点
     * @param pieceList 棋盘列表
     * @returns 返回移动结果
     */
    Object.defineProperty(RookPiece.prototype, "move", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (p, pieceList) {
            if (p.x < 0 || p.x > 8 || p.y < 0 || p.y > 9) {
                return { flag: false, message: "移动位置不符合规则" };
            }
            // 如果在 x,y 轴上移动
            if (this.y === p.y || this.x === p.x) {
                var list = this.getMoveObstaclePieceList(p, pieceList);
                if (list.length > 0) {
                    return { flag: false, message: "移动距离中存在障碍物：" + list.join("---") };
                }
                return { flag: true };
            }
            // console.log("无效移动");
            return { flag: false, message: "移动位置不符合规则" };
        }
    });
    /**
     * 根据棋子列表的坐标获取当前棋子的可以移动点列表
     * @param pl 棋子列表
     * @returns 返回移动点列表
     */
    Object.defineProperty(RookPiece.prototype, "getMovePoints", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (pl) {
            var _this = this;
            var xpoints = Array.from({ length: 9 }, function (_v, k) { return new MovePoint(k, _this.y, notExistPoint); });
            var ypoints = Array.from({ length: 10 }, function (_v, k) { return new MovePoint(_this.x, k, notExistPoint); });
            var points = xpoints.concat(ypoints).filter(function (i) { return !(_this.x === i.x && _this.y === i.y); });
            if (!pl) {
                return points;
            }
            return points.filter(function (item) { return _this.move(item, pl).flag === true; });
        }
    });
    return RookPiece;
}(Piece));
/**
 * 象棋：马
 */
var HorsePiece = /** @class */ (function (_super) {
    __extends(HorsePiece, _super);
    function HorsePiece() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * 根据棋子列表的坐标获取当前棋子的可以移动点列表
     * @param pl 棋子列表
     * @returns 返回移动点列表
     */
    Object.defineProperty(HorsePiece.prototype, "getMovePoints", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (pl) {
            var mps = [];
            for (var index = 0; index < 2; index++) {
                // 左
                var lx = this.x - 2;
                var ly = index * 2 + (this.y - 1);
                mps.push(new MovePoint(lx, ly, { x: this.x - 1, y: this.y }));
                // 右
                var rx = this.x + 2;
                var ry = ly;
                mps.push(new MovePoint(rx, ry, { x: this.x + 1, y: this.y }));
                // 上
                var tx = index * 2 + (this.x - 1);
                var ty = this.y - 2;
                mps.push(new MovePoint(tx, ty, { x: this.x, y: this.y - 1 }));
                // 下
                var bx = tx;
                var by = this.y + 2;
                mps.push(new MovePoint(bx, by, { x: this.x, y: this.y + 1 }));
            }
            return this.filterMovePoints(mps, pl);
        }
    });
    /**
     * 根据传入的可以移动点和棋子坐标列表来过滤掉移动点
     * @param list 移动点列表
     * @param pl 棋子列表
     * @returns 返回这个棋子可以移动点列表
     */
    Object.defineProperty(HorsePiece.prototype, "filterMovePoints", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (list, pl) {
            return _super.prototype.filterMovePoints.call(this, list, pl).filter(function (item) { return !Boolean(findPiece$1(pl, item.disPoint)); });
        }
    });
    /**
     * 根据象棋自己的移动规律以及棋子列表的位置得出是否可以移动到指定的坐标上
     * @param p 坐标点 或 移动点
     * @param pieceList 棋盘列表
     * @returns 返回移动结果
     */
    Object.defineProperty(HorsePiece.prototype, "move", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (p, pieceList) {
            var mps = this.getMovePoints(pieceList);
            var mp = mps.find(function (i) { return p.x === i.x && p.y === i.y; });
            if (!mp) {
                return { flag: false, message: "".concat(this, "\u8D70\u6CD5\u9519\u8BEF\uFF0C\u4E0D\u53EF\u4EE5\u843D\u5728").concat(p, "\u4E0A") };
            }
            var hasPeice = pieceList.find(function (i) { return i.x === mp.disPoint.x && i.y === mp.disPoint.y; });
            if (hasPeice) {
                return { flag: false, message: "".concat(this, "\u8D70\u6CD5\u9519\u8BEF\uFF0C").concat(hasPeice, "\u5361\u4F4F\u4E86").concat(this.name, "\u7684\u53BB\u5411") };
            }
            return { flag: true };
        }
    });
    return HorsePiece;
}(Piece));
/**
 * 象棋：象
 */
var ElephantPiece = /** @class */ (function (_super) {
    __extends(ElephantPiece, _super);
    function ElephantPiece() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
    * 根据棋子列表的坐标获取当前棋子的可以移动点列表
    * @param pl 棋子列表
    * @returns 返回移动点列表
    */
    Object.defineProperty(ElephantPiece.prototype, "getMovePoints", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (pl) {
            var mps = [];
            for (var index = 0; index < 2; index++) {
                // 上
                var tx = this.x - 2 + index * 4;
                var ty = this.y - 2;
                var tdx = this.x - 1 + index * 2;
                var tdy = this.y - 1;
                mps.push(new MovePoint(tx, ty, { x: tdx, y: tdy }));
                // 下
                var bx = this.x - 2 + index * 4;
                var by = this.y + 2;
                var bdx = tdx;
                var bdy = this.y + 1;
                mps.push(new MovePoint(bx, by, { x: bdx, y: bdy }));
            }
            return this.filterMovePoints(mps, pl).filter(function (item) { return !Boolean(findPiece$1(pl, item.disPoint)); });
        }
    });
    /**
      * 根据传入的可以移动点和棋子坐标列表来过滤掉移动点
      * @param list 移动点列表
      * @param pl 棋子列表
      * @returns 返回这个棋子可以移动点列表
      */
    Object.defineProperty(ElephantPiece.prototype, "filterMovePoints", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (list, pl) {
            var _this = this;
            return list.filter(function (i) {
                var pointHasSameSidePeice = pl.find(function (p) { return p.x === i.x && p.y === i.y && p.side === _this.side; });
                return !pointHasSameSidePeice &&
                    (i.x >= 0 && i.x <= 8) &&
                    (i.y >= 0 && i.y <= 9) &&
                    ((_this.side === "RED" && i.y >= 5) ||
                        (_this.side === "BLACK" && i.y <= 4));
            });
        }
    });
    return ElephantPiece;
}(HorsePiece));
/**
 * 象棋：士
 */
var KnightPiece = /** @class */ (function (_super) {
    __extends(KnightPiece, _super);
    function KnightPiece() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
      * 根据棋子列表的坐标获取当前棋子的可以移动点列表
      * @param pl 棋子列表
      * @returns 返回移动点列表
      */
    Object.defineProperty(KnightPiece.prototype, "getMovePoints", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (pl) {
            var mps = [];
            for (var index = 0; index < 2; index++) {
                // 上
                var tx = this.x - 1 + index * 2;
                var ty = this.y - 1;
                mps.push(new MovePoint(tx, ty, notExistPoint));
                //下
                var bx = this.x - 1 + index * 2;
                var by = this.y + 1;
                mps.push(new MovePoint(bx, by, notExistPoint));
            }
            return this.filterMovePoints(mps, pl);
        }
    });
    /**
      * 根据传入的可以移动点和棋子坐标列表来过滤掉移动点
      * @param list 移动点列表
      * @param pl 棋子列表
      * @returns 返回这个棋子可以移动点列表
      */
    Object.defineProperty(KnightPiece.prototype, "filterMovePoints", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (list, pl) {
            var _this = this;
            return list.filter(function (i) {
                var pointHasSameSidePeice = pl.find(function (p) { return p.x === i.x && p.y === i.y && p.side === _this.side; });
                return !pointHasSameSidePeice &&
                    (i.x <= 5 && i.x >= 3) &&
                    ((_this.side === "RED" && i.y >= 7 && i.y <= 9) ||
                        (_this.side === "BLACK" && i.y >= 0 && i.y <= 2));
            });
        }
    });
    return KnightPiece;
}(ElephantPiece));
/**
 * 象棋：将领
 */
var GeneralPiece = /** @class */ (function (_super) {
    __extends(GeneralPiece, _super);
    function GeneralPiece() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
      * 根据棋子列表的坐标获取当前棋子的可以移动点列表
      * @param pl 棋子列表
      * @returns 返回移动点列表
      */
    Object.defineProperty(GeneralPiece.prototype, "getMovePoints", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (pl) {
            var mps = [
                new MovePoint(this.x - 1, this.y, notExistPoint),
                new MovePoint(this.x + 1, this.y, notExistPoint),
                new MovePoint(this.x, this.y - 1, notExistPoint),
                new MovePoint(this.x, this.y + 1, notExistPoint),
            ];
            return this.filterMovePoints(mps, pl);
        }
    });
    return GeneralPiece;
}(KnightPiece));
/**
 * 象棋：炮
 */
var CannonPiece = /** @class */ (function (_super) {
    __extends(CannonPiece, _super);
    function CannonPiece() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * 根据象棋自己的移动规律以及棋子列表的位置得出是否可以移动到指定的坐标上
     * @param p 坐标点 或 移动点
     * @param pieceList 棋盘列表
     * @returns 返回移动结果
     */
    Object.defineProperty(CannonPiece.prototype, "move", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (p, pieceList) {
            if (p.x < 0 || p.x > 8 || p.y < 0 || p.y > 9) {
                return { flag: false, message: "移动位置不符合规则" };
            }
            // 如果在 x, y 轴上移动
            if (this.y === p.y || this.x === p.x) {
                var list = this.getMoveObstaclePieceList(p, pieceList);
                // console.log(list);
                // 炮架 数量超过1个
                if (list.length > 1) {
                    return { flag: false, message: "移动距离存在多个炮架：" + list.join("---") };
                }
                // 有炮架 且 炮架位置 就是目标位置
                if (list.length === 1 && (list[0].x === p.x && list[0].y === p.y)) {
                    return { flag: false, message: "无法击中敌方棋子(缺少炮架)，移动无效" };
                }
                var hasPeice = pieceList.find(function (i) { return i.x === p.x && i.y === p.y; });
                if (list.length === 1) {
                    if (hasPeice) {
                        return { flag: true };
                    }
                    return { flag: false, message: "无法击中敌方棋子，移动无效" };
                }
                // 无炮架  且 目标位置有敌方棋子
                if (list.length === 0 && hasPeice) {
                    return { flag: false, message: "无法击中敌方棋子(缺少炮架)，移动无效" };
                }
                // console.log(`${this}可以移动到点${p}`);
                return { flag: true };
            }
            return { flag: false, message: "移动位置不符合规则" };
        }
    });
    return CannonPiece;
}(RookPiece));
/**
 * 象棋：兵
 */
var SoldierPiece = /** @class */ (function (_super) {
    __extends(SoldierPiece, _super);
    function SoldierPiece() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
      * 根据棋子列表的坐标获取当前棋子的可以移动点列表
      * @param pl 棋子列表
      * @returns 返回移动点列表
      */
    Object.defineProperty(SoldierPiece.prototype, "getMovePoints", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (pl) {
            var isCross = this.side === "RED" ? (this.y <= 4) : (this.y >= 5);
            var step = this.side === "RED" ? -1 : +1;
            var startMp = new MovePoint(this.x, this.y + step, notExistPoint);
            var mps = isCross ?
                [
                    startMp,
                    new MovePoint(this.x - 1, this.y, notExistPoint),
                    new MovePoint(this.x + 1, this.y, notExistPoint),
                ] :
                [startMp];
            return this.filterMovePoints(mps, pl);
        }
    });
    return SoldierPiece;
}(HorsePiece));
/**
 * 象棋棋子map表
 * @example chessOfPeiceMap["车"]({ ... }:PieceInfo) // 返回一个实例棋子 RookPiece
 * @example chessOfPeiceMap["马"]({ ... }:PieceInfo) // 返回一个实例棋子 HorsePiece
 * @example chessOfPeiceMap["炮"]({ ... }:PieceInfo) // 返回一个实例棋子 CannonPiece
 * @example chessOfPeiceMap["相"]({ ... }:PieceInfo) // 返回一个实例棋子 ElephantPiece
 * @example chessOfPeiceMap["士"]({ ... }:PieceInfo) // 返回一个实例棋子 KnightPiece
 * @example chessOfPeiceMap["帅"]({ ... }:PieceInfo) // 返回一个实例棋子 GeneralPiece
 * @example chessOfPeiceMap["兵"]({ ... }:PieceInfo) // 返回一个实例棋子 SoldierPiece
 */
var chessOfPeiceMap = {
    "仕": function (info) { return new KnightPiece(info); },
    "兵": function (info) { return new SoldierPiece(info); },
    "卒": function (info) { return new SoldierPiece(info); },
    "士": function (info) { return new KnightPiece(info); },
    "将": function (info) { return new GeneralPiece(info); },
    "帅": function (info) { return new GeneralPiece(info); },
    "炮": function (info) { return new CannonPiece(info); },
    "相": function (info) { return new ElephantPiece(info); },
    "砲": function (info) { return new CannonPiece(info); },
    "象": function (info) { return new ElephantPiece(info); },
    "車": function (info) { return new RookPiece(info); },
    "车": function (info) { return new RookPiece(info); },
    "馬": function (info) { return new HorsePiece(info); },
    "马": function (info) { return new HorsePiece(info); },
};

/**
* 根据棋盘列表位置返回棋子 可能该位置没有棋子
* @param pl 棋盘列表
* @param p 棋盘坐标点
* @returns 返回当前棋盘坐标点上的棋子
*/
var numPos = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
var zhnumPos = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
var strPos = ["前", "中", "后"];
var moveStyles = ["进", "平", "退"], moveStyleInput = "(".concat(moveStyles.join("|"), ")");
var numMergePos = numPos.concat(zhnumPos);
var numInput = "(".concat(numMergePos.join("|"), ")");
var pieceNameInput = "(".concat(Object.keys(chessOfPeiceMap).join("|"), ")");
// 前兵进一
var parse_reg_1 = new RegExp("(".concat(strPos.concat(numMergePos).join("|"), ")").concat(pieceNameInput).concat(moveStyleInput).concat(numInput, "$"));
// 车9进1
var parse_reg_2 = new RegExp("".concat(pieceNameInput).concat(numInput).concat(moveStyleInput).concat(numInput, "$"));
// 前6进1
var parse_reg_3 = new RegExp("(".concat(strPos.join("|"), ")").concat(numInput).concat(moveStyleInput).concat(numInput, "$"));
var parseStrToPoint = function (str, side, pl) {
    var strRes;
    var currentSidePieceList = pl.filter(function (p) { return p.side === side; });
    var isRedSide = side === "RED";
    var pieceDiffX = side === "BLACK" ? 8 : 0;
    var pieceDiffY = side === "BLACK" ? 9 : 0;
    var sideOpposite = isRedSide ? 1 : -1;
    // 前6进1 只有兵才会出现这种情况
    var strRes1;
    if (parse_reg_3.test(str) && (strRes1 = parse_reg_3.exec(str))) {
        var pieceXPos_1 = Math.abs((formatChooseNum(strRes1[2]) - 1) - pieceDiffX);
        var moveStyle = strRes1[3];
        var moveStep = formatChooseNum(strRes1[4]);
        var pieceName_1 = getSidePieceName("兵", side);
        if (moveStyle === "平") {
            moveStep -= 1;
        }
        // 获取 该棋子列表 
        var findPL = currentSidePieceList.filter(function (p) { return p.x === pieceXPos_1 && p.name === pieceName_1; });
        // 如果小于 2 不适用 此正则匹配
        if (findPL.length < 2) {
            return false;
        }
        findPL.sort(function (a, b) { return isRedSide ? a.y - b.y : b.y - a.y; });
        var index = findPL.length === 3 ? formatChooseNum(strRes1[1]) - 1 : (strRes1[1] === "前" ? 0 : 1);
        // 获取到棋子
        var choose = findPL[index];
        var cy = Math.abs(choose.y - pieceDiffY);
        // 前进
        var y = isRedSide ? cy - moveStep * sideOpposite : cy + moveStep * sideOpposite;
        if (moveStyle === moveStyles[0]) {
            var mp = new Point(choose.x, y);
            return { mp: mp, choose: choose };
        }
        // 平
        if (moveStyle === moveStyles[1]) {
            var mp = new Point(Math.abs(moveStep - pieceDiffX), cy);
            return { mp: mp, choose: choose };
        }
    }
    //  前车进八  or  一兵进1
    if (parse_reg_1.test(str) && (strRes = parse_reg_1.exec(str))) {
        parse_reg_1.lastIndex = 0;
        // 获得 棋子名字
        var pieceName_2 = getSidePieceName(strRes[2], side);
        var moveStyle = strRes[3], moveStep = formatChooseNum(strRes[4]);
        if (moveStyle === "平") {
            moveStep -= 1;
        }
        // 获取 该棋子列表 
        var findPL = currentSidePieceList.filter(function (p) { return p.name === pieceName_2; });
        // 如果小于 2 不适用 此正则匹配
        if (findPL.length < 2) {
            return false;
        }
        // 获取 棋子所对应的 x轴 的次数
        var maxX = 0, lineX_1;
        var xmap_1 = {};
        findPL.forEach(function (p) {
            if (xmap_1[p.x]) {
                xmap_1[p.x] += 1;
            }
            else {
                xmap_1[p.x] = 1;
            }
        });
        var linexs = Object.keys(xmap_1);
        for (var i = 0; i < linexs.length; i++) {
            var ele = xmap_1[linexs[i]];
            if (maxX < ele) {
                maxX = ele;
            }
            else if (maxX === ele) {
                // 如果两个兵 两组并排 不适用 此正则
                return false;
            }
        }
        lineX_1 = linexs[0];
        maxX = xmap_1[lineX_1];
        if (maxX < 2) {
            return false;
        }
        var linePL = findPL.filter(function (p) { return String(p.x) === lineX_1; });
        var firstStr = strRes[1];
        // 如果取中字 必须有三个兵在一条竖线上
        if (firstStr === strPos[1] && maxX !== 3) {
            return false;
        }
        // 如果多个兵在一条竖线上 数字开头
        if (maxX >= 3) {
            linePL.sort(function (a, b) { return isRedSide ? a.y - b.y : b.y - a.y; });
            // 获取到棋子
            var choose = linePL[formatChooseNum(firstStr) - 1];
            var cy = Math.abs(choose.y - pieceDiffY);
            // 前进
            var y = isRedSide ? cy - moveStep * sideOpposite : cy + moveStep * sideOpposite;
            if (moveStyle === moveStyles[0]) {
                var mp = new Point(choose.x, y);
                return { mp: mp, choose: choose };
            }
            // 平
            if (moveStyle === moveStyles[1]) {
                var mp = new Point(Math.abs(moveStep - pieceDiffX), cy);
                return { mp: mp, choose: choose };
            }
        }
        // 如果两个相同的棋子在一条竖线上
        if (maxX === 2 && strPos.filter(function (i) { return i !== "中"; }).includes(firstStr)) {
            var index = firstStr === strPos[0] ? 0 : 1;
            var choose = linePL[index];
            var cy = choose.y;
            var cx = choose.x;
            // x 距离差
            var diffX = cx - moveStep;
            // 前进 后退 x 一致 y取想法
            if (moveStyle === moveStyles[0] || moveStyle === moveStyles[2]) {
                // 距离长度
                var absDiffX = Math.abs(diffX);
                var yOpposite = moveStyle === moveStyles[2] ? -1 : 1;
                // 马
                if (pieceName_2 === "马" || pieceName_2 === "馬") {
                    if (absDiffX >= 1 && absDiffX <= 2) {
                        var isRow = absDiffX == 1 ? true : false;
                        var y_1 = isRow ? cy - (2 * sideOpposite * yOpposite) : cy - (1 * sideOpposite * yOpposite);
                        var x = diffX < 0 ? (isRow ? cx - (1 * sideOpposite) : cx - (2 * sideOpposite)) : (isRow ? cx + (1 * sideOpposite) : cx + (2 * sideOpposite));
                        return { choose: choose, mp: new Point(x, y_1) };
                    }
                    else {
                        return false;
                    }
                }
                // 象 士
                var elePieceList = ["相", "象"], kinPieceList = ["仕", "士"], isEle = elePieceList.includes(pieceName_2);
                if (isEle || kinPieceList.includes(pieceName_2)) {
                    var mStep = isEle ? 2 : 1;
                    if (isEle && absDiffX !== 3) {
                        return false;
                    }
                    if (!isEle && absDiffX !== 1) {
                        return false;
                    }
                    var x = diffX > 0 ? cx + (mStep * sideOpposite) : cx - (mStep * sideOpposite);
                    var y_2 = cy - (mStep * sideOpposite * yOpposite);
                    return { choose: choose, mp: new Point(x, y_2) };
                }
                // 车 将 兵 跑
                var y = cy - (moveStep * sideOpposite * yOpposite);
                return { choose: choose, mp: new Point(cx, y) };
            }
            // 平
            if (moveStyle === moveStyles[1]) {
                // 车 将 兵 跑
                return { choose: choose, mp: new Point(Math.abs(moveStep - pieceDiffX), cy) };
            }
        }
        return false;
    }
    // 车9进1
    var execRes;
    if (parse_reg_2.test(str) && (execRes = parse_reg_2.exec(str))) {
        var pieceName_3 = getSidePieceName(execRes[1], side);
        var pieceXPos = formatChooseNum(execRes[2]) - 1;
        var moveStyle = execRes[3];
        var moveStep = formatChooseNum(execRes[4]);
        if (moveStyle === "平") {
            moveStep -= 1;
        }
        var px_1 = Math.abs(pieceXPos - pieceDiffX);
        var choose = currentSidePieceList.filter(function (p) { return p.x === px_1 && p.name === pieceName_3; });
        // 没找到棋子
        if (!choose.length) {
            return false;
        }
        // 当两个或更多棋子在一条直线上
        if (choose.length >= 2) {
            return false;
        }
        var cy = choose[0].y;
        var cx = choose[0].x;
        var diffX = Math.abs(cx - pieceDiffX) - moveStep;
        var absDiffX = Math.abs(diffX);
        // 前进 后退 x 一致 y取移动相反
        if (moveStyle === moveStyles[0] || moveStyle === moveStyles[2]) {
            // 距离长度
            var yOpposite = moveStyle === moveStyles[2] ? -1 : 1;
            // 马
            if (pieceName_3 === "马" || pieceName_3 === "馬") {
                var absx = Math.abs((Math.abs(cx - pieceDiffX) - (moveStep - 1)));
                if (absx >= 1 && absx <= 2) {
                    var isRow = absx === 1 ? true : false;
                    var y_3 = isRow ? cy - (2 * sideOpposite * yOpposite) : cy - (1 * sideOpposite * yOpposite);
                    var x = (diffX + 1) < 0 ? (isRow ? cx + (1 * sideOpposite) : cx + (2 * sideOpposite)) : (isRow ? cx - (1 * sideOpposite) : cx - (2 * sideOpposite));
                    return { choose: choose[0], mp: new Point(x, y_3) };
                }
                else {
                    return false;
                }
            }
            // 象 士
            var elePieceList = ["相", "象"], kinPieceList = ["仕", "士"], isEle = elePieceList.includes(pieceName_3);
            if (isEle || kinPieceList.includes(pieceName_3)) {
                var mStep = isEle ? 2 : 1;
                if (isEle && absDiffX !== 3) {
                    return false;
                }
                if (!isEle && absDiffX !== 1) {
                    return false;
                }
                var x = diffX > 0 ? cx + (mStep * sideOpposite) : cx - (mStep * sideOpposite);
                var y_4 = cy - (mStep * sideOpposite * yOpposite);
                return { choose: choose[0], mp: new Point(x, y_4) };
            }
            // 车 将 兵 跑
            var y = cy - (moveStep * sideOpposite * yOpposite);
            return { choose: choose[0], mp: new Point(cx, y) };
        }
        // 平
        if (moveStyle === moveStyles[1]) {
            // 车 将 兵 跑
            return { choose: choose[0], mp: new Point(Math.abs(moveStep - pieceDiffX), cy) };
        }
    }
    return false;
};
function getSidePieceName(name, side) {
    switch (name) {
        case "车":
        case "車":
            return side === "BLACK" ? '車' : "车";
        case "兵":
        case "卒":
            return side === "BLACK" ? "卒" : "兵";
        case "仕":
        case "士":
            return side === "BLACK" ? "仕" : "士";
        case "将":
        case "帅":
            return side === "BLACK" ? "将" : "帅";
        case "炮":
        case "砲":
            return side === "BLACK" ? "砲" : "炮";
        case "相":
        case "象":
            return side === "BLACK" ? "象" : "相";
        case "馬":
        case "马":
            return side === "BLACK" ? "馬" : "马";
        default:
            return null;
    }
}
function formatChooseNum(str) {
    switch (str) {
        case "1":
        case "一":
        case "前":
            return 1;
        case "2":
        case "二":
        case "中":
            return 2;
        case "3":
        case "三":
        case "后":
            return 3;
        case "4":
        case "四":
            return 4;
        case "5":
        case "五":
            return 5;
        case "6":
        case "六":
            return 6;
        case "7":
        case "七":
            return 7;
        case "8":
        case "八":
            return 8;
        case "9":
        case "九":
            return 9;
        default:
            return 10;
    }
}
function parse_PEN_PeiceName(penPeiceNameCode) {
    switch (penPeiceNameCode) {
        case 'K':
            return "帅";
        case 'k':
            return '将';
        case 'A':
            return '士';
        case 'a':
            return '仕';
        case 'B':
            return '相';
        case 'b':
            return '象';
        case 'N':
            return '马';
        case 'n':
            return '馬';
        case 'R':
            return '车';
        case 'r':
            return '車';
        case 'C':
            return '炮';
        case "c":
            return '砲';
        case "P":
            return '兵';
        case 'p':
            return '卒';
        default:
            return null;
    }
}
function get_PEN_PieceName(str) {
    switch (str) {
        case '将':
        case '帅':
            return 'k';
        case '仕':
        case '士':
            return 'a';
        case '象':
        case '相':
            return 'b';
        case '馬':
        case '马':
            return 'n';
        case '車':
        case '车':
            return 'r';
        case "砲":
        case '炮':
            return 'c';
        case '卒':
        case "兵":
            return 'p';
        default:
            return null;
    }
}
function parse_PEN_SideName(sideCode) {
    switch (sideCode) {
        case 'b':
        case 'B':
            return 'BLACK';
        default:
            return 'RED';
    }
}
function gen_PEN_SideCode(side) {
    switch (side) {
        case "BLACK":
            return 'b';
        case "RED":
            return 'w';
        default:
            return 'w';
    }
}
function parse_PEN_Str(penStr) {
    var layoutRegexp = /(.*)\s+(w|b)\s*(-\s*-\s*(\d)+\s*(\d)+)?/;
    var isNumber = function (str) { return /\d/.test(str); };
    var matchRes = penStr.match(layoutRegexp);
    if (!matchRes) {
        throw new Error("不符合 PEN 棋盘布局代码格式!");
    }
    var peiceLayout = matchRes[1];
    var side = parse_PEN_SideName(matchRes[2]);
    var notEatRound = matchRes[4];
    var round = matchRes[5];
    var peiceCodeList = peiceLayout.split("/");
    // 中国象棋 有10条横线
    if (peiceCodeList.length !== 10) {
        throw new Error("不符合 PEN 棋盘布局代码格式!");
    }
    var pl = [];
    for (var y = 0; y < peiceCodeList.length; y++) {
        var pieceCodeStr = peiceCodeList[y];
        var px = 9;
        var strLen = pieceCodeStr.length;
        if (strLen > 9) {
            throw new Error("不符合 PEN 棋盘布局代码格式!");
        }
        for (var j = 0; j < strLen; j++, px--) {
            var str = pieceCodeStr[j];
            var pieceName = parse_PEN_PeiceName(str);
            if (pieceName) {
                var p_side = str.toLocaleLowerCase() === str ? 'BLACK' : 'RED';
                pl.push({ side: p_side, name: pieceName, x: 9 - (px), y: y, isLastMove: false });
            }
            else if (isNumber(str)) {
                px -= Number(str) - 1;
            }
        }
    }
    return {
        side: side,
        notEatRound: notEatRound,
        round: round,
        list: pl
    };
}
function gen_PEN_Str(pl, side) {
    var PENList = Array.from({ length: 10 }, function () { return []; });
    pl.forEach(function (p) {
        var data = p.getCurrentInfo();
        var index = data.y;
        PENList[index].push(data);
    });
    PENList = PENList.map(function (item) {
        item = item.sort(function (a, b) { return a.x - b.x; });
        return item;
    });
    var str = '';
    for (var y = 0; y < PENList.length; y++) {
        var peiceList = PENList[y];
        var len = peiceList.length;
        if (len === 0) {
            str += '9';
        }
        for (var j = 0; j < len; j++) {
            var current = peiceList[j];
            var isUp = current.side === "RED";
            var penCode = get_PEN_PieceName(current.name);
            if (!penCode) {
                throw new Error("\u672A\u627E\u5230 ".concat(current.name, " \u5BF9\u5E94\u7684 PEN \u4EE3\u7801\uFF0C\u8BF7\u68C0\u67E5\u68CB\u5B50\u540D\u79F0\u662F\u5426\u7B26\u5408\u6B63\u786E\u683C\u5F0F:\n\u4F8B\u5982\uFF1A \u8F66 \"\u8F66\",\"\u8ECA\"..."));
            }
            var step = (current.x) - (j > 0 ? (peiceList[j - 1].x + 1) : 0);
            if (step > 0) {
                str += String(step);
            }
            str += isUp ? penCode.toUpperCase() : penCode;
            //  结尾
            if (j + 1 === len) {
                var end = 8 - current.x;
                if (end > 0) {
                    str += String(end);
                }
            }
        }
        if (y < PENList.length - 1) {
            str += "/";
        }
    }
    return str + ' ' + gen_PEN_SideCode(side);
}
function gen_PEN_Point_Str(p) {
    var x = p.x, y = p.y;
    return String.fromCharCode(String(x).charCodeAt(0) + 49) + String(9 - y);
}
function diffPenStr(oldStr, newStr) {
    var oldList = parse_PEN_Str(oldStr).list;
    var newList = parse_PEN_Str(newStr).list;
    var plList = oldList.map(function (item) { return chessOfPeiceMap[item.name](item); });
    var delList = [];
    // 被吃了
    var moveList = [];
    oldList.forEach(function (item) {
        var findindex = newList.findIndex(function (p) {
            return p.x === item.x &&
                item.y === p.y &&
                item.side === p.side &&
                p.name === item.name;
        });
        // 找到 说明 没有移动
        if (findindex !== -1) {
            newList.splice(findindex, 1);
            return;
        }
        // 没找到说明 移动了
        var peice = chessOfPeiceMap[item.name](item);
        var mps = peice.getMovePoints(plList);
        // 如果 有移动点
        if (mps.length) {
            var hasMp = mps.find(function (mp) {
                // 这个棋子的移动点 出现在新的棋盘上 说明他移动过去了
                var findPointIndex = newList.findIndex(function (_item) {
                    return _item.x === mp.x &&
                        _item.y === mp.y &&
                        _item.side === item.side &&
                        _item.name === item.name;
                });
                var isFind = findPointIndex !== -1;
                // 如果找到了 说明 移动了
                if (isFind) {
                    moveList.push({
                        point: new Point(item.x, item.y),
                        move: new Point(newList[findPointIndex].x, newList[findPointIndex].y),
                        side: item.side
                    });
                    newList.splice(findPointIndex, 1);
                }
                return isFind;
            });
            // 如果没有 说明这个棋子已经不存在了 可能是被吃掉了
            if (!hasMp) {
                delList.push(item);
            }
        }
        else {
            delList.push(item);
        }
    });
    return {
        moveList: moveList,
        delList: delList
    };
}
var initBoardPen = "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w";

/**
 * 根据左上点得出方形的四个点的坐标
 * @param lt 左上点
 * @param width 方形的宽度
 * @param height 方形的高度
 */
function getSquarePoints(lt, width, height) {
    return [
        __assign({}, lt),
        { x: width + lt.x, y: lt.y },
        { x: width + lt.x, y: lt.y + height },
        { x: lt.x, y: lt.y + height },
    ];
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global$c =
  // eslint-disable-next-line es/no-global-this -- safe
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  // eslint-disable-next-line no-restricted-globals -- safe
  check(typeof self == 'object' && self) ||
  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
  // eslint-disable-next-line no-new-func -- fallback
  (function () { return this; })() || commonjsGlobal || Function('return this')();

var objectGetOwnPropertyDescriptor = {};

var fails$8 = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

var fails$7 = fails$8;

// Detect IE8's incomplete defineProperty implementation
var descriptors = !fails$7(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
});

var fails$6 = fails$8;

var functionBindNative = !fails$6(function () {
  // eslint-disable-next-line es/no-function-prototype-bind -- safe
  var test = (function () { /* empty */ }).bind();
  // eslint-disable-next-line no-prototype-builtins -- safe
  return typeof test != 'function' || test.hasOwnProperty('prototype');
});

var NATIVE_BIND$1 = functionBindNative;

var call$4 = Function.prototype.call;

var functionCall = NATIVE_BIND$1 ? call$4.bind(call$4) : function () {
  return call$4.apply(call$4, arguments);
};

var objectPropertyIsEnumerable = {};

var $propertyIsEnumerable = {}.propertyIsEnumerable;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor$1 && !$propertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
objectPropertyIsEnumerable.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor$1(this, V);
  return !!descriptor && descriptor.enumerable;
} : $propertyIsEnumerable;

var createPropertyDescriptor$2 = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var NATIVE_BIND = functionBindNative;

var FunctionPrototype$1 = Function.prototype;
var call$3 = FunctionPrototype$1.call;
var uncurryThisWithBind = NATIVE_BIND && FunctionPrototype$1.bind.bind(call$3, call$3);

var functionUncurryThis = NATIVE_BIND ? uncurryThisWithBind : function (fn) {
  return function () {
    return call$3.apply(fn, arguments);
  };
};

var uncurryThis$8 = functionUncurryThis;

var toString$1 = uncurryThis$8({}.toString);
var stringSlice$1 = uncurryThis$8(''.slice);

var classofRaw = function (it) {
  return stringSlice$1(toString$1(it), 8, -1);
};

var uncurryThis$7 = functionUncurryThis;
var fails$5 = fails$8;
var classof = classofRaw;

var $Object$2 = Object;
var split = uncurryThis$7(''.split);

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var indexedObject = fails$5(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins -- safe
  return !$Object$2('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) == 'String' ? split(it, '') : $Object$2(it);
} : $Object$2;

// we can't use just `it == null` since of `document.all` special case
// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
var isNullOrUndefined$2 = function (it) {
  return it === null || it === undefined;
};

var isNullOrUndefined$1 = isNullOrUndefined$2;

var $TypeError$5 = TypeError;

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
var requireObjectCoercible$2 = function (it) {
  if (isNullOrUndefined$1(it)) throw $TypeError$5("Can't call method on " + it);
  return it;
};

// toObject with fallback for non-array-like ES3 strings
var IndexedObject = indexedObject;
var requireObjectCoercible$1 = requireObjectCoercible$2;

var toIndexedObject$3 = function (it) {
  return IndexedObject(requireObjectCoercible$1(it));
};

var documentAll$2 = typeof document == 'object' && document.all;

// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
// eslint-disable-next-line unicorn/no-typeof-undefined -- required for testing
var IS_HTMLDDA = typeof documentAll$2 == 'undefined' && documentAll$2 !== undefined;

var documentAll_1 = {
  all: documentAll$2,
  IS_HTMLDDA: IS_HTMLDDA
};

var $documentAll$1 = documentAll_1;

var documentAll$1 = $documentAll$1.all;

// `IsCallable` abstract operation
// https://tc39.es/ecma262/#sec-iscallable
var isCallable$a = $documentAll$1.IS_HTMLDDA ? function (argument) {
  return typeof argument == 'function' || argument === documentAll$1;
} : function (argument) {
  return typeof argument == 'function';
};

var isCallable$9 = isCallable$a;
var $documentAll = documentAll_1;

var documentAll = $documentAll.all;

var isObject$5 = $documentAll.IS_HTMLDDA ? function (it) {
  return typeof it == 'object' ? it !== null : isCallable$9(it) || it === documentAll;
} : function (it) {
  return typeof it == 'object' ? it !== null : isCallable$9(it);
};

var global$b = global$c;
var isCallable$8 = isCallable$a;

var aFunction = function (argument) {
  return isCallable$8(argument) ? argument : undefined;
};

var getBuiltIn$2 = function (namespace, method) {
  return arguments.length < 2 ? aFunction(global$b[namespace]) : global$b[namespace] && global$b[namespace][method];
};

var uncurryThis$6 = functionUncurryThis;

var objectIsPrototypeOf = uncurryThis$6({}.isPrototypeOf);

var engineUserAgent = typeof navigator != 'undefined' && String(navigator.userAgent) || '';

var global$a = global$c;
var userAgent = engineUserAgent;

var process = global$a.process;
var Deno = global$a.Deno;
var versions = process && process.versions || Deno && Deno.version;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  // in old Chrome, versions of V8 isn't V8 = Chrome / 10
  // but their correct versions are not interesting for us
  version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
}

// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
// so check `userAgent` even if `.v8` exists, but 0
if (!version && userAgent) {
  match = userAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent.match(/Chrome\/(\d+)/);
    if (match) version = +match[1];
  }
}

var engineV8Version = version;

/* eslint-disable es/no-symbol -- required for testing */
var V8_VERSION = engineV8Version;
var fails$4 = fails$8;
var global$9 = global$c;

var $String$3 = global$9.String;

// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
var symbolConstructorDetection = !!Object.getOwnPropertySymbols && !fails$4(function () {
  var symbol = Symbol();
  // Chrome 38 Symbol has incorrect toString conversion
  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
  // nb: Do not call `String` directly to avoid this being optimized out to `symbol+''` which will,
  // of course, fail.
  return !$String$3(symbol) || !(Object(symbol) instanceof Symbol) ||
    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
    !Symbol.sham && V8_VERSION && V8_VERSION < 41;
});

/* eslint-disable es/no-symbol -- required for testing */
var NATIVE_SYMBOL$1 = symbolConstructorDetection;

var useSymbolAsUid = NATIVE_SYMBOL$1
  && !Symbol.sham
  && typeof Symbol.iterator == 'symbol';

var getBuiltIn$1 = getBuiltIn$2;
var isCallable$7 = isCallable$a;
var isPrototypeOf = objectIsPrototypeOf;
var USE_SYMBOL_AS_UID$1 = useSymbolAsUid;

var $Object$1 = Object;

var isSymbol$2 = USE_SYMBOL_AS_UID$1 ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  var $Symbol = getBuiltIn$1('Symbol');
  return isCallable$7($Symbol) && isPrototypeOf($Symbol.prototype, $Object$1(it));
};

var $String$2 = String;

var tryToString$1 = function (argument) {
  try {
    return $String$2(argument);
  } catch (error) {
    return 'Object';
  }
};

var isCallable$6 = isCallable$a;
var tryToString = tryToString$1;

var $TypeError$4 = TypeError;

// `Assert: IsCallable(argument) is true`
var aCallable$1 = function (argument) {
  if (isCallable$6(argument)) return argument;
  throw $TypeError$4(tryToString(argument) + ' is not a function');
};

var aCallable = aCallable$1;
var isNullOrUndefined = isNullOrUndefined$2;

// `GetMethod` abstract operation
// https://tc39.es/ecma262/#sec-getmethod
var getMethod$1 = function (V, P) {
  var func = V[P];
  return isNullOrUndefined(func) ? undefined : aCallable(func);
};

var call$2 = functionCall;
var isCallable$5 = isCallable$a;
var isObject$4 = isObject$5;

var $TypeError$3 = TypeError;

// `OrdinaryToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-ordinarytoprimitive
var ordinaryToPrimitive$1 = function (input, pref) {
  var fn, val;
  if (pref === 'string' && isCallable$5(fn = input.toString) && !isObject$4(val = call$2(fn, input))) return val;
  if (isCallable$5(fn = input.valueOf) && !isObject$4(val = call$2(fn, input))) return val;
  if (pref !== 'string' && isCallable$5(fn = input.toString) && !isObject$4(val = call$2(fn, input))) return val;
  throw $TypeError$3("Can't convert object to primitive value");
};

var shared$3 = {exports: {}};

var global$8 = global$c;

// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty$1 = Object.defineProperty;

var defineGlobalProperty$3 = function (key, value) {
  try {
    defineProperty$1(global$8, key, { value: value, configurable: true, writable: true });
  } catch (error) {
    global$8[key] = value;
  } return value;
};

var global$7 = global$c;
var defineGlobalProperty$2 = defineGlobalProperty$3;

var SHARED = '__core-js_shared__';
var store$3 = global$7[SHARED] || defineGlobalProperty$2(SHARED, {});

var sharedStore = store$3;

var store$2 = sharedStore;

(shared$3.exports = function (key, value) {
  return store$2[key] || (store$2[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.32.0',
  mode: 'global',
  copyright: '© 2014-2023 Denis Pushkarev (zloirock.ru)',
  license: 'https://github.com/zloirock/core-js/blob/v3.32.0/LICENSE',
  source: 'https://github.com/zloirock/core-js'
});

var sharedExports = shared$3.exports;

var requireObjectCoercible = requireObjectCoercible$2;

var $Object = Object;

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
var toObject$1 = function (argument) {
  return $Object(requireObjectCoercible(argument));
};

var uncurryThis$5 = functionUncurryThis;
var toObject = toObject$1;

var hasOwnProperty = uncurryThis$5({}.hasOwnProperty);

// `HasOwnProperty` abstract operation
// https://tc39.es/ecma262/#sec-hasownproperty
// eslint-disable-next-line es/no-object-hasown -- safe
var hasOwnProperty_1 = Object.hasOwn || function hasOwn(it, key) {
  return hasOwnProperty(toObject(it), key);
};

var uncurryThis$4 = functionUncurryThis;

var id = 0;
var postfix = Math.random();
var toString = uncurryThis$4(1.0.toString);

var uid$2 = function (key) {
  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString(++id + postfix, 36);
};

var global$6 = global$c;
var shared$2 = sharedExports;
var hasOwn$6 = hasOwnProperty_1;
var uid$1 = uid$2;
var NATIVE_SYMBOL = symbolConstructorDetection;
var USE_SYMBOL_AS_UID = useSymbolAsUid;

var Symbol$1 = global$6.Symbol;
var WellKnownSymbolsStore = shared$2('wks');
var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol$1['for'] || Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid$1;

var wellKnownSymbol$1 = function (name) {
  if (!hasOwn$6(WellKnownSymbolsStore, name)) {
    WellKnownSymbolsStore[name] = NATIVE_SYMBOL && hasOwn$6(Symbol$1, name)
      ? Symbol$1[name]
      : createWellKnownSymbol('Symbol.' + name);
  } return WellKnownSymbolsStore[name];
};

var call$1 = functionCall;
var isObject$3 = isObject$5;
var isSymbol$1 = isSymbol$2;
var getMethod = getMethod$1;
var ordinaryToPrimitive = ordinaryToPrimitive$1;
var wellKnownSymbol = wellKnownSymbol$1;

var $TypeError$2 = TypeError;
var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');

// `ToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-toprimitive
var toPrimitive$1 = function (input, pref) {
  if (!isObject$3(input) || isSymbol$1(input)) return input;
  var exoticToPrim = getMethod(input, TO_PRIMITIVE);
  var result;
  if (exoticToPrim) {
    if (pref === undefined) pref = 'default';
    result = call$1(exoticToPrim, input, pref);
    if (!isObject$3(result) || isSymbol$1(result)) return result;
    throw $TypeError$2("Can't convert object to primitive value");
  }
  if (pref === undefined) pref = 'number';
  return ordinaryToPrimitive(input, pref);
};

var toPrimitive = toPrimitive$1;
var isSymbol = isSymbol$2;

// `ToPropertyKey` abstract operation
// https://tc39.es/ecma262/#sec-topropertykey
var toPropertyKey$2 = function (argument) {
  var key = toPrimitive(argument, 'string');
  return isSymbol(key) ? key : key + '';
};

var global$5 = global$c;
var isObject$2 = isObject$5;

var document$1 = global$5.document;
// typeof document.createElement is 'object' in old IE
var EXISTS$1 = isObject$2(document$1) && isObject$2(document$1.createElement);

var documentCreateElement = function (it) {
  return EXISTS$1 ? document$1.createElement(it) : {};
};

var DESCRIPTORS$6 = descriptors;
var fails$3 = fails$8;
var createElement = documentCreateElement;

// Thanks to IE8 for its funny defineProperty
var ie8DomDefine = !DESCRIPTORS$6 && !fails$3(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});

var DESCRIPTORS$5 = descriptors;
var call = functionCall;
var propertyIsEnumerableModule = objectPropertyIsEnumerable;
var createPropertyDescriptor$1 = createPropertyDescriptor$2;
var toIndexedObject$2 = toIndexedObject$3;
var toPropertyKey$1 = toPropertyKey$2;
var hasOwn$5 = hasOwnProperty_1;
var IE8_DOM_DEFINE$1 = ie8DomDefine;

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
objectGetOwnPropertyDescriptor.f = DESCRIPTORS$5 ? $getOwnPropertyDescriptor$1 : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject$2(O);
  P = toPropertyKey$1(P);
  if (IE8_DOM_DEFINE$1) try {
    return $getOwnPropertyDescriptor$1(O, P);
  } catch (error) { /* empty */ }
  if (hasOwn$5(O, P)) return createPropertyDescriptor$1(!call(propertyIsEnumerableModule.f, O, P), O[P]);
};

var objectDefineProperty = {};

var DESCRIPTORS$4 = descriptors;
var fails$2 = fails$8;

// V8 ~ Chrome 36-
// https://bugs.chromium.org/p/v8/issues/detail?id=3334
var v8PrototypeDefineBug = DESCRIPTORS$4 && fails$2(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
    value: 42,
    writable: false
  }).prototype != 42;
});

var isObject$1 = isObject$5;

var $String$1 = String;
var $TypeError$1 = TypeError;

// `Assert: Type(argument) is Object`
var anObject$2 = function (argument) {
  if (isObject$1(argument)) return argument;
  throw $TypeError$1($String$1(argument) + ' is not an object');
};

var DESCRIPTORS$3 = descriptors;
var IE8_DOM_DEFINE = ie8DomDefine;
var V8_PROTOTYPE_DEFINE_BUG = v8PrototypeDefineBug;
var anObject$1 = anObject$2;
var toPropertyKey = toPropertyKey$2;

var $TypeError = TypeError;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var $defineProperty = Object.defineProperty;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var ENUMERABLE = 'enumerable';
var CONFIGURABLE$1 = 'configurable';
var WRITABLE = 'writable';

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
objectDefineProperty.f = DESCRIPTORS$3 ? V8_PROTOTYPE_DEFINE_BUG ? function defineProperty(O, P, Attributes) {
  anObject$1(O);
  P = toPropertyKey(P);
  anObject$1(Attributes);
  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
    var current = $getOwnPropertyDescriptor(O, P);
    if (current && current[WRITABLE]) {
      O[P] = Attributes.value;
      Attributes = {
        configurable: CONFIGURABLE$1 in Attributes ? Attributes[CONFIGURABLE$1] : current[CONFIGURABLE$1],
        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
        writable: false
      };
    }
  } return $defineProperty(O, P, Attributes);
} : $defineProperty : function defineProperty(O, P, Attributes) {
  anObject$1(O);
  P = toPropertyKey(P);
  anObject$1(Attributes);
  if (IE8_DOM_DEFINE) try {
    return $defineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw $TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var DESCRIPTORS$2 = descriptors;
var definePropertyModule$2 = objectDefineProperty;
var createPropertyDescriptor = createPropertyDescriptor$2;

var createNonEnumerableProperty$2 = DESCRIPTORS$2 ? function (object, key, value) {
  return definePropertyModule$2.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var makeBuiltIn$2 = {exports: {}};

var DESCRIPTORS$1 = descriptors;
var hasOwn$4 = hasOwnProperty_1;

var FunctionPrototype = Function.prototype;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getDescriptor = DESCRIPTORS$1 && Object.getOwnPropertyDescriptor;

var EXISTS = hasOwn$4(FunctionPrototype, 'name');
// additional protection from minified / mangled / dropped function names
var PROPER = EXISTS && (function something() { /* empty */ }).name === 'something';
var CONFIGURABLE = EXISTS && (!DESCRIPTORS$1 || (DESCRIPTORS$1 && getDescriptor(FunctionPrototype, 'name').configurable));

var functionName = {
  EXISTS: EXISTS,
  PROPER: PROPER,
  CONFIGURABLE: CONFIGURABLE
};

var uncurryThis$3 = functionUncurryThis;
var isCallable$4 = isCallable$a;
var store$1 = sharedStore;

var functionToString = uncurryThis$3(Function.toString);

// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
if (!isCallable$4(store$1.inspectSource)) {
  store$1.inspectSource = function (it) {
    return functionToString(it);
  };
}

var inspectSource$1 = store$1.inspectSource;

var global$4 = global$c;
var isCallable$3 = isCallable$a;

var WeakMap$1 = global$4.WeakMap;

var weakMapBasicDetection = isCallable$3(WeakMap$1) && /native code/.test(String(WeakMap$1));

var shared$1 = sharedExports;
var uid = uid$2;

var keys = shared$1('keys');

var sharedKey$1 = function (key) {
  return keys[key] || (keys[key] = uid(key));
};

var hiddenKeys$3 = {};

var NATIVE_WEAK_MAP = weakMapBasicDetection;
var global$3 = global$c;
var isObject = isObject$5;
var createNonEnumerableProperty$1 = createNonEnumerableProperty$2;
var hasOwn$3 = hasOwnProperty_1;
var shared = sharedStore;
var sharedKey = sharedKey$1;
var hiddenKeys$2 = hiddenKeys$3;

var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
var TypeError$1 = global$3.TypeError;
var WeakMap = global$3.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw TypeError$1('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP || shared.state) {
  var store = shared.state || (shared.state = new WeakMap());
  /* eslint-disable no-self-assign -- prototype methods protection */
  store.get = store.get;
  store.has = store.has;
  store.set = store.set;
  /* eslint-enable no-self-assign -- prototype methods protection */
  set = function (it, metadata) {
    if (store.has(it)) throw TypeError$1(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    store.set(it, metadata);
    return metadata;
  };
  get = function (it) {
    return store.get(it) || {};
  };
  has = function (it) {
    return store.has(it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys$2[STATE] = true;
  set = function (it, metadata) {
    if (hasOwn$3(it, STATE)) throw TypeError$1(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    createNonEnumerableProperty$1(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return hasOwn$3(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return hasOwn$3(it, STATE);
  };
}

var internalState = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};

var uncurryThis$2 = functionUncurryThis;
var fails$1 = fails$8;
var isCallable$2 = isCallable$a;
var hasOwn$2 = hasOwnProperty_1;
var DESCRIPTORS = descriptors;
var CONFIGURABLE_FUNCTION_NAME = functionName.CONFIGURABLE;
var inspectSource = inspectSource$1;
var InternalStateModule = internalState;

var enforceInternalState = InternalStateModule.enforce;
var getInternalState = InternalStateModule.get;
var $String = String;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;
var stringSlice = uncurryThis$2(''.slice);
var replace = uncurryThis$2(''.replace);
var join = uncurryThis$2([].join);

var CONFIGURABLE_LENGTH = DESCRIPTORS && !fails$1(function () {
  return defineProperty(function () { /* empty */ }, 'length', { value: 8 }).length !== 8;
});

var TEMPLATE = String(String).split('String');

var makeBuiltIn$1 = makeBuiltIn$2.exports = function (value, name, options) {
  if (stringSlice($String(name), 0, 7) === 'Symbol(') {
    name = '[' + replace($String(name), /^Symbol\(([^)]*)\)/, '$1') + ']';
  }
  if (options && options.getter) name = 'get ' + name;
  if (options && options.setter) name = 'set ' + name;
  if (!hasOwn$2(value, 'name') || (CONFIGURABLE_FUNCTION_NAME && value.name !== name)) {
    if (DESCRIPTORS) defineProperty(value, 'name', { value: name, configurable: true });
    else value.name = name;
  }
  if (CONFIGURABLE_LENGTH && options && hasOwn$2(options, 'arity') && value.length !== options.arity) {
    defineProperty(value, 'length', { value: options.arity });
  }
  try {
    if (options && hasOwn$2(options, 'constructor') && options.constructor) {
      if (DESCRIPTORS) defineProperty(value, 'prototype', { writable: false });
    // in V8 ~ Chrome 53, prototypes of some methods, like `Array.prototype.values`, are non-writable
    } else if (value.prototype) value.prototype = undefined;
  } catch (error) { /* empty */ }
  var state = enforceInternalState(value);
  if (!hasOwn$2(state, 'source')) {
    state.source = join(TEMPLATE, typeof name == 'string' ? name : '');
  } return value;
};

// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
// eslint-disable-next-line no-extend-native -- required
Function.prototype.toString = makeBuiltIn$1(function toString() {
  return isCallable$2(this) && getInternalState(this).source || inspectSource(this);
}, 'toString');

var makeBuiltInExports = makeBuiltIn$2.exports;

var isCallable$1 = isCallable$a;
var definePropertyModule$1 = objectDefineProperty;
var makeBuiltIn = makeBuiltInExports;
var defineGlobalProperty$1 = defineGlobalProperty$3;

var defineBuiltIn$1 = function (O, key, value, options) {
  if (!options) options = {};
  var simple = options.enumerable;
  var name = options.name !== undefined ? options.name : key;
  if (isCallable$1(value)) makeBuiltIn(value, name, options);
  if (options.global) {
    if (simple) O[key] = value;
    else defineGlobalProperty$1(key, value);
  } else {
    try {
      if (!options.unsafe) delete O[key];
      else if (O[key]) simple = true;
    } catch (error) { /* empty */ }
    if (simple) O[key] = value;
    else definePropertyModule$1.f(O, key, {
      value: value,
      enumerable: false,
      configurable: !options.nonConfigurable,
      writable: !options.nonWritable
    });
  } return O;
};

var objectGetOwnPropertyNames = {};

var ceil = Math.ceil;
var floor = Math.floor;

// `Math.trunc` method
// https://tc39.es/ecma262/#sec-math.trunc
// eslint-disable-next-line es/no-math-trunc -- safe
var mathTrunc = Math.trunc || function trunc(x) {
  var n = +x;
  return (n > 0 ? floor : ceil)(n);
};

var trunc = mathTrunc;

// `ToIntegerOrInfinity` abstract operation
// https://tc39.es/ecma262/#sec-tointegerorinfinity
var toIntegerOrInfinity$2 = function (argument) {
  var number = +argument;
  // eslint-disable-next-line no-self-compare -- NaN check
  return number !== number || number === 0 ? 0 : trunc(number);
};

var toIntegerOrInfinity$1 = toIntegerOrInfinity$2;

var max = Math.max;
var min$1 = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
var toAbsoluteIndex$1 = function (index, length) {
  var integer = toIntegerOrInfinity$1(index);
  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
};

var toIntegerOrInfinity = toIntegerOrInfinity$2;

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
var toLength$1 = function (argument) {
  return argument > 0 ? min(toIntegerOrInfinity(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

var toLength = toLength$1;

// `LengthOfArrayLike` abstract operation
// https://tc39.es/ecma262/#sec-lengthofarraylike
var lengthOfArrayLike$1 = function (obj) {
  return toLength(obj.length);
};

var toIndexedObject$1 = toIndexedObject$3;
var toAbsoluteIndex = toAbsoluteIndex$1;
var lengthOfArrayLike = lengthOfArrayLike$1;

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject$1($this);
    var length = lengthOfArrayLike(O);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare -- NaN check
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare -- NaN check
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

var arrayIncludes = {
  // `Array.prototype.includes` method
  // https://tc39.es/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};

var uncurryThis$1 = functionUncurryThis;
var hasOwn$1 = hasOwnProperty_1;
var toIndexedObject = toIndexedObject$3;
var indexOf = arrayIncludes.indexOf;
var hiddenKeys$1 = hiddenKeys$3;

var push = uncurryThis$1([].push);

var objectKeysInternal = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !hasOwn$1(hiddenKeys$1, key) && hasOwn$1(O, key) && push(result, key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (hasOwn$1(O, key = names[i++])) {
    ~indexOf(result, key) || push(result, key);
  }
  return result;
};

// IE8- don't enum bug keys
var enumBugKeys$1 = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];

var internalObjectKeys = objectKeysInternal;
var enumBugKeys = enumBugKeys$1;

var hiddenKeys = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
// eslint-disable-next-line es/no-object-getownpropertynames -- safe
objectGetOwnPropertyNames.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};

var objectGetOwnPropertySymbols = {};

// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
objectGetOwnPropertySymbols.f = Object.getOwnPropertySymbols;

var getBuiltIn = getBuiltIn$2;
var uncurryThis = functionUncurryThis;
var getOwnPropertyNamesModule = objectGetOwnPropertyNames;
var getOwnPropertySymbolsModule = objectGetOwnPropertySymbols;
var anObject = anObject$2;

var concat = uncurryThis([].concat);

// all object keys, includes non-enumerable and symbols
var ownKeys$1 = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? concat(keys, getOwnPropertySymbols(it)) : keys;
};

var hasOwn = hasOwnProperty_1;
var ownKeys = ownKeys$1;
var getOwnPropertyDescriptorModule = objectGetOwnPropertyDescriptor;
var definePropertyModule = objectDefineProperty;

var copyConstructorProperties$1 = function (target, source, exceptions) {
  var keys = ownKeys(source);
  var defineProperty = definePropertyModule.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!hasOwn(target, key) && !(exceptions && hasOwn(exceptions, key))) {
      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  }
};

var fails = fails$8;
var isCallable = isCallable$a;

var replacement = /#|\.prototype\./;

var isForced$1 = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : isCallable(detection) ? fails(detection)
    : !!detection;
};

var normalize = isForced$1.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced$1.data = {};
var NATIVE = isForced$1.NATIVE = 'N';
var POLYFILL = isForced$1.POLYFILL = 'P';

var isForced_1 = isForced$1;

var global$2 = global$c;
var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
var createNonEnumerableProperty = createNonEnumerableProperty$2;
var defineBuiltIn = defineBuiltIn$1;
var defineGlobalProperty = defineGlobalProperty$3;
var copyConstructorProperties = copyConstructorProperties$1;
var isForced = isForced_1;

/*
  options.target         - name of the target object
  options.global         - target is the global object
  options.stat           - export as static methods of target
  options.proto          - export as prototype methods of target
  options.real           - real prototype method for the `pure` version
  options.forced         - export even if the native feature is available
  options.bind           - bind methods to the target, required for the `pure` version
  options.wrap           - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe         - use the simple assignment of property instead of delete + defineProperty
  options.sham           - add a flag to not completely full polyfills
  options.enumerable     - export as enumerable property
  options.dontCallGetSet - prevent calling a getter on target
  options.name           - the .name of the function if it does not match the key
*/
var _export = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global$2;
  } else if (STATIC) {
    target = global$2[TARGET] || defineGlobalProperty(TARGET, {});
  } else {
    target = (global$2[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.dontCallGetSet) {
      descriptor = getOwnPropertyDescriptor(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty == typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    }
    defineBuiltIn(target, key, sourceProperty, options);
  }
};

var $ = _export;
var global$1 = global$c;

// `globalThis` object
// https://tc39.es/ecma262/#sec-globalthis
$({ global: true, forced: global$1.globalThis !== global$1 }, {
  globalThis: global$1
});

var findPiece = function (pl, p) { return pl.find(function (item) { return item.x === p.x && item.y === p.y; }); };
var ZhChess = /** @class */ (function () {
    function ZhChess(_a) {
        var ctx = _a.ctx, _b = _a.gameWidth, gameWidth = _b === void 0 ? 800 : _b, _c = _a.gameHeight, gameHeight = _c === void 0 ? 800 : _c, _d = _a.gamePadding, gamePadding = _d === void 0 ? 20 : _d, _e = _a.scaleRatio, scaleRatio = _e === void 0 ? 1 : _e, _f = _a.duration, duration = _f === void 0 ? 200 : _f, _g = _a.redPeiceBackground, redPeiceBackground = _g === void 0 ? "#feeca0" : _g, _h = _a.blackPeiceBackground, blackPeiceBackground = _h === void 0 ? "#fdec9e" : _h, _j = _a.checkerboardBackground, checkerboardBackground = _j === void 0 ? "#faebd7" : _j, _k = _a.movePointColor, movePointColor = _k === void 0 ? "#25dd2a" : _k, _l = _a.drawMovePoint, drawMovePoint = _l === void 0 ? true : _l;
        var _m;
        /**
         * 当前走棋方
         */
        Object.defineProperty(this, "currentSide", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 当前棋盘上存活的棋子
         */
        Object.defineProperty(this, "livePieceList", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 当前选中的棋子
         */
        Object.defineProperty(this, "choosePiece", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 棋盘绘制起始 x 值
         */
        Object.defineProperty(this, "startX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 棋盘绘制末尾 x 值
         */
        Object.defineProperty(this, "endX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 棋盘绘制起始 y 值
         */
        Object.defineProperty(this, "startY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 棋盘绘制末尾 y 值
         */
        Object.defineProperty(this, "endY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 象棋格子宽度
         */
        Object.defineProperty(this, "gridWidth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 象棋格子高度
         */
        Object.defineProperty(this, "gridHeight", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 象棋半径
         */
        Object.defineProperty(this, "radius", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 游戏窗口高度
         */
        Object.defineProperty(this, "width", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 游戏窗口高度
         */
        Object.defineProperty(this, "height", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 背景 和 线条 二维操作上下文
         */
        Object.defineProperty(this, "ctx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 存放棋盘格子的所有坐标
         */
        Object.defineProperty(this, "gridPostionList", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 棋子运动速度时长 毫秒单位
         */
        Object.defineProperty(this, "duration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "drawMovePoint", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 玩家 x轴 格子距离相差
         */
        Object.defineProperty(this, "gridDiffX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 玩家 y轴 格子距离相差
         */
        Object.defineProperty(this, "gridDiffY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 游戏进行状态
         */
        Object.defineProperty(this, "gameState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 游戏移动监听事件列表
         */
        Object.defineProperty(this, "moveEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 游戏移动失败监听事件列表
         */
        Object.defineProperty(this, "moveFailEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 游戏日志监听事件列表
         */
        Object.defineProperty(this, "logEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 游戏结束监听事件列表
         */
        Object.defineProperty(this, "overEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 游戏运行报错事件列表
         */
        Object.defineProperty(this, "errorEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 红色棋子背景颜色
         */
        Object.defineProperty(this, "redPeiceBackground", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 黑色棋子背景颜色
         */
        Object.defineProperty(this, "blackPeiceBackground", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 棋盘背景颜色
         */
        Object.defineProperty(this, "checkerboardBackground", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 赢方
         */
        Object.defineProperty(this, "winner", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        /**
         * 当前游戏方
         */
        Object.defineProperty(this, "gameSide", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        /**
         * 动画方法
         */
        Object.defineProperty(this, "animate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 清除动画方法
         */
        Object.defineProperty(this, "cancelAnimate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 画布缩放大小
         * @defaultValue `1`
         */
        Object.defineProperty(this, "scaleRatio", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "movePointColor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 上次移动点：棋盘上移动棋子移动前的位置坐标点
         */
        Object.defineProperty(this, "lastMovePoint", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 上次移动象棋：棋盘上的上一次移动棋子
         */
        Object.defineProperty(this, "lastMovePiece", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.moveEvents = [];
        this.moveFailEvents = [];
        this.logEvents = [];
        this.overEvents = [];
        this.errorEvents = [];
        this.ctx = ctx;
        this.redPeiceBackground = redPeiceBackground;
        this.blackPeiceBackground = blackPeiceBackground;
        this.checkerboardBackground = checkerboardBackground;
        this.movePointColor = movePointColor;
        // 设置 缩放 来解决移动端模糊问题
        (_m = this.ctx) === null || _m === void 0 ? void 0 : _m.scale(scaleRatio, scaleRatio);
        this.scaleRatio = scaleRatio;
        this.listenClick = this.listenClick.bind(this);
        this.listenClickAsync = this.listenClickAsync.bind(this);
        this.checkDraw = this.checkDraw.bind(this);
        this.gridPostionList = [];
        this.drawMovePoint = drawMovePoint;
        this.setGridList();
        this.gameState = "INIT";
        this.duration = duration;
        this.setGameWindow(gameWidth, gameHeight, gamePadding);
        this.init();
        {
            this.animate = globalThis.requestAnimationFrame ||
                //@ts-ignore 
                globalThis.webkitRequestAnimationFrame ||
                //@ts-ignore 
                globalThis.mozRequestAnimationFrame ||
                //@ts-ignore 
                globalThis.oRequestAnimationFrame ||
                //@ts-ignore 
                globalThis.msRequestAnimationFrame ||
                function (callback) {
                    return globalThis.setTimeout(callback, 1000 / 60);
                };
        }
        {
            this.cancelAnimate = globalThis.cancelAnimationFrame ||
                //@ts-ignore
                globalThis.webkitCancelAnimationFrame ||
                //@ts-ignore 
                globalThis.mozCancelAnimationFrame ||
                //@ts-ignore 
                globalThis.oCancelAnimationFrame ||
                //@ts-ignore 
                globalThis.msCancelAnimationFrame ||
                globalThis.clearTimeout;
        }
    }
    /**
     * 设置游戏窗口 棋盘 棋子大小
     */
    Object.defineProperty(ZhChess.prototype, "setGameWindow", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (w, h, p) {
            var playHeight = h - p * 2;
            var playWidth = playHeight;
            while (playWidth % 9 !== 0) {
                playWidth++;
            }
            this.gridWidth = playWidth / 9;
            this.gridHeight = playHeight / 10;
            this.startX = (w - playWidth + this.gridWidth) / 2;
            this.startY = (h - playHeight + this.gridHeight) / 2;
            this.endX = this.startX + this.gridWidth * 8;
            this.endY = this.startY + this.gridHeight * 9;
            this.radius = this.gridHeight * 0.4;
            this.width = w;
            this.height = h;
        }
    });
    /**
     * 根据玩家返回绘画坐标轴的差值
     * @param side 玩家
     * @param key 坐标轴
     * @returns
     */
    Object.defineProperty(ZhChess.prototype, "getGridDiff", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (side, key) {
            if (side === "BLACK") {
                if (key === "x") {
                    return 8;
                }
                return 9;
            }
            return 0;
        }
    });
    /**
     * 根据玩家方 设置 x，y轴差值
     * @param side 玩家方
     */
    Object.defineProperty(ZhChess.prototype, "setGridDiff", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (side) {
            this.gridDiffX = this.getGridDiff(side, "x");
            this.gridDiffY = this.getGridDiff(side, "y");
        }
    });
    /**
     * 获取所有格子的坐标
     */
    Object.defineProperty(ZhChess.prototype, "setGridList", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            for (var i = 0; i < 9; i++) {
                for (var j = 0; j < 10; j++) {
                    this.gridPostionList.push(new Point(i, j));
                }
            }
        }
    });
    /**
     * 根据点击点返回所在棋盘上x,y的位置
     * @param p 点击点的 x,y 坐标
     * @returns 返回棋盘的x，y坐标轴
     */
    Object.defineProperty(ZhChess.prototype, "getGridPosition", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (p) {
            var _this = this;
            return this.gridPostionList.find(function (item) {
                var x1 = Math.abs(item.x - _this.gridDiffX) * _this.gridWidth + _this.startX;
                var y1 = Math.abs(item.y - _this.gridDiffY) * _this.gridHeight + _this.startY;
                return Math.sqrt(Math.pow((x1 - p.x), 2) + Math.pow((y1 - p.y), 2)) < _this.radius;
            });
        }
    });
    /**
     * 初始化象棋盘
     */
    Object.defineProperty(ZhChess.prototype, "init", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            this.currentSide = "RED";
            this.choosePiece = null;
            this.livePieceList = [];
        }
    });
    /**
     * 初始化象棋个数
     */
    Object.defineProperty(ZhChess.prototype, "initPiece", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            this.setPenCodeList(initBoardPen);
            this.choosePiece = null;
            this.checkDraw();
        }
    });
    /**
     * 游戏根据坐标点 移动点来进行更新游戏运行数据。这是一个返回一个promise结果，也表示 这个方法是异步的。
     * @param pos 坐标点
     * @param mov 移动点
     * @param side 当前下棋玩家
     * @param refreshCtx 是否每次运动后更新画布
     * @param moveCallback 每次棋子数据更新后调用
     *
     * @example
     * const game = new ZhChess({...any})
     * game.updateAsync(pos , mov, side, ()=> game.draw(ctx)) // 每次运动都去绘画一次
     *
     */
    Object.defineProperty(ZhChess.prototype, "updateAsync", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (pos, mov, side, refreshCtx, moveCallback) {
            var _this = this;
            var updateRes = this.update(pos, mov, side, false);
            this.gameState = "MOVE";
            if (!updateRes.flag || !mov || (updateRes.flag && !updateRes.move)) {
                this.gameState = "START";
                return Promise.resolve(updateRes);
            }
            var diffx = (pos.x - mov.x), diffy = (pos.y - mov.y), posX = pos.x, posY = pos.y;
            var xstep = diffx / (this.duration / 16);
            var ystep = diffy / (this.duration / 16);
            // this.clearMoveChoosePeiece()
            var raf, posPeice = findPiece(this.livePieceList, new Point(posX, posY));
            return new Promise(function (resovle) {
                var animateFn = function () {
                    if (Math.abs(posX - mov.x) <= Math.abs(xstep) && Math.abs(posY - mov.y) <= Math.abs(ystep)) {
                        _this.cancelAnimate.call(globalThis, raf);
                        if (posPeice) {
                            posPeice.update(pos);
                        }
                        return resovle(null);
                    }
                    posX -= xstep;
                    posY -= ystep;
                    var newPoint = new Point(posX, posY);
                    if (posPeice) {
                        posPeice.isChoose = false;
                        posPeice.update(newPoint);
                        if (refreshCtx) {
                            _this.checkDraw();
                        }
                        if (typeof moveCallback === "function") {
                            moveCallback(posPeice, newPoint);
                        }
                    }
                    raf = _this.animate.call(globalThis, animateFn);
                };
                animateFn();
            }).catch(function (err) {
                _this.errorEvents.forEach(function (f) { return f(err); });
                return null;
            }).then(function () {
                if (updateRes.flag && updateRes.cb) {
                    updateRes.cb();
                    if (refreshCtx) {
                        _this.checkDraw();
                    }
                    return { flag: true, move: true };
                }
                return updateRes;
            });
        }
    });
    /**
     * 游戏根据坐标点 移动点来进行更新游戏运行数据。
     * @param pos 坐标点
     * @param mov 移动点
     * @param side 当前下棋玩家
     * @param post 是否由程序自己更新游戏状态
     * @returns
     *
     * 如果 `post` 为 `false`， 请检查返回的结果 `move` 是否为 `true` ，为`true`表示有返回回调函数`cb`，只有调用 `cb()` 游戏状态才会更新
     *
     * 如果 `post` 为 `true`，程序会自己更新游戏状态 只需要判断 是否更新成功即可！
     */
    Object.defineProperty(ZhChess.prototype, "update", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (pos, mov, side, post) {
            var _this = this;
            var checkData = this.checkGameState();
            if (!checkData.flag) {
                return checkData;
            }
            if (this.currentSide !== side) {
                return { flag: false, message: "请等待对方下棋" };
            }
            var posPeice = findPiece(this.livePieceList, pos);
            if (!posPeice) {
                return { flag: false, message: "未找到棋子" };
            }
            // 点击到了敌方的棋子
            if (this.currentSide !== posPeice.side) {
                return { flag: false, message: "选中了敌方的棋子" };
            }
            this.clearMoveChoosePeiece();
            posPeice.isChoose = true;
            this.setLastMovePeiceStatus(false);
            this.choosePiece = posPeice;
            // 如果没有需要移动的话 就直接 渲染返回
            if (!mov) {
                this.logEvents.forEach(function (f) { return f(side + "方： 选中 " + posPeice); });
                return { flag: true, move: false };
            }
            var movPeice = findPiece(this.livePieceList, mov);
            var moveFlag = this.choosePiece.move(mov, this.livePieceList);
            var moveCheck = function (cp) {
                var isMove = "move" in cp;
                var hasTrouble = _this.checkGeneralInTrouble(side, posPeice, cp, _this.livePieceList);
                if (hasTrouble) {
                    return { flag: false, message: "不可以送将！" };
                }
                var enemySide = side === "RED" ? "BLACK" : "RED";
                var isOver = false;
                var enemyhasTrouble = _this.checkGeneralInTrouble(enemySide, posPeice, cp, _this.livePieceList);
                var movedPeiceList = isMove ? _this.livePieceList.filter(function (i) { return !(i.x === posPeice.x && i.y === posPeice.y); }) :
                    _this.livePieceList.filter(function (i) { return !((i.x === posPeice.x && i.y === posPeice.y) || (i.x === cp.eat.x && i.y === cp.eat.y)); });
                var newMp = chessOfPeiceMap[posPeice.name](__assign(__assign({}, posPeice), mov));
                movedPeiceList.push(newMp);
                if (enemyhasTrouble) {
                    var hasSolution = _this.checkEnemySideInTroubleHasSolution(enemySide, movedPeiceList);
                    if (!hasSolution) {
                        isOver = true;
                        _this.winner = side;
                    }
                }
                else {
                    var hasMovePoints = _this.checkEnemySideHasMovePoints(enemySide, movedPeiceList);
                    if (!hasMovePoints) {
                        isOver = true;
                        _this.winner = side;
                    }
                }
                var cb = function () {
                    var newPeice = chessOfPeiceMap[posPeice.name](__assign(__assign({}, posPeice), pos));
                    if (!isMove) {
                        _this.livePieceList = _this.livePieceList.filter(function (p) { return (!(p.x === cp.eat.x && p.y === cp.eat.y)); });
                    }
                    _this.setLastMovePeiceStatus(false);
                    posPeice.update(mov);
                    _this.lastMovePiece = posPeice;
                    _this.setLastMovePeiceStatus(true);
                    _this.lastMovePoint = new Point(pos.x, pos.y);
                    _this.gameState = "START";
                    if (isOver) {
                        _this.gameState = "OVER";
                    }
                    _this.moveEvents.forEach(function (f) { return f(newPeice, cp, isOver || enemyhasTrouble, _this.getCurrentPenCode(enemySide)); });
                    if (isOver) {
                        _this.overEvents.forEach(function (f) { return f(side); });
                    }
                    _this.clearMoveChoosePeiece();
                    _this.changeSide();
                };
                if (post) {
                    cb();
                    return { flag: true, move: true };
                }
                return { flag: true, cb: cb, move: true };
            };
            // 选中之后的点击
            if (!movPeice) { // 没有选中棋子 说明 已选中的棋子要移动过去
                if (moveFlag.flag) {
                    var cp = { move: mov };
                    return moveCheck(cp);
                }
                return moveFlag;
            }
            // 如果点击的棋子是己方
            if (movPeice.side === side) {
                if (pos.x === mov.x && pos.y === mov.y) { // 如果是点击选中的棋子 取消选中
                    this.clearMoveChoosePeiece();
                    this.setLastMovePeiceStatus(true);
                    this.logEvents.forEach(function (f) { return f(side + "方： 取消选中 " + movPeice); });
                    return { flag: true, move: false };
                }
                { // 切换选中棋子
                    this.choosePiece.isChoose = false;
                    this.choosePiece = movPeice;
                    this.choosePiece.isChoose = true;
                    this.logEvents.forEach(function (f) { return f("".concat(_this.currentSide, "\u65B9\uFF1A\u5207\u6362 \u9009\u4E2D\u68CB\u5B50 \u7531").concat(_this.choosePiece, " --> ").concat(movPeice)); });
                    return { flag: true, move: false };
                }
            }
            // 如果点击的的棋子是敌方 ，要移动到敌方的棋子位置上
            this.logEvents.forEach(function (f) { return f("\u5F53\u524D\uFF1A".concat(_this.currentSide, " ,\u68CB\u5B50:").concat(_this.choosePiece, " \u9700\u8981\u79FB\u52A8\u5230\uFF1A").concat(mov, " \u8FD9\u4E2A\u70B9\u4E0A\uFF0C\u5E76\u4E14\u8981\u5403\u6389 ").concat(movPeice)); });
            if (!moveFlag.flag) {
                return moveFlag;
            }
            else {
                var cp = { eat: mov };
                return moveCheck(cp);
            }
        }
    });
    /**
     * 根据当前棋子状态绘画 棋盘状态 游戏数据 画出布局
     * @param ctx 画布
     */
    Object.defineProperty(ZhChess.prototype, "draw", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (ctx) {
            var _this = this;
            ctx.clearRect(0, 0, this.width, this.height);
            this.drawChessLine(ctx);
            var _a = this, startX = _a.startX, startY = _a.startY, gridWidth = _a.gridWidth, gridHeight = _a.gridHeight, gridDiffX = _a.gridDiffX, gridDiffY = _a.gridDiffY, radius = _a.radius, movePointColor = _a.movePointColor;
            this.livePieceList.forEach(function (item) {
                var textColor = item.side === "BLACK" ? "#000" : "#c1190c", bgColor = item.side === "BLACK" ? _this.blackPeiceBackground : _this.redPeiceBackground;
                if (_this.choosePiece === item || _this.lastMovePiece === item) {
                    return true;
                }
                item.draw(ctx, startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY, radius, textColor, bgColor);
            });
            if (this.lastMovePiece) {
                var textColor = this.lastMovePiece.side === "BLACK" ? "#000" : "#c1190c", bgColor = this.lastMovePiece.side === "BLACK" ? this.blackPeiceBackground : this.redPeiceBackground;
                this.lastMovePiece.draw(ctx, startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY, radius, textColor, bgColor);
            }
            if (this.choosePiece) {
                var textColor = this.choosePiece.side === "BLACK" ? "#000" : "#c1190c", bgColor = this.choosePiece.side === "BLACK" ? this.blackPeiceBackground : this.redPeiceBackground;
                this.choosePiece.draw(ctx, startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY, radius, textColor, bgColor);
                if (this.drawMovePoint && this.gameState !== "MOVE") {
                    this.choosePiece.drawMovePoints(ctx, this.livePieceList, startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY, radius, movePointColor);
                }
            }
        }
    });
    /**
     * 画棋盘
     */
    Object.defineProperty(ZhChess.prototype, "drawChessLine", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (ctx) {
            var _a = this, startX = _a.startX, startY = _a.startY, endX = _a.endX, endY = _a.endY, gridWidth = _a.gridWidth, gridHeight = _a.gridHeight, scaleRatio = _a.scaleRatio;
            // 画背景
            ctx.fillStyle = this.checkerboardBackground;
            ctx.fillRect(0, 0, this.width, this.width);
            ctx.strokeStyle = "#000";
            // 横线
            for (var index = 0; index < 10; index++) {
                ctx.beginPath();
                var y = startY + gridHeight * index;
                ctx.moveTo(startX, y);
                ctx.lineTo(endX, y);
                ctx.closePath();
                ctx.stroke();
            }
            // 竖线
            for (var index = 0; index < 9; index++) {
                var x = startX + index * gridWidth;
                var midY = startY + gridHeight * 4;
                var by = startY + gridHeight * 9;
                if (index === 0 || index === 8) {
                    ctx.beginPath();
                    ctx.moveTo(x, startY);
                    ctx.lineTo(x, by);
                    ctx.closePath();
                    ctx.stroke();
                    continue;
                }
                ctx.beginPath();
                ctx.moveTo(x, startY);
                ctx.lineTo(x, midY);
                ctx.closePath();
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, midY + gridHeight);
                ctx.lineTo(x, endY);
                ctx.closePath();
                ctx.stroke();
            }
            // 士的两把叉
            for (var index = 0; index < 2; index++) {
                var x = startX + gridWidth * 3;
                var points = getSquarePoints({ x: x, y: startY + gridHeight * 7 * index }, gridWidth * 2, gridHeight * 2);
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                ctx.lineTo(points[2].x, points[2].y);
                ctx.moveTo(points[1].x, points[1].y);
                ctx.lineTo(points[3].x, points[3].y);
                ctx.closePath();
                ctx.stroke();
            }
            // 炮位 兵位 坐标的 ∟符号
            for (var i = 0; i < 9; i += 2) {
                var width = gridWidth * .15;
                var padding = gridWidth * .1;
                for (var j = 0; j < 2; j++) {
                    var addx = j === 0 ? -padding : +padding;
                    var addy = j === 0 ? +padding : -padding;
                    var addw = j === 0 ? +width : -width;
                    for (var z = 0; z < 2; z++) {
                        // 红 黑
                        var y = z % 2 === 0 ? startY + 3 * gridHeight : startY + 6 * gridHeight;
                        // 左右两边
                        for (var w = 0; w < 2; w++) {
                            var x = w % 2 === 0 ? startX + i * gridWidth + addx : startX + i * gridWidth - addx;
                            var aw = w % 2 === 0 ? -addw : +addw;
                            if (x - startX > 0 && x - (startX + 8 * gridWidth) < 0) {
                                ctx.beginPath();
                                ctx.moveTo(x, y + addy);
                                ctx.lineTo(x + aw, y + addy);
                                ctx.moveTo(x, y + addy);
                                ctx.lineTo(x, y + addy + addw);
                                ctx.stroke();
                            }
                        }
                    }
                }
                if (i - 1 === 1 || i - 1 === 7) {
                    for (var j = 0; j < 2; j++) {
                        var addx = j === 0 ? -padding : +padding;
                        var addy = j === 0 ? +padding : -padding;
                        var addw = j === 0 ? +width : -width;
                        var x1 = startX + (i - 1) * gridWidth;
                        for (var z = 0; z < 2; z++) {
                            var y = (z % 2 === 0 ? startY + 2 * gridHeight : startY + 7 * gridHeight) + addy;
                            for (var w = 0; w < 2; w++) {
                                var x = w % 2 === 0 ? x1 + addx : x1 - addx;
                                var aw = w % 2 === 0 ? -addw : +addw;
                                ctx.beginPath();
                                ctx.moveTo(x, y);
                                ctx.lineTo(x + aw, y);
                                ctx.moveTo(x, y);
                                ctx.lineTo(x, y + addw);
                                ctx.stroke();
                            }
                        }
                    }
                }
            }
            //  楚河 汉界
            ctx.textBaseline = "middle";
            ctx.textAlign = "left";
            ctx.fillStyle = "#000";
            var fontSize = gridHeight * .7;
            ctx.font = fontSize + 'px serif';
            ctx.fillText("楚河", startX + gridWidth, startY + gridHeight * 4.5);
            ctx.textAlign = "right";
            ctx.translate(startX + gridWidth * 7 - fontSize * 2, startY + gridHeight * 4.5);
            ctx.rotate(Math.PI);
            ctx.fillText("汉界", 0, 0);
            ctx.setTransform(scaleRatio, 0, 0, scaleRatio, 0, 0);
        }
    });
    /**
     * 根据移动方的描述文字来进行移动棋子
     * @param str 文字
     * @param side 移动方
     * @returns 移动结果
     */
    Object.defineProperty(ZhChess.prototype, "moveStr", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (str, side) {
            var _this = this;
            if (!this.checkGameState()) {
                return { flag: false, message: "当前游戏状态不可以移动棋子" };
            }
            this.logEvents.forEach(function (f) { return f("\u5F53\u524D ".concat(side, " \u8F93\u51FA\uFF1A").concat(str)); });
            if (this.currentSide !== side) {
                this.logEvents.forEach(function (f) { return f("\u5F53\u524D\u4E3A".concat(_this.currentSide, "\u65B9\u4E0B\u68CB\uFF0C\u8BF7\u7B49\u5F85\uFF01")); });
                return { flag: false, message: "\u5F53\u524D\u4E3A".concat(this.currentSide, "\u65B9\u4E0B\u68CB\uFF0C\u8BF7\u7B49\u5F85\uFF01") };
            }
            var res = parseStrToPoint(str, this.currentSide, this.livePieceList);
            if (!res) {
                this.logEvents.forEach(function (f) { return f("未找到棋子"); });
                return { flag: false, message: "\u672A\u627E\u5230\u68CB\u5B50" };
            }
            if (this.choosePiece) {
                this.clearMoveChoosePeiece();
            }
            var posPeice = findPiece(this.livePieceList, res.mp);
            if (posPeice && posPeice.side === this.currentSide) {
                this.logEvents.forEach(function (f) { return f("移动的位置有己方棋子"); });
                return { flag: false, message: "移动的位置有己方棋子" };
            }
            this.choosePiece = res.choose;
            this.choosePiece.isChoose = true;
            return this.update(res.choose, res.mp, side, true);
        }
    });
    /**
     * 根据移动方的描述文字来进行移动棋子
     * @param str 文字
     * @param side 移动方
     * @param refreshCtx 是否每次移动都更新画布
     * @returns 移动结果
     */
    Object.defineProperty(ZhChess.prototype, "moveStrAsync", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (str, side, refreshCtx) {
            var _this = this;
            if (!this.checkGameState()) {
                return Promise.resolve({ flag: false, message: "当前游戏状态不可以移动棋子" });
            }
            this.logEvents.forEach(function (f) { return f("\u5F53\u524D ".concat(side, " \u8F93\u51FA\uFF1A").concat(str)); });
            if (this.currentSide !== side) {
                this.logEvents.forEach(function (f) { return f("\u5F53\u524D\u4E3A".concat(_this.currentSide, "\u65B9\u4E0B\u68CB\uFF0C\u8BF7\u7B49\u5F85\uFF01")); });
                return Promise.resolve({ flag: false, message: "\u5F53\u524D\u4E3A".concat(this.currentSide, "\u65B9\u4E0B\u68CB\uFF0C\u8BF7\u7B49\u5F85\uFF01") });
            }
            var res = parseStrToPoint(str, this.currentSide, this.livePieceList);
            if (!res) {
                this.logEvents.forEach(function (f) { return f("未找到棋子"); });
                return Promise.resolve({ flag: false, message: "\u672A\u627E\u5230\u68CB\u5B50" });
            }
            if (this.choosePiece) {
                this.clearMoveChoosePeiece();
            }
            this.choosePiece = res.choose;
            this.choosePiece.isChoose = true;
            return this.updateAsync(res.choose.getPoint(), res.mp, side, refreshCtx);
        }
    });
    /**
     * 初始化选择玩家方
     * @param side 玩家方
     */
    Object.defineProperty(ZhChess.prototype, "gameStart", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (side) {
            this.init();
            this.setGridDiff(side);
            this.gameState = "START";
            this.winner = null;
            this.lastMovePoint = undefined;
            this.lastMovePiece = undefined;
            this.gameSide = side;
            this.initPiece();
        }
    });
    /**
    * 清除移动完选中的棋子
    */
    Object.defineProperty(ZhChess.prototype, "clearMoveChoosePeiece", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            if (this.choosePiece) {
                this.choosePiece.isChoose = false;
                this.choosePiece = null;
            }
        }
    });
    /**
     * 更换当前运行玩家
     */
    Object.defineProperty(ZhChess.prototype, "changeSide", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            this.currentSide = this.currentSide === "RED" ? "BLACK" : "RED";
        }
    });
    /**
     * 更换玩家视角
     * @param side 玩家
     */
    Object.defineProperty(ZhChess.prototype, "changePlaySide", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (side) {
            this.setGridDiff(side);
            this.clearMoveChoosePeiece();
            this.checkDraw();
        }
    });
    /**
     * 更改当前走棋方
     * @param side 走棋方
     */
    Object.defineProperty(ZhChess.prototype, "changeCurrentPlaySide", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (side) {
            this.currentSide = side;
        }
    });
    /**
     * 游戏是否结束
     */
    Object.defineProperty(ZhChess.prototype, "gameOver", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            return this.gameState === "OVER";
        }
    });
    /**
     * 根据某方移动棋子判断自己将领是否安全
     * @param side 移动方
     * @param pos 移动棋子
     * @param cp 是去吃棋子还是移动棋子
     * @param pl 当前棋盘列表
     * @returns 是否安全
     */
    Object.defineProperty(ZhChess.prototype, "checkGeneralInTrouble", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (side, pos, cp, pl) {
            var enemySide = side === "BLACK" ? "RED" : "BLACK";
            var list;
            if ("move" in cp) {
                var pieceInfo = __assign(__assign({}, pos), cp.move);
                var piece = chessOfPeiceMap[pieceInfo.name](pieceInfo);
                list = pl.filter(function (i) { return !(i.x === pos.x && i.y === pos.y); });
                list.push(piece);
            }
            else {
                var pieceInfo = __assign(__assign({}, pos), cp.eat);
                var piece = chessOfPeiceMap[pieceInfo.name](pieceInfo);
                list = pl.filter(function (i) { return !(i.x === cp.eat.x && i.y === cp.eat.y) && !(i.x === pos.x && i.y === pos.y); });
                list.push(piece);
            }
            var isFaceToFace = this.checkGeneralsFaceToFaceInTrouble(list);
            if (isFaceToFace) {
                return true;
            }
            var enemySidePeiecList = list.filter(function (i) { return i.side === enemySide; });
            var sideGeneralPiece = list.find(function (i) { return i.side === side && i instanceof GeneralPiece; });
            var sidesideGeneralPoint = new Point(sideGeneralPiece.x, sideGeneralPiece.y);
            var hasTrouble = enemySidePeiecList.some(function (item) {
                var mf = item.move(sidesideGeneralPoint, list);
                // if (mf.flag) {
                //   console.log(`${item} 可以 直接 攻击 ${sideGeneralPiece}`);
                // }
                return mf.flag;
            });
            return hasTrouble;
        }
    });
    /**
     * 检查棋子移动 双方将领在一条直线上 false 不危险 true 危险
     * @param pl 假设移动后的棋子列表
     * @param side 当前下棋方
     * @returns 是否危险
     */
    Object.defineProperty(ZhChess.prototype, "checkGeneralsFaceToFaceInTrouble", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (pl) {
            var points = pl.filter(function (i) { return i instanceof GeneralPiece; }).map(function (i) { return ({ x: i.x, y: i.y }); });
            var max = points[0].y > points[1].y ? points[0].y : points[1].y;
            var min = points[0].y < points[1].y ? points[0].y : points[1].y;
            // 在同一条直线上
            if (points[0].x === points[1].x) {
                var hasPeice = pl.find(function (i) { return i.y < max && i.y > min && i.x === points[0].x; });
                // 如果有棋子 说明可以安全移动 
                if (hasPeice) {
                    return false;
                }
                return true;
            }
            return false;
        }
    });
    /**
     * 判断敌方被将军时，是否有解
     * @param enemySide 敌方
     * @param pl 当前棋盘列表
     * @returns  返回是否有解
     */
    Object.defineProperty(ZhChess.prototype, "checkEnemySideInTroubleHasSolution", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (enemySide, pl) {
            var _this = this;
            return pl.filter(function (i) { return i.side === enemySide; }).some(function (item) {
                var mps = item.getMovePoints(pl);
                // 是否有解法
                return mps.some(function (p) {
                    var isDis = findPiece(pl, p.disPoint);
                    if (isDis) {
                        return false;
                    }
                    var hasEat = findPiece(pl, p);
                    var checkPoint = hasEat ? { eat: p } : { move: p };
                    var hasSolution = !_this.checkGeneralInTrouble(enemySide, item, checkPoint, pl);
                    // console.log(`${item} 移动到 ${p}点 ${enemySide}方 ${!hasSolution ? '有' : '没有'} 危险！${hasSolution ? "有" : "无"}解法`);
                    return hasSolution;
                });
            });
        }
    });
    /**
     * 判断敌方是否还有下一步走法 无走法就是绝杀
     * @param enemySide 敌方
     * @returns {boolean}
     */
    Object.defineProperty(ZhChess.prototype, "checkEnemySideHasMovePoints", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (enemySide, pl) {
            var _this = this;
            // 当前棋子列表
            var currentList = pl;
            // 敌方棋子列表
            var enemyList = currentList.filter(function (p) { return p.side === enemySide; });
            var hasPeice = enemyList.find(function (p) {
                // 获取当前棋子可移动位置列表
                var mps = p.getMovePoints(currentList);
                return mps.find(function (mp) {
                    // 移动点 是否有棋子
                    var checkPoint = findPiece(currentList, mp) ? { eat: mp } : { move: mp };
                    var hasTrouble = _this.checkGeneralInTrouble(enemySide, p, checkPoint, currentList);
                    // 如果 移动存在危险表示 不可以移动此移动点
                    if (hasTrouble) {
                        return false;
                    }
                    return true;
                });
            });
            if (hasPeice) {
                return true;
            }
            return false;
        }
    });
    /**
     * 棋子运动前检查游戏状态是否可以运动
     * @returns 是否可以运动
     */
    Object.defineProperty(ZhChess.prototype, "checkGameState", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            // 游戏开始
            var data;
            if (this.gameState === "INIT") {
                data = { flag: false, message: "请选择红黑方" };
            }
            // 游戏结束
            else if (this.gameState === "OVER") {
                data = { flag: false, message: "棋盘结束 等待重开！" };
            }
            // 正在移动
            else if (this.gameState === "MOVE") {
                data = { flag: false, message: "棋子正在移动，无法做任何操作" };
            }
            else {
                data = { flag: true };
            }
            if (!data.flag) {
                var msg_1 = data.message;
                this.logEvents.forEach(function (f) { return f(msg_1); });
                this.moveFailEvents.forEach(function (f) { return f(null, null, msg_1); });
            }
            return data;
        }
    });
    /**
     * 检查是否有画布 有会更新画布 否则不更新 报出错误
     */
    Object.defineProperty(ZhChess.prototype, "checkDraw", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            if (this.ctx) {
                try {
                    this.draw(this.ctx);
                    this.drawLastMovePoint(this.ctx);
                }
                catch (error) {
                    this.errorEvents.forEach(function (f) { return f(error); });
                }
            }
            else {
                this.errorEvents.forEach(function (f) { return f(new Error("未找到画布，无法更新当前棋盘布局画面！")); });
            }
        }
    });
    /**
     * 监听棋盘点击
     */
    Object.defineProperty(ZhChess.prototype, "listenClick", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (e) {
            var _a, _b;
            var x = e.offsetX, y = e.offsetY;
            if (!this.checkGameState().flag) {
                return;
            }
            var clickPoint = this.getGridPosition({ x: x, y: y });
            if (!clickPoint) {
                var msg_2 = '点击的位置未找到棋子';
                this.logEvents.forEach(function (f) { return f(msg_2); });
                this.moveFailEvents.forEach(function (f) { return f(null, null, msg_2); });
                return;
            }
            var isChoose = Boolean(this.choosePiece);
            var pos = isChoose ? new Point((_a = this.choosePiece) === null || _a === void 0 ? void 0 : _a.x, (_b = this.choosePiece) === null || _b === void 0 ? void 0 : _b.y) : clickPoint;
            var mov = isChoose ? clickPoint : null;
            var side = this.currentSide;
            this.update(pos, mov, side, true);
            this.checkDraw();
        }
    });
    /**
    * 监听棋盘点击
    */
    Object.defineProperty(ZhChess.prototype, "listenClickAsync", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (e) {
            var _this = this;
            var _a, _b;
            var x = e.offsetX, y = e.offsetY;
            if (!this.checkGameState().flag) {
                return;
            }
            var clickPoint = this.getGridPosition({ x: x, y: y });
            if (!clickPoint) {
                var msg_3 = '点击的位置未找到棋子';
                this.logEvents.forEach(function (f) { return f(msg_3); });
                this.moveFailEvents.forEach(function (f) { return f(null, null, msg_3); });
                return;
            }
            var isChoose = Boolean(this.choosePiece);
            var pos = isChoose ? new Point((_a = this.choosePiece) === null || _a === void 0 ? void 0 : _a.x, (_b = this.choosePiece) === null || _b === void 0 ? void 0 : _b.y) : clickPoint;
            var mov = isChoose ? clickPoint : null;
            var side = this.currentSide;
            this.updateAsync(pos, mov, side, true).then(function (data) {
                _this.checkDraw();
                if (!data.flag) {
                    _this.moveFailEvents.forEach(function (f) { return f(pos, mov, data.message); });
                }
            });
        }
    });
    Object.defineProperty(ZhChess.prototype, "winnerSide", {
        /**
         * 获取赢棋方
         */
        get: function () {
            return this.winner;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZhChess.prototype, "currentGameSide", {
        /**
         * 获取游戏方
         */
        get: function () {
            return this.gameSide;
        },
        set: function (val) {
            console.log("\u8BBE\u7F6E\u503C\u65E0\u6548\uFF1A".concat(val));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZhChess.prototype, "currentLivePieceList", {
        /**
         * 获取当前存活的棋子列表
         */
        get: function () {
            return this.livePieceList.map(function (item) {
                return chessOfPeiceMap[item.name](__assign({}, item));
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZhChess.prototype, "currentRadius", {
        /**
         * 获取当前象棋绘制半径
         */
        get: function () {
            return this.radius;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZhChess.prototype, "getCurrentPenCode", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (side) {
            return gen_PEN_Str(this.livePieceList, side);
        }
    });
    /**
     * 象棋事件监听
     * @param e 监听事件
     * @param fn 监听函数
     */
    Object.defineProperty(ZhChess.prototype, "on", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (e, fn) {
            if (typeof fn === "function") {
                if (e === "log") {
                    this.logEvents.push(fn);
                }
                else if (e === "move") {
                    this.moveEvents.push(fn);
                }
                else if (e === "moveFail") {
                    this.moveFailEvents.push(fn);
                }
                else if (e === "over") {
                    this.overEvents.push(fn);
                }
                else if (e === "error") {
                    this.errorEvents.push(fn);
                }
            }
            else {
                throw new Error("监听函数值应该为 function 类型");
            }
        }
    });
    /**
     * 移除象棋事件监听
     * @param e 监听事件
     * @param fn 监听函数
     */
    Object.defineProperty(ZhChess.prototype, "removeEvent", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (e, fn) {
            if (typeof fn === "function") {
                if (e === "log") {
                    this.logEvents = this.logEvents.filter(function (f) { return f !== fn; });
                }
                else if (e === "move") {
                    this.moveEvents = this.moveEvents.filter(function (f) { return f !== fn; });
                }
                else if (e === "moveFail") {
                    this.moveFailEvents = this.moveFailEvents.filter(function (f) { return f !== fn; });
                }
                else if (e === "over") {
                    this.overEvents = this.overEvents.filter(function (f) { return f !== fn; });
                }
                else if (e === "error") {
                    this.errorEvents = this.errorEvents.filter(function (f) { return f !== fn; });
                }
            }
            else {
                throw new Error("监听函数值应该为 function 类型");
            }
        }
    });
    /**
     * 设置当前存活棋子列表
     * @param pl 当前存活棋子列表
     */
    Object.defineProperty(ZhChess.prototype, "setLivePieceList", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (pl) {
            this.livePieceList = pl;
        }
    });
    /**
     * 根据pen代码格式来设置当前棋盘
     * @param penCode
     *
     * 建议参考 文章 博客
     * 1. https://www.xqbase.com/protocol/cchess_fen.htm
     */
    Object.defineProperty(ZhChess.prototype, "setPenCodeList", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (penCode) {
            var data = parse_PEN_Str(penCode);
            this.setLastMovePeiceStatus(false);
            this.clearMoveChoosePeiece();
            this.lastMovePiece = undefined;
            this.lastMovePoint = undefined;
            this.livePieceList = data.list.map(function (p) { return chessOfPeiceMap[p.name](p); });
            this.currentSide = data.side;
        }
    });
    /**
     * 绘画上次移动点，可自行重写该函数
     * @param ctx canvas 2d 渲染上下文
     */
    Object.defineProperty(ZhChess.prototype, "drawLastMovePoint", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (ctx) {
            if (!this.choosePiece && this.lastMovePoint && ctx) {
                var x = this.startX + Math.abs(this.lastMovePoint.x - this.gridDiffX) * this.gridWidth;
                var y = this.startY + Math.abs(this.lastMovePoint.y - this.gridDiffY) * this.gridHeight;
                ctx.beginPath();
                ctx.arc(x, y, this.radius * .8, 0, 2 * Math.PI);
                var gradient = ctx.createRadialGradient(x, y, this.radius * .05, x, y, this.radius * .8);
                gradient.addColorStop(0, this.movePointColor);
                gradient.addColorStop(1, "rgba(255,255,255,0)");
                ctx.closePath();
                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }
    });
    /**
     * 设置上次移动状态
     */
    Object.defineProperty(ZhChess.prototype, "setLastMovePeiceStatus", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (status) {
            if (this.lastMovePiece) {
                this.lastMovePiece.isLastMove = status;
            }
        }
    });
    return ZhChess;
}());

exports.CannonPiece = CannonPiece;
exports.ElephantPiece = ElephantPiece;
exports.GeneralPiece = GeneralPiece;
exports.HorsePiece = HorsePiece;
exports.KnightPiece = KnightPiece;
exports.MovePoint = MovePoint;
exports.Piece = Piece;
exports.Point = Point;
exports.RookPiece = RookPiece;
exports.SoldierPiece = SoldierPiece;
exports.chessOfPeiceMap = chessOfPeiceMap;
exports["default"] = ZhChess;
exports.diffPenStr = diffPenStr;
exports.gen_PEN_Point_Str = gen_PEN_Point_Str;
exports.gen_PEN_Str = gen_PEN_Str;
exports.initBoardPen = initBoardPen;
exports.parse_PEN_Str = parse_PEN_Str;
exports.peiceSideMap = peiceSideMap;
