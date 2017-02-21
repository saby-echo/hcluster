import { BinaryHeap } from 'ts-binary-heap'

import { Matrix } from './matrix'

export class Sim {
    constructor(public val: number, public pId: number) { }
}

class Merge {
    constructor(public p1: number, public p2: number, public sim: number) { }
}

export interface Linkage {
    (sim1: Sim, sim2: Sim, result: Sim): void
}

const singleLinkage: Linkage = (sim1, sim2, result) => {
    result.val = Math.max(sim1.val, sim2.val)
}

const completeLinkage: Linkage = (sim1, sim2, result) => {
    result.val = Math.min(sim1.val, sim2.val)
}

const simCompare = (sim1: Sim, sim2: Sim) => sim1.val > sim2.val

const selectLinkage = (linkage: string) => {
    switch (linkage.toLowerCase()) {
        case 'single': return singleLinkage
        case 'complete': return completeLinkage
        default: throw new Error('NotImplemented!')
    }
}

export interface GetSim {
    (i: number, j: number): number
}

const initMatrixC = (N: number, getSim: GetSim) => { // O(N^2)
    const C = new Matrix<Sim>(N)

    for (let n = 0; n < N; n++) {
        for (let i = 0; i < N; i++) {
            const sim = new Sim(getSim(n, i), i)
            C.set(n, i, sim)
        }
    }
    return C
}

const initP = (N: number, C: Matrix<Sim>, P: BinaryHeap<Sim>[], active: boolean[]) => { // O(N^2*log(N))
    for (let n = 0; n < N; n++) {

        const clusterInfos = []

        for (let i = 0; i < N; i++) {
            if (n === i) { continue }

            clusterInfos.push(C.get(n, i))
        }

        active[n] = true

        P[n] = new BinaryHeap(simCompare, clusterInfos)
    }
}

const getNearestActiveClusters = (P: BinaryHeap<Sim>[], active: boolean[]) => { // O(N)
    let maxSimVal: number | null = null
    let k1: number | null = null
    let k2: number | null = null

    for (let i = 0; i < P.length; i++) {
        if (!active[i]) { continue }

        const cpSim = P[i].peek() // closest-point to point i

        if (cpSim == null) { throw new Error('Unreachable!') }

        if (maxSimVal != null && cpSim.val <= maxSimVal) { continue }

        maxSimVal = cpSim.val
        k1 = i
        k2 = cpSim.pId
    }

    if (maxSimVal === null || k1 === null || k2 === null) { throw new Error('Unreachable!') }

    return new Merge(k1, k2, maxSimVal)
}

const EmptyHeap = new BinaryHeap(simCompare)

const updateP = (
    N: number, C: Matrix<Sim>, P: BinaryHeap<Sim>[], active: boolean[],
    linkage: Linkage, k1: number, k2: number) => { // O(N*log(N))

    active[k2] = false
    P[k1] = new BinaryHeap(simCompare)
    P[k2] = EmptyHeap

    for (let i = 0; i < N; i++) {
        if (!active[i] || k1 === i) { continue }

        P[i].delete(C.get(i, k1))
        P[i].delete(C.get(i, k2))

        linkage(C.get(i, k1), C.get(i, k2), C.get(i, k1))
        P[i].add(C.get(i, k1))

        linkage(C.get(k1, i), C.get(k2, i), C.get(k1, i))
        P[k1].add(C.get(k1, i))
    }
}

export const calcCluster = (N: number, getSim: GetSim, linkage?: string, stopCondition?: (sim: number) => boolean) => {
    if (linkage == null) { linkage = 'single' }
    if (stopCondition == null) { stopCondition = () => false }

    const C = initMatrixC(N, getSim)

    const P = Array<BinaryHeap<Sim>>() // priority queues for each cluster sorted in decreasing order of similarity
    const active = Array<boolean>() // tracking active clusters

    initP(N, C, P, active)

    const combine = selectLinkage(linkage)
    const merges = Array<Merge>() // cluster-merges

    for (let k = 0; k < N - 1; k++) {
        const pair = getNearestActiveClusters(P, active)

        if (stopCondition(pair.sim)) { break }

        merges.push(pair)

        updateP(N, C, P, active, combine, pair.p1, pair.p2)
    }

    return merges.map(p => [p.p1, p.p2, p.sim])
}
