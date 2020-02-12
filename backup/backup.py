import logging
from os import walk, environ
import logging.handlers
from time import sleep
import os.path
from os import path

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


def loadcreds():
    import toml
    file = "/config/development.toml"
    with open(file, 'r') as myfile:
        data = myfile.read()
    settings = toml.loads(data)
    return settings    
    

def getbackup():
    print("Get Backups")


def upload():
    from os.path import join
    import swiftclient
    settings = loadcreds()
    user = settings['storage']['object']['creds']['username']
    password = settings['storage']['object']['creds']['password']
    region = settings['storage']['object']['creds']['region']
    url = settings['storage']['object']['creds']['authUrl']
    tenant = settings['storage']['object']['creds']['tenantName']
    swift_conn = swiftclient.client.Connection(authurl=url, user=user, key=password, tenant_name=tenant, auth_version='2.0', os_options={'region_name': region})
    toupload = os.listdir("/backup")
    # adi_backup.info(user, password, region, url, tenant)
    for folder in toupload:
        swift_conn.put_object('adi_backup', folder, "/backup/" + folder)
        adi_backup.info(folder + " is backed up")
    swift_conn.close() 

while True:
    adi_backup.debug("Still Alive")
    if path.exists("/backup"):
        adi_backup.info("Backup Directory contains: " + str(os.listdir("/backup")))
        
        loadcreds()
        upload()
    else:
        adi_backup.info("Backup folder does not exist")
    sleep(60)

