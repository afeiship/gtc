# gtc
> Gitlab trigger cli.

[![version][version-image]][version-url]
[![license][license-image]][license-url]
[![size][size-image]][size-url]
[![download][download-image]][download-url]

![snapshot](https://tva1.sinaimg.cn/large/e6c9d24egy1h34ig76g3wj20pw07gwf6.jpg)

## installation
```shell
# public
npm i -g @jswork/gtc

# private
git clone https://github.com/afeiship/gtc.git
cd gtc
npm i && npm link
```

## usage
~~~
Usage: gtc [options]

Options:
  -V, --version       output the version number
  -d, --debug         Only show cmds, but not clean.
  -u, --check-update  Check if has new udpate.
  -i, --init          Add gtc config to package.json.
  -h, --help          display help for command
~~~

## license
Code released under [the MIT license](https://github.com/afeiship/gtc/blob/master/LICENSE.txt).

[version-image]: https://img.shields.io/npm/v/@jswork/gtc
[version-url]: https://npmjs.org/package/@jswork/gtc

[license-image]: https://img.shields.io/npm/l/@jswork/gtc
[license-url]: https://github.com/afeiship/gtc/blob/master/LICENSE.txt

[size-image]: https://img.shields.io/bundlephobia/minzip/@jswork/gtc
[size-url]: https://github.com/afeiship/gtc/blob/master/dist/gtc.min.js

[download-image]: https://img.shields.io/npm/dm/@jswork/gtc
[download-url]: https://www.npmjs.com/package/@jswork/gtc
