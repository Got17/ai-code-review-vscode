# Exception Types
There are two categories of exceptions in F#: .NET exception types and F# exception types. This topic describes how to define and use F# exception types.

## Syntax
```fsharp
exception exception-type of argument-type
```

## Remarks
In the previous syntax, _exception-type_ is the name of a new F# exception type, and _argument-type_ represents the type of an argument that can be supplied when you raise an exception of this type. You can specify multiple arguments by using a tuple type for _argument-type_.

A typical definition for an F# exception resembles the following.

```fsharp
exception MyError of string
```

You can generate an exception of this type by using the `raise` function, as follows.

```fsharp
raise (MyError("Error message"))
```

You can use an F# exception type directly in the filters in a `try...with` expression, as shown in the following example.

```fsharp
exception Error1 of string
// Using a tuple type as the argument type.
exception Error2 of string * int

let function1 x y =
   try
      if x = y then raise (Error1("x"))
      else raise (Error2("x", 10))
   with
      | Error1(str) -> printfn "Error1 %s" str
      | Error2(str, i) -> printfn "Error2 %s %d" str i

function1 10 10
function1 9 2
```

The exception type that you define with the `exception` keyword in F# is a new type that inherits from `System.Exception`.

> Reference: https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/exception-handling/exception-types
