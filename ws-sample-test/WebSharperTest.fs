namespace WsClient

open WebSharper
open WebSharper.UI
open WebSharper.UI.Html

[<JavaScript>]
module Counter =
    let init() =
        let value = Var.Create 0
        div [] [
            h3 [] [text "Counter"]
            button [on.click (fun domElement mouseEvent -> Var.Update value (fun n -> n + 1))] [text "+"]
            div [] [text (string value.V)]
        ]
