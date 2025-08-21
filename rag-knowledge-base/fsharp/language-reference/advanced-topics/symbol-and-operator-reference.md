# Symbol and operator reference
This article includes tables describing the symbols and operators that are used in F# and provides a brief description of each. Some symbols and operators have two or more entries when used in multiple roles.

## Comment, compiler directive and attribute symbols
The following table describes symbols related to comments, compiler directives and attributes.

| Symbol or operator | Links | Description |
| --- | --- | --- |
| `(\*...\*)` |  | Delimits a comment that could span multiple lines. |
| `//` |  | Indicates the beginning of a single-line comment. |
| `///` | [XML Documentation](../xml-documentation) | Indicates an XML comment. |
| `#` | [Compiler Directives](../compiler-directives) | Prefixes a preprocessor or compiler directive. |
| `[<...>]` | [Attributes](../attributes) | Delimits an attribute. |

## String and identifier symbols
The following table describes symbols related to strings.

| Symbol or operator | Links | Description |
| --- | --- | --- |
| `"` | [Strings](../strings) | Delimits a text string. |
| `@"` | [Strings](../strings) | Starts a verbatim text string, which may include backslashes and other characters. |
| `"""` | [Strings](../strings) | Delimits a triple-quoted text string, which may include backslashes, double quotation marks and other characters. |
| `$"` | [Interpolated Strings](../interpolated-strings) | Starts an interpolated string. |
| `'` | [Literals](../literals) | Delimits a single-character literal. |
| ``` ``...`` ``` |  | Delimits an identifier that would otherwise not be a legal identifier, such as a language keyword. |
| `\` | [Strings](../strings) | Escapes the next character; used in character and string literals. |

## Arithmetic operators
The following table describes the arithmetic operators.

| Symbol or operator | Links | Description |
| --- | --- | --- |
| `+` | [Arithmetic Operators](arithmetic-operators) | * When used as a binary operator, adds the left and right sides.<br>* When used as a unary operator, indicates a positive quantity. (Formally, it produces the same value with the sign unchanged.) |
| `-` | [Arithmetic Operators](arithmetic-operators) | * When used as a binary operator, subtracts the right side from the left side.<br>* When used as a unary operator, performs a negation operation. |
| `*` | [Arithmetic Operators](arithmetic-operators) <br> [Tuples](../tuples) <br> [Units of Measure](../units-of-measure) | * When used as a binary operator, multiplies the left and right sides.<br>* In types, indicates pairing in a tuple.<br>* Used in units of measure types. |
| `/` | [Arithmetic Operators](arithmetic-operators) <br> [Units of Measure](../units-of-measure) | * Divides the left side (numerator) by the right side (denominator).<br>* Used in units of measure types. |
| `%` | [Arithmetic Operators](arithmetic-operators) | Computes the integer remainder. |
| `**` | [Arithmetic Operators](arithmetic-operators) | Computes the exponentiation operation (`x ** y` means `x` to the power of `y`). |

## Comparison operators
The following table describes the comparison operators.

| Symbol or operator | Links | Description |
| --- | --- | --- |
| `<` | [Arithmetic Operators](arithmetic-operators) | Computes the less-than operation. |
| `<>` | [Arithmetic Operators](arithmetic-operators) | Returns `true` if the left side is not equal to the right side; otherwise, returns `false`. |
| `<=` | [Arithmetic Operators](arithmetic-operators) | Returns `true` if the left side is less than or equal to the right side; otherwise, returns `false`. |
| `=` | [Arithmetic Operators](arithmetic-operators) | Returns `true` if the left side is equal to the right side; otherwise, returns `false`. |
| `>` | [Arithmetic Operators](arithmetic-operators) | Returns `true` if the left side is greater than the right side; otherwise, returns `false`. |
| `>=` | [Arithmetic Operators](arithmetic-operators) | Returns `true` if the left side is greater than or equal to the right side; otherwise, returns `false`. |

## Boolean operators
The following table describes the arithmetic and boolean operators symbols.

| Symbol or operator | Links | Description |
| --- | --- | --- |
| `&&` | [Boolean Operators](boolean-operators) | Computes the Boolean AND operation. |
| `\|\|` | [Boolean Operators](boolean-operators) | Computes the Boolean OR operation. |

## Bitwise operators
The following table describes bitwise operators.

| Symbol or operator | Links | Description |
| --- | --- | --- |
| `&&&` | [Bitwise Operators](bitwise-operators) | Computes the bitwise AND operation. |
| `<<<` | [Bitwise Operators](bitwise-operators) | Shifts bits in the quantity on the left side to the left by the number of bits specified on the right side. |
| `>>>` | [Bitwise Operators](bitwise-operators) | Shifts bits in the quantity on the left side to the right by the number of places specified on the right side. |
| `^^^` | [Bitwise Operators](bitwise-operators) | Computes the bitwise exclusive OR operation. |
| `\|\|\|` | [Bitwise Operators](bitwise-operators) | Computes the bitwise OR operation. |
| `~~~` | [Bitwise Operators](bitwise-operators) | Computes the bitwise NOT operation. |

## Function symbols and operators
The following table describes the operators and symbols related to functions.

| Symbol or operator | Links | Description |
| --- | --- | --- |
| `->` | [Functions](../functions/) | In function expressions, separates the input pattern from the output expression. |
| `\|>` | [Functions](../functions/#pipelines) | Passes the result of the left side to the function on the right side (forward pipe operator). |
| `\|\|>` | [( \|\|> )<'T1,'T2,'U> Function](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-core-operators.html#\(%20%7C%7C%3E%20\)) | Passes the tuple of two arguments on the left side to the function on the right side. |
| `\|\|\|>` | [( \|\|\|> )<'T1,'T2,'T3,'U> Function](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-core-operators.html#\(%20%7C%7C%7C%3E%20\)) | Passes the tuple of three arguments on the left side to the function on the right side. |
| `>>` | [Functions](../functions/) | Composes two functions (forward composition operator). |
| `<<` | [Functions](../functions/) | Composes two functions in reverse order; the second one is executed first (backward composition operator). |
| `<\|` | [Functions](../functions/) | Passes the result of the expression on the right side to the function on left side (backward pipe operator). |
| `<\|\|` | [( <\|\| )<'T1,'T2,'U> Function](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-core-operators.html#\(%20%3C%7C%7C%20\)) | Passes the tuple of two arguments on the right side to the function on left side. |
| `<\|\|\|` | [( <\|\|\| )<'T1,'T2,'T3,'U> Function](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-core-operators.html#\(%20%3C%7C%7C%7C%20\)) | Passes the tuple of three arguments on the right side to the function on left side. |

## Type symbols and operators
The following table describes symbols related to type annotation and type tests.

| Symbol or operator | Links | Description |
| --- | --- | --- |
| `->` | [Functions](../functions/) | In function types, delimits arguments and return values, also yields a result in sequence expressions. |
| `:` | [Functions](../functions/) | In a type annotation, separates a parameter or member name from its type. |
| `:>` | [Casting and Conversions](../casting-and-conversions) | Converts a type to type that is higher in the hierarchy. |
| `:?` | [Match Expressions](../match-expressions) | Returns `true` if the value matches the specified type (including if it is a subtype); otherwise, returns `false` (type test operator). |
| `:?>` | [Casting and Conversions](../casting-and-conversions) | Converts a type to a type that is lower in the hierarchy. |
| `#` | [Flexible Types](../flexible-types) | When used with a type, indicates a _flexible type_, which refers to a type or any one of its derived types. |
| `'` | [Automatic Generalization](../generics/automatic-generalization) | Indicates a generic type parameter. |
| `<...>` | [Automatic Generalization](../generics/automatic-generalization) | Delimits type parameters. |
| `^` | [Statically Resolved Type Parameters](../generics/statically-resolved-type-parameters) / [Strings](../strings) | * Specifies type parameters that must be resolved at compile time, not at run time.<br>* Concatenates strings. |
| `{}` | [Class](../classes) or [Record](../records) | When used with the `type` keyword, delimits a class or record. The type is a class when members are declared or the `class` keyword is used. Otherwise, it's a record. |
| `{\|\|}` | [Anonymous record](../anonymous-records) | Denotes an anonymous record. |

## Symbols used in member lookup and slice expressions
The following table describes additional symbols used in member lookup and slice expressions.

| Symbol or operator | Links | Description |
| --- | --- | --- |
| `.` | [Members](../members/) | Accesses a member, and separates individual names in a fully qualified name. |
| `[...]` or `.[...]` | [Arrays](../arrays) / [Indexed Properties](../members/indexed-properties) / [Slice Expressions](../slices) | Indexes into an array, string or collection, or takes a slice of a collection. |

## Symbols used in tuple, list, array, unit expressions and patterns
The following table describes symbols related to tuples, lists, unit values and arrays.

| Symbol or operator | Links | Description |
| --- | --- | --- |
| `( )` | [Unit Type](../unit-type) | Represents the single value of the unit type. |
| `,` | [Tuples](../tuples) | Separates the elements of a tuple, or type parameters. |
| `::` | [Lists](../lists) / [Match Expressions](../match-expressions) | * Creates a list. The element on the left side is prepended to the list on the right side.<br>* Used in pattern matching to separate the parts of a list. |
| `@` | [Lists](../lists) | Concatenates two lists. |
| `[...]` | [Lists](../lists) | Delimits the elements of a list. |
| `[\|...\|]` | [Arrays](../arrays) | Delimits the elements of an array. |

## Symbols used in imperative expressions
The following table describes additional symbols used in expressions.

| Symbol or operator | Links | Description |
| --- | --- | --- |
| `<-` | [Values](../values/) | Assigns a value to a variable. |
| `;` | [Verbose Syntax](../verbose-syntax) | Separates expressions (used mostly in verbose syntax). Also separates elements of a list or fields of a record. |

## Additional symbols used in sequences and computation expressions
The following table describes additional symbols used in [Sequences](../sequences) and [Computation Expressions](../computation-expressions).

| Symbol or operator | Links | Description |
| --- | --- | --- |
| `->` | [Sequences](../sequences) | Yields an expression (in sequence expressions); equivalent to the `do yield` keywords. |
| `!` | [Computation Expressions](../computation-expressions) | After a keyword, indicates a modified version of the keyword's behavior as controlled by a computation expression. |

## Additional symbols used in match patterns
The following table describes symbols related to pattern matching.

| Symbol or operator | Links | Description |
| --- | --- | --- |
| `->` | [Match Expressions](../match-expressions) | Used in match expressions. |
| `&` | [Pattern Matching](../pattern-matching) | * Computes the address of a mutable value, for use when interoperating with other languages.<br>* Used in AND patterns. |
| `_` | [Match Expressions](../match-expressions)<br>[Generics](../generics/) | * Indicates a wildcard pattern.<br>* Specifies an anonymous generic parameter. |
| `\|` | [Match Expressions](../match-expressions) | Delimits individual match cases, individual discriminated union cases, and enumeration values. |

## Additional symbols used in declarations
The following table describes symbols related to declarations.

| Symbol or operator | Links | Description |
| --- | --- | --- |
| `(\|...\|)` | [Active Patterns](../active-patterns) | Delimits an active pattern name. Also called *banana clips*. |
| `?` | [Parameters and Arguments](../parameters-and-arguments) | Specifies an optional argument. |
| `~~` | [Operator Overloading](../operator-overloading) | Used to declare an overload for the unary negation operator. |
| `~-` | [Operator Overloading](../operator-overloading) | Used to declare an overload for the unary minus operator. |
| `~+` | [Operator Overloading](../operator-overloading) | Used to declare an overload for the unary plus operator. |

## Additional symbols used in quotations
The following table describes symbols related to [Code Quotations](../code-quotations).

| Symbol or operator | Links | Description |
| --- | --- | --- |
| `<@...@>` | [Code Quotations](../code-quotations) | Delimits a typed code quotation. |
| `<@@...@@>` | [Code Quotations](../code-quotations) | Delimits an untyped code quotation. |
| `%` | [Code Quotations](../code-quotations) | Used for splicing expressions into typed code quotations. |
| `%%` | [Code Quotations](../code-quotations) | Used for splicing expressions into untyped code quotations. |

## Dynamic lookup operators
The following table describes additional symbols used in dynamic lookup expressions. They are not generally used in routine F# programming and no implementations of these operator are provided in the F# core library.

| Symbol or operator | Links | Description |
| --- | --- | --- |
| `?` |  | Used as an operator for dynamic method and property calls. |
| `? ... <- ...` |  | Used as an operator for setting dynamic properties. |

## Nullable operators in queries
[Nullable Operators](nullable-operators) are defined for use in [Query Expressions](../query-expressions). The following table shows these operators.

| Symbol or operator | Links | Description |
| --- | --- | --- |
| `%?` | [Nullable Operators](nullable-operators) | Computes the integer remainder, when the right side is a nullable type. |
| `*?` | [Nullable Operators](nullable-operators) | Multiplies the left and right sides, when the right side is a nullable type. |
| `+?` | [Nullable Operators](nullable-operators) | Adds the left and right sides, when the right side is a nullable type. |
| `-?` | [Nullable Operators](nullable-operators) | Subtracts the right side from the left side, when the right side is a nullable type. |
| `/?` | [Nullable Operators](nullable-operators) | Divides the left side by the right side, when the right side is a nullable type. |
| `<?` | [Nullable Operators](nullable-operators) | Computes the less than operation, when the right side is a nullable type. |
| `<>?` | [Nullable Operators](nullable-operators) | Computes the "not equal" operation when the right side is a nullable type. |
| `<=?` | [Nullable Operators](nullable-operators) | Computes the "less than or equal to" operation when the right side is a nullable type. |
| `=?` | [Nullable Operators](nullable-operators) | Computes the "equal" operation when the right side is a nullable type. |
| `>?` | [Nullable Operators](nullable-operators) | Computes the "greater than" operation when the right side is a nullable type. |
| `>=?` | [Nullable Operators](nullable-operators) | Computes the "greater than or equal" operation when the right side is a nullable type. |
| `?>=`, `?>`, `?<=`, `?<`, `?=`, `?<>`, `?+`, `?-`, `?*`, `?/` | [Nullable Operators](nullable-operators) | Equivalent to the corresponding operators without the `?` prefix, where a nullable type is on the left. |
| `>=?`, `>?`, `<=?`, `<?`, `=?`, `<>?`, `+?`, `-?`, `*?`, `/?` | [Nullable Operators](nullable-operators) | Equivalent to the corresponding operators without the `?` suffix, where a nullable type is on the right. |
| `?>=?`, `?>?`, `?<=?`, `?<?`, `?=?`, `?<>?`, `?+?`, `?-?`, `?*?`, `?/?` | [Nullable Operators](nullable-operators) | Equivalent to the corresponding operators without the surrounding question marks, where both sides are nullable types. |

## Reference cell operators (deprecated)
The following table describes symbols related to [Reference Cells](../reference-cells). The use of these operators generates advisory messages as of F# 6. For more information, see [Reference cell operation advisory messages](https://github.com/fsharp/fslang-design/blob/main/FSharp-6.0/FS-1111-refcell-op-information-messages.md#summary).

| Symbol or operator | Links | Description |
| --- | --- | --- |
| `!` | [Reference Cells](../reference-cells) | Dereferences a reference cell. |
| `:=` | [Reference Cells](../reference-cells) | Assigns a value to a reference cell. |

## Operator precedence
The following table shows the order of precedence of operators and other expression keywords in F#, in order from lowest precedence to the highest precedence. Also listed is the associativity, if applicable.

| Operator | Associativity |
| --- | --- |
| `as` | Right |
| `when` | Right |
| `\|` (pipe) | Left |
| `;` | Right |
| `let` | Nonassociative |
| `function`, `fun`, `match`, `try` | Nonassociative |
| `if` | Nonassociative |
| `not` | Right |
| `->` | Right |
| `:=` | Right |
| `,` | Nonassociative |
| `or`, `\|\|` | Left |
| `&`, `&&` | Left |
| `:>`, `:?>` | Right |
| `<`_op_, `>`_op_, `=`, `\|`_op_, `&`_op_, `&`, `$` <br> (including `<<<`, `>>>`, `\|\|\|`, `&&&`) | Left |
| `^`_op_ <br> (including `^^^`) | Right |
| `::` | Right |
| `:?` | Not associative |
| `-`_op_, `+`_op_ | Applies to infix uses of these symbols |
| `*`_op_, `/`_op_, `%`_op_ | Left |
| `**`_op_ | Right |
| `f x` (function application) <br> (including `lazy x`, `assert x`) | Left |
| `\|` (pattern match) | Right |
| prefix operators (`+`_op_, `-`_op_, `%`, `%%`, `&`, `&&`, `!`_op_, `~`_op_) | Left |
| `.` | Left |
| `f(x)` | Left |
| `f<`_types_`>` | Left |

F# supports custom operator overloading. This means that you can define your own operators. In the previous table, _op_ can be any valid (possibly empty) sequence of operator characters, either built-in or user-defined. Thus, you can use this table to determine what sequence of characters to use for a custom operator to achieve the desired level of precedence. Leading `.` characters are ignored when the compiler determines precedence.

> Reference: https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/symbol-and-operator-reference
