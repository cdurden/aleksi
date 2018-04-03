# setup virtualenv

virtualenv-3.4 ~/venv

source ~/venv/bin/activate

cd aleksi

python setup.py install

pserve development.ini
