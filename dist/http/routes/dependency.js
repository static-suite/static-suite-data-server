"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dependencyTagParents = exports.dependencyInvalidatedFilepaths = exports.dependencyAllInvalidatedTags = exports.dependencyExplicitlyInvalidatedTags = exports.dependencyTreeReversed = exports.dependencyTreeRoute = exports.dependencyIndex = void 0;
const dataDir_1 = require("../../lib/store/dataDir");
const object_1 = require("../../lib/utils/object");
const dependencyManager_1 = require("../../lib/store/dependency/dependencyManager");
const dependencyTagger_1 = require("../../lib/store/dependency/dependencyTagger");
const dependencyIndex = (req, res) => {
    res.render('dependencyIndex', {
        links: {
            '/dependency/tree': 'Dependency tree',
            '/dependency/tree/reversed': 'Reversed dependency tree',
            '/dependency/invalidated/tags': 'Explicitly invalidated tags',
            '/dependency/invalidated/tags/all': 'All invalidated tags in cascade',
            '/dependency/invalidated/filepaths': 'Invalidated filepaths',
            '/dependency/tag/parents': 'Tag parents',
        },
    });
};
exports.dependencyIndex = dependencyIndex;
const dependencyTreeRoute = (req, res) => {
    dataDir_1.dataDirManager.update();
    const args = req.query;
    const response = args?.tag ? dependencyTagger_1.dependencyTree.get(args.tag) : dependencyTagger_1.dependencyTree;
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send((0, object_1.jsonify)(response));
};
exports.dependencyTreeRoute = dependencyTreeRoute;
const dependencyTreeReversed = (req, res) => {
    dataDir_1.dataDirManager.update();
    const reversedDependencyTree = (0, dependencyTagger_1.getReversedDependencyTree)();
    const args = req.query;
    const response = args?.tag
        ? reversedDependencyTree.get(args.tag)
        : reversedDependencyTree;
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send((0, object_1.jsonify)(response));
};
exports.dependencyTreeReversed = dependencyTreeReversed;
const dependencyExplicitlyInvalidatedTags = (req, res) => {
    dataDir_1.dataDirManager.update();
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send((0, object_1.jsonify)(dependencyTagger_1.invalidatedTags));
};
exports.dependencyExplicitlyInvalidatedTags = dependencyExplicitlyInvalidatedTags;
const dependencyAllInvalidatedTags = (req, res) => {
    dataDir_1.dataDirManager.update();
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send((0, dependencyManager_1.getAllInvalidatedTags)());
};
exports.dependencyAllInvalidatedTags = dependencyAllInvalidatedTags;
const dependencyInvalidatedFilepaths = (req, res) => {
    dataDir_1.dataDirManager.update();
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send(dependencyManager_1.dependencyManager.getInvalidatedFilepaths());
};
exports.dependencyInvalidatedFilepaths = dependencyInvalidatedFilepaths;
const dependencyTagParents = (req, res) => {
    dataDir_1.dataDirManager.update();
    const args = req.query;
    const response = args?.tag ? (0, object_1.jsonify)((0, dependencyManager_1.getTagParents)(args.tag)) : {};
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send(response);
};
exports.dependencyTagParents = dependencyTagParents;
