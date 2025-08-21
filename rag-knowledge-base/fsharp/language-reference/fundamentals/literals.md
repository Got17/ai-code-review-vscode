# Literals
This article provides a table that shows how to specify the type of a literal in F#.

## Literal types
The following table shows the literal types in F#. Characters that represent digits in hexadecimal notation are not case-sensitive; characters that identify the type are case-sensitive.

| Type                | Description                                         | Suffix or Prefix | Examples |
|---------------------|-----------------------------------------------------|------------------|----------|
| `sbyte`             | signed 8-bit integer                                | `y`              | `86y`<br>`0b00000101y` |
| `byte`              | unsigned 8-bit natural number                       | `uy`             | `86uy`<br>`0b00000101uy` |
| `int16`             | signed 16-bit integer                               | `s`              | `86s` |
| `uint16`            | unsigned 16-bit natural number                      | `us`             | `86us` |
| `int` / `int32`     | signed 32-bit integer                               | `l` or none      | `86`<br>`86l` |
| `uint` / `uint32`   | unsigned 32-bit natural number                       | `u` or `ul`      | `86u`<br>`86ul` |
| `nativeint`         | native pointer to a signed natural number           | `n`              | `123n` |
| `unativeint`        | native pointer as an unsigned natural number        | `un`             | `0x00002D3Fun` |
| `int64`             | signed 64-bit integer                               | `L`              | `86L` |
| `uint64`            | unsigned 64-bit natural number                      | `UL`             | `86UL` |
| `single` / `float32`| 32-bit floating point number                         | `F` or `f`       | `4.14F`<br>`4.14f`<br>`infinityf`<br>`-infinityf` |
| `lf`                | 32-bit float in hex                                 | `lf`             | `0x00000000lf` |
| `float` / `double`  | 64-bit floating point number                         | none             | `4.14`<br>`2.3E+32`<br>`infinity`<br>`-infinity` |
| `LF`                | 64-bit float in hex                                 | `LF`             | `0x0000000000000000LF` |
| `bigint`            | arbitrary-precision integer                         | `I`              | `9999999999999999999999999999I` |
| `decimal`           | fixed-point or rational number                      | `M` or `m`       | `0.7833M`<br>`0.7833m` |
| `Char`              | Unicode character                                   | none             | `'a'`<br>`'\u0061'` |
| `String`            | Unicode string                                      | none             | `"text\n"`<br>`@"c:\filename"`<br>`"""<book title="Paradise Lost">"""`<br>`"string1" + "string2"` |
| `byte`              | ASCII character                                     | `B`              | `'a'B` |
| `byte[]`            | ASCII string                                        | `B`              | `"text"B` |
| `String` / `byte[]` | verbatim string                                     | `@` prefix       | `@"\\server\share"` (Unicode)<br>`@"\\server\share"B` (ASCII) |

## Named literals
Values that are intended to be constants can be marked with the [Literal](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-core-literalattribute.html) attribute.

This attribute has the effect of causing a value to be compiled as a constant. In the following example, both `x` and `y` below are immutable values, but `x` is evaluated at run-time, whereas `y` is a compile-time constant.

```fsharp
let x = "a" + "b" // evaluated at run-time

[<Literal>]
let y = "a" + "b" // evaluated at compile-time
```

Note

Functions cannot be used to compute `[<Literal>]` values because literals must be determined at compile-time and cannot depend on runtime evaluation.

### Why functions cannot compute literals

The `[<Literal>]` attribute requires values to be known at compile-time. Functions, even if they seem to produce constant outputs, are evaluated at runtime, making them unsuitable for `[<Literal>]`. This restriction ensures that literals can be safely used in scenarios like pattern matching, attribute arguments, and interop with external functions.

For instance, attempting to assign the result of a function to a literal will fail:

    [<Literal>]
    let yFunc() = "a" + "b" // error FS0267: this is not a valid constant expression
    

This distinction also matters when calling an [external function](functions/external-functions). For example, `DllImport` is an attribute that needs to know the value of `myDLL` during compilation. Without the `[<Literal>]` declaration, this code would fail to compile:

```fsharp
[<Literal>]
let myDLL = "foo.dll"

[<DllImport(myDLL, CallingConvention = CallingConvention.Cdecl)>]
extern void HelloWorld()
```

In pattern matching expressions, identifiers that begin with lowercase characters are always treated as variables to be bound, rather than as literals, so you should generally use initial capitals when you define literals.

```fsharp
[<Literal>]
let SomeJson = """{"numbers":[1,2,3,4,5]}"""

[<Literal>]
let Literal1 = "a" + "b"

[<Literal>]
let FileLocation =   __SOURCE_DIRECTORY__ + "/" + __SOURCE_FILE__

[<Literal>]
let Literal2 = 1 ||| 64

[<Literal>]
let Literal3 = System.IO.FileAccess.Read ||| System.IO.FileAccess.Write
```

### Example of concise pattern matching using Named literals

Named literals can make pattern matching more concise by avoiding the need for `when` clauses or additional logic. For example:

```fsharp
[<Literal>]
let ErrorCode = 404

let handleResponse code =
    match code with
    | ErrorCode -> "Not Found"
    | _ -> "Other Response"
```

## Remarks
Named literals are useful for:

*   Pattern matching without a `when` clause.
*   Attribute arguments.
*   Static type provider arguments.

Unicode strings can contain explicit encodings that you can specify by using `\u` followed by a 16-bit hexadecimal code (0000 - FFFF), or UTF-32 encodings that you can specify by using `\U` followed by a 32-bit hexadecimal code that represents any Unicode code point (00000000 - 0010FFFF).

The use of bitwise operators other than `|||` isn't allowed.

## Integers in other bases
Signed 32-bit integers can also be specified in hexadecimal, octal, or binary using a `0x`, `0o` or `0b` prefix, respectively.

```fsharp
let numbers = (0x9F, 0o77, 0b1010)
// Result: numbers : int * int * int = (159, 63, 10)
```

## Underscores in numeric literals
You can separate digits with the underscore character (`_`).

```fsharp
let value = 0xDEAD_BEEF

let valueAsBits = 0b1101_1110_1010_1101_1011_1110_1110_1111

let exampleSSN = 123_45_6789
```

## Special floating-point infinity values
Both the `float` and `single` floating-point numeric types have associated special values representing positive and negative infinity.

| F# value                | F# type   | Corresponding .NET value |
|-------------------------|-----------|--------------------------|
| `infinity` or `+infinity` | `float`  | [PositiveInfinity](https://learn.microsoft.com/en-us/dotnet/api/system.double.positiveinfinity#system-double-positiveinfinity) |
| `-infinity`             | `float`   | [NegativeInfinity](https://learn.microsoft.com/en-us/dotnet/api/system.double.negativeinfinity#system-double-negativeinfinity) |
| `infinityf` or `+infinityf` | `single` | [PositiveInfinity](https://learn.microsoft.com/en-us/dotnet/api/system.single.positiveinfinity#system-single-positiveinfinity) |
| `-infinityf`            | `single`  | [NegativeInfinity](https://learn.microsoft.com/en-us/dotnet/api/system.single.negativeinfinity#system-single-negativeinfinity) |

These values can be used directly or are returned when dividing by a floating-point zero or a number too small to be represented by the given type. For example:

```console
> 1.0/0.0;;
val it: float = infinity

> 1.0/(-0.0);;
val it: float = -infinity

> 1.0/0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001
;;
val it: float = infinity
```
> Reference: https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/literals
