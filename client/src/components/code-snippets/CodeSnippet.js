import React from 'react'
import AceEditor from 'react-ace'

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
        fontSize={13}
        showPrintMargin={false}
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
