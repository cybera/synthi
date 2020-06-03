# Search

Use the search feature on the Synthi interface to find a dataset in the Synthi instance.

## Syntax

Synthi's search functionality follows [Apache's lucene syntax](https://lucene.apache.org/core/2_9_4/queryparsersyntax.html). This allows various ways of searching from simple "across all fields" searches to very specific searches on individual fields and/or combinations of them.

### Fuzzy searches

Lucene also has fuzzy searches, which use the `~` character to indicate that we want to match strings within a certain proximity of the input string. The following search would match "word", "worst" (2 changes away), "worn" (1 change away), etc.

```
word~2
```

When searching on a string with multiple words, the proximity operator indicates how many *words* away from the input string to match. For example:

```
"hello world"~1
```

would match "hey world" or "hello Dave", but not "hey Dave".

### Fields

The following fields are included in the searchable index:

DatasetMetadata:

- title
- contributor
- contact
- description
- source
- identifier
- topic

Column:

- name

Dataset:

- name

You can specifically search on only one field by prefixing the search term with the type and field name. For example, the following will search only columns:

```
Column.name:species
```