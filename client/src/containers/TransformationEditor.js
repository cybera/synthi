import React from 'react'
import AceEditor from 'react-ace'
import brace from 'brace'
import 'brace/ext/language_tools'
import 'brace/mode/python'
import 'brace/theme/xcode'

import Paper from '@material-ui/core/Paper'
import { withStyles } from 'material-ui/styles'

const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent: 'left',
    flexWrap: 'wrap',
    padding: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2
  }
})


function onChange(newValue) {
  console.log('change',newValue);
}

const TransformationEditor = (props) => {
  const { dataset, classes } = props

  return (
    <Paper className={classes.root}>
      <AceEditor
        mode="python"
        theme="xcode"
        onChange={onChange}
        name={`transformation-editor-${dataset.name}`}
        editorProps={{$blockScrolling: true}}
        fontSize={14}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        width="100%"
        height="200px"
        value={dataset.inputTransformation.code}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: false,
          showLineNumbers: true,
          tabSize: 2,
        }}
      />
    </Paper>
  )
}

export default withStyles(styles)(TransformationEditor)