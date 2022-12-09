var ZhChess = (function (exports) {
    'use strict';

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
            this.x = pieceInfo.x;
            this.y = pieceInfo.y;
            this.name = pieceInfo.name;
            this.side = pieceInfo.side;
            this.isChoose = pieceInfo.isChoose || false;
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
                    y: this.y
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
                if (this.isChoose) {
                    r = r / 0.98;
                    ty = this.side === "RED" ? -.3 * radius : .3 * radius;
                    ty = gridDiffY > 0 ? ty * -1 : ty;
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
            value: function (ctx, pl, startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY, radius) {
                ctx.fillStyle = "#25dd2a";
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
                return this.filterMovePoints(mps, pl);
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
                    pl.push({ side: p_side, name: pieceName, x: 9 - (px), y: y });
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
                    console.log(isFind, item, mp);
                    // 如果找到了 说明 移动了
                    if (isFind) {
                        moveList.push({
                            point: new Point(item.x, item.y),
                            move: new Point(newList[findPointIndex].x, newList[findPointIndex].y)
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
            moveList: moveList.map(function (item) { return JSON.stringify(item); }),
            delList: delList
        };
    }

    var getPiecesList = function () {
        var piecesList = [];
        // 车 马 象 士 炮
        for (var index = 0; index < 2; index++) {
            var blackRook = new RookPiece({ x: 0 + index * 8, y: 0, name: "車", side: "BLACK", isChoose: false });
            var blackHorse = new HorsePiece({ x: 1 + index * 6, y: 0, name: "馬", side: "BLACK", isChoose: false });
            var blackElephant = new ElephantPiece({ x: 2 + index * 4, y: 0, name: "象", side: "BLACK", isChoose: false });
            var blackKnight = new KnightPiece({ x: 3 + index * 2, y: 0, name: "仕", side: "BLACK", isChoose: false });
            var blackCannon = new CannonPiece({ x: 1 + index * 6, y: 2, name: "砲", side: "BLACK", isChoose: false });
            var redRook = new RookPiece({ x: 0 + index * 8, y: 9, name: "车", side: "RED", isChoose: false });
            var redHorse = new HorsePiece({ x: 1 + index * 6, y: 9, name: "马", side: "RED", isChoose: false });
            var redElephant = new ElephantPiece({ x: 2 + index * 4, y: 9, name: "相", side: "RED", isChoose: false });
            var redKnight = new KnightPiece({ x: 3 + index * 2, y: 9, name: "士", side: "RED", isChoose: false });
            var redCannon = new CannonPiece({ x: 1 + index * 6, y: 7, name: "炮", side: "RED", isChoose: false });
            piecesList.push(blackRook, blackHorse, blackElephant, blackKnight, blackCannon, redRook, redHorse, redElephant, redKnight, redCannon);
        }
        // 兵
        for (var index = 0; index < 5; index++) {
            var blackSoldier = new SoldierPiece({ x: 2 * index, y: 3, name: "卒", side: "BLACK", isChoose: false });
            var redSoldier = new SoldierPiece({ x: 2 * index, y: 6, name: "兵", side: "RED", isChoose: false });
            piecesList.push(blackSoldier, redSoldier);
        }
        var blackGeneral = new GeneralPiece({ x: 4, y: 0, name: "将", side: "BLACK", isChoose: false });
        var redGeneral = new GeneralPiece({ x: 4, y: 9, name: "帅", side: "RED", isChoose: false });
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

    var findPiece = function (pl, p) { return pl.find(function (item) { return item.x === p.x && item.y === p.y; }); };
    var ZhChess = /** @class */ (function () {
        function ZhChess(_a) {
            var ctx = _a.ctx, _b = _a.gameWidth, gameWidth = _b === void 0 ? 800 : _b, _c = _a.gameHeight, gameHeight = _c === void 0 ? 800 : _c, _d = _a.gamePadding, gamePadding = _d === void 0 ? 20 : _d, _e = _a.scaleRatio, scaleRatio = _e === void 0 ? 1 : _e, _f = _a.duration, duration = _f === void 0 ? 200 : _f, _g = _a.redPeiceBackground, redPeiceBackground = _g === void 0 ? "#feeca0" : _g, _h = _a.blackPeiceBackground, blackPeiceBackground = _h === void 0 ? "#fdec9e" : _h, _j = _a.checkerboardBackground, checkerboardBackground = _j === void 0 ? "#faebd7" : _j, _k = _a.drawMovePoint, drawMovePoint = _k === void 0 ? true : _k;
            var _l;
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
            this.moveEvents = [];
            this.moveFailEvents = [];
            this.logEvents = [];
            this.overEvents = [];
            this.errorEvents = [];
            this.ctx = ctx;
            this.redPeiceBackground = redPeiceBackground;
            this.blackPeiceBackground = blackPeiceBackground;
            this.checkerboardBackground = checkerboardBackground;
            // 设置 缩放 来解决移动端模糊问题
            (_l = this.ctx) === null || _l === void 0 ? void 0 : _l.scale(scaleRatio, scaleRatio);
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
                this.livePieceList = getPiecesList();
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
                var raf, posPeice;
                return new Promise(function (resovle) {
                    var animateFn = function () {
                        if (Math.abs(posX - mov.x) <= Math.abs(xstep) && Math.abs(posY - mov.y) <= Math.abs(ystep)) {
                            _this.cancelAnimate.call(globalThis, raf);
                            if (posPeice) {
                                posPeice.update(pos);
                            }
                            return resovle(null);
                        }
                        var point = new Point(posX, posY);
                        posPeice = findPiece(_this.livePieceList, point);
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
                        posPeice.update(mov);
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
                var _a = this, startX = _a.startX, startY = _a.startY, gridWidth = _a.gridWidth, gridHeight = _a.gridHeight, gridDiffX = _a.gridDiffX, gridDiffY = _a.gridDiffY, radius = _a.radius;
                this.livePieceList.forEach(function (item) {
                    var textColor = item.side === "BLACK" ? "#000" : "#c1190c", bgColor = item.side === "BLACK" ? _this.blackPeiceBackground : _this.redPeiceBackground;
                    if (_this.choosePiece === item) {
                        return;
                    }
                    item.draw(ctx, startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY, radius, textColor, bgColor);
                });
                if (this.choosePiece) {
                    var textColor = this.choosePiece.side === "BLACK" ? "#000" : "#c1190c", bgColor = this.choosePiece.side === "BLACK" ? this.blackPeiceBackground : this.redPeiceBackground;
                    this.choosePiece.draw(ctx, startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY, radius, textColor, bgColor);
                    if (this.drawMovePoint && this.gameState !== "MOVE") {
                        this.choosePiece.drawMovePoints(ctx, this.livePieceList, startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY, radius);
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
         */
        Object.defineProperty(ZhChess.prototype, "setPenCodeList", {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function (penCode) {
                var data = parse_PEN_Str(penCode);
                this.livePieceList = data.list.map(function (p) { return chessOfPeiceMap[p.name](p); });
                this.currentSide = data.side;
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
    exports.parse_PEN_Str = parse_PEN_Str;
    exports.peiceSideMap = peiceSideMap;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
