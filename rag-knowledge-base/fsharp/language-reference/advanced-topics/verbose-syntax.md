# Verbose Syntax
There are two forms of syntax available for many constructs in F#: _verbose syntax_ and _lightweight syntax_. The verbose syntax is not as commonly used, but has the advantage of being less sensitive to indentation. The lightweight syntax is shorter and uses indentation to signal the beginning and end of constructs, rather than additional keywords like `begin`, `end`, `in`, and so on. The default syntax is the lightweight syntax. This topic describes the syntax for F# constructs when lightweight syntax is not enabled. Verbose syntax is always enabled, so even if you enable lightweight syntax, you can still use verbose syntax for some constructs.

## Table of Constructs
The following table shows the lightweight and verbose syntax for F# language constructs in contexts where there is a difference between the two forms. In this table, angle brackets (<>) enclose user-supplied syntax elements. Refer to the documentation for each language construct for more detailed information about the syntax used within these constructs.

| Language construct | Lightweight syntax | Verbose syntax |
| --- | --- | --- |
| compound expressions | ```fsharp\n<expression1>\n<expression2>\n``` | ```fsharp\n<expression1>; <expression2>\n``` |
| nested `let` bindings | ```fsharp\nlet f x =\n    let a = 1\n    let b = 2\n    x + a + b\n``` | ```fsharp\nlet f x =\n    let a = 1 in\n    let b = 2 in\n    x + a + b\n``` |
| code block | ```fsharp\n(\n    <expression1>\n    <expression2>\n)\n``` | ```fsharp\nbegin\n    <expression1>;\n    <expression2>;\nend\n``` |
| `for...do` | ```fsharp\nfor counter = start to finish do\n    ...\n``` | ```fsharp\nfor counter = start to finish do\n    ...\ndone\n``` |
| `while...do` | ```fsharp\nwhile <condition> do\n    ...\n``` | ```fsharp\nwhile <condition> do\n    ...\ndone\n``` |
| `for...in` | ```fsharp\nfor var in start .. finish do\n    ...\n``` | ```fsharp\nfor var in start .. finish do\n    ...\ndone\n``` |
| `do` | ```fsharp\ndo\n    ...\n``` | ```fsharp\ndo\n    ...\nin\n``` |
| record | ```fsharp\ntype <record-name> =\n    {\n        <field-declarations>\n    }\n    <value-or-member-definitions>\n``` | ```fsharp\ntype <record-name> =\n    {\n        <field-declarations>\n    }\n    with\n        <value-or-member-definitions>\n    end\n``` |
| class | ```fsharp\ntype <class-name>(<params>) =\n    ...\n``` | ```fsharp\ntype <class-name>(<params>) =\n    class\n        ...\n    end\n``` |
| structure | ```fsharp\n[<StructAttribute>]\ntype <structure-name> =\n    ...\n``` | ```fsharp\ntype <structure-name> =\n    struct\n        ...\n    end\n``` |
| discriminated union | ```fsharp\ntype <union-name> =\n    | ...\n    | ...\n    ...\n    <value-or-member definitions>\n``` | ```fsharp\ntype <union-name> =\n    | ...\n    | ...\n    ...\n    with\n        <value-or-member-definitions>\n    end\n``` |
| interface | ```fsharp\ntype <interface-name> =\n    ...\n``` | ```fsharp\ntype <interface-name> =\n    interface\n        ...\n    end\n``` |
| object expression | ```fsharp\n{ new <type-name>\n    with\n        <value-or-member-definitions>\n        <interface-implementations>\n}\n``` | ```fsharp\n{ new <type-name>\n    with\n        <value-or-member-definitions>\n    end\n    <interface-implementations>\n}\n``` |
| interface implementation | ```fsharp\ninterface <interface-name>\n    with\n        <value-or-member-definitions>\n``` | ```fsharp\ninterface <interface-name>\n    with\n        <value-or-member-definitions>\n    end\n``` |
| type extension | ```fsharp\ntype <type-name>\n    with\n        <value-or-member-definitions>\n``` | ```fsharp\ntype <type-name>\n    with\n        <value-or-member-definitions>\n    end\n``` |
| module | ```fsharp\nmodule <module-name> =\n    ...\n``` | ```fsharp\nmodule <module-name> =\n    begin\n        ...\n    end\n``` |

> Reference: https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/verbose-syntax
