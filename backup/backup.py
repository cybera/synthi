import logging
from os import walk, environ
import logging.handlers
from time import sleep


class OneLineExceptionFormatter(logging.Formatter):
    def formatException(self, exc_info):
        result = super().formatException(exc_info)
        return repr(result)

    def format(self, record):
        result = super().format(record)
        if record.exc_text:
            result = result.replace("\n", "")
        return result


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

if "DB_SERVER" in environ:
    db_server = environ['DB_SERVER']
else:
    # print('The environment variable DB_SERVER doesnt exist')
    adi_backup.critical('The environment variable DB_SERVER doesnt exist')

if "DB_USER" in environ:
    db_user = environ['DB_USER']
else:
    # print('The environment variable DB_USER doesnt exist')
    adi_backup.critical('The environment variable DB_USER doesnt exist')

if "DB_PASSWORD" in environ:
    db_password = environ['DB_PASSWORD']
else:
    # print('The environment variable DB_PASSWORD doesnt exist')
    adi_backup.critical('The environment variable DB_PASSWORD doesnt exist')


def getbackup():
    print("Get Backups")


def upload():
    from os.path import join
    from swiftclient.multithreading import OutputManager
    from swiftclient.service import SwiftError, SwiftService, SwiftUploadObject
    _opts = {'object_uu_threads': 20}
    with SwiftService(options=_opts) as swift, OutputManager() as out_manager:
        try:
            objs = []
            dir_markers = []
            for (_dir, _ds, _fs) in walk(backup_dir):
                if not (_ds + _fs):
                    dir_markers.append(_dir)
                else:
                    objs.extend([join(_dir, _f) for _f in _fs])
            objs = [
                SwiftUploadObject(
                    o, object_name=o.replace(
                        backup_dir, 'my-%s-objects' % backup_dir, 1
                    )
                ) for o in objs
            ]

            dir_markers = [
                SwiftUploadObject(
                    None, object_name=d.replace(
                        backup_dir, 'my-%s-objects' % backup_dir, 1
                    ), options={'dir_marker': True}
                ) for d in dir_markers
            ]

            for r in swift.upload(container, objs + dir_markers):
                if r['success']:
                    if 'object' in r:
                        swift_error.debug(r['object'])
                    elif 'for_object' in r:
                        swift_error.debug(
                            '%s segment %s' % (r['for_object'],
                                               r['segment_index'])
                            )
                else:
                    error = r['error']
                    if r['action'] == "create_container":
                        swift_error.critical(
                            'Warning: failed to create container '
                            "'%s'%s", container, error
                        )
                    elif r['action'] == "upload_object":
                        swift_error.critical(
                            "Failed to upload object %s to container %s: %s" %
                            (container, r['object'], error)
                        )
                    else:
                        swift_error.critical("%s" % error)

        except SwiftError as e:
            swift_error.critical(e.value)


while True:
    adi_backup.debug("Still Alive")
    sleep(60)

