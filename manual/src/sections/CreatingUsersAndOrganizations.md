# Users & Organizations

**User**: You need a user account to access datasets from Synthi. Datasets can be created, edited, searched, and shared by users with appropriate permissions.

**Organization**: Each dataset is owned by an organization and there can be any number of organizations within an Synthi instance. Every Synthi user always has a default organization with the same name as the username. However, they can be added to other organizations by a system administrator. 



{% hint style="info" %}
This section requires SSH and server access for your Synthi instance. Please contact the administrator if you require assistance with this.
{% endhint %}

## Creating a New User

From your SSH console, run `/usr/local/bin/create-user <username>` and replace `<username>` with the username of your choice.

You will be prompted to enter a password and then enter it again to confirm. Once you enter the password a second time, the script should complete and you will be able to login as a new user.

## Creating an Organization

From your SSH console, run `/usr/local/bin/create-org <organization_name>` and replace `<organization_name>` with the name of your choice.

The script should run and complete without any further information.

## Linking Users & Organizations

From your SSH console, run `/usr/local/bin/add-user-to-org <username> <organization_name>`. 

The script should run and complete without any further information.

{% hint style="danger" %}
An unexpected error may occur if either the user or organization does not exist or if you mix up the order of the parameters.
{% endhint %}