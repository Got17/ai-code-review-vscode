# Compiler Directives
This topic describes compiler directives, for F# Interactive (`dotnet fsi`) directives, see [Interactive Programming with F#](../tools/fsharp-interactive/).

A compiler directive is prefixed with the # symbol and appears on a line by itself.

The following table lists the compiler directives that are available in F#.

| Directive | Description |
| --- | --- |
| `#if` *if-expression* | Supports conditional compilation. Code in the section after the `#if` is included if the *if-expression* evaluates to `defined` (see below). |
| `#else` | Supports conditional compilation. Marks a section of code to include if the symbol used with the previous `#if` does not evaluate to `defined`. |
| `#endif` | Supports conditional compilation. Marks the end of a conditional section of code. |
| ``# [line] _int_``,<br>``# [line] _int_ _string_``,<br>``# [line] _int_ _verbatim-string_`` | Indicates the original source code line and file name, for debugging. This feature is provided for tools that generate F# source code. |
| `#nowarn` *warningcodes* | Disables one or more compiler warnings as specified by *warningcodes* (see below). |
| `#warnon` *warningcodes* | Enables one or more compiler warnings as specified by *warningcodes* (see below). |

## Conditional Compilation Directives
Code that is deactivated by one of these directives appears dimmed in the Visual Studio Code Editor.

The following code illustrates the use of the `#if`, `#else`, and `#endif` directives. In this example, the code contains two versions of the definition of `function1`. When `VERSION1` is defined by using the [\-define compiler option](compiler-options), the code between the `#if` directive and the `#else` directive is activated. Otherwise, the code between `#else` and `#endif` is activated.

```fsharp
#if VERSION1
let function1 x y =
   printfn "x: %d y: %d" x y
   x + 2 * y
#else
let function1 x y =
   printfn "x: %d y: %d" x y
   x - 2*y
#endif

let result = function1 10 20
```

The `#if` directive also accepts logical expressions:

```fsharp
#if SILVERLIGHT || COMPILED && (NETCOREFX || !DEBUG)
#endif
```

The following expressions can be used.

| if-expr | evaluation |
| --- | --- |
| `if-expr1 \|\| if-expr2` | `defined` if `if-expr1` or `if-expr2` is `defined`. |
| `if-expr1 && if-expr2` | `defined` if `if-expr1` and `if-expr2` are `defined`. |
| `!if-expr1` | `defined` if `if-expr1` is not `defined`. |
| `( if-expr1 )` | defined if `if-expr1` is defined. |
| `symbol` | `defined` if it is flagged as defined by the `-define` compiler option. |

The logical operators have the usual logical precedence.

There is no `#define` compiler directive in F#. You must use the compiler option or project settings to define the symbols used by the `#if` directive.

Conditional compilation directives can be nested. Indentation is not significant for compiler directives.

## NULLABLE directive
Starting with F# 9, you can enable nullable reference types in the project:

```xml
<Nullable>enable</Nullable>
```

This automatically sets `NULLABLE` directive to the build. It's useful while initially rolling out the feature, to conditionally change conflicting code by `#if NULLABLE` hash directives:

```fsharp
#if NULLABLE 
let length (arg: 'T when 'T: not null) =
    Seq.length arg
#else
let length arg =
    match arg with
    | null -> -1
    | s -> Seq.length s
#endif
```

## Line Directives
When building, the compiler reports errors in F# code by referencing line numbers on which each error occurs. These line numbers start at 1 for the first line in a file. However, if you are generating F# source code from another tool, the line numbers in the generated code are generally not of interest, because the errors in the generated F# code most likely arise from another source. The `#line` directive provides a way for authors of tools that generate F# source code to pass information about the original line numbers and source files to the generated F# code.

When you use the `#line` directive, file names must be enclosed in quotation marks. Unless the verbatim token (`@`) appears in front of the string, you must escape backslash characters by using two backslash characters instead of one in order to use them in the path. The following are valid line tokens. In these examples, assume that the original file `Script1` results in an automatically generated F# code file when it is run through a tool, and that the code at the location of these directives is generated from some tokens at line 25 in file `Script1`.

```fsharp
# 25
#line 25
#line 25 "C:\\Projects\\MyProject\\MyProject\\Script1"
#line 25 @"C:\Projects\MyProject\MyProject\Script1"
# 25 @"C:\Projects\MyProject\MyProject\Script1"
```

These tokens indicate that the F# code generated at this location is derived from some constructs at or near line `25` in `Script1`.

Note that `#line` directives do not influence the behavior of `#nowarn` / `#warnon`. These two directives always relate the the file that is being compiled.

## Warn Directives
Warn directives disable or enable specified compiler warnings for parts of a source file.

A warn directive is a single line of source code that consists of

*   Optional leading whitespace
*   The string `#nowarn` or `#warnon`
*   Whitespace
*   One or more _warningcodes_ (see below), separated by whitespace
*   Optional whitespace
*   Optional line comment

A _warningcode_ is a sequence of digits (representing the warning number), optionally preceded by `FS`, optionally surrounded by double quotes.

A `#nowarn` directive disables a warning until a `#warnon` directive for the same warning number is found, or else until end of file. Similarly, a `#nowarn` directive disables a warning until a `#warnon` directive for the same warning numberis found, or else until end of file. Before and after such pairs, the compilation default applies, which is

*   no warning if disabled by a --nowarn compiler option (or the respective msbuild property)
*   no warning for [opt-in warnings](compiler-options#opt-in-warnings), unless enabled by the --warnon compiler option (or the respective msbuild property)

Here is a (contrived) example.

Copy

    module A
    match None with None -> ()     // warning
    let x =
        #nowarn 25
        match None with None -> 1  // no warning
        #warnon FS25
    match None with None -> ()     // warning
    #nowarn "FS25" FS007 "42"
    match None with None -> ()     // no warning
    
> Reference: https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/compiler-directives
