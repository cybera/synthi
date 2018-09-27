const canViewDataset = (user, dataset) => {
  return dataset.owner && user.id === dataset.owner.id
}

export default canViewDataset
