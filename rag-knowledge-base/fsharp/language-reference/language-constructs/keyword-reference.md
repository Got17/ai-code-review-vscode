# Keyword Reference
*   04/07/2022

Feedback

This topic contains links to information about all F# language keywords.

## F# Keyword Table
The following table shows all F# keywords in alphabetical order, together with brief descriptions and links to relevant topics that contain more information.

| Keyword | Link | Description |
| --- | --- | --- |
| `abstract` | [Members](members/), [Abstract Classes](abstract-classes) | Indicates a method that either has no implementation in the type in which it is declared or that is virtual and has a default implementation. |
| `and` | [`let` Bindings](functions/let-bindings), [Records](records), [Members](members/), [Constraints](generics/constraints) | Used in mutually recursive bindings and records, in property declarations, and with multiple constraints on generic parameters. |
| `as` | [Classes](classes), [Pattern Matching](pattern-matching) | Used to give the current class object an object name. Also used to give a name to a whole pattern within a pattern match. |
| `assert` | [Assertions](assertions) | Used to verify code during debugging. |
| `base` | [Classes](classes), [Inheritance](inheritance) | Used as the name of the base class object. |
| `begin` | [Verbose Syntax](verbose-syntax) | In verbose syntax, indicates the start of a code block. |
| `class` | [Classes](classes) | In verbose syntax, indicates the start of a class definition. |
| `default` | [Members](members/) | Indicates an implementation of an abstract method; used together with an abstract method declaration to create a virtual method. |
| `delegate` | [Delegates](delegates) | Used to declare a delegate. |
| `do` | [do Bindings](functions/do-bindings), [Loops: `for...to` Expression](loops-for-to-expression), [Loops: `for...in` Expression](loops-for-in-expression), [Loops: `while...do` Expression](loops-while-do-expression) | Used in looping constructs or to execute imperative code. |
| `done` | [Verbose Syntax](verbose-syntax) | In verbose syntax, indicates the end of a block of code in a looping expression. |
| `downcast` | [Casting and Conversions](casting-and-conversions) | Used to convert to a type that is lower in the inheritance chain. |
| `downto` | [Loops: `for...to` Expression](loops-for-to-expression) | In a `for` expression, used when counting in reverse. |
| `elif` | [Conditional Expressions: `if...then...else`](conditional-expressions-if-then-else) | Used in conditional branching. A short form of `else if`. |
| `else` | [Conditional Expressions: `if...then...else`](conditional-expressions-if-then-else) | Used in conditional branching. |
| `end` | [Structs](structs), [Discriminated Unions](discriminated-unions), [Records](records), [Type Extensions](type-extensions), [Verbose Syntax](verbose-syntax) | In type definitions and type extensions, indicates the end of a section of member definitions. In verbose syntax, used to specify the end of a code block that starts with the `begin` keyword. |
| `exception` | [Exception Handling](exception-handling/), [Exception Types](exception-handling/exception-types) | Used to declare an exception type. |
| `extern` | [External Functions](functions/external-functions) | Indicates that a declared program element is defined in another binary or assembly. |
| `false` | [Primitive Types](basic-types) | Used as a Boolean literal. |
| `finally` | [Exceptions: The `try...finally` Expression](exception-handling/the-try-finally-expression) | Used together with `try` to introduce a block of code that executes regardless of whether an exception occurs. |
| `fixed` | [Fixed](fixed) | Used to "pin" a pointer on the stack to prevent it from being garbage collected. |
| `for` | [Loops: `for...to` Expression](loops-for-to-expression), [Loops: `for...in` Expression](loops-for-in-expression) | Used in looping constructs. |
| `fun` | [Lambda Expressions: The `fun` Keyword](functions/lambda-expressions-the-fun-keyword) | Used in lambda expressions, also known as anonymous functions. |
| `function` | [Match Expressions](match-expressions), [Lambda Expressions: The fun Keyword](functions/lambda-expressions-the-fun-keyword) | Used as a shorter alternative to the `fun` keyword and a `match` expression in a lambda expression that has pattern matching on a single argument. |
| `global` | [Namespaces](namespaces) | Used to reference the top-level .NET namespace. |
| `if` | [Conditional Expressions: `if...then...else`](conditional-expressions-if-then-else) | Used in conditional branching constructs. |
| `in` | [Loops: `for...in` Expression](loops-for-in-expression), [Verbose Syntax](verbose-syntax) | Used for sequence expressions and, in verbose syntax, to separate expressions from bindings. |
| `inherit` | [Inheritance](inheritance) | Used to specify a base class or base interface. |
| `inline` | [Functions](functions/), [Inline Functions](functions/inline-functions) | Used to indicate a function that should be integrated directly into the caller's code. |
| `interface` | [Interfaces](interfaces) | Used to declare and implement interfaces. |
| `internal` | [Access Control](access-control) | Used to specify that a member is visible inside an assembly but not outside it. |
| `lazy` | [Lazy Expressions](lazy-expressions) | Used to specify an expression that is to be performed only when a result is needed. |
| `let` | [`let` Bindings](functions/let-bindings) | Used to associate, or bind, a name to a value or function. |
| `let!` | [Async expressions](async-expressions), [Task expressions](task-expressions), [Computation Expressions](computation-expressions) | Used in async expressions to bind a name to the result of an asynchronous computation, or, in other computation expressions, used to bind a name to a result, which is of the computation type. |
| `match` | [Match Expressions](match-expressions) | Used to branch by comparing a value to a pattern. |
| `match!` | [Computation Expressions](computation-expressions#match) | Used to inline a call to a computation expression and pattern match on its result. |
| `member` | [Members](members/) | Used to declare a property or method in an object type. |
| `module` | [Modules](modules) | Used to associate a name with a group of related types, values, and functions, to logically separate it from other code. |
| `mutable` | [`let` Bindings](functions/let-bindings) | Used to declare a variable, that is, a value that can be changed. |
| `namespace` | [Namespaces](namespaces) | Used to associate a name with a group of related types and modules, to logically separate it from other code. |
| `new` | [Constructors](members/constructors), [Constraints](generics/constraints) | Used to declare, define, or invoke a constructor that creates or that can create an object. Also used in generic parameter constraints to indicate that a type must have a certain constructor. |
| `not` | [Symbol and Operator Reference](symbol-and-operator-reference/), [Constraints](generics/constraints) | Not actually a keyword. However, `not struct` in combination is used as a generic parameter constraint. |
| `null` | [Null Values](values/null-values), [Constraints](generics/constraints) | Indicates the absence of an object. Also used in generic parameter constraints. |
| `of` | [Discriminated Unions](discriminated-unions), [Delegates](delegates), [Exception Types](exception-handling/exception-types) | Used in discriminated unions to indicate the type of categories of values, and in delegate and exception declarations. |
| `open` | [Import Declarations: The `open` Keyword](import-declarations-the-open-keyword) | Used to make the contents of a namespace or module available without qualification. |
| `or` | [Symbol and Operator Reference](symbol-and-operator-reference/), [Constraints](generics/constraints) | Used with Boolean conditions as a Boolean `or` operator. Equivalent to `||`. Also used in member constraints. |
| `override` | [Members](members/) | Used to implement a version of an abstract or virtual method that differs from the base version. |
| `private` | [Access Control](access-control) | Restricts access to a member to code in the same type or module. |
| `public` | [Access Control](access-control) | Allows access to a member from outside the type. |
| `rec` | [Functions](functions/) | Used to indicate that a function is recursive. |
| `return` | [Computation Expressions](computation-expressions), [Async expressions](async-expressions), [Task expressions](task-expressions) | Used to indicate a value to provide as the result of a computation expression. |
| `return!` | [Computation Expressions](computation-expressions), [Async expressions](async-expressions), [Task expressions](task-expressions) | Used to indicate a computation expression that, when evaluated, provides the result of the containing computation expression. |
| `select` | [Query Expressions](query-expressions) | Used in query expressions to specify what fields or columns to extract. Contextual keyword — only acts like a keyword in the correct context. |
| `static` | [Members](members/) | Used to indicate a method or property that can be called without an instance of a type, or a value member that is shared among all instances of a type. |
| `struct` | [Structs](structs), [Tuples](tuples), [Constraints](generics/constraints) | Used to declare a structure type, specify a struct tuple, or as a generic parameter constraint. Also for OCaml compatibility in module definitions. |
| `then` | [Conditional Expressions: `if...then...else`](conditional-expressions-if-then-else), [Constructors](members/constructors) | Used in conditional expressions. Also used to perform side effects after object construction. |
| `to` | [Loops: `for...to` Expression](loops-for-to-expression) | Used in `for` loops to indicate a range. |
| `true` | [Primitive Types](basic-types) | Used as a Boolean literal. |
| `try` | [Exceptions: The `try...with` Expression](exception-handling/the-try-with-expression), [Exceptions: The `try...finally` Expression](exception-handling/the-try-finally-expression) | Used to introduce a block of code that might generate an exception. Used with `with` or `finally`. |
| `type` | [F# Types](fsharp-types), [Classes](classes), [Records](records), [Structs](structs), [Enumerations](enumerations), [Discriminated Unions](discriminated-unions), [Type Abbreviations](type-abbreviations), [Units of Measure](units-of-measure) | Used to declare a class, record, structure, discriminated union, enumeration type, unit of measure, or type abbreviation. |
| `upcast` | [Casting and Conversions](casting-and-conversions) | Used to convert to a type that is higher in the inheritance chain. |
| `use` | [Resource Management: The `use` Keyword](resource-management-the-use-keyword) | Used instead of `let` for values that require `Dispose` to be called to free resources. |
| `use!` | [Computation Expressions](computation-expressions), [Async expressions](async-expressions), [Task expressions](task-expressions) | Used instead of `let!` in async expressions and other computation expressions for values that require `Dispose` to be called to free resources. |
| `val` | [Explicit Fields: The `val` Keyword](members/explicit-fields-the-val-keyword), [Signatures](signature-files), [Members](members/) | Used in a signature to indicate a value, or in a type to declare a member, in limited situations. |
| `void` | [Primitive Types](basic-types) | Indicates the .NET `void` type. Used when interoperating with other .NET languages. |
| `when` | [Constraints](generics/constraints) | Used for Boolean conditions (_when guards_) on pattern matches and to introduce a constraint clause for a generic type parameter. |
| `while` | [Loops: `while...do` Expression](loops-while-do-expression) | Introduces a looping construct. |
| `with` | [Match Expressions](match-expressions), [Object Expressions](object-expressions), [Copy and Update Record Expressions](copy-and-update-record-expressions), [Type Extensions](type-extensions), [Exceptions: The `try...with` Expression](exception-handling/the-try-with-expression) | Used together with the `match` keyword in pattern matching expressions. Also used in object expressions, record copying expressions, and type extensions to introduce member definitions, and to introduce exception handlers. |
| `yield` | [Lists](lists), [Arrays](arrays), [Sequences](sequences) | Used in a list, array, or sequence expression to produce a value for a sequence. |
| `yield!` | [Computation Expressions](computation-expressions), [Async expressions](async-expressions), [Task expressions](task-expressions) | Used in a computation expression to append the result of a given computation expression to a collection of results for the containing computation expression. |
| `const` | [Type Providers](../tutorials/type-providers/) | Type Providers allow the use of `const` as a keyword to specify a constant literal as a type parameter argument. |

The following tokens are reserved in F# because they are keywords in the OCaml language:

*   `asr`
*   `land`
*   `lor`
*   `lsl`
*   `lsr`
*   `lxor`
*   `mod`
*   `sig`

If you use the `--mlcompatibility` compiler option, the above keywords are available for use as identifiers.

The following tokens are reserved as keywords for future expansion of F#:

*   `break`
*   `checked`
*   `component`
*   `const`
*   `constraint`
*   `continue`
*   `event`
*   `external`
*   `include`
*   `mixin`
*   `parallel`
*   `process`
*   `protected`
*   `pure`
*   `sealed`
*   `tailcall`
*   `trait`
*   `virtual`

The following tokens were once reserved as keywords but were [released](https://github.com/fsharp/fslang-design/blob/main/FSharp-4.1/FS-1016-unreserve-keywords.md) in F# 4.1, so now you can use them as identifiers:

| Keyword | Reason |
| --- | --- |
| `method` | Use `member` to introduce methods. |
| `constructor` | Use `new` to introduce constructors. |
| `atomic` | Related to the fad for transactional memory circa 2006. This would now be a library-defined computation expression. |
| `eager` | No longer needed; it was initially designed to be `let eager` to match a potential `let lazy`. |
| `object` | No need to reserve this. |
| `recursive` | Use `rec`. |
| `functor` | If F# added parameterized modules, you'd use `module M(args) = ...`. |
| `measure` | The `[<Measure>]` attribute suffices. |
| `volatile` | The `[<Volatile>]` attribute suffices. |

> Reference: https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/keyword-reference
