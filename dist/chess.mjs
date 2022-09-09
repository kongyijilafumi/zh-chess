define((function () { 'use strict';

    class Point {
        constructor(x, y) {
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
        toString() {
            return `(${this.x},${this.y})`;
        }
    }
    class MovePoint extends Point {
        constructor(x, y, p) {
            super(x, y);
            Object.defineProperty(this, "disPoint", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            this.disPoint = new Point(p.x, p.y);
        }
        toString() {
            const hasDisPoint = !(this.disPoint.x === 10 && this.disPoint.y === 10);
            return `(${this.x},${this.y})${hasDisPoint ? '<阻碍点' + this.disPoint + '>' : ''}`;
        }
    }

    const notExistPoint = { x: 10, y: 10 };
    class Piece {
        constructor(pieceInfo) {
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
        toString() {
            return `[${this.side}方]:${this.name}(${this.x},${this.y})`;
        }
        filterMovePoints(list, pl) {
            return list.filter(i => {
                const pointHasSameSidePeice = pl.find(p => p.x === i.x && p.y === i.y && p.side === this.side);
                return i.x >= 0 && i.x <= 8 && i.y >= 0 && i.y <= 9 && !pointHasSameSidePeice;
            });
        }
    }
    // 车
    class RookPiece extends Piece {
        constructor(info) {
            super(info);
        }
        getMoveObstaclePieceList(p, pieceList) {
            // x 或者 y 轴
            const diffKey = this.x === p.x ? "y" : "x";
            const key = diffKey === "x" ? "y" : "x";
            // 移动步数
            const diff = this[diffKey] - p[diffKey];
            const min = diff > 0 ? p[diffKey] : this[diffKey];
            const max = diff < 0 ? p[diffKey] : this[diffKey];
            // 障碍物棋子列表
            const list = pieceList.filter(item => {
                const notSelf = !(this.x === item.x && this.y === item.y);
                const isOnSameLine = item[key] === p[key];
                const inRangeY = item[diffKey] > min && item[diffKey] < max;
                const isSameSide = item.side === this.side;
                const inSameRangeY = item[diffKey] >= min && item[diffKey] <= max;
                return (isOnSameLine && notSelf && inRangeY) || (isOnSameLine && notSelf && isSameSide && inSameRangeY);
            });
            return list;
        }
        move(p, pieceList) {
            if (p.x < 0 || p.x > 8 || p.y < 0 || p.y > 9) {
                return { flag: false, message: "移动位置不符合规则" };
            }
            // 如果在 x,y 轴上移动
            if (this.y === p.y || this.x === p.x) {
                const list = this.getMoveObstaclePieceList(p, pieceList);
                if (list.length > 0) {
                    return { flag: false, message: "移动距离中存在障碍物：" + list.join("---") };
                }
                return { flag: true };
            }
            // console.log("无效移动");
            return { flag: false, message: "移动位置不符合规则" };
        }
        getMovePoints(pl) {
            const xpoints = Array.from({ length: 9 }, (v, k) => new MovePoint(k, this.y, notExistPoint));
            const ypoints = Array.from({ length: 10 }, (v, k) => new MovePoint(this.x, k, notExistPoint));
            const points = xpoints.concat(ypoints).filter(i => !(this.x === i.x && this.y === i.y));
            if (!pl) {
                return points;
            }
            return points.filter(item => this.move(item, pl).flag === true);
        }
    }
    // 马
    class HorsePiece extends Piece {
        constructor(info) {
            super(info);
        }
        getMovePoints(pl) {
            const mps = [];
            for (let index = 0; index < 2; index++) {
                // 左
                const lx = this.x - 2;
                const ly = index * 2 + (this.y - 1);
                mps.push(new MovePoint(lx, ly, { x: this.x - 1, y: this.y }));
                // 右
                const rx = this.x + 2;
                const ry = ly;
                mps.push(new MovePoint(rx, ry, { x: this.x + 1, y: this.y }));
                // 上
                const tx = index * 2 + (this.x - 1);
                const ty = this.y - 2;
                mps.push(new MovePoint(tx, ty, { x: this.x, y: this.y - 1 }));
                // 下
                const bx = tx;
                const by = this.y + 2;
                mps.push(new MovePoint(bx, by, { x: this.x, y: this.y + 1 }));
            }
            return this.filterMovePoints(mps, pl);
        }
        move(p, pieceList) {
            const mps = this.getMovePoints(pieceList);
            const mp = mps.find(i => p.x === i.x && p.y === i.y);
            if (!mp) {
                return { flag: false, message: `${this}走法错误，不可以落在${p}上` };
            }
            const hasPeice = pieceList.find(i => i.x === mp.disPoint.x && i.y === mp.disPoint.y);
            if (hasPeice) {
                return { flag: false, message: `${this}走法错误，${hasPeice}卡住了${this.name}的去向` };
            }
            return { flag: true };
        }
    }
    // 象
    class ElephantPiece extends HorsePiece {
        constructor(info) {
            super(info);
        }
        getMovePoints(pl) {
            const mps = [];
            for (let index = 0; index < 2; index++) {
                // 上
                const tx = this.x - 2 + index * 4;
                const ty = this.y - 2;
                const tdx = this.x - 1 + index * 2;
                const tdy = this.y - 1;
                mps.push(new MovePoint(tx, ty, { x: tdx, y: tdy }));
                // 下
                const bx = this.x - 2 + index * 4;
                const by = this.y + 2;
                const bdx = tdx;
                const bdy = this.y + 1;
                mps.push(new MovePoint(bx, by, { x: bdx, y: bdy }));
            }
            return this.filterMovePoints(mps, pl);
        }
        filterMovePoints(list, pl) {
            return list.filter(i => {
                const pointHasSameSidePeice = pl.find(p => p.x === i.x && p.y === i.y && p.side === this.side);
                return !pointHasSameSidePeice &&
                    (i.x >= 0 && i.x <= 8) &&
                    (i.y >= 0 && i.y <= 9) &&
                    ((this.side === "RED" && i.y >= 5) ||
                        (this.side === "BLACK" && i.y <= 4));
            });
        }
    }
    // 士
    class KnightPiece extends ElephantPiece {
        constructor(info) {
            super(info);
        }
        getMovePoints(pl) {
            const mps = [];
            for (let index = 0; index < 2; index++) {
                // 上
                const tx = this.x - 1 + index * 2;
                const ty = this.y - 1;
                mps.push(new MovePoint(tx, ty, notExistPoint));
                //下
                const bx = this.x - 1 + index * 2;
                const by = this.y + 1;
                mps.push(new MovePoint(bx, by, notExistPoint));
            }
            return this.filterMovePoints(mps, pl);
        }
        filterMovePoints(list, pl) {
            return list.filter(i => {
                const pointHasSameSidePeice = pl.find(p => p.x === i.x && p.y === i.y && p.side === this.side);
                return !pointHasSameSidePeice &&
                    (i.x <= 5 && i.x >= 3) &&
                    ((this.side === "RED" && i.y >= 7 && i.y <= 9) ||
                        (this.side === "BLACK" && i.y >= 0 && i.y <= 2));
            });
        }
    }
    // 将领
    class GeneralPiece extends KnightPiece {
        constructor(info) {
            super(info);
        }
        getMovePoints(pl) {
            const mps = [
                new MovePoint(this.x - 1, this.y, notExistPoint),
                new MovePoint(this.x + 1, this.y, notExistPoint),
                new MovePoint(this.x, this.y - 1, notExistPoint),
                new MovePoint(this.x, this.y + 1, notExistPoint),
            ];
            return this.filterMovePoints(mps, pl);
        }
    }
    // 炮
    class CannonPiece extends RookPiece {
        constructor(info) {
            super(info);
        }
        move(p, pieceList) {
            if (p.x < 0 || p.x > 8 || p.y < 0 || p.y > 9) {
                return { flag: false, message: "移动位置不符合规则" };
            }
            // 如果在 x, y 轴上移动
            if (this.y === p.y || this.x === p.x) {
                const list = this.getMoveObstaclePieceList(p, pieceList);
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
                    const hasPeice = pieceList.find(i => i.x === p.x && i.y === p.y);
                    if (hasPeice) {
                        return { flag: true };
                    }
                    return { flag: false, message: "无法击中敌方棋子，移动无效" };
                }
                // 无炮架  且 目标位置有敌方棋子
                const hasPeice = pieceList.find(i => i.x === p.x && i.y === p.y);
                if (list.length === 0 && hasPeice) {
                    return { flag: false, message: "无法击中敌方棋子(缺少炮架)，移动无效" };
                }
                // console.log(`${this}可以移动到点${p}`);
                return { flag: true };
            }
            return { flag: false, message: "移动位置不符合规则" };
        }
    }
    // 兵
    class SoldierPiece extends HorsePiece {
        constructor(info) {
            super(info);
        }
        getMovePoints(pl) {
            const isCross = this.side === "RED" ? (this.y <= 4) : (this.y >= 5);
            const step = this.side === "RED" ? -1 : +1;
            const startMp = new MovePoint(this.x, this.y + step, notExistPoint);
            const mps = isCross ?
                [
                    startMp,
                    new MovePoint(this.x - 1, this.y, notExistPoint),
                    new MovePoint(this.x + 1, this.y, notExistPoint),
                ] :
                [startMp];
            return this.filterMovePoints(mps, pl);
        }
    }
    const chessOfPeiceMap = {
        "仕": (info) => new KnightPiece(info),
        "兵": (info) => new SoldierPiece(info),
        "卒": (info) => new SoldierPiece(info),
        "士": (info) => new KnightPiece(info),
        "将": (info) => new GeneralPiece(info),
        "帅": (info) => new GeneralPiece(info),
        "炮": (info) => new CannonPiece(info),
        "相": (info) => new ElephantPiece(info),
        "砲": (info) => new CannonPiece(info),
        "象": (info) => new ElephantPiece(info),
        "車": (info) => new RookPiece(info),
        "车": (info) => new RookPiece(info),
        "馬": (info) => new HorsePiece(info),
        "马": (info) => new HorsePiece(info),
    };

    /**
    * 根据棋盘列表位置返回棋子 可能该位置没有棋子
    * @param pl 棋盘列表
    * @param p 棋盘坐标点
    * @returns 返回当前棋盘坐标点上的棋子
    */
    const findPiece = (pl, p) => pl.find(item => item.x === p.x && item.y === p.y);
    const numPos = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const zhnumPos = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
    const strPos = ["前", "中", "后"];
    const moveStyles = ["进", "平", "退"];
    const numMergePos = numPos.concat(zhnumPos);
    const numMergePosStr = numMergePos.join("|");
    const PieceNames = Object.keys(chessOfPeiceMap);
    const move_reg_one = new RegExp(`(${strPos.concat(numMergePos).join("|")})(${PieceNames.join("|")})(${moveStyles.join("|")})(${numMergePosStr})$`);
    const move_reg_two = new RegExp(`(${PieceNames.join("|")})(${numMergePosStr})(${moveStyles.join("|")})(${numMergePosStr})$`);
    const move_reg_three = new RegExp(`(${strPos.join("|")})(${numMergePosStr})(${moveStyles.join("|")})(${numMergePosStr})$`);
    const getPieceInfo = (str, side, pl) => {
        let strRes;
        const currentSidePieceList = pl.filter(p => p.side === side);
        const isRedSide = side === "RED";
        const pieceDiffX = side === "BLACK" ? 8 : 0;
        const pieceDiffY = side === "BLACK" ? 9 : 0;
        const sideOpposite = isRedSide ? 1 : -1;
        // 前6进1 只有兵才会出现这种情况
        let strRes1;
        if (move_reg_three.test(str) && (strRes1 = move_reg_three.exec(str))) {
            const pieceXPos = Math.abs((formatChooseNum(strRes1[2]) - 1) - pieceDiffX);
            const moveStyle = strRes1[3];
            let moveStep = formatChooseNum(strRes1[4]);
            const pieceName = getSidePieceName("兵", side);
            if (moveStyle === "平") {
                moveStep -= 1;
            }
            // 获取 该棋子列表 
            const findPL = currentSidePieceList.filter(p => p.x === pieceXPos && p.name === pieceName);
            // 如果小于 2 不适用 此正则匹配
            if (findPL.length < 2) {
                return false;
            }
            findPL.sort((a, b) => isRedSide ? a.y - b.y : b.y - a.y);
            const index = findPL.length === 3 ? formatChooseNum(strRes1[1]) - 1 : (strRes1[1] === "前" ? 0 : 1);
            // 获取到棋子
            const choose = findPL[index];
            const cy = Math.abs(choose.y - pieceDiffY);
            // 前进
            let y = isRedSide ? cy - moveStep * sideOpposite : cy + moveStep * sideOpposite;
            if (moveStyle === moveStyles[0]) {
                const mp = new Point(choose.x, y);
                return { mp, choose };
            }
            // 平
            if (moveStyle === moveStyles[1]) {
                const mp = new Point(Math.abs(moveStep - pieceDiffX), cy);
                return { mp, choose };
            }
        }
        //  前车进八  or  一兵进1
        if (move_reg_one.test(str) && (strRes = move_reg_one.exec(str))) {
            move_reg_one.lastIndex = 0;
            // 获得 棋子名字
            let pieceName = getSidePieceName(strRes[2], side);
            let moveStyle = strRes[3], moveStep = formatChooseNum(strRes[4]);
            if (moveStyle === "平") {
                moveStep -= 1;
            }
            // 获取 该棋子列表 
            const findPL = currentSidePieceList.filter(p => p.name === pieceName);
            // 如果小于 2 不适用 此正则匹配
            if (findPL.length < 2) {
                return false;
            }
            // 获取 棋子所对应的 x轴 的次数
            let maxX = 0, lineX;
            const xmap = {};
            findPL.forEach(p => {
                if (xmap[p.x]) {
                    xmap[p.x] += 1;
                }
                else {
                    xmap[p.x] = 1;
                }
            });
            const linexs = Object.keys(xmap);
            for (let i = 0; i < linexs.length; i++) {
                const ele = xmap[linexs[i]];
                if (maxX < ele) {
                    maxX = ele;
                }
                else if (maxX === ele) {
                    // 如果两个兵 两组并排 不适用 此正则
                    return false;
                }
            }
            lineX = linexs[0];
            maxX = xmap[lineX];
            if (maxX < 2) {
                return false;
            }
            const linePL = findPL.filter(p => String(p.x) === lineX);
            let firstStr = strRes[1];
            // 如果取中字 必须有三个兵在一条竖线上
            if (firstStr === strPos[1] && maxX !== 3) {
                return false;
            }
            // 如果多个兵在一条竖线上 数字开头
            if (maxX >= 3) {
                linePL.sort((a, b) => isRedSide ? a.y - b.y : b.y - a.y);
                // 获取到棋子
                const choose = linePL[formatChooseNum(firstStr) - 1];
                const cy = Math.abs(choose.y - pieceDiffY);
                // 前进
                let y = isRedSide ? cy - moveStep * sideOpposite : cy + moveStep * sideOpposite;
                if (moveStyle === moveStyles[0]) {
                    const mp = new Point(choose.x, y);
                    return { mp, choose };
                }
                // 平
                if (moveStyle === moveStyles[1]) {
                    const mp = new Point(Math.abs(moveStep - pieceDiffX), cy);
                    return { mp, choose };
                }
            }
            // 如果两个相同的棋子在一条竖线上
            if (maxX === 2 && strPos.filter(i => i !== "中").includes(firstStr)) {
                const index = firstStr === strPos[0] ? 0 : 1;
                const choose = linePL[index];
                const cy = choose.y;
                const cx = choose.x;
                // x 距离差
                const diffX = cx - moveStep;
                // 前进 后退 x 一致 y取想法
                if (moveStyle === moveStyles[0] || moveStyle === moveStyles[2]) {
                    // 距离长度
                    const absDiffX = Math.abs(diffX);
                    const yOpposite = moveStyle === moveStyles[2] ? -1 : 1;
                    // 马
                    if (pieceName === "马" || pieceName === "馬") {
                        if (absDiffX >= 1 && absDiffX <= 2) {
                            const isRow = absDiffX == 1 ? true : false;
                            const y = isRow ? cy - (2 * sideOpposite * yOpposite) : cy - (1 * sideOpposite * yOpposite);
                            const x = diffX < 0 ? (isRow ? cx - (1 * sideOpposite) : cx - (2 * sideOpposite)) : (isRow ? cx + (1 * sideOpposite) : cx + (2 * sideOpposite));
                            return { choose, mp: new Point(x, y) };
                        }
                        else {
                            return false;
                        }
                    }
                    // 象 士
                    const elePieceList = ["相", "象"], kinPieceList = ["仕", "士"], isEle = elePieceList.includes(pieceName);
                    if (isEle || kinPieceList.includes(pieceName)) {
                        const mStep = isEle ? 2 : 1;
                        if (isEle && absDiffX !== 3) {
                            return false;
                        }
                        if (!isEle && absDiffX !== 1) {
                            return false;
                        }
                        const x = diffX > 0 ? cx + (mStep * sideOpposite) : cx - (mStep * sideOpposite);
                        const y = cy - (mStep * sideOpposite * yOpposite);
                        return { choose, mp: new Point(x, y) };
                    }
                    // 车 将 兵 跑
                    const y = cy - (moveStep * sideOpposite * yOpposite);
                    return { choose, mp: new Point(cx, y) };
                }
                // 平
                if (moveStyle === moveStyles[1]) {
                    // 车 将 兵 跑
                    return { choose, mp: new Point(Math.abs(moveStep - pieceDiffX), cy) };
                }
            }
            return false;
        }
        // 车9进1
        let execRes;
        if (move_reg_two.test(str) && (execRes = move_reg_two.exec(str))) {
            let pieceName = getSidePieceName(execRes[1], side);
            const pieceXPos = formatChooseNum(execRes[2]) - 1;
            const moveStyle = execRes[3];
            let moveStep = formatChooseNum(execRes[4]);
            if (moveStyle === "平") {
                moveStep -= 1;
            }
            const px = Math.abs(pieceXPos - pieceDiffX);
            const choose = currentSidePieceList.find(p => p.x === px && p.name === pieceName);
            // 没找到棋子
            if (!choose) {
                return false;
            }
            const cy = choose.y;
            const cx = choose.x;
            const diffX = Math.abs(cx - pieceDiffX) - moveStep;
            const absDiffX = Math.abs(diffX);
            // 前进 后退 x 一致 y取移动相反
            if (moveStyle === moveStyles[0] || moveStyle === moveStyles[2]) {
                // 距离长度
                const yOpposite = moveStyle === moveStyles[2] ? -1 : 1;
                // 马
                if (pieceName === "马" || pieceName === "馬") {
                    const absx = Math.abs((Math.abs(cx - pieceDiffX) - (moveStep - 1)));
                    if (absx >= 1 && absx <= 2) {
                        const isRow = absx === 1 ? true : false;
                        const y = isRow ? cy - (2 * sideOpposite * yOpposite) : cy - (1 * sideOpposite * yOpposite);
                        const x = (diffX + 1) < 0 ? (isRow ? cx + (1 * sideOpposite) : cx + (2 * sideOpposite)) : (isRow ? cx - (1 * sideOpposite) : cx - (2 * sideOpposite));
                        return { choose, mp: new Point(x, y) };
                    }
                    else {
                        return false;
                    }
                }
                // 象 士
                const elePieceList = ["相", "象"], kinPieceList = ["仕", "士"], isEle = elePieceList.includes(pieceName);
                if (isEle || kinPieceList.includes(pieceName)) {
                    const mStep = isEle ? 2 : 1;
                    if (isEle && absDiffX !== 3) {
                        return false;
                    }
                    if (!isEle && absDiffX !== 1) {
                        return false;
                    }
                    const x = diffX > 0 ? cx + (mStep * sideOpposite) : cx - (mStep * sideOpposite);
                    const y = cy - (mStep * sideOpposite * yOpposite);
                    return { choose, mp: new Point(x, y) };
                }
                // 车 将 兵 跑
                const y = cy - (moveStep * sideOpposite * yOpposite);
                return { choose, mp: new Point(cx, y) };
            }
            // 平
            if (moveStyle === moveStyles[1]) {
                // 车 将 兵 跑
                return { choose, mp: new Point(Math.abs(moveStep - pieceDiffX), cy) };
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

    class GameRule {
        /**
       * 根据某方移动棋子判断自己将领是否安全
       * @param side 移动方
       * @param pos 移动棋子
       * @param cp 是去吃棋子还是移动棋子
       * @param pl 当前棋盘列表
       * @returns 是否安全
       */
        checkGeneralInTrouble(side, pos, cp, pl) {
            const enemySide = side === "BLACK" ? "RED" : "BLACK";
            let list;
            if ("move" in cp) {
                const pieceInfo = Object.assign(Object.assign({}, pos), { x: cp.move.x, y: cp.move.y });
                const piece = chessOfPeiceMap[pieceInfo.name](pieceInfo);
                list = pl.filter(i => !(i.x === pos.x && i.y === pos.y));
                list.push(piece);
            }
            else {
                const pieceInfo = Object.assign(Object.assign({}, pos), { x: cp.eat.x, y: cp.eat.y });
                const piece = chessOfPeiceMap[pieceInfo.name](pieceInfo);
                list = pl.filter(i => !(i.x === cp.eat.x && i.y === cp.eat.y) && !(i.x === pos.x && i.y === pos.y));
                list.push(piece);
            }
            const isFaceToFace = this.checkGeneralsFaceToFaceInTrouble(list);
            if (isFaceToFace) {
                return true;
            }
            const enemySidePeiecList = list.filter(i => i.side === enemySide);
            const sideGeneralPiece = list.find(i => i.side === side && i instanceof GeneralPiece);
            const sidesideGeneralPoint = new Point(sideGeneralPiece.x, sideGeneralPiece.y);
            const hasTrouble = enemySidePeiecList.some(item => {
                const mf = item.move(sidesideGeneralPoint, list);
                // if (mf.flag) {
                //   console.log(`${item} 可以 直接 攻击 ${sideGeneralPiece}`);
                // }
                return mf.flag;
            });
            return hasTrouble;
        }
        /**
       * 检查棋子移动 双方将领在一条直线上 false 不危险 true 危险
       * @param pl 假设移动后的棋子列表
       * @param side 当前下棋方
       * @returns 是否危险
       */
        checkGeneralsFaceToFaceInTrouble(pl) {
            const points = pl.filter(i => i instanceof GeneralPiece).map(i => ({ x: i.x, y: i.y }));
            const max = points[0].y > points[1].y ? points[0].y : points[1].y;
            const min = points[0].y < points[1].y ? points[0].y : points[1].y;
            // 在同一条直线上
            if (points[0].x === points[1].x) {
                const hasPeice = pl.find(i => i.y < max && i.y > min && i.x === points[0].x);
                // 如果有棋子 说明可以安全移动 
                if (hasPeice) {
                    return false;
                }
                return true;
            }
            return false;
        }
        /**
         * 判断敌方被将军时，是否有解
         * @param enemySide 敌方
         * @param pl 当前棋盘列表
         * @returns  返回是否有解
         */
        checkEnemySideInTroubleHasSolution(enemySide, pl) {
            return pl.filter(i => i.side === enemySide).some(item => {
                const mps = item.getMovePoints(pl);
                // 是否有解法
                return mps.some(p => {
                    const isDis = findPiece(pl, p.disPoint);
                    if (isDis) {
                        return false;
                    }
                    const hasEat = findPiece(pl, p);
                    const checkPoint = hasEat ? { eat: p } : { move: p };
                    const hasSolution = !this.checkGeneralInTrouble(enemySide, item, checkPoint, pl);
                    // console.log(`${item} 移动到 ${p}点 ${enemySide}方 ${!hasSolution ? '有' : '没有'} 危险！${hasSolution ? "有" : "无"}解法`);
                    return hasSolution;
                });
            });
        }
    }

    const getPiecesList = (r) => {
        const piecesList = [];
        // 车 马 象 士 炮
        for (let index = 0; index < 2; index++) {
            const blackRook = new RookPiece({ x: 0 + index * 8, y: 0, name: "車", radius: r, side: "BLACK", isChoose: false });
            const blackHorse = new HorsePiece({ x: 1 + index * 6, y: 0, name: "馬", radius: r, side: "BLACK", isChoose: false });
            const blackElephant = new ElephantPiece({ x: 2 + index * 4, y: 0, name: "象", radius: r, side: "BLACK", isChoose: false });
            const blackKnight = new KnightPiece({ x: 3 + index * 2, y: 0, name: "仕", radius: r, side: "BLACK", isChoose: false });
            const blackCannon = new CannonPiece({ x: 1 + index * 6, y: 2, name: "砲", radius: r, side: "BLACK", isChoose: false });
            const redRook = new RookPiece({ x: 0 + index * 8, y: 9, name: "车", radius: r, side: "RED", isChoose: false });
            const redHorse = new HorsePiece({ x: 1 + index * 6, y: 9, name: "马", radius: r, side: "RED", isChoose: false });
            const redElephant = new ElephantPiece({ x: 2 + index * 4, y: 9, name: "相", radius: r, side: "RED", isChoose: false });
            const redKnight = new KnightPiece({ x: 3 + index * 2, y: 9, name: "士", radius: r, side: "RED", isChoose: false });
            const redCannon = new CannonPiece({ x: 1 + index * 6, y: 7, name: "炮", radius: r, side: "RED", isChoose: false });
            piecesList.push(blackRook, blackHorse, blackElephant, blackKnight, blackCannon, redRook, redHorse, redElephant, redKnight, redCannon);
        }
        // 兵
        for (let index = 0; index < 5; index++) {
            const blackSoldier = new SoldierPiece({ x: 2 * index, y: 3, name: "卒", radius: r, side: "BLACK", isChoose: false });
            const redSoldier = new SoldierPiece({ x: 2 * index, y: 6, name: "兵", radius: r, side: "RED", isChoose: false });
            piecesList.push(blackSoldier, redSoldier);
        }
        const blackGeneral = new GeneralPiece({ x: 4, y: 0, name: "将", radius: r, side: "BLACK", isChoose: false });
        const redGeneral = new GeneralPiece({ x: 4, y: 9, name: "帅", radius: r, side: "RED", isChoose: false });
        piecesList.push(blackGeneral, redGeneral);
        return piecesList;
    };

    /**
     *
     * @param ctx
     * @param strokeStyle
     * @param points 顺时针或者逆时针的四个点
     */
    /**
     * 根据左上点得出方形的四个点的坐标
     * @param lt 左上点
     * @param width 方形的宽度
     * @param height 方形的高度
     */
    function getSquarePoints(lt, width, height) {
        return [
            Object.assign({}, lt),
            { x: width + lt.x, y: lt.y },
            { x: width + lt.x, y: lt.y + height },
            { x: lt.x, y: lt.y + height },
        ];
    }

    class Game {
        constructor({ ctx, gameWidth = 800, gameHeight = 800, gamePadding = 20, scaleRatio = 1 }) {
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
             * 棋盘是否有棋子在移动
             */
            Object.defineProperty(this, "isMoving", {
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
             * 将军验证规则
             */
            Object.defineProperty(this, "rule", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * 玩家方
             */
            Object.defineProperty(this, "gameSide", {
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
            Object.defineProperty(this, "isSetMode", {
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
            this.rule = new GameRule();
            this.gridPostionList = [];
            this.setGridList();
            this.moveSpeed = 8;
            this.ctx = ctx;
            this.isSetMode = false;
            this.setGameWindow(gameWidth, gameHeight, gamePadding);
            this.init();
        }
        /**
         * 设置游戏窗口 棋盘
         */
        setGameWindow(w, h, p) {
            const playHeight = h - p * 2;
            let playWidth = playHeight;
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
        setGridDiff() {
            this.gridDiffX = this.gameSide === "BLACK" ? 8 : 0;
            this.gridDiffY = this.gameSide === "BLACK" ? 9 : 0;
        }
        /**
         * 获取所有格子的坐标
         */
        setGridList() {
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 10; j++) {
                    this.gridPostionList.push(new Point(i, j));
                }
            }
        }
        /**
         * 根据点击点返回所在棋盘上x,y的位置
         * @param p 点击点的 x,y 坐标
         * @returns 返回棋盘的x，y坐标轴
         */
        getGridPosition(p) {
            return this.gridPostionList.find(item => {
                const x1 = Math.abs(item.x - this.gridDiffX) * this.gridWidth + this.startX;
                const y1 = Math.abs(item.y - this.gridDiffY) * this.gridHeight + this.startY;
                return Math.sqrt(Math.pow((x1 - p.x), 2) + Math.pow((y1 - p.y), 2)) < this.radius;
            });
        }
        /**
         * 初始化象棋
         */
        init() {
            this.isMoving = false;
            this.currentSide = "RED";
            this.gameState = "INIT";
            this.choosePiece = null;
            this.deadPieceList = [];
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.drawChessLine();
        }
        initPiece() {
            this.livePieceList = getPiecesList(this.radius);
            this.choosePiece = null;
            this.deadPieceList = [];
            this.redraw();
        }
        /**
         * 画 棋盘 跟 棋子
         */
        drawPeice(pieceList) {
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.drawChessLine();
            pieceList.forEach((p) => this.drawSinglePeice(p, true));
        }
        /**
         * 绘画单个象棋
         * @param piece 单个象棋
         */
        drawSinglePeice(piece, replaceXY) {
            const { startX, startY, gridWidth, gridHeight } = this;
            const bgfillStyle = piece.side === "BLACK" ? "#fdec9e" : "#feeca0";
            const textColor = piece.side === "BLACK" ? "#000" : "#c1190c";
            const borderColor = piece.isChoose ? "red" : "#000";
            let x = startX + piece.x * gridWidth;
            let y = startY + piece.y * gridHeight;
            if (replaceXY) {
                x = startX + Math.abs(piece.x - this.gridDiffX) * gridWidth;
                y = startY + Math.abs(piece.y - this.gridDiffY) * gridHeight;
            }
            let r = piece.radius, ty = 0;
            this.ctx.fillStyle = bgfillStyle;
            const drawBoder = (x, y, r, startAngle, endAngle) => {
                this.ctx.beginPath();
                this.ctx.arc(x, y, r, startAngle, endAngle);
                this.ctx.closePath();
                this.ctx.stroke();
            };
            // 选中动画
            if (piece.isChoose) {
                r = r / 0.98;
                ty = piece.side === "RED" ? -3 : 3;
                ty = this.gridDiffY > 0 ? ty * -1 : ty;
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
        /**
         * 画棋盘
         */
        drawChessLine() {
            const { startX, startY, endX, endY, gridWidth, gridHeight } = this;
            // 画背景
            this.ctx.fillStyle = "#faebd7";
            this.ctx.fillRect(0, 0, this.width, this.width);
            this.ctx.strokeStyle = "#000";
            // 横线
            for (let index = 0; index < 10; index++) {
                this.ctx.beginPath();
                const y = startY + gridHeight * index;
                this.ctx.moveTo(startX, y);
                this.ctx.lineTo(endX, y);
                this.ctx.closePath();
                this.ctx.stroke();
            }
            // 竖线
            for (let index = 0; index < 9; index++) {
                const x = startX + index * gridWidth;
                const midY = startY + gridHeight * 4;
                const by = startY + gridHeight * 9;
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
            for (let index = 0; index < 2; index++) {
                const x = startX + gridWidth * 3;
                const points = getSquarePoints({ x, y: startY + gridHeight * 7 * index }, gridWidth * 2, gridHeight * 2);
                this.ctx.beginPath();
                this.ctx.moveTo(points[0].x, points[0].y);
                this.ctx.lineTo(points[2].x, points[2].y);
                this.ctx.moveTo(points[1].x, points[1].y);
                this.ctx.lineTo(points[3].x, points[3].y);
                this.ctx.closePath();
                this.ctx.stroke();
            }
        }
        /**
         * 动画效果 绘画 棋子移动
         * @param mp 移动点
         * @param pl 绘画的棋子列表
         * @param activePoint 当前移动点
         */
        activeMove(mp, pl, activePoint) {
            const dx = (activePoint.x - mp.x);
            const dy = (activePoint.y - mp.y);
            // console.log(this.moveSpeed);
            const xstep = dx === 0 ? 0 : dx / this.moveSpeed;
            const ystep = dy === 0 ? 0 : dy / this.moveSpeed;
            // 是否支持 动画 API 
            if (typeof window.requestAnimationFrame === "function" && typeof window.requestAnimationFrame === "function") {
                return new Promise((resolve) => {
                    let raf;
                    const cb = () => {
                        // const mx = mp.x.toFixed(2), ax = activePoint.x.toFixed(2), my = mp.y.toFixed(2), ay = activePoint.y.toFixed(2)
                        const diffX = Math.abs(mp.x - activePoint.x), diffY = Math.abs(mp.y - activePoint.y);
                        // console.log(`diffX:${diffX} diffY:${diffY}\nxstep:${Math.abs(xstep)} ystep:${Math.abs(ystep)}`);
                        if (diffX <= Math.abs(xstep) && diffY <= Math.abs(ystep) && this.choosePiece) {
                            window.cancelAnimationFrame(raf);
                            return resolve(mp);
                        }
                        this.drawPeice(pl);
                        let peice = Object.assign({}, this.choosePiece);
                        // peice.isChoose = false
                        peice.x = Math.abs(activePoint.x - this.gridDiffX) - xstep;
                        peice.y = Math.abs(activePoint.y - this.gridDiffY) - ystep;
                        this.drawSinglePeice(peice);
                        activePoint.x -= xstep;
                        activePoint.y -= ystep;
                        raf = window.requestAnimationFrame(cb);
                    };
                    cb();
                });
            }
            return Promise.resolve(mp);
        }
        /**
         * 把当前选中的棋子 移动到 指定的位置
         * @param p 移动位置
         * @param drawPeiceList 需要画的棋子列表
         * @param moveCb 移动完的回调函数
         */
        movePeiec(p, drawPeiceList) {
            return new Promise((res) => {
                if (this.choosePiece) {
                    const { x, y } = this.choosePiece;
                    const pl = drawPeiceList.filter(i => !(i.x === x && i.y === y));
                    const ap = new Point(this.choosePiece.x, this.choosePiece.y);
                    this.activeMove(p, pl, ap).then((point) => {
                        this.moveEnd(point);
                        res();
                    });
                }
                else {
                    res();
                }
            });
        }
        /**
         * 清除移动完选中的棋子
         */
        clearMoveChoosePeiece() {
            if (this.choosePiece) {
                this.choosePiece = null;
            }
        }
        /**
         * 更换当前运行玩家
         */
        changeSide() {
            this.currentSide = this.currentSide === "RED" ? "BLACK" : "RED";
        }
        /**
         * 当前选中的棋子吃掉 指定位置的棋子
         * @param p 当前选中棋子
         */
        eatPeice(p) {
            if (this.choosePiece) {
                const side = this.currentSide;
                const eatPeice = findPiece(this.livePieceList, p);
                const lastChoosePeice = this.choosePiece;
                const hasTrouble = this.rule.checkGeneralInTrouble(side, this.choosePiece, { eat: p }, this.livePieceList);
                if (hasTrouble) {
                    this.moveFailEvents.forEach(f => f(lastChoosePeice, p, true, "不可以送将！"));
                    return;
                }
                this.livePieceList = this.livePieceList.filter(i => !(i.x === p.x && i.y === p.y));
                this.deadPieceList.push(eatPeice);
                this.isMoving = true;
                this.moveStart(lastChoosePeice, p, this.livePieceList, side, true);
            }
        }
        /**
         * 开始移动棋子
         * @param mp 移动棋子
         * @param p 移动位置
         * @param drawList 绘画棋子列表
         * @param side 当前下棋方
         */
        moveStart(mp, p, drawList, side, isEat) {
            const enemySide = side === "RED" ? "BLACK" : "RED";
            const checkPoint = isEat ? { eat: p } : { move: p };
            this.movePeiec(p, drawList).then(() => {
                const enemyhasTrouble = this.rule.checkGeneralInTrouble(enemySide, mp, { move: p }, drawList);
                if (enemyhasTrouble) {
                    const movedPeiceList = drawList.filter(i => !(i.x === mp.x && i.y === mp.y));
                    const newMp = chessOfPeiceMap[mp.name](Object.assign(Object.assign({}, mp), p));
                    movedPeiceList.push(newMp);
                    const hasSolution = this.rule.checkEnemySideInTroubleHasSolution(enemySide, movedPeiceList);
                    if (!hasSolution) {
                        this.gameState = "OVER";
                        this.overEvents.forEach(f => f(side));
                        return;
                    }
                }
                this.moveEvents.forEach(f => f(mp, checkPoint, enemyhasTrouble));
            });
        }
        /**
         * 动画移动结束，当前选中的棋子更新 x, y坐标，重新绘画 更换 玩家 和 运动状态
         * @param p 移动点
         */
        moveEnd(p) {
            this.livePieceList = this.livePieceList.map(i => {
                var _a, _b;
                if (i.x === ((_a = this.choosePiece) === null || _a === void 0 ? void 0 : _a.x) && i.y === ((_b = this.choosePiece) === null || _b === void 0 ? void 0 : _b.y)) {
                    const peiceInfo = Object.assign(Object.assign(Object.assign({}, i), { isChoose: false }), p);
                    return chessOfPeiceMap[i.name](peiceInfo);
                }
                return i;
            });
            this.clearMoveChoosePeiece();
            this.changeSide();
            this.redraw();
            this.isMoving = false;
        }
        /**
         * 重新绘画当前棋盘
         */
        redraw() {
            this.drawPeice(this.livePieceList);
        }
        /**
         * 初始化选择玩家方
         * @param side 玩家方
         */
        gameStart(side) {
            if (this.gameState === "START") {
                this.logEvents.forEach(f => f("刚开始不可以结束"));
                return;
            }
            this.gameSide = side;
            this.init();
            this.setGridDiff();
            this.initPiece();
            this.gameState = "START";
        }
        /**
         * 移动棋子
         * @param clickPoint 移动点
         */
        move(clickPoint) {
            const choosePiece = findPiece(this.livePieceList, clickPoint);
            // 在棋盘上 还没开始选中的点击
            if (!this.choosePiece) {
                // 如果 没点到棋子 
                if (!choosePiece) {
                    return;
                }
                // 点击到了敌方的棋子
                if (this.currentSide !== choosePiece.side) {
                    if (this.isSetMode) {
                        this.choosePiece = choosePiece;
                        this.choosePiece.isChoose = true;
                        return this.redraw();
                    }
                    return;
                }
                this.choosePiece = choosePiece;
                this.choosePiece.isChoose = true;
                this.logEvents.forEach(f => f(`当前：${this.currentSide} 方 选中了 棋子:${choosePiece}`));
                this.redraw();
                return;
            }
            // 选中之后的点击
            // 没有选中棋子 说明 已选中的棋子要移动过去
            if (!choosePiece) {
                if (this.isSetMode) {
                    this.choosePiece.x = clickPoint.x;
                    this.choosePiece.y = clickPoint.y;
                    this.choosePiece.isChoose = false;
                    this.choosePiece = null;
                    return this.redraw();
                }
                const moveFlag = this.choosePiece.move(clickPoint, this.livePieceList);
                let mp = this.choosePiece;
                if (moveFlag.flag) {
                    const hasTrouble = this.rule.checkGeneralInTrouble(this.currentSide, this.choosePiece, { move: clickPoint }, this.livePieceList);
                    if (hasTrouble) {
                        this.moveFailEvents.forEach(f => f(mp, clickPoint, true, "不可以送将！"));
                        return;
                    }
                    this.isMoving = true;
                    return this.moveStart(this.choosePiece, clickPoint, this.livePieceList, this.currentSide);
                }
                return this.moveFailEvents.forEach(f => f(mp, clickPoint, true, moveFlag.message));
            }
            // 如果点击的棋子是己方
            if (choosePiece.side === this.currentSide) {
                // 如果是点击选中的棋子
                if (this.choosePiece === choosePiece) {
                    // 取消选中
                    this.choosePiece.isChoose = false;
                    this.choosePiece = null;
                    this.logEvents.forEach(f => f("我方： 取消选中 " + choosePiece));
                    return this.redraw();
                }
                // 切换选中棋子
                this.choosePiece.isChoose = false;
                this.logEvents.forEach(f => f(`我方：切换 选中棋子 由${this.choosePiece} --> ${choosePiece}`));
                this.choosePiece = choosePiece;
                this.choosePiece.isChoose = true;
                this.redraw();
                return;
            }
            if (this.isSetMode) {
                this.choosePiece.isChoose = false;
                this.choosePiece = choosePiece;
                this.choosePiece.isChoose = true;
                return this.redraw();
            }
            // 如果点击的的棋子是敌方 ，要移动到敌方的棋子位置上
            this.logEvents.forEach(f => f(`当前：${this.currentSide} ,棋子:${this.choosePiece} 需要移动到：${clickPoint} 这个点上，并且要吃掉 ${choosePiece}`));
            const moveFlag = this.choosePiece.move(clickPoint, this.livePieceList);
            if (moveFlag.flag) {
                this.eatPeice(clickPoint);
                return;
            }
            this.moveFailEvents.forEach(f => f(this.choosePiece, clickPoint, false, moveFlag.message));
        }
        moveStr(str) {
            this.logEvents.forEach(f => f(`当前 ${this.currentSide} 输出：${str}`));
            const res = getPieceInfo(str, this.currentSide, this.livePieceList);
            if (!res) {
                this.logEvents.forEach(f => f("未找到棋子"));
                return;
            }
            if (this.choosePiece) {
                this.choosePiece.isChoose = false;
                this.choosePiece = null;
            }
            const posPeice = findPiece(this.livePieceList, res.mp);
            if (posPeice && posPeice.side === this.currentSide) {
                this.logEvents.forEach(f => f("移动的位置有己方棋子"));
                return;
            }
            this.choosePiece = res.choose;
            this.choosePiece.isChoose = true;
            this.move(res.mp);
        }
        setGameState(state) {
            this.gameState = state;
        }
        deletePeice() {
            if (this.choosePiece) {
                this.livePieceList = this.livePieceList.filter(i => i !== this.choosePiece);
                this.choosePiece = null;
                this.redraw();
            }
            else {
                console.log("请选择删除的棋子");
            }
        }
        /**
         * 监听棋盘点击
         */
        listenClick(e) {
            const { offsetX: x, offsetY: y } = e;
            // 游戏开始
            if (this.gameState === "INIT") {
                this.logEvents.forEach(f => f("请选择红黑方"));
                return;
            }
            // 游戏结束
            if (this.gameState === "OVER") {
                this.logEvents.forEach(f => f("棋盘结束 等待重开！"));
                return;
            }
            // 正在移动
            if (this.isMoving) {
                this.logEvents.forEach(f => f("棋子正在移动，无法做任何操作"));
                return;
            }
            const clickPoint = this.getGridPosition({ x, y });
            if (!clickPoint) {
                return;
            }
            this.move(clickPoint);
        }
        on(e, fn) {
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
        removeEvent(e, fn) {
            if (typeof fn === "function") {
                if (e === "log") {
                    this.logEvents = this.logEvents.filter(f => f !== fn);
                }
                else if (e === "move") {
                    this.moveEvents = this.logEvents.filter(f => f !== fn);
                }
                else if (e === "moveFail") {
                    this.moveFailEvents = this.logEvents.filter(f => f !== fn);
                }
                else if (e === "over") {
                    this.overEvents = this.logEvents.filter(f => f !== fn);
                }
            }
            else {
                throw new Error("监听函数值应该为 function 类型");
            }
        }
    }

    return Game;

}));
//# sourceMappingURL=chess.mjs.map
