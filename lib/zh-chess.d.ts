declare class Piece implements PieceInfo {
    x: number;
    y: number;
    radius: number;
    name: ChessOfPeiceName;
    side: PieceSide;
    isChoose: boolean;
    constructor(pieceInfo: PieceInfo);
    /**
     * 格式化象棋棋子输出字符串信息
     * @returns 例如返回`[RED方]:车(1,1)`
     */
    toString(): string;
    /**
     * 根据传入的可以移动点和棋子坐标列表来过滤掉移动点
     * @param list 移动点列表
     * @param pl 棋子列表
     * @returns 返回这个棋子可以移动点列表
     */
    filterMovePoints(list: MovePointList, pl: PieceList): MovePointList;
}
/**
 * 象棋：车
 */
declare class RookPiece extends Piece {
    constructor(info: PieceInfo);
    /**
     * 根据车移动的方向得出障碍棋子列表
     * @param p 坐标点或者移动点
     * @param pieceList 棋子列表
     * @returns 返回存在障碍的棋子列表
     */
    getMoveObstaclePieceList(p: Point | MovePoint, pieceList: PieceList): PieceList;
    /**
     * 根据象棋自己的移动规律以及棋子列表的位置得出是否可以移动到指定的坐标上
     * @param p 坐标点 或 移动点
     * @param pieceList 棋盘列表
     * @returns 返回移动结果
     */
    move(p: Point | MovePoint, pieceList: PieceList): MoveResult;
    /**
     * 根据棋子列表的坐标获取当前棋子的可以移动点列表
     * @param pl 棋子列表
     * @returns 返回移动点列表
     */
    getMovePoints(pl: PieceList): MovePointList;
}
/**
 * 象棋：马
 */
declare class HorsePiece extends Piece {
    constructor(info: PieceInfo);
    /**
     * 根据棋子列表的坐标获取当前棋子的可以移动点列表
     * @param pl 棋子列表
     * @returns 返回移动点列表
     */
    getMovePoints(pl: PieceList): MovePointList;
    /**
     * 根据传入的可以移动点和棋子坐标列表来过滤掉移动点
     * @param list 移动点列表
     * @param pl 棋子列表
     * @returns 返回这个棋子可以移动点列表
     */
    filterMovePoints(list: MovePointList, pl: PieceList): MovePointList;
    /**
     * 根据象棋自己的移动规律以及棋子列表的位置得出是否可以移动到指定的坐标上
     * @param p 坐标点 或 移动点
     * @param pieceList 棋盘列表
     * @returns 返回移动结果
     */
    move(p: Point, pieceList: PieceList): MoveResult;
}
/**
 * 象棋：象
 */
declare class ElephantPiece extends HorsePiece {
    constructor(info: PieceInfo);
    /**
    * 根据棋子列表的坐标获取当前棋子的可以移动点列表
    * @param pl 棋子列表
    * @returns 返回移动点列表
    */
    getMovePoints(pl: PieceList): MovePointList;
    /**
      * 根据传入的可以移动点和棋子坐标列表来过滤掉移动点
      * @param list 移动点列表
      * @param pl 棋子列表
      * @returns 返回这个棋子可以移动点列表
      */
    filterMovePoints(list: MovePointList, pl: PieceList): MovePoint[];
}
/**
 * 象棋：士
 */
declare class KnightPiece extends ElephantPiece {
    constructor(info: PieceInfo);
    /**
      * 根据棋子列表的坐标获取当前棋子的可以移动点列表
      * @param pl 棋子列表
      * @returns 返回移动点列表
      */
    getMovePoints(pl: PieceList): MovePointList;
    /**
      * 根据传入的可以移动点和棋子坐标列表来过滤掉移动点
      * @param list 移动点列表
      * @param pl 棋子列表
      * @returns 返回这个棋子可以移动点列表
      */
    filterMovePoints(list: MovePointList, pl: PieceList): MovePoint[];
}
/**
 * 象棋：将领
 */
declare class GeneralPiece extends KnightPiece {
    constructor(info: PieceInfo);
    /**
      * 根据棋子列表的坐标获取当前棋子的可以移动点列表
      * @param pl 棋子列表
      * @returns 返回移动点列表
      */
    getMovePoints(pl: PieceList): MovePointList;
}
/**
 * 象棋：炮
 */
declare class CannonPiece extends RookPiece {
    constructor(info: PieceInfo);
    /**
     * 根据象棋自己的移动规律以及棋子列表的位置得出是否可以移动到指定的坐标上
     * @param p 坐标点 或 移动点
     * @param pieceList 棋盘列表
     * @returns 返回移动结果
     */
    move(p: Point, pieceList: PieceList): MoveResult;
}
/**
 * 象棋：兵
 */
declare class SoldierPiece extends HorsePiece {
    constructor(info: PieceInfo);
    /**
      * 根据棋子列表的坐标获取当前棋子的可以移动点列表
      * @param pl 棋子列表
      * @returns 返回移动点列表
      */
    getMovePoints(pl: PieceList): MovePointList;
}
/**
 * 象棋棋子，包含了车、马、炮、象、士、将、兵
 */
declare type ChessOfPeice = RookPiece | HorsePiece | ElephantPiece | KnightPiece | GeneralPiece | CannonPiece | SoldierPiece;
/**
 * 象棋棋子列表
 */
declare type PieceList = Array<ChessOfPeice>;
/**
 * 象棋棋子名字
 * @example "车","車" // 都是棋子 RookPiece 类
 * @example "马","馬" // 都是棋子 HorsePiece 类
 * @example "相","象" // 都是棋子 ElephantPiece 类
 * @example "士","仕" // 都是棋子 KnightPiece 类
 * @example "帅","将" // 都是棋子 GeneralPiece 类
 * @example "炮","砲" // 都是棋子 CannonPiece 类
 * @example "兵","卒" // 都是棋子 SoldierPiece 类
 */
declare type ChessOfPeiceName = "車" | "馬" | "象" | "仕" | "砲" | "车" | "马" | "相" | "士" | "炮" | "卒" | "兵" | "将" | "帅";
/**
 * 象棋棋子Map数据类型
 * 根据名字返回一个函数
 * 函数参数需要象棋初始化所需的数据
 * 返回棋子实例
 */
declare type ChessOfPeiceMap = {
    [prop in ChessOfPeiceName]: (info: PieceInfo) => ChessOfPeice;
};
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
declare const chessOfPeiceMap: ChessOfPeiceMap;

/**
 * 游戏玩家方 固定为 RED | BLACK
 */
declare type PieceSide = "RED" | "BLACK";
/**
 * 游戏玩家方(中文) 固定为 RED | BLACK
 */
declare type PieceSideCN = "红方" | "黑方";
/**
 * 玩家Map数据类型
 */
declare type PieceSideMap = {
    [prop in PieceSide]: PieceSideCN;
};
/**
 * 玩家Map数据 根据 英文 映射中文名称
 * @example peiceSideMap["RED"] // 返回 红方
 * @example peiceSideMap["BLACK"] // 返回 黑方
 */
declare const peiceSideMap: PieceSideMap;
/**
 * 象棋棋子信息
 */
interface PieceInfo {
    /**
     * x坐标位置
     */
    x: number;
    /**
     * y坐标位置
     */
    y: number;
    /**
     * 棋子半径
     */
    radius: number;
    /**
     * 棋子名称
     */
    name: ChessOfPeiceName;
    /**
     * 棋子所在的玩家方
     */
    side: PieceSide;
    /**
     * 是否被选中
     */
    isChoose: boolean;
}
/**
 * 四变形的四个点
 * 以左上角坐标为起点
 * 顺时针或逆时针顺序存储的四个坐标点
 */
declare type SquarePoints = [Point, Point, Point, Point];
/**
 * 坐标点
 */
declare class Point {
    /**
     * 坐标x
     */
    x: number;
    y: number;
    constructor(x: number, y: number);
    /**
     * 格式化输出坐标点
     * @returns 例如返回：`(1,1)`
     */
    toString(): string;
}
/**
 * 象棋移动的坐标点
 */
declare class MovePoint extends Point {
    /**
     * 阻碍点(坐标)
     */
    disPoint: Point;
    constructor(x: number, y: number, p: Point);
    /**
     * 格式化输出移动点
     * @returns 例如返回：`(1,1)` 或者 `(1,1)<阻碍点(2,2)>`
     */
    toString(): string;
}
/**
 * 棋子移动点列表
 */
declare type MovePointList = Array<MovePoint>;
/**
 * 移动成功的结果
 */
declare type MoveSuccess = {
    /**
     * 移动成功
     */
    flag: true;
};
/**
 * 移动失败的结果
 */
declare type MoveFail = {
    /**
     * 移动失败
     */
    flag: false;
    /**
     * 移动失败信息
     */
    message: string;
};
/**
 * 棋子移动的结果
 */
declare type MoveResult = MoveSuccess | MoveFail;
/**
 * 象棋运动目标移动点
 */
declare type Mp = {
    move: Point;
};
/**
 * 象棋运动目标移动点且需要吃掉目标点上的棋子
 */
declare type Ep = {
    eat: Point;
};
/**
 * 象棋运动目标点
 */
declare type CheckPoint = Mp | Ep;
/**
 * 游戏四种状态
 * @example "INIT" //游戏初始化状态
 * @example "START" //游戏已经开始状态
 * @example "MOVE" //游戏棋子正在运动状态
 * @example "OVER" //游戏已经结束状态
 */
declare type GameState = "INIT" | "START" | "OVER" | "MOVE";
/**
 * 监听棋子移动函数
 * @param peice 运动的象棋
 * @param cp
 * if("move" in cp) 成立 说明是 移动点 使用cp.move访问
 * 否则是 吃掉坐标上点的棋子 使用 cp.eat 访问改坐标点
 * @param enemyhasTrouble 敌方是否被将军
 */
declare type MoveCallback = (peice: ChessOfPeice, cp: CheckPoint, enemyhasTrouble: boolean) => void;
/**
 * 监听棋子移动失败函数
 * @param peice 运动的象棋
 * @param p 需要移动到的坐标点
 * @param currentSideDanger 我方移动过去是否被将军
 * @param msg 失败信息
 */
declare type MoveFailCallback = (peice: ChessOfPeice, p: Point, currentSideDanger: boolean, msg: string) => void;
/**
 * 监听游戏运行日志
 * @param str 输出信息
 */
declare type GameLogCallback = (str: any) => void;
/**
 * 监听游戏结束
 * @param winnerSide 赢方
 */
declare type GameOverCallback = (winnerSide: PieceSide) => void;
/**
 * 游戏监听事件名称
 * @example "move" //游戏棋子移动成功事件名称
 * @example "moveFail" //游戏棋子移动失败事件名称
 * @example "log" //游戏日志事件名称
 * @example "over" //游戏结束事件名称
 */
declare type GameEventName = "move" | "moveFail" | "log" | "over";
/**
 * 游戏监听函数
 */
declare type GameEventCallback = MoveCallback | MoveFailCallback | GameLogCallback | GameOverCallback;
/**
 * 游戏象棋玩家格子x轴差值
 */
declare type GamePeiceGridDiffX = 8 | 0;
/**
 * 游戏象棋玩家格子y轴差值
 */
declare type GamePeiceGridDiffY = 9 | 0;

declare type CTX = CanvasRenderingContext2D;
/**
 * promise返回的运动结果
 */
declare type MoveResultAsync = Promise<MoveResult>;
/**
 * 初始化游戏参数
 */
interface GameInfo {
    /**
     * 游戏窗口宽度大小
     * @defaultValue 800
     */
    gameWidth?: number;
    /**
     * 游戏窗口高度大小
     * @defaultValue 800
     */
    gameHeight?: number;
    /**
     * 游戏内边距大小距离棋盘
     * @defaultValue 20
     */
    gamePadding?: number;
    /**
     * 画布
     */
    ctx: CTX;
    /**
     * 画布缩放大小
     * @defaultValue 1
     */
    scaleRatio?: number;
    /**
     * 游戏运动速度
     * @defaultValue 8
     */
    moveSpeed?: number;
    /**
     * 棋盘背景色
     * @defaultValue #faebd7
     */
    checkerboardBackground: string;
    /**
     * 红棋子背景色
     * @defaultValue #feeca0
     */
    redPeiceBackground: string;
    /**
     * 黑棋子背景色
     * @defaultValue #fdec9e
     */
    blackPeiceBackground: string;
}
declare class ZhChess {
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
    /**
     * 游戏移动监听事件列表
     */
    private moveEvents;
    /**
     * 游戏移动失败监听事件列表
     */
    private moveFailEvents;
    /**
     * 游戏日志监听事件列表
     */
    private logEvents;
    /**
     * 游戏结束监听事件列表
     */
    private overEvents;
    /**
     * 红色棋子背景颜色
     */
    private redPeiceBackground;
    /**
     * 黑色棋子背景颜色
     */
    private blackPeiceBackground;
    /**
     * 棋盘背景颜色
     */
    private checkerboardBackground;
    /**
     * 赢方
     */
    private winner;
    /**
     * 当前游戏方
     */
    private gameSide;
    constructor({ ctx, gameWidth, gameHeight, gamePadding, scaleRatio, moveSpeed, redPeiceBackground, blackPeiceBackground, checkerboardBackground }: GameInfo);
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
    /**
     * 获取赢棋方
     */
    get winnerSide(): PieceSide | null;
    private set winnerSide(value);
    /**
     * 获取游戏方
     */
    get currentGameSide(): PieceSide | null;
    private set currentGameSide(value);
    on(e: "move", fn: MoveCallback): void;
    on(e: "moveFail", fn: MoveFailCallback): void;
    on(e: "log", fn: GameLogCallback): void;
    on(e: "over", fn: GameOverCallback): void;
    removeEvent(e: "move", fn: MoveCallback): void;
    removeEvent(e: "moveFail", fn: MoveFailCallback): void;
    removeEvent(e: "log", fn: GameLogCallback): void;
    removeEvent(e: "over", fn: GameOverCallback): void;
}

export { CannonPiece, CheckPoint, ChessOfPeice, ChessOfPeiceMap, ChessOfPeiceName, ElephantPiece, Ep, GameEventCallback, GameEventName, GameInfo, GameLogCallback, GameOverCallback, GamePeiceGridDiffX, GamePeiceGridDiffY, GameState, GeneralPiece, HorsePiece, KnightPiece, MoveCallback, MoveFail, MoveFailCallback, MovePoint, MovePointList, MoveResult, MoveResultAsync, MoveSuccess, Mp, Piece, PieceInfo, PieceList, PieceSide, PieceSideCN, PieceSideMap, Point, RookPiece, SoldierPiece, SquarePoints, chessOfPeiceMap, ZhChess as default, peiceSideMap };
