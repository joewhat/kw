#!/usr/bin/env bash

apt-get update
apt-get -y upgrade
apt-get install -y git
apt-get install -y htop
apt-get install -y g++
apt-get install -y build-essential
apt-get install -y libssl-dev

# install nodejs
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
apt-get install -y nodejs

# install meteor
curl https://install.meteor.com/ | sh

# install mongodb
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
echo "deb http://repo.mongodb.com/apt/ubuntu trusty/mongodb-enterprise/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-enterprise.list
apt-get update
apt-get install -y mongodb-enterprise
# bind ip for robomongo
IP=$(ifconfig eth0 | grep "inet addr" | cut -d ':' -f 2 | cut -d ' ' -f 1)
sed -e "s|127.0.0.1|127.0.0.1,$IP|g" -i /etc/mongod.conf
service mongod restart

# mongo URL
command="export MONGO_URL=mongodb://localhost:27017/myForum"
echo $command >> /home/vagrant/.bashrc


# npm install app
cd /vagrant/app
npm install

# fix some mongo shit
# echo "export LC_ALL=C" >> /home/vagrant/.bashrc
echo "cd /vagrant/app" >> /home/vagrant/.bashrc
echo "Voila!"
