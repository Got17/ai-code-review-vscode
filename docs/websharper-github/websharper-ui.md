# Repository: dotnet-websharper/ui
## Branch: master

## File: docs/UINext-API.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-API.md

```md
## API Reference
> [UI.Next Documentation](UINext.md) ▸ **API Reference**

* [Dataflow](UINext-Dataflow.md) - dataflow support
  * [Var](UINext-Var.md) - reactive variables
  * [View](UINext-View.md), ViewBuilder - computed reactive nodes
  * [Key](UINext-Key.md) - helper type for generating unique identifiers 
  * [Model](UINext-Model.md) - helpers for imperative models
  * [ListModel](UINext-ListModel.md) - `ResizeArray`-like reactive model helpers
  * [Submitter](UINext-Submitter.md) - helper to bring events in the dataflow
* DOM
  * [Attr](UINext-Attr.md) - attributes
  * [Doc](UINext-Doc.md) - document fragments
  * [Html](UINext-Html.md) - HTML Helper Functions
  * [Templates](UINext-Templates.md) - Using HTML files as templates
* [Animation](UINext-Animation.md) - support for animation
  * [Anim](UINext-Anim.md) - abstract animation types
  * [Easing](UINext-Easing.md) - easing functions
  * [Interpolation](UINext-Interpolation.md) - interpolation between two values
  * [NormalizedTime](UINext-NormalizedTime.md) - type alias for the `[0, 1]` range
  * [Time](UINext-Time.md) - type alias for duration in milliseconds
  * [Trans](UINext-Trans.md) - support for animating change, enter and exit transitions
* Structure
  * [Flow](UINext-Flow.md), FlowBuilder - multi-stage documents such as wizards
  * [Router](UINext-Router.md), [RouteId](UINext-Router.md#RouteId) - support for routing and structuring sites
  * [RouteMap](UINext-RouteMap.md) - bijection between a route and an action type
* Input
  * [Input](UINext-Input.md) - Views of the mouse and keyboard
* Misc
  * [Notation](UINext-Notation.md)
  * [Client vs Server](UINext-ClientServer.md) - a discussion of client-side and server-side functionality

```
---


## File: docs/UINext-Anim.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Anim.md

```md
# Anim
> [UI.Next Documentation](UINext.md) ▸ [API Reference](UINext-API.md) ▸ [Animation](UINext-Animation.md) ▸ **Anim**

`Anim<'T>` type describes time-dependent values for animation, and `Anim` combines them
into animation collections that can be played together.

```fsharp
namespace WebSharper.UI.Next

type Anim<'T> =
    {
        Compute : NormalizedTime -> 'T
        Duration : Time
    }

type Anim =
    static member Simple : Interpolation<'T> -> Easing -> Time -> 'T -> 'T -> Anim<'T>
    static member Delayed : Interpolation<'T> -> Easing -> Time -> Time -> 'T -> 'T -> Anim<'T>
    static member Map : ('A -> 'B) -> Anim<'A> -> Anim<'B>
    static member Play : Anim -> Async<unit>
    static member Pack : Anim<unit> -> Anim
    static member WhenDone : (unit -> unit) -> Anim -> Anim
    static member Append : Anim -> Anim -> Anim
    static member Concat : seq<Anim> -> Anim
    static member Empty : Anim
```

## Typed Animations

<a name="Anim"></a>

[#](#Anim) **Anim** `type Anim<'T>`

Represents an animation of a given value, defined by duration and a time-function `Compute`
and an explicit `Duration`.

<a name="Map"></a>

[#](#Map) Anim.**Map** : `('A -> 'B) -> Anim<'A> -> Anim<'B>`

Lifts a function to change the type of an animation.

<a name="Simple"></a>

[#](#Simple) Anim.**Simple**

```fsharp
Anim.Simple :
  Interpolation<'T> ->
  Easing ->
  duration: Time ->
  startValue: 'T ->
  endValue: 'T ->
  Anim<'T>
```

Uses an interpolation, easing, duration, start and end values to construct an animation.

<a name="Delayed"></a>

[#](#Delayed) Anim.**Delayed**

```fsharp
Anim.Simple :
  Interpolation<'T> ->
  Easing ->
  duration: Time ->
  delay: Time ->
  startValue: 'T ->
  endValue: 'T ->
  Anim<'T>
```
As with [Simple](#Simple), but including an initial delay.

## Collected Animations

<a name="Play"></a>

[#](#Play) Anim.**Play** : `Anim -> Async<unit>`

Schedules and plays a collection of animations, waiting for all to complete.

<a name="Pack"></a>

[#](#Pack) Anim.**Pack** : `Anim<unit> -> Anim`

Lifts a typed animation into a singleton animation collection.

<a name="WhenDone"></a>

[#](#WhenDone) Anim.**WhenDone** : `(unit -> unit) -> Anim -> Anim`

Creates an animation that behaves like the given one, but also
schedules an action to run when the animation completes.

<a name="Append"></a>

[#](#Append) Anim.**Append** : `Anim -> Anim -> Anim`

Appends two collections of animations.

<a name="Concat"></a>

[#](#Concat) Anim.**Concat** : `seq<Anim> -> Anim`

Concatenates several collections of animations into one.

<a name="Empty"></a>

[#](#Empty) Anim.**Empty** : `Anim`

An empty collection of animations.

```
---


## File: docs/UINext-Animation.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Animation.md

```md
# Animation
> [UI.Next Documentation](UINext.md) ▸ [API Reference](UINext-API.md) ▸ **Animation**

Animation support allows describing animations and transitions as descriptive
first-class values. The most common way to use animation is to specify animated
attributes with [Attr](UINext-Attr.md) API, but they can also be scheduled imperatively.

For an example of animation, see the
[ObjectConstancy](http://intellifactory.github.io/websharper.ui.next.samples/#samples/samples/ObjectConstancy) sample.

API in detail:

* [Anim](UINext-Anim.md) - abstract animation types
* [Easing](UINext-Easing.md) - easing functions
* [Interpolation](UINext-Interpolation.md) - interpolation between two values
* [NormalizedTime](UINext-NormalizedTime.md) - type alias for the `[0, 1]` range
* [Time](UINext-Time.md) - type alias for duration in milliseconds
* [Trans](UINext-Trans.md) - support for animating change, enter and exit transitions

```
---


## File: docs/UINext-Attr.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Attr.md

```md
# Attr
> [UINext Documentation](UINext.md) ▸ [API Reference](UINext-API.md) ▸ **Attr**

Combinators for constructing time-varying and animated DOM attributes.
The concept of attributes is understood generally to include style properties,
event handlers and other things that can decorate a DOM node.

Some of the methods below are only available in JavaScript-compiled
code. See [here](UINext-ClientServer.md) for a discussion of client-side and
server-side functionality.

```fsharp
namespace WebSharper.UI.Next

type Attr =
    static member Create : name: string -> value: string -> Attr
    static member Dynamic : name: string -> value: View<string> -> Attr
    static member Animated : name: string -> Trans<'T> -> view: View<'T> -> value: ('T -> string) -> Attr
    static member Style : name: string -> value: string -> Attr
    static member DynamicStyle : name: string -> value: View<string> -> Attr
    static member AnimatedStyle : name: string -> Trans<'T> -> view: View<'T> -> value: ('T -> string) -> Attr
    static member Handler : name: string -> callback: (DomEvent -> unit) -> Attr
    static member Class : name: string -> Attr
    static member DynamicClass : name: string -> view: View<'T> -> apply: ('T -> bool) -> Attr
    static member DynamicPred : name: string -> predView: View<bool> -> valView: View<string> -> Attr
    
    static member Append : Attr -> Attr -> Attr
    static member Concat : seq<Attr> -> Attr
    static member Empty : Attr
```

## Basic Attributes

<a name="Create"></a>

[#](#Create) Attr.**Create** : `string -> string -> Attr`

Given a name and a value, creates a simple HTML attribute.
For example, `Attr.Create "href" "http://foo.com"`.

<a name="Dynamic"></a>

[#](#Dynamic) Attr.**Dynamic** : `string -> View<string> -> Attr`

Creates an attribute with a value that can change over time. See [View](UINext-View.md).

<a name="DynamicProp"></a>

[#](#DynamicProp) Attr.**DynamicProp** : `string -> View<'T> -> Attr`

Creates a property with a value that can change over time.

<a name="DynamicPred"></a>

[#](#DynamicPred) Attr.**DynamicPred** : `name: string -> View<bool> -> View<string> -> Attr`

Adds a given value when a predicate view is true. Can be useful when disabling elements, for example.

<a name="Animated"></a>

[#](#Animated) Attr.**Animated** : `string -> Trans<'T> -> View<'T> -> ('T -> string) -> Attr`

Animated attributes generalize dynamic ones by interpolating between changing states.
When a DOM tree is updated, elements that have animated attributes may be added, removed or
have the attributes update the value.  [Trans](UINext-Trans.md) value describes which animation should
be played in each of those situations.

<a name="Value"></a>

[#](#Value) Attr.**Value** : `Var<string> -> Attr`

Gets and sets the value of the element according to a [Var](UINext-Var.md).

<a name="CustomValue"></a>

[#](#CustomValue) Attr.**CustomValue** : `Var<'a> -> ('a -> string) -> (string -> 'a option) -> Attr`

Gets and sets the value of the element according to a [Var](UINext-Var.md),
using the given functions to transform the value to and from a string.

## Event handlers

<a name="Handler"></a>

[#](#Handler) Attr.**Handler** : `string -> (Dom.Element -> #Dom.Event -> unit) -> Attr`

Specifies a handler for a DOM event, such as click event for a button.

<a name="HandlerView"></a>

[#](#HandlerView) Attr.**HandlerView** : `string -> View<'T> -> (Dom.Element -> #Dom.Event -> 'T -> unit) -> Attr`

Specifies a handler for a DOM event, such as click event for a button.
In addition to the element and the event parameter, the handler also
receives the current value of a View.

## CSS Attributes

<a name="Class"></a>

[#](#Class) Attr.**Class** : `string -> Attr`

Specifies a class attribute. Classes are additive, so:

    Attr.Append (Attr.Class "a") (Attr.Class "b") = Attr.Create "class" "a b"
    
<a name="DynamicClass"></a>

[#](#DynamicClass) Attr.**DynamicClass** : `string -> View<'T> -> ('T -> bool) -> Attr`

Specifies a class that is added or removed depending on a particular time-varying flag.

<a name="Style"></a>

[#](#Style) Attr.**Style** : `string -> string -> Attr`

Specifies a CSS style property, such as `Attr.Style "background-color" "black"`.

<a name="DynamicStyle"></a>

[#](#DynamicStyle) Attr.**DynamicStyle** : `string -> View<string> -> Attr`

Generalizes CSS style properties to depend on time-varying values.

<a name="AnimatedStyle"></a>

[#](#AnimatedStyle) Attr.**AnimatedStyle** : `string -> Trans<'T> -> View<'T> -> ('T -> string) -> Attr`

A variant of [Attr.Animated](#Animated) for style properties.

## Attribute Collections

<a name="Append"></a>

[#](#Append) Attr.**Append** : `Attr -> Attr -> Attr`

Combines two collections of attributes into one.

<a name="Concat"></a>

[#](#Concat) Attr.**Concat** : `seq<Attr> -> Attr`

Concatenates multiple collections of attributes into one.

<a name="Empty"></a>

[#](#Empty) Attr.**Empty** : `Attr`

The empty collection of attributes.

```
---


## File: docs/UINext-CML.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-CML.md

```md
# Concurrent ML
> [UI.Next Documentation](UINext.md) ▸ **Concurrent ML**

Compared to [Functional Reactive Programming](UINext-FRP.md) systems,
UI.Next does not provide combinators for discrete event streams,
such as occurences of mouse clicks.  For the moment, we leave the
users to deal with events using callbacks and state, as discussed in
the [Event Streams](UINext-EventStreams.md) article.

What we might provide in the future is [Concurrent ML][cml] or [Hopac][hopac]
functionality.  It appears that the concurrent process paradigm is a clean fit
to the UI domain, and in particular to the problem of event streams and
transforming them.

In particular, an event stream transformer is a special case of a communicating
process, with a single input and a single output channel.  Assuming some basic
combinators:

    type Chan<'T>
    val chan : unit -> Chan<'T>
    val receive : Chan<'T> -> 'T
    val send : Chan<'T> -> 'T -> unit
    val spawn : unit -> Chan<'T>

We can, for example, build an `adder` stream transformer that computes the
running total of integers like this:

    let adder (inp: Chan<int>) (out: Chan<int>) : unit =
      let rec loop i =
        let x = receive inp
        let i = x + i
        send out i
        loop i
      spawn loop
   
And we can compose transformers like this:

    type P<'I,'O> = Chan<'I> -> Chan<'O> -> unit

    let compose (f: P<'A,'B>) (g: P<'B,'C>) : P<'A,'C> =
       fun inp out ->
          let c = chan ()
          f inp c
          g c out

It remains to be seen how to implement and integrate it with
the [Dataflow](UINext-Dataflow.md) layer, but we believe that a concurrent
process paradigm is promising as it is well known how to implement it
efficiently, works well in an ML-like language, is entirely higher order
and leaves the user in control of identity, sharing, and resource ownership.

[cml]: http://cml.cs.uchicago.edu/
[hopac]: https://github.com/VesaKarvonen/Hopac

```
---


## File: docs/UINext-ClientServer.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-ClientServer.md

```md
# Client-side vs Server-side
> [UI.Next Documentation](UINext.md) ▸ **Client-side vs Server-side**

UI.Next is mainly composed of two parts:

* the reactive [dataflow graph](UINext-Dataflow.md);
* the [HTML / DOM abstraction](UINext-Doc.md).

Since UI.Next is a WebSharper library, (most of) it is not only
compiled to .NET bytecode like any F# code, but also to JavaScript to
be run in the browser. A few subtleties stem from this double model,
which are explained here.

For the purpose of this document, "server side" means running in .NET
(or any CLI environment such as Mono), while "client side" means
running in JavaScript.

## The reactive layer

The reactive layer (`Var`s, `View`s and `Model`s), while primarily
designed for the client side, is also usable in .NET. However, it does
not currently have any means of crossing the server-client boundary.
This means that it is not currently possible to have a server-side
`View`'s value automatically propagated to the client side. The only
way to run a dataflow graph in .NET is to directly call the function
[`View.Sink`](View.md#Sink).

## The HTML / DOM abstraction

The DOM abstraction is also usable both on the server side and on the
client side.

### Client side

All of the DOM functionality is available on the client side, and
time-varying elements and attributes can depend on client-side
`View`s. Note that the client-only functionality requires opening the
namespace `WebSharper.UI.Next.Client`.

Client-side `Doc`s can be integrated directly into the DOM using the
functions [`Doc.Run`](Doc.md#Run) and [`Doc.RunById`](Doc.md#RunById).
They can also be used as the body of a `Web.Control`, since the
type `Doc` implements the interface `IControlBody`.

### Server side

Due to the lack of an actual DOM running, server-side HTML
functionality is much more restricted. Essentially, it is purely
generative: all of the following functionality will raise a runtime
exception if called.

* any functionality related to the reactive layer (such as
  `Doc.EmbedView` or `Attr.Dynamic`);
* any functionality using the DOM API, such as `Doc.Static` or
  `Attr.Handler`.
* attributes that deal with individual classes or styles, such as
  `Attr.SetClass` or `Attr.SetStyle`.

However, it is possible to add event handlers to server-side `Doc`s
using the version of `Attr.Handler` that is available when the
namespace `WebSharper.UI.Next.Client` is _not_ opened. This function
takes its callback in a quotation, with very strict constraints on the
contents of the quotation: it must only be the name of a top-level
function or a static member. You can also use the shorthands available
from `WebSharper.UI.Next.Html`, such as `on.click`.

It is also possible to include a client-side `Doc` within a
server-side `Doc`, using the function `Doc.ClientSide` (aliased as
`client` when `WebSharper.UI.Next.Html` is opened). This function
takes its content as a quotation, subject to similar constraints: the
quoted expression must be a call to a top-level function or static
member, and its arguments must only be literals or local variables.
The resulting HTML is a simple placeholder with a unique id, and
runtime code will replace this placeholder with the correct `Doc`.

Server-side `Doc`s can be integrated into a WebSharper application
in one of the following ways:

* The type `Doc` implements the interface `Web.INode`, so it can be
  used as:
    * the `Head` or `Body` argument of the Sitelets method
      `Content.Page`;
    * a child element of a `WebSharper.Html.Server` element.
* When opening `WebSharper.UI.Next.Server`, the method `Content.Page`
  has an overload that takes a single `Doc` argument representing a
  full HTML page.

## Example

Here is an example of a client-server WebSharper application that uses
the `Doc` API both on the server and on the client. You can simply
copy and paste it as the content of `Main.fs` in a WebSharper UI.Next
Client-Server Application project.

```fsharp
namespace UINextSample

open WebSharper
open WebSharper.Sitelets
open WebSharper.UI.Next
open WebSharper.UI.Next.Html

[<JavaScript>]
module ClientCode =
    open WebSharper.JavaScript
    open WebSharper.UI.Next.Client

    let rvInput = Var.Create ""
    let submit = Submitter.Create (rvInput.View.Map Some) None

    let Submit (el: Dom.Element) (ev: Dom.Event) =
        submit.Trigger()

    let InputControl() =
        Doc.Input [attr.placeholder "Enter your name here"] rvInput

    let OutputControl() =
        submit.View.Doc(function
            | None ->
                Doc.Empty
            | Some "" ->
                pAttr [Attr.Style "color" "red"] [
                    text "Please enter your name!"
                ] :> _
            | Some name ->
                p [text ("Welcome, " + name + "!")] :> _
        )

module ServerCode =
    open WebSharper.UI.Next.Server

    [<Website>]
    let Website =
        Application.SinglePage(fun ctx ->
            Content.Page(
                Title = "UI.Next client-server example",
                Body = [
                    h1 [text "Who are you?"]
                    client <@ ClientCode.InputControl() @>
                    inputAttr [
                        attr.``type`` "submit"
                        on.click <@ ClientCode.Submit @>
                    ] []
                    client <@ ClientCode.OutputControl() @>
                ]
            )
        )
```

```
---


## File: docs/UINext-Components.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Components.md

```md
# Components
> [UI.Next Documentation](UINext.md) ▸ **Components**

Basic guidelines are:

* Describe state using several [Var](UINext-Var.md) cells

* Hide your state, so that your component can locally enforce invariants on it

* Just as in normal F# and JavaScript, expose methods and callbacks for
  clients to send and receive event notifications for your component

* Accept and expose [View](UINext-View.md) values to express time-varying quantities 

* Accept and expose [Doc](UINext-Doc.md) values for UI that can be embedded into a document tree

* Make components higher order, so clients can create as many instances as needed

The strategy is fairly similar to creating reusable
components in F# or JavaScript.  One advantage is having new vocabulary
for [Var](UINext-Var.md), [View](UINext-View.md) and [Doc](UINext-Doc.md).  Making a distinction
between time-varying quantities and event occurences makes your code easier
to understand and easier to get right.


```
---


## File: docs/UINext-DOM-Design.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-DOM-Design.md

```md
# DOM

Design: See `Doc.fsi`; we follow a Monoid pattern, with `Doc`
representing potentially time-varying node (text, element) lists, and
`Attr` representing time-varying attribute lists.

Re-use ML identity.  Limitations - in general an error to use `d: Doc`
value twice in the tree.  Advantages: easy to manage lifetime and
implicit state, such as for input fields, or widgets that collect
state from the user but do not expose it.

## Implementation

See `Doc.fs` for the current implementation.

We take some care to batch DOM updates, so that they are pushed out to
the user synchronously, without interrupting for async jobs. This is
important so as not to show too many intermediate states to the user.

In the implementation, this is accomplished by maintaining inside Doc
a mutable tree.  This is similar to 'shadow' or 'virtual' DOM.  This
tree describes refs to DOM nodes, current state, and previously
synchronized state.  It also has a change-propagation channel layered
using dataflow combinators.

`Doc.EmbedView` forks an update process that waits on "changed" signal
from the tree, and synchronizes it by writing required changes from
current state; when an update is done, previous state matches current
state.

Unlike Virtual DOM in say Facebook React library, we rely where
possible on explicitly specified sharing to minimize work, rather than
always relying on a Diff algorithm.  Diff will be introduced strictly
as an optimization.

## Optimizations

Currently update process descends only into "dirty" sub-trees; should
work well for DOM trees with low/moderate branching.  Possibly can do
even better.

DOM operations are only performed on explicitly changed nodes, so for
example given:

    Doc.Concat [a; Doc.EmbedView b; c]

An update to the `b` view will not re-render `a` and `c` nodes.

However, no attempt is currently made to apply further diff/patch as
an optimization, which sounds like a good idea for the future. It
would further minimize calls to the DOM API.  Continuing with above
example, if `b` changes from `[d1; d2; d3]` to `[d1; d2; dN; d3]`,
currently all nodes are detached/re-attached, while a diff algorithm
would optimize this to only insert `dN`.



```
---


## File: docs/UINext-Dataflow-Design.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Dataflow-Design.md

```md
# Dataflow Implementation

This file gives an overview of the ideas behind, and implementation of
the dataflow system behind UI.Next. To gain an understanding of how to
*use* the `Var`s and `View`s of the dataflow layer, see
[Dataflow](UINext-Dataflow.md).

Interface: see Reactive.fsi, and Reactive.fs for implementation.

## Goals

A UI system describing time-varying values declaratively.  Separation
between the model and different views / representations of it,
specifically in as DOM node trees.

## Semantics

Metaphor: programmer specifies spreadsheet cells and how they depend
on each other. Cell A, cell B, with B = A + 1.  What makes the graph
dynamic is that there are cells whose existence depends on data. They
come and go.

The cells are reactive variables `Var<'T>` and read-only computed
`View<'T>` nodes arranged into a DAG; some of the Views are tracked by
being injected into DOM or imperatively with `View.Sink`.  The user
modifies `Var<'T>` as she would a `ref<'T>` cell, and updates are
re-computed automatically.

Important: when doing `let B = View.Map (fun x -> x + 1) A`, we make
no guarantees how many times the function will be called, that is
irrelevant.  What is important, is that eventually, `B = A + 1`.

## Implementation

We do not currently take advantage of having explicit traversable
graph structure (for example, linked lists of nodes dependent on each
other).  This buys some advantages when it comes to garbage collection
and the minimisation of space leaks - in particular, if we decide we
want to drop a component, we can just drop the reference without
having to explicitly dispose of it.  The decision can be revisited.

We want to prevent glitches - so, as the user should never observe an
intermediate state, if `B = A + 1`, then should not be able to see
`(A, B) = (2, 2)` as a valid observation.

Current attempt to implement the dataflow is based on the `Snap<'T>`
type and its usage protocol.  A Snap is an observation of a
time-varying value.  States and transitions:

    Waiting -> Available with 'T
    Waiting -> Obsolete
    Available with 'T -> Obsolete

You can block until a Snap becomes obsolete or available.

Var/View nodes have a protocol where an observer can obtain a Snap.

Key ideas:

* Obsolete-propagation is separated from recomputation, which allows
  to skip some of the re-computation, especially along asynchronous
  edges (MapAsync)

* Recomputation is lazy - a computed View does not bother to observe
  the source view until itself observed

* Observers block inside a `Snap`, which solves the producer/consumer
  GC problem: given a system property that every `Snap` becomes
  obsolete, it is not necessary to manually subscribe/desubscribe, as
  obsoleting Snaps makes abandoned consumers collectable by GC.

* To avoid glitches (inconsistent observations), need to ensure that
  obsolete-propagation is always executed independently, and having
  higher priority than recomputation.  Whenever code obtains a Snap,
  it should be either marked obsolete already, or not be obsolete.
  There should not be outstanding queued obsolete-propagation work.

## Notes

The CML book discusses multi-cast channels which emply similar ideas
to improve interacting with GC - basically producers do not
unnecessarily link to consumers.  This simplifies correct (memory
leak-free) programming interface.

We are currently using single-threadedness assumption of our target
environment (JS).  This will need a revision when porting to .NET/CLR.

Overall, ideas here are raw and might not work out. If they do not
work out, can fallback to using FRP, as implemented in combinators
from:

1. OCaml React

2. Flapjax

```
---


## File: docs/UINext-Dataflow.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Dataflow.md

```md
# Dataflow
> [UI.Next Documentation](UINext.md) ▸ [API Reference](UINext-API.md) ▸ **Dataflow**

Dataflow functionality supports expressing
time-varying values organized into a self-modifying graph.

Types involved:

  * [Var](UINext-Var.md) - reactive variables
  * [View](UINext-View.md), ViewBuilder - computed reactive nodes
  * [Key](UINext-Key.md) - helper type for generating unique identifiers 
  * [Model](UINext-Model.md) - helpers for imperative models
  * [ListModel](UINext-ListModel.md) - `ResizeArray`-like reactive model helpers

A simple graph might look like this:

```fsharp

open WebSharper
open WebSharper.UI.Next

let Main () =

  let x = Var.Create 0
  let y = x.View |> View.Map (fun x -> x + 1)
  let z = View.Map2 ( + ) x.View y

  let update () =
    x.Value <- x.Value + 1
  
  let observe v =
    JavaScript.Log(v)

  View.Sink observe z
```

Besides Sink, Views are typically observed with the [Doc](UINext-Doc.md) layer
that implements reactive DOM.

Vars are similar to `ref` cells and hold some state that can change.
Views are expressed as computations from `Vars`.  The mental model is
that of a spreadsheet.  Application entry point observes a `View`
imperatively for some effect.

It is important to understand that only the latest value matters. 
The number of times `View.Sink` will be called has no relation to the
number of times the underlying Vars change.  The only thing that matters,
is that the system will synchronize.

There are no glitches.  In examples like above, you always observe
consistent states, such that `z = 2 * x + 1`.

The datafow layer is designed to avoid space leaks in the majority of
common cases.  Generelly, constructing new Views is safe and they do not
need to be imperatively "removed", as they get collected by GC when not in
use (see [Leaks](UINext-Leaks.md) for gory details).

```
---


## File: docs/UINext-Doc.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Doc.md

```md
# Doc
> [UI.Next Documentation](UINext.md) ▸ [API Reference](UINext-API.md) ▸ **Doc**

The `Doc` type represents a time-varying collection of DOM nodes,
with [Attr](UINext-Attr.md) describing reactive attributes.  Making no distinction
between a node and a node list makes it easy to construct dynamic interfaces
which add, remove and replace nodes, without explicitly scheduling the
actual steps.

Identity  matters with documents (see [Sharing](UINext-Sharing.md)). It is assumed that
the any document is only used at once place in the parent document.

The type `Elt` represents a `Doc` that is statically known to be comprised of a single element. It may of course contain time-varying children and/or attributes. The purpose of this more specific type is to provide a set of properties and methods listed below, that only make sense or can only be implemented efficiently for a single element.

Docs can be constructed either by using one of the methods below, or from an
HTML file using the [templating engine](UINext-Templates.md).

Some of the methods below are only available in JavaScript-compiled
code and require the namespace `WebSharper.UI.Next.Client` to be
opened. See [here](UINext-ClientServer.md) for a discussion of client-side
and server-side functionality.

```fsharp
namespace WebSharper.UI.Next

type Doc =
    static member Element : name: string -> seq<Attr> -> seq<Doc> -> Elt
    static member SvgElement : name: string -> seq<Attr> -> seq<Doc> -> Elt
    static member EmbedView : View<Doc> -> Doc
    static member BindView : ('T -> #Doc) -> View<'T> -> Doc
    static member Static : Dom.Element -> Doc
    static member TextView : View<string> -> Doc
    static member TextNode : string -> Doc

    static member Append : Doc -> Doc -> Doc
    static member Concat : seq<Doc> -> Doc
    static member Empty : Doc

    static member Run : Dom.Element -> Doc -> unit
    static member RunById : id: string -> Doc -> unit

    static member Input : seq<Attr> -> Var<string> -> Elt
    static member InputArea : seq<Attr> -> Var<string> -> Elt
    static member PasswordBox : seq<Attr> -> Var<string> -> Elt
    static member Button : caption: string -> seq<Attr> -> (unit -> unit) -> Elt
    static member Link : caption: string -> seq<Attr> -> (unit -> unit) -> Elt
    static member CheckBox<'T when 'T : equality> : ('T -> string) -> list<'T> -> Var<list<'T>> -> Elt
    static member Select<'T when 'T : equality> : seq<Attr> -> ('T -> string) -> list<'T> -> Var<'T> -> Elt
    
    static member BindSeqCached<'T when 'T : equality> :
        ('T -> Doc) -> View<seq<'T>> -> Doc

    static member BindSeqCachedBy<'T,'K when 'K : equality> :
        ('T -> 'K) -> ('T -> Doc) -> View<seq<'T>> -> Doc

    static member BindSeqCachedView<'T when 'T : equality> :
        (View<'T> -> Doc) -> View<seq<'T>> -> Doc

    static member BindSeqCachedViewBy<'T,'K when 'K : equality> :
        ('T -> 'K) -> (View<'T> -> Doc) -> View<seq<'T>> -> Doc

and Elt =
    inherit Doc

    member Dom : Dom.Element
    member On : string * (Dom.Element -> Dom.Event -> unit) -> Elt
    member Prepend : Doc -> unit
    member Append : Doc -> unit
    member Clear : unit -> unit
    member Html : string
    member Id : string
    member Value : string with get, set
    member Text : string with get, set
    member GetAttribute : string -> string
    member SetAttribute : string * string -> string
    member HasAttribute -> string -> bool
    member RemoveAttribute : string -> unit
    member GetProperty : string -> 'T
    member SetProperty : string * 'T -> unit
    member AddClass : string -> unit
    member RemoveClass : string -> unit
    member HasClass : string -> bool
    member SetStyle : string * string -> unit

```

## Constructing

<a name="Doc"></a>

[#](#Doc) **Doc** `type Doc`

Represents a time-varying collection of nodes.

<a name="Element"></a>

[#](#Element) Doc.**Element** : `string -> seq<Attr> -> seq<Doc> -> Doc`

Constructs an element node with a given name, attributes and children.

<a name="EmbedView"></a>

[#](#EmbedView) Doc.**EmbedView** : `View<Doc> -> Doc`

Create a time-varying Doc from a View on a Doc.

<a name="BindView"></a>

[#](#BindView) Doc.**BindView** : `('T -> Doc) -> View<'T> -> Doc`

Also available as a method **.Doc**(f) on `View<'A>`.

Create a time-varying Doc from a View on a Doc.

<a name="SvgElement"></a>

[#](#SvgElement) Doc.**SvgElement** : `string -> seq<Attr> -> seq<Doc> -> Doc`

Same as `Element`, but uses the SVG namespace.

<a name="Static"></a>

[#](#Static) Doc.**Static** : `Dom.Element -> Doc`

Embeds an already consturcted DOM element into the `Doc` type.

<a name="TextView"></a>

[#](#TextView) Doc.**TextView** : `View<string> -> Doc`

Constructs a time-varying text node.

<a name="TextNode"></a>

[#](#TextNode) Doc.**TextNode** : `string -> Doc`

Constructs a simple text node. An optimization of `Doc.TextView (View.Const x)`.

## Combining

<a name="Append"></a>

[#](#Append) Doc.**Append** : `Doc -> Doc -> Doc`

Appends two node sequences into one sequence. 

<a name="Concat"></a>

[#](#Concat) Doc.**Concat** : `seq<Doc> -> Doc`

Concatenates multiple sequences into one.

<a name="Empty"></a>

[#](#Empty) Doc.**Empty** : `Doc`

The empty document sequence.

## Running

<a name="Run"></a>

[#](#Run) Doc.**Run** : `Dom.Element -> Doc -> unit`

Starts a process that synchronizes the children of a given element with
the given time-varying document.  This should only be used as one of the
application entry points.  The provided Element is typically a placeholder
element in an HTML template.

<a name="RunById"></a>

[#](#RunById) Doc.**RunById** : `string -> Doc -> unit`

Similar to [Doc.Run](#Run), but takes an element identifier
to locate the parent placeholder element with `document.getElementById`.

## Forms

<a name="Input"></a>

[#](#Input) Doc.**Input** : `seq<Attr> -> Var<string> -> Doc`

Creates an input box with the given attributes. Synchronises with the given reactive variable: changing the text in the input box will update the variable, and changing the variable contents will update the text in the box.


<a name="InputArea"></a>

[#](#InputArea) Doc.**InputArea** : `seq<Attr> -> Var<string> -> Doc`

As above, but creates an HTML `textarea` instead of an input box.


<a name="PasswordBox"></a>

[#](#PasswordBox) Doc.**PasswordBox** : `seq<Attr> -> Var<string> -> Doc`

As above, but creates an HTML password box.

<a name="Button"></a>

[#](#Button) Doc.**Button** : `caption: string -> seq<Attr> -> (unit -> unit) -> Doc`

Creates a button with the given caption and attributes. Takes a callback which is executed whenever the button is clicked.

<a name="Link"></a>

[#](#Link) Doc.**Link** : `caption: string -> seq<Attr> -> (unit -> unit) -> Doc`

Creates a link with the given caption and attributes which does not change the page, but instead executes the given callback.

<a name="CheckBox"></a>

[#](#CheckBox) Doc.**CheckBox** : `('T -> string) -> list<'T> -> Var<list<'T>> -> Doc`

Creates a set of check boxes from the given list. Requires a function to show each item, and a list variable which is updated with the currently-selected items.

<a name="Select"></a>

[#](#Select) Doc.**Select** : `seq<Attr> -> ('T -> string) -> list<'T> -> Var<'T> -> Doc`

Creates a selection box from the given list. Requires a function to show each item, and a variable which is updated with the currently-selected item.

## Collections

For convenience, [View](UINext-View.md) BindSeqCached* functions are specialied for the `Doc` type.

<a name="BindSeqCached"></a>

[#](#BindSeqCached) Doc.**BindSeqCached** : `('T -> Doc) -> View<seq<'T>> -> Doc`

Also available as a method **.DocSeqCached**(f) on `View<'A>`.

Variant of `View.BindSeqCached` that concatenates the resulting `Doc`s.

<a name="BindSeqCachedBy"></a>

[#](#BindSeqCachedBy) Doc.**BindSeqCachedBy** : `('T -> 'K) -> ('T -> Doc) -> View<seq<'T>> -> Doc`

Also available as a method **.DocSeqCached**(k, f) on `View<'A>`.

Variant of `View.BindSeqCachedBy` that concatenates the resulting `Doc`s.

<a name="BindSeqCachedView"></a>

[#](#BindSeqCachedView) Doc.**BindSeqCachedView** : `(View<'T> -> Doc) -> View<seq<'T>> -> Doc`

Also available as a method **.DocSeqCached**(f) on `View<'A>`.

Variant of `View.BindSeqCachedView` that concatenates the resulting `Doc`s.

<a name="BindSeqCachedViewBy"></a>

[#](#BindSeqCachedViewBy) Doc.**BindSeqCachedViewBy** : `('T -> 'K) -> (View<'T> -> Doc) -> View<seq<'T>> -> Doc`

Also available as a method **.DocSeqCached**(k, f) on `View<'A>`.

Variant of `View.BindSeqCachedViewBy` that concatenates the resulting `Doc`s.

## Elt instance members


<a name="Elt-Dom"></a>

[#](#Elt-Dom) elt.**Dom** : `Dom.Element`

Get the DOM element represented by the Elt.

<a name="Elt-On"></a>

[#](#Elt-On) elt.**On** : `string * (Dom.Element -> Dom.Event -> unit) -> Elt`

Add a handler for the given event on the Elt.

<a name="Elt-Prepend"></a>

[#](#Elt-Prepend) elt.**Prepend** : `Doc -> unit`

Add a Doc as first child(ren) of the Elt. If the Doc is time-varying,
then it will be properly added to the dataflow graph.

<a name="Elt-Append"></a>

[#](#Elt-Append) elt.**Append** : `Doc -> unit`

Add a Doc as last child(ren) of the Elt. If the Doc is time-varying,
then it will be properly added to the dataflow graph.

<a name="Elt-Clear"></a>

[#](#Elt-Clear) elt.**Clear** : `unit -> unit`

Remove all children of the Elt. If any of them are time-varying, then
they will be properly removed from the dataflow graph.

<a name="Elt-Html"></a>

[#](#Elt-Html) elt.**Html** : `string`

Get an HTML string representation of the Elt in its current state.

<a name="Elt-Id"></a>

[#](#Elt-Id) elt.**Id** : `string`

Get the id of the Elt.

<a name="Elt-Value"></a>

[#](#Elt-Value) elt.**Value** : `string with get, set`

Get or set the value of the Elt. Note that if the element is
associated with a view (e.g. if it was created with `Doc.Input`), then
the value will be overridden by any update to this view.

<a name="Elt-Text"></a>

[#](#Elt-Text) elt.**Text** : `string with get, set`

Get or set the text content of the Elt. Setting the text will
effectively remove all of the Elt's children from the DOM, and care is
taken to properly remove them from the dataflow graph.

<a name="Elt-GetAttribute"></a>

[#](#Elt-GetAttribute) elt.**GetAttribute** : `string -> string`

Get the Elt's HTML attribute with the given name.

<a name="Elt-SetAttribute"></a>

[#](#Elt-SetAttribute) elt.**SetAttribute** : `string * string -> string`

Set the Elt's HTML attribute with the given name to the given value.

<a name="Elt-HasAttribute"></a>

[#](#Elt-HasAttribute) elt.**HasAttribute** : `string -> bool`

Checks whether the Elt's attribute with the given name is set.

<a name="Elt-RemoveAttribute"></a>

[#](#Elt-RemoveAttribute) elt.**RemoveAttribute** : `string -> bool`

Remove the Elt's attribute with the given name, if any.

<a name="Elt-GetProperty"></a>

[#](#Elt-GetProperty) elt.**GetProperty** : `string -> string`

Get the Elt's HTML property with the given name.

<a name="Elt-SetProperty"></a>

[#](#Elt-SetProperty) elt.**SetProperty** : `string * string -> string`

Set the Elt's HTML property with the given name to the given value.

<a name="Elt-AddClass"></a>

[#](#Elt-AddClass) elt.**AddClass** : `string -> unit`

Add the given CSS class to the Elt.

<a name="Elt-RemoveClass"></a>

[#](#Elt-RemoveClass) elt.**RemoveClass** : `string -> unit`

Remove the given CSS class from the Elt.

<a name="Elt-HasClass"></a>

[#](#Elt-HasClass) elt.**HasClass** : `string -> bool`

Check whether the Elt has the given CSS class.

<a name="Elt-SetStyle"></a>

[#](#Elt-SetStyle) elt.**SetStyle** : `string * string -> unit`

Sets the Elt's CSS style with the given name to the given value.

```
---


## File: docs/UINext-Easing.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Easing.md

```md
# Easing
> [UI.Next Documentation](UINext.md) ▸ [API Reference](UINext-API.md) ▸ [Animation](UINext-Animation.md) ▸ **Easing**

```fsharp
namespace WebSharper.UI.Next

type Easing =
    {
        TransformTime : NormalizedTime -> NormalizedTime
    }
    
    static member CubicInOut : Easing
    static member Custom : (NormalizedTime -> NormalizedTime) -> Easing
```

<a name="Easing"></a>

[#](#Easing) **Easing** `type Easing`

Represents an easing function, a transform on NormalizedTime.

<a name="TransformTime"></a>

[#](#TransformTime) easing.**TransformTime** : `NormalizedTime -> NormalizedTime`

Applies the time transformation.

<a name="Easing.CubicInOut"></a>

[#](#Easing.CubicInOut) Easing.**CubicInOut** : `Easing`

The most commonly used easing, corresponds to:

```fsharp
let f t = 3. * (t ** 2.) - 2. * t ** 3.
```

<a name="Easing.Create"></a>

[#](#Easing.Create) Easing.**Create** : `(NormalizedTime -> NormalizedTime) -> Easing`

Creates a custom easing.

```
---


## File: docs/UINext-EventStreams.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-EventStreams.md

```md
# Event Streams
> [UI.Next Documentation](UINext.md) ▸ **Event Streams**

We do not currently provide first-class event streams or even
first-class event stream transformers, as found in [FRP](UINext-FRP.md) and
other libraries.

The default in F# UIs is to use callbacks that mutate objects to
describe change.  This is what UI.Next currently recommends, with
observable [Var](UINext-Var.md) cells taking the place of mutable objects.

Rationale: callbacks and mutation, when combined with abstract types
and encapsulation, are not a bad tool for working with event streams.
A good way to reason about systems with callbacks is to pieces of
mutable state with associated operations as a communicating process in
a process caluculus, and callback parameters as communication
channels.

Situations where callbacks feel too low-level are:

* when used to perform sync of related time-varying values - this is
  what our dataflow combinators address, using a higher-level approach
  describes the relationships without describing how to perform the
  sync

* when ordering of effects becomes important and thus advanced
  synchronization is needed - we feel in context of ML languages with
  simple type systems this is best addressed by [Concurrent
  ML](UINext-CML.md)

## IObservable

F# also has first-class imperative events, the `IObservable` interface
and the associated library of event stream combinators (Rx).  We did
not go with combinators such as Rx.  Just like FRP, these are tricky
to use correctly, especially in the dynamic case.  It is easy to miss
occurences or else introduce a memory leak by accidentally retaining the
entire event stream history.  Note that if you like Rx/Rx.js,
it should be possible to use these libraries with F#/WebSharper, without
special support from UI.Next.

## Elm

The [Elm](http://elm-lang.org/) programming language provides a [Signal](http://elm-lang.org/learn/What-is-FRP.elm)
abstraction is a hybrid of Event and Behavior.  The interesting functionality is
availability of history transformations, such as `count Mouse.clicks`.  This is not available
in [View](UINext-View.md) layer.  The tradeoff is that Elm signals do not allow dynamic composition,
there is no `Signal (Signal a) -> Signal a` combinator, whereas this is available
in our framework as `View.Join`.

```
---


## File: docs/UINext-FRP.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-FRP.md

```md
# FRP
> [UI.Next Documentation](UINext.md) ▸ **FRP**

[Functional Reactive
Programming](http://en.wikipedia.org/wiki/Functional_reactive_programming)
(FRP) typically provides an Event type for event streams and a
Behavior type for time-varying values, together with useful
combinators on those.

Designing a good FRP library is possible but non-trivial since you
have to define semantics for time (especially important for event
simultaneity), and avoid space and time leaks.  The latter gets
especially tricky if combinators allow dynamism (non-static dependency
graphs).

Successful simplifications include:

* Disallowing first-class events and/or behaviors, and focusing on
  transformers instead, which prevents leaks (Arrow FRP)

* Designing a custom type system that rules out
  complicated-to-implement cases of dynamism as in [Elm][elm]

Successful ML and Scheme libraries that provide full FRP use dynamic
dataflow graphs to embed FRP in an imperative world ([OCaml
React][react], [Flapjax][flapjax]) and assume certain care on the part
of the user to avoid leaks, since the type system is too weak to help.

The dataflow graph approach is perhaps the most helpful in our
context, where we want to integrate easily with existing libraries
such as DOM API, and be compatible with a simple ML type system.

However, for now we decided to avoid implementing FRP.  Instead, we
focus on a subset of functionality, defining time-varying [View](UINext-View.md)
values similar to Behaviors, but without support for real-time sampling.
[Event streams](UINext-EventStreams.md) are left for the user to tackle using
callbacks or third-party libraries.  This is a vast simplification
over FRP and is much easier to implement efficiently.

As weak pointers become available in JavaScirpt, this decision might
be revised, especially in light of [OCaml React][react] success. 

In the more immediate future, we intend to provide [Concurrent ML](UINext-CML.md)
combinators to better support dealing with event streams and improve composition
of [Components](UINext-Components.md).

[elm]: http://elm-lang.org/
[flapjax]: http://www.flapjax-lang.org/
[react]: http://erratique.ch/software/react

```
---


## File: docs/UINext-Flow.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Flow.md

```md
# Flow
> [UI.Next Documentation](UINext.md) ▸ [API Reference](UINext-API.md) ▸ **Flow**

`Flow` is a way of structuring applications with a linear control flow.
Each stage of a Flow may depend on information retrieved at a previous stage.
Flows work through the use of a monadic interface, and can be constructed using
a computation expression.

```fsharp
namespace WebSharper.UI.Next

type Flow<'T>

type Flow =
    static member Map : ('A -> 'B) -> Flow<'A> -> Flow<'B>
    static member Bind : Flow<'A> -> ('A -> Flow<'B>) -> Flow<'B>
    static member Return : 'A -> Flow<'A>
    static member Embed : Flow<'A> -> Doc
    static member Define : (('A -> unit) -> Doc) -> Flow<'A>
    static member Static : Doc -> Flow<unit>
    static member Do : FlowBuilder

type FlowBuilder =
    member Bind : Flow<'A> * ('A -> Flow<'B>) -> Flow<'B>
    member Return : 'A -> Flow<'A>
    member ReturnFrom : Flow<'A> -> Flow<'A>
```

## Defining Flows

<a name="Define"></a>

[#](#TextView) Flow.**Define** : `(('A -> unit) -> Doc) -> Flow<'A>`

Creates a new `Flow`. Requires a function which takes a callback `('A -> unit)`, which is used to progress through stages of the flow, and produces a `Doc`, which is the rendering of that stage of the flow. To return a value from the flow, the value should be specified as an argument to the callback.

<a name="Static"></a>

[#](#Static) Flow.**Static** : `Doc -> Flow<unit>`

Creates a `Flow` from a given Doc. As there is no callback, the flow cannot be progressed further. This function is therefore generally used to specify the final page in a flow. 

<a name="Do"></a>

[#](#Do) Flow.**Do** : `FlowBuilder`

Used to define a `Flow` with a computation expression.

<a name="Return"></a>

[#](#Return) Flow.**Return** : `'A -> Flow<'A>`

Lifts a pure value into a flow. Does not change the page that is rendered.

## Flow Combinators

<a name="Bind"></a>

[#](#Bind) Flow.**Bind** : `Flow<'A> -> ('A -> Flow<'B>) -> Flow<'B>`

Monadic composition. Given a flow of type `Flow<'A>` and a continuation function of type `('A -> Flow<'B>)`, creates a flow of type `Flow<'B>`. Semantically, if `Flow<'B>` specifies a rendering function, the page will be updated when the callback in the first flow is invoked.


<a name="Map"></a>

[#](#Map) Flow.**Map** : `('A -> 'B) -> Flow<'A> -> Flow<'B>`

Maps a function `('A -> 'B)` onto a flow of type `'A` to create a flow of type `'B`. Does not affect the rendering of the flow.

## Embedding Flows

<a name="Embed"></a>

[#](#Embed) Flow.**Embed** : `Flow<'A> -> Doc`

Embeds a flow into a document. The resulting `Doc` will represent the rendering of the `Flow`, and will update whenever the rendering of the flow changes (for example, when displaying a new page).

```
---


## File: docs/UINext-Html.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Html.md

```md
# Html
> [UI.Next Documentation](UINext.md) ▸ [API Reference](UINext-API.md) ▸ **Html**

The `Html` module contains functions for constructing HTML elements
and attributes. All of these functions are simply convenience wrappers
around functions from the `Doc` and `Attr` classes. For example, this:

```fsharp

open WebSharper.UI.Next
open WebSharper.UI.Next.Html
open WebSharper.UI.Next.Client

let vWorld = View.Const "World!"
div [
    text "Hello "
    aAttr [
        on.click (fun _ _ -> JS.Alert "Hi!")
        attr.href "#"
    ] [
        textView vWorld
    ]
]
```

would be equivalent to:

```fsharp
open WebSharper.UI.Next
open WebSharper.UI.Next.Client

let vWorld = View.Const "World!"
Doc.Element "div" [] [
    Doc.TextNode "Hello "
    Doc.Element "a" [
        Attr.Handler "click" (fun _ _ -> JS.Alert "Hi!")
        Attr.Create "href" "#"
    ] [
        Doc.TextView vWorld
    ]
]
```

Some of the functions below are only available in JavaScript-compiled
code and require the namespace `WebSharper.UI.Next.Client` to be
opened. See [here](UINext-ClientServer.md) for a discussion of client-side
and server-side functionality.

## Elements

* Every standard HTML5 element `foo` has two associated functions:

<a name="HtmlElt"></a>

[#](#HtmlElt) **foo** : `seq<Doc> -> Elt`

Creates an HTML element `<foo>` with the given children.
Equivalent to `Doc.Element "foo" [] children`.

<a name="HtmlEltAttr"></a>

[#](#HtmlEltAttr) **fooAttr** : `seq<Attr> -> seq<Doc> -> Elt`

Creates an HTML element `<foo>` with the given attributes and children.
Equivalent to `Doc.Element "foo" attrs children`.

* Every standard SVG element `foo` has an associated function:

<a name="SvgElt"></a>

[#](#SvgElt) SvgElements.**foo** : `seq<Attr> -> seq<Doc> -> Elt`

Creates an SVG element `<foo>` with the given attributes and children.
Equivalent to `Doc.SvgElement "foo" attrs children`.

## Attributes

* Every standard HTML attribute `foo` has four associated functions:

<a name="Attr"></a>

[#](#Attr) attr.**foo** : `string -> Attr`

Creates an attribute named `foo` with a constant value.
Equivalent to `Attr.Create "foo" value`.

<a name="AttrDyn"></a>

[#](#AttrDyn) attr.**fooDyn** : `View<string> -> Attr`

Creates an attribute named `foo` with a time-varying value.
Equivalent to `Attr.Dynamic "foo" view`.

<a name="AttrDynPred"></a>

[#](#AttrDynPred) attr.**fooDynPred** : `View<string> -> View<bool> -> Attr`

Creates an attribute named `foo` with a time-varying value,
which is set or unset based on a time-varying predicate.
Equivalent to `Attr.DynamicPred "foo" view pred`.

<a name="AttrAnim"></a>

[#](#AttrAnim) attr.**fooAnim** : `View<'T> -> ('T -> string) -> Trans<'T> -> Attr`

Creates an animated attribute named `foo` with the given time-varying
value and transition.
Equivalent to `Attr.Animated "foo" trans view convert`.

## Event handlers

* Every standard HTML event `foo` has two associated functions:

<a name="Event"></a>

[#](#Event) on.**foo** : `(Dom.Element -> #Dom.Event -> unit) -> Attr`

Creates an event handler for `foo`. The exact subtype of `Dom.Event`
passed depends on the actual event; for example, `on.click` passes a
`Dom.MouseEvent`.

<a name="EventView"></a>

[#](#EventView) on.**fooView** : `View<'T> -> (Dom.Element -> #Dom.Event -> 'T -> unit) -> Attr`

Creates an event handler for `foo`, which also passes the current
value of the given view.

```
---


## File: docs/UINext-Input.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Input.md

```md
# Input 
> [UI.Next Documentation](UINext.md) ▸ [API Reference](UINext-Input.md) ▸ **Input**

The `Input` module provides views of time-varying inputs such as mouse 
position and key presses. These can then be displayed or used with combinators
such as [SnapshotOn](View.md/#SnapshotOn) for event-driven behaviour.

```fsharp
module Input =

    type Key = int

    [<Sealed>]
    type Mouse =
        static member Position : View<(int * int)>
        static member MousePressed : View<bool>
        static member LeftPressed : View<bool>
        static member RightPressed : View<bool>
        static member MiddlePressed : View<bool>

    [<Sealed>]
    type Keyboard =
        static member KeysPressed : View<Key list>
        static member LastPressed : View<Key>
        static member IsPressed : Key -> View<bool>
```

## Mouse

<a name="Position"></a>

[#](#Position) .**Mouse.Position** : `View<(int * int)>`

Provides a view of the current mouse position, represented as an (x, y) tuple.

<a name="MousePressed"></a>

[#](#MousePressed) .**Mouse.MousePressed** : `View<bool>`

Provides a view of a flag which is set to true if any mouse button is pressed,
and false if not.

<a name="LeftPressed"></a>

[#](#LeftPressed) .**Mouse.LeftPressed** : `View<bool>`

Provides a view of a flag which is set to true if the left mouse button is pressed,
and false if not.

<a name="RightPressed"></a>

[#](#RightPressed) .**Mouse.RightPressed** : `View<bool>`

Provides a view of a flag which is set to true if the right mouse button is pressed,
and false if not.

<a name="MiddlePressed"></a>

[#](#MiddlePressed) .**Mouse.MiddlePressed** : `View<bool>`

Provides a view of a flag which is set to true if the middle mouse button is pressed,
and false if not.


## Keyboard
<a name="KeysPressed"></a>

[#](#KeysPressed) .**Keyboard.KeysPressed** : `View<Key list>`

Provides a view of a list of all keys which are currently pressed.

<a name="LastPressed"></a>

[#](#LastPressed) .**Keyboard.LastPressed** : `View<Key>`

Provides a view of the last key to be pressed.

<a name="IsPressed"></a>

[#](#IsPressed) .**Keyboard.IsPressed** : `Key -> View<bool>`

Provides a view which is `true` when the given key is pressed, and `false` when it is not.



```
---


## File: docs/UINext-Interpolation.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Interpolation.md

```md
# Interpolation
> [UI.Next Documentation](UINext.md) ▸ [API Reference](UINext-API.md) ▸ [Animation](UINext-Animation.md) ▸ **Interpolation**

Interpolation allows computing intermediate values for a given type.
This is essential for automatic smooth in-between animation.

```fsharp
namespace WebSharper.UI.Next

type Interpolation<'T> =
    abstract Interpolate : NormalizedTime -> 'T -> 'T -> 'T

type Interpolation =
    static member Double : Interpolation<double>
```

<a name="Interpolation"></a>

[#](#Interpolation) **Interpolation** `type Interpolation<'T>`

Represents a way to interpolate between two values of a given type.

<a name="Interpolate"></a>

[#](#Interpolate) interpolation.**Interpolate** : `NormalizedTime -> 'T -> 'T -> 'T`

Computes an in-between value based on normalized time, starting and ending values.

<a name="Interpolation.Double"></a>

[#](#Interpolation.Double) Interpolation.**Double** : `Interpolation<double>`

Linear interpolation on doubles.

```
---


## File: docs/UINext-Key.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Key.md

```md
# Key
> [UI.Next Documentation](UINext.md) ▸ [API Reference](UINext-API.md) ▸ [Dataflow](UINext-Dataflow.md) ▸ **Key**

Helper type to generate unique identifiers.

```fsharp
type Key =
    static member Fresh : unit -> Key
```

<a name="Key"></a>

[#](#Key) **Key** `type Key`

Represents a unique identifier.

<a name="Fresh"></a>

[#](#Fresh) Key.**Fresh** : `unit -> Key`

Creates a fresh unique identifier.

```
---


## File: docs/UINext-Leaks.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Leaks.md

```md
## Leaks
> [UI.Next Documentation](UINext.md) ▸ **Leaks**

The [Dataflow](UINext-Dataflow.md) layer avoids most common cases of space leaks,
as well as time leaks, by using a clever coordination protocol.

The protocol is GC-friendly, which is great news for the programmer.
You can generally create consumers without having to "unsubscribe" or otherwise
imperatively mark their irrelevance.  So, for instance:

    let y = View.Map f x
    
This creates `y` as a consumer (dependent) of `x`.  If your program drops `y`,
it gets collected without any effect on `x`.

The protocol makes one important assumption:

**VARIABLES KEEP CHANGING**

If your program creates [Var](UINext-Var.md) cells, it should either:

* keep updating them

* drop them so they get collected

* explicitly mark them as finalized by `Var.SetFinal` - very rarely needed

If your program violates these rules, and dynamically continues creating new views on
violating variables, and observing these views, you will obtain a memory leak.
This happens when view update processes sit waiting for a `Var` to change,
preventing GC from collecting them.

In practice, it is fairly difficult to accidentally construct a leaking program.

We might improve the protocol and GC properties in the future by employing advanced
implementation techniques with weak pointers.


```
---


## File: docs/UINext-ListModel.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-ListModel.md

```md
# ListModel
> [UI.Next Documentation](UINext.md) ▸ [API Reference](UINext-API.md) ▸ [Dataflow](UINext-Dataflow.md) ▸ **ListModel**

`ListModel` provides helpers for time-varying lists.
You could accomplish the same by creating a `ResizeArray`
wrapped in a [Model](UINext-Model.md).

```fsharp
namespace WebSharper.UI.Next

type ListModel<'Key,'T when 'Key : equality> =
    member Add : 'T -> unit
    member Remove : 'T -> unit
    member RemoveBy : ('T -> bool) -> unit
    member RemoveByKey : 'Key -> unit
    member Iter : ('T -> unit) -> unit
    member Set : seq<'T> -> unit
    member ContainsKey : 'Key -> bool
    member ContainsKeyAsView : 'Key -> View<bool>
    member Find : ('T -> bool) -> 'T
    member TryFind : ('T -> bool) -> 'T option
    member FindAsView : ('T -> bool) -> View<'T>
    member TryFindAsView : ('T -> bool) -> View<'T option>
    member FindByKey : 'Key -> 'T
    member TryFindByKey : 'Key -> 'T option
    member FindByKeyAsView : 'Key -> View<'T>
    member TryFindByKeyAsView : 'Key -> View<'T option>
    member UpdateAll : ('T -> 'T option) -> unit
    member UpdateBy : ('T -> 'T option) -> 'Key -> unit
    member Clear : unit -> unit
    member Length : int
    member LengthAsView : View<int>

type ListModel =
    static member Create<'Key,'T when 'Key : equality> : ('T -> 'Key) -> seq<'T> -> ListModel<'Key,'T>
    static member FromSeq<'T when 'T : equality> : seq<'T> -> ListModel<'T,'T>
    static member View : ListModel<'Key,'T> -> View<seq<'T>>
    static member Key : ListModel<'Key, 'T> -> ('T -> 'Key)
```

<a name="ListModel">#</a>

[#](#ListModel) **ListModel** `type ListModel<'K,'T>`

Represents a time-varying list-like collection.  The key type is made a parameter
to simplify working with equality.

<a name="Add"></a>

[#](#Add) m.**Add** : `'T -> unit`

Adds an item to the model.

<a name="Remove"></a>

[#](#Remove) m.**Remove** : `'T -> unit`

Removes an item from the model.

<a name="RemoveBy"></a>

[#](#RemoveBy) m.**RemoveBy** : `('T -> bool) -> unit`

Removes all items from the model that match a condition.

<a name="RemoveByKey"></a>

[#](#RemoveByKey) m.**RemoveByKey** : `'Key -> unit`

Removes the item from the model that has the given key.

<a name="Iter"></a>

[#](#Iter) m.**Iter** : `('T -> unit) -> unit`

Applies a function to each item in the model.

<a name="Set"></a>

[#](#Set) m.**Set** : `seq<'T> -> unit`

Entirely replaces the list with a new one.

<a name="ContainsKey"></a>

[#](#ContainsKey) m.**ContainsKey** : `'Key -> bool`

Checks if the model contains an item with the given key.

<a name="ContainsKeyAsView"></a>

[#](#ContainsKeyAsView) m.**ContainsKeyAsView** : `'Key -> View<bool>`

Gets a view that checks if the model contains an item with the given key.

<a name="Find"></a>

[#](#Find) m.**Find** : `('T -> bool) -> 'T`

Finds an item in the list that satisfies the given predicate. Throws an exception if there is none.

<a name="TryFind"></a>

[#](#TryFind) m.**TryFind** : `('T -> bool) -> option<'T>`

Finds an item in the list that satisfies the given predicate. Returns None if there is none.

<a name="FindAsView"></a>

[#](#FindAsView) m.**FindAsView** : `('T -> bool) -> View<'T>`

Gets a view that finds an item in the list that satisfies the given predicate. Throws an exception if there is none.

<a name="TryFindAsView"></a>

[#](#TryFindAsView) m.**TryFindAsView** : `('T -> bool) -> View<option<'T>>`

Gets a view that finds an item in the list that satisfies the given predicate. Returns None if there is none.

<a name="FindByKey"></a>

[#](#FindByKey) m.**FindByKey** : `'Key -> 'T`

Finds the item in the list with the given key. Throws an exception if there is none.

<a name="TryFindByKey"></a>

[#](#TryFindByKey) m.**TryFindByKey** : `'Key -> option<'T>`

Finds the item in the list with the given key. Returns None if there is none.

<a name="FindByKeyAsView"></a>

[#](#FindByKeyAsView) m.**FindByKeyAsView** : `'Key -> View<'T>`

Gets a view that finds the item in the list with the given key. Throws an exception if there is none.

<a name="TryFindByKeyAsView"></a>

[#](#TryFindByKeyAsView) m.**TryFindByKeyAsView** : `'Key -> View<option<'T>>`

Gets a view that finds the item in the list with the given key. Returns None if there is none.

<a name="UpdateAll"></a>

[#](#UpdateAll) m.**UpdateAll** : `('T -> 'T option) -> unit`

Updates all items with new items computed by the given function.
For items for which None is computed, nothing is done.

<a name="UpdateBy"></a>

[#](#UpdateBy) m.**UpdateBy** : `('T -> 'T option) -> 'Key -> unit`

Updates an item with the given key with another item computed by the given function.
If None is computed or the item to be updated is not found, nothing is done.

<a name="Clear"></a>

[#](#Clear) m.**Clear** : `unit -> unit`

Removes all elements of the list.

<a name="Length"></a>

[#](#Length) m.**Length** : `int`

Gets the number of elements in the list.

<a name="LengthAsView"></a>

[#](#LengthAsView) m.**LengthAsView** : `View<int>`

Gets a view of the number of elements in the list.

<a name="Create"></a>

[#](#Create) ListModel.**Create** : `('T -> 'Key) -> seq<'T> -> ListModel<'Key,'T>`

Creates a new model with a given key function and initial items.

<a name="FromSeq"></a>

[#](#FromSeq) ListModel.**FromSeq** : `seq<'T> -> ListModel<'T,'T>`

Creates a new model from an initial sequence, using intrinsic equality.

<a name="View"></a>

[#](#View) ListModel.**View** : `ListModel<'K,'T> -> View<seq<'T>>`

Returns a [View](UINext-View.md) on the model.

<a name="Key"></a>

[#](#Key) ListModel.**Key** : `ListModel<'K,'T> -> ('T -> 'Key)`

Retrieve the function that determines the key of an item.

```
---


## File: docs/UINext-Model.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Model.md

```md
# Model
> [UI.Next Documentation](UINext.md) ▸ [API Reference](UINext-API.md) ▸ [Dataflow](UINext-Dataflow.md) ▸ **Model**

Helpers for the common situation where we have an imperative model, such as a `ResizeArray`
or a `Dictionary`, and we want to observe changes to this model (as a [View](UINext-View.md)),
with coarse granularity - simply to be notified when something changes.

```fsharp
type Model<'I,'M> =
    member View : View<'I>

type Model =
    static member Create : ('M -> 'I) -> 'M -> Model<'I,'M>
    static member Update : ('M -> unit) -> Model<'I,'M> -> unit
    static member View : Model<'I,'M> -> View<'I>
```

<a name="Model"></a>

[#](#Model) **Model** `type Model<'I,'M>`

Represents an observable imperative model, where `'M` is the mutable type,
and `'I` is the immutable (view) type.

<a name="Create"></a>

[#](#Create) Model.**Create** : `('M -> 'I) -> 'M -> Model<'I,'M>`

Creates a new model, based on an initial value and a projection function
constructing an immutable view from a snapshot of the mutable value.

<a name="Update"></a>

[#](#Update) Model.**Update** : `('M -> unit) -> Model<'I,'M> -> unit`

Imperatively updates the state of the model.  This change is propagated.

<a name="View"></a>

[#](#View) Model.**View** : `Model<'I,'M> -> View<'I>`

Returns the immutable [View](UINext-View.md) on the model.  Also `model.View`.

```
---


## File: docs/UINext-Monoids.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Monoids.md

```md
# Monoids
> [UI.Next Documentation](UINext.md) ▸ **Monoids**

It is a deliberate choice to model [Doc](UINext-Doc.md), [Attr](UINext-Attr.md) and other types
as monoids when appropriate.  To recap, a monoid is a simple algebraic
structure defined by an operation `+` and a unit element `0` such that:

    a + (b + c) = (a + b) + c
    a + 0 = a
    0 + a = a

In this library, if a type `T` follows the monoid pattern, it will have
the following methods, corresponding to `+` and `0`:

    T.Append : T -> T -> T
    T.Empty : T
    
It will also have a derived helper method `Concat`:

    T.Concat : seq<T> -> T

For example, on [Doc](UINext-Doc.md) and [Attr](UINext-Attr.md):

```fsharp
val Doc.Concat : seq<Doc> -> Doc
val Attr.Concat : seq<Attr> -> Doc
```

Having a single `Concat` operation lets users write code naturally,
without worrying components such as `x`, `y`, and `z` are nodes or
node-lists, attributes or attribute lists:

```fsharp
UL [x; y; z]
```

In the context of DOM, this decision has grown out of frustration with previous HTML
combinators in WebSharper, which made a distinction between nodes and
node-lists in types, and often required `yield` and `yield!`
annotations in code.

Type-level distinctions are only helpful for pattern-matching or
destructuring, which our combinators do not allow.  For purely
generative APIs, a single type with monoid operations is perfect.

For another example, consider how having a unified type also works
well with dynamic fragments.  Here is a dynamic fragment that is
either a node-list or empty:

```fsharp
let model = Var.Create true
let view =
  model.View
  |> View.Map (fun x ->
    if x then
      Doc.Concat [
        hr []
        text "ok"
      ]
    else
      Doc.Empty)
  |> Doc.EmbedView
div [ view ]
```

```
---


## File: docs/UINext-NormalizedTime.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-NormalizedTime.md

```md
# NormalizedTime
> [UI.Next Documentation](UINext.md) ▸ [API Reference](UINext-API.md) ▸ [Animation](UINext-Animation.md) ▸ **NormalizedTime**

Normalized time typically ranges from 0.0 to 1.0, though can
temporarily take values outside of this range.  It is used heavily
in animation.  Implemented as a type alias:

```fsharp
namespace WebSharper.UI.Next

type NormalizedTime = double
```

```
---


## File: docs/UINext-Notation.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Notation.md

```md
# Notation
> [UI.Next Documentation](UINext.md) ▸ [API Reference](UINext-API.md) ▸ **Notation**

The Notation module provides infix operators to make UI.Next code more concise.
To use, you need to:

`open WebSharper.UI.Next.Notation`

Note that `!` and `:=` still work for `ref` as usual, even when overloaded.

* `!x` for [Var.Get](UINext-Var.md#Get) - `Var.Get x` 
* `x := y` for [Var.Set](UINext-Var.md#Set) - `Var.Set x y`
* `x <~ f` for [Var.Update](UINext-Var.md#Update) - `Var.Update x f`
* `x |>> f` for [View.Map](UINext-View.md#Map) - `View.Map f x`
* `f <*> x` for [View.Apply](UINext-View.md#Apply) - `View.Apply f x`

```
---


## File: docs/UINext-RouteMap.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-RouteMap.md

```md
# RouteMap
> [UI.Next Documentation](UINext.md) ▸ [API Reference](UINext-API.md) ▸ **RouteMap**

A RouteMap represents a bijection bewteen a URL route and a typed value.
It is used by [Router](UINext-Router.md), but can also be installed independently
to tie the browser's current hash (`document.location.href`) to a typed reactive
variable.

Routes are represented as `list<string>`.  When converting to and from URL hashes,
the framework automatically encodes the strings using `encodeUriComponent`
and `decodeUriComponent`.  All non-null values are therefore supported.

```fsharp
namespace WebSharper.UI.Next

type RouteMap<'T>
type RouteMap =
    static member Create : ('T -> list<string>) -> (list<string> -> 'T) -> RouteMap<'T>
    static member Install : RouteMap<'T> -> Var<'T>
```

<a name="RouteMap"></a>

[#](#RouteMap) **RouteMap** `type RouteMap<'T>`

A bijection between an URL route and a value of the given type.

<a name="Install"></a>

[#](#Install) RouteMap.**Install** : `RouteMap<'T> -> Var<'T>`

Installs a map to observe and modify the browser's current hash route (`document.location.hash`).
This should be called once per application, as the current URL is a shared resource.


```
---


## File: docs/UINext-Router.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Router.md

```md
# Router
> [UI.Next Documentation](UINext.md) ▸ [API Reference](UINext-API.md) ▸ **Router**

Routers facilitate organizing sub-sites into an implicit Trie, taking care of
propagating changes between current browser hash-route (URL part) and the logical
"place" in a site.

```fsharp
namespace WebSharper.UI.Next

type RouteId
type Router<'T>

type Router =

    static member Dir : prefix: string -> seq<Router<'T>> -> Router<'T>
    static member Merge : seq<Router<'T>> -> Router<'T>
    static member Prefix : prefix: string -> Router<'T> -> Router<'T>
    static member Route : RouteMap<'A> -> 'A -> (RouteId -> Var<'A> -> 'T) -> Router<'T>

    static member Install : ('T -> RouteId) -> Router<'T> -> Var<'T>
```

## Types

<a name="Router"></a>

[#](#Router) **Router** `type Router<'T>`

A composable site component.  The type `'T` represents an
application-specific object identifying currently selected route.

<a name="RouteId"></a>

[#](#RouteId) **RouteId** : `type RouteId`

An identifier for a given route.  Typically embedded into `'T` as a field.

## Constructing

<a name="Route"></a>

[#](#Route) Router.**Route** : `RouteMap<'A> -> 'A -> (RouteId -> Var<'A> -> 'T) -> Router<'T>`

Constructs a simple Router from a [RouteMap](UINext-RouteMap.md), an initial value, and a handler.
Note that the handler can interact with (observe and set) a reactive [Var](UINext-Var.md) representing
the current action.  This is implicitly tied to the hash-route of the current URL.

## Using

<a name="Install"></a>

[#](#Install) Router.**Install** : `('T -> RouteId) -> Router<'T> -> Var<'T>`

Used once per application, this method installs a router as the global router.
The returned reactive [Var](UINext-Var.md) allows observing and setting the currently selected route.
The `'T -> RouteId` key function is needed to identify route objects.

## Combining

<a name="Prefix"></a>

[#](#Prefix) Router.**Prefix** : `string -> Router<'T> -> Router<'T>`

Modifies the router URL space so that its URLs become shifted by the prefix.

<a name="Merge"></a>

[#](#Merge) Router.**Merge** : `seq<Router<'T>> -> Router<'T>`

Merges multiple routers into one.  May throw an exception if they are not sufficiently
disambiguated by `Prefix`.

<a name="Dir"></a>

[#](#Dir) Router.**Dir** : `string -> seq<Router<'T>> -> Router<'T>`

A shorthand for creating a virtual directory from routers. Defined by:

```fsharp
Router.Dir prefix sites = Router.Prefix prefix (Router.Merge sites)
```





```
---


## File: docs/UINext-Sharing.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Sharing.md

```md
# Sharing
> [UI.Next Documentation](UINext.md) ▸ **Sharing**

We opt for explicit ML-style sharing (handling of identity).  F#
programmers would know the difference between these two code
fragments:

```fsharp
let r = ref ()
fun () -> f r

fun () ->
    let r = ref ()
    f r
```

Similarly to ref cells, [Var](UINext-Var.md), [Doc](UINext-Doc.md) and [View](UINext-View.md)
values have identity that matters.  For DOM nodes this is used to
encapsulate widget state.  `Var` are observable ref cells, so this
approach is natural for them.  For the `View` layer, ML-style sharing
allows constructing efficient dataflow graphs.

```
---


## File: docs/UINext-Submitter.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Submitter.md

```md
# Submitter
> [UI.Next Documentation](UINext.md) ▸ [API Reference](UINext-API.md) ▸ [Dataflow](UINext-Dataflow.md) ▸ **Submitter**

`Submitter<'T>` is a special kind of input node in the [Dataflow](UINext-Dataflow.md)
layer. Its purpose is to allow punctual events such as, typically, button
clicks, to participate in the graph.

The purpose of a submitter is to provide a [View](UINext-View.md) which gets its value
from a given input view, but only gets updated when punctual events are
`Trigger`ed.

```fsharp
type Submitter<'T> =
    member View : View<'T>
    member Trigger : unit -> unit
    member Input : View<'T>

type Submitter =
    static member Create : input: View<'T> -> init: 'T -> Submitter<'T>
    static member View : Submitter<'T> -> View<'T>
    static member Trigger : Submitter<'T> -> unit
    static member Input : Submitter<'T> -> View<'T>
```

<a name="Create"></a>

[#](#Create) Submitter.**Create** : `input: View<'T> -> init: 'T -> Submitter<'T>`

Create a submitter for the given input [View](UINext-View.md). The initial value of the
submitter's output `View` is `init`. Then, every time `Trigger` is called, the
value of the output `View` is updated to be the current value of `input`.

<a name="View"></a>

[#](#View) submitter.**View** : `View<'T>`

Get the output view of a submitter.

<a name="Trigger"></a>

[#](#Trigger) submitter.**Trigger** : `unit -> unit`

Trigger a submitter, causing its output view to get the value from its input view.

<a name="Input"></a>

[#](#Input) submitter.**Input** : `View<'T>`

Get the input view of a submitter.

<a name="SView"></a>

[#](#SView) Submitter.**View** : `Submitter<'T> -> View<'T>`

Equivalent to <a href="#View">submitter.View</a>.

<a name="STrigger"></a>

[#](#STrigger) Submitter.**Trigger** : `Submitter<'T> -> unit`

Equivalent to [submitter.Trigger()](#Trigger).

<a name="SInput"></a>

[#](#SInput) Submitter.**Input** : `Submitter<'T> -> View<'T>`

Equivalent to [submitter.Input](#Input).

```
---


## File: docs/UINext-Templates.3.x.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Templates.3.x.md

```md
# Templates
> [UI.Next Documentation](UINext.md) ▸ DOM ▸ [Templates](UINext-Templates.md)

> This is the documentation for UI.Next templates up to WebSharper 4.0 beta5.
> For newer versions, see [here](UINext-Templates.md)

UI.Next provides a type provider to create `Doc` fragments from an HTML file.
The HTML file can contain a number of special attributes and text that specify
holes to be filled in F# code, or sub-templates that can be instanciated.

It is important to note that all the parsing and conversion work is done at
compile time; what is present in the compiled JavaScript code is actual nested
calls to `Doc` methods that create the appropriate node tree.

Templates are usable both on the client side and the server side; however a
number of holes described below cannot be used on the server side. See
[client vs server](UINext-ClientServer.md) for a discussion of what is possible on
either side.

## Template syntax

Templates can be full HTML pages (with optional DTD or xml declaration), or
they can be a fragment comprised of several consecutive elements.

Here are the special attributes and text bits that are interpreted by the
templating engine:

* Text holes:

    * **`${Name}`** is a hole of type `string`. It can be located either in
      text content, or in the value of an attribute.
    * **`$!{Name}`** is a hole of type `View<string>`. It can also be located
      either in text content, or in the value of an attribute.

    You can have several `${holes}` with the same name, or several `$!{holes}`
    with the same name, and they will reflect the same content.

* Doc holes:

    * **`data-replace="Name"`** is a hole of type `seq<Doc>`. The element on
      which this attribute is placed will be replaced with the sequence of
      `Doc`s passed in F# code.
    * **`data-hole="Name"`** is a hole of type `seq<Doc>`. The _children_ of
      the element on which this attribute is placed will be replaced with the
      sequence of `Doc`s passed in F# code.

    Holes named `scripts`, `meta` and `styles` (ignoring case) have special
    significance to WebSharper's server-side page rendering, and are therefore
    ignored by the UI.Next templating.

* Vars:

    * **`data-var="Name"`** is a hole for a `Var<'T>` to be placed on a form
      element. The exact type of `Var` depends on the element it is placed on:

        * If the element is an `<input type="text">`, an `<input>` with no or
          unrecognized `type` attribute, or a `<textarea>`, then the hole is a
          `Var<string>`.
        * If the element is an `<input type="number">`, then the hole is a
          `Var<float>`.
        * If the element is an `<input type="checkbox">`, then the hole is a
          `Var<bool>`.
        * If the element is a `<select>`, then the hole is a `Var<string>`
          corresponding to the `value` of `<option>` children.

    If a `$!{hole}` has the same name as a `data-var` of type `Var<string>`,
    then the hole's view will automatically match the `Var` and the argument to
    pass to the template to fill both holes is the `Var`.

* Attributes:

    * **`data-attr="Name"`** is a hole of type `Attr`. It is especially useful
      to insert attributes that will be dynamically added and removed, or
      animated.
    * Attributes that only have their value varying can also be created simply
      by using `${Name}` or `$!{Name}` as part of their value.

* Event handlers:

    * **`data-event-click="Name"`** (or any other event name instead of
      `click`) is a hole of type `Dom.Element -> Dom.Event -> unit`.

* Sub-templates:

    * **`data-template="Name"`** is a sub-template named `Name`. The element on
      which this attribute is placed will not be inserted into the final
      document, but it will be available as a template to be instanciated (see
      "Invoking the type provider" below).
    * **`data-children-template="Name"`** is a sub-template named `Name`. The
      _children_ of the element on which this attribute is placed will not be
      inserted into the final document, but they will be available as a
      template to be instanciated (see "Invoking the type provider" below).

    It is possible for an element to be at the same time a hole and a template.
    For example, the following snippet is a table whose body will be filled by
    `TableBody`, and a separate sub-template for table rows:

    ```html
    <table>
      <tbody data-hole="TableBody" data-children-template="TableRow">
        <tr>
          <td>${Name}</td>
          <td>${Age}</td>
        </tr>
      </tbody>
    </table>
    ```

## Invoking the type provider

To create a template, simply call the type provider with a file name:

```fsharp
open WebSharper.UI.Next.Templating

type MyPage = Template<"myPage.html">
```

Once this is done, the template is available as a method named `MyPage.Doc`,
with named arguments for all the holes and handlers. Sub-templates are
available as properties on `MyPage`, themselves with a `Doc` method with named
arguments for their own holes and handlers.

## Example

Here is a sample HTML template for a table of people names and ages, and a
small form to add new people:

```xml
<h1>People</h1>
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Age</th>
    </tr>
  </thead>
  <tbody data-hole="TableBody">
    <tr data-template="TableRow">
      <td>${Name}</td>
      <td>${Age}</td>
      <td><button data-event-click="Remove">Remove</button></td>
    </tr>
  </tbody>
</table>
<h1>Add a person</h1>
<p>
  <label>Name: <input data-var="AddPersonName" /></label>
</p>
<p>
  <label>Age: <input data-var="AddPersonAge" type="number" /></label>
</p>
<p>
  <button data-attr="AddPersonSubmit">Add person</button>
</p>
```

And the associated F# code:

```fsharp
open WebSharper
open WebSharper.UI.Next
open WebSharper.UI.Next.Html
open WebSharper.UI.Next.Templating

[<JavaScript>]
module ClientCode =
    open WebSharper.JavaScript
    open WebSharper.UI.Next.Client

    type MyPage = Template<"myPage.html">

    let people =
        ListModel.Create fst [
            "John", 42.
            "Phil", 37.
        ]

    let addPersonName = Var.Create ""
    let addPersonAge = Var.Create 0.
    let addPerson = View.Map2 (fun n a -> (n, a)) addPersonName.View addPersonAge.View

    let myDocument =
        MyPage.Doc(
            TableBody = [
                people.View |> Doc.ConvertBy people.Key (fun (name, age) ->
                    MyPage.TableRow.Doc(
                        Name = name,
                        Age = string age,
                        Remove = (fun _ _ -> people.RemoveByKey name)
                    )
                )
            ],
            AddPersonName = addPersonName,
            AddPersonAge = addPersonAge,
            AddPersonSubmit = on.clickView addPerson (fun _ _ person -> people.Add person)
        )
```

```
---


## File: docs/UINext-Templates.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Templates.md

```md
# Templates
> [UI.Next Documentation](UINext.md) ▸ DOM ▸ [Templates](UINext-Templates.md)

> This is the documentation for UI.Next templates as of WebSharper 4.0 beta6. For older versions, see [here](UINext-Templates.3.x.md)

UI.Next provides a type provider to create `Doc` fragments from an HTML file. The HTML file can contain a number of special attributes and text that specify holes to be filled in F# code, or sub-templates that can be instantiated.

It is important to note that all the parsing and conversion work is done at compile time; what is present in the compiled JavaScript code is actual nested calls to `Doc` methods that create the appropriate node tree.

Templates are usable both on the client side and the server side; however a number of holes described below cannot be used on the server side. See [client vs server](UINext-ClientServer.md) for a discussion of what is possible on either side.

## Template syntax

Templates can be full HTML pages (with optional DTD or xml declaration), or they can be a fragment comprised of several consecutive elements.

> Template syntax has changed in UI.Next 4.0-beta6. Here is a summary of the changes for earlier users:
>
>  * `data-xyz` attributes are now called `ws-xyz`;
>
>  * `data-event-xyz` attributes are now called `ws-onxyz`;
>
>  * `$!{xyz}` holes are removed, instead `${xyz}` is used for both `string` and `View<string>` holes.
>
>  * You can [use a template from another template directly in HTML](#include).

Here are the special attributes and text bits that are interpreted by the templating engine:

* Text holes: **`${Name}`** is a hole for string values. It can be located either in text content, or in the value of an attribute.

    Such a hole can be filled with a value of type `string` or `View<string>`.

    You can have several `${holes}` with the same name, and they will reflect the same content.

* Doc holes:

    * **`ws-replace="Name"`** is a hole for `Doc`s. The element on which this attribute is placed will be replaced with the `Doc` passed in F# code.

    * **`ws-hole="Name"`** is a hole for `Doc`s. The _children_ of the element on which this attribute is placed will be replaced with the `Doc` passed in F# code.

    Such holes can be filled with a value of type `Doc` or `seq<Doc>`.

    Holes named `scripts`, `meta` and `styles` (ignoring case) have special significance to WebSharper's server-side page rendering, and are therefore ignored by the UI.Next templating.

* Vars:

    * **`ws-var="Name"`** is a hole for a reactive variable to be placed on a form element.

      Such a hole can be filled with a value of type `IRef<'T>` (for example, a `Var<'T>`). The exact type of variable depends on the element it is placed on:

        * If the element is an `<input type="text">`, an `<input>` with no or unrecognized `type` attribute, or a `<textarea>`, then the hole is a `IRef<string>`.
        * If the element is an `<input type="number">`, then the hole is a number, ie. either `IRef<float>` or `IRef<int>`.
        * If the element is an `<input type="checkbox">`, then the hole is a `IRef<bool>`.
        * If the element is a `<select>`, then the hole is an `IRef<string>` corresponding to the `value` of `<option>` children.

    If a `${hole}` has the same name as a `data-var`, then the hole's view will automatically match the `IRef` and the argument to pass to the template to fill both holes is the `IRef`.

* Attributes:

    * **`ws-attr="Name"`** is a hole for attributes. It is especially useful to insert attributes that will be dynamically added and removed, or animated.

      Such a hole can be filled with a value of type `Attr` or `seq<Attr>`.

    * Attributes that only have their value varying can also be created simply by using `${Name}` as part of their value.

* Event handlers:

    * **`ws-onclick="Name"`** (or any other event name instead of `click`) is a hole for event handlers.

      Such a hole can be filled with a value of type `unit -> unit` or `Dom.Element -> Dom.Event -> unit`.

* Sub-templates:

    * **`ws-template="Name"`** is a sub-template named `Name`. The element on which this attribute is placed will not be inserted into the final document, but it will be available as a template to be instantiated (see "Invoking the type provider" below).
    * **`ws-children-template="Name"`** is a sub-template named `Name`. The _children_ of the element on which this attribute is placed will not be inserted into the final document, but they will be available as a template to be instantiated (see "Invoking the type provider" below).

    It is possible for an element to be at the same time a hole and a template. For example, the following snippet is a table whose body will be filled by `TableBody`, and a separate sub-template for table rows:

    ```html
    <table>
      <tbody data-hole="TableBody" data-children-template="TableRow">
        <tr>
          <td>${Name}</td>
          <td>${Age}</td>
        </tr>
      </tbody>
    </table>
    ```

* <a name="include">Include other templates:</a>

    You can also include another template in your HTML. This is done by inserting an HTML node named `<ws-Name>`, where `Name` is the name of the template to include.

    > Note: including templates is currently only available on the client side.

    Here is an example defining a widget for a Bootstrap text input, and using it in a login form:
    
    ```html
    <div ws-template="Input" class="form-group">
        <label for="${Id}">${Label}</label>
        <input type="${Type}" class="form-control" id="${Id}" ws-var="Var" />
    </div>
    
    <form ws-template="LoginForm">
        <ws-Input Var="EmailVar">
            <Id>exampleInputEmail</Id>
            <Label>Email address</Label>
            <Type>email</Type>
        </ws-Input>
        <ws-Input Var="PasswordVar">
            <Id>exampleInputPassword</Id>
            <Label>Password</Label>
            <Type>password</Type>
        </ws-Input>
        <button type="submit" class="btn">Submit</button>
    </form>
    ```

    * Attributes on the `<ws-*>` element define a hole _mapping_, which means that they define a hole for the template being defined that maps to a hole of the template being included. In the above example, `LoginForm` has two holes, `EmailVar` and `PasswordVar`, which correspond to the respective `Var` holes of the two included `Input`s.
    
        As a shorthand, an empty-valued attibute `Foo` is equivalent to `Foo="Foo"`.
    
    * Child nodes define a hole _filling_, which means that they define the content to put in a hole of the template being included. In the above example, the `Id`, `Label` and `Type` holes of `Input` are filled with text content.
    
        Not all kinds of holes can be filled this way. Here are the possible fillings:

        * Doc holes, ie. `ws-replace` and `ws-hole`, are filled with the children of the filling element:
        
            ```html
            <div ws-template="Container" class="container">
                <div ws-replace="Content"></div>
            </div>
            
            <ws-Container>
                <Content><p>Lorem ipsum dolor sit amet.</p></Content>
            </ws-Container>
            
            <!-- The above is equivalent to: -->
            <div class="container">
                <p>Lorem ipsum dolor sit amet.</p>
            </div>
            ````
            
        * Text holes, ie. `${Name}`, are filled with the content of the filling node, provided that it is entirely text content:
        
            ```html
            <div ws-template="Container" class="container">
                <p>${Content}</p>
            </div>
            
            <ws-Container>
                <Content>Lorem ipsum dolor sit amet.</Content>
            </ws-Container>
            
            <!-- The above is equivalent to: -->
            <div class="container">
                <p>Lorem ipsum dolor sit amet.</p>
            </div>
            ````
            
            As a shorthand, if a template has no Doc holes and only one text hole, then you can fill it without specifying the hole name. For example, the above could also be written:
            
            ```html
            <ws-Container>Lorem ipsum dolor sit amet.</ws-Container>
            ```
        
        * Attribute holes, ie. `ws-attr`, are filled with the attributes of the filling element. The element should have no children:
        
            ```html
            <div ws-template="Container" class="container" ws-attr="Attrs">
                <p>Lorem ipsum dolor sit amet.</p>
            </div>
            
            <ws-Container>
                <Attrs class="custom-container" id="#my-container" />
            </ws-Container>
            
            <!-- The above is equivalent to: -->
            <div class="container custom-container" id="#my-container">
                <p>Lorem ipsum dolor sit amet.</p>
            </div>
            ```
            
            Note how `class` attributes are combined. Other attributes replace existing ones.
            
        * Of course, all these fillings can define holes of their own. A text filling can contain a `${TextHole}`, an attribute filling can contain an attribute hole such as `ws-attr` or `ws-var`, and a Doc filling can contain any kind of hole.
        
    * If you use [multiple files](#multiple-files), you can include a template from another file with the following syntax: `<ws-fileName.templateName>`.

## Invoking the type provider

To create a template, simply call the type provider with a file name:

```fsharp
open WebSharper.UI.Next.Templating

type MyPage = Template<"myPage.html">
```

Instantiating this template is done as follows:

* Call the constructor on the `MyPage` class. If you want to instantiate a sub-template, they are available as nested classes under `MyPage`.

* Chain calls to methods on the `MyPage` value to fill holes.

* Call `.Doc()` to complete the instantiation. This returns a `Doc` that contains the instantiated template.

See "Example" below for a code sample.

<a name="multiple-files"></a>
### Multiple files

You can also pass multiple files, separated by commas:

```fsharp
open WebSharper.UI.Next.Templating

type MyPage = Template<"myPage.html,widgets.html">
```

In this case, each file is represented by a nested class under `MyPage`. This nested class's name is the file's name excluding any directory components and the following extensions: `.htm`, `.html`, `.ui.next.htm` or `.ui.next.html`.

### Optional parameters

In addition to the path to the template file, the type provider takes two optional parameters which drive how and when the actual HTML content is loaded.

* `clientLoad` defines how the template is loaded when used in client-side code. Its possible values are:

    * `ClientLoad.Inline` embeds the HTML into the compiled JavaScript.

    * `ClientLoad.FromDocument` assumes that the template file is the main document at runtime, and loads the templates directly from the DOM.

      In this mode of operation, you can only use child templates; trying to instantiate the main template will fail.

      The main advantage of using `FromDocument` is that you can edit your HTML file and see these changes reflected immediately without recompiling the application.
      
      If you use `FromDocument` with [multiple files](#multiple-files), then the first file is loaded from the DOM and the other ones are loaded as if `Inline`.

* `serverLoad` defines how the template is loaded when used in server-side code. Its possible values are:

    * `ServerLoad.Once` loads the file once on startup and keeps it in memory.

    * `ServerLoad.WhenChanged` watches the file and reloads it when it changes.

    * `ServerLoad.PerRequest` reloads the file on every use.

* `legacyMode` defines which templating syntax is actually used. Its possible values are:

    * `LegacyMode.Old` only parses templates using [the old 3.x syntax](UINext-Templates.3.x.md) (`data-*` attributes, etc).

    * `LegacyMode.New` only parses templates using the 4.x syntax described in this document.
    
    * `LegacyMode.Both` (the default) tries to parse both syntaxes.

## Example

Here is a sample HTML template for a table of people names and ages, and a small form to add new people:

```xml
<h1>People</h1>
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Age</th>
    </tr>
  </thead>
  <tbody ws-hole="TableBody">
    <tr ws-template="TableRow">
      <td>${Name}</td>
      <td>${Age}</td>
      <td><button ws-onclick="Remove">Remove</button></td>
    </tr>
  </tbody>
</table>
<h1>Add a person</h1>
<p>
  <label>Name: <input ws-var="AddPersonName" /></label>
</p>
<p>
  <label>Age: <input ws-var="AddPersonAge" type="number" /></label>
</p>
<p>
  <button ws-attr="AddPersonSubmit">Add person</button>
</p>
```

And the associated F# code:

```fsharp
open WebSharper
open WebSharper.UI.Next
open WebSharper.UI.Next.Html
open WebSharper.UI.Next.Templating

[<JavaScript>]
module ClientCode =
    open WebSharper.JavaScript
    open WebSharper.UI.Next.Client

    type MyPage = Template<"myPage.html">

    let people =
        ListModel.Create fst [
            "John", 42.
            "Phil", 37.
        ]

    let addPersonName = Var.Create ""
    let addPersonAge = Var.Create 0.
    let addPerson = View.Map2 (fun n a -> (n, a)) addPersonName.View addPersonAge.View

    let myDocument =
        MyPage()
            .TableBody(
                people.View |> Doc.ConvertBy people.Key (fun (name, age) ->
                    MyPage.TableRow()
                        .Name(name)
                        .Age(string age)
                        .Remove(fun () -> people.RemoveByKey name)
                        .Doc()
                )
            )
            .AddPersonName(addPersonName)
            .AddPersonAge(addPersonAge)
            .AddPersonSubmit(on.clickView addPerson (fun _ _ person -> people.Add person))
            .Doc()
```

```
---


## File: docs/UINext-Time.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Time.md

```md
# Time
> [UI.Next Documentation](UINext.md) ▸ [API Reference](UINext-API.md) ▸ [Animation](UINext-Animation.md) ▸ **Time**

Time is a measure of a time interval in milliseconds.  It is a type alias:

```fsharp
namespace WebSharper.UI.Next

type Time = double
```

```
---


## File: docs/UINext-Trans.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Trans.md

```md
# Trans
> [UI.Next Documentation](UINext.md) ▸ [API Reference](UINext-API.md) ▸ [Animation](UINext-Animation.md) ▸ **Trans**

`Trans` type describes how to animate transitions for values of a given type. There
are three kinds of transitions:

* Change - the value has changed
* Enter - the value appears, "enters the stage"
* Exit - the value disappears, "exits the stage"

A `Trans` type describes which [Anim](UINext-Anim.md) to play for every kind of transition.

```fsharp
namespace WebSharper.UI.Next

type Trans<'T>

type Trans =
    static member Trivial : unit -> Trans<'T>
    static member Create : ('T -> 'T -> Anim<'T>) -> Trans<'T>
    static member Change : ('T -> 'T -> Anim<'T>) -> Trans<'T> -> Trans<'T>
    static member Enter : ('T -> Anim<'T>) -> Trans<'T> -> Trans<'T>
    static member Exit : ('T -> Anim<'T>) -> Trans<'T> -> Trans<'T>
    static member AnimateChange : Trans<'T> -> 'T -> 'T -> Anim<'T>
    static member AnimateEnter : Trans<'T> -> 'T -> Anim<'T>
    static member AnimateExit : Trans<'T> -> 'T -> Anim<'T>
    static member CanAnimateChange : Trans<'T> -> bool
    static member CanAnimateEnter : Trans<'T> -> bool
    static member CanAnimateExit : Trans<'T> -> bool
```

<a name="Trivial"></a>

[#](#Trivial) Trans.**Trivial** : `unit -> Trans<'T>`

Creates a trivial transition that does not animate anything.

<a name="Create"></a>

[#](#Create) Trans.**Create** : `('T -> 'T -> Anim<'T>) -> Trans<'T>`

Creates a transition that animates changes by specifying which `Anim` to play
for every change from a start to an end value.

<a name="Change"></a>

[#](#Change) Trans.**Change** : `('T -> 'T -> Anim<'T>) -> Trans<'T> -> Trans<'T>`

Functionally updates the "change" animation associated with a given transition.

<a name="Enter"></a>

[#](#Enter) Trans.**Enter** : `('T -> Anim<'T>) -> Trans<'T> -> Trans<'T>`

Functionally updates the "enter" animation associated with a given transition.

<a name="Exit"></a>

[#](#Exit) Trans.**Exit** : `('T -> Anim<'T>) -> Trans<'T> -> Trans<'T>`

Functionally updates the "exit" animation associated with a given transition.

<a name="AnimateChange"></a>

[#](#AnimateChange) Trans.**AnimateChange** : `Trans<'T> -> 'T -> 'T -> Anim<'T>`

Unpacks a "change" animation between former an current values.

<a name="AnimateEnter"></a>

[#](#AnimateEnter) Trans.**AnimateEnter** : `Trans<'T> -> 'T -> Anim<'T>`

Unpacks an "enter" animation toward a current value.

<a name="AnimateExit"></a>

[#](#AnimateExit) Trans.**AnimateExit** : `Trans<'T> -> 'T -> Anim<'T>`

Unpacks an "exit" animation from a current value.

<a name="CanAnimateChange"></a>

[#](#CanAnimateChange) Trans.**CanAnimateChange** : `Trans<'T> -> bool`

Checks if a "change" animation is specified. This is primarily used internally for optimization.

<a name="CanAnimateEnter"></a>

[#](#CanAnimateEnter) Trans.**CanAnimateEnter** : `Trans<'T> -> bool`

Checks if an "enter" animation is specified. This is primarily used internally for optimization.

<a name="CanAnimateExit"></a>

[#](#CanAnimateExit) Trans.**CanAnimateExit** : `Trans<'T> -> bool`

Checks if an "exit" animation is specified. This is primarily used internally for optimization.

```
---


## File: docs/UINext-Tutorial.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Tutorial.md

```md
# Tutorial
> [UI.Next Documentation](UINext.md) ▸ **Tutorial**

In this tutorial, we will take you through all the basics of using
UI.Next.  This will be done entirely by example: you should get
introduced to everything you need along the way.

## Text Box

Probably the very simplest application we could create is one with an
input box and a label, where the label mirrors the text from the input
box.  See it [in
action](http://intellifactory.github.io/websharper.ui.next.samples/#samples/samples/SimpleTextBox).

What we need to do firstly is specify a [reactive variable](UINext-Var.md),
which holds the string specified by the input box.

```fsharp
let rvText = Var.Create ""
```

A reactive variable is the basic building block of an application in
UI.Next.  You can think of this a bit like an F# reference cell, but
with one important difference: we can define *views* on Var, which
allow us to observe it as it changes.  We will get to that in a
second.

The next thing to do is to make an input box, tying it to the variable
we have just created.  This means that the input box synchronises with
the variable: whenever a user changes the text in the box, `rvText`
gets updated.  Conversely, if anything else modifies `rvText`, then
the value of the box will be updated to reflect this.

```fsharp
let inputField = Doc.Input [] rvText
``` 

We also want a label which displays the input.  Notice that we can get
a view of the variable using the `.View` member.  This gives a value
of type `View<string>` of `rvText`, which is accepted by
`textView` function to build a DOM text node tied to the view.

```fsharp
let label = textView rvText.View
```

Now, `label` is of type [Doc](UINext-Doc.md), yet still refers to a
time-changing variable.  This means that once it is part of the bigger
tree, whenever `rvText` changes, so will this node.  Finally, we wrap
it all up in a couple of `<div/>` elements, and then run it in a
`<div/>` called `#main`.

```fsharp
open WebSharper
open WebSharper.UI.Next
open WebSharper.UI.Next.Html
open WebSharper.UI.Next.Client

let Main () =
  let rvText = Var.Create ""
  let inputField = Doc.Input [] rvText
  let label = textView rvText.View
  let copyTheInput =
    divAttr [attr.``class`` "panel-default"] [
      divAttr [attr.``class`` "panel-body"] [
        div [inputField]
        div [label]
      ]
    ]
  Doc.RunById "main" copyTheInput
```

And we are done!

## Transform-the-Input

The label in the previous example copied the input text as-is.  What
about if we wanted to display this input text in different ways, such
as capitalised?  Or even the number of different words that were
typed?

Luckily, [View](UINext-View.md) layer provides different combinators we can
use to do just this. We start by making a `Var` and an input box as
before:

```fsharp
let rvText = Var.Create ""
let input = Doc.Input [] rvText
```

The difference here comes with the different ways we are viewing the
input text.  To do this, we create a view, and then we use `Map` to
alter the view.  You will notice in one part we create a `View<int>`
for the number of words: we can then use this for further views to
determine whether or not the number of words is odd or even, for
example:

```fsharp
let view = rvText.View

let viewCaps =
  view |> View.Map (fun s -> s.ToUpper () )

let viewReverse =
  view |> View.Map (fun s -> new string ((s.ToCharArray ()) |> Array.rev))

let viewWordCount =
  view |> View.Map (fun s -> s.Split([| ' ' |]).Length)

let viewWordCountStr =
  View.Map string viewWordCount

let viewWordOddEven =
  View.Map (fun i -> if i % 2 = 0 then "Even" else "Odd") viewWordCount
```

Finally, we embed these into table rows and hook everything up. This
is done exactly as before -- we use the views we have created when
creating the `textView`s. You can find the source
[here](https://github.com/intellifactory/websharper.ui.next.samples/blob/master/src/InputTransform.fs).

## Making a To-Do List Application

Now we know the basics, we can have a look at a slightly bigger
application: the de-facto "Hello World" of reactive frameworks, a
to-do list!

### Specification and Analysis

Firstly, let us lay out exactly what we want:

* A list of to-do items

* A form to create new to-do items, and add them to the list

* We should be able to mark a to-do item as done, and additionally
  remove it from the list

* If a to-do item is marked as done, it should be displayed
  differently

Now, in UI.Next terms, let us think of how this will fit into our
model. Since we are able to mark a to-do item as done, this means that
a *to-do item can vary with time*, and therefore some parts of the
model of the item will have to be a `Var`. Secondly, since we can add
and remove items from the to-do list, the *list itself will vary with
time*.  To encode this, we will use a helper ListModel type, which
provides a facility to similar to an observable `ResizeArray`.

### Creating the Model

To start off with, we want a to-do item, consisting of three things:
the content, a `Var<bool>` signifying whether the task has been done,
and some unique key.

```fsharp
type TodoItem =
    {
        Done : Var<bool>
        Key : Key
        TodoText : string
    }
```

`Key` is a simple unique label.  Let us provide a constructor:

```fsharp
type TodoItem with
  static member Create s =
    { Key = Key.Fresh (); TodoText = s; Done = Var.Create false }
```

Our Model will be simply a list of `TodoItem`, identified by `Key`:

```fsharp
type Model =
  {
    Items : ListModel<Key,TodoItem>
  }

let CreateModel () =
  { Items = ListModel.Create (fun item -> item.Key) [] }
```

### Rendering the Model

So far, we have a model of each to-do item, a way of creating them,
and a time-varying collection which compares items by their unique
`Key`.  The next thing to do is create the components which manipulate
and display the list of items.

#### Displaying the items

As in our specification, each item should be displayed differently if
it has been marked as completed -- in this case, we will display the
item text with a strikethrough if it has been done.  Additionally, we
will display each item as a row in a table, and have buttons to either
mark the item as being done, or to remove it from the list completely.

In order to specify a view, we will make use of the [Doc](UINext-Doc.md)
module.  As we discussed earlier, this module provides multiple
helpers to create reactive DOM elements.  In particular, we will use
`Doc.Element` to create an element, and `Doc.Button` to create a
button.

Since these API calls are quite flexible and we often do not need all
of the parameters, and also because typing the names can be a tad
repetitive, it is often useful to create some convenience functions.

```fsharp
/// Input box backed by a variable x
let input x = Doc.Input [attr.``class`` "form-control"] x

/// Button with a given caption and handler
let button name handler =
  Doc.Button name [attr.``class`` "btn btn-default"] handler
```

##### Rendering an Item

Here is an outline of our `RenderItem` function, which takes a
`TodoItem` and produces a `Doc`:

```fsharp

/// Renders an item.
let RenderItem coll todo =
  tr [
    td [
      // TODO: Render the text of the TodoItem here. If it's already
      // been marked as done, there should be a strikethrough.
    ]
    td [
      // TODO: A button which marks the item as done.
    ]
    td [
      // TODO: A button which deletes the item from the collection
    ]
  ]
```

Let us start with rendering the `TodoItem` text. Whenever we render an
item, we want to have a strikethrough if the `Done` Var is set to
true. In order to do this, we can use the `View.Map` function to
create a `View<Doc>`, and then flatten this out to a `Doc` using
`Doc.EmbedView`.  Or equivalently, we can do these two steps in one with
`Doc.BindView`.  Here is what we need to do:

```fsharp
todo.Done.View
|> Doc.BindView (fun isDone ->
    if isDone
        then del [text todo.TodoText] :> Doc
        else text todo.TodoText)
```

To start off with, we create a `View` of the `Done` Var.  This allows
us to look at the value of this whenever it changes.  Now that we have
a view, we can use the `View.Map` combinator to look at the value, and
create an appropriate rendering.  In this function, `isDone` is of
type `bool`, and if this is true, then we create a strikethrough
effect using the `del` element. If not, then the text is just
displayed without alteration. The `del` element needs to be upcast
using `:> Doc` because its actual type is `Elt`, a subtype of `Doc`
that represents docs that are known to be comprised of a single element.

The result of the `View.Map` is therefore a `View<Doc>` -- which we
can flatten out using `Doc.EmbedView`.

The next stage is to add the buttons which mark a to-do item as done,
or remove it from the list.  We have done the hard part: these
functions are really easy!

Marking a to-do item as done:

```fsharp
button "Done" (fun () -> todo.Done.Value <- true)
```

All we do here is set the 'Done' `Var` to true in the callback. We do
not need to do anything else: the view we created and embedded earlier
means that any DOM updates will happen automatically.

Removing a to-do item from the list:

```fsharp
button "Remove" (fun () -> m.Items.Remove todo)
```

This is just as easy: we just call `Remove` with the collection and
the item to remove as its arguments.  Everything else updates
automatically.

So now our rendering function looks like this:

```fsharp

/// Renders a TodoItem
let RenderItem (m: Model) (todo: TodoItem) : Doc =
  tr [
    td [
      todo.Done.View
      |> View.Map (fun isDone ->
        if isDone
          then del [text todo.TodoText] :> Doc
          else text todo.TodoText)
      // Finally, we embed this possibly-changing fragment into the tree.
      // Whenever the input changes, the parts of the tree change automatically.
      |> Doc.EmbedView
    ]
    td [
      // Here's a button which specifies that the item has been done,
      // flipping the "Done" flag to true using a callback.
      button "Done" (fun () -> todo.Done.Value <- true)
    ]
    td [
      // This button removes the item from the collection. By removing the item,
      // the collection will automatically be updated.
      button "Remove" (fun _ -> m.Items.Remove m todo)
    ]
  ]
```

##### Rendering the Collection

Now we have a function to render each item, we need to embed the
collection itself. This means that whenever either an item in the
collection changes, or the collection itself changes, the changes
should be reflected in the DOM.  This is simply done using the
[Doc.ConvertBy](UINext-Doc.md#ConvertBy) function.

This takes a key function (we can pass `(fun x -> x.Key)`, or just
retrieve the key function used for the ListModel with `.Key`), a
rendering function, and a view of a collection.  Now, tying this
together is done as follows:

```fsharp
let TodoList m =
  m.Items.View
  |> Doc.ConvertBy m.Items.Key (RenderItem m)
```

This gives us a `Doc`, which we can embed as normal. That is it -- we
now have the code in place to show the reactive collection.

#### Creating the Add Item form

Creating a form to add an item is pretty straightforward.  What we
will need here is a variable to contain the current value of the input
box containing the new item to add, and a button to use this to create
a new item and add it to the collection.  This boils down to this
function:

```fsharp
/// A form component to add new TODO items.
let TodoForm m =
  // We make a variable to contain the new to-do item.
  let rvInput = Var.Create ""
  form [
    divAttr attr.``class`` "form-group"] [
      label [text "New entry: "]
      // Here, we make the Input box, backing it by the reactive variable.
      input rvInput
    ]
    // Once the user clicks the submit button...
    button "Submit" (fun _ ->
      // We construct a new to-do item
      let todo = TodoItem.Create rvInput.Value
      // This is then added to the collection, which automatically
      // updates the presentation.
      m.Items.Add todo)
  ]
```

So, to start off with, we create a new variable `rvInput`, which is
the variable we associate with the input box.  Whenever the user types
anything into the input box, the variable is updated accordingly.
Finally, we make a submit button using the `button` function, which
constructs a new ToDo item from the value of the `rvInput` variable,
and then adds it to the collection using `Add`.

That's the form sorted!

### Putting it all together

Finally, we need a rendering function which ties all of these
components together.  Remember that all of the different components
are of type `Doc`, so they will compose very easily due to their
monoidal structure.  This means composing everything is done as so:

```fsharp
let TodoExample () : Doc =
  let m = CreateModel ()
  tableAttr [attr.``class`` "table table-hover"] [
    tbody [
      TodoList m
      TodoForm m
    ]
  ]
```

And that's that!  To embed the example in a webpage, we can then just
use [Doc.RunById](UINext-Doc.md#RunById) to replace the contents of an
element with a given ID with the application we have just created. You
can see this live
[here](http://intellifactory.github.io/websharper.ui.next.samples/#samples/samples/TodoList)
and find the source
[here](http://github.com/intellifactory/websharper.ui.next.samples/blob/master/src/TodoList.fs).

```
---


## File: docs/UINext-Var.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-Var.md

```md
# Var
> [UI.Next Documentation](UINext.md) ▸ [API Reference](UINext-API.md) ▸ [Dataflow](UINext-Dataflow.md) ▸ **Var**

Reactive variables lay at the foundation of the [Dataflow](UINext-Dataflow.md) layer.
They can be created and manipulated just like regular `ref` cells.
Unlike `ref` cells, variables can be lifted to the [View](UINext-View.md) type to
participate in the dataflow graph.

```fsharp
namespace WebSharper.UI.Next

type Var<'T> =
    member View : View<'T>
    member Value : 'T with get, set

type Var =
    static member Create : 'T -> Var<'T>
    static member Get : Var<'T> -> 'T
    static member Set : Var<'T> -> 'T -> unit
    static member SetFinal : Var<'T> -> 'T -> unit
    static member Update : Var<'T> -> ('T -> 'T) -> unit
```

<a name="Var"></a>

[#](#Var) **Var** `type Var<'T>`

A reactive variable.

<a name="Create"></a>

[#](#Create) Var.**Create** : `'T -> Var<'T>`

Creates a fresh variable with the given initial value.

<a name="Get"></a>

[#](#Get) Var.**Get** : `Var<'T> -> 'T`

Obtains the current value.  Also available as `var.Value`.

<a name="Set"></a>

[#](#Set) Var.**Set** : `Var<'T> -> 'T -> unit`

Sets the current value.  Also available as `var.Value <- v`

<a name="SetFinal"></a>

[#](#SetFinal) Var.**SetFinal** : `Var<'T> -> 'T -> unit`

Sets the final value (after this, Set/Update are invalid).
This is rarely needed, but can help solve memory leaks when
mutliple views are scheduled to wait on a variable that is never
going to change again.

<a name="Update"></a>

[#](#Update) Var.**Update** : `Var<'T> -> ('T -> 'T) -> unit`

Updates the current value.  This is equivalent to `var.Value <- f var.Value`.

<a name="View"></a>

[#](#View) var.**View** : `View<'T>`

Lifts the variable to a [View](UINext-View.md) so that it can participate in dataflow.

```
---


## File: docs/UINext-View.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext-View.md

```md
# View
> [UI.Next Documentation](UINext.md) ▸ [API Reference](UINext-API.md) ▸ [Dataflow](UINext-Dataflow.md) ▸ **View**

`View<'A>` represents a node in the [Dataflow](UINext-Dataflow.md) layer.
Intuitively, it is a time-varying value computed from your model.
At any point in time the view has a certain `'A`.

Below, `[[x]]` notation is used to denote value of `x` view at every
point in time, so that `[[x]] = [[y]]` means that the two views are
observationally equivalent.


```fsharp
namespace WebSharper.UI.Next

type View<'A>

type ViewBuilder =
    member Bind : View<'A> * ('A -> View<'B>) -> View<'B>
    member Return : 'A -> View<'A>

type View =

    static member Const : 'A -> View<'A>
    static member FromVar: Var<'A> -> View<'A>

    static member Sink : ('A -> unit) -> View<'A> -> unit
    
    static member Map : ('A -> 'B) -> View<'A> -> View<'B>
    static member Map2 : ('A -> 'B -> 'C) -> View<'A> -> View<'B> -> View<'C>
    static member Apply : View<'A -> 'B> -> View<'A> -> View<'B>
    static member MapAsync : ('A -> Async<'B>) -> View<'A> -> View<'B>
    static member Join : View<View<'A>> -> View<'A>
    static member Bind : ('A -> View<'B>) -> View<'A> -> View<'B>
    static member SnapshotOn : View<'A> -> View<'B> -> View<'B>
    static member UpdateWhile : View<bool> -> View<'A> -> View<'A>
    
    static member MapSeqCached<'A,'B when 'A : equality> :
        ('A -> 'B) -> View<seq<'A>> -> View<seq<'B>>

    static member MapSeqCachedBy<'A,'B,'K when 'K : equality> :
        ('A -> 'K) -> ('A -> 'B) -> View<seq<'A>> -> View<seq<'B>>

    static member MapSeqCachedView<'A,'B when 'A : equality> :
        (View<'A> -> 'B) -> View<seq<'A>> -> View<seq<'B>>

    static member MapSeqCachedViewBy<'A,'B,'K when 'K : equality> :
        ('A -> 'K) -> (View<'A> -> 'B) -> View<seq<'A>> -> View<seq<'B>>

    static member Do : ViewBuilder
```

## Constructing

<a name="View"></a>

[#](#View) **View** `type View<'A>`

A time-varying read-only value of a given type.

<a name="Const"></a>

[#](#Const) View.**Const** : `'A -> View<'A>`

Lifts a constant value to a View.  Constants are a boring
special case of time-varying values:

```fsharp
[[View.Const x]] = x
```

<a name="FromVar"></a>

[#](#FromVar) View.**FromVar** : `Var<'A> -> View<'A>`

Also available as a property **.View** on `Var<'A>`.

Reactive variables of type [Var](UINext-Var.md) can be seen as Views by considering
their current value at any point in time.

## Using

<a name="Sink"></a>

[#](#Sink) View.**Sink** : `('A -> unit) -> View<'A> -> unit`

Starts a process that calls the given function repeatedly with the latest View value.
This method is rarely needed, the most common way to use views is by constructing
reactive documents of type [Doc](UINext-Doc.md), and embedding them using Doc.EmbedView.
Sink use requires a little care, the typical usage is to run it once per application.
This is because the process created by `Sink` repeatedly blocks while waiting for
the view to update. A memory leak can happen if the application repeatedly spawns `Sink`
processes that never get collected because they await a Var that is never going to change
(see [Leaks](UINext-Leaks.md) for more information).

## Combining

<a name="Map"></a>

[#](#Map) View.**Map** : `('A -> 'B) -> View<'A> -> View<'B>`

Also available as a method **.Map**(f) on `View<'A>`.

Lifts a function to the View layer, such that the value `[[]]` relation holds:

```fsharp
[[View.Map f x]] = f [[x]]
```

This is the simplest and perhaps the most useful combinator.

<a name="MapCached"></a>

[#](#Map) View.**MapCached** : `('A -> 'B) -> View<'A> -> View<'B> when 'A : equality`

Also available as a method **.MapCached**(f) on `View<'A>`.

Similar to Map, but caches the previous result: if the input value is equal to what it was during the previous update propagation, then `f` is not called again and the previous result is reused. The update is still propagated down. The following relation still holds:

```fsharp
[[View.MapCached f x]] = f [[x]]
```

<a name="Map2"></a>

[#](#Map2) View.**Map2** : `('A -> 'B -> 'C) -> View<'A> -> View<'B> -> View<'C>`

Pairing combinator generalizing `View.Map` to allow constructing views that depend on more than one view:

```fsharp
[[View.Map2 f x y]] = f [[x]] [[y]]
```

<a name="Apply"></a>

[#](#Apply) View.**Apply** : `View<'A -> 'B> -> View<'A> -> View<'B>`

Another pairing combinator derived from `View.Map2`. Defining equation is:

```fsharp
View.Apply f x = View.Map2 (fun f x -> f x) f x
```

Or, said differently:

```fsharp
[[View.Apply f x]] = [[f]] [[x]]
```

Together with `View.Const`, this permits a code pattern for lifting functions of arbitrary arity:

```fsharp
let ( <*> ) f x = View.Apply f x

View.Const (fun x y z -> (x, y, z)) <*> x <*> y <*> z
```

<a name="Join"></a>

[#](#Join) View.**Join** : `View<View<'A>> -> View<'A>`

Flattens a higher-order View, using this defining equation:

```fsharp
[[Join x]] = [[ [[x]] ]]
```

Introducing this combinator makes the View layer very flexible, but also generally
complicates the implementation.  It is rarely used directly, but is a building
block for other combinators.

<a name="Bind"></a>

[#](#Bind) View.**Bind** : `('A -> View<'B>) -> View<'A> -> View<'B>`

Also available as a method **.Bind**(f) on `View<'A>`.

Bind is a useful combinator for expressing value-dependent views:

```fsharp
View.Bind f x = View.Join (View.Map f x)
```

Or with our notation:

```fsharp
[[View.Bind f x]] = [[ f [[x]] ]]
```

The helper `ViewBuilder` type is provided to give F# programmers the familiar computation
expression interface to `View.Const` and `View.Bind`:

```fsharp
View.Do {
  let! x = xView
  let! y = getYiew x
  return! combine x y
}
```

Dynamic composition via `View.Bind` and `View.Join` should be used with some care.
Whenever static composition (such as `View.Map2`) can do the trick, it should be preferable.
One concern here is efficiency, and another is state, identity and sharing (see [Sharing](UINext-Sharing.md)
for a discussion).

<a name="SnapshotOn"></a>

[#](#SnapshotOn) View.**SnapshotOn** : `'B -> View<'A> -> View<'B> -> View<'B>`

Also available as a method **.SnapshotOn**(init, a) on `View<'B>`.

Given two views `a` and `b`, and a default value, provides a 'snapshot' of `b` whenever `a` updates. 
The value of `a` is unused. The initial value is an initial sample of `b`.

```fsharp
[[View.SnapshotOn init a b]] = init,                                   if [[a]] hasn't been updated yet
                             = [[b the last time [[a]] was updated]],  once [[a]] has been updated
```

This combinator is used as the base for the implementation of the [Submitter](UINext-Submitter.md), which is commonly used to include punctual events such as button clicks into the dataflow graph.

<a name="UpdateWhile"></a>

[#](#UpdateWhile) View.**UpdateWhile** : `'A -> View<'bool> -> View<'A> -> View<'A>`

Also available as a method **.UpdateWhile**(init, a) on `View<'B>`.

Given a predicate `View<bool>` `a`, a view `b`, and a default value, create a view which reflects the latest value of
`b` whenever the predicate is true. Updates are not propagated when the predicate is false.

```fsharp
[[View.UpdateWhile init a b]] = init,                                  if [[a]] has never been true yet
                              = [[b]],                                 if [[a]] is true
                              = [[b the last time [[a]] was true]],    if [[a]] is false
```

## Advanced

<a name="MapAsync"></a>

[#](#MapAsync) View.**MapAsync** : `('A -> Async<'B>) -> View<'A> -> View<'B>`

Also available as a method **.MapAsync**(f) on `View<'A>`.

Lifts an asynchronous function to the View layer.  A nice
property here is that this combinator allows saving work by abandoning
requests.  That is, if the input view changes faster than we can
asynchronously convert it, the output view will not propagate change
until it obtains a valid latest value.  In such a system, intermediate
results are thus discarded.

**TODO**: this combinator is being discussed for potential
imrpovements and the signature is subject to change.

<a name="MapSeqCached"></a>

[#](#MapSeqCached) View.**MapSeqCached** : `('A -> 'B) -> View<seq<'A>> -> View<seq<'B>>`

Also available as a method **.MapSeqCached**(f) on `View<'A>`.

Starts a process doing stateful conversion with "shallow" memoization.
The process remembers inputs from the previous step, and re-uses outputs
from the previous step when possible instead of calling the converter function.
Memory use is proportional to the longest sequence taken by the View.
Since only one step of history is retained, there is no memory leak.

Needs equality on `'A`.

Obsolete synonym: `View.Convert`.

<a name="MapSeqCachedBy"></a>

[#](#MapSeqCachedBy) View.**MapSeqCachedBy** : `('A -> 'K) -> ('A -> 'B) -> View<seq<'A>> -> View<seq<'B>>`

Also available as a method **.MapSeqCached**(k, f) on `View<'A>`.

A variant of `MapSeqCached` with a custom key function, needing an equality on `'K`.

Obsolete synonym: `View.ConvertBy`.

<a name="MapSeqCachedView"></a>

[#](#MapSeqCachedView) View.**MapSeqCachedView** : `(View<'A> -> 'B) -> View<seq<'A>> -> View<seq<'B>>`

Also available as a method **.MapSeqCached**(f) on `View<'A>`.

An extended form of `MapSeqCached` where the conversion function accepts a
reactive view.  At every step, changes to inputs identified as being
the same object are propagated via that view.

Needs equality on `'A`.

Obsolete synonym: `View.ConvertSeq`.

<a name="MapSeqCachedViewBy"></a>

[#](#MapSeqCachedViewBy) View.**MapSeqCachedViewBy** : `('A -> 'K) -> (View<'A> -> 'B) -> View<seq<'A>> -> View<seq<'B>>`

Also available as a method **.MapSeqCached**(k, f) on `View<'A>`.

A variant of `MapSeqCachedView` with a custom key function, needing an equality on `'K`.

Obsolete synonym: `View.ConvertSeqBy`.

```
---


## File: docs/UINext.md
### URL: https://github.com/dotnet-websharper/ui/blob/master/docs/UINext.md

```md
# WebSharper.UI.Next

UI.Next is a client-side library providing a novel, pragmatic and convenient approach to UI reactivity. It includes:

* A [dataflow layer](UINext-Dataflow.md) for expressing user inputs and values computed from them as time-varying values. This approach is related to Functional Reactive Programming (FRP), but differs from it in significant ways discussed [here](UINext-FRP.md).
* A reactive [DOM library](#dom) for displaying these time-varying values in a functional way. If you are familiar with Facebook React, then you will find some similarities with this approach: instead of explicitly inserting, modifying and removing DOM nodes, you return a value that represents a DOM tree based on inputs. The main difference is that these inputs are nodes of the dataflow layer, rather than a single state value associated with the component.
* A [declarative animation system](#animation) for the DOM layer.

The [tutorial](UINext-Tutorial.md) goes over the basics of reactive variables and the DOM library.

For a more in-depth look, check the [reference](UINext-API.md).

You can also check some examples [here](http://intellifactory.github.io/websharper.ui.next.samples/).

## Availability

UI.Next is available for download on NuGet:

* [UI.Next for WebSharper 3: `WebSharper.UI.Next`](https://nuget.org/packages/WebSharper.UI.Next)
* [UI.Next for WebSharper 4 beta: `Zafir.UI.Next`](https://nuget.org/packages/Zafir.UI.Next)

## Documentation

These articles cover various design choices and aspects of the system:

* [Dataflow](UINext-Dataflow.md) - explains the dataflow system
* [Leaks](UINext-Leaks.md) - explains how most memory leaks are avoided
* [Sharing](UINext-Sharing.md) - helps understanding sharing and identity
* [Monoids](UINext-Monoids.md) - explains use of monoids in the API
* [EventStreams](UINext-EventStreams.md) - provides a rationale for omitting event stream combinators
* [FRP](UINext-FRP.md) - discusses connections to Functional Reactive Programming
* [Components](UINext-Components.md) - gives simple component design guidelines
* [CML](UINext-CML.md) - discusses integrating Concurrent ML as a future direction 
* [DOM on the server side](ClientServer.md) - using the HTML combinators and templates on the server side

## Talks

* [Video: Tackle UI with Reactive DOM in F# and WebSharper](https://www.youtube.com/watch?v=wEkS09s3KBc) - in this Community for FSharp event, Anton Tayanovskyy presents the basics of the library and the motivations for the dataflow design 

```
---


# Crawl Statistics

- **Source:** https://github.com/dotnet-websharper/ui/tree/master/docs
- **Repository:** dotnet-websharper/ui
- **Branch:** master
- **Depth:** 1
- **Files processed:** 37
- **Total files found:** 37
- **Duration:** 20.84 seconds
- **Crawl completed:** 5/16/2025, 3:00:28 PM

