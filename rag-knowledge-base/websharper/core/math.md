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
open WebSharper.MathJS
Math.Add(MathNumber("5"), MathNumber(1.7), MathNumber(true))
```

Exception is when you use either only `floats`, `ints`, or `Math.Units`

```fsharp
open WebSharper.MathJS
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
open WebSharper.MathJS
open WebSharper.MathJax
 
[<JavaScript>]
module Client =
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
open WebSharper.MathJax
open WebSharper.MathJS
 
[<JavaScript>]
module Client =
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
open WebSharper.MathJS
 
[<JavaScript>]
module Client =
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
open WebSharper.MathJax
 
[<JavaScript>]
module Client =
    let rvExpression = Var.Create @"\frac{2\cdot x\cdot\left({ x}^{9}+{ x}^{2}\right)-{ x}^{2}\cdot\left(9\cdot{ x}^{8}+2\cdot x\right)}{{\left({ x}^{9}+{ x}^{2}\right)}^{2}}+2\cdot{ x}^{3}"

    rvExpression.View
    |> View.Sink (fun expr ->
        let output = JS.Document.GetElementById("tex")
        output.InnerHTML <- "$$" + expr + "$$"
        MathJax.Typeset()
    )
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
open WebSharper.MathJax

[<JavaScript>]
module Client =
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
open WebSharper.MathJax

[<JavaScript>]
module Client =
    let rvExpression = Var.Create @"sum_(i=1)^n i^3=((n(n+1))/2)^2"
    
    rvExpression.View
    |> View.Sink (fun ascii ->
        let el = JS.Document.GetElementById("tex")
        el.InnerHTML <- "`" + ascii + "`"
        MathJax.Typeset()
    )
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
open WebSharper.MathJax
open WebSharper.MathJS

[<JavaScript>]
module Client = 
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
```