import React from 'react'
import AceEditor from 'react-ace'

import brace from 'brace'
import 'brace/ext/language_tools'
import 'brace/mode/python'
import 'brace/mode/sh'
import 'brace/mode/r'
import 'brace/theme/xcode'

import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  root: {
    marginTop: 20,
    marginBottom: 40
  }
})

const CodeSnippet = (props) => {
  const { language, code, classes } = props
  const lineCount = code.split('\n').length

  return (
    <div className={classes.root}>
      <AceEditor
        mode={language}
        theme="xcode"
        name={`code-snippet-${language}`}
        editorProps={{$blockScrolling: true}}
        readOnly
        fontSize={14}
        showPrintMargin={true}
        showGutter={false}
        width="100%"
        maxLines={lineCount}
        highlightActiveLine={false}
        value={code}
        setOptions={{
          tabSize: 2,
        }}
      />
    </div>
  )
}

export default withStyles(styles)(CodeSnippet)
