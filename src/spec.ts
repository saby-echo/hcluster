import test from 'ava'

import { calcCluster } from './index'

test('symmetric-single-1', t => {

    const distMat = [
        [0, 1, 2, 3, 4],
        [1, 0, 3, 4, 5],
        [2, 3, 0, 5, 6],
        [3, 4, 5, 0, 7],
        [4, 5, 6, 7, 0]
    ]

    const getSim = (i: number, j: number) => -distMat[i][j]

    const merges = calcCluster(5, getSim, 'single').map(([p1, p2]) => [p1, p2])

    t.deepEqual(merges, [[0, 1], [0, 2], [0, 3], [0, 4]])
})

test('symmetric-single-2', t => {

    const distMat = [
        [0, 1, 2, 3, 4],
        [1, 0, 3, 1, 5],
        [2, 3, 0, 5, 6],
        [3, 1, 5, 0, 7],
        [4, 5, 6, 7, 0]
    ]

    const getSim = (i: number, j: number) => -distMat[i][j]

    const merges = calcCluster(5, getSim, 'single').map(([p1, p2]) => [p1, p2])

    t.deepEqual(merges, [[0, 1], [0, 3], [0, 2], [0, 4]])
})

test('symmetric-complete-1', t => {

    const distMat = [
        [0, 1, 2, 3, 4],
        [1, 0, 3, 1, 5],
        [2, 3, 0, 5, 6],
        [3, 1, 5, 0, 7],
        [4, 5, 6, 7, 0]
    ]

    const getSim = (i: number, j: number) => -distMat[i][j]

    const merges = calcCluster(5, getSim, 'complete').map(([p1, p2]) => [p1, p2])

    t.deepEqual(merges, [[0, 1], [0, 2], [0, 3], [0, 4]])
})
