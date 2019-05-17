# Prerequisites

libvoikko1

apt-get install libvoikko1
apt-get install voikko-fi
apt-get install phantomjs

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
