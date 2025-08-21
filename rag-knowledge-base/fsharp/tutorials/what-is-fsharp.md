# What is F#
F# is a universal programming language for writing succinct, robust and performant code.

F# allows you to write uncluttered, self-documenting code, where your focus remains on your problem domain, rather than the details of programming.

It does this without compromising on speed and compatibility - it is open-source, cross-platform and interoperable.

F#Copy

```fsharp
open System // Gets access to functionality in System namespace.

// Defines a list of names
let names = [ "Peter"; "Julia"; "Xi" ]

// Defines a function that takes a name and produces a greeting.
let getGreeting name = $"Hello, {name}"

// Prints a greeting for each name!
names
|> List.map getGreeting
|> List.iter (fun greeting -> printfn $"{greeting}! Enjoy your F#")
```

F# has numerous features, including:

*   Lightweight syntax
*   Immutable by default
*   Type inference and automatic generalization
*   First-class functions
*   Powerful data types
*   Pattern matching
*   Async programming

A full set of features are documented in the [F# language guide](https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/).

[](https://learn.microsoft.com/en-us/dotnet/fsharp/what-is-fsharp#rich-data-types)
## Rich data types
Types such as [Records](https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/records) and [Discriminated Unions](https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/discriminated-unions) let you represent your data.

F#Copy

```fsharp
// Group data with Records
type SuccessfulWithdrawal =
    { Amount: decimal
      Balance: decimal }

type FailedWithdrawal =
    { Amount: decimal
      Balance: decimal
      IsOverdraft: bool }

// Use discriminated unions to represent data of 1 or more forms
type WithdrawalResult =
    | Success of SuccessfulWithdrawal
    | InsufficientFunds of FailedWithdrawal
    | CardExpired of System.DateTime
    | UndisclosedFailure
```

F# records and discriminated unions are non-null, immutable, and comparable by default, making them very easy to use.

[](https://learn.microsoft.com/en-us/dotnet/fsharp/what-is-fsharp#correctness-with-functions-and-pattern-matching)
## Correctness with functions and pattern matching
F# functions are easy to define. When combined with [pattern matching](https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/pattern-matching), they allow you to define behavior whose correctness is enforced by the compiler.

```fsharp
// Returns a WithdrawalResult
let withdrawMoney amount = // Implementation elided

let handleWithdrawal amount =
    let w = withdrawMoney amount

    // The F# compiler enforces accounting for each case!
    match w with
    | Success s -> printfn $"Successfully withdrew %f{s.Amount}"
    | InsufficientFunds f -> printfn $"Failed: balance is %f{f.Balance}"
    | CardExpired d -> printfn $"Failed: card expired on {d}"
    | UndisclosedFailure -> printfn "Failed: unknown :("
```

F# functions are also first-class, meaning they can be passed as parameters and returned from other functions.

[](https://learn.microsoft.com/en-us/dotnet/fsharp/what-is-fsharp#functions-to-define-operations-on-objects)
## Functions to define operations on objects
F# has full support for objects, which are useful when you need to blend data and functionality. F# members and functions can be defined to manipulate objects.

```fsharp
type Set<'T when 'T: comparison>(elements: seq<'T>) =
    member s.IsEmpty = // Implementation elided
    member s.Contains (value) =// Implementation elided
    member s.Add (value) = // Implementation elided
    // ...
    // Further Implementation elided
    // ...
    interface IEnumerable<'T>
    interface IReadOnlyCollection<'T>

module Set =
    let isEmpty (set: Set<'T>) = set.IsEmpty

    let contains element (set: Set<'T>) = set.Contains(element)

    let add value (set: Set<'T>) = set.Add(value)
```

In F#, you will often write code that treats objects as a type for functions to manipulate. Features such as [generic interfaces](https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/interfaces), [object expressions](https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/object-expressions), and judicious use of [members](https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/members/) are common in larger F# programs.

> Reference: https://learn.microsoft.com/en-us/dotnet/fsharp/what-is-fsharp
