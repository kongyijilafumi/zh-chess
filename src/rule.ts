import { MoveResult } from "./types";

export const moveFailMessage: () => MoveResult = () => ({ flag: false, message: "走法错误：移动位置不符合规则" })