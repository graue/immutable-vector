# immutable-vector

[![browser support](https://ci.testling.com/graue/immutable-vector.png)](https://ci.testling.com/graue/immutable-vector)

An efficient immutable vector in pure JavaScript. Not ready for
real-world use yet, but feedback appreciated. [Announced
here](https://scott.mn/2014/03/24/implementing_immutable_vectors_javascript/).


## Usage

In Node, or a frontend project using
[Browserify](http://browserify.org):

`npm install git+https://github.com/graue/immutable-vector.git`

~~~.js
var ImmutableVector = require('immutable-vector');

// Create an immutable vector
var v1 = new ImmutableVector(1, 2, 3);
console.log(v1.toArray()); // [ 1, 2, 3 ]

// "Change" it by pushing 4 to the end
var v2 = v1.push(4);
console.log(v2.toArray()); // [ 1, 2, 3, 4 ]

// The original is still unchanged:
console.log(v1.toArray()); // [ 1, 2, 3 ]
~~~

If you're using AMD or the a-bunch-of-script-tags approach, it doesn't
support that yet but I can if there's interest. Or you can; patches
welcome.


## API

Unless otherwise noted, all operations are [O(log32
n)](https://en.wikipedia.org/wiki/Big_O_notation). Because log32 is a
very slowly growing function (the log base 32 of two billion is ~6.2),
this can be thought of as "effectively O(1)".

For more on how it works, see [this excellent blog
post](http://hypirion.com/musings/understanding-persistent-vector-pt-1).

### constructor

`new ImmutableVector(...)`

Creates a new immutable vector with the arguments as values.

### length

`vector.length`

Number of items in the vector.

### get

`vector.get(index)`

Analog to `array[index]`. Returns the value at the index given, if `0
<= index < vector.length`, else undefined.

### set

`vector.set(index, val)`

Returns a new vector that contains val at index. For behavior similar
to `array[index] = val`, use `vector = vector.set(index, val)`.

Note: Unlike with Arrays, sparse vectors are not supported. The index
must already exist within the vector. To append, use `push`.

### push

`vector.push(val)`

Returns a new vector with val appended. For behavior similar to
`array.push(val)`, use `vector = vector.push(val)`.

### peek

`vector.peek()`

Returns the last element in the vector, or undefined if the vector is
empty. Equivalent to `vector.get(vector.length - 1)`.

### pop

`vector.pop()`

Returns a new vector with the last element removed. For behavior
similar to `x = array.pop()`, use:

~~~.js
x = vector.peek();
vector = vector.pop();
~~~

### slice

`vector.slice(begin, [end])`

Like `array.slice`. Returns a new vector that contains all the
elements starting from index `begin`, up to but not including index
`end`. If `end` is omitted, copies up to the end of the vector.

Note: Negative indices are not supported.

Note: This is O(1), but there's a catch: it works by creating a view
into the original vector. This prevents objects that are in the
original vector, but not in the slice, from being garbage collected as
long as references to the slice, or modified versions of it, remain.

### equals

`vector.equals(otherVector)`

Returns true if the two vectors are equal.

If any elements are instances of ImmutableVector, descends into those
nested vectors to check for value equality.

Does not attempt to descend into any other collection types.

Worst case O(n), where n is the total number of elements in the vector
itself and any nested vectors.

### toArray

`vector.toArray()`

Returns a plain, mutable Array with the same elements as the vector.


## Tests and benchmarks

Tests use [Mocha](http://visionmedia.github.io/mocha/). `npm test` to
run them via Node. To run them in a browser, install testling globally
(`sudo npm install -g testling`), run `testling -u` and open the URL
it prints out.

Benchmarks use [Matcha](https://github.com/logicalparadox/matcha).
`npm run benchmark`.


## Contributing

Feedback welcome, especially on the API. Is reusing Array method names
like `push` and `pop` a good idea, or confusing in light of the
different semantics?

Patches welcome, though I am picky about [commit
messages](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)
and code style looking like my code style.

Also, if you live in/will be visiting the NYC area, are friendly, and
want to pair-program on this on a weekend, get in touch. :)
