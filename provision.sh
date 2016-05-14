#!/usr/bin/env bash

apt-get update
apt-get -y upgrade
apt-get install -y git
apt-get install -y htop
apt-get install -y inotify-tools
apt-get install -y g++

# install nodejs
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
apt-get install -y nodejs

# install meteor
curl https://install.meteor.com/ | sh

# fix some mongo shit
echo "export LC_ALL=C" >> /home/vagrant/.bashrc
echo "cd /vagrant/works/" >> /home/vagrant/.bashrc
echo "Voila!"
