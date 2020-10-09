import Mount from './Mount'
import extend from 'lowscore/extend'

export default class HyperdomMount extends Mount {
  constructor (app: any, options?) {
    super()
    if (options && options.router) {
      options.router.reset()
    }

    const testDiv = this.containerElement()
    if (options && (options.hash || options.url) && options.router) {
      options.router.push(options.url || options.hash)
    }
    const hyperdom = require('hyperdom')
    hyperdom.append(testDiv, app, extend({ requestRender: setTimeout }, options))
  }
}