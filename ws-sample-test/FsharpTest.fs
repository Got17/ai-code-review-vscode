module Sample

let rec fact n =
    if n = 0 then 0
    else n * fact (n - 1)
    