const program = require('commander')
const package = require('../../../package.json')
const runPull = require('./pull')

program
  .version(package.version)

program
  .parse(process.argv)

runPull(program)
