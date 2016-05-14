# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  # Every Vagrant virtual environment requires a box to build off of.
  config.vm.box = "ubuntu/trusty64"

  # Create a private network, which allows host-only access to the machine using a specific IP.
  config.vm.network "private_network", ip: "10.10.10.46"

  # resize memory
  config.vm.provider :virtualbox do |v|
  v.customize ["modifyvm", :id, "--memory", 2048]
  end

  # Share an additional folder to the guest VM. The first argument is the path on the host to the actual folder.
  # The second argument is the path on the guest to mount the folder.
  #type: "rsync",
  config.vm.synced_folder "./", "/vagrant",
  #nfs: true
  owner: "vagrant",
  group: "www-data",
  mount_options: ["dmode=755,fmode=664"]

  # Define the bootstrap file: A (shell) script that runs after first setup of your box (= provisioning)
  config.vm.provision :shell, path: "provision.sh"


end
