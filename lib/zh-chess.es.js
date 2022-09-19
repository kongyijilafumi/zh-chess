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
/* global Reflect, Promise */

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

var peiceSideMap = {
    "RED": "红方",
    "BLACK": "黑方"
};
var Point = /** @class */ (function () {
    function Point(x, y) {
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
var MovePoint = /** @class */ (function (_super) {
    __extends(MovePoint, _super);
    function MovePoint(x, y, p) {
        var _this = _super.call(this, x, y) || this;
        Object.defineProperty(_this, "disPoint", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        _this.disPoint = new Point(p.x, p.y);
        return _this;
    }
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
        Object.defineProperty(this, "radius", {
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
        this.x = pieceInfo.x;
        this.y = pieceInfo.y;
        this.radius = pieceInfo.radius;
        this.name = pieceInfo.name;
        this.side = pieceInfo.side;
        this.isChoose = pieceInfo.isChoose;
    }
    Object.defineProperty(Piece.prototype, "toString", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            return "[".concat(this.side, "\u65B9]:").concat(this.name, "(").concat(this.x, ",").concat(this.y, ")");
        }
    });
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
    return Piece;
}());
// 车
var RookPiece = /** @class */ (function (_super) {
    __extends(RookPiece, _super);
    function RookPiece(info) {
        return _super.call(this, info) || this;
    }
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
// 马
var HorsePiece = /** @class */ (function (_super) {
    __extends(HorsePiece, _super);
    function HorsePiece(info) {
        return _super.call(this, info) || this;
    }
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
// 象
var ElephantPiece = /** @class */ (function (_super) {
    __extends(ElephantPiece, _super);
    function ElephantPiece(info) {
        return _super.call(this, info) || this;
    }
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
            return this.filterMovePoints(mps, pl);
        }
    });
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
// 士
var KnightPiece = /** @class */ (function (_super) {
    __extends(KnightPiece, _super);
    function KnightPiece(info) {
        return _super.call(this, info) || this;
    }
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
// 将领
var GeneralPiece = /** @class */ (function (_super) {
    __extends(GeneralPiece, _super);
    function GeneralPiece(info) {
        return _super.call(this, info) || this;
    }
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
// 炮
var CannonPiece = /** @class */ (function (_super) {
    __extends(CannonPiece, _super);
    function CannonPiece(info) {
        return _super.call(this, info) || this;
    }
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
                if (list.length === 1) {
                    var hasPeice_1 = pieceList.find(function (i) { return i.x === p.x && i.y === p.y; });
                    if (hasPeice_1) {
                        return { flag: true };
                    }
                    return { flag: false, message: "无法击中敌方棋子，移动无效" };
                }
                // 无炮架  且 目标位置有敌方棋子
                var hasPeice = pieceList.find(function (i) { return i.x === p.x && i.y === p.y; });
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
// 兵
var SoldierPiece = /** @class */ (function (_super) {
    __extends(SoldierPiece, _super);
    function SoldierPiece(info) {
        return _super.call(this, info) || this;
    }
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
var findPiece = function (pl, p) { return pl.find(function (item) { return item.x === p.x && item.y === p.y; }); };
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

var getPiecesList = function (r) {
    var piecesList = [];
    // 车 马 象 士 炮
    for (var index = 0; index < 2; index++) {
        var blackRook = new RookPiece({ x: 0 + index * 8, y: 0, name: "車", radius: r, side: "BLACK", isChoose: false });
        var blackHorse = new HorsePiece({ x: 1 + index * 6, y: 0, name: "馬", radius: r, side: "BLACK", isChoose: false });
        var blackElephant = new ElephantPiece({ x: 2 + index * 4, y: 0, name: "象", radius: r, side: "BLACK", isChoose: false });
        var blackKnight = new KnightPiece({ x: 3 + index * 2, y: 0, name: "仕", radius: r, side: "BLACK", isChoose: false });
        var blackCannon = new CannonPiece({ x: 1 + index * 6, y: 2, name: "砲", radius: r, side: "BLACK", isChoose: false });
        var redRook = new RookPiece({ x: 0 + index * 8, y: 9, name: "车", radius: r, side: "RED", isChoose: false });
        var redHorse = new HorsePiece({ x: 1 + index * 6, y: 9, name: "马", radius: r, side: "RED", isChoose: false });
        var redElephant = new ElephantPiece({ x: 2 + index * 4, y: 9, name: "相", radius: r, side: "RED", isChoose: false });
        var redKnight = new KnightPiece({ x: 3 + index * 2, y: 9, name: "士", radius: r, side: "RED", isChoose: false });
        var redCannon = new CannonPiece({ x: 1 + index * 6, y: 7, name: "炮", radius: r, side: "RED", isChoose: false });
        piecesList.push(blackRook, blackHorse, blackElephant, blackKnight, blackCannon, redRook, redHorse, redElephant, redKnight, redCannon);
    }
    // 兵
    for (var index = 0; index < 5; index++) {
        var blackSoldier = new SoldierPiece({ x: 2 * index, y: 3, name: "卒", radius: r, side: "BLACK", isChoose: false });
        var redSoldier = new SoldierPiece({ x: 2 * index, y: 6, name: "兵", radius: r, side: "RED", isChoose: false });
        piecesList.push(blackSoldier, redSoldier);
    }
    var blackGeneral = new GeneralPiece({ x: 4, y: 0, name: "将", radius: r, side: "BLACK", isChoose: false });
    var redGeneral = new GeneralPiece({ x: 4, y: 9, name: "帅", radius: r, side: "RED", isChoose: false });
    piecesList.push(blackGeneral, redGeneral);
    return piecesList;
};

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

var Game = /** @class */ (function () {
    function Game(_a) {
        var ctx = _a.ctx, _b = _a.gameWidth, gameWidth = _b === void 0 ? 800 : _b, _c = _a.gameHeight, gameHeight = _c === void 0 ? 800 : _c, _d = _a.gamePadding, gamePadding = _d === void 0 ? 20 : _d, _e = _a.scaleRatio, scaleRatio = _e === void 0 ? 1 : _e, _f = _a.moveSpeed, moveSpeed = _f === void 0 ? 8 : _f;
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
         * 当前被吃掉的棋子
         */
        Object.defineProperty(this, "deadPieceList", {
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
         * 运行速度 大于或等于 1 的数 越大越慢
         */
        Object.defineProperty(this, "moveSpeed", {
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
        Object.defineProperty(this, "moveEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "moveFailEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "logEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "overEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (!ctx) {
            throw new Error("请传入画布");
        }
        this.moveEvents = [];
        this.moveFailEvents = [];
        this.logEvents = [];
        this.overEvents = [];
        this.ctx = ctx;
        // 设置 缩放 来解决移动端模糊问题
        this.ctx.scale(scaleRatio, scaleRatio);
        this.listenClick = this.listenClick.bind(this);
        this.listenClickAsync = this.listenClickAsync.bind(this);
        this.gridPostionList = [];
        this.setGridList();
        this.gameState = "INIT";
        this.moveSpeed = moveSpeed;
        this.setGameWindow(gameWidth, gameHeight, gamePadding);
        this.init();
    }
    /**
     * 设置游戏窗口 棋盘
     */
    Object.defineProperty(Game.prototype, "setGameWindow", {
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
            this.radius = this.gridHeight * 0.45;
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
    Object.defineProperty(Game.prototype, "getGridDiff", {
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
    Object.defineProperty(Game.prototype, "setGridDiff", {
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
    Object.defineProperty(Game.prototype, "setGridList", {
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
    Object.defineProperty(Game.prototype, "getGridPosition", {
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
    Object.defineProperty(Game.prototype, "init", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            this.currentSide = "RED";
            this.choosePiece = null;
            this.deadPieceList = [];
            this.livePieceList = [];
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.drawChessLine();
        }
    });
    /**
     * 初始化象棋个数
     */
    Object.defineProperty(Game.prototype, "initPiece", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            this.livePieceList = getPiecesList(this.radius);
            this.choosePiece = null;
            this.deadPieceList = [];
            this.redraw();
        }
    });
    /**
     * 画 棋盘 跟 棋子
     */
    Object.defineProperty(Game.prototype, "drawPeice", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (pieceList) {
            var _this = this;
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.drawChessLine();
            pieceList.forEach(function (p) { return _this.drawSinglePeice(p, true); });
        }
    });
    /**
     * 绘画单个象棋
     * @param piece 单个象棋
     */
    Object.defineProperty(Game.prototype, "drawSinglePeice", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (piece, replaceXY) {
            var _this = this;
            var _a = this, startX = _a.startX, startY = _a.startY, gridWidth = _a.gridWidth, gridHeight = _a.gridHeight, gridDiffX = _a.gridDiffX, gridDiffY = _a.gridDiffY;
            var bgfillStyle = piece.side === "BLACK" ? "#fdec9e" : "#feeca0";
            var textColor = piece.side === "BLACK" ? "#000" : "#c1190c";
            var borderColor = piece.isChoose ? "red" : "#000";
            var x = startX + piece.x * gridWidth;
            var y = startY + piece.y * gridHeight;
            if (replaceXY) {
                x = startX + Math.abs(piece.x - gridDiffX) * gridWidth;
                y = startY + Math.abs(piece.y - gridDiffY) * gridHeight;
            }
            var r = piece.radius, ty = 0;
            this.ctx.fillStyle = bgfillStyle;
            var drawBoder = function (x, y, r, startAngle, endAngle) {
                _this.ctx.beginPath();
                _this.ctx.arc(x, y, r, startAngle, endAngle);
                _this.ctx.closePath();
                _this.ctx.stroke();
            };
            // 选中动画
            if (piece.isChoose) {
                r = r / 0.98;
                ty = piece.side === "RED" ? -3 : 3;
                ty = gridDiffY > 0 ? ty * -1 : ty;
            }
            // 象棋背景
            this.ctx.beginPath();
            this.ctx.arc(x, y + ty, r, 0, 2 * Math.PI);
            // if (piece.isChoose) {
            this.ctx.shadowOffsetX = 3;
            this.ctx.shadowOffsetY = 4;
            this.ctx.shadowColor = '#333';
            this.ctx.shadowBlur = 5;
            // }
            this.ctx.fill();
            this.ctx.closePath();
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            // 象棋圆圈
            this.ctx.strokeStyle = borderColor;
            drawBoder(x, y + ty, r, 0, 2 * Math.PI);
            drawBoder(x, y + ty, r - 3, 0, 2 * Math.PI);
            // 字
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillStyle = textColor;
            this.ctx.font = piece.radius + "px yahei";
            this.ctx.fillText(piece.name, x, y + ty);
        }
    });
    /**
     * 画棋盘
     */
    Object.defineProperty(Game.prototype, "drawChessLine", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var _a = this, startX = _a.startX, startY = _a.startY, endX = _a.endX, endY = _a.endY, gridWidth = _a.gridWidth, gridHeight = _a.gridHeight;
            // 画背景
            this.ctx.fillStyle = "#faebd7";
            this.ctx.fillRect(0, 0, this.width, this.width);
            this.ctx.strokeStyle = "#000";
            // 横线
            for (var index = 0; index < 10; index++) {
                this.ctx.beginPath();
                var y = startY + gridHeight * index;
                this.ctx.moveTo(startX, y);
                this.ctx.lineTo(endX, y);
                this.ctx.closePath();
                this.ctx.stroke();
            }
            // 竖线
            for (var index = 0; index < 9; index++) {
                var x = startX + index * gridWidth;
                var midY = startY + gridHeight * 4;
                var by = startY + gridHeight * 9;
                if (index === 0 || index === 8) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, startY);
                    this.ctx.lineTo(x, by);
                    this.ctx.closePath();
                    this.ctx.stroke();
                    continue;
                }
                this.ctx.beginPath();
                this.ctx.moveTo(x, startY);
                this.ctx.lineTo(x, midY);
                this.ctx.closePath();
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(x, midY + gridHeight);
                this.ctx.lineTo(x, endY);
                this.ctx.closePath();
                this.ctx.stroke();
            }
            // 士的两把叉
            for (var index = 0; index < 2; index++) {
                var x = startX + gridWidth * 3;
                var points = getSquarePoints({ x: x, y: startY + gridHeight * 7 * index }, gridWidth * 2, gridHeight * 2);
                this.ctx.beginPath();
                this.ctx.moveTo(points[0].x, points[0].y);
                this.ctx.lineTo(points[2].x, points[2].y);
                this.ctx.moveTo(points[1].x, points[1].y);
                this.ctx.lineTo(points[3].x, points[3].y);
                this.ctx.closePath();
                this.ctx.stroke();
            }
        }
    });
    /**
     * 重新绘画当前棋盘
     */
    Object.defineProperty(Game.prototype, "redraw", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            this.drawPeice(this.livePieceList);
        }
    });
    /**
     * 动画效果 绘画 棋子移动
     * @param mp 移动点
     * @param pl 绘画的棋子列表
     * @param activePoint 当前移动点
     */
    Object.defineProperty(Game.prototype, "activeMove", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (mp, pl, activePoint) {
            var _this = this;
            var dx = (activePoint.x - mp.x);
            var dy = (activePoint.y - mp.y);
            var xstep = dx === 0 ? 0 : dx / this.moveSpeed;
            var ystep = dy === 0 ? 0 : dy / this.moveSpeed;
            // 是否支持 动画 API 
            if (typeof window.requestAnimationFrame === "function" && typeof window.requestAnimationFrame === "function") {
                return new Promise(function (resolve) {
                    var raf;
                    var cb = function () {
                        // const mx = mp.x.toFixed(2), ax = activePoint.x.toFixed(2), my = mp.y.toFixed(2), ay = activePoint.y.toFixed(2)
                        var diffX = Math.abs(mp.x - activePoint.x), diffY = Math.abs(mp.y - activePoint.y);
                        // console.log(`diffX:${diffX} diffY:${diffY}\nxstep:${Math.abs(xstep)} ystep:${Math.abs(ystep)}`);
                        if (diffX <= Math.abs(xstep) && diffY <= Math.abs(ystep) && _this.choosePiece) {
                            window.cancelAnimationFrame(raf);
                            return resolve(mp);
                        }
                        _this.drawPeice(pl);
                        var peice = __assign({}, _this.choosePiece);
                        // peice.isChoose = false
                        peice.x = Math.abs(activePoint.x - _this.gridDiffX) - xstep;
                        peice.y = Math.abs(activePoint.y - _this.gridDiffY) - ystep;
                        _this.drawSinglePeice(peice);
                        activePoint.x -= xstep;
                        activePoint.y -= ystep;
                        raf = window.requestAnimationFrame(cb);
                    };
                    cb();
                });
            }
            return Promise.resolve(mp);
        }
    });
    /**
     * 当前选中的棋子 根据点来 移动
     * @param checkPoint 移动点或者是吃
     */
    Object.defineProperty(Game.prototype, "moveToPeice", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (checkPoint) {
            if (this.choosePiece) {
                var side = this.currentSide;
                var isMove = "move" in checkPoint;
                var point_1 = isMove ? checkPoint.move : checkPoint.eat;
                var lastChoosePeice_1 = this.choosePiece;
                var hasTrouble = this.checkGeneralInTrouble(side, this.choosePiece, checkPoint, this.livePieceList);
                if (hasTrouble) {
                    this.moveFailEvents.forEach(function (f) { return f(lastChoosePeice_1, point_1, true, "不可以送将！"); });
                    return { flag: true };
                }
                if (!isMove) {
                    var eatPeice = findPiece(this.livePieceList, point_1);
                    this.livePieceList = this.livePieceList.filter(function (i) { return !(i.x === point_1.x && i.y === point_1.y); });
                    this.deadPieceList.push(eatPeice);
                }
                this.gameState = "MOVE";
                return this.moveStart(lastChoosePeice_1, checkPoint, this.livePieceList, side);
            }
            return { flag: false, message: "未选中棋子" };
        }
    });
    /**
     * 把当前选中的棋子 移动到 指定的位置
     * @param p 移动位置
     * @param drawPeiceList 需要画的棋子列表
     */
    Object.defineProperty(Game.prototype, "movePeiceToPointAsync", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (p, drawPeiceList) {
            var _this = this;
            return new Promise(function (res) {
                if (_this.choosePiece) {
                    var _a = _this.choosePiece, x_1 = _a.x, y_1 = _a.y;
                    var pl = drawPeiceList.filter(function (i) { return !(i.x === x_1 && i.y === y_1); });
                    var ap = new Point(_this.choosePiece.x, _this.choosePiece.y);
                    _this.activeMove(p, pl, ap).then(function (point) {
                        _this.moveEnd(point);
                        res();
                    });
                }
                else {
                    res();
                }
            });
        }
    });
    /**
    * 当前选中的棋子 根据点来 移动
    * @param checkPoint 移动点或者是吃
    */
    Object.defineProperty(Game.prototype, "moveToPeiceAsync", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (checkPoint) {
            if (this.choosePiece) {
                var side = this.currentSide;
                var isMove = "move" in checkPoint;
                var point_2 = isMove ? checkPoint.move : checkPoint.eat;
                var lastChoosePeice_2 = this.choosePiece;
                var hasTrouble = this.checkGeneralInTrouble(side, this.choosePiece, checkPoint, this.livePieceList);
                if (hasTrouble) {
                    this.moveFailEvents.forEach(function (f) { return f(lastChoosePeice_2, point_2, true, "不可以送将！"); });
                    return Promise.resolve({ flag: false, message: "不可以送将！" });
                }
                if (!isMove) {
                    var eatPeice = findPiece(this.livePieceList, point_2);
                    this.livePieceList = this.livePieceList.filter(function (i) { return !(i.x === point_2.x && i.y === point_2.y); });
                    this.deadPieceList.push(eatPeice);
                }
                this.gameState = "MOVE";
                return this.moveStartAsync(lastChoosePeice_2, checkPoint, this.livePieceList, side).then(function () { return ({ flag: true }); });
            }
            return Promise.resolve({ flag: false, message: "未选择棋子" });
        }
    });
    /**
     * 开始移动棋子
     * @param mp 移动棋子
     * @param checkPoint 移动点还是吃棋点
     * @param drawList 绘画棋子列表
     * @param side 当前下棋方
     */
    Object.defineProperty(Game.prototype, "moveStart", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (mp, checkPoint, drawList, side) {
            var enemySide = side === "RED" ? "BLACK" : "RED";
            var p = "move" in checkPoint ? checkPoint.move : checkPoint.eat;
            this.moveEnd(p);
            var enemyhasTrouble = this.checkGeneralInTrouble(enemySide, mp, { move: p }, drawList);
            if (enemyhasTrouble) {
                var movedPeiceList = drawList.filter(function (i) { return !(i.x === mp.x && i.y === mp.y); });
                var newMp = chessOfPeiceMap[mp.name](__assign(__assign({}, mp), p));
                movedPeiceList.push(newMp);
                var hasSolution = this.checkEnemySideInTroubleHasSolution(enemySide, movedPeiceList);
                if (!hasSolution) {
                    this.gameState = "OVER";
                    this.overEvents.forEach(function (f) { return f(side); });
                }
            }
            this.moveEvents.forEach(function (f) { return f(mp, checkPoint, enemyhasTrouble); });
            return { flag: true };
        }
    });
    Object.defineProperty(Game.prototype, "moveStartAsync", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (mp, checkPoint, drawList, side) {
            var _this = this;
            var enemySide = side === "RED" ? "BLACK" : "RED";
            var p = "move" in checkPoint ? checkPoint.move : checkPoint.eat;
            return this.movePeiceToPointAsync(p, drawList).then(function () {
                var enemyhasTrouble = _this.checkGeneralInTrouble(enemySide, mp, { move: p }, drawList);
                if (enemyhasTrouble) {
                    var movedPeiceList = drawList.filter(function (i) { return !(i.x === mp.x && i.y === mp.y); });
                    var newMp = chessOfPeiceMap[mp.name](__assign(__assign({}, mp), p));
                    movedPeiceList.push(newMp);
                    var hasSolution = _this.checkEnemySideInTroubleHasSolution(enemySide, movedPeiceList);
                    if (!hasSolution) {
                        _this.gameState = "OVER";
                        _this.overEvents.forEach(function (f) { return f(side); });
                    }
                }
                _this.moveEvents.forEach(function (f) { return f(mp, checkPoint, enemyhasTrouble); });
                return null;
            });
        }
    });
    /**
     * 动画移动结束，当前选中的棋子更新 x, y坐标，重新绘画 更换 玩家 和 运动状态
     * @param p 移动点
     */
    Object.defineProperty(Game.prototype, "moveEnd", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (p) {
            var _this = this;
            this.livePieceList = this.livePieceList.map(function (i) {
                var _a, _b;
                if (i.x === ((_a = _this.choosePiece) === null || _a === void 0 ? void 0 : _a.x) && i.y === ((_b = _this.choosePiece) === null || _b === void 0 ? void 0 : _b.y)) {
                    var peiceInfo = __assign(__assign(__assign({}, i), { isChoose: false }), p);
                    return chessOfPeiceMap[i.name](peiceInfo);
                }
                return i;
            });
            this.clearMoveChoosePeiece();
            this.changeSide();
            this.redraw();
            this.gameState = "START";
        }
    });
    /**
     * 移动棋子
     * @param clickPoint 移动点
     */
    Object.defineProperty(Game.prototype, "pieceMove", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (clickPoint) {
            var _this = this;
            var choosePiece = findPiece(this.livePieceList, clickPoint);
            // 在棋盘上 还没开始选中的点击
            if (!this.choosePiece) {
                // 如果 没点到棋子 
                if (!choosePiece) {
                    return { flag: false, message: "未找到棋子" };
                }
                // 点击到了敌方的棋子
                if (this.currentSide !== choosePiece.side) {
                    return { flag: false, message: "选中了敌方的棋子" };
                }
                this.choosePiece = choosePiece;
                this.choosePiece.isChoose = true;
                this.logEvents.forEach(function (f) { return f("\u5F53\u524D\uFF1A".concat(_this.currentSide, " \u65B9 \u9009\u4E2D\u4E86 \u68CB\u5B50:").concat(choosePiece)); });
                this.redraw();
                return { flag: true };
            }
            // 选中之后的点击
            if (!choosePiece) { // 没有选中棋子 说明 已选中的棋子要移动过去
                var moveFlag_1 = this.choosePiece.move(clickPoint, this.livePieceList);
                var mp_1 = this.choosePiece;
                if (moveFlag_1.flag) {
                    return this.moveToPeice({ move: clickPoint });
                }
                this.moveFailEvents.forEach(function (f) { return f(mp_1, clickPoint, true, moveFlag_1.message); });
                return moveFlag_1;
            }
            // 如果点击的棋子是己方
            if (choosePiece.side === this.currentSide) {
                if (this.choosePiece === choosePiece) { // 如果是点击选中的棋子 取消选中
                    this.clearMoveChoosePeiece();
                    this.logEvents.forEach(function (f) { return f(_this.currentSide + "方： 取消选中 " + choosePiece); });
                    this.redraw();
                    return { flag: true };
                }
                { // 切换选中棋子
                    this.choosePiece.isChoose = false;
                    this.logEvents.forEach(function (f) { return f("".concat(_this.currentSide, "\u65B9\uFF1A\u5207\u6362 \u9009\u4E2D\u68CB\u5B50 \u7531").concat(_this.choosePiece, " --> ").concat(choosePiece)); });
                    this.choosePiece = choosePiece;
                    this.choosePiece.isChoose = true;
                    this.redraw();
                    return { flag: true };
                }
            }
            // 如果点击的的棋子是敌方 ，要移动到敌方的棋子位置上
            this.logEvents.forEach(function (f) { return f("\u5F53\u524D\uFF1A".concat(_this.currentSide, " ,\u68CB\u5B50:").concat(_this.choosePiece, " \u9700\u8981\u79FB\u52A8\u5230\uFF1A").concat(clickPoint, " \u8FD9\u4E2A\u70B9\u4E0A\uFF0C\u5E76\u4E14\u8981\u5403\u6389 ").concat(choosePiece)); });
            var moveFlag = this.choosePiece.move(clickPoint, this.livePieceList);
            if (!moveFlag.flag) {
                this.moveFailEvents.forEach(function (f) { return f(_this.choosePiece, clickPoint, false, moveFlag.message); });
            }
            else {
                this.moveToPeice({ eat: clickPoint });
            }
            return moveFlag;
        }
    });
    /**
    * 移动棋子
    * @param p 移动点
    * @returns 返回promise移动结果
    */
    Object.defineProperty(Game.prototype, "pieceMoveAsync", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (p) {
            var _this = this;
            var choosePiece = findPiece(this.livePieceList, p);
            // 在棋盘上 还没开始选中的点击
            if (!this.choosePiece) {
                // 如果 没点到棋子 
                if (!choosePiece) {
                    return Promise.resolve({ flag: false, message: "未找到棋子" });
                }
                // 点击到了敌方的棋子
                if (this.currentSide !== choosePiece.side) {
                    return Promise.resolve({ flag: false, message: "选中了敌方的棋子" });
                }
                this.choosePiece = choosePiece;
                this.choosePiece.isChoose = true;
                this.logEvents.forEach(function (f) { return f("\u5F53\u524D\uFF1A".concat(_this.currentSide, " \u65B9 \u9009\u4E2D\u4E86 \u68CB\u5B50:").concat(choosePiece)); });
                this.redraw();
                return Promise.resolve({ flag: true });
            }
            // 选中之后的点击
            // 没有选中棋子 说明 已选中的棋子要移动过去
            if (!choosePiece) {
                var moveFlag_2 = this.choosePiece.move(p, this.livePieceList);
                var mp_2 = this.choosePiece;
                if (moveFlag_2.flag) {
                    return this.moveToPeiceAsync({ move: p });
                }
                this.moveFailEvents.forEach(function (f) { return f(mp_2, p, true, moveFlag_2.message); });
                return Promise.resolve(moveFlag_2);
            }
            // 如果点击的棋子是己方
            if (choosePiece.side === this.currentSide) {
                // 如果是点击选中的棋子
                if (this.choosePiece === choosePiece) { // 取消选中
                    this.clearMoveChoosePeiece();
                    this.logEvents.forEach(function (f) { return f(_this.currentSide + "方： 取消选中 " + choosePiece); });
                    this.redraw();
                    return Promise.resolve({ flag: true });
                }
                // 切换选中棋子
                this.choosePiece.isChoose = false;
                this.logEvents.forEach(function (f) { return f("".concat(_this.currentSide, "\u65B9\uFF1A\u5207\u6362 \u9009\u4E2D\u68CB\u5B50 \u7531").concat(_this.choosePiece, " --> ").concat(choosePiece)); });
                this.choosePiece = choosePiece;
                this.choosePiece.isChoose = true;
                this.redraw();
                return Promise.resolve({ flag: true });
            }
            // 如果点击的的棋子是敌方 ，要移动到敌方的棋子位置上
            this.logEvents.forEach(function (f) { return f("\u5F53\u524D\uFF1A".concat(_this.currentSide, " ,\u68CB\u5B50:").concat(_this.choosePiece, " \u9700\u8981\u79FB\u52A8\u5230\uFF1A").concat(p, " \u8FD9\u4E2A\u70B9\u4E0A\uFF0C\u5E76\u4E14\u8981\u5403\u6389 ").concat(choosePiece)); });
            var moveFlag = this.choosePiece.move(p, this.livePieceList);
            if (!moveFlag.flag) {
                this.moveFailEvents.forEach(function (f) { return f(_this.choosePiece, p, false, moveFlag.message); });
            }
            else {
                return this.moveToPeiceAsync({ eat: p });
            }
            return Promise.resolve(moveFlag);
        }
    });
    /**
     * 根据坐标点移动位置
     * @param piecePoint 棋子所在位置
     * @param movePoint 移动位置
     * @param side 下棋方
     */
    Object.defineProperty(Game.prototype, "move", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (piecePoint, movePoint, side) {
            var _this = this;
            if (!this.checkGameState()) {
                return { flag: false, message: "当前游戏状态不可以移动棋子" };
            }
            if (this.currentSide !== side) {
                return { flag: false, message: "请等待对方下棋" };
            }
            var reverseSide = side === "RED" ? "BLACK" : "RED";
            var formatPoint = function (p) { return ({ x: Math.abs(p.x - _this.getGridDiff(side, "x")), y: Math.abs(p.y - _this.getGridDiff(reverseSide, "y")) }); };
            var posPeice = findPiece(this.livePieceList, formatPoint(piecePoint));
            if (!posPeice || posPeice.side !== this.currentSide) {
                this.logEvents.forEach(function (f) { return f("未找到棋子"); });
                return { flag: false, message: "未找到棋子" };
            }
            posPeice.isChoose = true;
            this.choosePiece = posPeice;
            return this.pieceMove(formatPoint(movePoint));
        }
    });
    /**
     * 根据坐标点移动位置
     * @param piecePoint 棋子所在位置
     * @param movePoint 移动位置
     * @param side 下棋方
     */
    Object.defineProperty(Game.prototype, "moveAsync", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (piecePoint, movePoint, side) {
            var _this = this;
            if (!this.checkGameState()) {
                return Promise.resolve({ flag: false, message: "当前游戏状态不可以移动棋子" });
            }
            if (this.currentSide !== side) {
                return Promise.resolve({ flag: false, message: "\u5F53\u524D\u4E3A".concat(this.currentSide, "\u65B9\u4E0B\u68CB\uFF0C\u8BF7\u7B49\u5F85\uFF01") });
            }
            var reverseSide = side === "RED" ? "BLACK" : "RED";
            var formatPoint = function (p) { return ({ x: Math.abs(p.x - _this.getGridDiff(side, "x")), y: Math.abs(p.y - _this.getGridDiff(reverseSide, "y")) }); };
            var posPeice = findPiece(this.livePieceList, formatPoint(piecePoint));
            if (!posPeice || posPeice.side !== this.currentSide) {
                this.logEvents.forEach(function (f) { return f("未找到棋子"); });
                return Promise.resolve({ flag: false, message: "未找到棋子" });
            }
            posPeice.isChoose = true;
            this.choosePiece = posPeice;
            return this.pieceMoveAsync(formatPoint(movePoint));
        }
    });
    /**
     * 根据移动方的描述文字来进行移动棋子
     * @param str 文字
     * @param side 移动方
     * @returns 移动结果
     */
    Object.defineProperty(Game.prototype, "moveStr", {
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
            return this.pieceMove(res.mp);
        }
    });
    /**
     * 根据移动方的描述文字来进行移动棋子
     * @param str 文字
     * @param side 移动方
     * @returns 移动结果
     */
    Object.defineProperty(Game.prototype, "moveStrAsync", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (str, side) {
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
            var posPeice = findPiece(this.livePieceList, res.mp);
            if (posPeice && posPeice.side === this.currentSide) {
                this.logEvents.forEach(function (f) { return f("移动的位置有己方棋子"); });
                return Promise.resolve({ flag: false, message: "移动的位置有己方棋子" });
            }
            this.choosePiece = res.choose;
            this.choosePiece.isChoose = true;
            return this.pieceMoveAsync(res.mp);
        }
    });
    /**
     * 初始化选择玩家方
     * @param side 玩家方
     */
    Object.defineProperty(Game.prototype, "gameStart", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (side) {
            this.init();
            this.setGridDiff(side);
            this.gameState = "START";
            this.initPiece();
        }
    });
    /**
    * 清除移动完选中的棋子
    */
    Object.defineProperty(Game.prototype, "clearMoveChoosePeiece", {
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
    Object.defineProperty(Game.prototype, "changeSide", {
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
    Object.defineProperty(Game.prototype, "changePlaySide", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (side) {
            this.setGridDiff(side);
            this.redraw();
        }
    });
    /**
     * 游戏是否结束
     */
    Object.defineProperty(Game.prototype, "gameOver", {
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
    Object.defineProperty(Game.prototype, "checkGeneralInTrouble", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (side, pos, cp, pl) {
            var enemySide = side === "BLACK" ? "RED" : "BLACK";
            var list;
            if ("move" in cp) {
                var pieceInfo = __assign(__assign({}, pos), { x: cp.move.x, y: cp.move.y });
                var piece = chessOfPeiceMap[pieceInfo.name](pieceInfo);
                list = pl.filter(function (i) { return !(i.x === pos.x && i.y === pos.y); });
                list.push(piece);
            }
            else {
                var pieceInfo = __assign(__assign({}, pos), { x: cp.eat.x, y: cp.eat.y });
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
    Object.defineProperty(Game.prototype, "checkGeneralsFaceToFaceInTrouble", {
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
    Object.defineProperty(Game.prototype, "checkEnemySideInTroubleHasSolution", {
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
     * 棋子运动前检查游戏状态是否可以运动
     * @returns 是否可以运动
     */
    Object.defineProperty(Game.prototype, "checkGameState", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            // 游戏开始
            if (this.gameState === "INIT") {
                this.logEvents.forEach(function (f) { return f("请选择红黑方"); });
                return false;
            }
            // 游戏结束
            if (this.gameState === "OVER") {
                this.logEvents.forEach(function (f) { return f("棋盘结束 等待重开！"); });
                return false;
            }
            // 正在移动
            if (this.gameState === "MOVE") {
                this.logEvents.forEach(function (f) { return f("棋子正在移动，无法做任何操作"); });
                return false;
            }
            return true;
        }
    });
    /**
     * 监听棋盘点击
     */
    Object.defineProperty(Game.prototype, "listenClick", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (e) {
            var x = e.offsetX, y = e.offsetY;
            if (!this.checkGameState()) {
                return;
            }
            var clickPoint = this.getGridPosition({ x: x, y: y });
            if (!clickPoint) {
                return;
            }
            this.pieceMove(clickPoint);
        }
    });
    /**
    * 监听棋盘点击
    */
    Object.defineProperty(Game.prototype, "listenClickAsync", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (e) {
            var x = e.offsetX, y = e.offsetY;
            if (!this.checkGameState()) {
                return;
            }
            var clickPoint = this.getGridPosition({ x: x, y: y });
            if (!clickPoint) {
                return;
            }
            this.pieceMoveAsync(clickPoint);
        }
    });
    /**
     * 象棋事件监听
     * @param e 监听事件
     * @param fn 监听函数
     */
    Object.defineProperty(Game.prototype, "on", {
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
    Object.defineProperty(Game.prototype, "removeEvent", {
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
            }
            else {
                throw new Error("监听函数值应该为 function 类型");
            }
        }
    });
    return Game;
}());

export { MovePoint, Point, chessOfPeiceMap, Game as default, peiceSideMap };
