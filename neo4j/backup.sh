while [ : ]
do
  echo "Starting Backup"
  /var/lib/neo4j/bin/neo4j-admin backup --backup-dir=/backup --pagecache=4G --name=neo4j_$(date +%m_%d_%Y).db-backup
  echo "Backup Complete, sleeping for one hour"
  sleep 60m
done
