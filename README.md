
wald:edit - A library for editing RDF
=====================================

The purpose of wald:edit is to easily record and keep track of changes to a dataset.  Each
change or edit shouldn't just change the dataset, but it should also keep a record of the
change so that other users of the dataset can see who made changes, when those changes were
made and why those changes were made.

wald:edit consists of two parts:

- wald.edit.changeset creates ChangeSet documents ("edits")
- wald.edit.sparqlUpdate turns ChangeSet documents into SPARQL updates

Changesets
----------

Edits are created by wald:edit by taking two in memory triple stores and comparing them.  For
example perhaps you loaded some data about pop star Britney Spears and a user spotted a typo
in her name:

    @prefix foaf: <http://xmlns.com/foaf/0.1/>.
    @prefix mbid: <http://musicbrainz.org/artist/>.

    mbid:45a663b5-b1cb-4a91-bff6-2bef7bbfdd76 foaf:name "Brittaney Spears".

And the user changes this to fix the typo:

    @prefix foaf: <http://xmlns.com/foaf/0.1/>.
    @prefix mbid: <http://musicbrainz.org/artist/>.

    mbid:45a663b5-b1cb-4a91-bff6-2bef7bbfdd76 foaf:name "Britney Spears".

The resulting cs:ChangeSet might look like this:

    @prefix cs: <http://purl.org/vocab/changeset/schema#>.
    @prefix dc: <http://purl.org/dc/elements/1.1/>.
    @prefix foaf: <http://xmlns.com/foaf/0.1/>.
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
    @prefix sioc: <http://rdfs.org/sioc/types#>.
    @prefix wald: <https://waldmeta.org/ns#>.
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

    [] a cs:ChangeSet;
        dc:creator <https://example.com/user/456>;
        dc:date "2014-09-16T23:59:01Z";
        cs:addition [
            a rdf:Statement;
            rdf:subject <http://musicbrainz.org/artist/45a663b5-b1cb-4a91-bff6-2bef7bbfdd76>;
            rdf:predicate foaf:name;
            rdf:object "Britney Spears"
        ];
        cs:removal [
            a rdf:Statement;
            rdf:subject <http://musicbrainz.org/artist/45a663b5-b1cb-4a91-bff6-2bef7bbfdd76>;
            rdf:predicate foaf:name;
            rdf:object "Brittaney Spears"
        ];
        cs:subjectOfChange <http://musicbrainz.org/artist/45a663b5-b1cb-4a91-bff6-2bef7bbfdd76>;
        cs:changeReason "fix typo".

Changesets can be sent to a wald:data server, which will make the changes to the dataset and
also record the changeset in an edits graph.


SPARQL Updates
--------------

This distribution also includes code to convert a cs:ChangeSet into a SPARQL UPDATE, currently
this is only tested with Apache Fuseki.

License
=======

Copyright 2016  Kuno Woudt <kuno@frob.nl>

This program is free software: you can redistribute it and/or modify
it under the terms of copyleft-next 0.3.1.  See
[copyleft-next-0.3.1.txt](copyleft-next-0.3.1.txt).

