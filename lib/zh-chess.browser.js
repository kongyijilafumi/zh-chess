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
     * ??????Map?????? ?????? ?????? ??????????????????
     * @example peiceSideMap["RED"] // ?????? ??????
     * @example peiceSideMap["BLACK"] // ?????? ??????
     */
    var peiceSideMap = {
        "RED": "??????",
        "BLACK": "??????"
    };
    /**
     * ?????????
     */
    var Point = /** @class */ (function () {
        function Point(x, y) {
            /**
             * ??????x
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
         * ????????????????????????
         * @returns ???????????????`(1,1)`
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
     * ????????????????????????
     */
    var MovePoint = /** @class */ (function (_super) {
        __extends(MovePoint, _super);
        function MovePoint(x, y, p) {
            var _this = _super.call(this, x, y) || this;
            /**
             * ?????????(??????)
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
         * ????????????????????????
         * @returns ???????????????`(1,1)` ?????? `(1,1)<?????????(2,2)>`
         */
        Object.defineProperty(MovePoint.prototype, "toString", {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function () {
                var hasDisPoint = !(this.disPoint.x === 10 && this.disPoint.y === 10);
                return "(".concat(this.x, ",").concat(this.y, ")").concat(hasDisPoint ? '<?????????' + this.disPoint + '>' : '');
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
         * ??????????????????????????????????????????
         * @returns ????????????`[RED???]:???(1,1)`
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
         * ????????????????????????????????????????????????????????????????????????
         * @param list ???????????????
         * @param pl ????????????
         * @returns ???????????????????????????????????????
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
         * ?????????????????????????????????
         * @returns ?????? name side x y ??????
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
         * ?????????????????????
         * @param p ?????????
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
                // ????????????
                if (this.isChoose) {
                    r = r / 0.98;
                    ty = this.side === "RED" ? -.3 * radius : .3 * radius;
                    ty = gridDiffY > 0 ? ty * -1 : ty;
                }
                // ????????????
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
                // ????????????
                ctx.strokeStyle = borderColor;
                drawBoder(x, y + ty, r, 0, 2 * Math.PI);
                drawBoder(x, y + ty, r - 3, 0, 2 * Math.PI);
                // ???
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = textColor;
                ctx.font = radius + "px yahei";
                ctx.fillText(this.name, x, y + ty);
            }
        });
        /**
         * ???????????????????????? ???????????????????????????
         * @param _pl ????????????
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
         * ???????????????????????????
         * @param ctx canvas??????
         * @param pl ??????????????????
         * @param startX x
         * @param startY y
         * @param gridWidth ??????????????????
         * @param gridHeight ??????????????????
         * @param gridDiffX ??????x?????????
         * @param gridDiffY ??????y?????????
         * @param radius ????????????
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
     * ????????????
     */
    var RookPiece = /** @class */ (function (_super) {
        __extends(RookPiece, _super);
        function RookPiece() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * ????????????????????????????????????????????????
         * @param p ????????????????????????
         * @param pieceList ????????????
         * @returns ?????????????????????????????????
         */
        Object.defineProperty(RookPiece.prototype, "getMoveObstaclePieceList", {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function (p, pieceList) {
                var _this = this;
                // x ?????? y ???
                var diffKey = this.x === p.x ? "y" : "x";
                var key = diffKey === "x" ? "y" : "x";
                // ????????????
                var diff = this[diffKey] - p[diffKey];
                var min = diff > 0 ? p[diffKey] : this[diffKey];
                var max = diff < 0 ? p[diffKey] : this[diffKey];
                // ?????????????????????
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
         * ?????????????????????????????????????????????????????????????????????????????????????????????????????????
         * @param p ????????? ??? ?????????
         * @param pieceList ????????????
         * @returns ??????????????????
         */
        Object.defineProperty(RookPiece.prototype, "move", {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function (p, pieceList) {
                if (p.x < 0 || p.x > 8 || p.y < 0 || p.y > 9) {
                    return { flag: false, message: "???????????????????????????" };
                }
                // ????????? x,y ????????????
                if (this.y === p.y || this.x === p.x) {
                    var list = this.getMoveObstaclePieceList(p, pieceList);
                    if (list.length > 0) {
                        return { flag: false, message: "?????????????????????????????????" + list.join("---") };
                    }
                    return { flag: true };
                }
                // console.log("????????????");
                return { flag: false, message: "???????????????????????????" };
            }
        });
        /**
         * ?????????????????????????????????????????????????????????????????????
         * @param pl ????????????
         * @returns ?????????????????????
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
     * ????????????
     */
    var HorsePiece = /** @class */ (function (_super) {
        __extends(HorsePiece, _super);
        function HorsePiece() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * ?????????????????????????????????????????????????????????????????????
         * @param pl ????????????
         * @returns ?????????????????????
         */
        Object.defineProperty(HorsePiece.prototype, "getMovePoints", {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function (pl) {
                var mps = [];
                for (var index = 0; index < 2; index++) {
                    // ???
                    var lx = this.x - 2;
                    var ly = index * 2 + (this.y - 1);
                    mps.push(new MovePoint(lx, ly, { x: this.x - 1, y: this.y }));
                    // ???
                    var rx = this.x + 2;
                    var ry = ly;
                    mps.push(new MovePoint(rx, ry, { x: this.x + 1, y: this.y }));
                    // ???
                    var tx = index * 2 + (this.x - 1);
                    var ty = this.y - 2;
                    mps.push(new MovePoint(tx, ty, { x: this.x, y: this.y - 1 }));
                    // ???
                    var bx = tx;
                    var by = this.y + 2;
                    mps.push(new MovePoint(bx, by, { x: this.x, y: this.y + 1 }));
                }
                return this.filterMovePoints(mps, pl);
            }
        });
        /**
         * ????????????????????????????????????????????????????????????????????????
         * @param list ???????????????
         * @param pl ????????????
         * @returns ???????????????????????????????????????
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
         * ?????????????????????????????????????????????????????????????????????????????????????????????????????????
         * @param p ????????? ??? ?????????
         * @param pieceList ????????????
         * @returns ??????????????????
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
     * ????????????
     */
    var ElephantPiece = /** @class */ (function (_super) {
        __extends(ElephantPiece, _super);
        function ElephantPiece() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
        * ?????????????????????????????????????????????????????????????????????
        * @param pl ????????????
        * @returns ?????????????????????
        */
        Object.defineProperty(ElephantPiece.prototype, "getMovePoints", {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function (pl) {
                var mps = [];
                for (var index = 0; index < 2; index++) {
                    // ???
                    var tx = this.x - 2 + index * 4;
                    var ty = this.y - 2;
                    var tdx = this.x - 1 + index * 2;
                    var tdy = this.y - 1;
                    mps.push(new MovePoint(tx, ty, { x: tdx, y: tdy }));
                    // ???
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
          * ????????????????????????????????????????????????????????????????????????
          * @param list ???????????????
          * @param pl ????????????
          * @returns ???????????????????????????????????????
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
     * ????????????
     */
    var KnightPiece = /** @class */ (function (_super) {
        __extends(KnightPiece, _super);
        function KnightPiece() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
          * ?????????????????????????????????????????????????????????????????????
          * @param pl ????????????
          * @returns ?????????????????????
          */
        Object.defineProperty(KnightPiece.prototype, "getMovePoints", {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function (pl) {
                var mps = [];
                for (var index = 0; index < 2; index++) {
                    // ???
                    var tx = this.x - 1 + index * 2;
                    var ty = this.y - 1;
                    mps.push(new MovePoint(tx, ty, notExistPoint));
                    //???
                    var bx = this.x - 1 + index * 2;
                    var by = this.y + 1;
                    mps.push(new MovePoint(bx, by, notExistPoint));
                }
                return this.filterMovePoints(mps, pl);
            }
        });
        /**
          * ????????????????????????????????????????????????????????????????????????
          * @param list ???????????????
          * @param pl ????????????
          * @returns ???????????????????????????????????????
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
     * ???????????????
     */
    var GeneralPiece = /** @class */ (function (_super) {
        __extends(GeneralPiece, _super);
        function GeneralPiece() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
          * ?????????????????????????????????????????????????????????????????????
          * @param pl ????????????
          * @returns ?????????????????????
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
     * ????????????
     */
    var CannonPiece = /** @class */ (function (_super) {
        __extends(CannonPiece, _super);
        function CannonPiece() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * ?????????????????????????????????????????????????????????????????????????????????????????????????????????
         * @param p ????????? ??? ?????????
         * @param pieceList ????????????
         * @returns ??????????????????
         */
        Object.defineProperty(CannonPiece.prototype, "move", {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function (p, pieceList) {
                if (p.x < 0 || p.x > 8 || p.y < 0 || p.y > 9) {
                    return { flag: false, message: "???????????????????????????" };
                }
                // ????????? x, y ????????????
                if (this.y === p.y || this.x === p.x) {
                    var list = this.getMoveObstaclePieceList(p, pieceList);
                    // console.log(list);
                    // ?????? ????????????1???
                    if (list.length > 1) {
                        return { flag: false, message: "?????????????????????????????????" + list.join("---") };
                    }
                    // ????????? ??? ???????????? ??????????????????
                    if (list.length === 1 && (list[0].x === p.x && list[0].y === p.y)) {
                        return { flag: false, message: "????????????????????????(????????????)???????????????" };
                    }
                    if (list.length === 1) {
                        var hasPeice_1 = pieceList.find(function (i) { return i.x === p.x && i.y === p.y; });
                        if (hasPeice_1) {
                            return { flag: true };
                        }
                        return { flag: false, message: "???????????????????????????????????????" };
                    }
                    // ?????????  ??? ???????????????????????????
                    var hasPeice = pieceList.find(function (i) { return i.x === p.x && i.y === p.y; });
                    if (list.length === 0 && hasPeice) {
                        return { flag: false, message: "????????????????????????(????????????)???????????????" };
                    }
                    // console.log(`${this}??????????????????${p}`);
                    return { flag: true };
                }
                return { flag: false, message: "???????????????????????????" };
            }
        });
        return CannonPiece;
    }(RookPiece));
    /**
     * ????????????
     */
    var SoldierPiece = /** @class */ (function (_super) {
        __extends(SoldierPiece, _super);
        function SoldierPiece() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
          * ?????????????????????????????????????????????????????????????????????
          * @param pl ????????????
          * @returns ?????????????????????
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
     * ????????????map???
     * @example chessOfPeiceMap["???"]({ ... }:PieceInfo) // ???????????????????????? RookPiece
     * @example chessOfPeiceMap["???"]({ ... }:PieceInfo) // ???????????????????????? HorsePiece
     * @example chessOfPeiceMap["???"]({ ... }:PieceInfo) // ???????????????????????? CannonPiece
     * @example chessOfPeiceMap["???"]({ ... }:PieceInfo) // ???????????????????????? ElephantPiece
     * @example chessOfPeiceMap["???"]({ ... }:PieceInfo) // ???????????????????????? KnightPiece
     * @example chessOfPeiceMap["???"]({ ... }:PieceInfo) // ???????????????????????? GeneralPiece
     * @example chessOfPeiceMap["???"]({ ... }:PieceInfo) // ???????????????????????? SoldierPiece
     */
    var chessOfPeiceMap = {
        "???": function (info) { return new KnightPiece(info); },
        "???": function (info) { return new SoldierPiece(info); },
        "???": function (info) { return new SoldierPiece(info); },
        "???": function (info) { return new KnightPiece(info); },
        "???": function (info) { return new GeneralPiece(info); },
        "???": function (info) { return new GeneralPiece(info); },
        "???": function (info) { return new CannonPiece(info); },
        "???": function (info) { return new ElephantPiece(info); },
        "???": function (info) { return new CannonPiece(info); },
        "???": function (info) { return new ElephantPiece(info); },
        "???": function (info) { return new RookPiece(info); },
        "???": function (info) { return new RookPiece(info); },
        "???": function (info) { return new HorsePiece(info); },
        "???": function (info) { return new HorsePiece(info); },
    };

    /**
    * ???????????????????????????????????? ???????????????????????????
    * @param pl ????????????
    * @param p ???????????????
    * @returns ???????????????????????????????????????
    */
    var numPos = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    var zhnumPos = ["???", "???", "???", "???", "???", "???", "???", "???", "???"];
    var strPos = ["???", "???", "???"];
    var moveStyles = ["???", "???", "???"], moveStyleInput = "(".concat(moveStyles.join("|"), ")");
    var numMergePos = numPos.concat(zhnumPos);
    var numInput = "(".concat(numMergePos.join("|"), ")");
    var pieceNameInput = "(".concat(Object.keys(chessOfPeiceMap).join("|"), ")");
    // ????????????
    var parse_reg_1 = new RegExp("(".concat(strPos.concat(numMergePos).join("|"), ")").concat(pieceNameInput).concat(moveStyleInput).concat(numInput, "$"));
    // ???9???1
    var parse_reg_2 = new RegExp("".concat(pieceNameInput).concat(numInput).concat(moveStyleInput).concat(numInput, "$"));
    // ???6???1
    var parse_reg_3 = new RegExp("(".concat(strPos.join("|"), ")").concat(numInput).concat(moveStyleInput).concat(numInput, "$"));
    var parseStrToPoint = function (str, side, pl) {
        var strRes;
        var currentSidePieceList = pl.filter(function (p) { return p.side === side; });
        var isRedSide = side === "RED";
        var pieceDiffX = side === "BLACK" ? 8 : 0;
        var pieceDiffY = side === "BLACK" ? 9 : 0;
        var sideOpposite = isRedSide ? 1 : -1;
        // ???6???1 ?????????????????????????????????
        var strRes1;
        if (parse_reg_3.test(str) && (strRes1 = parse_reg_3.exec(str))) {
            var pieceXPos_1 = Math.abs((formatChooseNum(strRes1[2]) - 1) - pieceDiffX);
            var moveStyle = strRes1[3];
            var moveStep = formatChooseNum(strRes1[4]);
            var pieceName_1 = getSidePieceName("???", side);
            if (moveStyle === "???") {
                moveStep -= 1;
            }
            // ?????? ??????????????? 
            var findPL = currentSidePieceList.filter(function (p) { return p.x === pieceXPos_1 && p.name === pieceName_1; });
            // ???????????? 2 ????????? ???????????????
            if (findPL.length < 2) {
                return false;
            }
            findPL.sort(function (a, b) { return isRedSide ? a.y - b.y : b.y - a.y; });
            var index = findPL.length === 3 ? formatChooseNum(strRes1[1]) - 1 : (strRes1[1] === "???" ? 0 : 1);
            // ???????????????
            var choose = findPL[index];
            var cy = Math.abs(choose.y - pieceDiffY);
            // ??????
            var y = isRedSide ? cy - moveStep * sideOpposite : cy + moveStep * sideOpposite;
            if (moveStyle === moveStyles[0]) {
                var mp = new Point(choose.x, y);
                return { mp: mp, choose: choose };
            }
            // ???
            if (moveStyle === moveStyles[1]) {
                var mp = new Point(Math.abs(moveStep - pieceDiffX), cy);
                return { mp: mp, choose: choose };
            }
        }
        //  ????????????  or  ?????????1
        if (parse_reg_1.test(str) && (strRes = parse_reg_1.exec(str))) {
            parse_reg_1.lastIndex = 0;
            // ?????? ????????????
            var pieceName_2 = getSidePieceName(strRes[2], side);
            var moveStyle = strRes[3], moveStep = formatChooseNum(strRes[4]);
            if (moveStyle === "???") {
                moveStep -= 1;
            }
            // ?????? ??????????????? 
            var findPL = currentSidePieceList.filter(function (p) { return p.name === pieceName_2; });
            // ???????????? 2 ????????? ???????????????
            if (findPL.length < 2) {
                return false;
            }
            // ?????? ?????????????????? x??? ?????????
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
                    // ??????????????? ???????????? ????????? ?????????
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
            // ??????????????? ????????????????????????????????????
            if (firstStr === strPos[1] && maxX !== 3) {
                return false;
            }
            // ????????????????????????????????? ????????????
            if (maxX >= 3) {
                linePL.sort(function (a, b) { return isRedSide ? a.y - b.y : b.y - a.y; });
                // ???????????????
                var choose = linePL[formatChooseNum(firstStr) - 1];
                var cy = Math.abs(choose.y - pieceDiffY);
                // ??????
                var y = isRedSide ? cy - moveStep * sideOpposite : cy + moveStep * sideOpposite;
                if (moveStyle === moveStyles[0]) {
                    var mp = new Point(choose.x, y);
                    return { mp: mp, choose: choose };
                }
                // ???
                if (moveStyle === moveStyles[1]) {
                    var mp = new Point(Math.abs(moveStep - pieceDiffX), cy);
                    return { mp: mp, choose: choose };
                }
            }
            // ?????????????????????????????????????????????
            if (maxX === 2 && strPos.filter(function (i) { return i !== "???"; }).includes(firstStr)) {
                var index = firstStr === strPos[0] ? 0 : 1;
                var choose = linePL[index];
                var cy = choose.y;
                var cx = choose.x;
                // x ?????????
                var diffX = cx - moveStep;
                // ?????? ?????? x ?????? y?????????
                if (moveStyle === moveStyles[0] || moveStyle === moveStyles[2]) {
                    // ????????????
                    var absDiffX = Math.abs(diffX);
                    var yOpposite = moveStyle === moveStyles[2] ? -1 : 1;
                    // ???
                    if (pieceName_2 === "???" || pieceName_2 === "???") {
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
                    // ??? ???
                    var elePieceList = ["???", "???"], kinPieceList = ["???", "???"], isEle = elePieceList.includes(pieceName_2);
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
                    // ??? ??? ??? ???
                    var y = cy - (moveStep * sideOpposite * yOpposite);
                    return { choose: choose, mp: new Point(cx, y) };
                }
                // ???
                if (moveStyle === moveStyles[1]) {
                    // ??? ??? ??? ???
                    return { choose: choose, mp: new Point(Math.abs(moveStep - pieceDiffX), cy) };
                }
            }
            return false;
        }
        // ???9???1
        var execRes;
        if (parse_reg_2.test(str) && (execRes = parse_reg_2.exec(str))) {
            var pieceName_3 = getSidePieceName(execRes[1], side);
            var pieceXPos = formatChooseNum(execRes[2]) - 1;
            var moveStyle = execRes[3];
            var moveStep = formatChooseNum(execRes[4]);
            if (moveStyle === "???") {
                moveStep -= 1;
            }
            var px_1 = Math.abs(pieceXPos - pieceDiffX);
            var choose = currentSidePieceList.filter(function (p) { return p.x === px_1 && p.name === pieceName_3; });
            // ???????????????
            if (!choose.length) {
                return false;
            }
            // ??????????????????????????????????????????
            if (choose.length >= 2) {
                return false;
            }
            var cy = choose[0].y;
            var cx = choose[0].x;
            var diffX = Math.abs(cx - pieceDiffX) - moveStep;
            var absDiffX = Math.abs(diffX);
            // ?????? ?????? x ?????? y???????????????
            if (moveStyle === moveStyles[0] || moveStyle === moveStyles[2]) {
                // ????????????
                var yOpposite = moveStyle === moveStyles[2] ? -1 : 1;
                // ???
                if (pieceName_3 === "???" || pieceName_3 === "???") {
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
                // ??? ???
                var elePieceList = ["???", "???"], kinPieceList = ["???", "???"], isEle = elePieceList.includes(pieceName_3);
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
                // ??? ??? ??? ???
                var y = cy - (moveStep * sideOpposite * yOpposite);
                return { choose: choose[0], mp: new Point(cx, y) };
            }
            // ???
            if (moveStyle === moveStyles[1]) {
                // ??? ??? ??? ???
                return { choose: choose[0], mp: new Point(Math.abs(moveStep - pieceDiffX), cy) };
            }
        }
        return false;
    };
    function getSidePieceName(name, side) {
        switch (name) {
            case "???":
            case "???":
                return side === "BLACK" ? '???' : "???";
            case "???":
            case "???":
                return side === "BLACK" ? "???" : "???";
            case "???":
            case "???":
                return side === "BLACK" ? "???" : "???";
            case "???":
            case "???":
                return side === "BLACK" ? "???" : "???";
            case "???":
            case "???":
                return side === "BLACK" ? "???" : "???";
            case "???":
            case "???":
                return side === "BLACK" ? "???" : "???";
            case "???":
            case "???":
                return side === "BLACK" ? "???" : "???";
            default:
                return null;
        }
    }
    function formatChooseNum(str) {
        switch (str) {
            case "1":
            case "???":
            case "???":
                return 1;
            case "2":
            case "???":
            case "???":
                return 2;
            case "3":
            case "???":
            case "???":
                return 3;
            case "4":
            case "???":
                return 4;
            case "5":
            case "???":
                return 5;
            case "6":
            case "???":
                return 6;
            case "7":
            case "???":
                return 7;
            case "8":
            case "???":
                return 8;
            case "9":
            case "???":
                return 9;
            default:
                return 10;
        }
    }
    function parse_PEN_PeiceName(penPeiceNameCode) {
        switch (penPeiceNameCode) {
            case 'K':
                return "???";
            case 'k':
                return '???';
            case 'A':
                return '???';
            case 'a':
                return '???';
            case 'B':
                return '???';
            case 'b':
                return '???';
            case 'N':
                return '???';
            case 'n':
                return '???';
            case 'R':
                return '???';
            case 'r':
                return '???';
            case 'C':
                return '???';
            case "c":
                return '???';
            case "P":
                return '???';
            case 'p':
                return '???';
            default:
                return null;
        }
    }
    function get_PEN_PieceName(str) {
        switch (str) {
            case '???':
            case '???':
                return 'k';
            case '???':
            case '???':
                return 'a';
            case '???':
            case '???':
                return 'b';
            case '???':
            case '???':
                return 'n';
            case '???':
            case '???':
                return 'r';
            case "???":
            case '???':
                return 'c';
            case '???':
            case "???":
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
            throw new Error("????????? PEN ????????????????????????!");
        }
        var peiceLayout = matchRes[1];
        var side = parse_PEN_SideName(matchRes[2]);
        var notEatRound = matchRes[4];
        var round = matchRes[5];
        var peiceCodeList = peiceLayout.split("/");
        // ???????????? ???10?????????
        if (peiceCodeList.length !== 10) {
            throw new Error("????????? PEN ????????????????????????!");
        }
        var pl = [];
        for (var y = 0; y < peiceCodeList.length; y++) {
            var pieceCodeStr = peiceCodeList[y];
            var px = 9;
            var strLen = pieceCodeStr.length;
            if (strLen > 9) {
                throw new Error("????????? PEN ????????????????????????!");
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
                //  ??????
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
        // ?????????
        var moveList = [];
        oldList.forEach(function (item) {
            var findindex = newList.findIndex(function (p) {
                return p.x === item.x &&
                    item.y === p.y &&
                    item.side === p.side &&
                    p.name === item.name;
            });
            // ?????? ?????? ????????????
            if (findindex !== -1) {
                newList.splice(findindex, 1);
                return;
            }
            // ??????????????? ?????????
            var peice = chessOfPeiceMap[item.name](item);
            var mps = peice.getMovePoints(plList);
            // ?????? ????????????
            if (mps.length) {
                var hasMp = mps.find(function (mp) {
                    // ???????????????????????? ???????????????????????? ????????????????????????
                    var findPointIndex = newList.findIndex(function (_item) {
                        return _item.x === mp.x &&
                            _item.y === mp.y &&
                            _item.side === item.side &&
                            _item.name === item.name;
                    });
                    var isFind = findPointIndex !== -1;
                    // ??????????????? ?????? ?????????
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
                // ???????????? ???????????????????????????????????? ?????????????????????
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
     * ????????????????????????????????????????????????
     * @param lt ?????????
     * @param width ???????????????
     * @param height ???????????????
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
            var ctx = _a.ctx, _b = _a.gameWidth, gameWidth = _b === void 0 ? 800 : _b, _c = _a.gameHeight, gameHeight = _c === void 0 ? 800 : _c, _d = _a.gamePadding, gamePadding = _d === void 0 ? 20 : _d, _e = _a.scaleRatio, scaleRatio = _e === void 0 ? 1 : _e, _f = _a.duration, duration = _f === void 0 ? 200 : _f, _g = _a.redPeiceBackground, redPeiceBackground = _g === void 0 ? "#feeca0" : _g, _h = _a.blackPeiceBackground, blackPeiceBackground = _h === void 0 ? "#fdec9e" : _h, _j = _a.checkerboardBackground, checkerboardBackground = _j === void 0 ? "#faebd7" : _j, _k = _a.movePointColor, movePointColor = _k === void 0 ? "#25dd2a" : _k, _l = _a.drawMovePoint, drawMovePoint = _l === void 0 ? true : _l;
            var _m;
            /**
             * ???????????????
             */
            Object.defineProperty(this, "currentSide", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ??????????????????????????????
             */
            Object.defineProperty(this, "livePieceList", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ?????????????????????
             */
            Object.defineProperty(this, "choosePiece", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ?????????????????? x ???
             */
            Object.defineProperty(this, "startX", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ?????????????????? x ???
             */
            Object.defineProperty(this, "endX", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ?????????????????? y ???
             */
            Object.defineProperty(this, "startY", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ?????????????????? y ???
             */
            Object.defineProperty(this, "endY", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ??????????????????
             */
            Object.defineProperty(this, "gridWidth", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ??????????????????
             */
            Object.defineProperty(this, "gridHeight", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ????????????
             */
            Object.defineProperty(this, "radius", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ??????????????????
             */
            Object.defineProperty(this, "width", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ??????????????????
             */
            Object.defineProperty(this, "height", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ?????? ??? ?????? ?????????????????????
             */
            Object.defineProperty(this, "ctx", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ?????????????????????????????????
             */
            Object.defineProperty(this, "gridPostionList", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ???????????????????????? ????????????
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
             * ?????? x??? ??????????????????
             */
            Object.defineProperty(this, "gridDiffX", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ?????? y??? ??????????????????
             */
            Object.defineProperty(this, "gridDiffY", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ??????????????????
             */
            Object.defineProperty(this, "gameState", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ??????????????????????????????
             */
            Object.defineProperty(this, "moveEvents", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ????????????????????????????????????
             */
            Object.defineProperty(this, "moveFailEvents", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ??????????????????????????????
             */
            Object.defineProperty(this, "logEvents", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ??????????????????????????????
             */
            Object.defineProperty(this, "overEvents", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ??????????????????????????????
             */
            Object.defineProperty(this, "errorEvents", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ????????????????????????
             */
            Object.defineProperty(this, "redPeiceBackground", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ????????????????????????
             */
            Object.defineProperty(this, "blackPeiceBackground", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ??????????????????
             */
            Object.defineProperty(this, "checkerboardBackground", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ??????
             */
            Object.defineProperty(this, "winner", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: null
            });
            /**
             * ???????????????
             */
            Object.defineProperty(this, "gameSide", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: null
            });
            /**
             * ????????????
             */
            Object.defineProperty(this, "animate", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ??????????????????
             */
            Object.defineProperty(this, "cancelAnimate", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * ??????????????????
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
            // ?????? ?????? ??????????????????????????????
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
         * ?????????????????? ?????? ????????????
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
         * ??????????????????????????????????????????
         * @param side ??????
         * @param key ?????????
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
         * ??????????????? ?????? x???y?????????
         * @param side ?????????
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
         * ???????????????????????????
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
         * ????????????????????????????????????x,y?????????
         * @param p ???????????? x,y ??????
         * @returns ???????????????x???y?????????
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
         * ??????????????????
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
         * ?????????????????????
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
         * ????????????????????? ?????????????????????????????????????????????????????????????????????promise?????????????????? ???????????????????????????
         * @param pos ?????????
         * @param mov ?????????
         * @param side ??????????????????
         * @param refreshCtx ?????????????????????????????????
         * @param moveCallback ?????????????????????????????????
         *
         * @example
         * const game = new ZhChess({...any})
         * game.updateAsync(pos , mov, side, ()=> game.draw(ctx)) // ??????????????????????????????
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
         * ????????????????????? ?????????????????????????????????????????????
         * @param pos ?????????
         * @param mov ?????????
         * @param side ??????????????????
         * @param post ???????????????????????????????????????
         * @returns
         *
         * ?????? `post` ??? `false`??? ???????????????????????? `move` ????????? `true` ??????`true`???????????????????????????`cb`??????????????? `cb()` ????????????????????????
         *
         * ?????? `post` ??? `true`???????????????????????????????????? ??????????????? ???????????????????????????
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
                    return { flag: false, message: "?????????????????????" };
                }
                var posPeice = findPiece(this.livePieceList, pos);
                if (!posPeice) {
                    return { flag: false, message: "???????????????" };
                }
                // ???????????????????????????
                if (this.currentSide !== posPeice.side) {
                    return { flag: false, message: "????????????????????????" };
                }
                this.clearMoveChoosePeiece();
                posPeice.isChoose = true;
                this.choosePiece = posPeice;
                // ?????????????????????????????? ????????? ????????????
                if (!mov) {
                    this.logEvents.forEach(function (f) { return f(side + "?????? ?????? " + posPeice); });
                    return { flag: true, move: false };
                }
                var movPeice = findPiece(this.livePieceList, mov);
                var moveFlag = this.choosePiece.move(mov, this.livePieceList);
                var moveCheck = function (cp) {
                    var isMove = "move" in cp;
                    var hasTrouble = _this.checkGeneralInTrouble(side, posPeice, cp, _this.livePieceList);
                    if (hasTrouble) {
                        return { flag: false, message: "??????????????????" };
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
                // ?????????????????????
                if (!movPeice) { // ?????????????????? ?????? ?????????????????????????????????
                    if (moveFlag.flag) {
                        var cp = { move: mov };
                        return moveCheck(cp);
                    }
                    return moveFlag;
                }
                // ??????????????????????????????
                if (movPeice.side === side) {
                    if (pos.x === mov.x && pos.y === mov.y) { // ?????????????????????????????? ????????????
                        this.clearMoveChoosePeiece();
                        this.logEvents.forEach(function (f) { return f(side + "?????? ???????????? " + movPeice); });
                        return { flag: true, move: false };
                    }
                    { // ??????????????????
                        this.choosePiece.isChoose = false;
                        this.choosePiece = movPeice;
                        this.choosePiece.isChoose = true;
                        this.logEvents.forEach(function (f) { return f("".concat(_this.currentSide, "\u65B9\uFF1A\u5207\u6362 \u9009\u4E2D\u68CB\u5B50 \u7531").concat(_this.choosePiece, " --> ").concat(movPeice)); });
                        return { flag: true, move: false };
                    }
                }
                // ????????????????????????????????? ???????????????????????????????????????
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
         * ?????????????????????????????? ???????????? ???????????? ????????????
         * @param ctx ??????
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
                        this.choosePiece.drawMovePoints(ctx, this.livePieceList, startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY, radius, this.movePointColor);
                    }
                }
            }
        });
        /**
         * ?????????
         */
        Object.defineProperty(ZhChess.prototype, "drawChessLine", {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function (ctx) {
                var _a = this, startX = _a.startX, startY = _a.startY, endX = _a.endX, endY = _a.endY, gridWidth = _a.gridWidth, gridHeight = _a.gridHeight, scaleRatio = _a.scaleRatio;
                // ?????????
                ctx.fillStyle = this.checkerboardBackground;
                ctx.fillRect(0, 0, this.width, this.width);
                ctx.strokeStyle = "#000";
                // ??????
                for (var index = 0; index < 10; index++) {
                    ctx.beginPath();
                    var y = startY + gridHeight * index;
                    ctx.moveTo(startX, y);
                    ctx.lineTo(endX, y);
                    ctx.closePath();
                    ctx.stroke();
                }
                // ??????
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
                // ???????????????
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
                // ?????? ?????? ????????? ?????????
                for (var i = 0; i < 9; i += 2) {
                    var width = gridWidth * .15;
                    var padding = gridWidth * .1;
                    for (var j = 0; j < 2; j++) {
                        var addx = j === 0 ? -padding : +padding;
                        var addy = j === 0 ? +padding : -padding;
                        var addw = j === 0 ? +width : -width;
                        for (var z = 0; z < 2; z++) {
                            // ??? ???
                            var y = z % 2 === 0 ? startY + 3 * gridHeight : startY + 6 * gridHeight;
                            // ????????????
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
                //  ?????? ??????
                ctx.textBaseline = "middle";
                ctx.textAlign = "left";
                ctx.fillStyle = "#000";
                var fontSize = gridHeight * .7;
                ctx.font = fontSize + 'px serif';
                ctx.fillText("??????", startX + gridWidth, startY + gridHeight * 4.5);
                ctx.textAlign = "right";
                ctx.translate(startX + gridWidth * 7 - fontSize * 2, startY + gridHeight * 4.5);
                ctx.rotate(Math.PI);
                ctx.fillText("??????", 0, 0);
                ctx.setTransform(scaleRatio, 0, 0, scaleRatio, 0, 0);
            }
        });
        /**
         * ???????????????????????????????????????????????????
         * @param str ??????
         * @param side ?????????
         * @returns ????????????
         */
        Object.defineProperty(ZhChess.prototype, "moveStr", {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function (str, side) {
                var _this = this;
                if (!this.checkGameState()) {
                    return { flag: false, message: "???????????????????????????????????????" };
                }
                this.logEvents.forEach(function (f) { return f("\u5F53\u524D ".concat(side, " \u8F93\u51FA\uFF1A").concat(str)); });
                if (this.currentSide !== side) {
                    this.logEvents.forEach(function (f) { return f("\u5F53\u524D\u4E3A".concat(_this.currentSide, "\u65B9\u4E0B\u68CB\uFF0C\u8BF7\u7B49\u5F85\uFF01")); });
                    return { flag: false, message: "\u5F53\u524D\u4E3A".concat(this.currentSide, "\u65B9\u4E0B\u68CB\uFF0C\u8BF7\u7B49\u5F85\uFF01") };
                }
                var res = parseStrToPoint(str, this.currentSide, this.livePieceList);
                if (!res) {
                    this.logEvents.forEach(function (f) { return f("???????????????"); });
                    return { flag: false, message: "\u672A\u627E\u5230\u68CB\u5B50" };
                }
                if (this.choosePiece) {
                    this.clearMoveChoosePeiece();
                }
                var posPeice = findPiece(this.livePieceList, res.mp);
                if (posPeice && posPeice.side === this.currentSide) {
                    this.logEvents.forEach(function (f) { return f("??????????????????????????????"); });
                    return { flag: false, message: "??????????????????????????????" };
                }
                this.choosePiece = res.choose;
                this.choosePiece.isChoose = true;
                return this.update(res.choose, res.mp, side, true);
            }
        });
        /**
         * ???????????????????????????????????????????????????
         * @param str ??????
         * @param side ?????????
         * @param refreshCtx ?????????????????????????????????
         * @returns ????????????
         */
        Object.defineProperty(ZhChess.prototype, "moveStrAsync", {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function (str, side, refreshCtx) {
                var _this = this;
                if (!this.checkGameState()) {
                    return Promise.resolve({ flag: false, message: "???????????????????????????????????????" });
                }
                this.logEvents.forEach(function (f) { return f("\u5F53\u524D ".concat(side, " \u8F93\u51FA\uFF1A").concat(str)); });
                if (this.currentSide !== side) {
                    this.logEvents.forEach(function (f) { return f("\u5F53\u524D\u4E3A".concat(_this.currentSide, "\u65B9\u4E0B\u68CB\uFF0C\u8BF7\u7B49\u5F85\uFF01")); });
                    return Promise.resolve({ flag: false, message: "\u5F53\u524D\u4E3A".concat(this.currentSide, "\u65B9\u4E0B\u68CB\uFF0C\u8BF7\u7B49\u5F85\uFF01") });
                }
                var res = parseStrToPoint(str, this.currentSide, this.livePieceList);
                if (!res) {
                    this.logEvents.forEach(function (f) { return f("???????????????"); });
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
         * ????????????????????????
         * @param side ?????????
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
                this.initPiece();
                this.gameSide = side;
            }
        });
        /**
        * ??????????????????????????????
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
         * ????????????????????????
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
         * ??????????????????
         * @param side ??????
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
         * ?????????????????????
         * @param side ?????????
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
         * ??????????????????
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
         * ??????????????????????????????????????????????????????
         * @param side ?????????
         * @param pos ????????????
         * @param cp ?????????????????????????????????
         * @param pl ??????????????????
         * @returns ????????????
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
                    //   console.log(`${item} ?????? ?????? ?????? ${sideGeneralPiece}`);
                    // }
                    return mf.flag;
                });
                return hasTrouble;
            }
        });
        /**
         * ?????????????????? ?????????????????????????????? false ????????? true ??????
         * @param pl ??????????????????????????????
         * @param side ???????????????
         * @returns ????????????
         */
        Object.defineProperty(ZhChess.prototype, "checkGeneralsFaceToFaceInTrouble", {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function (pl) {
                var points = pl.filter(function (i) { return i instanceof GeneralPiece; }).map(function (i) { return ({ x: i.x, y: i.y }); });
                var max = points[0].y > points[1].y ? points[0].y : points[1].y;
                var min = points[0].y < points[1].y ? points[0].y : points[1].y;
                // ?????????????????????
                if (points[0].x === points[1].x) {
                    var hasPeice = pl.find(function (i) { return i.y < max && i.y > min && i.x === points[0].x; });
                    // ??????????????? ???????????????????????? 
                    if (hasPeice) {
                        return false;
                    }
                    return true;
                }
                return false;
            }
        });
        /**
         * ???????????????????????????????????????
         * @param enemySide ??????
         * @param pl ??????????????????
         * @returns  ??????????????????
         */
        Object.defineProperty(ZhChess.prototype, "checkEnemySideInTroubleHasSolution", {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function (enemySide, pl) {
                var _this = this;
                return pl.filter(function (i) { return i.side === enemySide; }).some(function (item) {
                    var mps = item.getMovePoints(pl);
                    // ???????????????
                    return mps.some(function (p) {
                        var isDis = findPiece(pl, p.disPoint);
                        if (isDis) {
                            return false;
                        }
                        var hasEat = findPiece(pl, p);
                        var checkPoint = hasEat ? { eat: p } : { move: p };
                        var hasSolution = !_this.checkGeneralInTrouble(enemySide, item, checkPoint, pl);
                        // console.log(`${item} ????????? ${p}??? ${enemySide}??? ${!hasSolution ? '???' : '??????'} ?????????${hasSolution ? "???" : "???"}??????`);
                        return hasSolution;
                    });
                });
            }
        });
        /**
         * ??????????????????????????????????????? ?????????????????????
         * @param enemySide ??????
         * @returns {boolean}
         */
        Object.defineProperty(ZhChess.prototype, "checkEnemySideHasMovePoints", {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function (enemySide, pl) {
                var _this = this;
                // ??????????????????
                var currentList = pl;
                // ??????????????????
                var enemyList = currentList.filter(function (p) { return p.side === enemySide; });
                var hasPeice = enemyList.find(function (p) {
                    // ???????????????????????????????????????
                    var mps = p.getMovePoints(currentList);
                    return mps.find(function (mp) {
                        // ????????? ???????????????
                        var checkPoint = findPiece(currentList, mp) ? { eat: mp } : { move: mp };
                        var hasTrouble = _this.checkGeneralInTrouble(enemySide, p, checkPoint, currentList);
                        // ?????? ???????????????????????? ???????????????????????????
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
         * ???????????????????????????????????????????????????
         * @returns ??????????????????
         */
        Object.defineProperty(ZhChess.prototype, "checkGameState", {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function () {
                // ????????????
                var data;
                if (this.gameState === "INIT") {
                    data = { flag: false, message: "??????????????????" };
                }
                // ????????????
                else if (this.gameState === "OVER") {
                    data = { flag: false, message: "???????????? ???????????????" };
                }
                // ????????????
                else if (this.gameState === "MOVE") {
                    data = { flag: false, message: "??????????????????????????????????????????" };
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
         * ????????????????????? ?????????????????? ??????????????? ????????????
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
                    this.errorEvents.forEach(function (f) { return f(new Error("?????????????????????????????????????????????????????????")); });
                }
            }
        });
        /**
         * ??????????????????
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
                    var msg_2 = '??????????????????????????????';
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
        * ??????????????????
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
                    var msg_3 = '??????????????????????????????';
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
             * ???????????????
             */
            get: function () {
                return this.winner;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ZhChess.prototype, "currentGameSide", {
            /**
             * ???????????????
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
             * ?????????????????????????????????
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
             * ??????????????????????????????
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
         * ??????????????????
         * @param e ????????????
         * @param fn ????????????
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
                    throw new Error("???????????????????????? function ??????");
                }
            }
        });
        /**
         * ????????????????????????
         * @param e ????????????
         * @param fn ????????????
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
                    throw new Error("???????????????????????? function ??????");
                }
            }
        });
        /**
         * ??????????????????????????????
         * @param pl ????????????????????????
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
         * ??????pen?????????????????????????????????
         * @param penCode
         *
         * ???????????? ?????? ??????
         * 1. https://www.xqbase.com/protocol/cchess_fen.htm
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
    exports.initBoardPen = initBoardPen;
    exports.parse_PEN_Str = parse_PEN_Str;
    exports.peiceSideMap = peiceSideMap;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
