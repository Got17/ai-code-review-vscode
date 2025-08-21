# Active Patterns
_Active patterns_ enable you to define named partitions that subdivide input data, so that you can use these names in a pattern matching expression just as you would for a discriminated union. You can use active patterns to decompose data in a customized manner for each partition.

## Syntax
```fsharp
// Active pattern of one choice.
let (|identifier|) [arguments] valueToMatch = expression

// Active Pattern with multiple choices.
// Uses a FSharp.Core.Choice<_,...,_> based on the number of case names. In F#, the limitation n <= 7 applies.
let (|identifier1|identifier2|...|) valueToMatch = expression

// Partial active pattern definition.
// Can use FSharp.Core.option<_>, FSharp.Core.voption<_> or bool to represent if the type is satisfied at the call site.
let (|identifier|_|) [arguments] valueToMatch = expression
```

## Remarks
In the previous syntax, the identifiers are names for partitions of the input data that is represented by _arguments_, or, in other words, names for subsets of the set of all values of the arguments. There can be up to seven partitions in an active pattern definition. The _expression_ describes the form into which to decompose the data. You can use an active pattern definition to define the rules for determining which of the named partitions the values given as arguments belong to. The (| and |) symbols are referred to as _banana clips_ and the function created by this type of let binding is called an _active recognizer_.

As an example, consider the following active pattern with an argument.

```fsharp
let (|Even|Odd|) input = if input % 2 = 0 then Even else Odd
```

You can use the active pattern in a pattern matching expression, as in the following example.

```fsharp
let TestNumber input =
   match input with
   | Even -> printfn "%d is even" input
   | Odd -> printfn "%d is odd" input

TestNumber 7
TestNumber 11
TestNumber 32
```

The output of this program is as follows:

```console
7 is odd
11 is odd
32 is even
```

Another use of active patterns is to decompose data types in multiple ways, such as when the same underlying data has various possible representations. For example, a `Color` object could be decomposed into an RGB representation or an HSB representation.

```fsharp
open System.Drawing

let (|RGB|) (col : System.Drawing.Color) =
     ( col.R, col.G, col.B )

let (|HSB|) (col : System.Drawing.Color) =
   ( col.GetHue(), col.GetSaturation(), col.GetBrightness() )

let printRGB (col: System.Drawing.Color) =
   match col with
   | RGB(r, g, b) -> printfn " Red: %d Green: %d Blue: %d" r g b

let printHSB (col: System.Drawing.Color) =
   match col with
   | HSB(h, s, b) -> printfn " Hue: %f Saturation: %f Brightness: %f" h s b

let printAll col colorString =
  printfn "%s" colorString
  printRGB col
  printHSB col

printAll Color.Red "Red"
printAll Color.Black "Black"
printAll Color.White "White"
printAll Color.Gray "Gray"
printAll Color.BlanchedAlmond "BlanchedAlmond"
```

The output of the above program is as follows:

```console
Red
 Red: 255 Green: 0 Blue: 0
 Hue: 360.000000 Saturation: 1.000000 Brightness: 0.500000
Black
 Red: 0 Green: 0 Blue: 0
 Hue: 0.000000 Saturation: 0.000000 Brightness: 0.000000
White
 Red: 255 Green: 255 Blue: 255
 Hue: 0.000000 Saturation: 0.000000 Brightness: 1.000000
Gray
 Red: 128 Green: 128 Blue: 128
 Hue: 0.000000 Saturation: 0.000000 Brightness: 0.501961
BlanchedAlmond
 Red: 255 Green: 235 Blue: 205
 Hue: 36.000000 Saturation: 1.000000 Brightness: 0.901961
```

In combination, these two ways of using active patterns enable you to partition and decompose data into just the appropriate form and perform the appropriate computations on the appropriate data in the form most convenient for the computation.

The resulting pattern matching expressions enable data to be written in a convenient way that is very readable, greatly simplifying potentially complex branching and data analysis code.

## Partial Active Patterns
Sometimes, you need to partition only part of the input space. In that case, you write a set of partial patterns each of which match some inputs but fail to match other inputs. Active patterns that do not always produce a value are called _partial active patterns_; they have a return value that is an option type. To define a partial active pattern, you use a wildcard character (\_) at the end of the list of patterns inside the banana clips. The following code illustrates the use of a partial active pattern.

```fsharp
let (|Integer|_|) (str: string) =
   let mutable intvalue = 0
   if System.Int32.TryParse(str, &intvalue) then Some(intvalue)
   else None

let (|Float|_|) (str: string) =
   let mutable floatvalue = 0.0
   if System.Double.TryParse(str, &floatvalue) then Some(floatvalue)
   else None

let parseNumeric str =
   match str with
   | Integer i -> printfn "%d : Integer" i
   | Float f -> printfn "%f : Floating point" f
   | _ -> printfn "%s : Not matched." str

parseNumeric "1.1"
parseNumeric "0"
parseNumeric "0.0"
parseNumeric "10"
parseNumeric "Something else"
```

The output of the previous example is as follows:

```console
1.100000 : Floating point
0 : Integer
0.000000 : Floating point
10 : Integer
Something else : Not matched.
```

When using partial active patterns, sometimes the individual choices can be disjoint or mutually exclusive, but they need not be. In the following example, the pattern Square and the pattern Cube are not disjoint, because some numbers are both squares and cubes, such as 64. The following program uses the AND pattern to combine the Square and Cube patterns. It prints out all integers up to 1000 that are both squares and cubes, as well as those which are only cubes.

```fsharp
let err = 1.e-10

let isNearlyIntegral (x:float) = abs (x - round(x)) < err

let (|Square|_|) (x : int) =
  if isNearlyIntegral (sqrt (float x)) then Some(x)
  else None

let (|Cube|_|) (x : int) =
  if isNearlyIntegral ((float x) ** ( 1.0 / 3.0)) then Some(x)
  else None

let findSquareCubes x =
   match x with
   | Cube x & Square _ -> printfn "%d is a cube and a square" x
   | Cube x -> printfn "%d is a cube" x
   | _ -> ()
   

[ 1 .. 1000 ] |> List.iter (fun elem -> findSquareCubes elem)
```

The output is as follows:

```console
1 is a cube and a square
8 is a cube
27 is a cube
64 is a cube and a square
125 is a cube
216 is a cube
343 is a cube
512 is a cube
729 is a cube and a square
1000 is a cube
```

## Parameterized Active Patterns
Active patterns always take at least one argument for the item being matched, but they may take additional arguments as well, in which case the name _parameterized active pattern_ applies. Additional arguments allow a general pattern to be specialized. For example, active patterns that use regular expressions to parse strings often include the regular expression as an extra parameter, as in the following code, which also uses the partial active pattern `Integer` defined in the previous code example. In this example, strings that use regular expressions for various date formats are given to customize the general ParseRegex active pattern. The Integer active pattern is used to convert the matched strings into integers that can be passed to the DateTime constructor.

```fsharp
open System.Text.RegularExpressions

// ParseRegex parses a regular expression and returns a list of the strings that match each group in
// the regular expression.
// List.tail is called to eliminate the first element in the list, which is the full matched expression,
// since only the matches for each group are wanted.
let (|ParseRegex|_|) regex str =
   let m = Regex(regex).Match(str)
   if m.Success
   then Some (List.tail [ for x in m.Groups -> x.Value ])
   else None

// Three different date formats are demonstrated here. The first matches two-
// digit dates and the second matches full dates. This code assumes that if a two-digit
// date is provided, it is an abbreviation, not a year in the first century.
let parseDate str =
   match str with
   | ParseRegex "(\d{1,2})/(\d{1,2})/(\d{1,2})$" [Integer m; Integer d; Integer y]
          -> new System.DateTime(y + 2000, m, d)
   | ParseRegex "(\d{1,2})/(\d{1,2})/(\d{3,4})" [Integer m; Integer d; Integer y]
          -> new System.DateTime(y, m, d)
   | ParseRegex "(\d{1,4})-(\d{1,2})-(\d{1,2})" [Integer y; Integer m; Integer d]
          -> new System.DateTime(y, m, d)
   | _ -> new System.DateTime()

let dt1 = parseDate "12/22/08"
let dt2 = parseDate "1/1/2009"
let dt3 = parseDate "2008-1-15"
let dt4 = parseDate "1995-12-28"

printfn "%s %s %s %s" (dt1.ToString()) (dt2.ToString()) (dt3.ToString()) (dt4.ToString())
```

The output of the previous code is as follows:

```console
12/22/2008 12:00:00 AM 1/1/2009 12:00:00 AM 1/15/2008 12:00:00 AM 12/28/1995 12:00:00 AM
```

Active patterns are not restricted only to pattern matching expressions, you can also use them on let-bindings.

```fsharp
let (|Default|) onNone value =
    match value with
    | None -> onNone
    | Some e -> e

let greet (Default "random citizen" name) =
    printfn "Hello, %s!" name

greet None
greet (Some "George")
```

The output of the previous code is as follows:

```console
Hello, random citizen!
Hello, George!
```

Note however that only single-case active patterns can be parameterized.

```fsharp
// A single-case partial active pattern can be parameterized
let (| Foo|_|) s x = if x = s then Some Foo else None
// A multi-case active patterns cannot be parameterized
// let (| Even|Odd|Special |) (s: int) (x: int) = if x = s then Special elif x % 2 = 0 then Even else Odd
```

## Return Type for Partial Active Patterns
Partial active patterns return `Some ()` to indicate a match and `None` otherwise.

Consider this match:

```fsharp
match key with
| CaseInsensitive "foo" -> ...
| CaseInsensitive "bar" -> ...
```

The partial active pattern for it would be:

```fsharp
let (|CaseInsensitive|_|) (pattern: string) (value: string) =
    if String.Equals(value, pattern, StringComparison.OrdinalIgnoreCase) then
        Some ()
    else
        None
```

Starting with F# 9, such patterns can also return `bool`:

```fsharp
let (|CaseInsensitive|_|) (pattern: string) (value: string) =
    String.Equals(value, pattern, StringComparison.OrdinalIgnoreCase)
```

## Struct Representations for Partial Active Patterns
By default, if a partial active pattern returns an `option`, this will involve an allocation for the `Some` value on a successful match. To avoid it, you can use a [value option](value-options) as a return value through the use of the `Struct` attribute:

```fsharp
open System

[<return: Struct>]
let (|Int|_|) str =
   match Int32.TryParse(str) with
   | (true, n) -> ValueSome n
   | _ -> ValueNone
```

The attribute must be specified, because the use of a struct return is not inferred from simply changing the return type to `ValueOption`. For more information, see [RFC FS-1039](https://github.com/fsharp/fslang-design/blob/main/FSharp-6.0/FS-1039-struct-representation-for-active-patterns.md).

## Null active patterns
In F# 9, nullability related active patterns were added.

The first one is `| Null | NonNull x |`, which is a recommended way to handle possible nulls. In the following example, parameter `s` is inferred nullable via this active pattern usage:

```fsharp
 let len s =
    match s with
    | Null -> -1
    | NonNull s -> String.length s
```

If you rather want to automatically throw `NullReferenceException`, you can use the `| NonNullQuick |` pattern:

```fsharp
let len (NonNullQuick str) =  // throws if the argument is null
    String.length str
```
> Reference: https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/active-patterns
