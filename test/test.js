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
    const N3 = require ('n3');

    suite ('changeset', function () {
        test ('missing', function () {
            const mbid = 'http://musicbrainz.org/artist/45a663b5-b1cb-4a91-bff6-2bef7bbfdd76#_';
            const foafName = 'http://xmlns.com/foaf/0.1/name';

            const original = N3.Store ();
            original.addTriple (mbid, foafName, 'Brittaney Spears');

            const edited = N3.Store ();
            edited.addTriple (mbid, foafName, 'Britney Spears');

            const added = edit.changeset.missing (edited, original);
            const removed = edit.changeset.missing (original, edited);

            assert.equal (added.length, 1);
            assert.equal (removed.length, 1);

            assert.equal (added[0].subject, mbid);
            assert.equal (added[0].predicate, foafName);
            assert.equal (added[0].object, 'Britney Spears');
            assert.equal (added[0].graph, '');

            assert.equal (removed[0].subject, mbid);
            assert.equal (removed[0].predicate, foafName);
            assert.equal (removed[0].object, 'Brittaney Spears');
            assert.equal (removed[0].graph, '');
        });
    });
}));

// -*- mode: javascript-mode -*-
