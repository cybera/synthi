const canDeleteDataset = (user, dataset) => {
  return dataset.owner && user.id === dataset.owner.id
}

export default canDeleteDataset
