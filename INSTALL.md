# Prerequisites

libvoikko1

apt-get install libvoikko1
apt-get install voikko-fi
apt-get install phantomjs

# Setting up Google OAuth
https://console.developers.google.com/?pli=1

# Setting up the wiktionary database
 1. Download the wiktionary dump, e.g.
    wget https://dumps.wikimedia.org/enwiktionary/latest/enwiktionary-latest-pages-articles.xml.bz2
 2. Generate the database files
    mkdir /enwikt
    java -jar enwiktlookup/target/enwiktlookup-1.0-SNAPSHOT-jar-with-dependencies.jar -d enwiktionary-latest-pages-articles.xml.bz2 /enwikt/

# setup virtualenv

    virtualenv /virtualenv
    source /virtualenv/bin/activate
    cd /wsgi/aleksi
    python setup.py develop

# Setup aleksi
The main configuration settings are:

enwikt_db_dir = /enwikt/

# anki integration

# Fix AWS issue with python not finding modules in lib64 directory

export PYTHONPATH="${APACHE_WSGI_PYTHON_PATH}/lib64/"

# Prepopulating the Finnish translation database
screen
wiktwords enwiktionary-latest-pages-articles.xml.bz2 --out wikt.words --language Finnish
sudo cp wikt.words ${WSGI_APPS_PATH}/master/aleksi/
ln -s ${WSGI_APPS_PATH}/master/aleksi/wikt.words ${WSGI_APPS_PATH}/dev/aleksi/
python initdb.py apache.ini
