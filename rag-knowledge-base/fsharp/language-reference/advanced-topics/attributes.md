# Attributes (F#)
Attributes enable metadata to be applied to a programming construct.

## Syntax
```fsharp
[<target:attribute-name(arguments)>]
```

## Remarks
In the previous syntax, the _target_ is optional and, if present, specifies the kind of program entity that the attribute applies to. Valid values for _target_ are shown in the table that appears later in this document.

The _attribute-name_ refers to the name (possibly qualified with namespaces) of a valid attribute type, with or without the suffix `Attribute` that is usually used in attribute type names. For example, the type `ObsoleteAttribute` can be shortened to just `Obsolete` in this context.

The _arguments_ are the arguments to the constructor for the attribute type. If an attribute has a parameterless constructor, the argument list and parentheses can be omitted. Attributes support both positional arguments and named arguments. _Positional arguments_ are arguments that are used in the order in which they appear. Named arguments can be used if the attribute has public properties. You can set these by using the following syntax in the argument list.

```fsharp
property-name = property-value
```

Such property initializations can be in any order, but they must follow any positional arguments. The following is an example of an attribute that uses positional arguments and property initializations:

```fsharp
open System.Runtime.InteropServices

[<DllImport("kernel32", SetLastError=true)>]
extern bool CloseHandle(nativeint handle)
```

In this example, the attribute is `DllImportAttribute`, here used in shortened form. The first argument is a positional parameter and the second is a property.

Attributes are a .NET programming construct that enables an object known as an _attribute_ to be associated with a type or other program element. The program element to which an attribute is applied is known as the _attribute target_. The attribute usually contains metadata about its target. In this context, metadata could be any data about the type other than its fields and members.

Attributes in F# can be applied to the following programming constructs: functions, methods, assemblies, modules, types (classes, records, structures, interfaces, delegates, enumerations, unions, and so on), constructors, properties, fields, parameters, type parameters, and return values. Attributes are not allowed on `let` bindings inside classes, expressions, or workflow expressions.

Typically, the attribute declaration appears directly before the declaration of the attribute target. Multiple attribute declarations can be used together, as follows:

```fsharp
[<Owner("Jason Carlson")>]
[<Company("Microsoft")>]
type SomeType1 =
```

You can query attributes at run time by using .NET reflection.

You can declare multiple attributes individually, as in the previous code example, or you can declare them in one set of brackets if you use a semicolon to separate the individual attributes and constructors, as follows:

```fsharp
[<Owner("Darren Parker"); Company("Microsoft")>]
type SomeType2 =
```

Typically encountered attributes include the `Obsolete` attribute, attributes for security considerations, attributes for COM support, attributes that relate to ownership of code, and attributes indicating whether a type can be serialized. The following example demonstrates the use of the `Obsolete` attribute.

```fsharp
open System

[<Obsolete("Do not use. Use newFunction instead.")>]
let obsoleteFunction x y =
  x + y

let newFunction x y =
  x + 2 * y

// The use of the obsolete function produces a warning.
let result1 = obsoleteFunction 10 100
let result2 = newFunction 10 100
```

For the attribute targets `assembly` and `module`, you apply the attributes to a top-level `do` binding in your assembly. You can include the word `assembly` or ` ``module`` ` in the attribute declaration, as follows:

```fsharp
open System.Reflection
[<assembly:AssemblyVersionAttribute("1.0.0.0")>]
[<``module``:MyCustomModuleAttribute>]
do
   printfn "Executing..."
```

If you omit the attribute target for an attribute applied to a `do` binding, the F# compiler attempts to determine the attribute target that makes sense for that attribute. Many attribute classes have an attribute of type `System.AttributeUsageAttribute` that includes information about the possible targets supported for that attribute. If the `System.AttributeUsageAttribute` indicates that the attribute supports functions as targets, the attribute is taken to apply to the main entry point of the program. If the `System.AttributeUsageAttribute` indicates that the attribute supports assemblies as targets, the compiler takes the attribute to apply to the assembly. Most attributes do not apply to both functions and assemblies, but in cases where they do, the attribute is taken to apply to the program's main function. If the attribute target is specified explicitly, the attribute is applied to the specified target.

Although you do not usually need to specify the attribute target explicitly, valid values for _target_ in an attribute along with examples of usage are shown in the following table:

| Attribute Target | Example |
| --- | --- |
| **assembly** | <pre><code class="language-fsharp">[&lt;assembly: AssemblyVersion("1.0.0.0")&gt;]</code></pre> |
| **module** | <pre><code class="language-fsharp">[&lt;\`\`module\`\`: MyCustomAttributeThatWorksOnModules&gt;]</code></pre> |
| **method** | <pre><code class="language-fsharp">[&lt;MyCustomAttributeThatWorksOnMethods&gt;]<br>let someFunction() = 42</code></pre> |
| **class** | <pre><code class="language-fsharp">[&lt;MyCustomAttributeThatWorksOnClasses&gt;]<br>type MyClass(myValue: int) =<br>    member _.MyValue = myValue</code></pre> |
| **struct** | <pre><code class="language-fsharp">[&lt;MyCustomAttributeThatWorksOnStructs&gt;]<br>[&lt;Struct&gt;]<br>type MyStruct(myValue: int) =<br>    member _.MyValue = myValue</code></pre> |
| **interface** | <pre><code class="language-fsharp">[&lt;MyCustomAttributeThatWorksOnInterfaces&gt;]<br>type MyInterface =<br>    abstract member Prop: string</code></pre> |
| **enum** | <pre><code class="language-fsharp">[&lt;MyCustomAttributeThatWorksOnEnums&gt;]<br>type Color =<br>    | Red = 0<br>    | Green = 1<br>    | Blue = 2</code></pre> |
| **constructor** | <pre><code class="language-fsharp">type MyClass(myValue: int) =<br>    member _.MyValue = myValue<br><br>    [&lt;MyCustomAttributeThatWorksOnCtors&gt;]<br>    new () = MyClass 42</code></pre> |
| **return** | <pre><code class="language-fsharp">let function1 x : [&lt;return: MyCustomAttributeThatWorksOnReturns&gt;] int = x + 1</code></pre> |
| **field** | <pre><code class="language-fsharp">[&lt;DefaultValue&gt;] val mutable x: int</code></pre> |
| **property** | <pre><code class="language-fsharp">[&lt;Obsolete&gt;] this.MyProperty = x</code></pre> |
| **param** | <pre><code class="language-fsharp">member this.MyMethod([&lt;Out&gt;] x : ref&lt;int&gt;) = x := 10</code></pre> |
| **type** | <pre><code class="language-fsharp">[&lt;type: StructLayout(LayoutKind.Sequential)&gt;]<br>type MyStruct =<br>  struct<br>    val x : byte<br>    val y : int<br>  end</code></pre> |

> Reference: https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/attributes