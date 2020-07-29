"use strict";
/*
 * @Author: Whzcorcd
 * @Date: 2020-07-29 13:55:48
 * @LastEditors: Wzhcorcd
 * @LastEditTime: 2020-07-29 17:25:15
 * @Description: file content
 */
Object.defineProperty(exports, "__esModule", { value: true });
var rrweb = require('rrweb');
var dayjs = require('dayjs');
var Hash = require('object-hash');
var Recorder = /** @class */ (function () {
    function Recorder(uin, project, url, option) {
        if (uin === void 0) { uin = 0; }
        if (project === void 0) { project = 'example'; }
        if (url === void 0) { url = ''; }
        var original = {
            speed: 1,
            root: document.body,
            loadTimeout: 0,
            skipInactive: false,
            showWarning: true,
            showDebug: false,
        };
        this.uin = uin;
        this.project = project;
        this.url = url;
        this.option = Object.assign({}, original, option);
        this.events = [];
        this.startTime = 0;
        this.endTime = 0;
        this.session = '';
        // 初始化
        this.init();
    }
    Recorder.prototype.init = function () {
        this.setSession();
    };
    Recorder.prototype.record = function () {
        var _this = this;
        rrweb.record({
            emit: function (event, checkout) {
                if (checkout) {
                    _this.export(_this.url);
                }
                var data = Object.assign({}, event, {
                    uin: _this.uin,
                    project: _this.project,
                    session: _this.session,
                });
                _this.events.push(data);
            },
            checkoutEveryNms: 1000 * 60 * 1,
        });
    };
    Recorder.prototype.stop = function () {
        rrweb.record({
        // nothing
        });
    };
    Recorder.prototype.restore = function (binaryString) {
        var pako = require('pako');
        return JSON.parse(pako.inflate(binaryString, { to: 'string' }));
    };
    Recorder.prototype.replay = function () {
        var replayer = new rrweb.Replayer(this.events, this.option);
        replayer.play();
    };
    Recorder.prototype.export = function (url) {
        if (this.startTime)
            this.endTime = dayjs().unix();
        var data = this.minimize(this.events);
        var params = {
            project: this.project,
            uin: this.uin,
            session: this.session,
            data: data,
            startTime: this.startTime,
            endTime: this.endTime,
        };
        // 重置 session
        this.setSession();
        // 尝试使用 sendbeacon
        if (navigator.sendBeacon && data.length < 65000) {
            var headers = {
                type: 'application/json',
            };
            var blob = new Blob([JSON.stringify(params)], headers);
            var status_1 = navigator.sendBeacon(url, blob);
            status_1 && console.error(status_1);
            return;
        }
        fetch(url, {
            method: 'POST',
            body: JSON.stringify(params),
            cache: 'no-cache',
            headers: new Headers({
                'Content-Type': 'application/json',
            }),
            mode: 'cors',
        })
            .then(function (response) {
            return response.json();
        })
            .catch(function (e) {
            console.error(e);
        });
    };
    Recorder.prototype.setSession = function () {
        var timestamp = dayjs().format('{YYYY} MM-DDTHH:mm:ss');
        this.session = Hash({ timestamp: timestamp });
        this.startTime = dayjs().unix();
        this.events = [];
    };
    Recorder.prototype.minimize = function (source) {
        var pako = require('pako');
        return pako.deflate(JSON.stringify(source), { to: 'string' });
    };
    return Recorder;
}());
exports.default = Recorder;
