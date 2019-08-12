# Prerequisites

libvoikko1

apt-get install libvoikko1
apt-get install voikko-fi
apt-get install phantomjs

# Setting up Google OAuth
https://console.developers.google.com/?pli=1
# Setting up the wiktionary database
 1. Download the wiktionary dump, e.g.
    wget https://dumps.wikimedia.org/enwiktionary/20190501/enwiktionary-20190501-pages-articles.xml.bz2
 2. Generate the database files
    java -jar enwiktlookup/target/enwiktlookup-1.0-SNAPSHOT-jar-with-dependencies.jar -d ~/Downloads/enwiktionary-20190501-pages-articles.xml.bz2 ~/tmp/enwikt/

# setup virtualenv

    virtualenv-3.4 ~/venv
    source ~/venv/bin/activate
    cd aleksi
    python setup.py install
    pserve development.ini

# Setup aleksi
The main configuration settings are:

enwikt_db_dir = /home/cld/tmp/enwikt/

# anki integration

# Fix AWS issue with python not finding modules in lib64 directory

export PYTHONPATH="${APACHE_WSGI_PYTHON_PATH}/lib64/"

# Prepopulating the Finnish translation database
screen
wiktwords /opt/enwiktionary-20190723-pages-articles.xml.bz2 --out /tmp/wikt.words --language Finnish
sudo cp /tmp/wikt.words /opt
ln -s /opt/wikt.words ${WSGI_APPS_PATH}/master/aleksi/
