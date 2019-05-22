package com.mycompany.app;

import java.io.File;

import de.tudarmstadt.ukp.jwktl.JWKTL;
import de.tudarmstadt.ukp.jwktl.api.IWiktionaryEdition;
import de.tudarmstadt.ukp.jwktl.api.PartOfSpeech;
import de.tudarmstadt.ukp.jwktl.api.IWiktionaryPage;
import de.tudarmstadt.ukp.jwktl.api.IWiktionaryTranslation;
import de.tudarmstadt.ukp.jwktl.api.IWiktionaryRelation;
import de.tudarmstadt.ukp.jwktl.api.IWiktionaryEntry;
import de.tudarmstadt.ukp.jwktl.api.IWiktionarySense;
import de.tudarmstadt.ukp.jwktl.api.IWiktionaryWordForm;
import de.tudarmstadt.ukp.jwktl.api.IWikiString;
import de.tudarmstadt.ukp.jwktl.api.util.Language;

import java.io.PrintStream;
import java.io.UnsupportedEncodingException;

public class MainClass {

	/**
	 * @param args
	 */

	public static void main(String[] args) throws Exception {
        PrintStream out = new PrintStream(System.out, true, "UTF-8");

//
		boolean OVERWRITE_EXISTING_FILES = false;
		boolean overwriteExisting = OVERWRITE_EXISTING_FILES;
		String TARGET_DIRECTORY;
        String str;
        //out.println(args.length);
		if (args.length == 3 & args[0].equals("-d")) {
			TARGET_DIRECTORY = args[2];
            out.println(args[0]);
			if (args[0].equals("-d")) {
                out.println("parsing Wiktionary dump");
				//String PATH_TO_DUMP_FILE = "/opt/enwikt/enwiktionary-20180320-pages-articles.xml.bz2";
				String PATH_TO_DUMP_FILE = args[1];
				TARGET_DIRECTORY = args[2];
				File dumpFile = new File(PATH_TO_DUMP_FILE);
		        File outputDirectory = new File(TARGET_DIRECTORY);
	       		JWKTL.parseWiktionaryDump(dumpFile, outputDirectory, overwriteExisting);
			}
		} else {
			TARGET_DIRECTORY = args[0];
        }
//		
//		    
		// Connect to the Wiktionary database.
		File wiktionaryDirectory = new File(TARGET_DIRECTORY);
		IWiktionaryEdition wkt = JWKTL.openEdition(wiktionaryDirectory);

		//TODO: Query the data you need.
       IWiktionaryPage page = wkt.getPageForWord(args[1]);
       for (IWiktionaryEntry entry : page.getEntries()) {
//           if (entry.getWordLanguage() == Language.get("fin") )
//           for (IWiktionaryTranslation translation : entry.getTranslations(page.getEntryLanguage()))
//               out.println(translation.getTranslation());
           if (entry.getWordLanguage() == Language.get(args[2]) )
//               for (IWiktionaryTranslation translation : entry.getTranslations(page.getEntryLanguage()))
//                   out.println(translation.getTranslation());
               for (IWikiString gloss : entry.getGlosses()) {
                   str = gloss.getText();
                   //out.println(str);
                   str = str.replaceAll("\\{\\{n-g\\|([^\\}\\{\\|]*)\\}\\}", "$1");
                   str = str.replaceAll("\\{\\{l\\|en\\|([^\\}\\{\\|]*)\\}\\}", "$1");
                   str = str.replaceAll("\\{\\{m\\|fi\\|([^\\}\\{\\|]*)\\}\\}", "$1");
                   str = str.replaceAll("\\{\\{l\\|fi\\|([^\\}\\{\\|]*)\\|([^\\}\\{\\|]*)\\}\\}", "$1"=="" ? "$1":"$2");
                   str = str.replaceAll("\\{\\{m\\|fi\\|([^\\}\\{\\|]*)\\|([^\\}\\{\\|]*)\\}\\}", "$1"=="" ? "$1":"$2");
                   str = str.replaceAll("\\{\\{l\\|fi\\|([^\\}\\{\\|]*)\\|([^\\}\\{\\|]*)\\|[^\\{\\}]*\\}\\}", "$1"=="" ? "$1":"$2");
                   str = str.replaceAll("\\{\\{m\\|fi\\|([^\\}\\{\\|]*)\\|([^\\}\\{\\|]*)\\|[^\\{\\}]*\\}\\}", "$1"=="" ? "$1":"$2");
                   str = str.replaceAll("\\{\\{m\\|fi\\|([^\\}\\{\\|]*)\\|[^\\{\\}]*\\}\\}", "$1");
                   str = str.replaceAll("\\{\\{(?!n-g|q)[^\\{\\}]*\\}\\}", "");
                   str = str.replaceAll("\\{\\{n-g\\|([^\\}\\{\\|]*)\\}\\}", "$1");
                   str = str.replaceAll("\\{\\{q\\|([^\\}\\{\\|]*)\\}\\}", "[$1]");
                   str = str.replaceAll("\\[\\[([^\\[\\]]*)\\]\\]", "$1");
                   //str = str.replaceAll("\\{\\{[^\\{\\}]*\\}\\}", "");
                   str = str.replaceAll("''([^']*)''", "$1");
                   str = str.trim();
                   if(str != "") {
                     out.println(str);
                   }
               }
       }
		// Close the database connection.
		wkt.close();
	}
}
