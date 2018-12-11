## What are computed datasets?

A computed dataset is like a regular dataset in almost every way, except instead of uploading data to them, you supply a code block that outputs a dataset.

We refer to these code blocks as transformations. Transformations can take any number of datasets you have access to as inputs (even other computed datasets) or none at all (your code block could access an API hosted elsewhere to fetch initial data). The output will be the dataset you create the transformation on.

## Python transformations

ADI currently supports making a computed dataset by supplying a Python code block. Other languages may be supported in the future. Here's what a transformation looks like on the platform:

![transformation-example](../images/transformation-example.png)

