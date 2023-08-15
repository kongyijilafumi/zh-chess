declare class Piece implements PieceInfo {
    x: number;
    y: number;
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
    /**
     * 返回当前棋子的坐标信息
     * @returns 包含 name side x y 信息
     */
    getCurrentInfo(): PeicePosInfo;
    /**
     * 更新自己坐标点
     * @param p 坐标点
     */
    update(p: Point): void;
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
    draw(ctx: CanvasRenderingContext2D, startX: number, startY: number, gridWidth: number, gridHeight: number, gridDiffX: GamePeiceGridDiffX, gridDiffY: GamePeiceGridDiffY, radius: number, textColor: string, bgColor: string): void;
    /**
     * 根据棋子列表判断 当前棋子可移动的点
     * @param _pl 棋子列表
     * @returns
     */
    getMovePoints(_pl: PieceList): MovePointList;
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
    drawMovePoints(ctx: CanvasRenderingContext2D, pl: PieceList, startX: number, startY: number, gridWidth: number, gridHeight: number, gridDiffX: number, gridDiffY: number, radius: number, moveColor: string): void;
    getPoint(): Point;
}
/**
 * 象棋：车
 */
declare class RookPiece extends Piece {
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
type ChessOfPeice = RookPiece | HorsePiece | ElephantPiece | KnightPiece | GeneralPiece | CannonPiece | SoldierPiece;
/**
 * 象棋棋子列表
 */
type PieceList = Array<ChessOfPeice>;
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
type ChessOfPeiceName = "車" | "车" | "馬" | "马" | "象" | "相" | "仕" | "士" | "砲" | "炮" | "卒" | "兵" | "将" | "帅";
/**
 * 象棋棋子Map数据类型
 * 根据名字返回一个函数
 * 函数参数需要象棋初始化所需的数据
 * 返回棋子实例
 */
type ChessOfPeiceMap = {
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
 * 游戏玩家方 固定为 `RED` | `BLACK`
 */
type PieceSide = "RED" | "BLACK";
/**
 * 游戏玩家方(中文) 固定为 `红方` | `黑方`
 */
type PieceSideCN = "红方" | "黑方";
/**
 * 玩家Map数据类型
 */
type PieceSideMap = {
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
    isChoose?: boolean;
}
/**
 * 四变形的四个点
 * 以左上角坐标为起点
 * 顺时针或逆时针顺序存储的四个坐标点
 */
type SquarePoints = [Point, Point, Point, Point];
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
type MovePointList = Array<MovePoint>;
/**
 * 移动成功的结果
 */
type MoveSuccess = {
    /**
     * 移动成功
     */
    flag: true;
};
/**
 * 移动失败的结果
 */
type MoveFail = {
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
type MoveResult = MoveSuccess | MoveFail;
/**
 * 象棋运动目标移动点
 */
type Mp = {
    move: Point;
};
/**
 * 象棋运动目标移动点且需要吃掉目标点上的棋子
 */
type Ep = {
    eat: Point;
};
/**
 * 象棋运动目标点
 */
type CheckPoint = Mp | Ep;
/**
 * 游戏四种状态
 * @example "INIT" //游戏初始化状态
 * @example "START" //游戏已经开始状态
 * @example "MOVE" //游戏棋子正在运动状态
 * @example "OVER" //游戏已经结束状态
 */
type GameState = "INIT" | "START" | "OVER" | "MOVE";
/**
 * 监听棋子移动函数
 * @param peice 运动的象棋
 * @param cp
 * if("move" in cp) 成立 说明是 移动点 使用cp.move访问
 * 否则是 吃掉坐标上点的棋子 使用 cp.eat 访问改坐标点
 * @param enemyhasTrouble 敌方是否被将军
 */
type MoveCallback = (pos: ChessOfPeice, cp: CheckPoint, enemyhasTrouble: boolean, penCode: string) => void;
/**
 * 监听棋子移动失败函数
 * @param pos 起始点
 * @param mov 结束点
 * @param msg 失败信息
 */
type MoveFailCallback = (pos: Point | null, mov: Point | null, msg: string) => void;
/**
 * 监听游戏运行日志
 * @param str 输出信息
 */
type GameLogCallback = (str: any) => void;
/**
 * 监听游戏结束
 * @param winnerSide 赢方
 */
type GameOverCallback = (winnerSide: PieceSide) => void;
/**
 * 监听游戏报错信息
 * @param error 报错信息
 */
type GameErrorCallback = (error: any) => void;
/**
 * 游戏监听事件名称
 * @example "move" //游戏棋子移动成功事件名称
 * @example "moveFail" //游戏棋子移动失败事件名称
 * @example "log" //游戏日志事件名称
 * @example "over" //游戏结束事件名称
 * @example "error" //游戏报错事件名称
 */
type GameEventName = "move" | "moveFail" | "log" | "over" | "error";
/**
 * 游戏监听函数
 */
type GameEventCallback = MoveCallback | MoveFailCallback | GameLogCallback | GameOverCallback;
/**
 * 游戏象棋玩家格子x轴差值
 */
type GamePeiceGridDiffX = 8 | 0;
/**
 * 游戏象棋玩家格子y轴差值
 */
type GamePeiceGridDiffY = 9 | 0;
/**
 * 棋子PEN代码 小写表示黑方，大写表示红方
 *
 * 博客介绍
 * https://www.cnblogs.com/royhoo/p/6424395.html
 *
 * 规则介绍
 * https://www.xqbase.com/protocol/cchess_move.htm
 * https://www.xqbase.com/protocol/cchess_fen.htm
 *
 */
type PENPeiceNameCode = "K" | //帅
"A" | //士
"B" | //相
"N" | //马
"R" | //车
"C" | //炮
"P" | //兵
"k" | //将
"a" | //仕
"b" | //象
"n" | //馬
"r" | //車
"c" | //砲
"p";
type ParsePENStrData = {
    side: PieceSide;
    notEatRound?: string;
    round?: string;
    list: Array<PeicePosInfo>;
};
type PeicePosInfo = {
    side: PieceSide;
    name: ChessOfPeiceName;
    x: number;
    y: number;
};
/**
 * 更新结果
 */
type UpdateResult = UpdateFail | updateSuccess;
/**
 * 更新失败
 */
type UpdateFail = {
    /**
     * 更新失败
     */
    flag: false;
    /**
     * 更新失败信息
     */
    message: string;
};
/**
 * 更新成功
 */
type updateSuccess = {
    /**
    * 更新成功
    */
    flag: true;
    /**
     * 更新后是否需要 移动刷新布局
     *
     * `false` 表示 无回调函数 当前布局暂无移动
     *
     * `true` 表示 有回调函数`cb` 当前布局需要调用回调函数`cb()` 更新布局且游戏状态
     */
    move: boolean;
    /**
     * 更新成功后的回调函数
     */
    cb?: () => void;
};
type UpdateMoveCallback = (posPeice: ChessOfPeice, newPoint: Point) => void;

declare function parse_PEN_Str(penStr: string): ParsePENStrData;
declare function gen_PEN_Str(pl: PieceList, side: PieceSide): string;
declare function gen_PEN_Point_Str(p: Point | MovePoint | ChessOfPeice): string;
declare function diffPenStr(oldStr: string, newStr: string): {
    moveList: {
        point: Point;
        move: Point;
        side: PieceSide;
    }[];
    delList: PeicePosInfo[];
};
declare const initBoardPen = "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w";

type CTX = CanvasRenderingContext2D;
/**
 * promise返回的运动结果
 */
type MoveResultAsync = Promise<MoveResult>;
/**
 * 初始化游戏参数
 */
interface GameInfo {
    /**
     * 游戏窗口宽度大小
     * @defaultValue `800`
     */
    gameWidth?: number;
    /**
     * 游戏窗口高度大小
     * @defaultValue `800`
     */
    gameHeight?: number;
    /**
     * 游戏内边距大小距离棋盘
     * @defaultValue `20`
     */
    gamePadding?: number;
    /**
     * 画布
     */
    ctx?: CTX;
    /**
     * 画布缩放大小
     * @defaultValue `1`
     */
    scaleRatio?: number;
    /**
     * 棋子运动速度时长 毫秒单位
     * @defaultValue `200`
     */
    duration?: number;
    /**
     * 棋盘背景色
     * @defaultValue `#faebd7`
     */
    checkerboardBackground?: string;
    /**
     * 红棋子背景色
     * @defaultValue `#feeca0`
     */
    redPeiceBackground?: string;
    /**
     * 黑棋子背景色
     * @defaultValue `#fdec9e`
     */
    blackPeiceBackground?: string;
    /**
     * 可移动点 颜色
     * @defaultValue `#25dd2a`
     */
    movePointColor?: string;
    /**
     * 选中是否绘画可移动的点
     * @defaultValue `false`
     */
    drawMovePoint?: boolean;
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
    private ctx?;
    /**
     * 存放棋盘格子的所有坐标
     */
    private gridPostionList;
    /**
     * 棋子运动速度时长 毫秒单位
     */
    duration: number;
    private drawMovePoint;
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
     * 游戏运行报错事件列表
     */
    private errorEvents;
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
    /**
     * 动画方法
     */
    private animate;
    /**
     * 清除动画方法
     */
    private cancelAnimate;
    /**
     * 画布缩放大小
     * @defaultValue `1`
     */
    private scaleRatio;
    private movePointColor;
    /**
     * 上次移动点：棋盘上移动棋子移动前的位置坐标点
     */
    private lastMovePoint;
    constructor({ ctx, gameWidth, gameHeight, gamePadding, scaleRatio, duration, redPeiceBackground, blackPeiceBackground, checkerboardBackground, movePointColor, drawMovePoint }: GameInfo);
    /**
     * 设置游戏窗口 棋盘 棋子大小
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
    updateAsync(pos: Point, mov: Point | null, side: PieceSide, refreshCtx: boolean, moveCallback?: UpdateMoveCallback): Promise<UpdateResult>;
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
    update(pos: Point, mov: Point | null, side: PieceSide, post: boolean): UpdateResult;
    /**
     * 根据当前棋子状态绘画 棋盘状态 游戏数据 画出布局
     * @param ctx 画布
     */
    draw(ctx: CTX): void;
    /**
     * 画棋盘
     */
    private drawChessLine;
    /**
     * 根据移动方的描述文字来进行移动棋子
     * @param str 文字
     * @param side 移动方
     * @returns 移动结果
     */
    moveStr(str: string, side: PieceSide): UpdateResult;
    /**
     * 根据移动方的描述文字来进行移动棋子
     * @param str 文字
     * @param side 移动方
     * @param refreshCtx 是否每次移动都更新画布
     * @returns 移动结果
     */
    moveStrAsync(str: string, side: PieceSide, refreshCtx: boolean): Promise<UpdateResult>;
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
     * 更改当前走棋方
     * @param side 走棋方
     */
    changeCurrentPlaySide(side: PieceSide): void;
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
     * 判断敌方是否还有下一步走法 无走法就是绝杀
     * @param enemySide 敌方
     * @returns {boolean}
     */
    private checkEnemySideHasMovePoints;
    /**
     * 棋子运动前检查游戏状态是否可以运动
     * @returns 是否可以运动
     */
    checkGameState(): MoveResult;
    /**
     * 检查是否有画布 有会更新画布 否则不更新 报出错误
     */
    checkDraw(): void;
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
    /**
     * 获取游戏方
     */
    get currentGameSide(): PieceSide | null;
    set currentGameSide(val: any);
    /**
     * 获取当前存活的棋子列表
     */
    get currentLivePieceList(): PieceList;
    /**
     * 获取当前象棋绘制半径
     */
    get currentRadius(): number;
    getCurrentPenCode(side: PieceSide): string;
    on(e: "move", fn: MoveCallback): void;
    on(e: "moveFail", fn: MoveFailCallback): void;
    on(e: "log", fn: GameLogCallback): void;
    on(e: "over", fn: GameOverCallback): void;
    on(e: "error", fn: GameErrorCallback): void;
    removeEvent(e: "move", fn: MoveCallback): void;
    removeEvent(e: "moveFail", fn: MoveFailCallback): void;
    removeEvent(e: "log", fn: GameLogCallback): void;
    removeEvent(e: "over", fn: GameOverCallback): void;
    removeEvent(e: "error", fn: GameErrorCallback): void;
    /**
     * 设置当前存活棋子列表
     * @param pl 当前存活棋子列表
     */
    setLivePieceList(pl: PieceList): void;
    /**
     * 根据pen代码格式来设置当前棋盘
     * @param penCode
     *
     * 建议参考 文章 博客
     * 1. https://www.xqbase.com/protocol/cchess_fen.htm
     */
    setPenCodeList(penCode: string): void;
    /**
     * 绘画上次移动点
     */
    drawLastMovePoint(ctx: CTX): void;
}

export { CannonPiece, CheckPoint, ChessOfPeice, ChessOfPeiceMap, ChessOfPeiceName, ElephantPiece, Ep, GameErrorCallback, GameEventCallback, GameEventName, GameInfo, GameLogCallback, GameOverCallback, GamePeiceGridDiffX, GamePeiceGridDiffY, GameState, GeneralPiece, HorsePiece, KnightPiece, MoveCallback, MoveFail, MoveFailCallback, MovePoint, MovePointList, MoveResult, MoveResultAsync, MoveSuccess, Mp, PENPeiceNameCode, ParsePENStrData, PeicePosInfo, Piece, PieceInfo, PieceList, PieceSide, PieceSideCN, PieceSideMap, Point, RookPiece, SoldierPiece, SquarePoints, UpdateFail, UpdateMoveCallback, UpdateResult, chessOfPeiceMap, ZhChess as default, diffPenStr, gen_PEN_Point_Str, gen_PEN_Str, initBoardPen, parse_PEN_Str, peiceSideMap, updateSuccess };
