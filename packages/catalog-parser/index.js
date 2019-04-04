
const tab2space = 4
function parseLine(line, options) {
  line = line.replace(/^([\s\t])*/g, function (match) {
    return match.replace(/\t/g, tab2space)
  })
  var reg = /^(\s*)([^\s]+)/
  var $$ = reg.exec(line)
  if (!$$[1]) {
    return {
      indent: 0,
      value: line
    }
  } else {
    return {
      indent: $$[1].length,
      value: $$[2]
    }
  }
}

function catalogParser(text, options) {
  var lines = text.split('\n')
  var stack = []
  var result = []
  var currentIndent = 0
  var indentTokenCaches = {}

  lines.forEach(line => {
    var currentLine = parseLine(line, options)
    if (currentLine.indent === currentIndent) {
      result.push(currentLine)
    } else if (currentLine.indent > currentIndent) {
      currentIndent = currentLine.indent
      stack.push(currentLine)
    } else if (indentTokenCaches[currentLine.indent]) {
      let token = stack.pop()
      while (token && token.indent > currentLine.indent) {
        currentIndent = token.indent
        result.push(token)
        token = stack.pop()
      }

      if (token) {
        stack.push(token)
        stack.push(currentLine)
      } else {
        result.push(currentLine)
      }
    } else {
      throw new Error(`error indent: ${line}`)
    }
    indentTokenCaches[currentLine.indent] = true
  })

  return result
}

module.exports = catalogParser

