import { CHIPS, Match3Win, MIN_CLUSTER_SIZE } from "../models/BoardModel";
import { BaseComponent } from "./BaseComponent";

export class FindWinClustersComponent extends BaseComponent {
  public getWinClusters(model: CHIPS[][], width: number, height: number): Match3Win[] {
    const rows = height;
    const cols = width;
    const matches: Match3Win[] = [];

    for (let x = 0; x < cols; x++) {
      let count = 1;
      for (let y = 1; y < rows; y++) {
        if (model[x][y] === model[x][y - 1] && model[x][y] !== CHIPS.EMPTY) {
          count++;
        } else {
          if (count >= MIN_CLUSTER_SIZE) {
            const cluster = [];
            for (let k = 0; k < count; k++) {
              cluster.push({ y: y - 1 - k, x: x });
            }
            matches.push({ positions: cluster, id: model[x][y] });
          }
          count = 1;
        }
      }

      if (count >= MIN_CLUSTER_SIZE) {
        const cluster = [];
        for (let k = 0; k < count; k++) {
          cluster.push({ y: rows - 1 - k, x: x });
        }
        matches.push({ positions: cluster, id: model[x][rows - 1] });
      }
    }

    for (let y = 0; y < rows; y++) {
      let count = 1;
      for (let x = 1; x < cols; x++) {
        if (model[x][y] === model[x - 1][y] && model[x][y] !== CHIPS.EMPTY) {
          count++;
        } else {
          if (count >= MIN_CLUSTER_SIZE) {
            const cluster = [];
            for (let k = 0; k < count; k++) {
              cluster.push({ y: y, x: x - 1 - k });
            }

            matches.push({ positions: cluster, id: model[x][y] });
          }
          count = 1;
        }
      }

      if (count >= MIN_CLUSTER_SIZE) {
        const cluster = [];
        for (let k = 0; k < count; k++) {
          cluster.push({ y: y, x: cols - 1 - k });
        }
        matches.push({ positions: cluster, id: model[cols - 1][y] });
      }
    }

    return this._mergeOverlappingClusters(matches);
  }

  private _mergeOverlappingClusters(clusters: Match3Win[]): Match3Win[] {
    const merged: Match3Win[] = [];

    while (clusters.length > 0) {
      let cluster = clusters.pop()!;
      // let mergedSomething = false;

      for (let i = clusters.length - 1; i >= 0; i--) {
        if (clusters[i].positions.some(c1 => cluster.positions.some(c2 => c1.y === c2.y && c1.x === c2.x))) {
          cluster.positions = cluster.positions.concat(clusters[i].positions);
          clusters.splice(i, 1);
          // mergedSomething = true;
        }
      }

      merged.push(cluster);
    }

    return merged;
  }

  // public getWinClusters(model: CHIPS[][], width: number, height: number): Match3Win[] {
  //   const result: Match3Win[] = [];

  //   const visited: boolean[][] = Array.from({ length: width }, () =>
  //     Array(height).fill(false)
  //   );

  //   for (let x = 0; x < width; x++) {
  //     for (let y = 0; y < height; y++) {
  //       if (!visited[x][y]) {
  //         const cluster: Match3Win = { positions: [], id: CHIPS.EMPTY };
  //         this._floodFill(x, y, visited, model, model[x][y], cluster);

  //         if (cluster.positions.length >= MIN_CLUSTER_SIZE) {
  //           result.push(cluster);
  //         }
  //       }
  //     }
  //   }

  //   return result;
  // }

  // private _floodFill(
  //   x: number,
  //   y: number,
  //   visited: boolean[][],
  //   board: CHIPS[][],
  //   target: CHIPS,
  //   cluster: Match3Win
  // ): void {
  //   const width = board.length;
  //   const height = board[0].length;

  //   if (x < 0 || y < 0 || x >= width || y >= height) return;
  //   if (visited[x][y]) return;
  //   if (board[x][y] !== target || board[x][y] === CHIPS.EMPTY) return;

  //   visited[x][y] = true;
  //   cluster.positions.push({ x, y });
  //   cluster.id = target;

  //   this._floodFill(x + 1, y, visited, board, board[x][y], cluster);
  //   this._floodFill(x - 1, y, visited, board, board[x][y], cluster);
  //   this._floodFill(x, y + 1, visited, board, board[x][y], cluster);
  //   this._floodFill(x, y - 1, visited, board, board[x][y], cluster);
  // }
}