const canViewDataset = (user, dataset) => {
  if (!user) return false

  const orgIds = user.orgs.map(org => org.id)
  return dataset.owner && orgIds.includes(dataset.owner.id)
}

export default canViewDataset
