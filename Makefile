.PHONY: all server
NODE_BIN=./node_modules/.bin

all: server

server: node_modules/
	$(NODE_BIN)/http-server

node_modules/: package.json
	yarn
	touch node_modules/
