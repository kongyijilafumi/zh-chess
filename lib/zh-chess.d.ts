declare class Piece implements PieceInfo {
    x: number;
    y: number;
    radius: number;
    name: ChessOfPeiceName;
    side: PieceSide;
    isChoose: boolean;
    constructor(pieceInfo: PieceInfo);
    toString(): string;
    filterMovePoints(list: MovePointList, pl: PieceList): MovePoint[];
}
declare class RookPiece extends Piece {
    constructor(info: PieceInfo);
    getMoveObstaclePieceList(p: Point | MovePoint, pieceList: PieceList): ChessOfPeice[];
    move(p: Point | MovePoint, pieceList: PieceList): MoveResult;
    getMovePoints(pl: PieceList): MovePointList;
}
declare class HorsePiece extends Piece {
    constructor(info: PieceInfo);
    getMovePoints(pl: PieceList): MovePointList;
    move(p: Point, pieceList: PieceList): MoveResult;
}
declare class ElephantPiece extends HorsePiece {
    constructor(info: PieceInfo);
    getMovePoints(pl: PieceList): MovePointList;
    filterMovePoints(list: MovePointList, pl: PieceList): MovePoint[];
}
declare class KnightPiece extends ElephantPiece {
    constructor(info: PieceInfo);
    getMovePoints(pl: PieceList): MovePointList;
    filterMovePoints(list: MovePointList, pl: PieceList): MovePoint[];
}
declare class GeneralPiece extends KnightPiece {
    constructor(info: PieceInfo);
    getMovePoints(pl: PieceList): MovePointList;
}
declare class CannonPiece extends RookPiece {
    constructor(info: PieceInfo);
    move(p: Point, pieceList: PieceList): MoveResult;
}
declare class SoldierPiece extends HorsePiece {
    constructor(info: PieceInfo);
    getMovePoints(pl: PieceList): MovePointList;
}
declare type ChessOfPeice = RookPiece | HorsePiece | ElephantPiece | KnightPiece | GeneralPiece | CannonPiece | SoldierPiece;
declare type PieceList = Array<ChessOfPeice>;
declare type ChessOfPeiceName = "車" | "馬" | "象" | "仕" | "砲" | "车" | "马" | "相" | "士" | "炮" | "卒" | "兵" | "将" | "帅";
declare type ChessOfPeiceMap = {
    [prop in ChessOfPeiceName]: (info: PieceInfo) => ChessOfPeice;
};

declare type PieceSide = "RED" | "BLACK";
declare type PieceSideCN = "红方" | "黑方";
declare type PieceSideMap = {
    [prop in PieceSide]: PieceSideCN;
};
declare const peiceSideMap: PieceSideMap;
interface PieceInfo {
    x: number;
    y: number;
    radius: number;
    name: ChessOfPeiceName;
    side: PieceSide;
    isChoose: boolean;
}
declare type SquarePoints = [Point, Point, Point, Point];
declare type PieceFilterFn = (p: PieceInfo, index: number) => boolean;
declare class Point {
    x: number;
    y: number;
    constructor(x: number, y: number);
    toString(): string;
}
declare class MovePoint extends Point {
    disPoint: Point;
    constructor(x: number, y: number, p: {
        x: number;
        y: number;
    });
    toString(): string;
}
declare type MovePointList = Array<MovePoint>;
interface MoveSuccess {
    flag: true;
}
interface MoveFail {
    flag: false;
    message: string;
}
declare type MoveResult = MoveSuccess | MoveFail;
declare type Mp = {
    move: Point;
};
declare type Ep = {
    eat: Point;
};
declare type CheckPoint = Mp | Ep;
declare type GameState = "INIT" | "START" | "OVER";
interface ModalOption {
    lab: string;
    val: string;
}
interface ModalChooseOption extends ModalOption {
    x: number;
    y: number;
    height: number;
    width: number;
}
declare type ModalOptionList = Array<ModalOption>;
declare type ModalChooseInfo = {
    title: string;
    options: ModalOptionList;
};
declare type MoveCallback = (peice: ChessOfPeice, cp: CheckPoint, enemyhasTrouble: boolean) => void;
declare type MoveFailCallback = (peice: ChessOfPeice, p: Point, currentSideDanger: boolean, msg: string) => void;
declare type GameLogCallback = (str: any) => void;
declare type GameOverCallback = (winnerSide: PieceSide) => void;
declare type GameEventName = "move" | "moveFail" | "log" | "over";
declare type GameEventCallback = MoveCallback | MoveFailCallback | GameLogCallback | GameOverCallback;
declare type GamePeiceGridDiffX = 8 | 0;
declare type GamePeiceGridDiffY = 9 | 0;

declare type CTX = CanvasRenderingContext2D;
declare type GameInfo = {
    gameWidth?: number;
    gameHeight?: number;
    gamePadding?: number;
    ctx: CTX;
    scaleRatio?: number;
};
declare class Game {
    /**
     * 当前走棋方
     */
    private currentSide;
    /**
     * 当前棋盘上存活的棋子
     */
    private livePieceList;
    /**
     * 当前被吃掉的棋子
     */
    private deadPieceList;
    /**
     * 当前选中的棋子
     */
    private choosePiece;
    /**
     * 棋盘绘制起始 x 值
     */
    private startX;
    /**
     * 棋盘绘制末尾 x 值
     */
    private endX;
    /**
     * 棋盘绘制起始 y 值
     */
    private startY;
    /**
     * 棋盘绘制末尾 y 值
     */
    private endY;
    /**
     * 象棋格子宽度
     */
    private gridWidth;
    /**
     * 象棋格子高度
     */
    private gridHeight;
    /**
     * 象棋半径
     */
    private radius;
    /**
     * 游戏窗口高度
     */
    private width;
    /**
     * 游戏窗口高度
     */
    private height;
    /**
     * 背景 和 线条 二维操作上下文
     */
    private ctx;
    /**
     * 存放棋盘格子的所有坐标
     */
    private gridPostionList;
    /**
     * 棋盘是否有棋子在移动
     */
    private isMoving;
    /**
     * 运行速度 大于或等于 1 的数 越大越慢
     */
    moveSpeed: number;
    /**
     * 将军验证规则
     */
    private rule;
    /**
     * 玩家方
     */
    private gameSide;
    /**
     * 玩家 x轴 格子距离相差
     */
    private gridDiffX;
    /**
     * 玩家 y轴 格子距离相差
     */
    private gridDiffY;
    /**
     * 游戏进行状态
     */
    gameState: GameState;
    moveEvents: Array<MoveCallback>;
    moveFailEvents: Array<MoveFailCallback>;
    logEvents: Array<GameLogCallback>;
    overEvents: Array<GameOverCallback>;
    constructor({ ctx, gameWidth, gameHeight, gamePadding, scaleRatio }: GameInfo);
    /**
     * 设置游戏窗口 棋盘
     */
    private setGameWindow;
    private setGridDiff;
    /**
     * 获取所有格子的坐标
     */
    private setGridList;
    /**
     * 根据点击点返回所在棋盘上x,y的位置
     * @param p 点击点的 x,y 坐标
     * @returns 返回棋盘的x，y坐标轴
     */
    private getGridPosition;
    /**
     * 初始化象棋
     */
    private init;
    /**
     * 初始化象棋个数
     */
    private initPiece;
    /**
     * 画 棋盘 跟 棋子
     */
    private drawPeice;
    /**
     * 绘画单个象棋
     * @param piece 单个象棋
     */
    private drawSinglePeice;
    /**
     * 画棋盘
     */
    private drawChessLine;
    /**
     * 动画效果 绘画 棋子移动
     * @param mp 移动点
     * @param pl 绘画的棋子列表
     * @param activePoint 当前移动点
     */
    private activeMove;
    /**
     * 把当前选中的棋子 移动到 指定的位置
     * @param p 移动位置
     * @param drawPeiceList 需要画的棋子列表
     * @param moveCb 移动完的回调函数
     */
    private movePeice;
    /**
     * 清除移动完选中的棋子
     */
    private clearMoveChoosePeiece;
    /**
     * 更换当前运行玩家
     */
    private changeSide;
    /**
     * 当前选中的棋子吃掉 指定位置的棋子
     * @param p 当前选中棋子
     */
    private eatPeice;
    /**
     * 开始移动棋子
     * @param mp 移动棋子
     * @param p 移动位置
     * @param drawList 绘画棋子列表
     * @param side 当前下棋方
     */
    private moveStart;
    /**
     * 动画移动结束，当前选中的棋子更新 x, y坐标，重新绘画 更换 玩家 和 运动状态
     * @param p 移动点
     */
    private moveEnd;
    /**
     * 重新绘画当前棋盘
     */
    redraw(): void;
    /**
     * 初始化选择玩家方
     * @param side 玩家方
     */
    gameStart(side: PieceSide): void;
    /**
     * 移动棋子
     * @param clickPoint 移动点
     */
    private move;
    moveStr(str: string): void;
    /**
     * 监听棋盘点击
     */
    listenClick(e: MouseEvent): void;
    on(e: "move", fn: MoveCallback): void;
    on(e: "moveFail", fn: MoveFailCallback): void;
    on(e: "log", fn: GameLogCallback): void;
    on(e: "over", fn: GameOverCallback): void;
    removeEvent(e: "move", fn: MoveCallback): void;
    removeEvent(e: "moveFail", fn: MoveFailCallback): void;
    removeEvent(e: "log", fn: GameLogCallback): void;
    removeEvent(e: "over", fn: GameOverCallback): void;
}

export { CheckPoint, ChessOfPeice, ChessOfPeiceMap, ChessOfPeiceName, GameEventCallback, GameEventName, GameLogCallback, GameOverCallback, GamePeiceGridDiffX, GamePeiceGridDiffY, GameState, ModalChooseInfo, ModalChooseOption, ModalOption, ModalOptionList, MoveCallback, MoveFail, MoveFailCallback, MovePoint, MovePointList, MoveResult, MoveSuccess, PieceFilterFn, PieceInfo, PieceList, PieceSide, PieceSideMap, Point, SquarePoints, Game as default, peiceSideMap };
