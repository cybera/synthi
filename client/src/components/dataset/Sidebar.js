import React, { useState, useContext } from 'react'

import { makeStyles } from '@material-ui/styles'

import { SearchBar } from './list/search'
import NewDatasetButton from './NewDatasetButton'
import { DatasetList } from './list'
import NavigationContext from '../../contexts/NavigationContext'

const useStyles = makeStyles(() => ({
  searchHeader: {

  },
}))

const DatasetSidebar = () => {
  const [searchString, setSearchString] = useState(undefined)
  const navigation = useContext(NavigationContext)
  const classes = useStyles()

  return (
    <>
      <div className={classes.searchHeader}>
        <SearchBar
          onChange={(value) => setSearchString(value)}
          onCancelSearch={() => setSearchString(undefined)}
        />
        <NewDatasetButton />
      </div>
      <DatasetList searchString={searchString} organization={{ uuid: navigation.currentOrg }} />
    </>
  )
}

export default DatasetSidebar
