# Top-level Makefile for Trustee
# This works on mac only, and assumes you have node-webkit installed
# If you don't, install it using brew cask install node-webkit

default: nw

nw:
	$(MAKE) -C deploy

clean-nw:
	$(MAKE) -C deploy clean

run:
	$(MAKE) -C deploy run
