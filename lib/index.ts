/*
 * @Author: Whzcorcd
 * @Date: 2020-07-29 13:55:48
 * @LastEditors: Wzhcorcd
 * @LastEditTime: 2020-07-29 17:25:15
 * @Description: file content
 */

const rrweb = require('rrweb')
const dayjs = require('dayjs')
const Hash = require('object-hash')

interface IRecorder {
  readonly uin: number // uin
  readonly project: string //项目名称
  readonly url: string //提交域名
  readonly option: object //配置
}

class Recorder implements IRecorder {
  uin: number
  project: string
  url: string
  option: object

  private events: any[] //原始事件记录数组
  private startTime: number // 开始时间戳
  private endTime: number // 结束时间戳
  private session: string // 分片唯一标识

  constructor(
    uin: number = 0,
    project: string = 'example',
    url: string = '',
    option: object
  ) {
    const original = {
      speed: 1, // 回放倍速
      root: document.body, // 回放时使用的 HTML 元素
      loadTimeout: 0, // 加载异步样式表的超时时长
      skipInactive: false, // 是否快速跳过无用户操作的阶段
      showWarning: true, // 是否在回放过程中打印警告信息
      showDebug: false, // 是否在回放过程中打印 debug 信息
    }

    this.uin = uin
    this.project = project
    this.url = url
    this.option = Object.assign({}, original, option)

    this.events = []
    this.startTime = 0
    this.endTime = 0
    this.session = ''

    // 初始化
    this.init()
  }

  init(): void {
    this.setSession()
  }

  record(): void {
    const _this = this
    rrweb.record({
      emit(event: object, checkout: boolean) {
        if (checkout) {
          _this.export(_this.url)
        }
        const data = Object.assign({}, event, {
          uin: _this.uin,
          project: _this.project,
          session: _this.session,
        })
        _this.events.push(data)
      },
      checkoutEveryNms: 1000 * 60 * 1, // 1 minutes
    })
  }

  stop(): void {
    rrweb.record({
      // nothing
    })
  }

  restore(binaryString: string): object {
    const pako = require('pako')
    return JSON.parse(pako.inflate(binaryString, { to: 'string' }))
  }

  replay(): void {
    const replayer = new rrweb.Replayer(this.events, this.option)
    replayer.play()
  }

  export(url: string): void {
    if (this.startTime) this.endTime = dayjs().unix()

    const data = this.minimize(this.events)
    const params = {
      project: this.project,
      uin: this.uin,
      session: this.session,
      data: data,
      startTime: this.startTime,
      endTime: this.endTime,
    }

    // 重置 session
    this.setSession()

    // 尝试使用 sendbeacon
    if (navigator.sendBeacon && (<string>data).length < 65000) {
      const headers = {
        type: 'application/json',
      }
      const blob = new Blob([JSON.stringify(params)], headers)
      const status = navigator.sendBeacon(url, blob)
      status && console.error(status)
      return
    }

    fetch(url, {
      method: 'POST',
      body: JSON.stringify(params),
      cache: 'no-cache',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      mode: 'cors', // no-cors, cors, *same-origin
    })
      .then(response => {
        return response.json()
      })
      .catch(e => {
        console.error(e)
      })
  }

  private setSession(): void {
    const timestamp: string = dayjs().format('{YYYY} MM-DDTHH:mm:ss')
    this.session = Hash({ timestamp: timestamp })
    this.startTime = dayjs().unix()
    this.events = []
  }

  private minimize(source: any): string {
    const pako = require('pako')
    return pako.deflate(JSON.stringify(source), { to: 'string' })
  }
}

export default Recorder
