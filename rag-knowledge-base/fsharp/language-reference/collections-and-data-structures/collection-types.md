# F# collection types
By reviewing this topic, you can determine which F# collection type best suits a particular need. These collection types differ from the collection types in .NET, such as those in the `System.Collections.Generic` namespace, in that the F# collection types are designed from a functional programming perspective rather than an object-oriented perspective. More specifically, only the array collection has mutable elements. Therefore, when you modify a collection, you create an instance of the modified collection instead of altering the original collection.

Collection types also differ in the type of data structure in which objects are stored. Data structures such as hash tables, linked lists, and arrays have different performance characteristics and a different set of available operations.

## Table of collection types
The following table shows F# collection types.

| Type | Description | Related Links |
| --- | --- | --- |
| [List](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-list-1.html) | An ordered, immutable series of elements of the same type. Implemented as a linked list. | [Lists](lists) <br><br> [List Module](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-listmodule.html) |
| [Array](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-core-array-1.html) | A fixed-size, zero-based, mutable collection of consecutive data elements that are all of the same type. | [Arrays](arrays) <br><br> [Array Module](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-arraymodule.html) <br><br> [Array2D Module](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-array2dmodule.html) <br><br> [Array3D Module](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-array3dmodule.html) |
| [seq](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-seq-1.html) | A logical series of elements that are all of one type. Sequences are particularly useful when you have a large, ordered collection of data but don't necessarily expect to use all the elements. Individual sequence elements are computed only as required, so a sequence can perform better than a list if not all the elements are used. Sequences are represented by the `seq<'T>` type, which is an alias for `IEnumerable<T>`. Therefore, any .NET Framework type that implements `System.Collections.Generic.IEnumerable<'T>` can be used as a sequence. | [Sequences](sequences) <br><br> [Seq Module](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-seqmodule.html) |
| [Map](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-fsharpmap-2.html) | An immutable dictionary of elements. Elements are accessed by key. | [Map Module](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-mapmodule.html) |
| [Set](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-fsharpset-1.html) | An immutable set that's based on binary trees, where comparison is the F# structural comparison function, which potentially uses implementations of the `System.IComparable` interface on key values. | [Set Module](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-setmodule.html) |

### Table of functions

This section compares the functions that are available on F# collection types. The computational complexity of the function is given, where N is the size of the first collection, and M is the size of the second collection, if any. A dash (-) indicates that this function isn't available on the collection. Because sequences are lazily evaluated, a function such as `Seq.distinct` may be O(1) because it returns immediately, although it still affects the performance of the sequence when enumerated.

| Function | Array | List | Sequence | Map | Set | Description |
| --- | --- | --- | --- | --- | --- | --- |
| append | O(N) | O(N) | O(N) | - | - | Returns a new collection that contains the elements of the first collection followed by elements of the second collection. |
| add | - | - | - | O(log(N)) | O(log(N)) | Returns a new collection with the element added. |
| average | O(N) | O(N) | O(N) | - | - | Returns the average of the elements in the collection. |
| averageBy | O(N) | O(N) | O(N) | - | - | Returns the average of the results of the provided function applied to each element. |
| blit | O(N) | - | - | - | - | Copies a section of an array. |
| cache | - | - | O(N) | - | - | Computes and stores elements of a sequence. |
| cast | - | - | O(N) | - | - | Converts the elements to the specified type. |
| choose | O(N) | O(N) | O(N) | - | - | Applies the given function `f` to each element `x` of the list. Returns the list that contains the results for each element where the function returns `Some(f(x))`. |
| collect | O(N) | O(N) | O(N) | - | - | Applies the given function to each element of the collection, concatenates all the results, and returns the combined list. |
| compareWith | - | - | O(N) | - | - | Compares two sequences by using the given comparison function, element by element. |
| concat | O(N) | O(N) | O(N) | - | - | Combines the given enumeration-of-enumerations as a single concatenated enumeration. |
| contains | - | - | - | - | O(log(N)) | Returns true if the set contains the specified element. |
| containsKey | - | - | - | O(log(N)) | - | Tests whether an element is in the domain of a map. |
| count | - | - | - | - | O(N) | Returns the number of elements in the set. |
| countBy | - | - | O(N) | - | - | Applies a key-generating function to each element of a sequence, and returns a sequence that yields unique keys and their number of occurrences in the original sequence. |
| copy | O(N) | - | O(N) | - | - | Copies the collection. |
| create | O(N) | - | - | - | - | Creates an array of whole elements that are all initially the given value. |
| delay | - | - | O(1) | - | - | Returns a sequence that's built from the given delayed specification of a sequence. |
| difference | - | - | - | - | O(M*log(N)) | Returns a new set with the elements of the second set removed from the first set. |
| distinct | O(1)* | | | | | Returns a sequence that contains no duplicate entries according to generic hash and equality comparisons on the entries. If an element occurs multiple times in the sequence, later occurrences are discarded. |
| distinctBy | O(1)* | | | | | Returns a sequence that contains no duplicate entries according to the generic hash and equality comparisons on the keys that the given key-generating function returns. If an element occurs multiple times in the sequence, later occurrences are discarded. |

> Reference: https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/fsharp-collection-types
