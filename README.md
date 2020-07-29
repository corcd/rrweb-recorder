<!--
 * @Author: Whzcorcd
 * @Date: 2020-07-29 15:08:24
 * @LastEditors: Wzhcorcd
 * @LastEditTime: 2020-07-29 17:26:33
 * @Description: file content
-->

# rrweb-recorder

An automated capture reporting tool based on the RRweb open-source project

New matched server-side: [https://github.com/corcd/egg-rrweb-server]()

Old matched server-side: [https://github.com/corcd/rrweb-server]()

## Install

### NPM

```bash
npm install rrweb-recorder --save
yarn add rrweb-recorder
```

```javascript
import Recorder from 'rrweb-recorder'
```

## Usage

```javascript
import Recorder from 'rrweb-recorder'

const Recorder = new Recorder(uin, 'xxxx', 'url')
```

### record

```javascript
Recorder.record()
```

### stop

```javascript
Recorder.stop()
```

### export

```javascript
Recorder.export('#url')
```

### restore

```javascript
Recorder.restore('#binaryString')
```

### replay

```javascript
Recorder.replay()
```

## LICENSE

ISC
