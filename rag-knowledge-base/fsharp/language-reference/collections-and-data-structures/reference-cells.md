# Reference Cells
_Reference cells_ are storage locations that enable you to create mutable values with reference semantics.

## Syntax
```fsharp
ref expression
```

## Remarks
You use the `ref` function to create a new reference cell with an initial value. You can then change the underlying value because it is mutable. A reference cell holds an actual value; it is not just an address.

The following code example illustrates the declaration and use of reference cells.

```fsharp
let xRef = ref 10

printfn "%d" xRef.Value

xRef.Value <- 11

printfn "%d" xRef.Value
```

The output is as follows.

```console
10
11
```

Reference cells are instances of the `Ref` generic record type, which is declared as follows.

```fsharp
type Ref<'a> =
    { mutable contents: 'a }
```

The type `'a ref` is a synonym for `Ref<'a>`. The compiler and IntelliSense in the IDE display the former for this type, but the underlying definition is the latter.

The `ref` operator creates a new reference cell. The following code is the declaration of the `ref` operator.

```fsharp
let ref x = { contents = x }
```

The following table shows the features that are available on the reference cell.

| Operator, member, or field | Description | Type | Definition |
| --- | --- | --- | --- |
| `ref` (operator) | Encapsulates a value into a new reference cell. | `'a -> 'a ref` | `let ref x = { contents = x }` |
| `Value` (property) | Gets or sets the underlying value. | `unit -> 'a` | `member x.Value = x.contents` |

C# programmers should know that `ref` in C# is not the same thing as `ref` in F#. The equivalent constructs in F# are [byrefs](byrefs), which are a different concept from reference cells.

Values marked as `mutable` may be automatically promoted to `'a ref` if captured by a closure; see [Values](values/).

## Deprecated constructs
Since F# 6.0, the following operators are deprecated and their use gives informational warnings:

| Operator, member, or field | Description | Type | Definition |
| --- | --- | --- | --- |
| `!` (dereference operator, deprecated) | Returns the underlying value. | `'a ref -> 'a` | `let (!) r = r.contents` |
| `:=` (assignment operator, deprecated) | Changes the underlying value. | `'a ref -> 'a -> unit` | `let (:=) r x = r.contents <- x` |
| `contents` (record field) | Gets or sets the underlying value. | `'a` | `let ref x = { contents = x }` |

Instead, the direct use of `.Value` is preferred; see [F# RFC FS-1111](https://aka.ms/fsharp-refcell-ops).

The field `contents` is provided for compatibility with other versions of ML and will produce a warning during compilation. To disable the warning, use the `--mlcompatibility` compiler option. For more information, see [Compiler Options](compiler-options).

> Reference: https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/reference-cells
