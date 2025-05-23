# Repository: dotnet-websharper/core
## Branch: master

## File: docs/CSharpIntro.md
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/CSharpIntro.md

```md
Introducing WebSharper for C#

WebSharper is a web development framework for the C# and F# languages.
Write full stack web applications in a single language or mixing the two .NET languages.
Client-side JavaScript code are generated from the original C# source where annotated.
Calling the server asynchronously is as simple as calling a `Remote`-annotated `static async` method from client-side code, no extra plumbing required.

Additional features:

* Analyzer for continous code assistance. See WebSharper-specific warnings and errors quickly as you code.
* Type-safe site maps and links.
With the Sitelets API, you can define the pages of your website with a class hierarchy and URLs will be inferred for you, or you can customize the mapping.
* Efficient JavaScript code with type erasure.
WebSharper compilation does not try to replicate all .NET behavior in the browser by tracking the types of all objects and having a large runtime.
Instead it uses compile-time type information to generate efficient JavaScript code.
You still get the power of type safety and generics while producing performant code.
* WebSharper extensions are typed interfaces for a growing number of popular JavaScript libraries. See the full list at the [WebSharper downloads](http://websharper.com/downloads) page.
* Useful abstractions for reactive forms and UI.
* Metaprogramming with macros and generators: modify translation of specific calls by custom logic or generate JavaScript function bodies programmatically.

To use WebSharper 4 (beta codename Zafir) in your C# project, add the `Zafir` and `Zafir.CSharp` NuGet packages.
It is also recommended to download a [vsix installer](...) which adds WebSharper 4 project templates in Visual Studio (under the section Zafir).
```
---


## File: docs/CompilerSettings.md
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/CompilerSettings.md

```md
# Compiler settings file

WebSharper's compiler can be customized by a number of settings. These are read from a `wsconfig.json` located next to the project file.
A `WebSharperConfigFile` property in the `.csproj` / `.fsproj` file can override this default name or location where WebSharper looks for configs.

<a name="jsonConfiguration"></a>
## Json configuration

The `wsconfig.json` file must consist of a single JSON object. Keys and values are all case-insensitive, but there is a recommended provided by the schema. Boolean values can be `true` of `false` literals or strings that can be parsed to a `bool`. Here is an example `wsconfig.json`:

```json
{
  "$schema": "https://websharper.com/wsconfig.schema.json",
  "project": "web",
  "outputDir": "wwwroot",
  "release": {
    "outputDir": "build",
    "preBundle": true
  }
}
```

# Available settings

Below is a list of all settings ordered alphabetically.

<a name="analyzeClosures"></a>
## "analyzeClosures"

**Type**: bool or `"moveToTop"` (default is `false`)

There is an inconvenient source of memory leaks in most JavaScript engines which is
[described here](http://point.davidglasser.net/2013/06/27/surprising-javascript-memory-leak.html).

This setting can enable warnings on these kinds of captures, helping to eliminate memory leaks.

**Possible values:**
* `true` - Turns warnings on.
* `"moveToTop"` - Moves all non-capturing lambdas to top level automatically (experimental).
* `false` - Default setting, no JS closure analysis.

<a name="configurationName"></a>
## Configuration name (usually `"Debug"` or `"Release"`)

**Type**: JSON object

Allows overriding configuration values based on project configuration. For example, a "WebSharper 8 Client-Server Application" template project uses this to set [prebundle](#prebundle) for Release mode and use `esbuild` on the output, while Debug mode uses `vite`.

<a name="dce"></a>
## "dce"

**Type**: bool (default is `true` for Bundle/BundleOnly projects, `false` for library projects)

An `spa` or `bundleOnly` project uses dead code elimination to have a minimal size `.js` output. If you run into any errors with missing code, please [report as a bug](https://github.com/dotnet-websharper/core/issues). As a quick workaround you can set `"dce": false` to see if that resolves your problem.

The other use case for dead code elimination is producing npm-facing library code. For this, set `"dce": true` on a libray project and specify an [outputDir](#outputDir). You might also want to set `"javascriptExport": true` to make the whole current project exported into the final output, otherwise only classes and methods marked with the `JavascriptExport` attribute will be available.

To package the output for npm set `"outputDir": "build"` and then you can add a section to your project file like this:

```xml
  <Target Name="CleanBuildDir" BeforeTargets="CoreCompile">
    <RemoveDir Directories="build" />
  </Target>
  
  <Target Name="CopyPackageJsonAndPack" AfterTargets="WebSharperCompile">
    <Copy SourceFiles="assets/package.json" DestinationFolder="build" />
    <Exec Command="npm pack" WorkingDirectory="build" />
  </Target>
```

This cleans the build folder before a new build. After a successful WebSharper build, it copies over a `package.json` file to serve as your package declaration to your WebSharper project's output folder.

WebSharper will create an `index.js` to serve as the root of the npm package, so in your `assets/package.json` file, set `"main": "index.js"`. Also take note that all static methods on static classes will be exported as top level functions, make sure to give expressive names for your functions for npm library use that does not depend on F# module name for example to disambiguate them.

<a name="downloadResources"></a>
## "downloadResources"

**Type**: bool (default is `false`)

Set to `true` to have WebSharper download all 
remote `js`/`css` resources defined in the current project and all references. This is possible only for direct script resources, all npm imports you have to manage with running an `npm install` command.

When using this setting, you also add this to your `appsettings.json` so that WebSharper inserts a link to that downloaded file in your pages instead of a link to the online resource:

```json
  "websharper": {
    "UseDownloadedResources": true
  }
```

<a name="dts"></a>
## "dts"

**Type**: bool (default is `true`)

Turns on the generation or unpacking of TypeScript declaration files. This is available for all project types except `html`, and `web` with `prebundle` set to true.

<a name="javascript"></a>
## "javascript"

**Type**: bool or array of strings (default is `false`)

Setting this to `true` is equivalent to having a `JavaScript` attribute on the assembly level: it marks the entire assembly for JavaScript compilation.
You can still exclude types by using the `JavaScript(false)` attribute in your code.

Alternatively, you can pass an array of strings, containing file or type names. This is marking the given files or types for JavaScript compilation.

<a name="javascriptExport"></a>
## "javascriptExport"

**Type**: bool or array of strings (default is `false`)

Setting this to `true` is equivalent to having a `JavaScriptExport` attribute on the assembly level: it marks the entire assembly for JavaScript compilation and makes sure all the code in current assembly are exported as entry points.

Alternatively, you can pass an array of strings, containing file or type names. This is marking the given files or types for JavaScript compilation and export.

<a name="jsOutput"></a>
## "jsOutput"

**Type**: string (relative or absolute folder path)

Writes the generated `.js` code only, (usually one class per file) compiled output for current assembly to given location.

<a name="outputDir"></a>
## "outputDir"

Obligatory if [project](#project) is `web`; optional otherwise.

**Type**: string (relative or absolute folder path)

Specifies the path of the compilation output directory relative to the project file. Default folder is `./Content` for SPAs and `./bin/html` for HTML apps.

<a name="prebundle"></a>
## "prebundle"

**Type**: bool (default `false`)

Only for `web` projects, turns on production-ready mode: for all pages of a multi-page application a JavaScript file is created. This is readable format code, possibly importing npm packages, so it needs a proper JavaScript bundler before serving. It is recommended that this output goes to a `build` folder, and then bundling can be set up in project file like this: 

```xml
  <Target Name="ESBuildBundle" AfterTargets="WebSharperCompile">
    <Exec Command="npm install" />
    <Exec Command="node ./esbuild.config.mjs" />
  </Target>
```

where `esbuild.config.mjs` contains:

```javascript
import { existsSync, cpSync, readdirSync } from 'fs'
import { build } from 'esbuild'

if (existsSync('./build/Content/WebSharper/')) {
  cpSync('./build/Content/WebSharper/', './wwwroot/Content/WebSharper/', { recursive: true });
}

const files = readdirSync('./build/Scripts/WebSharper/$YOURPROJECTNAME$/');

files.forEach(file => {
  if (file.endsWith('.js')) {
    var options =
    {
      entryPoints: ['./build/Scripts/WebSharper/$YOURPROJECTNAME$/' + file],
      bundle: true,
      minify: true,
      format: 'iife',
      outfile: 'wwwroot/Scripts/WebSharper/' + file,
      globalName: 'wsbundle'
    };

    console.log("Bundling:", file);
    build(options);
  }
});
```

<a name="project"></a>
## "project"

**Type**: string (see below)

Specifies the WebSharper project type. The valid values and their corresponding project types
are listed below.

|Project type|"project" setting value|
|-|-|
|Library|`library`|
|Client-Server Application|`web`|
|Single Page Application|`spa`|
|Web Service|`microservice`|
|Single Page Application without .NET compilation|`bundleOnly`|
|HTML Application|`html`|
|JavaScript Binding|`binding`|
|Proxy Project|`proxy`|

The `library` project type is the default, it can be omitted. In this case the WebSharper compiler translates the found JavaScript scope, preparing the project to be used as a reference of other WebSharper projects.

The `web`, `spa`, and `microservice` project types work as web projects. The WebSharper compiler creates pre-optimized runtime metadata for them for fast startup of WebSharper Sitelets and Remoting services. A `web` project supports full Sitelet functionality. An `spa` outputs a single `.js` file to be linked from a static `html` file. A `microservice` is geared towards using server-side functionality only.

A `bundleOnly` project mimics `spa` for the `.js` output, but skips .NET compilation for F# and embedding resources for C# for faster turnaround of client-only use cases.

A `html` project outputs a multi-page website as static html with the necessary `.js` files linked also statically.

A `binding` project uses WebSharper Interface Generator, an concise F# DSL for defining the shapes of .NET types that would map to existing JavaScript code.

A `proxy` project takes code that is already translated as a .NET library without WebSharper and creates a library that won't contain the .NET types again but only the WebSharper translation information.

<a name="proxyTargetName"></a>
## "proxyTargetName"

**Type**: string

Only required for `proxy` projects. Specifies the assembly name of the original library current project will act as a proxy against. The usual use case is that you have a library that has no WebSharper references, and its proxy will be another project file that links in the very same source files, use `"project": "proxy"` and `"proxyTargetName": "originalAssemblyName"`. Then from a WebSharper project, you must reference the original library for the .NET types and the WebSharper proxy library for the JavaScript translation.

<a name="runtimeMetadata"></a>
## "runtimeMetadata"

**Type**: string (default is `"noexpressions"`)

This is a rarely needed setting, only relevant if the site itself want to host the WebSharper compiler at runtime, for example generating JavaScript snippets on the fly. Then a larger set of information of WebSharper metadata is necessary for the runtime than usual.

**Possible values:**
* `"inlines"` - keeps expressions for inlined values, needed for translating expressions that would use inlines.
* `"notinlines"` - keeps expressions for already translated functions.
* `"full"` - full WebSharper metadata.
* `"noexpressions"` - default setting, when no on-the-fly compilation is needed.

<a name="scriptBaseUrl"></a>
## "scriptBaseUrl"

**Type**: string (default `"Content"`)

Only needed if an `spa` or `bundleonly` project uses direct script references to non-module-based JavaScript. WebSharper will load these scripts via a `LoadScript` helper, which needs the root URL to where these extra scripts are located.

Current recommended approach is to use npm packages only for referencing external code and then this setting is unnecessary.

<a name="singleNoJSErrors"></a>
## "singleNoJSErrors"

**Type**: bool (default is `false`)

If the value is `true`, WebSharper errors for not finding a type or method in JavaScript scope will show up only once per type/method, where it's first encountered.

<a name="standalone"></a>
## "standalone"

**Type**: bool (default is `false` except if `WebSharperBuildService` environment variable is set to `false`)

If the value is `false`, the WebSharper F# compiler will not use a backend process for faster compilation speeds. If set to `true`, it will use backend process even if `WebSharperBuildService` environment variable is `false`.

<a name="stubInterfaces"></a>
## "stubInterfaces"

**Type**: bool (default is `false`)

If the value is `true`, WebSharper treats all interfaces in current project as if marked by the `Stub` attribute. This has the effect that interfaces act as easy interop tools with JavaScript, all method names are kept as is. By default, WebSharper creates longer unique names, so that .NET semantics can be used for interfaces, where a class can implement methods of the same name and signature from multiple interfaces.

<a name="useJavaScriptSymbol"></a>
## "useJavaScriptSymbol"

**Type**: bool (default is `true` for `proxy` projects, `false` otherwise)

If the value is `true`, for the JavaScript compilation a `JAVASCRIPT` conditional compilation symbol is added.

<a name="warnOnly"></a>
## "warnOnly"

**Type**: bool (default is `false`)

If the value is `true`, all WebSharper compiler errors will be treated only as warnings. This can help finding and debugging non-translateable code, those expressions will show up as `$$ERROR$$` in output code.





```
---


## File: docs/DOM.md
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/DOM.md

```md
# WebSharper Extensions for DOM

DOM types can be found under the `WebSharper.JavaScript.Dom`
namespace.  The extension is based on the DOM specification, and
therefore does not provide any browser-specific methods, such as
`innerHtml`.  Be warned that DOM compliance varies from browser to
browser, and therefore relying on DOM may cause your code to be
browser-specific.

## WebSharper Elements and DOM Nodes

WebSharper HTML elements (from `WebSharper.Html.Client`) create and
instantiate DOM nodes lazily as they are attached to the document and
rendered. A typical way to access these DOM nodes after they are
rendered is using the `OnAfterRender` function:

    Div []
    |>! OnAfterRender (fun element ->
        element.Text <- "Hello World")

## The Document Object

The DOM `Document` object instance accessed as `document` from
JavaScript is available in F# as:

    let doc = JS.Document
    let doctype = doc.Doctype.Name
    let uri = doc.DocumentURI

## Events

You can easily add event listeners to any DOM element as follows:

    let listener = fun () -> div2.TextContent <- "Clicked!"
    div1.AddEventListener("click",listener,false)

```
---


## File: docs/ECMA-262.md
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/ECMA-262.md

```md
# JavaScript Standard library

This extension enables you to use standard EcmaScript features in a
direct, type-safe way without inlining actual EcmaScript code. You can
use this extension to compile Standard ECMA-262 compliant code
directly from F#.

This extension implements the full 5th edition of the ECMA standard.

The ECMA code is available in the
`WebSharper.JavaScript` namespace.  The implementation
closely follows the standard, covering the following ECMA objects:

* `Global`
* `Object`
* `Function`
* `Array`
* `String`
* `Boolean`
* `Number`
* `Math`
* `Date`
* `RegExp`
* `Error`
* `JSON`

Each object has the methods defined in the ECMA 262 standard.  This
extension does not contain any browser-specific objects or methods.

## Extra features and differences

### Generic Object type

The `Object` class has a generic version, useful if you want to constrain 
all the object fields to a single type.
You can access a field in a typed manner by using an indexer with a 
string parameter: `myObj.["someField"]`.

### Strongly-typed functions

The `WebSharper.JavaScript.Function` is the base class for JavaScript functions, 
which has methods named `ApplyUnsafe`, `BindUnsafe`, `CallUnsafe` so that they do not 
have overloads with the strongly typed versions inheriting it.

F# functions always translate to a JavaScript function taking 0 or 1 arguments and
do not use the `this` value.
If you want to create any other kind of JavaScript function, use the
`WebSharper.JavaScript.FuncWith*` family of types as follows:

* `FuncWithThis<'This, 'Func>` for functions that use `this`. 
`'Func` can be a straight F# function or another interop type.

* `FuncWithArgs<'Args, 'Result>` for functions with n arguments that do not use `this`.
`'Args` must be a tuple type, this is checked at compile time.

* `FuncWithRest<..., 'Rest, 'Result>` for functions that take some fixed arguments,
and then a variadic array of the remaining arguments.
The number of fixed arguments can be between 0 and 6.

* `FuncWithArgsRest<'Args, 'Rest, 'Result>` for the rare case of a variadic function
with more than 6 fixed arguments.
`'Args` is a tuple type of the fixed arguments, length checked at compile time.

### Casting between .NET and JavaScript types

Ecma types in `WebSharper.JavaScript` all have a `.Self` property which returns it
as a standard .NET type where possible.

If you open the `WebSharper.JavaScript` namespace, .NET objects get an extension
property called `.JS` for casting them safely to their EcmaScript equivalent.

Example:

    // use this only in client only code
    let arr = [||] : int[]
    arr.JS.Push(1)

If you want to cast an F# function to a `WebSharper.JavaScript.Function`, you can use
the `Function.As` static method.

## More Examples

You have access to the `Math` object with all of its constants and
methods:

    let pi = Math.PI
    let sq25 = Math.Sqrt 25.

Strings can be manipulated with the ECMA `String` object and its
methods:

    let str = new String("a lowercase string")
    let upperstr = str.ToUpperCase() // "A LOWERCASE STRING"
    let tenthchar = str.CharAt(10) // "e"
    let substring = str.Substring(2,11) // "lowercase"

`RegExp` objects can be used to manipulate text:

    let str = new String("Bob likes pineapples.")
    let regex = new RegExp("^\w+") // matches the first word
    let newstr = str.Replace(regex,"Alice")

```
---


## File: docs/IIS.md
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/IIS.md

```md
# Hosting WebSharper in IIS

**NOTE**: If you are using ASP.NET MVC-style application, there is
simpler way to host WebSharper sitelets - see the
[WebSharper.WebApi](http://github.com/intellifactory/websharper.webapi)
project.

WebSharper applications need to install two components in a web
request processing pipeline:

* [Remote procedure call](Remoting.md) handler
* [Sitelets](Sitelets.md) handler

The default templates ("Sitelet Host Website") accomplish this by
registering IIS modules in `Web.config:

```xml
<configuration>
  <system.webServer>
    <modules>
      <add name="WebSharper.RemotingModule"
           type="WebSharper.Web.RpcModule,
                 WebSharper.Web" />
      <add name="WebSharper.Sitelets"
           type="WebSharper.Sitelets.HttpModule,
                 WebSharper.Sitelets" />
```

These modules are installed into the request processing pipele and
handle matching requests automatically. Sitelets are picked up by
locating assembly attributes in assemblies under `~/bin`:

```fsharp
[<assembly: Website(...)>]
do ()
```

See also:

* [Manual Home](WebSharper.md)
* [Sitelets](Sitelets.md)
* [Remoting](Remoting.md)

```
---


## File: docs/Libraries.md
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/Libraries.md

```md
# Developing JavaScript Libraries

Developing JavaScript libraries with WebSharper is as simple as
writing F# code, annotating it with a few custom attributes, compiling
it with F#, and running WebSharper to generate the JavaScript:

    module MyModule =

      [<JavaScript>]
      let rec Factorial n =
        match n with
        | 0 -> 1
        | n -> n * Factorial (n - 1)

This section provides the overview of the required custom attributes,
the F# language features and the F# standard library functions
supported by WebSharper in the JavaScript environment.

## Member Annotations

There are required and optional custom attribute annotations that
influence how F# code gets compiled to JavaScript.  To be useable from
the client-side code, any member must be annotated with either the
`JavaScript` attribute or one of the attributes inheriting from
`AbstractInlineAttribute`.  To customize the name in the compiled
JavaScript output, it might also be annotated with an attribute
inheriting from `AbstractNameAttribute`.

### JavaScriptAttribute

`JavaScriptAttribute` marks members for compilation into
JavaScript. It is the single most important attribute in
WebSharper. The annotated members are translated to JavaScript by the
WebSharper compiler by inspecting and translating their F# bodies.

For example:

    module MyModule =

      [<JavaScript>]
      let rec Factorial n =
        match n with
        | 0 -> 1
        | n -> n * Factorial (n - 1)

The attribute is implemented as an alias for the
`ReflectedDefinitionAttribute` that comes with F#.  The F# comiler
recognizes members marked with this attribute and stores their
reflected (abstract syntax tree or quotation) form within the
resulting assembly, in addition to compiling them to IL as regular
members. WebSharper compiler is then able to find the quoted form of
the members and translate them to JavaScript.

### Naming Attributes

These attributes influence the member names as in JavaScript. The base
class, `Naming.AbstractNameAttribute`, allows to create custom
attributes with arbitrary logic for determining the compiled name.
This is useful to avoid naming clashes.

A simple implementation, the `NameAttribute`, explicity sets the
JavaScript-compiled names of members and types.  For example:

    [<Stub>]
    [<Name "my.package.Date">]
    type Date =
        /// Returns the day of the month.
        [<Name "getDate">]
        member this.GetDate() = 0

### Inlining Attributes

Inlining attributes mark functions for inline compilation to
JavaScript. The base class, `Inlining.AbstractInlineAttribute`, allows
to create custom attributes with arbtirary macro-expansion logic.
Three common forms are provided: `InlineAttribute`,
`ConstantAttribute` and `StubAttribute`.

#### InlineAttribute

`InlineAttribute` is a simple attribute that specifies that members
are to be compiled inline.  This attirbute either complements the
`JavaScriptAttribute`, or serves standalone with a JavaScript template
string. The following two forms are equivalent:

    [<Inline>]
    [<JavaScript>]
    let Add (x: int) (y: int) = x + y

    [<Inline "$x + $y">]
    let Add (x: int) (y: int) = 0

The sytnax of the template string is regular JavaScript. Variables
that start with `$` are treated as placeholders.  There are named
(`$x`), positional (`$0`), and special (`$this`, `$value`)
placeholders.  To use an actual variable that starts with a `$` sign,
duplicate the sign, as in `$$x`.

#### ConstantAttribute

`ConstantAttribute` allows members to compile to constant
literals. Its most common use is to annotate union cases.  For
example:

    type Align =
      | [<Constant "left">]   Left
      | [<Constant "center">] Center
      | [<Constant "right">]  Right

With these annotations, `Align.Left` is compiled as literal `"left"`,
and pattern-matching against any union case is compiled as an equality
test against the corresponding literal.

This pattern is useful for providing type safety for JavaScript code.

### StubAttribute

This attribute commonly marks types that expose JavaScript-implemented
functionality to WebSharper.  `StubAttribute` is useful for enabling
WebSharper code to consume and interoperate with legacy and
third-party JavaScript code.

Methods and fields on types marked with `StubAttribute` that are not
marked with special translation attributes such as
`JavaScriptAttribute` are translated by-name.  Methods do not have to
have a meaningful body, but should be correctly typed.

Sample usage:

    [<Name [| "Date" |]>]
    [<Stub>]
    type Date() =

      /// Returns the day of the month.
      member this.getDate() = 0

      /// Returns the day of the week.
      member this.getDay() = 0

      /// Returns the year.
      member this.getFullYear() = 0

The above example exposes to F# code some of the functionality of the
`Date` object as present in most JavaScript environments (and
specified in ECMA-262 3rd ed.

## F# Language Coverage

Most of the F# language features are directly supported by WebSharper.
The philosophy is to produce readable, straightforward JavaScript
code, making it possible to analyze the output and use it from
external JavaScript code or apply JavaScript-targeting tools.

### Data Representation

In general, matching JavaScript data types are reused, where possible,
to represent F# data types:

* F# numbers, booleans, strings, and arrays are represented
  directly as their JavaScript counterparts.
* F# lambda expressions are directly compiled to JavaScript lambda
  expressions.
* F# algebraic data types are represented as JavaScript objects.  In
  particular, tuples are represented as arrays, records as objects
  with matching field names, and unions as objects with field names of
  the form `$n` where `n` is the field position.
* F# objects are represented as JavaScript objects, with fields and
  members as JavaScript fields.

JavaScript representations of F# data types:

| F#            | JavaScript                                     |
|---------------|------------------------------------------------|
| null          | null                                           |
| "foo"         | "foo"                                          |
| true          | true                                           |
| 1             | 1                                              |
| 1.25          | 1.25                                           |
| (1, 2)        | `[1, 2]`                                       |
| `[| 1 |]`     | `[1]`                                          |
| None          | `{$: 0}`                                       |
| Some 1        | `{$: 0, $0: 1}`                                |
| `[1; 2]`      | `{$: 1, $0: 1, $1: {$: 1, $0: 2, $1: {$: 0}}}` |
| `{A = 1}`     | `{A: 1}`                                       |

#### Arrays

Arrays are represented directly as JavaScript arrays.
Multi-dimensional arrays are not currently supported.

#### Tuples

Tuples are represented as JavaScript arrays.

#### F# Records

Records are represented as JavaScript objects.

For example, consider this code:

    type R =
      {
        a: int
        b: string
      }

    [<JavaScript>]
    let F() =
      { a = 1; b = "foo" }

This will compile to:

    function F() {
      return {a: 1, b: "foo"};
    }

#### F# Unions

Unions are represented as JavaScript objects, with fields for the
union case tag and every field.  Consider:

    type U =
        | A
        | B of int * string

    [<JavaScript>]
    let F() = [| U.A; U.B(1, "!") |]

This will compile to:

    function F() {
      return [{$: 0}, {$: 1, $1: 1, $2: "!"}];
    }

#### Enumerations

Enumerations with integer values are supported for both construction
and pattern-matching.

For example, consider this code:

    type E =
      | One = 1
      | Two = 2

    [<JavaScript>]
    let F () = E.One

It will compile to:

    function F() {
      return 1;
    }

Enumerations do not require any annotations. Enumeration support
includes standard enumerations such as `System.DayOfWeek`.

### Functional Features

JavaScript is a functional language and therefore allows most of the
F# features to be represented directly.  Two notable omissions are its
lack of support for static typing and tail-call optimization.

First-class functions and closures map directly to their JavaScript
counterparts.

Methods are uncurried during compilation. For example:
`let f x y z = ...` at module level translates to the equivalent of
`function f(x, y, z) ...`

Curried lambda functions a translated directly:

    (fun x y -> ...)

Translates to:

    function (x) { return function (y) { ... }}

Lambda functions that accept tuples are compiled to accept either a
single or multiple arguments.  When called with a single argument, the
function expects the argument to be an array representing the tuple.
When called with multiple arguments, it assumes the arguments to be
the tuple components.  For example:

    let f = (fun (x, y) -> ...)

Given the above definition, JavaScript can call `f` in two ways:

    f(1, 2)
    f([1, 2])

Types are erased during compilation.

Tail call optimization is not currently supported. Future versions of
WebSharper will support it with a combination of local optimizations
that transform recursive functions to loops and a global optimization
with trampolining.

### Object-Oriented Features

Inheritance is modelled with JavaScript prototype chains. For example:

    type A [<JavaScript>]() =
        class end

    type B [<JavaScript>] () =
      inherit A()

Translates to the equivalent of:

    function A() {...}
    function B() {...}
    B.prototype = new A();

Chaining the prototypes allows JavaScript objects to inherit instance
members and interface implementations from the superclasses.

Interfaces are supported structurally. A JavaScript object is assumed
to implement an interface if it has methods with matching names. Just
as types, interfaces are therefore an F#-level concept that gets
erased during compilation. Type tests against interfaces are not
compiled. While F# allows a class to implement two interfaces with
clashing method names, using distinct method implementations for each,
it is an error to do so in WebSharper.

#### Equality and Hashing

JavaScript notion of pointer equality does not match structural
equality required by F#.  Moreover, JavaScript does not provide a
generic hash primitive, `obj -> int`.  To model these F# features,
WebSharper:

1. Implements object hashing by destructively modifying the hashed
   object and assigning a freshly generated unique hash to one of the
   object's fields.  Subsequent calls to the `hash` function will read
   the field.

2. Implements custom (structural) hashing by overriding `GetHashCode`
   for datatypes that require it.  The `hash` function always checks
   for the presence of `GetHashCode` before falling back to the
   generic implementation.

3. Implements a generic equality algorithm that recursively traverses
   and compares all fields of the two objects being compared.

4. Allows to override `Equals` and provide a custom equality
   logic. The equality primitive always checks for the presence
   `Equals` before falling back to the generic implementation.

#### Comparisons

Structural comparisons are modelled in a manner similar to equality
and hashing.  A generic implementation works for all objects by
recursively comparing their fields, respecting `IComparable`
implementations when those are provided by the user.

### Limitations

This section documents the limitations of F# language support in
@WebSharper{} and possible workarounds to these limitations.

#### Inner Generic Functions

Due to F# quotations limitations, the following code does not compile
under F#:

    [<JavaScript>]
    let F() =
      let id x = x
      id 5

The workaround is to specialize the generic function to a concrete
type, or lift it to the module level:

    [<JavaScript>]
    let id x = x

    [<JavaScript>]
    let F() = id 5

#### Anonymous Interface Implementations

Another limitation of F# quotations prohibits the following code:

    [<JavaScript>]
    let F () =
      {
        new System.IDisposable with
          member this.Dispose() = ()
      }

The workaround is to provide an explicit name to the class:

    type MyDisposable = | D with
      interface System.IDisposable with
        [<JavaScript>]
        member this.Dispose() = ()

    [<JavaScript>]
    let F () = D :> System.IDisposable

#### Record Expressions in Constructors

F# reflected definitions provide insufficient information about the
record expressions in object constructors, preventing `WebSharper`
from correctly compiling them.

A simple example:

    type T =
      [<JavaScript>]
      new () = {}

Workaround: avoid record expressions, use simple constructors with
overloads if necessary.

    type T [<JavaScript>] () =
      class end

#### Operator Overloading

This feature is not currently fully supported.  For example, `a + b`
expression translation ignores static `op_Addition` methods on the
type of `a`.

#### Units of Measure

This feature is not currenty supported.

#### Recursive Values

The following does not translate:

    type R = { R : R }
    let rec r : R = { R = r }

#### Generics Limitations

Certain uses of generic arguments are invalid because of type erasure,
for instance:

    let F<'T>() =
        try () with :? 'T -> ()

For the same reason, JSON serialization fails with generic functions,
for example:

    [<Rpc>]
    let F<'T> x = x

    [<JavaScript>]
    let G<'T> x = F x

This will fail to compile because the concrete type `'T` is not
statically known.

## F# and .NET Library Coverage

WebSharper includes a reasonably comprehensive F# and .NET standard
library coverage, allowing to use the familiar APIs in JavaScript,
including such modules and classes as `List`, `Array`, `Map`, `Set`,
`Async`, `Event`, `DateTime`, `TimeSpan`, `Dictionary`, `Stack`,
`Queue`. The support for these classes is sometimes incomplete, with a
focus on functionality that is reasonable to implement and useful to
have available on the client.  `WebSharper` will warn you if you
attempt to use a feature that is not supported.

## JavaScript Library Coverage

WebSharper makes it easy to access JavaScript APIs in a typed way from
F# by shipping bindings to JavaScript libraries. While a lot of these
are available as WebSharper, the standard distribution ships:

* The `WebSharper.JavaScript` module with common
  utilities, such as getting or setting fields on JavaScript objects,
  doing `alert` or `setTimeout` calls, and the like.

* JavaScript standard library bindings based on the ECMA 262 3rd
  edition. Consult the `WebSharper.JavaScript`
  namespace for details.

* [DOM level 3](http://www.w3.org/DOM/) bindings.  Consult the
  `WebSharper.Dom` namespace for details.

* [jQuery](http://jquery.com) bindings. Consult the
  `WebSharper.JQuery` namespace for details.



```
---


## File: docs/MSBuild.md
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/MSBuild.md

```md

```
---


## File: docs/Macros.md
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/Macros.md

```md
* WebSharper.Core.Macro type
* WebSharper.Core.AST namespace
* Macro fallback and chaining
* Macros using type argument
* Parameter
```
---


## File: docs/WebApi.md
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/WebApi.md

```md
# WebSharper.WebApi

[WebSharper.WebApi][gh] project provides more options for hosting
WebSharper [Sitelets][sitelets] applications:

1. Using WebSharper Sitelets in ASP.NET MVC4 projects

2. Hosting WebSharper Sitelets as an [OWIN][owin] application, to make
   it portable between IIS and other containers, or to host standalone

Please refer to the [WebSharper.WebApi][gh] for documentation,
examples, downloads and source code access.

[bb]: http://bitbucket.org/IntelliFactory/websharper.webapi
[gh]: http://github.com/intellifactory/websharper.webapi
[issues]: http://github.com/intellifactory/websharper.webapi/issues
[katana]: https://katanaproject.codeplex.com
[license]: http://github.com/intellifactory/websharper.webapi/blob/master/LICENSE.md
[nuget]: http://nuget.org
[owin]: http://owin.org
[sitelets]: http://github.com/intellifactory/websharper/blob/master/docs/Sitelets.md
[webapi]: http://www.asp.net/web-api
[ws]: http://github.com/intellifactory/websharper

```
---


## File: docs/WebSharper.md
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/WebSharper.md

```md
# WebSharper

* [Installation](Install.md)
* Developing Applications
    * [Getting Started](GettingStarted.md)
    * [Creating JavaScript Applications and Libraries](Libraries.md)
        * [Binding to Existing JavaScript Code](Bindings.md)
        * [Using the Interface Generator](InterfaceGenerator.md)
        * [Porting .NET Code to JavaScript with Proxies](Proxies.md)
        * [Generating TypeScript Definitions](TypeScriptOutput.md)
    * HTML Applications
        * [HTML Combinators](HtmlCombinators.md)
        * [Using Formlets](Formlets.md)
        * [Using Sitelets](Sitelets.md)
    * Client-Server Applications
        * [Calling Remote Procedures](Remoting.md)
        * [Using Pagelets](Pagelets.md)
    * [Mobile Applications](Mobile.md)
* Deploying Code
    * [Deploying to IIS](IIS.md)
    * [Deploying with Web API (OWIN, Standalone, IIS)](WebApi.md)
    * Generating Standalone HTML Applications
    * [Bundling Code](Bundling.md)
* Reference
    * Standard Libraries
        * [Asynchronous Workflows](Async.md)
    * Attributes
    * Core Extensions
        * [jQuery](jQuery.md)
        * [DOM](DOM.md)
        * [ECMA-262](ECMA-262.md)
* Developing WebSharper
    * Building from Source
    * Roadmap
    * [Release Notes](ReleaseNotes.md)
* Licensing
* Contact
 

```
---


## File: docs/WebSharper4Beta.md
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/WebSharper4Beta.md

```md
# WebSharper 4 beta status

For known issues and planned changes, visit [GitHub](https://github.com/intellifactory/websharper/issues?q=is%3Aissue+is%3Aopen+label%3Awebsharper4)

## F# syntax support

All of F# language features are available except some small cases:

* Functions with multiple statically resolved type parameters.

## C# syntax support

Planned but not available yet:

```
---


## File: docs/WebSharper8Translation.md
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/WebSharper8Translation.md

```md
# WebSharper 8 translation

WebSharper reads F# or C# source code and outputs modern module-based JavaScript code. Instead of translating an entire project or files, WebSharper only looks at code that are annotated to be used client-side. This allows full-stack applications within a single project, sharing data types and code between layers.

### Scope of the JavaScript translation

Most common method of annotating for translation is using the `[<JavaScript>]` attribute on a class, F# module, or member. `[<JavaScript(false)>]` will revert the effect and exclude the annotated scope from translation.

Also, `[<JavaScript("fileName")>]` and `[<JavaScript("typeName")>]` can be used on the assembly level to annotate whole files or types without changing the target file themselves.

Lastly, in `wsconfig.json`, the `"javascript"` setting can be a bool or an array of strings. `"javascript": true` will annotate the whole project for translation without changing any files, this is a useful feature for client-only project. Or an array of strings can contain both file and type names, to describe the scope of translation.

### Proxies

Sometimes it is preferred that the same class have different implementation on the server and the client. In this case a `[<Proxy(typeof<TargetType>)>]`  or `[<Proxy("fullyQualifiedTypeName")>]` attribute on the client-side implementation will tell WebSharper, that in any translation, treat the two types as equivalent.

Also, this can be used to implement a client-side for standard library .NET types. WebSharper provides a good number of these proxies out of the box, for example may basic `System`, `System.Collections.Generic`, and `FSharp.Core` types are supported.

Use the `InternalProxy` attribute instead to limit the effect of a proxy to the current project only.

### Overview

Below is a quick overview of the translation process for reference.

- Source code is analyzed by FSharp.Compiler.Services or Microsoft.CodeAnalysis.CSharp respectively, client-facing code is read. Language-specific optimizations, like tail call elimination for F# are done.
- Mappings from .NET to JavaScript names are calculated. WebSharper supports overloads and overrides by making sure JavaScript naming lines up semantically with the original source. The `[<Name>]` attribute can be used to override default JavaScript naming, if it would lead to an impossible to resolve scenario, a compile-time error is thrown.
- Expressions like method calls are translated from their .NET information to their JavaScript equivalent. Also at this step, metaprogramming can be applied, to use type informatio to guide output, this functionality is called macros.
- The resulting code is optimized and transformed into proper JavaScript statements and expressions.
- The code is down into files for every class or dead code eliminated for bundles and written to JavaScript.

First we look at these two final output modes.

### One class per file output
This mode is intended for debugging, creating code for npm, or for bundling with external tool. This is the default output mode of WebSharper, unless `"preBundle": true` is set in `wsconfig.json`. One .NET class will create one output file. 

For website projects without `"preBundle": true` (for example for Debug mode), a `root.js` file is created that re-exports all code entry points needed for the website. This can be passed to tools like vite.

### Bundled output
For web (Sitelet) and SPA projects, WebSharper can use source code type information to create dead code eliminated bundles.

By default, a single bundle called `all.js` is created for a web application which contains all necessary code for all pages. If using `Content.Page` to create responses, use the `Bundle` argument to set a name for the bundle to be pre-created for the page. WebSharper creates these bundles by compile-time analysis of the client-side code required to render the page that is passed as the `Body` argument. If you want to send code to a certain bundle without wrapping it in a `Content` object yet, use the `Content.Bundle` helper, which uses the same compile-time analysis.

The `all.js` bundle is always created and serves as a fallback if a page would require code that is not well-contained in any other single bundle. For large sites with different code used accross many pages,

## Core proxies

Some of the default type proxies are as follows:

- Numeric values except `int64` and `uint64` are translated to `Number`. Also `DateTime` and `TimeSpan` are translated to `Number` equivalent to their JavaScript Date ticks.
- The large numeric types as well as `bigint` is translated to `BigInt`.
- `string`, `char`, and `Guid`s are translated to `String`.
- Both delegates and F# functions are translated to JavaScript functions.
- For `decimal` support, install the `WebSharper.MathJS` NuGet package as they are handled by `mathjs`.
- `System.Exception` is translated to `Error`.
- Arrays and `System.Collections.Generic.List` as well as `Queue` and `Stack` are translated to a JavaScript `Array`.
- Many more `System` and `FSharp.Core` types are translated to custom objects.
- See structured types below.

## F# translation

Below is an overview of how F# language features are transpiled to JavaScript.

### Code organization

Websharper treats classes as units of code organization, .NET namespaces are erased in the code output except in the one class per file output file names.

F# modules containing module-level `let` bindings and functions yield two files, one for the static initializer and one for functions, this matches how F# modules are handled by the F# compiler.

Inlining is treated separately from F# `inline let` functions, guided by WebSharper's `[<Inline>]` attribute. Local `inline let` expressions are not supported at the moment, although this is planned to change soon.

### Expressions and type information

F# is an expression-based language, while JavaScript is statement-based, so some F# expressions will be translated to statements depending on their contents. For example `if/then/else` is translated to either the conditional ternary operator `? :` or `if/then/else` depending on if the "then" and "else" branches are possible to translate as expressions or not. Similarly simple `match` expressions will be translated to conditional operators or `switch` depending on context.
Generally, expressions stick to their .NET semantics, for example loops over collections will use the `GetEnumerator` and `MoveNext` methods. A couple exceptions:
* F# code quotations are erased, they are translated as if they were their value. This is so that some helpers can use code quotations in .NET to take client-side expressions to encode, while on the client the argument is executable.
* WebSharper does not support reflection, its goal is to create efficient JavaScript with minimal overheads.  Type checks work as far as types are the same in JavaScript. You cannot do type checks on generics.
* Casting and conversions are happening in JavaScript too when the target types require it. Use the `As` helper for an unsafe cast from any type to any other.

### Structured types

- F# tuples and .NET `ValueTuple`s both get translated to JavaScript `Array`.
- F# unions (including `option` and `list`) are translated to classes or plain objects with property `$` containing the union case index, while properties `$1`, `$2`, etc. are matching the union fields. If the union type has no members, then it will be translated to a plain object, otherwise a class. The `Prototype` attribute can be used to override this, `[<Prototype>]` will force the output to be a JavaScript class, while `[<Prototype(false)>]` will force the output to be a plain object and translate methods to functions. A constructor function or static member is emitted for each union case.
  F# code:
  ```fsharp
  [<JavaScript>]
  type PlainUnion = 
      | A of int 
      | B of string
  
  [<JavaScript>]
  type UnionWithMember = 
      | C of int 
      | D of string
      
      member this.Text = 
          match this with 
          | C x -> string x
          | D x -> x  
  ```
  JavaScript output:
  ```javascript
  // File: WebSharper.Tests.PlainUnion.js
  export function B(Item){
    return{$:1, $0:Item};
  }
  export function A(Item){
    return{$:0, $0:Item};
  }
  
  // File: WebSharper.Tests.UnionWithMember.js
  import { Create } from "../WebSharper.Core.JavaScript/Runtime.js"
  export default class UnionWithMember {
    static D(Item){
      return Create(UnionWithMember, {$:1, $0:Item});
    }
    static C(Item){
      return Create(UnionWithMember, {$:0, $0:Item});
    }
    get Text(){
      return this.$==1?this.$0:String(this.$0);
    }
  }

  ```
- F# `list`s and `option`s are built-in union types, translated similarly.
- F# records are similarly translated to plain objects or classes. A record constructor function or static member `New` is emitted. Similarly to unions, if the record type has no members, then it will be translated to a plain object, otherwise a class. The `Prototype` attribute can be used the same way too.
  F# code:
  ```fsharp
  [<JavaScript>]
  type PlainRecord = 
      {
          A: int
          B: int
      }
  
  [<JavaScript>]
  type RecordWithMember = 
      {
          C: int
          D: int
      }
    
      member this.Total = 
          this.C + this.D
  ```
  JavaScript code:
  ```javascript
  // File: WebSharper.Tests.PlainRecord
  export function New(A, B){
    return{A:A, B:B};
  }
    
  // File: WebSharper.Tests.RecordWithMember
  import { Create } from "../WebSharper.Core.JavaScript/Runtime.js"
  export default class RecordWithMember {
    C;
    D;
    get Total(){
      return this.C+this.D;
    }
    static New(C, D){
      return Create(RecordWithMember, {C:C, D:D});
    }
  }
  ```
- F# anonymous records are always translated to plain objects.
- Only read-only structs are supported.

### Objects

Classes are translated to JavaScript classes. Overloads are supported by automatic renaming, and overrides are tracking the mapping from signature to JavaScript name so that the correct translated methods are overridden. Use the `[<Name>]` attribute when you want to specify the exact translated names for overloads. Multiple class constructors are combined into a single one which takes an automatically generated name for constructor as the first parameter. Helper static methods are generated to call the constructors from outside without knowing the names.

F# code:
```fsharp
type BaseClass(x) =
    let mutable x = x
    new() = BaseClass(0)
    member this.X = x
    [<Name "Incr_i">]
    member this.Incr(i) = x <- x + i
    abstract Incr: unit -> unit
    default this.Incr() = this.Incr(1)

type SubClass(x) =
    inherit BaseClass(x)
    override this.Incr() = base.Incr(2)
```
JavaScript code:
```javascript
// File: WebSharper.Tests.BaseClass.js
import Object from "../WebSharper.StdLib/System.Object.js"
export default class BaseClass extends Object {
  x;
  Incr_i(i){
    this.x=this.x+i;
  }
  get X(){
    return this.x;
  }
  Incr(){
    this.Incr_i(1);
  }
  static New(){
    return new this("New");
  }
  static New_1(x){
    return new this("New_1", x);
  }
  constructor(i, _1){
    if(i=="New"){
      i="New_1";
      _1=0;
    }
    if(i=="New_1"){
      const x=_1;
      super();
      this.x=x;
    }
  }

// File: WebSharper.Tests.SubClass.js
import BaseClass from "./WebSharper.Tests.BaseClass.js"
export default class SubClass extends BaseClass {
  Incr(){
    super.Incr_i(2);
  }
  constructor(x){
    super("New_1", x);
  }
}
```

### Interfaces

To make interface methods uniquely identifyable, WebSharper gives them a long name that contains the interface type name. You can use the `Name` attribute to set shorter fixed translated names.

F# code:
```fsharp
type MyInterface =
    abstract Incr: int -> int
    [<Name "IncrTwo">]
    abstract IncrTwo: int -> int

[<JavaScript>]
module Inst =
    let getIntfObj() =
        { new MyInterface with 
            member this.Incr x = x + 1 
            member this.IncrTwo x = x + 2 
        }
```
JavaScript code:
```javascript
// File: WebSharper.Tests.MyInterface
export function isMyInterface(x){
  return"IncrTwo"in x&&"WebSharper_Tests_MyInterface$Incr"in x;
}

// File: WebSharper.Tests.Inst
export function getIntfObj(){
  return{WebSharper_Tests_MyInterface$Incr(x){
    return x+1;
  }, IncrTwo(x){
    return x+2;
  }};
}
```

## WebSharper attributes

The following is an overview of all attributes provided by WebSharper to guide translation.

### Standard attributes

- `JavaScript` - see above in scope section.
- `Constant` - provide a literal to stand in as the value in translation.
- `Inline` - without a string argument, it makes a function inlined, with a string argument, it emits the JavaScript code snippet provided at the call point. For the latter, you can use `$0`, `$1`, or `$parameterName` in your JS snippet.
- `Direct` - provide a JavaScript code snippet to serve as the body of the function.
- `Pure` - marks the function as ok to eliminate when result is ignored, it should be used only if the function is deterministic and has no side effect.
- `Warn` - Gives a warning if annotated method is used from JavaScript code, but not for .NET calls.
- `Macro` - used for metaprogramming, implement a subclass of `WebSharper.Core.Macro` type to translate calls based on compile-time type or other information.
- `Generated` - used for metaprogramming, implement a subclass of `WebSharper.Core.Generator` type to emit contents of a function programmatically.
- `Name` - used for setting translated name when applies.
- `Proxy` - see above in proxies section.
- `InternalProxy` - see above in proxies section.
- `Stub` - marks a type be a stand-in for a JavaScript type with every member mapping to a member of the same name.
- `OptionalField` - marks F# option fields for autoconversion from JavaScript undefined or existing value.
- `Prototype` - marks a union/record/class to have a JavaScript class declaration, or `Prototype(false)` converts them into a plain object.

### Dependency-specific attributes

- `Require` - for non-module JavaScript and other code requirements.
- `Import` - for adding module-based imports. 

### Remoting-specific attributes

- `Remote` - marks a server-side method for remoting.
- `RemotingProvider` - on a server side method, specifies a client-side wrapper object that remoting calls will go through.

### Bundle-specific attributes

- `JavaScriptExport` - in Single Page Application, or Library Bundle projects, adds annotated function/type to the JavaScript output independent of dead code elimination.
- `SPAEntryPoint` - the entry point of a Single Page Application or Library Bundle projects on which dead code elimination can act.

### JSON-specific attributes

- `NamedUnionCases` - for union serialization, customize the name of the discriminator field.
- `DateTimeFormat` - customize the string format of the serialized DateTime values.

### TypeScript-specific attributes

- `Type` - for use on proxies, sets the TypeScript type for the JavaScript proxy.

### Sitelets routing-specific attributes

- `EndPoint` - specifies an URL or URL fragment for Sitelets routing.
- `Method` - specifies the HTTP method.
- `Json` - marks a field to deserialize request body JSON data into.
- `Query` - marks a field to fill in from query parameter.
- `FormData` - marks a field to fill in from request body form data.
- `Wildcard` - marks a field that will take any unrecognized remaining part of an URL as string.
```
---


## File: docs/WebSharper8UpgradeGuide.md
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/WebSharper8UpgradeGuide.md

```md
# WebSharper 8 upgrade guide

The biggest change coming with WebSharper 8 is that it outputs module-based JavaScript code. This output needs additional processing for both production and debugging purposes, this document covers how to:

* configure `esbuild` to bundle the WebSharper 8 output,
* make the code bundles smaller by separating them by page,
* optionally add a debug mode using `vite`,
* adapt to changes of C# templating.

First, update all your WebSharper NuGet packages to 8.0 versions.

## Production bundling

This is applicable for Web, SPA, and Html (offline) projects.

1. Redirect your WebSharper output to a temporary directory by changing the `"outputDir"` setting in `wsconfig.json` to for example `"build"`. For older projects, you might have your output folder configured in project settings as `WebProjectOutputDir`, `WebSharperBundleOutputDir`, or `WebSharperHtmlDirectory`. For client-server projects, also add `"preBundle": true` to `wsconfig.json`.

2. Add a `package.json` file with contents and replace "YourProjectName":
  ```json
  {
    "name": "YourProjectName",
    "version": "1.0.0",
    "devDependencies": {
      "esbuild": "^0.25.1"
    }
  }
  ```

If you use any WebSharper bindings, Femto is an automated tool to install their npm dependencies. To run it, execute:
  ```
  dotnet tool install femto --global
  femto --resolve
  ```

3. Add an `esbuild.config.mjs` with contents and replace "YourProjectName":
  ```javascript
  import { existsSync, cpSync, readdirSync } from 'fs'
  import { build } from 'esbuild'
  
  if (existsSync('./build/Content/WebSharper/')) {
    cpSync('./build/Content/WebSharper/', './wwwroot/Content/WebSharper/', { recursive: true });
  }
  
  const files = readdirSync('./build/Scripts/WebSharper/YourProjectName/');
  
  files.forEach(file => {
    if (file.endsWith('.js')) {
      var options =
      {
        entryPoints: ['./build/Scripts/WebSharper/YourProjectName/' + file],
        bundle: true,
        minify: true,
        format: 'iife',
        outfile: 'wwwroot/Scripts/WebSharper/' + file,
        globalName: 'wsbundle'
      };
  
      console.log("Bundling:", file);
      build(options);
    }
  });
  ```

This copies over the WebSharper-handled Content files if any, and uses esbuild to bundle up the JavaScript output.

4. Add this to your project to execute the mjs script on build:
```xml
  <Target Name="ESBuildBundle" AfterTargets="WebSharperCompile">
    <Exec Command="npm install" />
    <Exec Command="node ./esbuild.config.mjs" />
  </Target>
```

At this point, when running your website or generating html, you should see an `all.js` file referenced that contains all the code in bundled and minified form. This is not yet ideal, on a multi-page site, it's best to minimize the required code per page. A new functionality allows for this.

## Optimize per-page bundles

In your Sitelet definition, where you return `Content.Page` responses, you can add a new `Bundle` argument that will set the name of the bundle that is created for that page. The WebSharper compiler looks inside the `Body` argument as provided in the source code for any `Web.Control` initializations (including the `client`) helper and will include all necessary client-side code in the bundle. The `Bundle` argument must be a file name without an extension that WebSharper will create for your project.

At runtime, the necessary imports are checked against the known bundle name, and if the pre-compiled bundle for the page is not sufficient (for example your code includes some client-side content from a non-annotated helper function), `all.js` will be linked instead as a fallback. So to optimize your website, it's best to avoid this.

These are some considerations:
* If multiple pages use exactly or even just roughly the client-side code, using the same bundle name will cover everything needed for all, optimizing total code sizes.
* If you use server-side helper functions that create client-side content, and you want to include it in a bundle, use the `Content.BundleScope` helper. Or if it is used in multiple bundles, use `Content.BundleScopes`.

Example:

```fsharp
// This helper uses a client-side function to construct some DOM.
// As it is not within the Content.Page initialization,
// we are using Content.BundleScopes to add them to the code bundles.
let Shared() =
    Content.BundleScopes [| "home"; "about" |] (
        div [] [ client (Client.Shared()) ]
    )

// The pages are marked separately with bundle names,
// Content.Page registers the client-side contents to go to that bundle.
let HomePage ctx =
    Content.Page(
        Templating.Main ctx EndPoint.Home "Home" [
            h1 [] [text "Say Hi to the server!"]
            div [] [client (Client.Main())]
            Shared()
        ], 
        Bundle = "home"
    )

let AboutPage ctx =
    Content.Page(
        Templating.Main ctx EndPoint.About "About" [
            h1 [] [text "About"]
            div [] [client (Client.About())]
            Shared()
        ], 
        Bundle = "about"
    )
```

## Debug mode

For debugging one class per file readable code, you can make `esbuild` to run in Release Mode only.

1. Change `wsconfig.json`:
  ```json
    "outputDir": "wwwroot",
    "release": {
      "outputDir": "build",
      "preBundle": true
    }
  ```
and add a conditional to the project target:
```xml
  <Target Name="ESBuildBundle" AfterTargets="WebSharperCompile" Condition=" '$(Configuration)' == 'Release' ">
```

2. With above changes in Debug configuration, WebSharper will create one class per file readable `.js` files as output and there is no prebundling. 
If you are not using any npm packages, your site could be fully functional with your browser interpreting module-based JavaScript.
However, some tool like `vite` is needed to handle any npm packages if present.
There is a built-in helper, add
```fsharp
#if DEBUG        
        .UseWebSharperScriptRedirect(startVite = true)
#endif
```
in your ASP.Net Core startup, before `.UseStaticFiles()`. 
This will start `vite` in a separate process if not running yet when your website starts.

3. Set a `"DebugScriptRedirectUrl": "http://localhost:1234"` within the `"websharper"` section of your `appsettings.json`.
Change the 1234 port to something not colliding with other local ports generated for your solution to avoid conflicts.

## C# templating

The WebSharper.UI C# templating now uses a source code generator. Some project file changes are required to make it work.
1. Add these to a `PropertyGroup` section of your project file:
```xml
<EmitCompilerGeneratedFiles>true</EmitCompilerGeneratedFiles>
<CompilerGeneratedFilesOutputPath>Generated</CompilerGeneratedFilesOutputPath>
```
This will make the compiler write out generated code to the disk. You may want to also add the `**/Generated/` folders or the `.g.cs` pattern to your `.gitignore` file.
2. Change your template html files to have `AdditionalFiles` item type instead of `Content` or `None`.
3. Now, during a compilation the generated files are appearing twice, we must exclude the files from the C# compilation.
You can do this by adding this to your project file:
```xml
  <ItemGroup>
    <!-- Exclude the earlier output of source generators from the C# compilation -->
    <Compile Remove="$(CompilerGeneratedFilesOutputPath)/**/*.cs" />
  </ItemGroup>
```
```
---


## File: docs/dep-form-ex.png
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/dep-form-ex.png

Content skipped: Image file
---


## File: docs/dep-form.png
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/dep-form.png

Content skipped: Image file
---


## File: docs/doc.fsx
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/doc.fsx

```fsx
// $begin{copyright}
//
// This file is part of WebSharper
//
// Copyright (c) 2008-2014 IntelliFactory
//
// Licensed under the Apache License, Version 2.0 (the "License"); you
// may not use this file except in compliance with the License.  You may
// obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
// implied.  See the License for the specific language governing
// permissions and limitations under the License.
//
// $end{copyright}

open System
open System.IO
open System.Text.RegularExpressions

let linkPattern =
    Regex(@"\((\w+)[.]md\)", RegexOptions.Multiline)

type Link =
    {
        Source : string
        Target : string
    }

    override link.ToString() =
        String.Format("{0} -> {1}", link.Source, link.Target)

let getLinks (file: FileInfo) =
    let t = File.ReadAllText(file.FullName)
    Set [|
        for m in linkPattern.Matches(t) ->
            m.Groups.[1].Value
    |]
    |> Set.map (fun info ->
        {
            Source = file.Name
            Target = info
        })

let manualPage =
    FileInfo(Path.Combine(__SOURCE_DIRECTORY__, "WebSharper.md"))

let tocLinks =
    getLinks manualPage
    |> Set.map (fun link -> link.Target)

let d = DirectoryInfo(__SOURCE_DIRECTORY__)

type Problem =
    | Missing of Link
    | Orphan of Link

    override p.ToString() =
        match p with
        | Missing k -> "missing : " + string k
        | Orphan k -> "orphan  : " + string k

let doesExist name =
    let p = Path.Combine(__SOURCE_DIRECTORY__, name + ".md")
    File.Exists(p)

let problems =
    [|
        for file in d.EnumerateFiles("*.md") do
            let links = getLinks file
            yield!
                links
                |> Seq.choose (fun link ->
                    if not (doesExist link.Target) then
                        Some (Missing link)
                    elif not (tocLinks.Contains(link.Target)) && link.Target <> "WebSharper" then
                        Some (Orphan link)
                    else
                        None)
    |]

if problems.Length > 0 then
    printfn "Problems:"
    Seq.iter (printfn "  %O") problems


```
---


## File: docs/enhance-form.png
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/enhance-form.png

Content skipped: Image file
---


## File: docs/jQuery.md
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/jQuery.md

```md
# WebSharper Extension for jQuery

|               |                       |
| --------------|-----------------------|
| Library Home  | [jquery.com][jq]      |
| Bound Version | 1.10.2                |
| NuGet Package | WebSharper            |
| Assembly      | WebSharper.JQuery.dll |
| Namespace     | WebSharper.JQuery     |

[jq]: http://jquery.com

Note: the jQuery extension is distributed and automatically included
with WebSharper.

The API is as far as possible a one-to-one mapping of the JavaScript
API, making it straightforward to convert existing jQuery code to F#.

## Selecting DOM Nodes

jQuery enables you to construct wrappers for DOM nodes or to create
new elements by supplying a string argument to the jQuery function:

    var itemElems = jQuery(".Item")
    var myNewElem = jQuery("<p>Foo</p>")

In the jQuery WebSharper extension, the same functionality is provided
by the static member `Of` on the `JQuery` class:

    let itemElems = JQuery.Of(".Item")
    let myNewElem = JQuery.Of("<p>Foo</p>")

## Methods

The return value of the `Of` method is an object of type `JQuery`,
containing all the familiar instance members.

The following JavaScript example shows how you can invoke the `ready`
function on the jQuery object:

    jQuery(document).ready(function(){
       // Your code here
    });
 
The equivallent code in WebSharper is:

    JQuery.Of(Dom.Document.Current).Ready(fun _ ->
        // Your code here
    )

In jQuery, functions are often flexible with regards to their input
parameters.  In F# this is represented by overloaded functions
corresponding to different ways to invoke a method.

For example the `fadeOut` function that hides an element after
applying a `fade-out` effect accepts various types of arguments, e.g:

    jQuery("#MyElem").fadeOut()
    jQuery("#MyElem").fadeOut("slow")
    jQuery("#MyElem").fadeOut(100, function () {alert("Faded out");})

In F#, you write:

    JQuery.Of("#MyElem").FadeOut()
    JQuery.Of("#MyElem").FadeOut("slow")
    JQuery.Of("#MyElem").FadeOut(100., fun () -> JavaScript.Alert "Faded out")

## Chaining

Just like in pure jQuery, __chaining__ of method invocations is
supported since the result type of most jQuery operations is another
jQuery object.  Here is an example of chaining in JavaScript:

    jQuery('#MyDiv').removeClass('Off').addClass('On')

And the corresponding code written in F#:

    JQuery.Of("#MyDiv").RemoveClass("Off").AddClass("On")

## Ignoring Return Values

For situations when the result of a method invocation can be ignored,
the extension provides an extra property `Ignore`, which simply
changes the return type to unit in F#:

    JQ.Of("#MyElem").FadeOut().Ignore

## Implicit Arguments

Callback functions in JavaScript are sometimes passed an implicit
argument - `this`.  jQuery makes heavy use of this idiom.  Here is an
example of the `each` function:

    jQuery("div").each(function () {
        jQuery(this).hide();
    });

The `this` object refers to the current element when traversing the
jQuery collection.

In the WebSharper extension `this` parameter is explicit.  The code is
written as:

    JQuery.Of("div").Each(fun el ->
        JQuery.of(el).Hide().Ignore
    ))

## DOM Manipulation

The following example changes the background of every second list item
in all the list with the ID `MyList`:

    [<JavaScript>]
    let ChangeBackground () =
        JQuery.Of("#MyList li").Each(fun (el: Dom.Element) ix ->
            if ix % 2 = 0 then
                JQuery.Of(el).Css("background-color", "red").Ignore
        )
        |> ignore

## Ajax

Here is an example using the `getJSON` function for fetching JSON data
from the server.

    [<JavaScriptType>]
    type Data =
        {
           Name : string
           Email : string
        }

    [<JavaScript>]
    let AjaxCall () =
        JQuery.GetJSON("data.json", fun (data, _) ->
            let data = As<Data> data
            let nameLabel =
                JQuery.Of("<div/>").Text("Name: " + data.Name)
            let descrLabel =
                JQuery.Of("<div/>").Text("Email: " + data.Email)
            JQuery.Of("<p/>").
                Append(nameLabel).
                Append(descrLabel).
                AppendTo("body").
                Ignore
        )

## Attaching Event Handlers

Below is an example of constructing a button and adding an event
handler for the click event:

    [<JavaScript>]
    let ButtonWithEvent () =
        JQuery.Of("<button/>")
            .Text("Click")
            .Click(fun _ _ ->
                Window.Alert("Button clicked"))
            .AppendTo("body")
            .Ignore

```
---


## File: docs/label-form.png
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/label-form.png

Content skipped: Image file
---


## File: docs/person-form-ex.png
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/person-form-ex.png

Content skipped: Image file
---


## File: docs/qunit.png
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/qunit.png

Content skipped: Image file
---


## File: docs/static-comp-form.png
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/static-comp-form.png

Content skipped: Image file
---


## File: docs/validation-form.png
### URL: https://github.com/dotnet-websharper/core/blob/master/docs/validation-form.png

Content skipped: Image file
---


# Crawl Statistics

- **Source:** https://github.com/dotnet-websharper/core/tree/master/docs
- **Repository:** dotnet-websharper/core
- **Branch:** master
- **Depth:** 5
- **Files processed:** 23
- **Total files found:** 23
- **Duration:** 5.00 seconds
- **Crawl completed:** 5/16/2025, 2:57:39 PM

