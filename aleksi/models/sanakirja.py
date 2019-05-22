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
import aspell

lang_dict = {'fi': 'fin', 'sp': 'spa'}

# return the parts separated by hyphens
def get_wordbases(basewords_str):
    pattern = "\(([-a-zA-Z\u00C0-\u02AF]+)\)"
    word_bases = list(re.finditer(pattern, basewords_str))
    for word_base in word_bases:
        yield(word_base.group(1))

class TranslationNotFound(Exception):
    pass

class Translation(Base):
    __tablename__ = 'translations'
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True)
    lang = Column(Text)
    lemma = Column(Text, unique=True)
    en = Column(Text)
    source = Column(Text)

    def source_url(self):
        if self.source == "en.wiktionary.org":
            return("http://en.wiktionary.org/wiki/"+self.lemma)
        else:
            return(self.source)

    def to_dict(self):
        #return {'lemma': self.lemma, 'en': self.en.split(","), 'source': self.source, 'source_url': self.source_url()}
        return {'lemma': self.lemma, 'en': self.translations, 'source': self.source, 'source_url': self.source_url()}

class MissingTranslation(Base):
    __tablename__ = 'missing_translations'
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True)
    lemma = Column(Text, unique=True)
    lang = Column(Text)

    def to_dict(self):
        return {'lemma': self.lemma, 'en': ['not found']}

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
    
    def fetch_translations(self, word, lang, add_to_db=True):
        dictionary = self.parse_dictionary()
        dict_entry = next((item for item in dictionary if item["entry_key"] == word), None)
        if dict_entry:
            translation = Translation(lemma=dict_entry['entry_key'], en=",".join(dict_entry['translations']), lang=lang)
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
    def __init__(self, jarfile, enwikt_db_dir=None):
        self.jarfile = jarfile
        if enwikt_db_dir is None:
            raise IOError
        self.enwikt_db_dir = enwikt_db_dir

    def fetch_translations(self, word, lang, add_to_db=True):
#        command_full = 'java -cp %s com.mycompany.app.App %s' % (os.path.join(self.jarfile,'lookup_enwikt.jar'),word)
#        args = map(lambda s: s.decode('UTF8'), shlex.split(command_full.encode('utf8')))
        args = shlex.split('java -cp %s com.mycompany.app.MainClass %s %s %s' % (self.jarfile,self.enwikt_db_dir,word,lang))
        print(args)
        try:
            output = subprocess.check_output(args)
        except subprocess.CalledProcessError:
            raise TranslationNotFound
        translations = output.decode('utf-8').split("\n")
        regex = re.compile(r"^To")
        text_translations = [regex.sub("to", translation.strip(".")) for translation in translations if bool(translation.strip())]
        translations = []
        print(translations)
        if len(translations)>0:
            #translation = Translation(lemma=word, lang=lang, en=",".join(translations), source="en.wiktionary.org")
            for translation in text_translations:
                translation = Translation(lemma=word, lang=lang, en=translation, source="en.wiktionary.org")
                translations.append(translation)
                if add_to_db:
                    DBSession.add(translation)
        else:
#            missing_word = MissingTranslation(lemma=word)
            raise TranslationNotFound
        #return(translation)
        return(translations)

class FiBabInterface(object):
    def __init__(self):
        pass

    def fetch_translations(self, word, lang, add_to_db=True):
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
            translation = Translation(lemma=word, lang=lang, en=",".join(translations), source="fi.bab.la")
        else:
#            missing_translation = MissingTranslation(lemma=word, lang=lang)
            raise TranslationNotFound
        if add_to_db:
            DBSession.add(translation)
        return(translation)

class SanakirjaOrgInterface(object):
    def __init__(self):
        pass

    def fetch_translations(self, word, lang, add_to_db=True):
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
            translation = Translation(lemma=word, lang=lang, en=",".join(translations), source="www.sanakirja.org")
        else:
#            missing_translation = MissingTranslation(lemma=word, lang=lang)
            raise TranslationNotFound
        if add_to_db:
            DBSession.add(translation)
        return(translation)
    
class Dictionary(object):
    pass

class Diccionario(Dictionary):
    pass

class Lemma(object):
    def __init__(self, word, lang):
        self.word = word
        self.lang = lang
        self.translations = []

    def translate(self, wi):
        if self.lang == 'fi':
            lang = 'fin'
        if self.lang == 'sp':
            lang = 'spa'
        #translation = DBSession.query(Translation).filter_by(lemma=self.word, lang=lang).first()
        #if translation is not None:
        #    self.translation = translation
        #    return(self.translation)
        translations = DBSession.query(Translation).filter_by(lemma=self.word, lang=lang).all()
        if len(translations)>0:
            self.translations = translations
            return(self.translations)
        missing_translation = DBSession.query(MissingTranslation).filter_by(lemma=self.word, lang=lang).first()
        retry_lookup = False
        if missing_translation is not None and not retry_lookup:
            raise TranslationNotFound
        try:
            #self.translation = wi.fetch_translations(self.word, lang)
            #return(self.translation)
            self.translations = wi.fetch_translations(self.word, lang)
            return(self.translations)
        except TranslationNotFound:
            pass
        if missing_translation is None:
            missing_translation = MissingTranslation(lemma=self.word, lang=lang)
            print("adding missing translation "+self.word)
            DBSession.add(missing_translation)
            DBSession.flush()
            return(None)

    def to_dict(self):
        return {'lemma': self.word, 'lang': self.lang, 'translations': [translation.to_dict for translation in self.translations]}
        #return(self.translation.to_dict())

class WordMorph(object):
    def __init__(self, wordform):
        self.wordform = wordform
    def lemmatize(self):
        pass
    def tag(self):
        pass
    def analyze(self):
        self.lemmatize()
        self.tag()
    def translate(self, wi):
        for lemma in self.lemmas:
            try:
                lemma.translate(wi)
            except TranslationNotFound:
                pass
    def to_dict(self):
        lemmas = list()
        for lemma in self.lemmas:
            if len(lemma.translations) > 0:
                lemmas.append(lemma.to_dict())
        return({'wordform': self.wordform,
                'tags': self.tags,
                'lemmas': lemmas})

class FinnishWordMorph(WordMorph):
    def __init__(self, wordform, libvoikko_dir=None, voikkofi_dir=None):
        self.wordform = wordform
        self.libvoikko_dir = libvoikko_dir
        self.voikkofi_dir = voikkofi_dir
    def voikko_tags(self, word, taglang='en'):
        from aleksi.libvoikko import Voikko, Token
        LANGUAGE = u"fi"
        ENCODING = u"UTF-8"
        Voikko.setLibrarySearchPath(self.libvoikko_dir)
        voikko = Voikko(LANGUAGE, self.voikkofi_dir)
        tagdicts = voikko.analyze(word)
        if taglang == 'en':
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
    def lemmatize(self):
        word = self.wordform.lower()
        tagslist = self.voikko_tags(word)
        base_matches = list()
        try:
            [base_matches.extend(get_wordbases(tags['WORDBASES'])) for tags in tagslist]
        except:
            pass
        for tags in tagslist:
            if tags['BASEFORM'] not in base_matches:
                base_matches.append(tags['BASEFORM'])
        lemmas = list()
        self.lemmas = list()
        for baseword in base_matches:
            if baseword not in lemmas:
                lemmas.append(baseword)
                self.lemmas.append(Lemma(baseword, 'fi'))
        return(self.lemmas)
    def tag(self):
        word = self.wordform.lower()
        regex = re.compile(r"^[0-9]+-")
        word = regex.sub("",word)
        found = False
        word_parts = word.split("-")
        self.tags = self.voikko_tags(word_parts[-1])
        return(self.tags)

class SpanishWordMorph(WordMorph):
    def __init__(self, wordform, spanish_morphology_path=None):
        self.wordform = wordform
        self.spanish_morphology_path = spanish_morphology_path
    def analyze(self):
        word = self.wordform.lower()
        args = shlex.split('foma -l %s -e "echo START_FOMA_OUTPUT" -e "up %s" -q -s' % ('spanish.foma', word))
        print(args)
        try:
            output = subprocess.check_output(args, cwd=self.spanish_morphology_path)
        except subprocess.CalledProcessError:
            raise TranslationNotFound
        outstr = output.decode('utf-8')
        outstr = outstr[(outstr.find("START_FOMA_OUTPUT\n")+18):]
        print(outstr)
        tags = outstr.split("\n")[:-1]

        outstr = output.decode('utf-8')
        outstr = outstr[(outstr.find("START_FOMA_OUTPUT\n")+18):]
        print(outstr)
        tags = outstr.split("\n")[:-1]
        self.tags = list()
        self.lemmas = list()
        lemmas = list() # raw string representations of lemmas
        s = aspell.Speller('lang', 'es')
        for tag_str in tags:
            print(tag_str)
            tag_list = tag_str.split('+')
            print(tag_list)
            lemma = tag_list[0]
            if not s.check(lemma):
                continue
            tag = dict()
            tag['BASEFORM'] = lemma
            if tag_list[1] == 'V':
                tag['CLASS'] = 'verb'
            if tag_list[1] == 'A':
                tag['CLASS'] = 'adjective'
            if tag_list[1] == 'N':
                tag['CLASS'] = 'noun'
            self.tags.append(tag)
            if lemma not in lemmas:
                lemmas.append(lemma)
                self.lemmas.append(Lemma(lemma, 'sp'))
        # use aspell to get root words
        #args0 = shlex.split('echo "%s" | aspell -a -l %s munch | tail -n +2' % (word, 'es'))
        #args1= shlex.split('echo "%s" | aspell -a -l %s munch %' (word, 'es'))
        args= shlex.split('aspell -a -l %s munch' % ('es'))
        print(args)
        try:
            #output = subprocess.check_output(args, cwd=self.spanish_morphology_path, stdin=)
            Popen = subprocess.Popen(args, cwd=self.spanish_morphology_path, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
            output = Popen.communicate(input=word.encode('utf-8'))[0]
        except subprocess.CalledProcessError:
            raise TranslationNotFound
        outstr = output.decode('utf-8')
        print(outstr)
        for m in re.finditer(r"^\s*\+\s*(\w+)\s*\n", outstr, flags=re.MULTILINE):
            lemma = m.group(1)
            if lemma not in lemmas:
                lemmas.append(lemma)
                self.lemmas.append(Lemma(lemma, 'sp'))
        for m in re.finditer(r"^\s*\*\s*\n", outstr, flags=re.MULTILINE):
            if word not in lemmas:
                lemmas.append(word)
                self.lemmas.append(Lemma(word, 'sp'))
        if len(self.lemmas) == 0:
            self.lemmas.append(Lemma(word, 'sp'))
        return(self.tags)

class Sanakirja(object):
    def __init__(self, base_dir, enwikt_db_dir=None, libvoikko_dir=None, voikkofi_dir=None):
        self.base_dir = os.path.abspath(os.path.normpath(base_dir))
        self.enwikt_db_dir = enwikt_db_dir

    def voikko_tags(self, word, taglang='en'):
        from aleksi.libvoikko import Voikko, Token
        LANGUAGE = u"fi"
        ENCODING = u"UTF-8"
        Voikko.setLibrarySearchPath(self.libvoikko_dir)
        voikko = Voikko(LANGUAGE, self.voikkofi_dir)
        tagdicts = voikko.analyze(word)
        if taglang == 'en':
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
    def fetch_translations(self, word, lang, remote=True, fail_on_remote_call=False, retry_lookup=True):
        missing_translation = DBSession.query(MissingTranslation).filter_by(lemma=word, lang=lang).first()
        if missing_translation is not None and not retry_lookup:
            print("translation missing")
            return(missing_translation)
        try:
            return(DBSession.query(Translation).filter_by(lemma=word, lang=lang).one())
        except NoResultFound:
            pass
        try:
            return(WiktionaryInterface(self.base_dir, self.enwikt_db_dir).fetch_translations(word, lang))
        except TranslationNotFound:
            pass
        if remote:
            if fail_on_remote_call:
                raise RemoteCall
            try:
                return(SanakirjaOrgInterface().fetch_translations(word, lang))
            except TranslationNotFound:
                pass
        if missing_translation is None:
            missing_translation = MissingTranslation(lemma=word, lang=lang)
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
        print(morph_tagdicts)
        if all(['CLASS' in morph_tagdict and morph_tagdict['CLASS']=='etunimi' for morph_tagdict in morph_tagdicts]):
            remote=False
        else:
            word = word.lower()
            remote=True
            #remote=False
            for baseword in self.get_base_matches(word, lang):
                translations = self.fetch_translations(baseword, lang, remote, fail_on_remote_call)
                data['morpheme_translations'].append([translation.to_dict for translation in translations])
        if not data['morpheme_translations']:
            translations = self.fetch_translations(word, lang, remote, fail_on_remote_call)
            data['morpheme_translations'].append([translation.to_dict for translation in translations])
        return(data)
    

    def get_base_matches(self, word, lang):
        tagslist = self.voikko_tags(word)
        base_matches = list()
        print(tagslist)
        try:
            [base_matches.extend(get_wordbases(tags['WORDBASES'])) for tags in tagslist]
        except:
            pass
        for tags in tagslist:
            if tags['BASEFORM'] not in base_matches:
                base_matches.append(tags['BASEFORM'])
        return(list(set(base_matches)))

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
