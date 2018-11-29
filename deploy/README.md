# Deployment

## Requirements

* Ansible (`brew install ansible`)
* Docker, Docker Machine, Docker Compose
* Logged in to Docker Hub locally (`docker login`)
* Logged in to the VPN

## Creating a Docker Host

1. Launch an Ubuntu 16.04 instance in RAC in the `Data Science` project
	* Give it the `adi` and `vpn_all` security groups
	* Attach a floating IP
3. Create a domain `<environment>.adi2.data.cybera.ca` pointing to that floating IP
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

If an ADI config doesn't already exist, it'll need to be created:

```
cp ../config/development.toml.example production.toml
docker config create production.toml production.toml
```

Now deploy the stack:

```
docker stack deploy --with-registry-auth -c stack.yml adi
```

If a change is made to the `stack.yml` file just re-run the above the command. However, individual services will still need to be updated with the `docker service update` command to actually apply the changes.

Finally, run the database migrations:

```
docker exec -ti adi_python-worker.1.$(docker service ps adi_python-worker -q --no-trunc | head -n1) ./run_migrations.py
```

## Updating Images

Production uses the same images as development, but `docker stack deploy` only allows images to be pulled from a registry so they have to be pushed to Docker Hub:

```
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

## Todo

* Start versioning images to better support multiple environments and rollbacks
* Automatically build images via Jenkins or something when changes are pushed to the `development` branch
* Create a sharing mechanism for Docker Machine configs and certs
