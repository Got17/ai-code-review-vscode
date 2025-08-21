---
title: UI Samples
---

## Reactive variables

Reactive variables (`Var`) are the core of WebSharper.UI's reactivity. They hold values that can be observed and updated, triggering automatic UI refreshes.

Here's a basic example with a name input and counter:

F# code
```fsharp
namespace Vars
 
open WebSharper
open WebSharper.JavaScript
open WebSharper.UI
open WebSharper.UI.Client
open WebSharper.UI.Html
 
[<JavaScript>]
module Client =
    [<SPAEntryPoint>]
    let Main () =
 
        // Create a reactive variable for the name
        let nameVar = Var.Create "Guest"
        
        // Create a reactive variable for the counter
        let countVar = Var.Create 0
        
        // Create a reactive view that combines name and count
        let greetingView = 
            View.Map2 (fun name count -> 
                sprintf "Hello, %s! Current count is %d." name count)
                nameVar.View
                countVar.View
 
        // UI components
        div [] [
            // Name input with two-way binding
            div [] [
                text "Enter your name: "
                Doc.InputType.Text [] nameVar
                // Display the current name
                div [] [
                    text "Current name: "
                    Doc.TextView nameVar.View
                ]
            ]
            
            // Counter controls
            div [] [
                button [
                    on.click (fun _ _ -> countVar.Value <- countVar.Value + 1)
                ] [text "Increment"]
                button [
                    on.click (fun _ _ -> countVar.Value <- countVar.Value - 1)
                ] [text "Decrement"]
                // Display the current count
                div [] [
                    text "Current count: "
                    Doc.TextView (countVar.View.Map string)
                ]
            ]
            
            // Display the combined greeting
            div [] [
                h3 [] [text "Greeting:"]
                Doc.TextView greetingView
            ]
        ]
        |> Doc.RunById "main"
```

`index.html` code
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Vars</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script type="text/javascript" src="Scripts/Vars.head.js"></script>
</head>
<body>
    <div id="main"></div>
    <script type="module" src="Scripts/Vars.min.js"></script>
</body>
</html>
 
```

This sample demonstrates:

* Creating Vars for state.
* Composing views with View.Map2.
* Two-way binding via events and Doc.TextView for reactive display.

## Shorthand Views with `.V`

The `.V` property is a short for "value", but the real magic happens when you use it inside a function that supports it like `text` or the `V` helper function.
It allows you to create reactive expressions that automatically update when the underlying data changes.

F# code
```fsharp
namespace VShorthand
 
open WebSharper
open WebSharper.JavaScript
open WebSharper.UI
open WebSharper.UI.Client
open WebSharper.UI.Html
 
[<JavaScript>]
module Client =
 
    // Define application state
    type State = 
        {
            Name: string
            Count: int
        }
    
    [<SPAEntryPoint>]
    let Main () =
 
        // Create a reactive variable for the application state
        let state = Var.Create { Name = "Guest"; Count = 0 }
                
        // Create a reactive view that combines name and count
        let greetingView = 
            V $"Hello, {state.V.Name}! Current count is {state.V.Count}."
 
        // UI components
        div [] [
            // Name input with two-way binding
            div [] [
                text $"Enter your name: "
                Doc.InputType.TextV [] state.V.Name
                // Display the current name
                div [] [
                    text $"Current name: {state.V.Name}"
                ]
            ]
            
            // Counter controls
            div [] [
                button [
                    on.click (fun _ _ -> state.Update(fun st -> { st with Count = st.Count + 1 }))
                ] [text "Increment"]
                button [
                    on.click (fun _ _ -> state.Update(fun st -> { st with Count = st.Count - 1 }))
                ] [text "Decrement"]
                // Display the current count
                div [] [
                    text $"Current count: {state.V.Count}"
                ]
            ]
            
            // Display the combined greeting
            div [] [
                h3 [] [text "Greeting:"]
                Doc.TextView greetingView
            ]
        ]
        |> Doc.RunById "main"
```

This is equivalent to the `Var` sample but with a cleaner approach for combining and displaying values.

This sample demonstrates:

* Combining the application state into a single variable.
* Automatic mapping and lensing of Vars.
* Using `.Update` to ensure updates are applied correctly on increase/decrease.

## HTML templates

WebSharper.UI templating allows separating UI structure (HTML) from logic (F#), using attributes like `ws-template`, `ws-var`, and `ws-onclick` (or other events) for bindings.

F# code
```fsharp
namespace Templating
 
open WebSharper
open WebSharper.JavaScript
open WebSharper.UI
open WebSharper.UI.Client
open WebSharper.UI.Templating
 
[<JavaScript>]
module Client =
    type IndexTemplate = Template<"wwwroot/index.html", ClientLoad.FromDocument>
 
    [<SPAEntryPoint>]
    let Main () =
        // Create a reactive variable for the name
        let nameVar = Var.Create "Guest"
        
        // Create a reactive variable for the counter
        let countVar = Var.Create 0
 
        // Create a list model, keyed by an index
        let myList = ListModel.Create fst []
 
        // Create a mutable index for uniquely tracking items
        let itemIndex = ref 0
 
        // Setting up the view through the template
        IndexTemplate.MainTemplate()
            .Name(nameVar)
            .Count(string countVar.V)
            .Increment(fun _ -> countVar.Value <- countVar.Value + 1)
            .Decrement(fun _ -> countVar.Value <- countVar.Value - 1)
            .Greeting($"Hello, {nameVar.V}! Current count is {countVar.V}.")
            .AddItem(fun e ->
                // We don't need to define a Var for the new item name input,
                // the template will create one for us if we don't provide it.
                myList.Add(itemIndex.Value, e.Vars.NewItem.Value)
                itemIndex.Value <- itemIndex.Value + 1
                e.Vars.NewItem.Value <- ""
            )
            .Items(
                myList.View.DocSeqCached(fun (index: int, item: string) ->
                    IndexTemplate.ItemTemplate()
                        .ItemName(item)
                        .RemoveItem(fun _ ->
                            myList.RemoveByKey(index)
                        )
                        .Doc()
                )
            )
            .Doc()
        |> Doc.RunById "main"
```

`index.html` code
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Templating</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" type="text/css" href="Scripts/Templating.css" />
    <style>
        /* Don't show the not-yet-loaded templates */
        [ws-template], [ws-children-template] { display: none; }
    </style>
    <script type="text/javascript" src="Scripts/Templating.head.js"></script>
</head>
<body>
    <!-- Main template container -->
    <div ws-template="MainTemplate">
        <h1>WebSharper UI Templating Demo</h1>
 
        <!-- Input section with two-way binding -->
        <div>
            <label>Name: <input ws-var="Name" type="text" placeholder="Enter your name"></label>
            <p>Current name: ${Name}</p>
        </div>
 
        <!-- Counter section with event handlers -->
        <div>
            <button ws-onclick="Increment">Increment</button>
            <button ws-onclick="Decrement">Decrement</button>
            <p>Count: ${Count}</p>
        </div>
 
        <!-- Greeting section with reactive content -->
        <div>
            <h3>Greeting</h3>
            <p>${Greeting}</p>
        </div>
 
        <!-- Repeating template for a list -->
        <div ws-template="ItemTemplate">
            <div class="item">
                <span>${ItemName}</span>
                <button ws-onclick="RemoveItem">Remove</button>
            </div>
        </div>
 
        <!-- List section with dynamic items -->
        <div>
            <h3>Dynamic List</h3>
            <input type="text" ws-var="NewItem" placeholder="Add new item">
            <button ws-onclick="AddItem">Add Item</button>
            <div ws-replace="Items"></div>
        </div>
    </div>
 
    <!-- Container for the WebSharper application -->
    <div id="main"></div>
    <script type="module" src="Scripts/Templating.min.js"></script>
</body>
</html>
```

Templates make UI declarative and easier to design.
You get a clear separation of concerns and the correctness is still fully ensured by the type system.

This sample demonstrates:

* Using `ws-template` to define a reusable HTML structure.
* Binding data to HTML inputs with `ws-var`, displaying text via the `${Hole}` syntax.
* Handling events like clicks with `ws-onclick`.
* Creating and using a `ListModel` for dynamic lists.

## Client-side routing

Routing adds navigation to create a full SPA. WebSharper.UI's `Router` handles URL changes reactively.

F# code
```fsharp
namespace Routing
 
open WebSharper
open WebSharper.JavaScript
open WebSharper.UI
open WebSharper.UI.Client
open WebSharper.UI.Html
open WebSharper.Sitelets
 
[<JavaScript>]
module Client =
    // Define the possible routes
    type EndPoint =
        | [<EndPoint "">] Home
        | [<EndPoint "about">] About
        | [<EndPoint "contact">] Contact
        | [<EndPoint "notfound">] NotFound
 
    // Main UI component
    let Render (router: Router<EndPoint>) (currentRoute: Var<EndPoint>) =
        // Navigation bar
        let navBar =
            div [attr.``class`` "navbar"] [
                a [attr.href (router.HashLink Home)] [text "Home"]
                a [attr.href (router.HashLink About)] [text "About"]
                a [attr.href (router.HashLink Contact)] [text "Contact"]
            ]
 
        // Page content based on current route
        let pageContent =
            currentRoute.View.Doc (fun route ->
                match route with
                | Home ->
                    div [] [
                        h2 [] [text "Welcome to the Home Page"]
                        p [] [text "This is the main page of our SPA."]
                    ]
                | About ->
                    div [] [
                        h2 [] [text "About Us"]
                        p [] [text "Learn more about our application."]
                        button [
                            on.click (fun _ _ -> currentRoute.Set Contact)
                        ] [text "Go to Contact"]
                    ]
                | Contact ->
                    div [] [
                        h2 [] [text "Contact Us"]
                        p [] [text "Get in touch with us!"]
                    ]
                | NotFound ->
                    div [] [
                        h2 [] [text "404 - Page Not Found"]
                        p [] [text "The page you requested does not exist."]
                    ]
            )
 
        // Combine navigation and content
        div [] [
            navBar
            pageContent
        ]
 
    [<SPAEntryPoint>]
    let Main () =
        let router = Router.Infer<EndPoint>()
 
        // Install the router, with a fallback if no route matches
        let currentRoute =
            router 
            |> Router.InstallHash NotFound
 
        Render router currentRoute
        |> Doc.RunById "main"
```

This example shows how to set up a simple router that handles navigation between different pages in your application.

This sample demonstrates:
* Defining a router with `Router.Infer` and an `EndPoint` type.
* Using `Router.InstallHash` to set up client-side routing.
* Handling URL changes and rendering different content based on the current route.