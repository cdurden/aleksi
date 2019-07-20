import os
import re
from bs4 import BeautifulSoup
from bs4 import NavigableString
import string
import datetime as _datetime
from urllib.parse import urljoin,urlsplit
import shlex
from subprocess import check_call, call
from sqlalchemy import Date, cast, desc
import magic

from . import *

from sqlalchemy import (
    Column,
    Integer,
    Text,
    DateTime,
    String,
    Boolean,
    )

from sqlalchemy.orm import relationship


def strip_punctuation(word):
    exclude = set(string.punctuation)+set(['"'])-set(['-'])
    out = "".join(ch for ch in word if ch not in exclude)
    return(out)

def link_words_in_elmt(elmt,soup):
    if type(elmt) == NavigableString:
        words = elmt.split()
        for word in words:
            link = soup.new_tag("a")
            link['class'] = "lookup"
            link['href'] = "lookup?word="+strip_punctuation(word)
            link.string = word 
        #    print(link)
            elmt.parent.append(link)
        elmt.string.replace_with('')
    else:
        contents = [elmt for elmt in elmt.contents]
        for _elmt in contents:
            link_words_in_elmt(_elmt,soup)

def js_link_words_in_elmt(elmt,soup,request):
    if type(elmt) == NavigableString:
        words = elmt.split()
        for word in words:
            link = soup.new_tag("a")
            link['class'] = "lookup"
            link['href'] = request.route_path('analyse',word=strip_punctuation(word))
            link['onClick'] = 'lookup_word("'+strip_punctuation(word)+'");return false;'
            link.string = word 
        #    print(link)
            elmt.parent.append(link)
        elmt.string.replace_with('')
    else:
        contents = [elmt for elmt in elmt.contents]
        for _elmt in contents:
            js_link_words_in_elmt(_elmt,soup,request)

def get_website_by_url(url, expire_seconds, datetime=_datetime.datetime.today()):
    if datetime is None:
        website = DBSession.query(Website).filter_by(url=url).order_by(desc(Website.datetime)).first()
    else:
        since = _datetime.datetime.now() - _datetime.timedelta(seconds=expire_seconds) 
        website = DBSession.query(Website).filter(Website.url==url,Website.datetime > since).order_by(desc(Website.datetime)).first()
    if website is None:
        raise NoResultFound
    return(website)


#def toUnicode(s):
#    if type(s) is unicode:
#        return s
#    elif type(s) is str:
#        d = chardet.detect(s)
#        (cs, conf) = (d['encoding'], d['confidence'])
#        if conf > 0.80:
#            try:
#                return s.decode( cs, errors = 'replace' )
#            except Exception as ex:
#                pass 
#    # force and return only ascii subset
#    return unicode(''.join( [ i if ord(i) < 128 else ' ' for i in s ]))

class Website(Base):
    __tablename__ = 'websites'
    id = Column(Integer, primary_key=True)
    url = Column(Text)
    title = Column(Text)
    cached_copy = Column(Text)
    snapshot = Column(Text)
    datetime = Column(DateTime)
    pins = relationship("Pin")

    def __init__(self, **kwargs):
        self.__dict__.update( kwargs )

    def to_dict(self):
        return({'id': self.id,
                'url': self.url,
                'datetime': str(self.datetime),
                'title': str(self.title)
                })


    def fetch_html(self, tempfile_path):
        import codecs
        regex = re.compile(
            r'^(?:http|ftp)s?://' # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|' #domain...
            r'localhost|' #localhost...
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' # ...or ip
            r'(?::\d+)?' # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        if regex.match(self.url):
            base_url = urljoin(urlsplit(self.url).geturl(),"/".join(urlsplit(self.url).path.split('/')[:-1]))+"/"
            cmd = "wget --quiet --tries 0 --convert-links --force-html --base={:s} {:s} --no-host-directories --output-document={:s}".format(base_url,self.url,tempfile_path)
            #cmd = "wget --quiet --tries 0 --force-html --base={:s} {:s} --no-host-directories --output-document={:s}".format(request.route_url('inject_js')+"?url="+base_url,self.url,tempfile_path)
            print(cmd)
            #cmd = "wget -q -t 0 -F --base={:s} {:s} -nH -O {:s}".format(base_url,self.url,tempfile_path)
            args = shlex.split(cmd)
            print(args)
            retcode = check_call(args)
            print(retcode)
            self.cached_copy = os.path.relpath(tempfile_path, self.html_path)
            self.datetime = _datetime.datetime.utcnow()
            with magic.Magic(flags=magic.MAGIC_MIME_ENCODING) as m:
                encoding = m.id_filename(os.path.join(self.html_path,self.cached_copy))
            with codecs.open(os.path.join(self.html_path,self.cached_copy), "r", encoding=encoding, errors='ignore') as html_doc:
                #soup = BeautifulSoup(html_doc, "html.parser")
                raw = html_doc.read()
            soup = BeautifulSoup(raw, "html.parser")
            self.title = soup.title.string or "Untitled"
        else:
            raise IOError

    def make_snapshot(self, tempfile_path):
        print(self.cached_copy)
        if self.cached_copy:
            #cmd = "xvfb-run --server-args='-screen 0, 1280x1200x24' CutyCapt --url=file://{:s} --out={:s}".format(os.path.join(self.html_path, self.cached_copy),tempfile_path)
            cmd = "phantomjs {:s} file://{:s} {:s}".format(os.path.join(self.phantomjs_script_path,'screenshot.js'), os.path.join(self.html_path, self.cached_copy),tempfile_path)
            args = shlex.split(cmd)
            call(args)
            self.snapshot = os.path.relpath(tempfile_path, self.snapshot_path)

    def aleksi_html(self, request, aleksi_dialog_html, aleksi_navbar_html, disable_links=False):
        import codecs
        #with codecs.open(self.cached_copy,encoding="utf-8") as html_doc:
        # Error handling needed, e.g.
        # try:
        # except FileNotFoundError:
        # ...
        with magic.Magic(flags=magic.MAGIC_MIME_ENCODING) as m:
            encoding = m.id_filename(os.path.join(self.html_path,self.cached_copy))
        print("Encoding: "+encoding)
        with codecs.open(os.path.join(self.html_path,self.cached_copy), "r", encoding=encoding, errors='ignore') as html_doc:
        #with codecs.open(os.path.join(self.html_path,self.cached_copy)) as html_doc:
            soup = BeautifulSoup(html_doc, "html.parser")
            head = soup.html.head
#            if disable_links:
#                for link in soup.find_all('a'):
#                    link['href'] = 'javascript:void(0)'
#            else:
#                for link in soup.find_all('a'):
#                    if 'href' in link.attrs:
#                        #link['href'] = request.route_url('inject_js')+'?url={:s}'.format(link.attrs['href'])
#                        # FIXME: we are always disabling links
#                        link['href'] = 'javascript:void(0)'
#                    else:
#                        link['href'] = 'javascript:void(0)'
            mobile_width_meta = soup.new_tag("meta", id="mobile_width_meta")
            mobile_width_meta['content'] = "width=device-width,initial-scale=1"
            mobile_width_meta['name'] = "viewport"
            settings_script = soup.new_tag("script", id="settings_script")
            settings = { 'analyse_url': request.route_path("analyse",word="__word"),
                             'share_session_url': request.route_path("share_session"),
                             'quizlet_auth_url': request.route_path('social.auth',backend='quizlet',_query={'next': request.static_path('aleksi:content/html/done.html')}),
                             'check_quizlet_auth_url': request.route_path('is_authed',provider='quizlet'),
                             'load_shared_session_url': request.route_path("load_shared_session",shared_session_hash="__shared_session_hash"),
                             'get_pins_url': request.route_path("get_pins"),
                             'unpin_url': request.route_path("unpin"),
                             'pin_url': request.route_path("pin"),
                             'get_quizlet_sets_url': request.route_path("get_quizlet_sets"),
                             'get_session_url': request.route_path("get_session"),
                             'loading_spinner_url': request.static_path('aleksi:content/img/loading_spinner.gif'),
                             'save_session_url': request.route_path("save_session"),
                             'save_pin_url': request.route_path("save_pin"),
                             'create_quizlet_set_url': request.route_path("create_quizlet_set"),
                             'sync_to_quizlet_url': request.route_path("sync_to_quizlet"),
                             'set_website_url': request.route_path("set_website"),
                             'set_quizlet_set_url': request.route_path("set_quizlet_set"),
                             'update_website_url': request.route_path("update_website"),
                           }
            
            #url_settings_script.string = ""
            #for url_setting in url_settings.items():
            #    url_settings_script.string += "var {:s} = '{:s}';\n".format(url_setting[0],url_setting[1])
            settings_script.string = "settings = {};\n"
            for setting in settings.items():
                settings_script.string += "settings['{:s}'] = '{:s}';\n".format(setting[0],setting[1])
            settings_script.string += "var mode = 'app';\n"

            vhost_path_link = soup.new_tag("link", id="vhost_path")
            vhost_path_link['href'] = request.route_path('main')

            jquery_noconflict_script = soup.new_tag("script", id="jquery_noconflict_script")
            jquery_noconflict_script.string = "var $jquery_aleksi = jQuery.noConflict();"
            md5_external_js = soup.new_tag("script")
            md5_external_js['src'] = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/md5.js'
            #https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/md5.js'
            jquery_external_js = soup.new_tag("script")
            jquery_external_js['src'] = request.static_path('aleksi:content/js/jquery-ui-1.12.0/external/jquery/jquery.js')
            jquery_outside_js = soup.new_tag("script")
            jquery_outside_js['src'] = request.static_path('aleksi:content/js/jquery.ba-outside-events.min.js')
            jqueryui_js = soup.new_tag("script")
            jqueryui_js['src'] = request.static_path('aleksi:content/js/jquery-ui-1.12.0/jquery-ui.aleksi.min.js')
            jqueryui_css = soup.new_tag("link")
            jqueryui_css['rel']="stylesheet"
            jqueryui_css['href'] = request.static_path('aleksi:content/js/jquery-ui-1.12.0/jquery-ui.min.css')
            hsfont_css = soup.new_tag("link")
            hsfont_css['rel']="stylesheet"
            hsfont_css['href'] = 'https://www.hs.fi/assets/css/fonts-main-hs.a90caa2de849f1e7.css'
            hsfont_css['media'] = "screen,print"
#            head.append(url_settings_script)
#            head.append(vhost_path_link)
#            head.append(jquery_external_js)
#            head.append(jquery_noconflict_script)
#            head.append(jqueryui_css)
#            head.append(jqueryui_js)
#            head.append(jquery_outside_js)
#            head.append(md5_external_js)

            head.insert(1,jquery_outside_js)
            head.insert(1,md5_external_js)
            head.insert(1,jqueryui_js)
            head.insert(1,jqueryui_css)
            head.insert(1,hsfont_css)
            head.insert(1,jquery_noconflict_script)
            head.insert(1,jquery_external_js)
            head.insert(1,vhost_path_link)
            #head.insert(1,url_settings_script)
            head.insert(1,mobile_width_meta)

            script_tail_regex = re.compile('.*\/script.tail.min.js.*')
            script_tail_elmts = soup.findAll(lambda tag: tag.name=="script" and 'src' in tag.attrs and script_tail_regex.match(tag.attrs['src']))
            [elmt.extract() for elmt in script_tail_elmts]

            yuireset_css = soup.new_tag("link")
            yuireset_css['rel']="stylesheet"
            yuireset_css['href'] = request.static_path('aleksi:content/css/cssreset-min.css')
            lookup_css = soup.new_tag("link")
            lookup_css['rel']="stylesheet"
            lookup_css['href']= request.static_path('aleksi:content/css/lookup.css')
            font_awesome_css = soup.new_tag("link")
            font_awesome_css['rel'] = "stylesheet"
            font_awesome_css['href'] = "//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css"
            head.append(yuireset_css)
            head.append(lookup_css)
            head.append(font_awesome_css)

            aleksi_js = soup.new_tag("script")
            aleksi_js['src'] =  request.static_path('aleksi:content/js/aleksi.js')
            head.append(aleksi_js)
            aleksi_web_methods_js = soup.new_tag("script")
            aleksi_web_methods_js['src'] =  request.static_path('aleksi:content/js/aleksi_web_methods.js')
            head.append(aleksi_web_methods_js)
            head.append(settings_script)

#            lookup_js = soup.new_tag("script")
#            lookup_js['src'] =  request.static_path('aleksi:content/js/lookup.js')
#            head.append(lookup_js)
#            word_under_cursor_js = soup.new_tag("script")
#            word_under_cursor_js['src'] =  request.static_path('aleksi:content/js/word_under_cursor.js')
#            head.append(word_under_cursor_js)
#            save_terms_js = soup.new_tag("script")
#            save_terms_js['src'] =  request.static_path('aleksi:content/js/save_terms.js')
#            head.append(save_terms_js)
#            quizlet_js = soup.new_tag("script")
#            quizlet_js['src'] =  request.static_path('aleksi:content/js/quizlet.js')
#            head.append(quizlet_js)
#            tabs_js = soup.new_tag("script")
#            tabs_js['src'] =  request.static_path('aleksi:content/js/tabs.js')
#            head.append(tabs_js)

            body = soup.html.body
            dialog = soup.new_tag("div",id="aleksi_dialog")
            body.append(dialog)
#            aleksi_tabs = soup.new_tag("div",id="aleksi_tabs")
#            ul = soup.new_tag("ul")
#            aleksi_tabs.append(ul)
#            dialog.append(aleksi_tabs)
#            quizlet_tab = soup.new_tag("div",id="quizlet_tab")
#            dialog.append(quizlet_tab)
#            print(aleksi_dialog_html)
            aleksi_dialog_soup = BeautifulSoup(aleksi_dialog_html, "html.parser")
            dialog.append(aleksi_dialog_soup)
            navbar = soup.new_tag("div",id="aleksi_navbar")
            body.append(navbar)
            aleksi_navbar_soup = BeautifulSoup(aleksi_navbar_html, "html.parser")
            navbar.append(aleksi_navbar_soup)
            
            #for text_container in soup.findAll(lambda tag: tag.name in ['h2', 'h3','p'] or tag.name in ['span'] and 'class' in tag.attrs and tag.attrs['class']=='caption'):
            #    js_link_words_in_elmt(text_container,soup,request)
        html = soup.prettify("utf-8")
        return(html)

    def save(self):
        DBSession.add(self)
        DBSession.flush()

