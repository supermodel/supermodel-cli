const jsYaml = require('js-yaml')
const superlib = require('superlib')
const fsUtils = require('./fsUtils')

function compileSchema(path) {
  if (!fsUtils.isDirectory(path)) {
    console.error(`Error: input must be a directory (${path})`)
    process.exit(0)
  }

  const inputFiles = fsUtils.readDirectory(path)
  const compiledSchema = { definitions: {} }
  
  inputFiles.forEach((file) => {
    try {
      const schema = superlib.yamlModel.readYAMLFile(file)
      const id = schema['$id']
      if (!id) {
        console.warn(`Warning: ignoring schema without id (${file})`)
        return
      }

      compiledSchema.definitions[id] = schema
    }
    catch (e) {
      console.error(`Error:\nin '${file}':`)
      if (e.message) console.error(e.message)
      else console.error(e)
      process.exit(1)
    }
  })

  return compiledSchema
}

module.exports = compileSchema