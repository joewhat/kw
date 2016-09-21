Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"
  #config.vm.network "private_network", ip: "10.10.10.46"
  config.vm.network :forwarded_port, guest: 27017, host: 27017
  config.vm.network :forwarded_port, guest: 3000, host: 3000

  config.vm.provider :virtualbox do |v|
  v.customize ["modifyvm", :id, "--memory", 2048]
  end

  config.vm.synced_folder "./", "/vagrant",
  owner: "vagrant",
  group: "www-data",
  mount_options: ["dmode=755,fmode=664"]

  config.vm.provision :shell, path: "provision.sh"
end
