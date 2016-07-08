/**
 *   This file is part of wald:edit - a library for editing RDF.
 *   Copyright (C) 2016  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.1.  See copyleft-next-0.3.1.txt.
 */

'use strict';

(function (factory) {
    const imports = [
        'require',
        'chai',
        '../lib/edit',
        'wald-find',
        'n3',
    ];

    if (typeof define === 'function' && define.amd) {
        define (imports, factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory (require);
    } else {
        console.log ('Module system not recognized, please use AMD or CommonJS');
    }
} (function (require) {
    const assert = require ('chai').assert;
    const edit = require ('../lib/edit');
    const find = require ('wald-find');
    const N3 = require ('n3');

    const mbid = 'http://musicbrainz.org/artist/45a663b5-b1cb-4a91-bff6-2bef7bbfdd76#_';
    const a = find.a;
    const cs = find.namespaces.cs;
    const dc = find.namespaces.dc;
    const rdf = find.namespaces.rdf;
    const foaf = find.namespaces.foaf;
    const sioc = find.namespaces.sioc;

    function testData () {
        const original = N3.Store ();
        original.addTriple (mbid, foaf.name, '"Brittaney Spears"');

        const edited = N3.Store ();
        edited.addTriple (mbid, foaf.name, '"Britney Spears"');
        edited.addTriple (mbid, sioc.Microblog, 'https://twitter.com/britneySPEARS');

        return {
            original: original,
            edited: edited
        }
    }

    suite ('changeset', function () {
        test ('missing (triples removed)', function () {
            const t = testData ();

            const removed = edit.changeset.missing (t.original, t.edited);
            assert.equal (removed.length, 1);

            assert.equal (removed[0].subject, mbid);
            assert.equal (removed[0].predicate, foaf.name);
            assert.equal (removed[0].object, '"Brittaney Spears"');
            assert.equal (removed[0].graph, '');
        });

        test ('missing (triples added)', function () {
            const t = testData ();

            const added = edit.changeset.missing (t.edited, t.original);
            assert.equal (added.length, 2);

            let addedName = {};
            let addedBlog = {};

            if (added[0].predicate === foaf.name) {
                addedName = added[0];
                addedBlog = added[1];
            } else {
                addedName = added[1];
                addedBlog = added[0];
            }

            assert.equal (addedName.subject, mbid);
            assert.equal (addedName.predicate, foaf.name);
            assert.equal (addedName.object, '"Britney Spears"');
            assert.equal (addedName.graph, '');

            assert.equal (addedBlog.subject, mbid);
            assert.equal (addedBlog.predicate, sioc.Microblog);
            assert.equal (addedBlog.object, 'https://twitter.com/britneySPEARS');
            assert.equal (addedBlog.graph, '');
        });

        test ('turtle', function (done) {
            const t = testData ();

            edit.changeset.turtle (
                t.original,
                t.edited,
                'https://frob.nl/#me',
                'Fix typo, add microblog'
            ).then (find.tools.parseTurtle).then (function (datastore) {
                const c = find.factory (datastore);

                const id = c.firstSubject (a, cs.ChangeSet);
                assert.isOk (N3.Util.isBlank (id));

                assert.equal (c.firstObject (id, dc.creator), 'https://frob.nl/#me');
                assert.equal (c.firstObject (id, cs.changeReason), '"Fix typo, add microblog"');

                const added = c.allObjects (id, cs.addition);
                const removed = c.allObjects (id, cs.removal);

                assert.equal (added.length, 2);
                assert.equal (removed.length, 1);

                assert.equal (c.firstObject (removed[0], a), rdf.Statement);
                assert.equal (c.firstObject (removed[0], rdf.subject), mbid);
                assert.equal (c.firstObject (removed[0], rdf.predicate), foaf.name);
                assert.equal (c.firstObject (removed[0], rdf.object), '"Brittaney Spears"');

                done ();
            }).catch (done);
        });


    });
}));

// -*- mode: javascript-mode -*-
