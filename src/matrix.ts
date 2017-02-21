export class Matrix<T> {
    arr: T[][] = []

    constructor(n: number) {
        this.arr = []
        for (let i = 0; i < n; i++) {
            this.arr[i] = []
        }
    }

    set(i: number, j: number, val: T) {
        this.arr[i][j] = val
    }

    get(i: number, j: number) {
        return this.arr[i][j]
    }
}
