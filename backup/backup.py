#! /usr/local/bin/python3
import logging
from os import walk, environ
import logging.handlers
from time import sleep
import os.path
from os import path
from os.path import join
import swiftclient
from sys import argv
import toml
import tarfile


argument = argv[1]

# Set up logging
adi_backup = logging.getLogger('ADIBackup')
adi_backup.setLevel(logging.DEBUG)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
adi_backup.addHandler(handler)

requests = logging.getLogger('Requests')
requests.setLevel(logging.DEBUG)
requests.addHandler(handler)

swift_error = logging.getLogger('SwiftClient')
swift_error.setLevel(logging.DEBUG)
swift_error.addHandler(handler)


# Ensure environment variables are set
if "BACKUP_DIR" in environ:
    backup_dir = environ['BACKUP_DIR']
else:
    # print('The environment variable BACKUP_DIR doesnt exist')
    adi_backup.critical('The environment variable BACKUP_DIR doesnt exist')

if "SWIFT_CONTAINER" in environ:
    container = environ['SWIFT_CONTAINER']
else:
    # print('The environment variable SWIFT_CONTAINER doesnt exist')
    adi_backup.critical('The environment variable SWIFT_CONTAINER doesnt exist')


# Prepare credentials for use

file = "/config/development.toml"
with open(file, 'r') as myfile:
    data = myfile.read()
settings = toml.loads(data) 
user = settings['storage']['object']['creds']['username']
password = settings['storage']['object']['creds']['password']
region = settings['storage']['object']['creds']['region']
url = settings['storage']['object']['creds']['authUrl']
tenant = settings['storage']['object']['creds']['tenantName']
swift_conn = swiftclient.client.Connection(authurl=url, user=user, key=password, tenant_name=tenant, auth_version='2.0', os_options={'region_name': region})


def list():
    """
    List backups
    :returns: A list of the available backup names (.gz files)
    """
    return swift_conn.get_container('adi_backup')[1]

def upload():
    """
    Upload Backups - Finds all backup folders in /backup and compresses each folder, storing it in /compressed, and uploads them to swift.
    :returns: nothing. It does, however, create a log entry stating what backups were sent.
    """
    
    if not path.exists("/backup/compressed"):
        os.mkdir("/backup/compressed")
    toupload = os.listdir("/backup")
    for folder in toupload:
        if folder != "torestore" and folder != "compressed":
            tar = tarfile.TarFile.gzopen("/backup/compressed/" + folder + ".gz", mode="w")
            tar.add("/backup/" + folder, arcname=folder)
            tar.close()
            with open('/backup/compressed/' + folder + '.gz', 'rb') as f:
                file_data = f.read()
            
            swift_conn.put_object('adi_backup', folder + ".gz", file_data)
            adi_backup.info(folder + " is backed up")
    swift_conn.close() 


def download(file):
    """
    Download Backup - downloads the .gz file requested and stors it in /backup/torestore/ and decompresses it.
    Example: ./backup.py restore [filename] 
    Get the list of files by running ./backup.py list
    :param file: File to be downloaded
    :return: List of files in the /backup/torestore folder.
    """
    # Ensure the restore folder is available
    if not path.exists("/backup/torestore"):
        os.mkdir("/backup/torestore")
    # Get the backup from Swift
    getfile = swift_conn.get_object(container='adi_backup', obj=file)
    with open("/backup/torestore/" + file, 'wb') as f:
        f.write(getfile[1])
    # Extract the .gz file to the restore directory
    os.chdir("/backup/torestore")
    tar = tarfile.open("/backup/torestore/" + file)
    tar.extractall()
    tar.close()
    # Delete the .gz file
    os.remove("/backup/torestore/" + file)
    return os.listdir("/backup/torestore")

    
if argument:
    if argument == "list":
        for item in list():
            print(item['name']) 
    elif argument == "restore":
        restorefile = argv[2]
        print(download(restorefile))
    elif argument == "backup":
        while True:
            if path.exists("/backup"):
                # adi_backup.info("Backup Directory contains: " + str(os.listdir("/backup")))
                upload()
            else:
                adi_backup.info("Backup folder does not exist")
            sleep(60)

