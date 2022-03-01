/**
 * 用于推送到github仓库
 */
const process = require('child_process')
const async = require('async')
const dayjs = require('dayjs')
const rollup = require('rollup')
const { inputOptions, outputOptions } = require('./rollup.config')
require('colors')

const startTime = Date.now()
const gitrepo = 'git@github.com:enjoy-network-tech/dooluu-jsbridge.git'

const shelljs = (sh, log, callback) => {
  if (typeof log === 'string') {
    console.log(
      dayjs().format('YYYY-MM-DD HH:mm:ss'),
      `[Shell Log]`.green,
      log
    )
  }

  process.exec(sh, (err,sto) => {
    if (err) {
      console.log(
        dayjs().format('YYYY-MM-DD HH:mm:ss'),
        `[Shell Log Error]`.red,
        err, sto
      )
      return
    }

    if (typeof log === 'string') {
      console.log(
        dayjs().format('YYYY-MM-DD HH:mm:ss'),
        `[Shell Log Success]`.green,
        log
      )
    }

    if (sto) {
      console.log(
        '\n'
        + sto
      )
    }
    callback()
  })
}

const build = async (next) => {
  const bundle = await rollup.rollup(inputOptions)

  await bundle.generate(outputOptions)

  await bundle.write(outputOptions)

  next()
}

async.waterfall([
  (next) => {
    console.log(
      '开始任务'.white.bgGreen,
      dayjs().format('YYYY-MM-DD HH:mm:ss')
    )
    shelljs('rm -rf .githubrepo', undefined, next)
  },

  next => {
    shelljs(`git clone ${ gitrepo } .githubrepo`, '创建文件夹', next)
  },

  next => {
    console.log(
      dayjs().format('YYYY-MM-DD HH:mm:ss'),
      `[Building]`.green,
    )
    build(next)
  },

  next => {
    shelljs(`cp -r README.md .githubrepo`, '拷贝文档', next)
  },

  next => {
    shelljs(`cp -r dist/index.d.ts .githubrepo/jsbridge.min.d.ts`, '拷贝d.ts', next)
  },
], function (err, sto) {
  if (err) {
    throw err
  }

  if (sto) {
    console.log(sto)
  }

  console.log(
    '任务完成'.bgGreen.white,
    `耗时：${ (Date.now() - startTime) / 1000 }s`
  )
})

module.exports = {
  shelljs,
}
