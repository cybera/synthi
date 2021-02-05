#!/bin/bash
set -eo pipefail
PS3='Backup Container: '
echo "Please select the container used to run backups (ctl-d to exit)"
select backup_cont in $(docker ps --format "{{.Names}}")
do

    PS3='Backup: '
    echo "Please choose a backup (ctrl-D to exit)"
    select backup in $(docker exec -it $backup_cont ./backup.py list)
    do
        PS3='Restore backup to: '
        echo "Select the container to restore to -Neo4J or OngDB- (ctl-d to exit)"
        select restore_cont in $(docker ps -a --format "{{.Names}}")
        do
            echo "Stopping $restore_cont"
            docker stop $restore_cont
            echo "Restoring backup"
            trim_backup=${backup/$'\r'}
            # echo "Trimmed: $trim_backup"
            docker exec -it $backup_cont ./backup.py restore $trim_backup
            # echo "Length ${#trim_backup}"
            back_folder=${trim_backup::29-3}
            echo "backup folder: $back_folder"
            docker run -it --mount type=volume,src=adi_backup,dst=/backup,volume-driver=local cybera/adi-neo4j:latest  neo4j-admin restore --from=/backup/torestore/$back_folder --force
            echo "Starting $restore_cont "
            docker start $restore_cont
            echo "Restore complete"
            exit 1
        done
    done
done
