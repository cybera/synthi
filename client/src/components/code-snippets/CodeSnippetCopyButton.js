import React from 'react'
import IconButton from '@material-ui/core/IconButton'
import CopyIcon from '@material-ui/icons/FileCopy'

const copyToClipboard = (code) => {
  const el = document.createElement('textarea');
  el.value = code;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

const CodeSnippetCopyButton = (props) => {
  const { code } = props

  return (
    <IconButton aria-label="Delete" color="primary" onClick={() => copyToClipboard(code)}>
      <CopyIcon />
    </IconButton>
  )
}

export default CodeSnippetCopyButton
