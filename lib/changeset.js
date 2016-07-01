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
    ];

    if (typeof define === 'function' && define.amd) {
        define (imports, factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory (require);
    } else {
        console.log ('Module system not recognized, please use AMD or CommonJS');
    }
} (function (require) {
    /**
    * Return triples from datastore a which missing from datastore b
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


    return {
        missing: missing,
    };
}));