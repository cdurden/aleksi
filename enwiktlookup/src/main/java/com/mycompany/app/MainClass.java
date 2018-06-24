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
		String PATH_TO_DUMP_FILE = "/opt/enwikt/enwiktionary-20180320-pages-articles.xml.bz2";
		String TARGET_DIRECTORY = args[0];
		boolean OVERWRITE_EXISTING_FILES = false;
//		
//		File dumpFile = new File(PATH_TO_DUMP_FILE);
		File outputDirectory = new File(TARGET_DIRECTORY);
		boolean overwriteExisting = OVERWRITE_EXISTING_FILES;
//		    
//		JWKTL.parseWiktionaryDump(dumpFile, outputDirectory, overwriteExisting);
		// Connect to the Wiktionary database.
		File wiktionaryDirectory = new File(TARGET_DIRECTORY);
		IWiktionaryEdition wkt = JWKTL.openEdition(wiktionaryDirectory);

		//TODO: Query the data you need.
       IWiktionaryPage page = wkt.getPageForWord(args[1]);
       for (IWiktionaryEntry entry : page.getEntries()) {
//           if (entry.getWordLanguage() == Language.get("fin") )
           if (entry.getWordLanguage() == Language.get(args[2]) )
               for (IWikiString gloss : entry.getGlosses())
                   out.println(gloss.getPlainText());
       }
		// Close the database connection.
		wkt.close();
	}
}
