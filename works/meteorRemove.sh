#!/usr/bin/env bash

if [ "$1" = "-h" -o "$1" = "--help" ]; then cat <<EOF
######################################################
#                                                    #
#           Works with Meteor 1.2.1/1.3              #
#           on vagrant ubuntu/trusty64               #
#                                                    #
######################################################

  1. Removes an app created with meteorCreate.sh
     and your current user.

Usage:
  $ ./meteorRemove.sh <appName>

                                Made by heterosexual team
                                      Yes, we like girls!
                                         Without penises!
EOF
exit 0; fi

if [[ $# -eq 0 ]] ; then cat <<EOF
Error:
  You need to supply an argument to this script eg.
  $ ./meteorRemove.sh <appName>
EOF
exit 1; fi

CURRENT_DIR=$(pwd);
sudo umount $HOME/$1/.meteor/local/
sudo umount /$USER/$CURRENT_DIR/$1/.meteor/local/

rm -rf $1
rm -rf $HOME/$1

# expensive line :0
sed -i "/$1\//d" $HOME/.bashrc
