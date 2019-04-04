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

function parseLines(lines, options) {
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
      result.push(currentLine)
    } else if (indentTokenCaches[currentLine.indent]) {
      let token = stack.pop()
      while (token && token.indent > currentLine.indent) {
        currentIndent = token.indent
        token = stack.pop()
      }

      if (token) {
        stack.push(token)
        stack.push(currentLine)
        result.push(currentLine)
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

function markLevelForLines(linesInfo) {
  var curLevel = 0
  var root = []
  var curNode = null
  var queue = []

  linesInfo.forEach(lineInfo => {
    if (lineInfo.indent === 0) {
      root.push(lineInfo)
    } else if (lineInfo.indent <= curNode.indent) {
      while ((curLevel = queue.pop()) && lineInfo.indent <= curLevel.indent) {
      }
      queue.push(curLevel)
      curLevel.children = curLevel.children || []
      curLevel.children.push(lineInfo)
    } else if (lineInfo.indent > curNode.indent) {
      curNode.children = curNode.children || []
      curNode.children.push(lineInfo)
    }
    curNode = lineInfo
    queue.push(lineInfo)
  })

  return root
}

function catalogParser(text, options) {
  var lines = text.split('\n')
  var linesInfo = parseLines(lines)
  console.log(linesInfo)
  return markLevelForLines(linesInfo)
}

module.exports = catalogParser

