# Creating Users & Organizations

{% hint style="info" %}
This section requires SSH and server access for your ADI instance. Please contact the administrator if you require assistance with this.
{% endhint %}

## Creating a New User

From your SSH console, run `usr/local/bin/create-user <username>`, replacing `<username>` with the username of your choice (quotation marks aren't necessary).

You will be prompted to enter a password and then enter it again to confirm it. Once you enter the password a second time, the script should complete and you will now be able to login as your new user.

## Creating an Organization

From your SSH console, run `usr/local/bin/create-org <organization_name>`, replacing `<organization_name>` with the name of your choice (again, quotation marks aren't necessary)

The script should run and complete without any further information.

## Linking Users & Organizations

From your SSH console, run `usr/local/bin/add-user-to-org <username> <organization_name>`. 

The script should run and complete without any further information.

{% hint style="danger" %}
An unexpected error may occur if either the user or organization does not exist or if you mix up the order of the parameters.
{% endhint %}