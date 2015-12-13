### Groupware Editor for Collaborative Working with Several Tools on a Web-Whiteboard
#### Suat Secmen

# German User Manual
## Server
Zuerst muss NodeJS installiert werden
(Anleitung: https://github.com/nodejs/node-v0.x-archive/wiki/Installing-Node.js-via-package-manager)

Nun wechseln wir in das Verzeichnis des Servers:
cd pfad-zum-server

Mit dem Befehl: node server.js oder nodejs server.js wird nun der Server gestartet.

## Client
Für den Client wird ein Webserver (wie Apache oder nginx) empfohlen. Auf diese Weise kann durch http://localhost/pfad-zum-client/ die PHP-Datei aufgerufen werden, die automatisch alle benötigten Dateien in der richtigen Reihenfolge und einer Version (zum Verhindern von Caching) lädt.
Falls kein Webserver zur Hand liegt kann die "static-index.html"-Datei aufgerufen werden.
Die Servereinstellungen können in der client/js/settings.js Datei eingestellt werden. Wenn man als Servernamen "tchost.de" und als Port "24690" einträgt, so wird eine Verbindung zum Server von mir hergestellt.
Noch ein Hinweis: Im Ordner "client" ist eine wohlmöglich unsichtbare ".htaccess"-Datei (zur Not existiert eine Kopie mit dem Namen "~.htaccess", was nicht unsichtbar sein sollte). Diese Datei setzt "Rewrite"-Regeln (Apache). Falls das Aktivieren von mod_rewrite in Apache oder das rewrite_module in nginx nicht möglich ist, so muss die REWRITERULE-Variable in den settings.js auf false gesetzt werden. Auf diese Weise wird auf einen Query-String ausgewichen (die Raum-ID wird hinter einem Fragezeichen in der Adressleiste angezeigt). Falls die "static-index.html"-Datei benutzt wird, ist diese Option egal (in dieser Datei wird nämlich immer auf den Query-String ausgewichen).

## Tests
Die client/testRunner.html ermöglicht das Ausführen von Tests. Die Testdateien befinden sich in client/tests/*.html, eine Verlinkung zu diesen Dateien wurde in der client/tests/-settings.js Datei eingestellt.

## Dokumentation
Um die Dokumentation zu öffnen startet man die jsdoc-client/index.html Datei. Hier kann man zu den ganzen Dokumentationen navigieren. Um nach der Bearbeitung eines Prototypen die Dokumentation neu zu generieren kann die doc.sh Datei ausgeführt werden (benötigt chmod +x).
Die conf.json Datei ist die Konfigurationsdatei für JSDoc und wird zurzeit ausschließlich zum Ausschließen von Ordnern aus der Dokumentation benutzt.

## Das Whiteboard selbst
Meiner Meinung nach ist das Whiteboard sehr intuitiv und benötigt kaum eine Einführung. Das Einzige, was weniger intuitiv ist, was in der Bachelorarbeit jedoch erklärt wurde, ist das Zeichnen von Tabellen.
Nachdem man eine Tabelle erzeugt hat ist es möglich, in der Tabelle Linien zu ziehen und dadurch Zeilen und Spalten zu erzeugen.
Ein "kleines Gimmick" im Chat ist das Umbenennen. Beim Absenden der Nachricht "/name" gefolgt von einem Leerzeichen und dem Wunschnamen ändert man seinen eigenen Namen in den Wunschnamen um. Man selbst ist nicht in der Lage den Namen zu sehen, jedoch bekommen andere Benutzer diesen Namen, statt der Benutzer-ID, neben dem Mauszeiger und im Chat angezeigt.
