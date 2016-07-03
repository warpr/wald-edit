/**
 *   This file is part of wald:find - a library for querying RDF.
 *   Copyright (C) 2016  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.1.  See copyleft-next-0.3.1.txt.
 */

'use strict';

(function (factory) {
    const imports = [
        'require',
        'n3',
        'wald-find',
        'when',
    ];

    if (typeof define === 'function' && define.amd) {
        define (imports, factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory (require);
    } else {
        console.log ('Module system not recognized, please use AMD or CommonJS');
    }
} (function (require) {
    const find = require ('wald-find');
    const N3 = require ('n3');
    const when = require ('when');

    const edit = find.prefix ('edit', 'https://waldmeta.org/.well-known/genid/', []);
    const cs = find.namespaces.cs;
    const dc = find.namespaces.dc;
    const rdf = find.namespaces.rdf;
    const a = find.a;

    /**
     * Return triples from datastore a which are missing from datastore b
     */
    function missing (a, b) {
        return a.find (null, null, null).reduce (function (memo, triple) {
            const triples = b.find (triple.subject, triple.predicate, triple.object);
            if (triples.length === 0) {
                memo.push (triple);
            }

            return memo;
        }, []);
    }

    /**
     * Return the specified triple as an rdf:Statement (reification)
     */
    function reify (writer, triple) {
        return writer.blank ([
            { predicate: a, object: rdf.Statement },
            { predicate: rdf.subject, object: triple.subject },
            { predicate: rdf.predicate, object: triple.predicate },
            { predicate: rdf.object, object: triple.object }
        ]);
    }

    function changeset (original, edited, creator, reason) {
        const deferred = when.defer ();

        const me = edit.currentEdit;

        const added = missing (edited, original);
        const removed = missing (original, edited);

        const writer = N3.Writer ({
            prefixes: {
                cs: 'http://purl.org/vocab/changeset/schema#',
                dc: 'http://purl.org/dc/terms/',
                rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
            }
        });

        const now = N3.Util.createLiteral (new Date ().toISOString ());
        const reasonLiteral = N3.Util.createLiteral (reason);

        writer.addTriple (me, a, cs.ChangeSet);
        writer.addTriple (me, dc.creator, creator);
        writer.addTriple (me, dc.date, now);
        writer.addTriple (me, cs.changeReason, reasonLiteral);

        added.forEach ((triple) => writer.addTriple (me, cs.addition, reify (writer, triple)));
        removed.forEach ((triple) => writer.addTriple (me, cs.removal, reify (writer, triple)));

        writer.end ((error, result) => {
            if (error) {
                deferred.reject (error);
            } else {
                deferred.resolve (result.replace ('<' + me + '>', '[]'));
            }
        });

        return deferred.promise;
    }

    return {
        missing: missing,
        changeset: changeset
    };
}));
