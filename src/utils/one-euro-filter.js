// modified version of 3846masa/one-euro-filter.js
// https://gist.github.com/3846masa/5628f711e86fd62bea56b18e32177c60


function addLandmarks(lmsA, lmsB) {
    const sum = []
    for (let landmarkIdx = 0; landmarkIdx < lmsA.length; landmarkIdx++) {
        const lmA = lmsA[landmarkIdx]
        const lmB = lmsB[landmarkIdx]
        sum.push({
            'x': lmA.x + lmB.x,
            'y': lmA.y + lmB.y,
            'z': lmA.z + lmB.z
        })
    }
    return sum
}


function subLandmarks(lmsA, lmsB) {
    const diff = []
    for (let landmarkIdx = 0; landmarkIdx < lmsA.length; landmarkIdx++) {
        const lmA = lmsA[landmarkIdx]
        const lmB = lmsB[landmarkIdx]
        diff.push({
            'x': lmA.x - lmB.x,
            'y': lmA.y - lmB.y,
            'z': lmA.z - lmB.z
        })
    }
    return diff
}


function scaleLandmarks(lms, scalar) {
    const scaled = []
    for (const lm of lms) {
        scaled.push({
            'x': lm.x * scalar, 
            'y': lm.y * scalar, 
            'z': lm.z * scalar
        })
    }
    return scaled
}


function absLandmarks(lms) {
    let abs = 0
    for (const lm of lms) {
        abs += Math.abs(lm.x)
        abs += Math.abs(lm.y)
        abs += Math.abs(lm.z)
    }
    return abs
}


class LowPassFilter {
    constructor(alpha) {
        this.setAlpha(alpha)
        this.y = null
        this.s = null
    }

    setAlpha(alpha) {
        if (alpha <= 0 || alpha > 1.0) {
            throw new Error()
        }
        this.alpha = alpha
    }

    filter(value, alpha) {
        if (alpha) {
            this.setAlpha(alpha)
        }
        let s
        if (this.y) {
            s = addLandmarks(scaleLandmarks(value, this.alpha), scaleLandmarks(this.s, 1.0 - this.alpha))
        } else {
            s = value
        }
        this.y = value
        this.s = s
        return s
    }

    lastValue() {
        return this.y
    }
}


export default class OneEuroFilter {
    constructor(nLandmarks, minCutOff=1.0, beta=0.0, dCutOff=1.0) {
        if (minCutOff <= 0 || dCutOff <= 0) {
            throw new Error()
        }
        this.minCutOff = minCutOff
        this.beta = beta
        this.dCutOff = dCutOff
        this.x = new LowPassFilter(this.alpha(this.minCutOff))
        this.dx = new LowPassFilter(this.alpha(this.dCutOff))
        this.lasttime = null
        this.freq = 15

        this.zeroLandmarks = []
        for (let landmarkIdx = 0; landmarkIdx < nLandmarks; landmarkIdx++) {
            this.zeroLandmarks.push({
                'x': 0,
                'y': 0,
                'z': 0
            })
        }
    }

    alpha(cutOff) {
        const te = 1.0 / this.freq
        const tau = 1.0 / (2 * Math.PI * cutOff)
        return 1.0 / (1.0 + tau / te)
    }

    filter(x, timestamp=null) {
        if (this.lasttime && timestamp) {
            this.freq = 1.0 / (timestamp - this.lasttime)
        }
        this.lasttime = timestamp
        const prevX = this.x.lastValue()
        const dx = (prevX) ? scaleLandmarks(subLandmarks(x, prevX), this.freq) : this.zeroLandmarks
        const edx = this.dx.filter(dx, this.alpha(this.dCutOff))
        const cutOff = this.minCutOff + this.beta * absLandmarks(edx)
        return this.x.filter(x, this.alpha(cutOff))
    }
}
