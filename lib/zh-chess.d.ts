declare class Piece implements PieceInfo {
    x: number;
    y: number;
    radius: number;
    name: ChessOfPeiceName;
    side: PieceSide;
    isChoose: boolean;
    constructor(pieceInfo: PieceInfo);
    toString(): string;
    filterMovePoints(list: MovePointList, pl: PieceList): MovePointList;
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
    filterMovePoints(list: MovePointList, pl: PieceList): MovePointList;
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
declare const chessOfPeiceMap: ChessOfPeiceMap;

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
declare type GameState = "INIT" | "START" | "OVER" | "MOVE";
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
declare type MoveResultAsync = Promise<MoveResult>;
declare type GameInfo = {
    gameWidth?: number;
    gameHeight?: number;
    gamePadding?: number;
    ctx: CTX;
    scaleRatio?: number;
    moveSpeed?: number;
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
     * 运行速度 大于或等于 1 的数 越大越慢
     */
    moveSpeed: number;
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
    private gameState;
    private moveEvents;
    private moveFailEvents;
    private logEvents;
    private overEvents;
    constructor({ ctx, gameWidth, gameHeight, gamePadding, scaleRatio, moveSpeed }: GameInfo);
    /**
     * 设置游戏窗口 棋盘
     */
    private setGameWindow;
    /**
     * 根据玩家返回绘画坐标轴的差值
     * @param side 玩家
     * @param key 坐标轴
     * @returns
     */
    private getGridDiff;
    /**
     * 根据玩家方 设置 x，y轴差值
     * @param side 玩家方
     */
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
     * 初始化象棋盘
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
     * 画出选中的棋子可以移动的点位
     */
    private drawChoosePieceMovePoint;
    /**
     * 重新绘画当前棋盘
     */
    redraw(): void;
    /**
     * 动画效果 绘画 棋子移动
     * @param mp 移动点
     * @param pl 绘画的棋子列表
     * @param activePoint 当前移动点
     */
    private activeMove;
    /**
     * 当前选中的棋子 根据点来 移动
     * @param checkPoint 移动点或者是吃
     */
    private moveToPeice;
    /**
     * 把当前选中的棋子 移动到 指定的位置
     * @param p 移动位置
     * @param drawPeiceList 需要画的棋子列表
     */
    private movePeiceToPointAsync;
    /**
    * 当前选中的棋子 根据点来 移动
    * @param checkPoint 移动点或者是吃
    */
    private moveToPeiceAsync;
    /**
     * 开始移动棋子
     * @param mp 移动棋子
     * @param checkPoint 移动点还是吃棋点
     * @param drawList 绘画棋子列表
     * @param side 当前下棋方
     */
    private moveStart;
    private moveStartAsync;
    /**
     * 动画移动结束，当前选中的棋子更新 x, y坐标，重新绘画 更换 玩家 和 运动状态
     * @param p 移动点
     */
    private moveEnd;
    /**
     * 移动棋子
     * @param clickPoint 移动点
     */
    private pieceMove;
    /**
    * 移动棋子
    * @param p 移动点
    * @returns 返回promise移动结果
    */
    private pieceMoveAsync;
    /**
     * 根据坐标点移动位置
     * @param piecePoint 棋子所在位置
     * @param movePoint 移动位置
     * @param side 下棋方
     */
    move(piecePoint: Point, movePoint: Point, side: PieceSide): MoveResult;
    /**
     * 根据坐标点移动位置
     * @param piecePoint 棋子所在位置
     * @param movePoint 移动位置
     * @param side 下棋方
     */
    moveAsync(piecePoint: Point, movePoint: Point, side: PieceSide): MoveResultAsync;
    /**
     * 根据移动方的描述文字来进行移动棋子
     * @param str 文字
     * @param side 移动方
     * @returns 移动结果
     */
    moveStr(str: string, side: PieceSide): MoveResult;
    /**
     * 根据移动方的描述文字来进行移动棋子
     * @param str 文字
     * @param side 移动方
     * @returns 移动结果
     */
    moveStrAsync(str: string, side: PieceSide): MoveResultAsync;
    /**
     * 初始化选择玩家方
     * @param side 玩家方
     */
    gameStart(side: PieceSide): void;
    /**
    * 清除移动完选中的棋子
    */
    private clearMoveChoosePeiece;
    /**
     * 更换当前运行玩家
     */
    private changeSide;
    /**
     * 更换玩家视角
     * @param side 玩家
     */
    changePlaySide(side: PieceSide): void;
    /**
     * 游戏是否结束
     */
    gameOver(): boolean;
    /**
     * 根据某方移动棋子判断自己将领是否安全
     * @param side 移动方
     * @param pos 移动棋子
     * @param cp 是去吃棋子还是移动棋子
     * @param pl 当前棋盘列表
     * @returns 是否安全
     */
    private checkGeneralInTrouble;
    /**
     * 检查棋子移动 双方将领在一条直线上 false 不危险 true 危险
     * @param pl 假设移动后的棋子列表
     * @param side 当前下棋方
     * @returns 是否危险
     */
    private checkGeneralsFaceToFaceInTrouble;
    /**
     * 判断敌方被将军时，是否有解
     * @param enemySide 敌方
     * @param pl 当前棋盘列表
     * @returns  返回是否有解
     */
    private checkEnemySideInTroubleHasSolution;
    /**
     * 棋子运动前检查游戏状态是否可以运动
     * @returns 是否可以运动
     */
    checkGameState(): boolean;
    /**
     * 监听棋盘点击
     */
    listenClick(e: MouseEvent): void;
    /**
    * 监听棋盘点击
    */
    listenClickAsync(e: MouseEvent): void;
    on(e: "move", fn: MoveCallback): void;
    on(e: "moveFail", fn: MoveFailCallback): void;
    on(e: "log", fn: GameLogCallback): void;
    on(e: "over", fn: GameOverCallback): void;
    removeEvent(e: "move", fn: MoveCallback): void;
    removeEvent(e: "moveFail", fn: MoveFailCallback): void;
    removeEvent(e: "log", fn: GameLogCallback): void;
    removeEvent(e: "over", fn: GameOverCallback): void;
}

export { CheckPoint, ChessOfPeice, ChessOfPeiceMap, ChessOfPeiceName, GameEventCallback, GameEventName, GameLogCallback, GameOverCallback, GamePeiceGridDiffX, GamePeiceGridDiffY, GameState, ModalChooseInfo, ModalChooseOption, ModalOption, ModalOptionList, MoveCallback, MoveFail, MoveFailCallback, MovePoint, MovePointList, MoveResult, MoveSuccess, PieceFilterFn, PieceInfo, PieceList, PieceSide, PieceSideMap, Point, SquarePoints, chessOfPeiceMap, Game as default, peiceSideMap };
