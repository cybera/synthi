import React from 'react'
import AceEditor from 'react-ace'
import brace from 'brace'
import 'brace/ext/language_tools'
import 'brace/mode/python'
import 'brace/theme/xcode'

function onChange(newValue) {
  console.log('change',newValue);
}

const TransformationEditor = (props) => {
  const { dataset } = props

  return (
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
      value={dataset.inputTransformation.code}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: false,
        showLineNumbers: true,
        tabSize: 2,
      }}
    />
  )
}

export default TransformationEditor