import { MIN_CLUSTER_SIZE } from "../GameConfig";
import { CHIPS, Match3Win } from "./BoardComponent";

export class FindWinClustersComponent {
  public getWinClusters(model: CHIPS[][], width: number, height: number): Match3Win[] {
    const result: Match3Win[] = [];

    const visited: boolean[][] = Array.from({ length: width }, () =>
      Array(height).fill(false)
    );

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (!visited[x][y]) {
          const cluster: Match3Win = { positions: [], id: CHIPS.EMPTY };
          this._floodFill(x, y, visited, model, model[x][y], cluster);

          if (cluster.positions.length >= MIN_CLUSTER_SIZE) {
            result.push(cluster);
          }
        }
      }
    }

    return result;
  }

  private _floodFill(
    x: number,
    y: number,
    visited: boolean[][],
    board: CHIPS[][],
    target: CHIPS,
    cluster: Match3Win
  ): void {
    const width = board.length;
    const height = board[0].length;

    if (x < 0 || y < 0 || x >= width || y >= height) return;
    if (visited[x][y]) return;
    if (board[x][y] !== target || board[x][y] === CHIPS.EMPTY) return;

    visited[x][y] = true;
    cluster.positions.push({ x, y });
    cluster.id = target;

    this._floodFill(x + 1, y, visited, board, board[x][y], cluster);
    this._floodFill(x - 1, y, visited, board, board[x][y], cluster);
    this._floodFill(x, y + 1, visited, board, board[x][y], cluster);
    this._floodFill(x, y - 1, visited, board, board[x][y], cluster);
  }
}