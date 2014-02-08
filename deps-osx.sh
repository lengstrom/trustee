#forked from https://github.com/gtrak/node-cljs-template/blob/master/deps.sh

# Check if lein is installed
lein version >/dev/null 2>&1 || { echo >&2 "Please install leiningen before running this script."; exit 1; }
if [ "$(echo `lein version` | grep 'Leiningen \(1.\|2.0\)')" ]; then
	echo "lein version must be 2.1 or above. Do a lein upgrade first"; exit 1;
fi

#check if unzip is installed
unzip >/dev/null 2>&1 || { echo >&2 "unzip isn't installed; it's required to extract nw"; exit 1; }

PREFIX="https://s3.amazonaws.com/node-webkit/v0.8.4/"
FILENAME="node-webkit-v0.8.4-osx-ia32"
FILE="${FILENAME}.zip"

if [ -e "lib/$FILE" ]
then
  echo "Node-webkit Already Exists, run as lib/nw"
else
  mkdir lib/ -p
  wget ${PREFIX}${FILE} -P lib/
  cd lib/
  unzip $FILE

  ln -s $FILENAME/nw ./nw
  echo "Node-webkit downloaded, run as lib/nw"
  cd ..
fi