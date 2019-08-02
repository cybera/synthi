// Clear all Datasets, Transformations, and Columns
MATCH (n)
WHERE n:Dataset OR n:DatasetMetadata OR n:Column OR n:Transformation
DETACH DELETE n
