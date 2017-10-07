'use strict';

var test = require('tape');
var GeoJSONVTMerger = require('../src/merger');

var point1 = {
    type: 'FeatureCollection',
    features: [{
        id: 'point-1',
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [169, -45]
        },
        properties: {
            name: 'POINT 1',
            color: 'blue'
        }
    }]
};

var point2 = {
    type: 'FeatureCollection',
    features: [{
        id: 'point-2',
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [175, -37]
        },
        properties: {
            name: 'POINT 1',
            color: 'blue'
        }
    }]
};

var point3 = {
    type: 'FeatureCollection',
    features: [{
        id: 'point-1',
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [175, -37]
        },
        properties: {
            name: 'POINT 1',
            color: 'red'
        }
    }]
};

var point4 = {
    type: 'FeatureCollection',
    features: [{
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [175, -37]
        },
        properties: {
            id: 'point-1',
            name: 'POINT 1',
            color: 'blue'
        }
    }]
};

var point5 = {
    type: 'FeatureCollection',
    features: [{
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [169, -45]
        },
        properties: {
            name: 'POINT 1',
            color: 'blue'
        }
    }]
};

test('add point', function (t) {
    var merger;

    merger = new GeoJSONVTMerger(point1);
    merger.merge(point2);
    merger.getGeoJSONVT();
    t.end();
});

test('move point', function (t) {
    var merger;

    merger = new GeoJSONVTMerger(point1);
    merger.merge(point3);

    t.end();
});

test('delete point', function (t) {
    var merger, index, tile;

    merger = new GeoJSONVTMerger(point1);
    index = merger.getGeoJSONVT();
    index.getTile(10, 992, 655);
    merger.delete(point3);
    tile = index.getTile(10, 992, 655);

    console.log(tile);

    t.end();
});

test('id in properties', function (t) {
    var merger;

    merger = new GeoJSONVTMerger(point1);
    merger.delete(point4);
    // index = merger.getGeoJSONVT();
    t.end();
});

test('change colour', function (t) {
    var merger;

    merger = new GeoJSONVTMerger(point1);
    merger.merge(point3);
    t.end();
});

test('ignore features without id', function (t) {
    var merger;

    merger = new GeoJSONVTMerger(point5);
    merger.getGeoJSONVT();

    t.end();
});
