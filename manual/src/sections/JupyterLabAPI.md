##  JupyterLab API

  These instructions relate to providing a JupyterLab extension to interact with the Synthi platform. 

  ### Installation
  
  The installation and setup instructions are available in the [jupyterlab-synthi](https://github.com/cybera/jupyterlab-synthi.git) GitHub repository. When everything is setup correctly, you should see a ![gear](../images/gear.png) icon on the sidebar when you open a notebook.

  ![jupyterlab-widget](../images/jupyterlab-widget.png)

  ### Datasets

  The Datasets sidebar shows the list of datasets that are linked to your organization.

  ![dataset-link](../images/dataset-link.png)

  * The link icon next to each dataset will take you to the dataset in the Synthi platform. 
  * The *Filters* field, *Include Shared* and *Published Only* checkboxes allows you to search a dataset of interest by filtering based on various dataset metadata. See the *[Search](sections/Search.md)* section for more details on how to use it.


  ### Connecting to Synthi

  Install the [python-synthi](sections/PythonAPI.md) package, then import the environment variables by running this in a notebook cell:

  ```python
    import os
    os.environ['SYNTHI_API_HOST'] = your_api_host
    os.environ['SYNTHI_API_KEY'] = your_api_key
  ```

  ![connecting-to-synthi](../images/connecting-to-synthi.png)

  Now you can use the python-synthi package to connect to synthi and work with the datasets and organizations that are accessible to you there, in addition to having the full capabilities of JupyterLab. 


  ### Transformation

  {% hint style="danger" %}
  This section is only a proof of concept. Creating and running transformation functions have changed since this feature was initially built so this needs to be modified to reflect those changes.
  {% endhint %}
  

  You can write reusable transformation functions in a Jupyter notebook, save it, run it, and import it into Synthi to use with other datasets.

  The JupyterLab widget will recognize regular Python methods and turn them into transformations with a few simple rules:
  * Any top level method is a possible transformation.
  * The method parameters will be turned into the dataset's input references.

  ![jupyterlab-transformation](../images/jupyterlab-transformation.png)

  When you click on the *Create Transformation* button, the widget saves the code to Synthi. You can add description and tags to your transformation code to make it easy to search for them in the *Browse Transformations* page in the Synthi interface.

  To view the transformation you just created, open the Synthi interface and go to the browse transformations page.

  ![jupyterlab-browse-transformation](../images/jupyterlab-browse-transformation.png)



  






  
