import React from 'react'
import AceEditor from 'react-ace'

import Paper from '@material-ui/core/Paper'
import { withStyles } from '@material-ui/core/styles'
import { ToggleVisibility } from '../../layout'

const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent: 'left',
    flexWrap: 'wrap',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
})

const MUIEditor = (props) => {
  const {
    dataset,
    classes,
    code,
    onChange,
    readOnly
  } = props

  return (
    <Paper className={classes.root}>
      <AceEditor
        mode="python"
        theme="xcode"
        onChange={onChange}
        name={`transformation-editor-${dataset.name}`}
        editorProps={{ $blockScrolling: true }}
        fontSize={14}
        showPrintMargin={!readOnly}
        showGutter
        highlightActiveLine={!readOnly}
        width="100%"
        height="200px"
        value={code}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: false,
          showLineNumbers: true,
          tabSize: 2,
        }}
        readOnly={readOnly}
      />
    </Paper>
  )
}

const StyledMUIEditor = withStyles(styles)(MUIEditor)

class TransformationEditor extends React.Component {
  state = {
    code: null
  }

  constructor(props) {
    super()

    this.handleSave = props.handleSave

    if(!this.handleSave) {
      this.handleSave = (code) => {
        console.log("By default, this just logs code. Pass in a handleSave(code) function as a prop.")
        console.log(code)
      }
    }
  }

  static getDerivedStateFromProps(props, state) {
    const { dataset } = props
    const { uuid } = dataset

    if (state.uuid !== uuid || state.code == null) {
      let code = ""
      if (dataset.inputTransformation) {
        code = dataset.inputTransformation.code
      }
      return { uuid, code }
    } else {
      return null
    }
  }

  onChange = (newValue) => {
    this.setState({ code: newValue })
  }

  save() {
    this.handleSave(this.state.code)
  }

  render() {
    const { dataset } = this.props
    const { inputTransformation } = dataset
    const { error } = inputTransformation || {}

    return (
      <div>
        <StyledMUIEditor {...this.props} code={this.state.code} onChange={this.onChange}/>
        <ToggleVisibility visible={error} key={dataset.uuid}>
          <div style={{ color: 'red', marginBottom: 10 }}><b>Transformation Code Error:</b> {error}</div>
        </ToggleVisibility>
      </div>
    )
  }
}

export default TransformationEditor