# Transformations in ADI

This document will guide you through the process of creating your own transformations on data and storing them on the ADI system.

## Vision of Transformation Functionality
TODO
## Immediate Vision vs. Long Term Vision
TODO
### Uploading Via the Web Interface
From the "Datasets" tab in the top menu, click "New Dataset" on the left of the screen. Once the window opens, enter a name for the data set you'd like to upload and select a csv file. When ready, press create and your CSV will have been uploaded.

INCLUDE SCREENSHOTS WHEN INTERFACE IS FINALIZED

### Uploading Via an API
Is this something we'll have?

## Getting Your Transformed Data
### Using an API
Is this something we'll do?
### Using the Web Interface

You should now see a page similar to the following

INSERT SCREENSHOT ONCE INTERFACE IS MORE FINALIZED.

Now select your data set, and click generate. The server will run your transformation and create your new data set for you. **Note**: Large transformations may take some time to generate.

## Version control
What should go in here?

## Addressing Datasets
How will we manage datasets with the same name/different users?

## Considerations

Make smaller transformations and commit them separately so that you may go back to any intermediate data set that you'd like



# General Alex Comments/Questions

I note that these are just things that I was thinking about as I worked through things that may already be addressed/bad ideas. But I figured I'd write them down regardless mostly for my own benefit.

1. An API would be handy so we could register transformations "on the fly". That said I'm unclear how this might happen. I suppose the API could grab a python function and the original data set and test the transformation before updating ADI. I note that this is probably difficult and would kind of defeat the purpose of the platform.

5. Do we want to have tags/metadata that people can add to data during file upload/transformations?

2. Will we want a naming convention for datasets? Or at least a node property defining what transformation was done? For example maybe something like `joined_with` so we can see what that data set was a join with or like `aggregated_by = 'mean'` or `cleaned = True/False`. That way it will be easy to tell what was done to the data and if the intermediate is right for you. As well it might be nice to have flags for like `NaN_value_count = number of NaNs`, `Blank_value_count = number of blanks` etc.
    * That said, I can see this getting out of control pretty quickly

3. A standard library of transformations might be handy. Just simple things you'd do to a pandas data frame, but it would be pretty slick just to _get_ the basic transformation/aggregation you wanted instead of having to do it yourself. (This is probably out of scope)

3. Will we also need to upload a new data set on runtime  for the new transformation? For example something like:
   ```python
   new_data = pd.read_csv()
   # Upload data set if it doesn't already exist
   try:
     ADI.upload(new_data, "name_on_server")
   except DataExists:
     pass
   ADI_dataset = dataset_input("name_on_server")
   transformedDataset = dataset_output("transformed_dataset")
   def transform():
    ...
    ```
    If only to save some time if you want to upload both a new data set and a transformation on it simultaneously.
5. Do we want to automatically associate a user key with the transformations? That way it may automatically handle naming things for people. For example, if I was to upload a data set it would automatically appear as `user:dataset_name`. Then, anytime I'm calling my _own_ data I don't need to specify the user. However, if I wanted to use someone else's data for a transform, we could call it like
    ```python
    other_user_data = dataset_input(data="dataset_name", owner="other_user"))
    ```
5. Do we want a develper to have the ability for a user to specify "run this transformation immediately" from the transformation script, rather than having them click generate?
