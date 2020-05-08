# Transformations using Swift Temp URLs

## Background

Object storage is an ideal place to put raw datasets when you're not using them. In contrast to local block storage, it is, by default, redundant, fault tolerant, and easy to securely access over the internet. It can also store large amounts of raw data without the overhead of a database (and some tools are being developed for limited querying of more structured data directly from object storage).

However, secure access assumes that you're protecting your user credentials. These are set up for at the cloud provider level, and generally meant for those administering the cloud infrastructure or services in between, not for end users. Those end users get access that's mediated through the web application.

Mediated access from the outside isn't too hard. You're already enforcing access permissions at a higher layer, so you just have to be careful not to expose object storage directly (by streaming a download through the server, for example).

However, the more that it's *just* the extra access control you need, and the more frequently you need to access object storage, the more you feel the overhead and complexity (and potential new bugs) that having that intermediary adds.

In ADI's case, Transformations are quite regularly reading from and writing to object storage. That is ultimately all a transformation really does: convert one file or set of files into another. There's a bunch of useful metadata added on top that can help determine what transformations need to be run, keep track of data lineage, etc. But the running transformation basically just reads, transforms, and writes data.

## Problem

Users can run arbitrary code in their transformations. They need to be able to access the datasets they're transforming and record the results. But they need to do so without being able to access other datasets from other users that they don't have permissions for. We also want to prevent them from accidentally or purposely overwriting other users' data.

Currently we're sort of managing this by controlling how the data in a dataset (where we have control) gets to a transformation (where the user's code is in control). So we don't allow the user to read directly from object storage. Instead, we provide an impelementation for `dataset_input('some dataset name')` that runs outside of the transformation, reads a dataset into memory as a global variable, and the transformation code references that variable.

One major consequence is that we end up dictating a lot about how that 'dataset' is read. Initially we assumed that all datasets should be immediately converted to a dataframe. But then we started dealing with unstructured data. So we needed to add an optional parameter to `dataset_input`. Then some of that unstructured data had to be read in binary form, so we added another optional parameter. And so on... To an extent, we could fix this by just making `dataset_input` do less and then provide helper methods to do the conversions in a transformation. But we'd still be forcing a certain way of working with the data in order to avoid giving direct access to object storage that would need credentials we don't want to share.

For example, what if a user wanted a transformation to split a 10 TB dataset into several smaller datasets? As long as we're controlling that initial access, we'd at minimum have to write that whole 10 TB to local storage before giving them access. Even worse, we currently try to read the whole thing into memory. So then they'd have that 10 TB file, do something to split it out, then pass back those smaller chunks to us... which we then convert into object storage. There's a lot of needless storage going on in all of this. If they had direct access to oject storage, they could stream the initial 10 TB object and convert it into smaller chunks on the fly. At most, they'd only need to have enough space to write an individual chunk to disk, but they may even be able to avoid that by streaming the split chunks directly back to object storage as the transformation is splitting them. This depends a lot on the type of data and how low level they want to get in their transformation, of course. But the way we're doing things now, we don't even give that option.

Add to this that the passing off of control between our secure access to the more unsecure transformation code is largely untested, and there are likely some easy security holes that a knowledgable enough developer could exploit to get access to those protected credentials...

## Proposed Solution: Temporary URLs (or Presigned URLs in S3)

A [temporary URL](https://docs.openstack.org/swift/latest/api/temporary_url_middleware.html) is first created by a cloud user with appropriate credentials (something that would need to be mediated and not directly accessible to an end user). However, that URL itself will give time limited, secure access to either a specific object or an entire set of objects with a specific prefix. It can work both ways, for reading or writing of data. This would allow us to give direct access to the object store in a transformation without risking even other datasets within the organization. As an added bonus, this access doesn't even have to take place in ADI to be secure. It could be done on completely separate infrastructure. The security is equivalent to creating a separate cloud user for just that resource *and* the time it takes to do a single transformation. The only thing we have to do to mediate this (with our more powerful credentials) is generate the temporary URLs. Once that's done, we can get out of the way completely.

This would mean, instead of trying to pass data directly into a transformation, we could pass in pointers to the data (the paths to it on our object storage) and let the user decide. We could still provide helper methods to do common tasks, but these would be much easier to add to and keep simple. Instead of trying to provide multiple flags to `dataset_input`, we could have an `as_csv` method that reads from the object storage path or `write_to_disk` to provide a traditional file for libraries that need that... or we may opt to completely forgo that and simply provide code snippets for those common operations, as many would be close to single lines of code themselves.

## Complications

There's one potential problem with this that would have to be addressed if we're wanting to work with large files, where we need to use Swift's SLO/DLO functionality. In essence, this splits a really large object into many small ones and, in addition, writes a 'manifest' that specifies what smaller objects need to be stitched together to form the larger one. This tends to be built into various clients that work with Swift. However, those clients generally assume users with real cloud credentials. They don't know how to work with a temporary url.

Fortunately, the REST commands for writing to or reading from a temporary url are quite a lot simpler than credentialed Swift operations, so it's not a big deal to write our own methods for this, that we could then expose to the end users. Unfortunately, with SLOs/DLOs, we'd have to handle the splitting up, naming, and individual upload of chunks ourselves. This isn't too bad, and we can defer doing it until we really have to, but it is a downside to be aware of.

An extra wrinkle is, for security reasons, Swift (and probably S3) don't allow creating a manifest file when using temporary URLs. The problem is that a user could add paths to the manifest that they don't have access to, and Swift would blindly put them together when they then download the single large object. This is fairly easily worked around by, in addition to creating the temporary URL prefix via our more privileged credentials, also prepopulating a manifest file in the DLO (dynamic large object) style, which doesn't require individual listings of chunks, but rather only a prefix. We may want to consider turning even small objects (that would only have one chunk) into DLOs simply so that we can handle all writing of objects in the same way. Again, though, this is a decision we could defer until we hit the problem, without a huge amount of rewriting or API change.

One interesting consequence of treating everything like a DLO is that text-based datasets (including csv ones) could effectively be appended to without having to rewrite the whole object. Whether or not this is a good idea, I don't know. It exploits the fact that once a prefix is established, you can put any number of smaller chunks, and as long as you keep naming them appropriately (with some index value), the next time the object is read, it'll pick up the latest chunks. We would probably at least want to verify that this behaviour isn't unique to Swift Object Storage before making use of it, though.

## Diagram

![diagram](images/transformation-swift-tempurls-diagram.jpg)

Here's a diagram to put this all in context. Basically (1) is where we're at now, where we're directly trying to mediate access in the python code that runs a transformation. (2) shows how we can use those same credentials to set up a temporary secure highway to our datasets, and give that directly to the transformations.

## In practice

Here are some raw calls that you can use to do all that's described above.

### Creating a temporary URL for reading

```bash
swift tempurl GET 3600 /v1/AUTH_bf98170664624b91bb6ca93f393685c2/test/test.csv secret_access_key
```

This creates something like (this one has already expired):

```bash
/v1/AUTH_bf98170664624b91bb6ca93f393685c2/test/test.csv?temp_url_sig=30398ade150515c091e864eea4317f7d19a313a6&temp_url_expires=1574883423
```

And you can directly access it by attaching the Swift server address to the front:

```bash
curl https://swift-yeg.cloud.cybera.ca:8080/v1/AUTH_bf98170664624b91bb6ca93f393685c2/test/test.csv?temp_url_sig=30398ade150515c091e864eea4317f7d19a313a6&temp_url_expires=1574883423 -O /tmp/test.csv
```

For an hour, anyone with that link will be able to access the `test.txt` object in the `test` container. Note that the only things that aren't public knowledge in all of this are the `secret_access_key`, used only when creating the tempurl, and the `temp_url_sig`, which is effectively the password we use to authenticate. As scary as `AUTH_bf98170664624b91bb6ca93f393685c2` looks, it's just the unique identifier for my account.

All of this could be passed along as a parameter and we can easily make methods that do what `curl` is doing here... so effectively, we could do something like:

```python
import pandas as pd

def transform(params):
  # even this could be turned into one method that writes and reads the csv
  # if we really needed to.
  write_to_disk(params['test.csv'], '/tmp/test.csv')
  df = pd.read_csv('/tmp/test.csv')

  # actually do transformation
  return df.head()
```

### Write access to single object

```bash
swift tempurl PUT 3600 /v1/AUTH_bf98170664624b91bb6ca93f393685c2/test/test2.csv secret_access_key
```

creates something like this:

```bash
/v1/AUTH_bf98170664624b91bb6ca93f393685c2/test/test2.csv?temp_url_sig=5cf05581104c7c91f21cc384b03e91884bb3cf4e&temp_url_expires=1574899286
```

which can be used by anyone from anywhere to write an object called `test2.csv` to the `test` container.

```bash
curl -X PUT -T /tmp/test2.csv https://swift-yeg.cloud.cybera.ca:8080/v1/AUTH_bf98170664624b91bb6ca93f393685c2/test/test2.csv?temp_url_sig=5cf05581104c7c91f21cc384b03e91884bb3cf4e&temp_url_expires=1574899286
```

Notice the different `temp_url_sig`. Every operation effectively gets a different password.

### Writing a large object

Note that this actually tries to upload a file and have the python-swiftclient handle the splitting and manifest writing for us. When implementing, we'd want to use a more direct call (likely via the pure REST interface) to *just* create the manifest, which is all we need.

```bash
swift upload test -S 1048576 test.csv
```

When using the above, we'd want to either supply a completely empty test.csv file or wipe out whatever actual chunks get written.

By default, Swift writes the chunks here to a separate container with a postfix of `_segments`, so if we listed segments and test.csv was a 6 MB file, we might see:

```bash
test.csv/1531844106.000000/6037423/1048576/00000000
test.csv/1531844106.000000/6037423/1048576/00000001
test.csv/1531844106.000000/6037423/1048576/00000002
test.csv/1531844106.000000/6037423/1048576/00000003
test.csv/1531844106.000000/6037423/1048576/00000004
test.csv/1531844106.000000/6037423/1048576/00000005
```

There's nothing really necessary in those paths except for the first and last parts. By default they add a timestamp (so that you could write multiple versions without overwriting), the total size of the object, the size of the segment, then the index number. In other words, you could get away with:

```bash
test.csv/00000000
test.csv/00000001
test.csv/00000002
test.csv/00000003
test.csv/00000004
test.csv/00000005
```

Here's what the basic manifest looks like, via `swift stat test test.csv`

```bash
               Account: AUTH_bf98170664624b91bb6ca93f393685c2
             Container: test
                Object: test.csv
          Content Type: text/csv
        Content Length: 6037423
         Last Modified: Thu, 28 Nov 2019 00:19:09 GMT
                  ETag: "b3f127a744b037789050bc1d5a69a73e"
              Manifest: test_segments/test.csv/1531844106.000000/6037423/1048576/
         Accept-Ranges: bytes
           X-Timestamp: 1574900348.74433
            X-Trans-Id: txd95953013c6e4a1fb79b3-005ddf12d3
X-Openstack-Request-Id: txd95953013c6e4a1fb79b3-005ddf12d3
```

In any event, once this is set up and we just have our manifest at test/test.csv, we can create our tempurl:

```bash
swift tempurl PUT 3600 /v1/AUTH_bf98170664624b91bb6ca93f393685c2/test_segments/test.csv/1531844106.000000/6037423/1048576 secret_access_key --prefix-based
```

Note that we're using `--prefix-based` so that we can write any number of objects as long as they start with the path '/v1/AUTH_bf98170664624b91bb6ca93f393685c2/test_segments/test.csv/1531844106.000000/6037423/1048576'. Then, in our transformation, we effectively just need to do:

```bash
curl -X PUT -T /tmp/test.csv_chunk1 'https://swift-yeg.cloud.cybera.ca:8080/v1/AUTH_bf98170664624b91bb6ca93f393685c2/test_segments/test.csv/1531844106.000000/6037423/1048576/00000000?temp_url_sig=960514d959c96659b06617e8511575cc30907cb4&temp_url_expires=1574902583&temp_url_prefix=test.csv/1531844110.000000/6037423/1048576'
curl -X PUT -T /tmp/test.csv_chunk2 'https://swift-yeg.cloud.cybera.ca:8080/v1/AUTH_bf98170664624b91bb6ca93f393685c2/test_segments/test.csv/1531844106.000000/6037423/1048576/00000001?temp_url_sig=960514d959c96659b06617e8511575cc30907cb4&temp_url_expires=1574902583&temp_url_prefix=test.csv/1531844110.000000/6037423/1048576'
```

Remember not to get thrown off by the long lines. Most of this would be generated and passed in, and most of the rest can be hidden behind relatively simple methods.

## Consequences

This would drastically enhance our security in terms of dataset file access and ultimately allow us to pull a lot of quirky magic out of the Transformation programming interface while still allowing us to provide helper methods that only effectively result in an extra 1-2 lines of code in the simple cases, but opening up more complex reading/writing that may take more code but isn't even possible right now. It will make transformations much more flexible and easier to integrate with other systems.

We will likely have to give up our 'Legacy' dataset storage or at least make it more of a dev-only tool that is much less secure (though it's really not that secure now), unless we want to invest the effort in maintaining the dual storage methods. This is because, well... we're not doing the reading/writing for the transformation. We're leaving it up to the transformation writer. So while there are the mechanisms described above to give temporary access to single objects on object storage, we'd have to figure out how to do something very similar on network attached storage to handle the legacy case. Otherwise, the user would have an even easier time just changing the path to access other dataset files. In reality, this has been an area of code that's long since been abandoned and only kept around because we think we might be able to make use of it down the road for some easier testing, and it's a comfortable fallback if we somehow had to show off ADI without network access. However, a better way of doing both is to find a way to run a dev-only object storage service that we can use locally, just as we have our dev-only database and services. In other words, it may be as good a time as any to just hit delete.
