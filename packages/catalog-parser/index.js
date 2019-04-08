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
    if (!line.trim()) return

    var currentLine = parseLine(line, options)
    if (currentLine.indent === currentIndent) {
      // result.push(currentLine)
    } else if (currentLine.indent > currentIndent) {
      stack.push(currentLine)
    } else if (indentTokenCaches[currentLine.indent]) {
      let token
      while ((token = stack.pop()) && token.indent > currentLine.indent) {
      }

      if (token) {
        stack.push(token)
        stack.push(currentLine)
      }
    } else {
      throw new Error(`error indent: ${line}`)
    }

    if (currentLine.indent === 0) indentTokenCaches = {}
    result.push(currentLine)
    currentIndent = currentLine.indent
    indentTokenCaches[currentLine.indent] = true
  })

  return result
}


function wraplineIntoNode(line) {
  const value = line.value
  var lastIndex = value.lastIndexOf(':')
  var node = {}

  if (lastIndex === -1) {
    node.title = value
  } else {
    node.title = value.substring(0, lastIndex).trim()
    let resourceId = value.substring(lastIndex + 1).trim()
    let reg = /<(\w+)>/
    if (reg.test(resourceId)) {
      resourceId = reg.exec(resourceId)[1]
      node.nested = true
    }
    node.resourceId = resourceId
  }
  return node
}

function transformLinesToTree(linesInfo) {
  var curLevel = 0
  var root = []
  var curNode = null
  var queue = []

  function pushChild(curLevel, lineInfo) {
    curLevel.node.children = curLevel.node.children || []
    curLevel.node.children.push(lineInfo.node)
  }

  linesInfo.forEach(lineInfo => {
    lineInfo.node = wraplineIntoNode(lineInfo)
    if (lineInfo.indent === 0) {
      root.push(lineInfo.node)
    } else if (lineInfo.indent <= curNode.indent) {
      while ((curLevel = queue.pop()) && lineInfo.indent <= curLevel.indent) {
      }
      queue.push(curLevel)
      pushChild(curLevel, lineInfo)
    } else if (lineInfo.indent > curNode.indent) {
      pushChild(curNode, lineInfo)
    }
    curNode = lineInfo
    queue.push(lineInfo)
  })

  return root
}

function catalogParser(text, options) {
  var lines = text.split('\n')
  var linesInfo = parseLines(lines)
  return transformLinesToTree(linesInfo)
}

module.exports = catalogParser

