# Lambda Expressions: The fun Keyword (F#)
The `fun` keyword is used to define a lambda expression, that is, an anonymous function.

## Syntax
```fsharp
fun parameter-list -> expression
```

Or using the `_.Property` shorthand notation:

```fsharp
_.
```

`fun`, _parameter-list_, and lambda arrow (`->`) are omitted, and the `_.` is a part of _expression_ where `_` replaces the parameter symbol.

The following snippets are equivalent:

`(fun x -> x.Property)` `_.Property`

## Remarks
The _parameter-list_ typically consists of names and, optionally, types of parameters. More generally, the _parameter-list_ can be composed of any F# patterns. For a full list of possible patterns, see [Pattern Matching](../pattern-matching). Lists of valid parameters include the following examples.

```fsharp
// Lambda expressions with parameter lists.
fun a b c -> ...
fun (a: int) b c -> ...
fun (a : int) (b : string) (c:float) -> ...

// A lambda expression with a tuple pattern.
fun (a, b) -> …

// A lambda expression with a cons pattern.
// (note that this will generate an incomplete pattern match warning)
fun (head :: tail) -> …

// A lambda expression with a list pattern.
// (note that this will generate an incomplete pattern match warning)
fun [_; rest] -> …
```

The _expression_ is the body of the function, the last expression of which generates a return value. Examples of valid lambda expressions include the following:

```fsharp
fun x -> x + 1
fun a b c -> printfn "%A %A %A" a b c
fun (a: int) (b: int) (c: int) -> a + b * c
fun x y -> let swap (a, b) = (b, a) in swap (x, y)
```

## Using Lambda Expressions
Lambda expressions are especially useful when you want to perform operations on a list or other collection and want to avoid the extra work of defining a function. Many F# library functions take function values as arguments, and it can be especially convenient to use a lambda expression in those cases. The following code applies a lambda expression to elements of a list. In this case, the anonymous function checks if an element is text that ends with specified characters.

```fsharp
let fullNotation = [ "a"; "ab"; "abc" ] |> List.find ( fun text -> text.EndsWith("c") )
printfn "%A" fullNotation         // Output: "abc"

let shorthandNotation = [ "a"; "ab"; "abc" ] |> List.find ( _.EndsWith("b") )
printfn "%A" shorthandNotation    // Output: "ab"
```

The previous code snippet shows both notations: using the `fun` keyword, and the shorthand `_.Property` notation.

> Reference: https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/functions/lambda-expressions-the-fun-keyword
