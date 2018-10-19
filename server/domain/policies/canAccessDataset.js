const canViewDataset = (user, dataset) => {
  const orgIds = user.orgs.map(org => org.id)
  return dataset.owner && orgIds.includes(dataset.owner.id)
}

export default canViewDataset
