# Introduction

Welcome to the Synthi platform manual!

The Synthi platform is a project of Alberta Innovates. It acts as a hub to organize and coordinate users' work on datasets. Through its transformation pipeline, it manages the encoding of expert knowledge via actual code (currently only Python) that defines how to create new datasets, usually with other datasets (both uploaded and computed) as inputs.

Computed datasets can be downloaded and/or used as inputs for other transformations in exactly the same way that uploaded datasets can, so there is no need to know how to code if you simply want to *use* a computed dataset. The Synthi platform will determine all the transformations that need to be run whenever a dataset is downloaded. If data on an uploaded dataset is updated, all of the datasets that depend on it will also be updated   the next time they are downloaded.

This is pre-alpha software, and you should treat it as such. This means:

* There are currently no backups or disaster recovery, though there is nothing preventing these things from being added. 
* Some of the areas of functionality are incomplete in terms of the expectations you might have from using release-ready software. For example, there's currently no way to share information between two organizations unless you belong to both of them. 
* Error checking of user input is fairly basic. 
* Performance issues may arise depending on how you use the platform. Known troublespots will be mentioned throughout this document, along with workarounds, when appropriate. There will also be a summary of known issues at the end.

You can find the source code for the Synthi platform at: https://github.com/cybera/synthi.