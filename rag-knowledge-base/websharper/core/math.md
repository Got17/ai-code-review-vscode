---
title: Working with math
description: Documentation for WebSharper Math
---

## Math in WebSharper

Higher level math is supported in WebSharper via the [MathJS](http://mathjs.org/) and [MathJax](https://www.mathjax.org/) JavaScript libraries. The usage of these libraries are the same as in `JavaScript` with some small changes. `JavaScript` would let you use any type in any function, but in WebSharper to use more than one type in a function we have to use the `MathNumber` wrapper.

A little example:

In `JavaScript`:

```fsharp
math.add("5", 1.7, true);
```

In `WebSharper`:

```fsharp
Math.Add(MathNumber("5"), MathNumber(1.7), MathNumber(true))
```

Exception is when you use either only `floats`, `ints`, or `Math.Units`

```fsharp
//Only floats
Math.Add(1., 2., 3.)

//Only ints
Math.Add(1, 2, 3)

//Only Units
Math.Add(Math.Unit("1 cm"), Math.Unit("2 cm"), Math.Unit("3 cm"))
```

---

### Bignumbers

F# already supports `BigInteger` (`System.Numerics.BigInteger` or `bigint`), but `JavaScript` does not by default. With WebSharper the usage of these types and their operators are just as easy as working with integers.

Constructing `BigInteger`:

```fsharp
open System.Numerics
open WebSharper.MathJS

//The .Net way
let myBignum = bigint 100

//A new way
let myBignumFromString = Math.Bignumber("100")
```

Operations with these numbers are possible with the .Net way:

```fsharp
let addBignum = myBignum + myBignum //Math.Add(MathNumber(myBigint), MathNumber(myBigint))
```

Full Example:

`Client.fs` code:

```fsharp
namespace Bignumbers
 
open WebSharper
open WebSharper.JavaScript
open WebSharper.UI
open WebSharper.UI.Client
open WebSharper.UI.Templating
open WebSharper.MathJS
 
[<JavaScript>]
module Client =
    type IndexTemplate = Template<"wwwroot/index.html", ClientLoad.FromDocument>
 
    [<SPAEntryPoint>]
    let Main () =
        let rvInput1 = Var.Create "1"
        let rvInput2 = Var.Create "1"
 
        let viewInput1 = rvInput1.View
        let viewInput2 = rvInput2.View
 
        let result operator = 
            View.Map2 (fun (l: string) (r: string) ->
                try
                    (operator (Math.Bignumber l) (Math.Bignumber r)).ToString()
                with _ ->
                    "Wrong input"
            ) viewInput1 viewInput2
 
        let resultAdd = result (fun l r -> l + r)
        let resultSubtract = result (fun l r -> l - r)
        let resultMultiply = result (fun l r -> l * r)
        let resultDivide = result (fun l r -> l / r)
 
        IndexTemplate.Main()
            .Input1(rvInput1)
            .Input2(rvInput2)
            .ResultAdd(resultAdd)
            .ResultSubtract(resultSubtract)
            .ResultMultiply(resultMultiply)
            .ResultDivide(resultDivide)
            .Doc()
        |> Doc.RunById "main"
```

`index.html` code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Bignumbers</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.indigo-pink.min.css">
    <script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script>
    <style>
        /* Don't show the not-yet-loaded templates */
        [ws-template], [ws-children-template] {
            display: none;
        }
 
        .panel {
            margin: 20px;
            padding: 20px;
            box-shadow: 2px 2px 5px 2px #eee;
        }
 
        .result {
            width: auto;
        }
    </style>
    <script type="text/javascript" src="Scripts/Bignumbers.head.js"></script>
</head>
<body>
    <div id="main" class="panel" ws-children-template="Main">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input class="mdl-textfield__input" type="text" id="input1" ws-var="Input1" value="1" />
            <label class="mdl-textfield__label" for="input1">First number</label>
        </div><br />
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input class="mdl-textfield__input" type="text" id="input2" ws-var="Input2" value="1" />
            <label class="mdl-textfield__label" for="input2">Second number</label>
        </div>
        <table class="mdl-data-table mdl-table-js-data-table">
            <thead>
                <tr>
                    <th class="mdl-data-table__cell--non-numeric">Operation</th>
                    <th>Result</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="mdl-data-table__cell--non-numeric">Addition</td>
                    <td><p ws-replace="ResultAdd"></p></td>
                </tr>
                <tr>
                    <td class="mdl-data-table__cell--non-numeric">Subtraction</td>
                    <td><p ws-replace="ResultSubtract"></p></td>
                </tr>
                <tr>
                    <td class="mdl-data-table__cell--non-numeric">Multiplication</td>
                    <td><p ws-replace="ResultMultiply"></p></td>
                </tr>
                <tr>
                    <td class="mdl-data-table__cell--non-numeric">Divison</td>
                    <td><p ws-replace="ResultDivide"></p></td>
                </tr>
            </tbody>
        </table>
    </div>
    <script type="module" src="Scripts/Bignumbers.min.js"></script>
</body>
</html>
 
```

---

### Complex number

Just like `BigInteger`, `Complex` is a member of `System.Numerics` too, but `JavaScript` does not support them. To use the `Complex` type in our program we could construct it as we're used to it from .Net, but now we're able to do it with `Math.Complex()` too which is able to construct a `Complex` number by taking a string with the complex value.

```fsharp
open System.Numerics
open WebSharper.MathJS

//The .Net way
let myComplex = Complex(1., 1.)

//A new way
let myComplexFromString = Math.Complex("1 + 1i")
```

After constructing the numbers, we can use them as we're used to it:

```fsharp
let addComplex = myComplex + myComplex //Math.Add(MathNumber(myComplex), MathNumber(myComplex))
```

Full example:

`Client.fs` code:

```fsharp
namespace ComplexNumber
 
open WebSharper
open WebSharper.JavaScript
open WebSharper.UI
open WebSharper.UI.Client
open WebSharper.UI.Templating
 
[<JavaScript>]
module Client =
    open WebSharper.MathJS
 
    type IndexTemplate = Template<"wwwroot/index.html", ClientLoad.FromDocument>
 
    [<SPAEntryPoint>]
    let Main () =
        let rvInput1 = Var.Create "1 + 2i"
        let rvInput2 = Var.Create "2 + 1i"
        
        let viewInput1 = rvInput1.View
        let viewInput2 = rvInput2.View
 
        let result op = 
            View.Map2 (fun (l: string) (r: string) ->
                try
                    op (Math.Complex l) (Math.Complex r) |> string
                with _ ->
                    "Wrong input"
            ) viewInput1 viewInput2
            
        let resultAdd = result ( + )
        let resultSubtract = result ( - )
        let resultMultiply = result ( * )
        let resultDivide = result ( / )
 
        IndexTemplate.Main()
            .Input1(rvInput1)
            .Input2(rvInput2)
            .ResultAdd(resultAdd)
            .ResultSubtract(resultSubtract)
            .ResultMultiply(resultMultiply)
            .ResultDivide(resultDivide)
            .Doc()
        |> Doc.RunById "main"
```

`index.html` code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>ComplexNumber</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.indigo-pink.min.css">
    <script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script>
    <style>
        /* Don't show the not-yet-loaded templates */
        [ws-template], [ws-children-template] {
            display: none;
        }
 
        .panel {
            margin: 20px;
            padding: 20px;
            box-shadow: 2px 2px 5px 2px #eee;
        }
 
        .result {
            width: auto;
        }
    </style>
    <script type="text/javascript" src="Scripts/ComplexNumber.head.js"></script>
</head>
<body>
    <div id="main" class="panel" ws-children-template="Main">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input class="mdl-textfield__input" type="text" id="input1" ws-var="Input1" value="1" />
            <label class="mdl-textfield__label" for="input1">First number</label>
        </div><br />
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input class="mdl-textfield__input" type="text" id="input2" ws-var="Input2" value="1" />
            <label class="mdl-textfield__label" for="input2">Second number</label>
        </div>
        <table class="mdl-data-table mdl-table-js-data-table">
            <thead>
                <tr>
                    <th class="mdl-data-table__cell--non-numeric">Operation</th>
                    <th>Result</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="mdl-data-table__cell--non-numeric">Addition</td>
                    <td><p ws-replace="ResultAdd"></p></td>
                </tr>
                <tr>
                    <td class="mdl-data-table__cell--non-numeric">Subtraction</td>
                    <td><p ws-replace="ResultSubtract"></p></td>
                </tr>
                <tr>
                    <td class="mdl-data-table__cell--non-numeric">Multiplication</td>
                    <td><p ws-replace="ResultMultiply"></p></td>
                </tr>
                <tr>
                    <td class="mdl-data-table__cell--non-numeric">Divison</td>
                    <td><p ws-replace="ResultDivide"></p></td>
                </tr>
            </tbody>
        </table>
    </div>
    <script type="module" src="Scripts/ComplexNumber.min.js"></script>
</body>
</html>
```

---

### Fraction

The original `float` type in `JavaScript` has limitations with its precision, but it's solved with the `Math.Fraction` type which has a much higher precision with its operations. To use this new `Math.Fraction`, we have to call the `Math.Fraction()` constructor.

We have many ways to create a Fraction, for example:

```fsharp
open WebSharper.MathJS

//From string
let fraction1 = Math.Fraction("1/2")

//By giving the numerator and denominator
let fraction2 = Math.Fraction(1, 2)

//From float
let fraction3 = Math.Fraction(0.5)
```

After

`Client.fs` code:

```fsharp
namespace Fraction
 
open WebSharper
open WebSharper.JavaScript
open WebSharper.UI
open WebSharper.UI.Client
open WebSharper.UI.Templating
 
[<JavaScript>]
module Client =
    open WebSharper.MathJS
 
    type IndexTemplate = Template<"wwwroot/index.html", ClientLoad.FromDocument>
 
    [<SPAEntryPoint>]
    let Main () =
        let rvInput1 = Var.Create "0.1"
        let rvInput2 = Var.Create "0.2"
        
        let viewInput1 = rvInput1.View
        let viewInput2 = rvInput2.View
        
        let result parse operator = 
            View.Map2 (fun (l: string) (r: string) ->
                try
                    (operator (parse l) (parse r)).ToString()
                with _ ->
                    "Wrong input"
            ) viewInput1 viewInput2
            
        let resultFloatAdd = result System.Double.Parse (fun l r -> l + r)
        let resultFloatSubtract = result System.Double.Parse (fun l r -> l - r)
        let resultFloatMultiply = result System.Double.Parse (fun l r -> l * r)
        let resultFloatDivide = result System.Double.Parse (fun l r -> l / r)
        
        let resultFractionAdd = result Math.Fraction (fun l r -> Math.Add(l, r)) 
        let resultFractionSubtract = result Math.Fraction (fun l r -> Math.Subtract(l, r))
        let resultFractionMultiply = result Math.Fraction (fun l r -> Math.Multiply(l, r))
        let resultFractionDivide = result Math.Fraction (fun l r -> Math.Divide(l ,r))
 
        IndexTemplate.Main()
            .Input1(rvInput1)
            .Input2(rvInput2)
            .ResultFloatAdd(resultFloatAdd)
            .ResultFloatSubtract(resultFloatSubtract)
            .ResultFloatMultiply(resultFloatMultiply)
            .ResultFloatDivide(resultFloatDivide)
            .ResultFractionAdd(resultFractionAdd)
            .ResultFractionSubtract(resultFractionSubtract)
            .ResultFractionMultiply(resultFractionMultiply)
            .ResultFractionDivide(resultFractionDivide)
            .Doc()
        |> Doc.RunById "main"
```

`index.html` code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Fraction</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.indigo-pink.min.css">
    <script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script>
    <style>
        /* Don't show the not-yet-loaded templates */
        [ws-template], [ws-children-template] {
            display: none;
        }
        .panel {
            margin: 20px;
            padding: 20px;
            box-shadow: 2px 2px 5px 2px #eee;
        }
 
        .result {
            width: auto;
        }
    </style>
    <script type="text/javascript" src="Scripts/Fraction.head.js"></script>
</head>
<body>
    <div id="main" class="panel" ws-children-template="Main">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input class="mdl-textfield__input" type="text" id="input1" ws-var="Input1" value="0.1" />
            <label class="mdl-textfield__label" for="input1">First number</label>
        </div><br />
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input class="mdl-textfield__input" type="text" id="input2" ws-var="Input2" value="0.2" />
            <label class="mdl-textfield__label" for="input2">Second number</label>
        </div>
        <table class="mdl-data-table mdl-table-js-data-table">
            <thead>
                <tr>
                    <th class="mdl-data-table__cell--non-numeric">Operation</th>
                    <th>Float result</th>
                    <th>Fraction result</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="mdl-data-table__cell--non-numeric">Addition</td>
                    <td><p ws-replace="ResultFloatAdd"></p></td>
                    <td><p ws-replace="ResultFractionAdd"></p></td>
                </tr>
                <tr>
                    <td class="mdl-data-table__cell--non-numeric">Subtraction</td>
                    <td><p ws-replace="ResultFloatSubtract"></p></td>
                    <td><p ws-replace="ResultFractionSubtract"></p></td>
                </tr>
                <tr>
                    <td class="mdl-data-table__cell--non-numeric">Multiplication</td>
                    <td><p ws-replace="ResultFloatMultiply"></p></td>
                    <td><p ws-replace="ResultFractionMultiply"></p></td>
                </tr>
                <tr>
                    <td class="mdl-data-table__cell--non-numeric">Divison</td>
                    <td><p ws-replace="ResultFloatDivide"></p></td>
                    <td><p ws-replace="ResultFractionDivide"></p></td>
                </tr>
            </tbody>
        </table>
    </div>
    <script type="module" src="Scripts/Fraction.min.js"></script>
</body>
</html>
```

---

### Vectors

For vector operations in WebSharper we have to use the `MathJS.Math` functions and in those functions we have to use the `MathNumber` wrapper for the vectors. There are few exceptions when we don't have to wrap these vectors. If the function only accepts vectors or matrices, then the wrapper isn't needed (but can be used). (Note that if you wrap these in `MathNumber`, you might get a `MathNumber` return value.)

```fsharp
open WebSharper.MathJS

let myVector = [| 1.; 2.; 3. |]

let addVector = Math.Add(MathNumber(myVector), MathNumber(myVector))
```

Full example:

`Client.fs` code:

```fsharp
namespace Vectors
 
open WebSharper
open WebSharper.JavaScript
open WebSharper.UI
open WebSharper.UI.Client
open WebSharper.UI.Templating
 
[<JavaScript>]
module Client =    
    open WebSharper.MathJS
    open WebSharper.MathJax
 
    type IndexTemplate = Template<"wwwroot/index.html", ClientLoad.FromDocument>
 
    [<SPAEntryPoint>]
    let Main () =
        let vector1 = [| 8.; 6.; 4.; 6. |]
        let vector2 = [| 6.; 14.; 8.; 2. |]
 
        let toPrettyVector (vector: float array) = 
            "$" + ((Math.Parse("[" + string vector + "]") |> As<Node>).ToTex()) + "$"
 
        let prettyVector1 = toPrettyVector vector1
        let prettyVector2 = toPrettyVector vector2
 
        let result op = "[" + string (op vector1 vector2) + "]"
 
        let resultAdd = result (fun l r -> Math.Add(MathNumber(l), MathNumber(r)))
        let resultSubtract = result (fun l r -> Math.Subtract(MathNumber(l), MathNumber(r)))
        let resultMultiply = result (fun l r -> Math.Multiply(MathNumber(l), MathNumber(r)))
 
        let toPrettyResult (result: string) =
            "$" + ((Math.Parse(string result) |> As<Node>).ToTex()) + "$"
 
        let prettyResultAdd = toPrettyResult resultAdd
        let prettyResultSubtract = toPrettyResult resultSubtract
        let prettyResultMultiply = toPrettyResult resultMultiply        
 
        IndexTemplate.Main()
            .Vector1(prettyVector1)
            .Vector2(prettyVector2)
            .ResultAdd(prettyResultAdd)
            .ResultSubtract(prettyResultSubtract)
            .ResultMultiply(prettyResultMultiply)
            .PageInit(fun () -> 
                MathJax.Typeset()
            )
            .Doc()
        |> Doc.RunById "main"
```

`index.html` code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Vectors</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.indigo-pink.min.css">
    <script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script>
    <style>
        /* Don't show the not-yet-loaded templates */
        [ws-template], [ws-children-template] {
            display: none;
        }
 
        .panel {
            margin: 20px;
            padding: 20px;
            box-shadow: 2px 2px 5px 2px #eee;
        }
 
        .result {
            width: auto;
        }
 
        p {
            margin: 5px;
        }
 
        .holder {
            display: flex;
        }
    </style>
    <script>
        MathJax = {
            loader: {
                load: ['input/tex', 'output/chtml']
            },
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']]
            }
        };
    </script>
    <script type="text/javascript" src="Scripts/Vectors.head.js"></script>
</head>
<body>
    <div id="main" class="panel" ws-children-template="Main">
        <div ws-onafterrender="PageInit">
            <div class="holder">
                <div>
                    First vector: <p ws-replace="Vector1"></p>
                </div>
                <div>
                    Second vector: <p ws-replace="Vector2"></p>
                </div>
            </div>
            <table class="mdl-data-table mdl-table-js-data-table">
                <thead>
                    <tr>
                        <th class="mdl-data-table__cell--non-numeric">Operation</th>
                        <th>Result</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="mdl-data-table__cell--non-numeric">Addition</td>
                        <td><p ws-replace="ResultAdd"></p></td>
                    </tr>
                    <tr>
                        <td class="mdl-data-table__cell--non-numeric">Subtraction</td>
                        <td><p ws-replace="ResultSubtract"></p></td>
                    </tr>
                    <tr>
                        <td class="mdl-data-table__cell--non-numeric">Multiplication</td>
                        <td><p ws-replace="ResultMultiply"></p></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <script type="module" src="Scripts/Vectors.min.js"></script>
</body>
</html>
```

---

### Matrices

The same as for vectors, WebSharper grants a huge variety of Matrix operations and functions, but to use those, we need to wrap the matrices in MathNumber. As we have seen at the vectors, there are some functions where matrices can be used without the `MathNumber` wrapper. (Note that if you wrap these in `MathNumber`, you might get a `MathNumber` return value.)

```fsharp
open WebSharper.MathJS

let myMatrix = [| [| 1.; 2. |]; [| 3.; 4. |] |]

let addMatrix = Math.Add(MathNumber(myMatrix), MathNumber(myMatrix))
```

Full example:

`Client.fs` code:

```fsharp
namespace Matrices
 
open WebSharper
open WebSharper.JavaScript
open WebSharper.UI
open WebSharper.UI.Client
open WebSharper.UI.Templating
 
[<JavaScript>]
module Client =
    open WebSharper.MathJax
    open WebSharper.MathJS
 
    type IndexTemplate = Template<"wwwroot/index.html", ClientLoad.FromDocument>
 
    [<SPAEntryPoint>]
    let Main () =
        let matrix1 = Math.Matrix([| [| 8.; 6. |]; [| 4.; 6. |] |])
        let matrix2 = Math.Matrix([| [| 6.; 14. |]; [| 8.; 2. |] |])
 
        let toPrettyMatrix (matrix: float array array) =
            "$" + ((Math.Parse(string matrix) |> As<Node>).ToTex()) + "$"
 
        let prettyMatrix1 = toPrettyMatrix matrix1
        let prettyMatrix2 = toPrettyMatrix matrix2
 
        let result op = (op matrix1 matrix2)
 
        let resultAdd = result (fun l r -> Math.Add(MathNumber(l), MathNumber(r)))
        let resultSubtract = result (fun l r -> Math.Subtract(MathNumber(l), MathNumber(r)))
        let resultMultiply = result (fun l r -> Math.Multiply(MathNumber(l), MathNumber(r)))
        let resultDivide = result (fun l r -> Math.Divide(MathNumber(l), MathNumber(r)))
 
        let toPrettyResult (resultMatrix: MathNumber) =
            "$" + ((Math.Parse(string resultMatrix) |> As<Node>).ToTex()) + "$"
 
        let prettyResultAdd = toPrettyResult resultAdd
        let prettyResultSubtract = toPrettyResult resultSubtract
        let prettyResultMultiply = toPrettyResult resultMultiply
        let prettyResultDivide = toPrettyResult resultDivide
 
        IndexTemplate.Main()
            .Matrix1(prettyMatrix1)
            .Matrix2(prettyMatrix2)
            .ResultAdd(prettyResultAdd)
            .ResultSubtract(prettyResultSubtract)
            .ResultMultiply(prettyResultMultiply)
            .ResultDivide(prettyResultDivide)
            .PageInit(fun () -> 
                MathJax.Typeset()
            )
            .Doc()
        |> Doc.RunById "main"
```

`index.html` code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Matrices</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.indigo-pink.min.css">
    <script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script>
    <style>
        /* Don't show the not-yet-loaded templates */
        [ws-template], [ws-children-template] {
            display: none;
        }
 
        .panel {
            margin: 20px;
            padding: 20px;
            box-shadow: 2px 2px 5px 2px #eee;
        }
 
        .result {
            width: auto;
        }
 
        p {
            margin: 5px;
        }
 
        .holder {
            display: flex;
        }
    </style>
    <script>
        MathJax = {
            loader: {
                load: ['input/tex', 'output/chtml']
            },
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']]
            }
        };
    </script>
    <script type="text/javascript" src="Scripts/Matrices.head.js"></script>
</head>
<body>
    <div id="main" class="panel" ws-children-template="Main">
        <div ws-onafterrender="PageInit">
            <div class="holder">
                <div>
                    First matrix: <p ws-replace="Matrix1"></p>
                </div>
                <div>
                    Second matrix: <p ws-replace="Matrix2"></p>
                </div>
            </div>
            <table class="mdl-data-table mdl-table-js-data-table">
                <thead>
                    <tr>
                        <th class="mdl-data-table__cell--non-numeric">Operation</th>
                        <th>Result</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="mdl-data-table__cell--non-numeric">Addition</td>
                        <td><p ws-replace="ResultAdd"></p></td>
                    </tr>
                    <tr>
                        <td class="mdl-data-table__cell--non-numeric">Subtraction</td>
                        <td><p ws-replace="ResultSubtract"></p></td>
                    </tr>
                    <tr>
                        <td class="mdl-data-table__cell--non-numeric">Multiplication</td>
                        <td><p ws-replace="ResultMultiply"></p></td>
                    </tr>
                    <tr>
                        <td class="mdl-data-table__cell--non-numeric">Divison</td>
                        <td><p ws-replace="ResultDivide"></p></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <script type="module" src="Scripts/Matrices.min.js"></script>
</body>
</html>
```

---

### Units

WebSharper allows you to calculate with units too. Most of the functions from Math accept `Math.Unit`s to work with. Units are a special kind of types. They have a value and a measurement. Values with different kind of measurements can be used in operations and it will calulate with the given measurements. Units can be freed from their measurements (for example) by dividing.

```fsharp
open WebSharper.MathJS

//With a value and a unit
let myUnit = Math.Unit(5, "cm")

//Or simply by a string
let myUnitFromString = Math.Unit("5 cm")
```

Full example:

`Client.fs` code:

```fsharp
namespace Units
 
open WebSharper
open WebSharper.JavaScript
open WebSharper.UI
open WebSharper.UI.Client
open WebSharper.UI.Templating
 
[<JavaScript>]
module Client =
    open WebSharper.MathJS
 
    type IndexTemplate = Template<"wwwroot/index.html", ClientLoad.FromDocument>
 
    [<SPAEntryPoint>]
    let Main () =
        let rvInput1 = Var.Create "1 cm"
        let rvInput2 = Var.Create "1 cm"
        let rvTranslate = Var.Create "m"
        
        let viewInput1 = rvInput1.View
        let viewInput2 = rvInput2.View
        let viewTranslate = rvTranslate.View
        
        let result operator = 
            View.Map2 (fun (l: string) (r: string) ->
                try
                    (operator (Math.Unit l) (Math.Unit r)).ToString()
                with _ ->
                    "Wrong input"
            ) viewInput1 viewInput2
            
        let resultAdd = result (fun l r -> Math.Add(l, r))
        let resultSubtract = result (fun l r -> Math.Subtract(l, r))
        let resultMultiply = result (fun l r -> Math.Multiply(l, r))
        let resultDivide = result (fun l r -> Math.Divide(l, r))
        
        let translate unit trans = 
            View.Map2 (fun (u: string) (t: string) ->
                try
                    (Math.To(Math.Unit(u), Math.Unit(t))).ToString()
                with _ ->
                    "Couldn't translate."
            ) unit trans
            
        let translateResultAdd = translate resultAdd viewTranslate    
        let translateResultSubtract = translate resultSubtract viewTranslate    
        let translateResultMultiply = translate resultMultiply viewTranslate    
        let translateResultDivide = translate resultDivide viewTranslate
        
        IndexTemplate.Main()
            .Input1(rvInput1)
            .Input2(rvInput2)
            .Translate(rvTranslate)
            .ResultAdd(resultAdd)
            .ResultSubtract(resultSubtract)
            .ResultMultiply(resultMultiply)
            .ResultDivide(resultDivide)
            .TranslatedResultAdd(translateResultAdd)
            .TranslatedResultSubtract(translateResultSubtract)
            .TranslatedResultMultiply(translateResultMultiply)
            .TranslatedResultDivide(translateResultDivide)
            .Doc()
        |> Doc.RunById "main"
```

`index.html` code:

```html 
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Units</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.indigo-pink.min.css">
    <script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script>
    <style>
        /* Don't show the not-yet-loaded templates */
        [ws-template], [ws-children-template] {
            display: none;
        }
        .panel {
            margin: 20px;
            padding: 20px;
            box-shadow: 2px 2px 5px 2px #eee;
        }
 
        .result {
            width: auto;
        }
    </style>
    <script type="text/javascript" src="Scripts/Units.head.js"></script>
</head>
<body>
    <div id="main" class="panel" ws-children-template="Main">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input class="mdl-textfield__input" type="text" id="input1" ws-var="Input1" value="1 cm" />
            <label class="mdl-textfield__label" for="input1">First number</label>
        </div><br />
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input class="mdl-textfield__input" type="text" id="input2" ws-var="Input2" value="1 cm" />
            <label class="mdl-textfield__label" for="input2">Second number</label>
        </div>
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input class="mdl-textfield__input" type="text" id="translate" ws-var="Translate" value="m" />
            <label class="mdl-textfield__label" for="translate">Translate to</label>
        </div>
        <table class="mdl-data-table mdl-table-js-data-table">
            <thead>
                <tr>
                    <th class="mdl-data-table__cell--non-numeric">Operation</th>
                    <th>Result</th>
                    <th>Translated</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="mdl-data-table__cell--non-numeric">Addition</td>
                    <td><p ws-replace="ResultAdd"></p></td>
                    <td><p ws-replace="TranslatedResultAdd"></p></td>
                </tr>
                <tr>
                    <td class="mdl-data-table__cell--non-numeric">Subtraction</td>
                    <td><p ws-replace="ResultSubtract"></p></td>
                    <td><p ws-replace="TranslatedResultSubtract"></p></td>
                </tr>
                <tr>
                    <td class="mdl-data-table__cell--non-numeric">Multiplication</td>
                    <td><p ws-replace="ResultMultiply"></p></td>
                    <td><p ws-replace="TranslatedResultMultiply"></p></td>
                </tr>
                <tr>
                    <td class="mdl-data-table__cell--non-numeric">Divison</td>
                    <td><p ws-replace="ResultDivide"></p></td>
                    <td><p ws-replace="TranslatedResultDivide"></p></td>
                </tr>
            </tbody>
        </table>
    </div>
    <script type="module" src="Scripts/Units.min.js"></script>
</body>
</html>
```

---

## Rendering math with WebSharper

Rendering math expressions in WebSharper works with the [MathJax](https://www.mathjax.org/) JavaScript library. The documentation for MathJax extension can be found [here](https://github.com/dotnet-websharper/mathjax/blob/master/README.md).

MathJax, so WebSharper too allows you to use a variety of common math formatting systems but not only that, it supports more than one output formatting systems.

### Supported input formats

| Format    | Loader Module       |
|-----------|---------------------|
| TeX       | `"input/tex"`       |
| MathML    | `"input/mml"`       |
| AsciiMath | `"input/asciimath"` |

### Supported output formats

| Format      | Output Module          |
|-------------|------------------------| 
| CHTML       | `"output/chtml"`       |
| SVG         | `"output/svg"`         |

### Rendering expresions

To render static expressions (it's part of the static html file or generated with WebSharper to the html file at the beginning), you only need to configure MathJax correctly. It will automatically typeset matching math content once the page loads ([see an example here](https://github.com/dotnet-websharper/mathjax/blob/master/README.md)).

To render dynamically changing formulas, update the DOM with the new expression and call `MathJax.Typeset()` — this replaces the old `MathJax.Hub.Queue()` method used in version 2.

#### TeX

To render TeX expressions, ensure the loader module `input/tex` is included in your MathJax configuration. This allows MathJax to correctly parse TeX input.
([TeX documentation](https://en.wikibooks.org/wiki/TeX/def))

Full example:

`Client.fs` code:

```fsharp
namespace TeX
 
open WebSharper
open WebSharper.JavaScript
open WebSharper.UI
open WebSharper.UI.Client
open WebSharper.UI.Templating
 
[<JavaScript>]
module Client =
    open WebSharper.MathJax
 
    type IndexTemplate = Template<"wwwroot/index.html", ClientLoad.FromDocument>
 
    [<SPAEntryPoint>]
    let Main () =
 
        let rvExpression = Var.Create @"\frac{2\cdot x\cdot\left({ x}^{9}+{ x}^{2}\right)-{ x}^{2}\cdot\left(9\cdot{ x}^{8}+2\cdot x\right)}{{\left({ x}^{9}+{ x}^{2}\right)}^{2}}+2\cdot{ x}^{3}"
 
        rvExpression.View
        |> View.Sink (fun expr ->
            let output = JS.Document.GetElementById("tex")
            output.InnerHTML <- "$$" + expr + "$$"
            MathJax.Typeset()
        )
 
        IndexTemplate.Main()
            .Expression(rvExpression)
            .Doc()
        |> Doc.RunById "main"
```

`index.html` code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>TeX</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.indigo-pink.min.css">
    <script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script>
    <style>
        /* Don't show the not-yet-loaded templates */
        [ws-template], [ws-children-template] {
            display: none;
        }
 
        .panel {
            margin: 20px;
            padding: 20px;
            box-shadow: 2px 2px 5px 2px #eee;
        }
 
        .result {
            width: auto;
        }
 
        .mdl-textfield {
            width: 100%;
        }
    </style>
    <script>
        MathJax = {
            loader: {
                load: ['input/tex', 'output/chtml']
            },
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']]
            }
        };
    </script>
    <script type="text/javascript" src="Scripts/TeX.head.js"></script>
</head>
<body>
    <div id="main" class="panel" ws-children-template="Main">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input class="mdl-textfield__input" type="text" id="expression" ws-var="Expression" value="\frac{2\cdot x\cdot\left({ x}^{9}+{ x}^{2}\right)-{ x}^{2}\cdot\left(9\cdot{ x}^{8}+2\cdot x\right)}{{\left({ x}^{9}+{ x}^{2}\right)}^{2}}+2\cdot{ x}^{3}" />
            <label class="mdl-textfield__label" for="expression">TeX Expression</label>
        </div>
    </div>
    <div id="tex" class="panel result"></div>
    <script type="module" src="Scripts/TeX.min.js"></script>
</body>
</html>
```

#### MathML

To render MathML expressions, include the loader module `input/mml` in your MathJax configuration. This tells MathJax to treat embedded MathML correctly.
([MathML documentation](https://www.w3.org/TR/MathML/))

Full example:

`Client.fs` code:

```fsharp
namespace MathML
 
open WebSharper
open WebSharper.JavaScript
open WebSharper.UI
open WebSharper.UI.Html
open WebSharper.UI.Client
open WebSharper.UI.Templating
 
[<JavaScript>]
module Client =
    open WebSharper.MathJax
 
    type IndexTemplate = Template<"wwwroot/index.html", ClientLoad.FromDocument>
 
    [<SPAEntryPoint>]
    let Main () =
        let text = 
            @"
            <math>
                <mstyle>
                    <mi>f</mi>
                    <mrow>
                      <mo>(</mo>
                      <mi>a</mi>
                      <mo>)</mo>
                    </mrow>
                    <mo>=</mo>
                    <mfrac>
                      <mn>1</mn>
                      <mrow>
                        <mn>2</mn>
                        <mi>π</mi>
                        <mi>i</mi>
                      </mrow>
                    </mfrac>
                    <msub>
                      <mo>∮</mo>
                      <mrow>
                        <mi>γ</mi>
                      </mrow>
                    </msub>
                    <mfrac>
                      <mrow>
                        <mi>f</mi>
                        <mo>(</mo>
                        <mi>z</mi>
                        <mo>)</mo>
                      </mrow>
                      <mrow>
                        <mi>z</mi>
                        <mo>−</mo>
                        <mi>a</mi>
                      </mrow>
                    </mfrac>
                    <mi>d</mi>
                    <mi>z</mi>
                </mstyle>
            </math>"
 
        let rvExpression = Var.Create text
 
        rvExpression.View
        |> View.Sink (fun newHtml ->
            let el = JS.Document.GetElementById("tex")
            el.InnerHTML <- newHtml
            MathJax.Typeset()
        )
 
        IndexTemplate.Main()
            .Expression(rvExpression)
            .Doc()
        |> Doc.RunById "main"
```

`index.html` code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>MathML</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.indigo-pink.min.css">
    <script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script>
    <style>
        /* Don't show the not-yet-loaded templates */
        [ws-template], [ws-children-template] {
            display: none;
        }
 
        .panel {
            margin: 20px;
            padding: 20px;
            box-shadow: 2px 2px 5px 2px #eee;
        }
 
        .result {
            width: auto;
            text-align: center;
        }
 
        .mdl-textfield {
            width: 100%;
        }
    </style>
    <script>
        MathJax = {
            loader: {
                load: ['input/mml', 'output/chtml']
            }
        };
    </script>
    <script type="text/javascript" src="Scripts/MathML.head.js"></script>
</head>
<body>
    <div id="main" class="panel" ws-children-template="Main">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <textarea class="mdl-textfield__input" type="text" rows="10" id="expression" ws-var="Expression"> </textarea>
            <label class="mdl-textfield__label" for="expression">MathML Expression</label>
        </div>
    </div>
    <div id="tex" class="panel result"></div>
    <script type="module" src="Scripts/MathML.min.js"></script>
</body>
</html>
```

#### Ascii Math

To render AsciiMath expressions, include the loader module `input/asciimath` in your MathJax configuration. This ensures that MathJax correctly parses AsciiMath notation.
([AsciiMath documentation](http://asciimath.org/))

Full example:

`Client.fs` code:

```fsharp
namespace AsciiMath
 
open WebSharper
open WebSharper.JavaScript
open WebSharper.UI
open WebSharper.UI.Client
open WebSharper.UI.Templating
 
[<JavaScript>]
module Client =
    open WebSharper.MathJax
 
    type IndexTemplate = Template<"wwwroot/index.html", ClientLoad.FromDocument>
 
    [<SPAEntryPoint>]
    let Main () =
        let rvExpression = Var.Create @"sum_(i=1)^n i^3=((n(n+1))/2)^2"
        
        rvExpression.View
        |> View.Sink (fun ascii ->
            let el = JS.Document.GetElementById("tex")
            el.InnerHTML <- "`" + ascii + "`"
            MathJax.Typeset()
        )
 
        IndexTemplate.Main()
            .Expression(rvExpression)
            .Doc()
        |> Doc.RunById "main"
```

`index.html` code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>AsciiMath</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.indigo-pink.min.css">
    <script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script>
    <style>
        /* Don't show the not-yet-loaded templates */
        [ws-template], [ws-children-template] {
            display: none;
        }
 
        .panel {
            margin: 20px;
            padding: 20px;
            box-shadow: 2px 2px 5px 2px #eee;
        }
 
        .result {
            width: auto;
            text-align: center;
        }
 
        .mdl-textfield {
            width: 100%;
        }
    </style>
    <script>
        MathJax = {
            loader: {
                load: ['input/asciimath', 'output/chtml']
            },
            asciimath: {
                delimiters: [['`', '`']]
            }
        };
    </script>
    <script type="text/javascript" src="Scripts/AsciiMath.head.js"></script>
</head>
<body>
    <div id="main" class="panel" ws-children-template="Main">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input class="mdl-textfield__input" type="text" id="expression" ws-var="Expression" value="\frac{2\cdot x\cdot\left({ x}^{9}+{ x}^{2}\right)-{ x}^{2}\cdot\left(9\cdot{ x}^{8}+2\cdot x\right)}{{\left({ x}^{9}+{ x}^{2}\right)}^{2}}+2\cdot{ x}^{3}" />
            <label class="mdl-textfield__label" for="expression">ASCII Math Expression</label>
        </div>
    </div>
    <div id="tex" class="panel result"></div>
    <script type="module" src="Scripts/AsciiMath.min.js"></script>
</body>
</html>
```

### An example for expressions

There are many functions in [MathJS](https://github.com/intellifactory/websharper.mathjs/blob/master/doc/doc.md) that calculates an expression, solves a problem. In this example we'll use the `Math.Derivative` function to get a `Node` with the result in it. A `Node` then can be converted to a `String`, but with the [MathJax extension](https://github.com/dotnet-websharper/mathjax/blob/master/README.md) we can render the result if the formula is in `TeX` format. To do that we have to set up `MathJax` to parse and render `TeX` formulas then by using the `Node`'s `ToTex()` function we convert the result into a `String` with the formula in `TeX` formatting.

(Most of the functions don't result a `Node`, but they can be converted to `Node` by `Math.Parse()` or by other means. ([MathJax documentation](https://www.mathjax.org/)))

Full example:

`Client.fs` code:

```fsharp
namespace Expressions
 
open WebSharper
open WebSharper.JavaScript
open WebSharper.UI
open WebSharper.UI.Html
open WebSharper.UI.Client
open WebSharper.UI.Templating
 
[<JavaScript>]
module Client =
    open WebSharper.MathJax
    open WebSharper.MathJS
 
    type IndexTemplate = Template<"wwwroot/index.html", ClientLoad.FromDocument>
 
    [<SPAEntryPoint>]
    let Main () =
 
        let rvFormula = Var.Create "x^2/(x^9 + x^2) + x^4/2"
        let rvDerivateBy = Var.Create "x"
 
        let viewFormula = rvFormula.View
        let viewDerivateBy = rvDerivateBy.View
 
        let texFormula = 
            View.Map2 (fun (formula : string) (derivateby : string) ->
                try
                    let simplify = DerivativeOption(Simplify=true)
                    (Math.Derivative(formula, derivateby, simplify)).ToTex()
                with _ ->
                    "The\ formula\ isn\'t\ correct."
            ) viewFormula viewDerivateBy
 
        texFormula
        |> View.Sink (fun tex -> 
            let el = JS.Document.GetElementById("tex")
            el.InnerHTML <- "$$" + tex + "$$"
            MathJax.Typeset()
        )
 
        IndexTemplate.Main()
            .Formula(rvFormula)
            .DerivateBy(rvDerivateBy)
            .Doc()
        |> Doc.RunById "main"
```

`index.html` code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Expressions</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.indigo-pink.min.css">
    <script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script>
    <style>
        /* Don't show the not-yet-loaded templates */
        [ws-template], [ws-children-template] {
            display: none;
        }
 
        .panel {
            margin: 20px;
            padding: 20px;
            box-shadow: 2px 2px 5px 2px #eee;
            width: 300px;
        }
 
        .result {
            width: auto;
        }
    </style>
    <script>
        MathJax = {
            loader: {
                load: ['input/tex', 'output/chtml']
            },
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']]
            }
        };
    </script>
    <script type="text/javascript" src="Scripts/Expressions.head.js"></script>
</head>
<body>
    <div id="main" class="panel" ws-children-template="Main">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input class="mdl-textfield__input" type="text" id="formula" ws-var="Formula" value="x^2/(x^9 + x^2) + x^4/2" />
            <label class="mdl-textfield__label" for="formula">Formula</label>
        </div><br />
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input class="mdl-textfield__input" type="text" id="derivateBy" ws-var="DerivateBy" value="x" />
            <label class="mdl-textfield__label" for="derivateBy">Derivate by</label>
        </div>
    </div>
    <div id="tex" class="panel result"></div>
    <script type="module" src="Scripts/Expressions.min.js"></script>
</body>
</html>
 
```
