# F# Interactive options
This article describes the command-line options supported by F# Interactive, `fsi.exe`. F# Interactive accepts many of the same command-line options as the F# compiler, but also accepts some additional options.

## Use F# Interactive for scripting
F# Interactive, `dotnet fsi`, can be launched interactively, or it can be launched from the command line to run a script. The command-line syntax is

```bash
dotnet fsi [options] [ script-file [arguments] ]
```

The file extension for F# script files is `.fsx`.

## Table of F# Interactive Options
The following table summarizes the options supported by F# Interactive. You can set these options on the command line or through the Visual Studio IDE. To set these options in the Visual Studio IDE, open the **Tools** menu, select **Options**, expand the **F# Tools** node, and then select **F# Interactive**.

Where lists appear in F# Interactive option arguments, list elements are separated by semicolons (`;`).

| Option  | Description |
| --- | --- |
| `--` | Instructs F# Interactive to treat remaining arguments as command-line arguments to the F# program or script, accessible via `fsi.CommandLineArgs`. |
| `--checked[+ \| -]` | Same as the `fsc.exe` compiler option. See [Compiler Options](compiler-options). |
| `--checknulls[+ \| -]` | Same as the `fsc.exe` compiler option. See [Compiler Options](compiler-options). |
| `--codepage:<int>` | Same as the `fsc.exe` compiler option. See [Compiler Options](compiler-options). |
| `--consolecolors[+ \| -]` | Outputs warning and error messages in color. |
| `--compilertool:<extensionsfolder>` | Reference an assembly or directory containing a design-time tool (Short form: `-t`). |
| `--crossoptimize[+ \| -]` | Enable or disable cross-module optimizations. |
| `--debug[+ \| -]`,<br>`--debug:[full \| pdbonly \| portable \| embedded]`,<br>`-g[+ \| -]`,<br>`-g:[full \| pdbonly \| portable \| embedded]` | Same as the `fsc.exe` compiler option. See [Compiler Options](compiler-options). |
| `--define:<string>` | Same as the `fsc.exe` compiler option. See [Compiler Options](compiler-options). |
| `--deterministic[+ \| -]` | Produces a deterministic assembly (including module version GUID and timestamp). |
| `--exec` | Exits after loading files or running the specified script. |
| `--fullpaths` | Same as the `fsc.exe` compiler option. See [Compiler Options](compiler-options). |
| `--gui[+ \| -]` | Enables or disables the Windows Forms event loop (default: enabled). |
| `--help`,<br>`-?` | Displays command-line syntax and a brief description of each option. |
| `--lib:<folder-list>`,<br>`-I:<folder-list>` | Same as the `fsc.exe` compiler option. See [Compiler Options](compiler-options). |
| `--load:<filename>` | Compiles the given source code at startup and loads the compiled constructs into the session. |
| `--mlcompatibility` | Same as the `fsc.exe` compiler option. See [Compiler Options](compiler-options). |
| `--noframework` | Same as the `fsc.exe` compiler option. See [Compiler Options](compiler-options). |
| `--nologo` | Same as the `fsc.exe` compiler option. See [Compiler Options](compiler-options). |
| `--nowarn:<warning-list>` | Same as the `fsc.exe` compiler option. See [Compiler Options](compiler-options). |
| `--optimize[+ \| -]` | Same as the `fsc.exe` compiler option. See [Compiler Options](compiler-options). |
| `--preferreduilang:<lang>` | Specifies preferred output language culture (e.g., `es-ES`, `ja-JP`). |
| `--quiet` | Suppresses output to `stdout`. |
| `--quotations-debug` | Emits extra debug info for quotation literals and reflected definitions. See [Code Quotations](code-quotations) and [Expr.CustomAttributes](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-quotations-fsharpexpr.html#CustomAttributes). |
| `--readline[+ \| -]` | Enables or disables tab completion in interactive mode. |
| `--reference:<filename>`,<br>`-r:<filename>` | Same as the `fsc.exe` compiler option. See [Compiler Options](compiler-options). |
| `--tailcalls[+ \| -]` | Enables or disables tail call IL instruction (enabled by default). |
| `--targetprofile:<string>` | Sets target framework profile: `mscorlib`, `netcore`, or `netstandard` (default: `mscorlib`). |
| `--use:<filename>` | Uses the given file on startup as initial input. |
| `--utf8output` | Same as the `fsc.exe` compiler option. See [Compiler Options](compiler-options). |
| `--warn:<warning-level>` | Same as the `fsc.exe` compiler option. See [Compiler Options](compiler-options). |
| `--warnaserror[+ \| -]` | Same as the `fsc.exe` compiler option. See [Compiler Options](compiler-options). |
| `--warnaserror[+ \| -]:<int-list>` | Same as the `fsc.exe` compiler option. See [Compiler Options](compiler-options). |

## F# Interactive structured printing
F# Interactive (`dotnet fsi`) uses an extended version of [structured plain text formatting](plaintext-formatting) to report values.

1.  All features of `%A` plain text formatting are supported, and some are additionally customizable.
    
2.  Printing is colorized if colors are supported by the output console.
    
3.  A limit is placed on the length of strings shown, unless you explicitly evaluate that string.
    
4.  A set of user-definable settings is available via the `fsi` object.
    

The available settings to customize plain text printing for reported values are:

```fsharp
open System.Globalization

fsi.FormatProvider <- CultureInfo("de-DE")  // control the default culture for primitives

fsi.PrintWidth <- 120        // Control the width used for structured printing

fsi.PrintDepth <- 10         // Control the maximum depth of nested printing

fsi.PrintLength <- 10        // Control the length of lists and arrays

fsi.PrintSize <- 100         // Control the maximum overall object count

fsi.ShowProperties <- false  // Control whether properties of .NET objects are shown by default

fsi.ShowIEnumerable <- false // Control whether sequence values are expanded by default

fsi.ShowDeclarationValues <- false // Control whether values are shown for declaration outputs
```

### Customize with `AddPrinter` and `AddPrintTransformer`

Printing in F# Interactive outputs can be customized by using `fsi.AddPrinter` and `fsi.AddPrintTransformer`. The first function gives text to replace the printing of an object. The second function returns a surrogate object to display instead. For example, consider the following F# code:

```fsharp
open System

fsi.AddPrinter<DateTime>(fun dt -> dt.ToString("s"))

type DateAndLabel =
    { Date: DateTime
      Label: string  }

let newYearsDay1999 =
    { Date = DateTime(1999, 1, 1)
      Label = "New Year" }
```

If you execute the example in F# Interactive, it outputs based on the formatting option set. In this case, it affects the formatting of date and time:

```console
type DateAndLabel =
  { Date: DateTime
    Label: string }
val newYearsDay1999 : DateAndLabel = { Date = 1999-01-01T00:00:00
                                       Label = "New Year" }
```

`fsi.AddPrintTransformer` can be used to give a surrogate object for printing:

```fsharp
type MyList(values: int list) =
    member _.Values = values

fsi.AddPrintTransformer(fun (x:MyList) -> box x.Values)

let x = MyList([1..10])
```

This outputs:

```console
val x : MyList = [1; 2; 3; 4; 5; 6; 7; 8; 9; 10]
```

If the transformer function passed to `fsi.AddPrintTransformer` returns `null`, then the print transformer is ignored. This can be used to filter any input value by starting with type `obj`. For example:

```fsharp
fsi.AddPrintTransformer(fun (x:obj) ->
    match x with
    | :? string as s when s = "beep" -> box ["quack"; "quack"; "quack"]
    | _ -> null)

let y = "beep"
```

This outputs:

```console
val y : string = ["quack"; "quack"; "quack"]
```
> Reference: https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/fsharp-interactive-options
