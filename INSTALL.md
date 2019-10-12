# Prerequisites

libvoikko1

apt-get install libvoikko1
apt-get install voikko-fi
apt-get install phantomjs

# Setting up Google OAuth
https://console.developers.google.com/?pli=1

# setup virtualenv

    virtualenv /virtualenv
    source /virtualenv/bin/activate
    cd /wsgi/aleksi
    python setup.py develop

# Setup aleksi
The main configuration settings are:

enwikt_db_dir = /enwikt/

# anki integration

# Setting up apache
The file wsgi.conf.example provides an example wsgi configuration that can be added to /etc/apache2/conf-enabled to configure apache to load the aleksi wsgi app. This configuration file depends on environmental variables (which will be loaded only if the mod_env module is loaded in apache). To set these environmental variables through systemd, the apache2.service.example file contains a systemd unit file which can be copied to /etc/systemd/system/apache2.service. It will read environmental variables from /etc/default/wsgi, so set the WSGI_APPS_PATH and WSGI_PYTHON_HOME variables there. In order to reload the systemd configuration files, run systemctl daemon-reload.

# Fix AWS issue with python not finding modules in lib64 directory

export PYTHONPATH="${APACHE_WSGI_PYTHON_PATH}/lib64/"

# Setting up the wiktionary database
 1. Download the wiktionary dump, e.g.
    wget https://dumps.wikimedia.org/enwiktionary/latest/enwiktionary-latest-pages-articles.xml.bz2
 2. Generate the database files
    mkdir /enwikt
    java -jar enwiktlookup/target/enwiktlookup-1.0-SNAPSHOT-jar-with-dependencies.jar -d enwiktionary-latest-pages-articles.xml.bz2 /enwikt/

# Build WiktionaryParser
cd WiktionaryParser
./make.sh

# Spanish support
git clone https://github.com/gebetix/spanish-morphology.git

# Prepopulating the Finnish translation database
pip install wiktextract
screen
wiktwords enwiktionary-latest-pages-articles.xml.bz2 --out wikt.words --language Finnish
sudo cp wikt.words ${WSGI_APPS_PATH}/master/aleksi/
ln -s ${WSGI_APPS_PATH}/master/aleksi/wikt.words ${WSGI_APPS_PATH}/dev/aleksi/
python initdb.py apache.ini
