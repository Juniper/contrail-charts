import _ from 'lodash'
import {quadtree} from 'd3-quadtree'
import {max} from 'd3-array'
/**
 * Clusterize overlapping shapes
 * Works with 2D array
 * Shapes are considered rectangles
 * TODO operate on width and height instead of halves
 */
export default class Cluster {
  x (getX) {
    this._getX = getX
    return this
  }

  y (getY) {
    this._getY = getY
    return this
  }

  data (data) {
    this._overlapping = undefined
    this._buckets = undefined

    this._data = data
    this._quadtree = quadtree()
      .x(this._getX)
      .y(this._getY)
      .addAll(data)
    this._maxW = max(data, d => d.halfWidth)
    this._maxH = max(data, d => d.halfHeight)

    return this
  }
  /**
   * @return {Array} of points which overlaps with others
   */
  overlapping () {
    if (this._overlapping) return this._overlapping
    else this._overlapping = []

    _.each(this._data, point => {
      // TODO add option to set modify or not original data array
      point.overlap = this._collisionDetection(point)
    })
    _.each(this._data, d => {
      if (d.overlap) {
        _.each(d.overlap, d => {
          // TODO some overlapping nodes are not marked both
          if (d.overlap && !this._overlapping.includes(d)) this._overlapping.push(d)
        })
      }
    })
    return this._overlapping
  }
  /** Aggregates points into bucket points
   * Minimize amount of bucketized nodes
   * @return {Array} bucket points
   */
  buckets () {
    if (this._buckets) return this._buckets
    else this._buckets = []
    if (_.isEmpty(this.overlapping())) return []

    // Maximize the number of points in the bucket
    // this will make some points overlapping with multiple other nodes alone
    // as they will not be included to bigger buckets starting with the root node with which there is no overlap
    let toBuckets = _.sortBy(this.overlapping(), d => d.overlap.length)
    do {
      const root = toBuckets.pop()

      // add to current bucket points which are not added to other buckets
      const bucket = _.filter(root.overlap, d => {
        const index = toBuckets.indexOf(d)
        if (index < 0) return
        return toBuckets.splice(index, 1)[0]
      })
      if (!bucket.length) continue
      this._buckets.push({
        // TODO position bucket point at the center of aggregated points
        x: root.x,
        y: root.y,
        // TODO calculate halfWidth and halfHeight based on aggregated points
        bucket: [root, ...bucket],
      })
    } while (toBuckets.length)
    return this._buckets
  }
  /**
   * Find the nodes within the specified rectangle.
   * @param {Object} p point specified by two points
   */
  _collisionDetection (p) {
    const x0 = p.x - p.halfWidth
    const y0 = p.y - p.halfHeight
    const x3 = p.x + p.halfWidth
    const y3 = p.y + p.halfHeight
    const collided = []
    this._quadtree.visit((node, x1, y1, x2, y2) => {
      if (!node.length) {
        do {
          const d = node.data
          if ((d.x + d.halfWidth >= x0) && (d.x - d.halfWidth < x3) && (d.y + d.halfHeight >= y0) && (d.y - d.halfHeight < y3)) {
            if (d !== p) collided.push(d)
          }
          node = node.next
        } while (node)
      }
      return x1 - this._maxW >= x3 || y1 - this._maxH >= y3 || x2 + this._maxW < x0 || y2 + this._maxH < y0
    })
    return collided.length ? collided : false
  }
}
