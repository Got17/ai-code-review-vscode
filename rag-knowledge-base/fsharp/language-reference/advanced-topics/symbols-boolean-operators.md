# Boolean Operators
*   11/05/2021

Feedback

This topic describes the support for Boolean operators in F#.

## Summary of Boolean Operators
The following table summarizes the Boolean operators that are available in F#. The only type supported by these operators is the `bool` type.

| Operator | Description |
| --- | --- |
| `not` | Boolean negation |
| `\|\|` | Boolean OR |
| `&&` | Boolean AND |

The Boolean AND and OR operators perform _short-circuit evaluation_, that is, they evaluate the expression on the right of the operator only when it is necessary to determine the overall result of the expression. The second expression of the `&&` operator is evaluated only if the first expression evaluates to `true`; the second expression of the `||` operator is evaluated only if the first expression evaluates to `false`.

> Reference: https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/symbol-and-operator-reference/boolean-operators
