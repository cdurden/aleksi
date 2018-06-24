from . import *
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy import (
    Column,
    Integer,
    Text,
    DateTime,
    String,
    Boolean,
    )


#!/usr/bin/python3
import sys
import subprocess
import shlex
#import malaga
import os
import re
import itertools
#from urllib2 import urlopen, Request
from urllib.request import urlopen, Request
from urllib.parse import quote
from bs4 import BeautifulSoup
from pyparsing import Word,delimitedList,alphanums,alphas8bit,Dict,ZeroOrMore,Literal,Optional
from pyparsing import Word as Word_

def get_wordbases(basewords_str):
    pattern = "\(([-a-zA-Z\u00C0-\u02AF]+)\)"
    word_bases = list(re.finditer(pattern, basewords_str))
    for word_base in word_bases:
        yield(word_base.group(1))
    

class TranslationNotFound(Exception):
    pass

class Translation(Base):
    __tablename__ = 'translations'
    id = Column(Integer, primary_key=True)
    fi = Column(Text, unique=True)
    en = Column(Text)
    source = Column(Text)

    def source_url(self):
        if self.source == "en.wiktionary.org":
            return("http://en.wiktionary.org/wiki/"+self.fi)
        else:
            return(self.source)

    def to_dict(self):
        return {'fi': self.fi, 'en': self.en.split(","), 'source': self.source, 'source_url': self.source_url()}

class MissingTranslation(Base):
    __tablename__ = 'missing_translations'
    id = Column(Integer, primary_key=True)
    fi = Column(Text, unique=True)

    def to_dict(self):
        return {'fi': self.fi, 'en': ['not found']}

class DictionaryFileInterface(object):
    def __init__(self, dictionary_path):
        self.dictionary_path = dictionary_path

    def parse_dictionary(self): # TODO: handle parse errors
        g = Word_( alphanums+alphas8bit ).setResultsName("word") + Literal(":").suppress() + ZeroOrMore(delimitedList(Word_(alphanums+alphas8bit+" "), ",")).setResultsName("translations")
        dictionary = []
        import codecs
        #f = codecs.open('unicode.rst', encoding='utf-8')
        with codecs.open(self.dictionary_path,encoding='utf-8') as f:
            for line in f:
                data = g.parseString(line)
                try:
                    assert not isinstance(data.translations, str)
                    dictionary.append({'entry_key': data.word, 'translations': (data.translations.asList())})
                except AssertionError:
                    dictionary.append({'entry_key': data.word, 'translations': ([data.translations])})
        return(dictionary)
    
    def fetch_translations(self, word, add_to_db=True):
        dictionary = self.parse_dictionary()
        dict_entry = next((item for item in dictionary if item["entry_key"] == word), None)
        if dict_entry:
            translation = Translation(fi=dict_entry['entry_key'], en=",".join(dict_entry['translations']))
        else:
            raise TranslationNotFound
        if add_to_db:
            try:
                DBSession.begin_nested()
                DBSession.add(translation)
                DBSession.commit()
            except IntegrityError:
                DBSession.rollback()
        return(translation)

class WiktionaryInterface(object):
    def __init__(self, classpath, enwikt_db_dir=None):
        self.classpath = classpath
        if enwikt_db_dir is None:
            raise IOError
        self.enwikt_db_dir = enwikt_db_dir

    def fetch_translations(self, word, lang="fi", add_to_db=True):
#        command_full = 'java -cp %s com.mycompany.app.App %s' % (os.path.join(self.classpath,'lookup_enwikt.jar'),word)
#        args = map(lambda s: s.decode('UTF8'), shlex.split(command_full.encode('utf8')))
        args = shlex.split('java -cp %s com.mycompany.app.MainClass %s %s' % (os.path.join(self.classpath,'enwiktlookup.jar'),self.enwikt_db_dir,word,lang))
        print(args)
        try:
            output = subprocess.check_output(args)
        except subprocess.CalledProcessError:
            raise TranslationNotFound
        translations = output.decode('utf-8').split("\n")
        regex = re.compile(r"^To")
        translations = [regex.sub("to", translation.strip(".")) for translation in translations if bool(translation.strip())]
        print(translations)
        if len(translations)>0:
            translation = Translation(fi=word, en=",".join(translations), source="en.wiktionary.org")
        else:
#            missing_word = MissingTranslation(fi=word)
            raise TranslationNotFound
        if add_to_db:
            DBSession.add(translation)
        return(translation)

class FiBabInterface(object):
    def __init__(self):
        pass

    def fetch_translations(self, word, add_to_db=True):
        url = "http://"+quote((u"fi.bab.la/sanakirja/suomi-englanti/"+word).encode("utf8"))
        html = urlopen(url)
        soup = BeautifulSoup(html,"html.parser")
        print("FiBab")
        try:
            results = soup.find("div", class_="quick-result-overview")
            print(results)
            #tags = results.find_all("a",class_="muted-link")
            #tags = results.find_all("ul",class_="sense-group-results")
            tags = results.find_all("a")
        except AttributeError as e:
            tags = []
        translations = []
        for tag in tags:
            if len(tag.string) > 0:
                translations.append(tag.string)
        translations = [translation for translation in translations if bool(translation.strip())]
        print(translations)
        if len(translations)>0:
            translation = Translation(fi=word, en=",".join(translations), source="fi.bab.la")
        else:
#            missing_translation = MissingTranslation(fi=word)
            raise TranslationNotFound
        if add_to_db:
            DBSession.add(translation)
        return(translation)

class SanakirjaOrgInterface(object):
    def __init__(self):
        pass

    def fetch_translations(self, word, add_to_db=True):
        url = "http://www.sanakirja.org/search.php?q="+word+"&l=17&l2=3"
        process = subprocess.Popen('curl -s "'+url+'"', shell=True, stdout=subprocess.PIPE)
        html, err = process.communicate()
        soup = BeautifulSoup(html,"html.parser")
    #    print(html)
        try:
            table = soup.find(id="translations")
            rows = table.find_all("tr")
        except AttributeError as e:
            rows = []
        translations = []
        for row in rows:
            atags = row.find_all("a")
            if len(atags)>0 and len(atags[0].string)>0:
                translations.append(atags[0].string)
        translations = [translation for translation in translations if bool(translation.strip())]
        if len(translations)>0:
            translation = Translation(fi=word, en=",".join(translations), source="www.sanakirja.org")
        else:
#            missing_translation = MissingTranslation(fi=word)
            raise TranslationNotFound
        if add_to_db:
            DBSession.add(translation)
        return(translation)
    
class Sanakirja(object):
    def __init__(self, base_dir, enwikt_db_dir=None, libvoikko_dir=None, voikkofi_dir=None):
        self.base_dir = os.path.abspath(os.path.normpath(base_dir))
        self.enwikt_db_dir = enwikt_db_dir
        self.libvoikko_dir = libvoikko_dir
        self.voikkofi_dir = voikkofi_dir
#        self.dictionary_path = os.path.join(self.base_dir,"dict")
#        self.fail_list = os.path.join(self.base_dir,"fail_list")
#        self.grammar_file = os.path.join(base_dir,"aleksi","suomi_malaga","suomi.pro")

    def fetch_translations(self, word, remote=True, fail_on_remote_call=False, retry_lookup=True):
        missing_translation = DBSession.query(MissingTranslation).filter_by(fi=word).first()
        if missing_translation is not None and not retry_lookup:
            print("translation missing")
            return(missing_translation)
        try:
            return(DBSession.query(Translation).filter_by(fi=word).one())
        except NoResultFound:
            pass
#        try:
#            return(DictionaryFileInterface(os.path.join(os.path.dirname(self.base_dir),"dict")).fetch_translations(word))
#        except TranslationNotFound:
#            pass
        try:
            return(WiktionaryInterface(self.base_dir, self.enwikt_db_dir).fetch_translations(word))
        except TranslationNotFound:
            pass
        if remote:
            if fail_on_remote_call:
                raise RemoteCall
            #try:
            #    return(FiBabInterface().fetch_translations(word))
            #except TranslationNotFound:
            #    pass
            try:
                return(SanakirjaOrgInterface().fetch_translations(word))
            except TranslationNotFound:
                pass
        if missing_translation is None:
            missing_translation = MissingTranslation(fi=word)
        print("adding missing translation "+word)
        DBSession.add(missing_translation)
        DBSession.flush()
        return(missing_translation)


    def analyze_word(self, word, fail_on_remote_call=False):
        regex = re.compile(r"^[0-9]+-")
        word = regex.sub("",word)
        found = False
        word_parts = word.split("-")
        morph_tagdicts = self.voikko_tags(word_parts[-1])
        data = {'word': word, 'morph_tagdicts': morph_tagdicts}
        data['morpheme_translations'] = list()
#        if len(morph_tagdicts)==0: # no morphological tags obtained
#            word = self.fetch_translations(word, True, fail_on_remote_call)
#            if type(word)==MissingTranslation:
#                raise NoWordDataFound
#            data['words'].append(word.to_dict())
#        elif all([morph['CLASS']=='etunimi' for morph in morph_tagdicts]):
        print(morph_tagdicts)
        if all(['CLASS' in morph_tagdict and morph_tagdict['CLASS']=='etunimi' for morph_tagdict in morph_tagdicts]):
            remote=False
        else:
            word = word.lower()
            remote=True
            #remote=False
            for baseword in self.get_base_matches(word):
                translations = self.fetch_translations(baseword, remote, fail_on_remote_call)
                data['morpheme_translations'].append(translations.to_dict())
        if not data['morpheme_translations']:
            translations = self.fetch_translations(word, remote, fail_on_remote_call)
            data['morpheme_translations'].append(translations.to_dict())
        #morphemes = []
        #for word_part in word_parts:
        #    morphemes += self.get_morphemes(word_part)
        #print(str(morphemes))
        #if len(morphemes)>1 or len(word_parts)>1:
        #    for morpheme in morphemes:
        #        for baseword in self.get_base_matches(morpheme):
        #            print(baseword)
        #            word = self.fetch_translations(baseword, remote, fail_on_remote_call)
        #            data['words'].append(word.to_dict())

# look for some other information in Wiktionary
#        if not found:
#            word = self.fetch_translations(word, remote, fail_on_remote_call)
#            data['words'].append(word.to_dict())
        return(data)
    
    def voikko_tags(self, word, lang='en'):
        from aleksi.libvoikko import Voikko, Token
#        LANGUAGE = u"fi-x-morpho"
        LANGUAGE = u"fi"
        ENCODING = u"UTF-8"
        Voikko.setLibrarySearchPath(self.libvoikko_dir)
        voikko = Voikko(LANGUAGE, self.voikkofi_dir)
        tagdicts = voikko.analyze(word)
        if lang == 'en':
            tagdicts_en = []
            grammar_term_translations = {'laatusana': 'adjective', 'teonsana': 'verb', 'paikkannimi': 'place name', 'nimisana': 'noun', 'sidesana': 'conjunction', 'seikkasana': 'adverb',
                    'nimisana_laatusana': 'noun+adjective',
                    'asemosana': 'pronoun',
                    'lukusana': 'numeral',
                    'nimento': 'nominative', 'omanto': 'genitive', 'osanto': 'partitive',
                    'sisaolento': 'inessive', 'sisaeronto': 'elative', 'sisatulento': 'illative',
                    'ulkoolento': 'adessive', 'ulkoeronto': 'ablative', 'ulkotulento': 'allative',
                    'tulento': 'translative', 'keinonto': 'instructive', 'vajanto': 'abessive', 'seuranto': 'comitative',
                    'olento': 'essive',
                    'kerrontosti': 'adverbial',
                    'past_imperfective': 'past imperfective', 'present_simple': 'present simple', }
            for tagdict in tagdicts:
                tagdict_en = {}
                for k,v in tagdict.items():
                    if v in grammar_term_translations:
                        tagdict_en[k] = grammar_term_translations[v]
                    else:
                        tagdict_en[k] = v
                print(tagdict_en)
                tagdicts_en.append(tagdict_en)
            return(tagdicts_en)
        else:
            return(tagdicts)

    def get_base_matches(self, word):
        tagslist = self.voikko_tags(word)
        base_matches = list()
        print(tagslist)
        [base_matches.extend(get_wordbases(tags['WORDBASES'])) for tags in tagslist]
        for tags in tagslist:
            if tags['BASEFORM'] not in base_matches:
                base_matches.append(tags['BASEFORM'])
        #base_matches = [tags['BASEFORM'] for tags in tagslist]
        #base_matches = [tags['BASEFORM'] for tags in tagslist]
        return(list(set(base_matches)))
        #return([tags['BASEFORM'] for tags in tagslist])
#        g  = malaga.MalagaGrammar(self.grammar_file)
#        matches = g.analyze(word,malaga.MORPHOLOGY)
#        return(list(set(matches)))

    def get_morphemes(self, word):
        tagslist = self.voikko_tags(word)
        out = "Voikko grammatical analysis\n"
        if tagslist:
            for tag in tagslist:
                word_boundaries = list(itertools.accumulate([len(part) for part in tag['STRUCTURE'].split("=")]))
                morphemes = [word[i:j] for i,j in zip(word_boundaries,word_boundaries[1:])]
            return(morphemes)
        else:
            return([])
