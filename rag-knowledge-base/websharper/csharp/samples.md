---
title: UI Samples in C#
---

These samples demonstrate how to use WebSharper.UI to build reactive web applications in C#. You can compare them with the [F# equivalents](../ui/samples).

## Reactive variables

```csharp
using WebSharper;
using WebSharper.UI;
using WebSharper.UI.Client;
using static WebSharper.UI.Client.Html;

namespace CSharpVars
{
    [JavaScript]
    public class App
    {
        [SPAEntryPoint]
        public static void ClientMain()
        {
            // Create a reactive variable for the name
            var nameVar = Var.Create("Guest");

            // Create a reactive variable for the counter
            var countVar = Var.Create(0);

            // Create a reactive view that combines name and count
            var greetingView =
                nameVar.View.Map2(countVar.View, (name, count) =>
                    $"Hello, {name}! Current count is {count}."
                );

            // UI components
            div(
                // Name input with two-way binding
                div(
                    "Enter your name: ",
                    input(nameVar),
                    // Display the current name
                    div(
                        "Current name: ",
                        nameVar
                    )
                ),
            
                // Counter controls
                div(
                    button("Increment",
                        () => countVar.Value++),
                    button("Decrement",
                        () => countVar.Value--),
                    // Display the current count
                    div(
                        "Current count: ",
                        countVar
                    )
                ),

                // Display the combined greeting
                div(
                    h3("Greeting:"),
                    greetingView
                )
            ).RunById("main");
        }
    }
}
```

Differences from F#:

* `View.Map2` is available as an extension method instead of a static method.
* `Var`s and `View`s can be embedded as content directly in HTML combinators like `div`
* `button` has a simplified overload that accepts the text and action directly.

## Shorthand Views with `.V`

```csharp
using Microsoft.AspNetCore.Components.Forms;
using System.Collections;
using System.Diagnostics.Metrics;
using WebSharper;
using WebSharper.UI;
using WebSharper.UI.Client;
using static WebSharper.UI.Client.Html;

namespace CSharpVShorthand
{
    [JavaScript]
    public record State(string Name, int Count);

    [JavaScript]
    public class App
    {
        [SPAEntryPoint]
        public static void ClientMain()
        {
            // Create a reactive variable for the application state
            var state = Var.Create(new State("Guest", 0));

            // Create a reactive view that combines name and count
            var greetingView =
                V.V($"Hello, {state.V.Name}! Current count is {state.V.Count}.");

            // UI components
            div(
                // Name input with two-way binding
                div(
                    "Enter your name: ",
                    input(state.V.Name),
                    // Display the current name
                    div(
                        $"Current name: {state.V.Name}"
                    )
                ),

                // Counter controls
                div(
                    button("Increment",
                        () => state.Update(st => st with { Count = st.Count + 1 })
                    ),
                    button("Decrement",
                        () => state.Update(st => st with { Count = st.Count - 1 })
                    ),
                    // Display the current count
                    div(
                        $"Current count: {state.V.Count}"
                    )
                ),
            
                // Display the combined greeting
                div(
                    h3("Greeting:"),
                    greetingView
                )
            ).RunById("main");
        }
    }
}
```

* Lensing on C# records is supported, so `input(state.V.Name)` creates an `input` element with two-way immutable binding to the `Name` property of the `state` record.
* Instead of a `V` function, the `V.V` helper is used to create reactive expressions.

## HTML templates

C# code:
```csharp
using System;
using WebSharper;
using WebSharper.UI;
using WebSharper.UI.Client;
using static WebSharper.UI.Client.Html;

namespace CSharpTemplating
{
    [JavaScript]
    public class App
    {
        [SPAEntryPoint]
        public static void ClientMain()
        {
            // Create a reactive variable for the name
            var nameVar = Var.Create("Guest");

            // Create a reactive variable for the counter
            var countVar = Var.Create(0);

            // Create a list model, keyed by an index
            var myList = new ListModel<int, (int Index, string Item)>(i => i.Index);

            // Create an index for uniquely tracking items
            var itemIndex = 0;

            // Setting up the view through the template
            new Template.Index.MainTemplate()
                .Name(nameVar)
                .Count(countVar.View.Map(c => c.ToString()))
                .Increment(() => countVar.Value++)
                .Decrement(() => countVar.Value--)
                .Greeting(V.V($"Hello, {nameVar.V}! Current count is {countVar.V}."))
                .AddItem((e) =>
                    {
                        // We don't need to define a Var for the new item name input,
                        // the template will create one for us if we don't provide it.
                        myList.Add((itemIndex, e.Vars.NewItem.Value));
                        itemIndex++;
                        e.Vars.NewItem.Value = "";
                    }
                )
                .Items(
                    myList.View.DocSeqCached(i =>
                        new Template.Index.ItemTemplate()
                            .ItemName(i.Item)
                            .RemoveItem(() =>
                                myList.RemoveByKey(i.Index)
                            )
                            .Doc()
                    )
                )
                .Doc()
                .RunById("main");
        }
    }
}
```
HTML code:
```html
<!-- ClientLoad = FromDocument -->
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Templating</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" type="text/css" href="Scripts/CSharpTemplating.css" />
    <style>
        /* Don't show the not-yet-loaded templates */
        [ws-template], [ws-children-template] {
            display: none;
        }
    </style>
    <script type="text/javascript" src="Scripts/CSharpTemplating.head.js"></script>
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
    <script type="module" src="Scripts/CSharpTemplating.min.js"></script>
</body>
</html>
```

* The C# version sets `ClientLoad = FromDocument` in a HTML comment, for the templating code generator to use.
* The `ListModel` type requires a key for each element, so we use a C# tuple with named elements.
* C# template holes do not automatically support the `.V` shorthand, so the `V.V` helper is used.

## Client-side routing

```csharp
using WebSharper;
using WebSharper.UI;
using WebSharper.UI.Client;
using static WebSharper.UI.Client.Html;

namespace CSharpRouting
{
    [JavaScript]
    public class App
    {
        // Define the possible routes
        [EndPoint("")]
        public class Root
        {
            [EndPoint("about")]
            public class About : Root;

            [EndPoint("contact")]
            public class Contact : Root;

            [EndPoint("notfound")]
            public class NotFound : Root;
        }

        // Main UI component
        public static WebSharper.UI.Doc Render(WebSharper.Sitelets.Router<Root> router, Var<Root> currentRoute) 
        {
            // Navigation bar
            var navBar =
                div(
                    attr.@class("navbar"),
                    a(attr.href(router.HashLink(new Root())), "Home"),
                    a(attr.href(router.HashLink(new Root.About())), "About"),
                    a(attr.href(router.HashLink(new Root.Contact())), "Contact")
                );

            // Page content based on current route
            var pageContent =
                currentRoute.View.Doc(route =>
                    route switch
                    {
                        Root.About =>
                            div(
                                h2("About Us"),
                                p("Learn more about our application."),
                                button("Go to Contact",
                                    () => currentRoute.Set(new Root.Contact())
                                )
                            ),
                        Root.Contact =>
                            div(
                                h2("Contact Us"),
                                p("Get in touch with us!")
                            ),
                        Root.NotFound =>
                            div(
                                h2("404 - Page Not Found"),
                                p("The page you requested does not exist.")
                            ),
                        Root =>
                            div(
                                h2("Welcome to the Home Page"),
                                p("This is the main page of our SPA.")
                            )
                    }
                );

            // Combine navigation and content
            return div(
                navBar,
                pageContent
            );
        }
        
        [SPAEntryPoint]
        public static void ClientMain()
        {
            var router = WebSharper.Sitelets.InferRouter.Router.Infer<Root>();

            // Install the router, with a fallback if no route matches
            var currentRoute =
                router.InstallHash(new Root.NotFound());

            Render(router, currentRoute)
                .RunById("main");
        }
    }

}
```

* The endpoints must be declared as a base class, and subclasses that are nested inside it. This enables `Router.Infer` to work.
* Fullly qualified names are used for the `Router` and `Doc` types for disambiguation. This is intended to be improved in the future. See the [issue](https://github.com/dotnet-websharper/ui/issues/295).
