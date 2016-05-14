#!/usr/bin/env bash

if [ "$1" = "-h" -o "$1" = "--help" ]; then cat <<EOF
######################################################
#                                                    #
#           Works with Meteor 1.2.1/1.3              #
#           on vagrant ubuntu/trusty64               #
#                                                    #
######################################################

  1. Creates a new meteor app.
  2. Mounts new app to vagrant home folder.
Usage:
  $ ./meteorCreate.sh <appName>

                              Made by heterosexual team
                                    Yes, we like girls!
                                       Without penises!
EOF
exit 0; fi

if [[ $# -eq 0 ]] ; then cat <<EOF
Error:
  You need to supply an argument to this script eg.
  $ ./meteorCreate.sh <appName>
EOF
exit 1; fi

meteor create $1;

mkdir -p $1/.meteor/local;
mkdir -p $HOME/$1/.meteor/local/;

CURRENT_DIR=$(pwd);
COMMAND="sudo mount --bind $HOME/$1/.meteor/local/ $CURRENT_DIR/$1/.meteor/local/";
echo $COMMAND >> $HOME/.bashrc && $COMMAND;

cd $1;
mkdir -p ./imports/startup;
mkdir -p ./imports/ui;
mkdir -p ./imports/api;

meteor remove insecure
meteor remove autopublish
meteor add audit-argument-checks

meteor npm install
meteor
