# Filesystem Organization

Uploads to ADI, and files that transformations generate need to be stored somewhere. This describes the organization of that storage.

There are 2 types of storage you can choose for ADI:

1. Object Storage
2. Legacy (filesystem) Storage

## Paths

Paths are relative to the root path ADI is configured with. In the case of object storage, it's a container (one for scripts and one for datasets). For legacy storage, it's a filesystem folder, which could be attached storage, NFS, or any other type of storage that can be attached and look like a regular filesystem folder.

In object storage, paths don't really exist. Rather, the `/` is part of the name, and certain software will treat this as path information (for example, when determining a default relative path to download to).

## When a file is uploaded

The server will stream the upload to an object storage (or directory) path based on the UUID of the dataset. For example, if the dataset has a UUID of 4ff5f490-f4bf-11e8-8418-0242ac120003 and we're uploading a CSV file, the upload will be found under:

`4ff5f490-f4bf-11e8-8418-0242ac120003/data/original.csv`

(Not implemented yet) There will also be a metadata file stored with any metadata that can be determined during the immediate upload (for example, original filename and timestamp):

`4ff5f490-f4bf-11e8-8418-0242ac120003/metadata/original.json`

## When a file is first processed

We'll attempt to normalize the data, and the normalized format may change. Right now, we're only dealing with CSV files, so the main concern is making sure they adhere to a common structure regardless of how they're uploaded. The import process will accept a variety of types, but it will only produce comma-separated CSV files with a header row:

`4ff5f490-f4bf-11e8-8418-0242ac120003/data/imported.csv`

## When a file is downloaded

(Not implemented yet) Between a file first being processed and a download, certain things may happen that change what we want to provide in a download. In particular, the user may change column names, which should be reflected in the newly downloaded CSV file. Thus, when a file is downloaded, the following will be generated and ultimately the file that is streamed to the end user:

`4ff5f490-f4bf-11e8-8418-0242ac120003/data/download.csv`

