## About this manual

This manual was created using [GitBook](https://toolchain.gitbook.com). It can be consumed in a variety of formats:

* As a website
* As a PDF
* As an eBook (ePub)

### Serving the manual as a website

If you have access to the ADI codebase, you can run the manual's site in a similar way as you run the ADI site. Make sure port 4000 is open on your server and start the manual with the following command:

```bash
bin/manual start
```

To stop the manual server, use the following command:

```bash
bin/manual stop
```

### Creating a PDF or ePub of the manual

You can also use the `bin/manual` command to create a PDF or ePub version of the manual:

```bash
bin/manual pdf
bin/manual epub
```

The PDF or ePub will show up in the *manual/outputs* folder. These outputs are ignored by git, so they will not get checked into the repository.