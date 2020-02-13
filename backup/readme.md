# Backups
## Structure
* The backups run hourly on the neo4j container and daily from the backup container to Swift storage
### Retention
* Retention should be permanent depending on storage space
### Restoration
* First, get a list of the available backups:
```
docker exec -it adi_backups_1 ./backup.py list
```
* Then get the backup from Swift
```
docker exec -it adi_backups_1 ./backup.py restore [backup-name.gz]
```
* This will download the backup and decompress it to /backups/torestore (available in both the backup and neo4j containers)
* Stop the Neo4j container
* Restore the backup:
```
docker run -it --mount type=volume,src=adi_backup,dst=/backup,volume-driver=local cybera/adi-neo4j:latest neo4j-admin restore --from=/backup/torestore/neo4j_[date].db-backup --force
```
* Start the Neo4j container again

### Testing

## Backup Sets
### OngDB
* Possibly run cron from host to exec the container
* 
### Swift
## 
