#!/bin/bash
# restore.sh - choose and restore a backup on the neo4j container.
# Store menu options selected by the user
INPUT=./menu.sh.$$

# Storage file for displaying cal and date command output
OUTPUT=./output.sh.$$

# trap and delete temp files
# trap "rm $OUTPUT; rm $INPUT; exit" SIGHUP SIGINT SIGTERM


IN=$(docker exec -it adi_backups_1 ./backup.py list)
# arrIN=(${IN//\n/ })
# echo $arrIN
while true
do

### display main menu ###
dialog  --backtitle "ADI Backup Restore" \
--title "[ M A I N - M E N U ]" \
--menu "You can use the UP/DOWN arrow keys, the first \n\
letter of the choice as a hot key, or the \n\
number keys 1-9 to choose an option.\n\
Choose the TASK" 15 50 4 \
$IN 2>"${INPUT}"

menuitem=$(<"${INPUT}")

# echo $menuitem
# make decsion
# case $menuitem in
# 	List) list_backups;;
# 	Exit) echo "Bye"; break;;
# esac

done
echo $menuitem
# if temp files found, delete em
# [ -f $OUTPUT ] && rm $OUTPUT
# [ -f $INPUT ] && rm $INPUT
