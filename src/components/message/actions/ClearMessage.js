import Action from '../../../core/Action'

export default class ClearMessage extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (msgObj) {
    this._registrar.clear(msgObj)
  }
}
