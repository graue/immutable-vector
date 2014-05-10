exports.nodeBits = 5;
exports.nodeSize = (1<<exports.nodeBits); // 32
exports.nodeBitmask = exports.nodeSize - 1;

// This tag is used to test if an object is an immutable vector, to
// work around limitations of 'instanceof'. The version number here
// should in theory (once the library approaches stability) be bumped
// each time the internal representation changes such that vectors
// produced by a newer version of the lib lack backwards or forwards
// compatibility.
exports.tag = 'ImmutableVector v1';
