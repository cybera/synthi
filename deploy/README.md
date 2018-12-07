# Deployment

## Requirements

* Ansible (`brew install ansible`)
* OpenStack ([website](http://www.openstack.org), [more info](#openstack))
* Docker, Docker Machine, Docker Compose
* Logged in to Docker Hub locally (`docker login`) ([more info](#docker))
* Logged in to the VPN ([more info](#vpn))
* Security Groups ([more info](#security))

## Creating a Docker Host

1. Launch an Ubuntu 16.04 instance in RAC in the `Data Science` project ([more info](#instance))
	* Give it the `adi` and `vpn_all` security groups
	* Attach a floating IP
3. Create a domain `<environment>.adi2.data.cybera.ca` pointing to that floating IP ([more detailed instructions](#domain))
3. Use Docker Machine to install Docker:
```
docker-machine create --driver generic \
--generic-ip-address=<floating_ip> \
--generic-ssh-user ubuntu \
adi-<environment>
```
4. Add a new entry to the Ansible `hosts` file:
```
[<environment>]
<environment>.adi2.data.cybera.ca
```
5. Run Ansible:
```
ansible-playbook -i hosts -l <environment> playbook.yml
```

## Deploying the Stack

Switch to the remote Docker host:

```
eval "$(docker-machine env adi-<environment>)"
```

If an ADI config doesn't already exist, it'll need to be created (edit it accordingly before creating the config in Docker):

```
cp ../config/development.toml.example production.toml
docker config create production.toml production.toml
```

Also run `cp neo4j.env.example neo4j.env` and change `password` to the value from `production.toml`:

Now deploy the stack:

```
docker stack deploy --with-registry-auth -c stack.yml adi
```

If a change is made to the `stack.yml` file just re-run the above the command. However, individual services will still need to be updated with the `docker service update` command to actually apply the changes.

Finally, run the database migrations:

```
docker exec -ti adi_python-worker.1.$(docker service ps adi_python-worker -q --no-trunc | head -n1) ./run_migrations.py
```

You'll also need to create a user such that you can log into your hub with the following 

```
docker exec -ti adi_python-worker.1.$(docker service ps adi_python-worker -q --no-trunc | head -n1) ./create_user.py <your-user-name>
```

Where you will be prompted to enter and confirm a password. 
## Updating Images

Production uses the same images as development, but `docker stack deploy` only allows images to be pulled from a registry so they have to be pushed to Docker Hub:

```
bin/build-client
docker-compose build
docker push cybera/adi-server
docker push cybera/adi-neo4j
docker push cybera/adi-python-worker
```

Then services can be updated to the new images:

```
eval "$(docker-machine env adi-<environment>)"
docker service update adi_server --image cybera/adi_server --with-registry-auth
docker service update adi_neo4j --image cybera/adi_neo4j --with-registry-auth
docker service update adi_python-worker --image cybera/adi_python-worker --with-registry-auth
```
# <a name="instance"></a>Starting an Instance on RAC

1. From the cloud portal in the drop down menu on the keft hand side click `Compute -> Instances` 
2. Click `Launch Instance` on the top right of the screen 
3. Use the following settings:
     * `Availabilty Zone`: nova
    * `Instance Name`: The name of your instance
    * `Flavor`: `m1.large`
    * `Number of Instances`:1
    * `Instance Boot Source`: Boot from image
    * `Image Name`: Ubuntu 16.04

4. To assign a floating IP, after you've launced your instance, click the drop down on your instance and select `Assign Floating IP`


# <a name="domain"></a>Creating a Domain on RAC 

If this is your first time creating a domain on RAC, there are a few menus and setting you should be aware of. 

1. After you've launched your instance and assigned a floating IP with the drop down menu to the left of the instance, on the right hand menu select `DNS` and click `Zones`. 

2. If you have no active zone, you will need to create one using the `Create Zone` button to the left hand side. If you have an active zone, skip this step

3. Select your zone. This will take you to a new page with two tabs, `Overview` and `Record Sets`. Click `Record Sets`. 

4. Click `Create Record Set` on the top right. 

5. Fill the following settings in:
     * `Type`: A - Address record
	 * `name`: `<environment>.adi2.data.cybera.ca.` note the trailing `.`
	 * `Description`: Your description
	 * `TTL`: 3600
	 * `Record`: The floating IP of your instance. 


# <a name="openstack"></a>OpenStack

This requires open stack on the back end. The git repository can be found [here](https://github.com/openstack/nova).

The particular interface will vary depending on your provider of choice, however if you're comfortable with command line tools, the `nova` tool should work nearly ubiquitously on any properly set up OpenStack cloud. The documentation for `Nova` can be found [here](https://docs.openstack.org/python-novaclient/latest/cli/nova.html#nova-usage)

# <a name="VPN"></a>VPN Settings
What goes here?

# <a name="docker"></a>Docker Login Settings

What goes here? 
# <a name="security"></a> Security Groups 
You will need to set up the following security groups for your open stack instance 


```
adi         ALLOW IPv4 3000/tcp from 0.0.0.0/0
	    ALLOW IPv4 443/tcp from 0.0.0.0/0
	    ALLOW IPv4 80/tcp from 0.0.0.0/0

vpn_all     ALLOW IPv4 1-65535/tcp from 199.116.232.0/24
            ALLOW IPv4 to 0.0.0.0/0
	    ALLOW IPv6 to ::/0
	    ALLOW IPv6 1-65535/tcp from 2605:fd00:0:2::/64
```
        
        

## Todo

* Start versioning images to better support multiple environments and rollbacks
* Automatically build images via Jenkins or something when changes are pushed to the `development` branch
* Create a sharing mechanism for Docker Machine configs and certs
