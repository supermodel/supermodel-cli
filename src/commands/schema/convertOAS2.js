const jsYaml = require('js-yaml')
const fs = require('fs')
const superlib = require('superlib')
const fsUtils = require('../../lib/fsUtils')
const compileSchema = require('../../lib/compileSchema')

const GENERATED_BY_SUPERMODEL = `
# DO NOT EDIT
# This definitions section is automatically generated by supermodel.io
#
# http://supermodel.io
# https://github.com/supermodel/supermodel-cli
`
// TODO: Break down the spaghetti
function runConvertToOAS2(path, oas2Path) {
  try {
    let schemaObject
    if (fsUtils.isDirectory(path)) {
      schemaObject = compileSchema(path)
    }
    else {
      schemaObject = superlib.yamlModel.readYAMLFile(path)
    }
    
    const oas2SchemaObject = superlib.convertToOAS2(schemaObject)
    const oas2definitions = `${GENERATED_BY_SUPERMODEL}${jsYaml.safeDump(oas2SchemaObject)}`
    if (oas2Path) {
      if (!fs.existsSync(oas2Path)) {
        throw new Error(`Output OAS2 file doesn't exists (${oas2Path})`)
      }

      // Read OAS2 file as string, to preserve formatting
      let oas2Content = fs.readFileSync(oas2Path).toString()
      if (!oas2Content) {
        throw new Error(`Unable to read the output OAS2 file (${oas2Path})`)
      }
      // Remove any previous comments
      oas2Content = oas2Content.replace(GENERATED_BY_SUPERMODEL, '\n')

      const definitionRegex = /\ndefinitions:[^]*$/ // NOTE: replace everything from the definitions to the end of file
      if (!oas2Content.match(definitionRegex)) {
        // append new definitions section if none exists
        oas2Content = `${oas2Content}${oas2definitions}\n`
      }
      else {
        oas2Content = oas2Content.replace(definitionRegex, oas2definitions)
      }

      fs.writeFileSync(oas2Path, oas2Content)
      console.info(`${oas2Path} updated.`)
    }
    else {
      console.log(oas2definitions)
    }
  }
  catch (e) {
    if (e.message) console.error(e)
    else console.error(e)
    process.exit(1)
  }
}

module.exports = runConvertToOAS2
