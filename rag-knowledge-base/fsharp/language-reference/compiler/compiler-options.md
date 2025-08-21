# Compiler options
This article describes compiler command-line options for the F# compiler. The command `dotnet build` invokes the F# compiler on F# project files. F# project files are noted with the `.fsproj` extension.

The compilation environment can also be controlled by setting the project properties. For projects targeting .NET Core, the "Other flags" property, `<OtherFlags>...</OtherFlags>` in `.fsproj`, is used for specifying extra command-line options.

## Compiler Options Listed Alphabetically
The following table shows compiler options listed alphabetically. Some of the F# compiler options are similar to the C# compiler options. If that is the case, a link to the C# compiler options topic is provided.

| Compiler Option | Description |
| --- | --- |
| `--allsigs` | Generates a new (or regenerates an existing) signature file for each source file in the compilation. For more information about signature files, see [Signatures](signature-files). |
| `-a filename.fs` | Generates a library from the specified file. This option is a short form of `--target:library filename.fs`. |
| `--baseaddress:address` | Specifies the preferred base address at which to load a DLL.<br><br>This compiler option is equivalent to the C# compiler option of the same name. For more information, see [/baseaddress (C# Compiler Options)](../../csharp/language-reference/compiler-options/advanced#baseaddress). |
| `--checknulls[+\|-]` | Enables [nullable reference types](values/null-values#null-values-starting-with-f-9), added in F# 9. |
| `--codepage:id` | Specifies which code page to use during compilation if the required page isn't the current default code page for the system.<br><br>This compiler option is equivalent to the C# compiler option of the same name. For more information, see [/code pages (C# Compiler Options)](../../csharp/language-reference/compiler-options/advanced#codepage). |
| `--consolecolors` | Specifies that errors and warnings use color-coded text on the console. |
| `--crossoptimize[+ or -]` | Enables or disables cross-module optimizations. |
| `--delaysign[+\|-]` | Delay-signs the assembly using only the public portion of the strong name key.<br><br>This compiler option is equivalent to the C# compiler option of the same name. For more information, see [/delaysign (C# Compiler Options)](../../csharp/language-reference/compiler-options/security#delaysign). |
| `--checked[+\|-]` | Enables or disables the generation of overflow checks.<br><br>This compiler option is equivalent to the C# compiler option of the same name. For more information, see [/checked (C# Compiler Options)](../../csharp/language-reference/compiler-options/language#checkforoverflowunderflow). |
| `--debug[+\|-]`,<br>`-g[+\|-]`,<br>`--debug:[full\|pdbonly]`,<br>`-g:[full\|pdbonly]` | Enables or disables the generation of debug information, or specifies the type of debug information to generate. The default is `full`. Choose `pdbonly` for limited debugging information stored in a pdb file.<br><br>Equivalent to the C# compiler option of the same name. More info: [/debug (C# Compiler Options)](../../csharp/language-reference/compiler-options/code-generation#debugtype). |
| `--define:symbol`,<br>`-d:symbol` | Defines a symbol for use in conditional compilation. |
| `--deterministic[+\|-]` | Produces a deterministic assembly (including module version GUID and timestamp). Cannot be used with wildcard version numbers; supports embedded and portable debugging types only. |
| `--doc:xmldoc-filename` | Instructs the compiler to generate XML documentation comments to the file specified. More info: [XML Documentation](xml-documentation) and [/doc (C# Compiler Options)](../../csharp/language-reference/compiler-options/output#documentationfile). |
| `--fullpaths` | Instructs the compiler to generate fully qualified paths. More info: [/fullpaths (C# Compiler Options)](../../csharp/language-reference/compiler-options/advanced#generatefullpaths). |
| `--help`,<br>`-?` | Displays usage information, including a brief description of all the compiler options. |
| `--highentropyva[+\|-]` | Enable or disable high-entropy ASLR for enhanced memory layout randomization. |
| `--keycontainer:key-container-name` | Specifies a strong name key container. |
| `--keyfile:filename` | Specifies the name of a public key file for signing the generated assembly. |
| `--lib:folder-name`,<br>`-I:folder-name` | Specifies a directory to search for assemblies that are referenced. More info: [/lib (C# Compiler Options)](../../csharp/language-reference/compiler-options/advanced#additionallibpaths). |
| `--linkresource:resource-info` | Links a specified resource to the assembly. Alternative to embedding with `--resource`. More info: [/linkresource (C# Compiler Options)](../../csharp/language-reference/compiler-options/resources#linkresources). |
| `--mlcompatibility` | Ignores warnings for features intended for compatibility with other ML versions. |
| `--noframework` | Disables the default reference to the .NET Framework assembly. |
| `--nointerfacedata` | Omits the F#-specific metadata resource normally added to an assembly. |
| `--nologo` | Suppresses display of the compiler startup banner. |
| `--nooptimizationdata` | Includes only optimization data essential for inline constructs; improves binary compatibility. |
| `--nowin32manifest` | Omits the default Win32 manifest. |
| `--nowarn:warning-number-list` | Disables specific warnings by number. More info: [/nowarn (C# Compiler Options)](../../csharp/language-reference/compiler-options/errors-warnings#nowarn). |
| `--optimize[+\|-] [options]`,<br>`-O[+\|-] [options]` | Enables/disables optimizations. Options: `nojitoptimize`, `nojittracking`, `nolocaloptimize`, `nocrossoptimize`, `notailcalls`. |
| `--out:output-filename`,<br>`-o:output-filename` | Specifies the compiled assembly/module name. More info: [/out (C# Compiler Options)](../../csharp/language-reference/compiler-options/output#outputassembly). |
| `--pathmap:path=sourcePath,...` | Maps physical paths to source paths in compiler output. More info: [/pathmap (C# Compiler Options)](../../csharp/language-reference/compiler-options/advanced#pathmap). |
| `--pdb:pdb-filename` | Sets output debug PDB filename (only with `--debug`). More info: [/pdb (C# Compiler Options)](../../csharp/language-reference/compiler-options/advanced#pdbfile). |
| `--platform:platform-name` | Specifies the target platform: `x86`, `Itanium`, `x64`, or `anycpu`. More info: [/platform (C# Compiler Options)](../../csharp/language-reference/compiler-options/output#platformtarget). |
| `--preferreduilang:lang` | Specifies the preferred output language culture (e.g., `es-ES`, `ja-JP`). |
| `--quotations-debug` | Emits extra debug info for F# quotation literals and reflected definitions. |
| `--reference:assembly-filename`,<br>`-r:assembly-filename` | References an F# or .NET assembly. More info: [/reference (C# Compiler Options)](../../csharp/language-reference/compiler-options/inputs#references). |
| `--resource:resource-filename` | Embeds a managed resource file. More info: [/resource (C# Compiler Options)](../../csharp/language-reference/compiler-options/resources#resources). |
| `--sig:signature-filename` | Generates a signature file from the assembly. More info: [Signatures](signature-files). |
| `--simpleresolution` | Resolves assembly references using Mono rules instead of MSBuild resolution. |
| `--standalone` | Produces an assembly with all dependencies embedded. |
| `--staticlink:assembly-name` | Statically links the specified assembly and dependent DLLs. |
| `--subsystemversion` | Sets the OS subsystem version for the generated executable (e.g., `6.02` for Win 8.1). |
| `--tailcalls[+\|-]` | Enables/disables tail call IL instructions for tail recursion. Enabled by default. |
| `--target:[exe\|winexe\|library\|module] filename` | Specifies output type: `exe`, `winexe`, `library`, `module`. More info: [/target (C# Compiler Options)](../../csharp/language-reference/compiler-options/output#targettype). |
| `--times` | Displays compilation timing info. |
| `--utf8output` | Prints compiler output in UTF-8 encoding. |
| `--warn:warning-level` | Sets warning level (0–5). Default is 3. More info: [/warn (C# Compiler Options)](../../csharp/language-reference/compiler-options/errors-warnings#warninglevel). |
| `--warnon:warning-number-list` | Enables specific warnings. |
| `--warnaserror[+\|-] [list]` | Treats warnings as errors. You can specify which warnings. More info: [/warnaserror (C# Compiler Options)](../../csharp/language-reference/compiler-options/errors-warnings#treatwarningsaserrors). |
| `--win32manifest:manifest-filename` | Adds a Win32 manifest file. More info: [/win32manifest (C# Compiler Options)](../../csharp/language-reference/compiler-options/resources#win32manifest). |
| `--win32res:resource-filename` | Adds a Win32 resource file. More info: [/win32res ((C#) Compiler Options)](../../csharp/language-reference/compiler-options/resources#win32resource). |

## Opt-in warnings
The F# compiler supports several opt-in warnings:

| Number | Summary | Level | Description |
| --- | --- | --- | --- |
| 21 | Recursion checked at run time | 5 | Warn when a recursive use is checked for initialization-soundness at run time. |
| 22 | Bindings executed out of order | 5 | Warn when a recursive binding may be executed out-of-order because of a forward reference. |
| 52 | Implicit copies of structs | 5 | Warn when an immutable struct is copied to ensure the original is not mutated by an operation. |
| 1178 | Implicit equality/comparison | 5 | Warn when an F# type declaration is implicitly inferred to be `NoEquality` or `NoComparison` but the attribute is not present on the type. |
| 1182 | Unused variables | n/a | Warn for unused variables. |
| 3180 | Implicit heap allocations | n/a | Warn when a mutable local is implicitly allocated as a reference cell because it has been captured by a closure. |
| 3186 | Missing metadata declaration | n/a | Warn when an F# metadata node has no matching declaration. May indicate a broken assembly; recompilation might be required. |
| 3366 | Index notation | n/a | Warn when the F# 5 index notation `expr.[idx]` is used. |
| 3388 | Additional implicit upcast | n/a | Warn when an additional upcast is implicitly used, added in F# 6. |
| 3389 | Implicit widening | n/a | Warn when an implicit numeric widening is used. |
| 3390 | Malformed XML doc comments | n/a | Warn when XML doc comments are malformed in various ways. |
| 3395 | Implicit method argument conversion | n/a | Warn when an implicit conversion is used to match the type of a method argument. |
| 3517 | InlineIfLambda failure | n/a | Warn when the F# optimizer fails to inline an `InlineIfLambda` value, for example if a computed function value has been provided instead of an explicit lambda. |
| 3559 | Type inferred as obj | n/a | Warn when a type is implicitly inferred as `obj`. Suggest adding explicit type annotations. |
| 3560 | All fields changed in record copy | n/a | Warn when a record copy-and-update expression changes all fields. Recommend using record construction syntax. |
| 3570 | Ambiguous discard or shorthand | n/a | Warn when `_` is ambiguously used both as a discard and a function shorthand in the same scope. |
| 3579 | Untyped string interpolation | n/a | Warn when interpolated strings contain untyped values. Typed format specifiers are recommended. |
| 3582 | Function shadows union case | n/a | Warn when a function definition unintentionally shadows a union case. Use parentheses to disambiguate. |

You can enable these warnings by using `/warnon:NNNN` or `<WarnOn>NNNN</WarnOn>` where `NNNN` is the relevant warning number. (You may also use the syntax `<WarnOn>FSNNNN</WarnOn>`, for example, `<WarnOn>FS3388</WarnOn>`.) Note that if the `WarnOn` property is specified multiple times, only the last occurrence is used. To specify multiple warnings, provide the `WarnOn` property once with a comma-separated string as its contents: `<WarnOn>3388,3559</WarnOn>`.

> Reference: https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/compiler-options
