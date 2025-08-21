# Copy and Update Record Expressions
A _copy and update record expression_ is an expression that copies an existing record, updates specified fields, and returns the updated record.

## Syntax
```fsharp
{ record-name with
    updated-labels }

{| anonymous-record-name with
    updated-labels |}
```

## Remarks
Records and anonymous records are immutable by default, so it is not possible to update an existing record. To create an updated record all the fields of a record would have to be specified again. To simplify this task a _copy and update expression_ can be used. This expression takes an existing record, creates a new one of the same type by using specified fields from the expression and the missing field specified by the expression.

This can be useful when you have to copy an existing record, and possibly change some of the field values.

Take for instance a newly created record.

```fsharp
let myRecord2 =
    { MyRecord.X = 1
      MyRecord.Y = 2
      MyRecord.Z = 3 }
```

To update only two fields in that record you can use the _copy and update record expression_:

```fsharp
let myRecord3 = { myRecord2 with Y = 100; Z = 2 }
```

## Nested Record Copy and Update
In F# 7.0 and later, the _copy and update expression_ has been enhanced to support updates on nested record fields. This feature allows for more concise syntax when working with deeply nested records.

Consider the following example:

### Before

```fsharp
type SteeringWheel = { Type: string }
type CarInterior = { Steering: SteeringWheel; Seats: int }
type Car = { Interior: CarInterior; ExteriorColor: string option }

let beforeThisFeature x =
    { x with Interior = { x.Interior with
                            Steering = {x.Interior.Steering with Type = "yoke"}
                            Seats = 5
                        }
    }
```

### After

With the new feature, you can use dot-notation to reach nested fields and update them directly:

```fsharp
let withTheFeature x =
    { x with Interior.Steering.Type = "yoke"; Interior.Seats = 5 }
```

This syntax eliminates the need for multiple `with` expressions. Instead, it allows for specifying updates on nested fields directly, while still allowing multiple fields (even at different levels of nesting) to be updated in the same expression.

### Anonymous Records

The same syntax extension works for anonymous records as well. Additionally, you can use this syntax to copy and update regular records into anonymous ones, adding new fields in the process:

```fsharp
let updatedRecord =
    {| originalRecord with
        Interior.Seats = 4;
        Price = 35000 |}
```

This flexibility ensures that the same concise syntax applies whether you're working with regular or anonymous records.

> Reference: https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/copy-and-update-record-expressions
