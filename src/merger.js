'use strict';

var GeoJSONVT = require('./geojsonvt');

var options, GeoJSONVTMerger, getId, clearCachedTiles, removeFeature, setMinMax;

options = {
    buffer: 64,
    extent: 256,
    debug: false,
    indexMaxPoints: 0,
    maxZoom: 20
};

getId = function (feature) {
    var id = null;
    if (feature.id) {
        id = feature.id;
    } else if (feature.properties) {
        id = feature.properties['id'];
    }
    return id;
};

clearCachedTiles = function (geojsonvt) {
    var maxTileId = geojsonvt.getMaxTileId();

    Object.keys(geojsonvt.tiles).forEach(function (tileId) {
        if (tileId > maxTileId) {
            delete geojsonvt.tiles[tileId];
        }
    });
};

removeFeature = function (geojsonvt, featureId) {
    var tilesAffected = {};

    Object.keys(geojsonvt.tiles).forEach(function (tileId) {
        if (geojsonvt.tiles[tileId].features && geojsonvt.tiles[tileId].features[featureId]) {
            delete geojsonvt.tiles[tileId].features[featureId];
            tilesAffected[tileId] = 1;
        }
        if (geojsonvt.tiles[tileId].source && geojsonvt.tiles[tileId].source[featureId]) {
            delete geojsonvt.tiles[tileId].source[featureId];
            tilesAffected[tileId] = 1;
        }
    });
    return tilesAffected;
};

setMinMax = function (geojsonvt, tileIds) {
    var min, max, source, i, geometry, j, point;

    Object.keys(tileIds).forEach(function (tileId) {

        min = [2, 1];
        max = [-1, 0];

        if (geojsonvt.tiles && geojsonvt.tiles[tileId] && geojsonvt.tiles[tileId].source) {
            source = geojsonvt.tiles[tileId].source;

            for (i = 0; i < source.length; i++) {
                geometry = source[i].geometry;

                for (j = 0; j < geometry.length; j++) {
                    point = geometry[j];
                    min[0] = Math.min(point[0], min[0]);
                    min[1] = Math.min(point[1], min[1]);
                    max[0] = Math.max(point[0], max[0]);
                    max[1] = Math.max(point[1], max[1]);
                }
            }

            geojsonvt.tiles[tileId].min = min;
            geojsonvt.tiles[tileId].max = max;
        }

    });

};

GeoJSONVTMerger = function (geojson) {
    this.geojsonvt = new GeoJSONVT(geojson, options);
};

GeoJSONVTMerger.prototype.delete = function (geojson) {
    var i, id, tilesAffected;

    tilesAffected = {};

    clearCachedTiles(this.geojsonvt);

    for (i = 0; i < geojson.features.length; i++) {
        id = getId(geojson.features[i]);

        if (id) {
            tilesAffected = Object.assign(tilesAffected, removeFeature(this.geojsonvt, id));
        }
    }

    setMinMax(this.geojsonvt, tilesAffected);
};

GeoJSONVTMerger.prototype.merge = function (geojson) {
    var geojsonVt, self, id, tilesAffected;

    self = this;
    tilesAffected = {};
    geojsonVt = new GeoJSONVT(geojson, options);

    clearCachedTiles(this.geojsonvt);

    geojson.features.forEach(function (feature) {
        id = getId(feature);

        if (id) {

            tilesAffected = Object.assign(tilesAffected, removeFeature(self.geojsonvt, id));

            Object.keys(geojsonVt.tiles).forEach(function (tileId) {
                var tile = geojsonVt.tiles[tileId];

                self.geojsonvt.tiles[tileId] = self.geojsonvt.tiles[tileId] || {};

                if (tile.features[id]) {
                    self.geojsonvt.tiles[tileId].features[id] = tile.features[id];
                }
                if (tile.source[id]) {
                    self.geojsonvt.tiles[tileId].source[id] = tile.source[id];
                }
                if (tile.max && tile.min) {
                    if (self.geojsonvt.tiles[tileId].max) {
                        if (tile.max[0] > self.geojsonvt.tiles[tileId].max[0]) {
                            self.geojsonvt.tiles[tileId].max[0] = tile.max[0];
                        }
                        if (tile.max[1] > self.geojsonvt.tiles[tileId].max[1]) {
                            self.geojsonvt.tiles[tileId].max[1] = tile.max[1];
                        }
                    } else {
                        self.geojsonvt.tiles[tileId].max = tile.max;
                    }
                }
            });
        }
    });

    setMinMax(this.geojsonvt, tilesAffected);
};

GeoJSONVTMerger.prototype.getGeoJSONVT = function () {
    return this.geojsonvt;
};

module.exports = GeoJSONVTMerger;
